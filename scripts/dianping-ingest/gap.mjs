// 计算 BrandExplore 品牌 与 D1 dataset(store_reviews) 的覆盖差异
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

// 1) 从 BrandExplore.tsx 抽 BRANDS 名称
const src = fs.readFileSync(path.join(root, 'src/pages/BrandExplore.tsx'), 'utf8')
const start = src.indexOf('const BRANDS')
const end = src.indexOf('export default', start)
const seg = src.slice(start, end > start ? end : src.length)
const names = [...seg.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])
console.log('BrandExplore BRANDS 数量:', names.length)

// 2) 读 dataset
const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.json'), 'utf8'))
const rows = Array.isArray(dataset) ? dataset : dataset.reviews || []

// 3) 归一化：小写、去重音、去空格/标点
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s'"’·・.&()（）\-_/]/g, '')

const byKey = new Map()
for (const r of rows) {
  for (const k of [r.brand, r.frontend]) {
    if (!k) continue
    const key = norm(k)
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key).push(r)
  }
}

const hit = []
const miss = []
for (const n of names) {
  const rs = byKey.get(norm(n)) || []
  if (rs.length) hit.push({ name: n, rows: rs })
  else miss.push(n)
}

console.log('\n=== 命中', hit.length, '家 ===')
for (const h of hit) {
  const r = h.rows[0]
  console.log(
    `${r.rating ? '✅' : '⚠️ '} ${h.name.padEnd(26)} rating=${r.rating ?? 'null'}  人均=${r.avgPrice ?? '-'}  dishes=${(r.dishes || []).length}  url=${r.url ? 'Y' : 'N'}`
  )
}

console.log('\n=== 缺口', miss.length, '家 ===')
console.log(miss.join(' | '))

const out = { hit: hit.map((h) => h.name), miss, nullRating: hit.filter((h) => !h.rows[0].rating).map((h) => h.name) }
fs.writeFileSync(path.join(__dirname, 'gap_report.json'), JSON.stringify(out, null, 2))
console.log('\n报告已写入 gap_report.json')
