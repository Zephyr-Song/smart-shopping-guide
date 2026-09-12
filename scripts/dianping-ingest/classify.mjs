// 区分 dataset 中的「真实点评数据」与「占位数据」
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.json'), 'utf8'))
const rows = Array.isArray(dataset) ? dataset : dataset.reviews || []

const GENERIC = new Set(['当季新品', '经典款', '限量系列', '配饰'])
const isPlaceholder = (r) =>
  !r.rating &&
  (!r.avgPrice || r.avgPrice === null) &&
  (String(r.snippet || '').includes('点击在大众点评查看门店详情') ||
    (Array.isArray(r.dishes) && r.dishes.every((d) => GENERIC.has(d))))

const ph = rows.filter(isPlaceholder)
const real = rows.filter((r) => !isPlaceholder(r))
const realNoRating = real.filter((r) => !r.rating)

console.log('总计', rows.length, '| 占位', ph.length, '| 真实', real.length, '| 真实但缺评分', realNoRating.length)
console.log('\n--- 占位（建议删除，删除后该店整块隐藏）---')
console.log(ph.map((r) => r.frontend || r.brand).join(' | '))
console.log('\n--- 真实但缺评分（建议补评分 / 隐藏评分条）---')
console.log(realNoRating.map((r) => `${r.frontend || r.brand}(人均${r.avgPrice ?? '-'})`).join(' | '))

fs.writeFileSync(
  path.join(__dirname, 'classify_report.json'),
  JSON.stringify(
    {
      placeholder: ph.map((r) => ({ brand: r.brand, frontend: r.frontend })),
      realNoRating: realNoRating.map((r) => ({ brand: r.brand, frontend: r.frontend, avgPrice: r.avgPrice })),
    },
    null,
    2
  )
)
