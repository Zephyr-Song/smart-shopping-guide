// 临时验证：对每个前端店铺查询线上 API，统计命中情况
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const d = JSON.parse(readFileSync('D:/WorkBuddy/smart-shopping-guide/scripts/dianping-ingest/dataset.json', 'utf-8'))
const frontends = [...new Set(d.filter(x => x.frontend).map(x => x.frontend))]
let hit = 0, miss = 0, missing = []
for (const f of frontends) {
  const url = 'https://bfc-shopping-guide.pages.dev/api/store-reviews?brand=' + encodeURIComponent(f)
  const out = execSync(`curl -s --max-time 25 -G "https://bfc-shopping-guide.pages.dev/api/store-reviews" --data-urlencode "brand=${f}"`).toString()
  try {
    const j = JSON.parse(out)
    if (j.reviews && j.reviews.length) hit++
    else { miss++; missing.push(f + ' -> ' + out.slice(0, 80)) }
  } catch (e) { miss++; missing.push(f + ' -> PARSE ' + out.slice(0, 80)) }
}
console.log(`frontends=${frontends.length} hit=${hit} miss=${miss}`)
if (missing.length) console.log('MISSING:\n' + missing.join('\n'))

// 抽查几个关键店的 brand/url
for (const f of ['喜茶', 'AirPark', 'PET MART', 'PET WISH', '复兴面王深夜食堂']) {
  const out = execSync(`curl -s --max-time 25 -G "https://bfc-shopping-guide.pages.dev/api/store-reviews" --data-urlencode "brand=${f}"`).toString()
  const j = JSON.parse(out)
  const r = j.reviews && j.reviews[0]
  console.log(f, '=>', r ? `brand=${r.brand} url=${(r.url || 'FALLBACK').slice(0, 45)}` : 'NONE')
}
