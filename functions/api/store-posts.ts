// GET /api/store-posts?brand=<店铺名>
// 读取 MediaCrawler 采集并推送入库的小红书真实探店笔记（store_posts 表）
// brand=__MALL__ 为商圈级笔记；查询任意店铺时合并返回

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
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const brand = (url.searchParams.get('brand') || '').trim().slice(0, 80)

  if (!env.DB) return json({ source: 'unavailable', reason: 'no-d1', posts: [], crawledAt: null }, 200)
  if (!brand) return json({ source: 'error', reason: 'brand-required', posts: [], crawledAt: null }, 400)

  try {
    const isMall = brand === '__MALL__'
    let rows: StorePostRow[] = []

    if (isMall) {
      // 商圈级：返回全部真实探店笔记（BFC 全量 feed，仅站点级入口使用）
      const res = await env.DB.prepare(
        `SELECT * FROM store_posts ORDER BY liked_count DESC, crawled_at DESC LIMIT 12`
      ).all<StorePostRow>()
      rows = res.results || []
    } else {
      // 店铺定制化：仅返回该门店自己的探店笔记，绝不做商圈回退（满足"只有选择门店的"）
      const res = await env.DB.prepare(
        `SELECT * FROM store_posts WHERE brand = ? ORDER BY liked_count DESC, id DESC LIMIT 12`
      ).bind(brand).all<StorePostRow>()
      rows = res.results || []
    }

    const crawledAt = rows.reduce((m, r) => Math.max(m, r.crawled_at || 0), 0)

    return json({
      source: 'xhs',
      brand,
      fallback: false,
      count: rows.length,
      crawledAt: crawledAt ? new Date(crawledAt).toISOString().slice(0, 10) : null,
      posts: rows.map(r => ({
        noteId: r.note_id,
        title: r.title,
        desc: (r.desc || '').slice(0, 200),
        cover: r.cover_url,
        author: r.author,
        avatar: r.avatar_url,
        liked: r.liked_count,
        url: r.note_url,
        time: r.note_time,
        scope: (isMall || r.brand === '__MALL__') ? 'mall' : 'store',
      })),
    })
  } catch (e) {
    return json({ source: 'error', reason: 'db-error', detail: String(e).slice(0, 200), posts: [], crawledAt: null }, 200)
  }
}
