// 大众点评/美团 探店数据 → Cloudflare D1 store_reviews 推送
// 用法: node push.mjs   (依赖 scripts/dianping-ingest/dataset.json)
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DATA = 'D:/WorkBuddy/smart-shopping-guide/scripts/dianping-ingest/dataset.json'
const SQL_OUT = 'D:/WorkBuddy/bfc-verify/store_reviews_push.sql'
const SITE_DIR = 'D:/WorkBuddy/smart-shopping-guide'

const esc = (v) => `'${String(v == null ? '' : v).replace(/'/g, "''")}'`
const int = (v) => (v === null || v === undefined || !Number.isFinite(Number(v))) ? 'NULL' : Number(v)
const arr = (v) => {
  let a = null
  if (Array.isArray(v)) a = v.map(String).map(s => s.slice(0, 30))
  else if (typeof v === 'string' && v.trim()) a = v.split(/[;,，、]/).map(s => s.trim()).filter(Boolean).map(s => s.slice(0, 30))
  if (!a) return 'NULL'
  return `'${JSON.stringify(a).replace(/'/g, "''")}'`
}

function main() {
  let data
  try {
    data = JSON.parse(readFileSync(DATA, 'utf-8'))
  } catch (e) {
    console.error('NO_DATA: 无法读取 dataset.json:', e.message)
    process.exit(1)
  }
  if (!Array.isArray(data) || data.length === 0) {
    console.error('NO_DATA: dataset.json 为空')
    process.exit(1)
  }

  const now = Date.now()
  const lines = data.map(r =>
    `INSERT OR REPLACE INTO store_reviews (brand, frontend, source, rating, avg_price, dishes, snippet, url, crawled_at) VALUES (${esc(r.brand)}, ${esc(r.frontend || '')}, ${esc(r.source || 'dianping')}, ${esc(r.rating || '')}, ${int(r.avgPrice)}, ${arr(r.dishes)}, ${esc((r.snippet || '').slice(0, 300))}, ${esc(r.url || '')}, ${now});`
  )
  const sql = 'DELETE FROM store_reviews;\n' + lines.join('\n')
  writeFileSync(SQL_OUT, sql, 'utf-8')

  const brands = {}
  for (const r of data) brands[r.brand] = (brands[r.brand] || 0) + 1
  console.log('PARSED', data.length, 'reviews ->', JSON.stringify(brands))

  execSync('npx wrangler d1 execute bfc-agent-db --remote --file="' + SQL_OUT + '"', {
    cwd: SITE_DIR,
    stdio: 'inherit',
    env: { ...process.env, HTTP_PROXY: '', HTTPS_PROXY: '', http_proxy: '', https_proxy: '', ALL_PROXY: '', all_proxy: '', NO_PROXY: '*', no_proxy: '*' },
  })
  console.log('PUSHED', data.length, 'reviews to D1 store_reviews')
}

main()
