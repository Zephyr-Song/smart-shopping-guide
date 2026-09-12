// GET /api/store-reviews?brand=<店铺名>
// 读取 大众点评 / 美团 真实探店数据（store_reviews 表）
// 仅返回该门店自己的探店数据，绝不做商圈回退（满足"只有选择门店的"）

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
  } catch { /* not JSON */ }
  // 退化：按中文/英文分隔符拆
  return raw.split(/[;,，、]/).map(s => s.trim()).filter(Boolean)
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const brand = (url.searchParams.get('brand') || '').trim().slice(0, 80)

  if (!env.DB) return json({ source: 'unavailable', reason: 'no-d1', reviews: [], crawledAt: null }, 200)
  if (!brand) return json({ source: 'error', reason: 'brand-required', reviews: [], crawledAt: null }, 400)

  try {
    // 店铺定制化：仅返回该门店自己的探店数据
    const res = await env.DB.prepare(
      `SELECT * FROM store_reviews WHERE brand = ? OR frontend = ? ORDER BY rating DESC, crawled_at DESC LIMIT 6`
    ).bind(brand, brand).all<ReviewRow>()
    const rows = res.results || []

    const crawledAt = rows.reduce((m, r) => Math.max(m, r.crawled_at || 0), 0)

    return json({
      source: 'dianping',
      brand,
      count: rows.length,
      crawledAt: crawledAt ? new Date(crawledAt).toISOString().slice(0, 10) : null,
      reviews: rows.map(r => ({
        id: r.id,
        brand: r.brand || null,
        source: r.source || 'dianping',
        rating: r.rating || null,
        avgPrice: r.avg_price ?? null,
        dishes: parseDishes(r.dishes),
        snippet: r.snippet || null,
        url: r.url || null,
      })),
    })
  } catch (e) {
    return json({ source: 'error', reason: 'db-error', detail: String(e).slice(0, 200), reviews: [], crawledAt: null }, 200)
  }
}
