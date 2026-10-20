// GET /api/store-posts?brand=<店铺名>[&includeStale=1][&debug=1]
// 读取 MediaCrawler 采集并推送入库的小红书真实探店笔记（store_posts 表）
// brand=__MALL__ 为商圈级笔记；查询任意店铺时只返回该店铺自己的笔记
//
// 内容治理（增量优化方案第三窗口）：
//   1. 授权闸门：rights_status 明确标记为不可再分发的直接剔除
//   2. 位置闸门：命中其它商场且完全没提 BFC 的剔除（解决「搜喜茶出现虹桥天地」）
//   3. 新鲜度：14 天内正常；14~45 天标注更新时间；超过 45 天默认不推荐
//   4. 排序：BFC 相关优先，其次点赞数
import { judgeContent, freshnessLabel, type Freshness } from '../_lib/content-governance'

interface PagesContext {
  request: Request
  env: { DB?: D1Database }
}

interface StorePostRow {
  id: number
  brand: string
  note_id: string
  title: string
  desc: string
  cover_url: string | null
  author: string | null
  avatar_url: string | null
  liked_count: number
  note_url: string | null
  note_time: string | null
  crawled_at: number
  // 治理字段（可能尚未写入，取决于采集侧是否推送）
  location_tags?: string | null
  rights_status?: string | null
  relevance_score?: number | null
}

interface Judged {
  row: StorePostRow
  rank: number
  relevance: 'in_scope' | 'unverified'
  freshness: Freshness
  updatedAt: string | null
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

const LIMIT = 12
/** 多取一些再过滤排序，避免过滤后不足 12 条 */
const FETCH = 36

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const brand = (url.searchParams.get('brand') || '').trim().slice(0, 80)
  const includeStale = url.searchParams.get('includeStale') === '1'
  /**
   * strict=1：只保留明确命中 BFC 的内容（方案原文口径「位置应命中 BFC 大豫园」）。
   * 默认宽松：没提任何地点的品牌级笔记仍保留，标记为 unverified。
   * 之所以给开关而不是直接默认严格：库里笔记绝大多数是「按品牌名搜到的全网内容」，
   * 一刀切会让大部分门店抽屉直接空白。等采集侧补上 location_tags 后再考虑默认严格。
   */
  const strict = url.searchParams.get('strict') === '1'
  const debug = url.searchParams.get('debug') === '1'

  if (!env.DB) return json({ source: 'unavailable', reason: 'no-d1', posts: [], crawledAt: null }, 200)
  if (!brand) return json({ source: 'error', reason: 'brand-required', posts: [], crawledAt: null }, 400)

  try {
    const isMall = brand === '__MALL__'
    const res = isMall
      ? await env.DB.prepare(
          `SELECT * FROM store_posts ORDER BY liked_count DESC, crawled_at DESC LIMIT ${FETCH}`,
        ).all<StorePostRow>()
      : await env.DB.prepare(
          `SELECT * FROM store_posts WHERE brand = ? ORDER BY liked_count DESC, id DESC LIMIT ${FETCH}`,
        )
          .bind(brand)
          .all<StorePostRow>()
    const rows = res.results || []

    // —— 治理判定 ——
    const now = Date.now()
    const kept: Judged[] = []
    const dropped = { outOfScope: 0, rights: 0, stale: 0 }
    const staleKept: Judged[] = []

    for (const row of rows) {
      const v = judgeContent(row, now)
      if (!v.keep) {
        if (v.reason === 'other_location') dropped.outOfScope++
        else if (v.reason === 'rights_denied') dropped.rights++
        else if (v.reason === 'stale') dropped.stale++
        continue
      }
      const item: Judged = {
        row,
        rank: v.rank,
        relevance: v.relevance,
        freshness: v.freshness,
        updatedAt: v.updatedAt,
      }
      // 严格模式：位置未命中 BFC 的品牌级内容也不展示
      if (strict && v.relevance !== 'in_scope') {
        dropped.outOfScope++
        continue
      }
      if (v.freshness === 'stale') {
        staleKept.push(item)
      } else {
        kept.push(item)
      }
    }

    // 排序：BFC 相关优先，其次点赞
    const sortFn = (a: Judged, b: Judged) =>
      b.rank - a.rank || (b.row.liked_count || 0) - (a.row.liked_count || 0)

    kept.sort(sortFn)
    staleKept.sort(sortFn)

    // 默认不推荐过期内容；只有「合格内容为空」时才降级给出历史内容并标注过期。
    // 这是刻意的产品取舍：采集侧数据一旦超过 45 天，宁可显示带过期提示的历史笔记，
    // 也不要让门店抽屉直接空白。需要严格口径时传 ?includeStale=0 之外的组合自行判断。
    let chosen = kept.slice(0, LIMIT)
    let degraded: string | null = null
    if (chosen.length === 0 && staleKept.length > 0) {
      chosen = staleKept.slice(0, LIMIT)
      degraded = 'stale_only'
    } else if (includeStale && chosen.length < LIMIT) {
      chosen = chosen.concat(staleKept.slice(0, LIMIT - chosen.length))
    }

    const crawledAt = rows.reduce((m, r) => Math.max(m, r.crawled_at || 0), 0)

    const payload: Record<string, unknown> = {
      source: 'xhs',
      brand,
      fallback: false,
      count: chosen.length,
      crawledAt: crawledAt ? new Date(crawledAt).toISOString().slice(0, 10) : null,
      degraded,
      staleAvailable: staleKept.length,
      filtered: dropped,
      posts: chosen.map(it => ({
        noteId: it.row.note_id,
        title: it.row.title,
        desc: (it.row.desc || '').slice(0, 200),
        cover: it.row.cover_url,
        author: it.row.author,
        avatar: it.row.avatar_url,
        liked: it.row.liked_count,
        url: it.row.note_url,
        time: it.row.note_time,
        scope: isMall || it.row.brand === '__MALL__' ? 'mall' : 'store',
        // —— 治理字段（前端用于显示「更新于…／可能已过期」）——
        relevance: it.relevance,
        freshness: it.freshness,
        stale: it.freshness === 'stale',
        updatedAt: it.updatedAt,
        freshnessNote: freshnessLabel(it.freshness, it.updatedAt),
      })),
    }

    if (debug) {
      payload.debug = {
        fetched: rows.length,
        keptFresh: kept.length,
        keptStale: staleKept.length,
        dropped,
      }
    }

    return json(payload)
  } catch (e) {
    return json({ source: 'error', reason: 'db-error', detail: String(e).slice(0, 200), posts: [], crawledAt: null }, 200)
  }
}
