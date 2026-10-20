// GET /api/store-reviews?brand=<店铺名>
// 读取 大众点评 / 美团 真实探店数据（store_reviews 表）
// 仅返回该门店自己的探店数据，绝不做商圈回退（满足"只有选择门店的"）
//
// 内容治理（增量优化方案第三窗口）：
//   - rights_status 明确不可再分发的剔除
//   - 点评少于 3 条时不展示综合评分（避免小样本误导）
//   - 标注新鲜度（14 / 45 天分档）
import { judgeContent, freshnessLabel } from '../_lib/content-governance'

interface PagesContext {
  request: Request
  env: { DB?: D1Database }
}

interface ReviewRow {
  id: number
  brand: string
  frontend: string | null
  source: string
  rating: string | null
  avg_price: number | null
  dishes: string | null
  snippet: string | null
  url: string | null
  crawled_at: number
  rights_status?: string | null
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function parseDishes(raw: string | null): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) return v.map(String).filter(Boolean)
  } catch {
    /* not JSON */
  }
  // 退化：按中文/英文分隔符拆
  return raw
    .split(/[;,，、]/)
    .map(s => s.trim())
    .filter(Boolean)
}

/** 综合评分的最少样本数：低于该值不展示（方案要求 ≥3 条） */
const MIN_RATING_SAMPLE = 3

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const brand = (url.searchParams.get('brand') || '').trim().slice(0, 80)

  if (!env.DB) return json({ source: 'unavailable', reason: 'no-d1', reviews: [], crawledAt: null }, 200)
  if (!brand) return json({ source: 'error', reason: 'brand-required', reviews: [], crawledAt: null }, 400)

  try {
    // 店铺定制化：仅返回该门店自己的探店数据。
    // 注意：线上库有 frontend 列（用于把「喜茶」这类展示名映射到 D1 里的 '喜茶 HEYTEA'），
    // 但 migrations 里从未创建过它——纯粹按迁移脚本建库的新环境会直接 no such column。
    // 这里做一次降级：先按 brand+frontend 匹配，失败则退回只按 brand，避免整块点评功能挂掉。
    let allRows: ReviewRow[] = []
    try {
      const res = await env.DB.prepare(
        `SELECT * FROM store_reviews WHERE brand = ? OR frontend = ? ORDER BY crawled_at DESC LIMIT 12`,
      )
        .bind(brand, brand)
        .all<ReviewRow>()
      allRows = res.results || []
    } catch {
      const res = await env.DB.prepare(
        `SELECT * FROM store_reviews WHERE brand = ? ORDER BY crawled_at DESC LIMIT 12`,
      )
        .bind(brand)
        .all<ReviewRow>()
      allRows = res.results || []
    }

    const now = Date.now()
    let rightsDropped = 0
    const rows = allRows
      .filter(r => {
        const v = judgeContent({ crawled_at: r.crawled_at, rights_status: r.rights_status }, now)
        if (!v.keep && v.reason === 'rights_denied') {
          rightsDropped++
          return false
        }
        return true
      })
      .slice(0, 6)

    const crawledAt = rows.reduce((m, r) => Math.max(m, r.crawled_at || 0), 0)

    // 综合评分：样本不足则不展示
    const nums = rows.map(r => Number(r.rating)).filter(n => Number.isFinite(n) && n > 0)
    const avg = nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null
    const suppressed = rows.length < MIN_RATING_SAMPLE

    return json({
      source: 'dianping',
      brand,
      count: rows.length,
      crawledAt: crawledAt ? new Date(crawledAt).toISOString().slice(0, 10) : null,
      filtered: { rights: rightsDropped },
      // 前端用它决定是否渲染「综合评分」区块
      ratingSummary: {
        count: rows.length,
        avg: suppressed ? null : avg,
        suppressed,
        minSample: MIN_RATING_SAMPLE,
      },
      reviews: rows.map(r => {
        const v = judgeContent({ crawled_at: r.crawled_at, rights_status: r.rights_status }, now)
        return {
          id: r.id,
          brand: r.brand || null,
          source: r.source || 'dianping',
          rating: r.rating || null,
          avgPrice: r.avg_price ?? null,
          dishes: parseDishes(r.dishes),
          snippet: r.snippet || null,
          url: r.url || null,
          freshness: v.freshness,
          updatedAt: v.updatedAt,
          freshnessNote: freshnessLabel(v.freshness, v.updatedAt),
        }
      }),
    })
  } catch (e) {
    return json({ source: 'error', reason: 'db-error', detail: String(e).slice(0, 200), reviews: [], crawledAt: null }, 200)
  }
}
