// 修正 dataset 里大众点评跳转链接：
//  1) 已反查到的 → 精确店铺页 m.dianping.com/shop|shopshare/{id}
//  2) www.dianping.com/shop/{id} → m.dianping.com/shop/{id}（PC 站会跳登录墙）
//  3) 其余 → city=1(上海) 的搜索兜底，且关键词带上商场名（原来是 city=2=北京）
// 同时删除与「遇外滩」重复的 MEET THE BUND 行
import fs from 'node:fs'
import path from 'node:path'

const SDIR = 'D:/WorkBuddy/smart-shopping-guide/scripts/dianping-ingest'
const DATA = path.join(SDIR, 'dataset.json')
const RESOLVED = path.join(SDIR, 'shop_url_resolved.json')
const OUT = path.join(SDIR, 'url_fix_report.json')

const resolved = JSON.parse(fs.readFileSync(RESOLVED, 'utf8'))
const rows = JSON.parse(fs.readFileSync(DATA, 'utf8'))

// 初轮已确认但未写入 resolved 的手工条目
const MANUAL = {
  老吉堂: 'https://m.dianping.com/shopshare/716589225',
  蝶园海鲜酒馆: 'https://m.dianping.com/shop/126620480',
}

const fallback = (label) =>
  `https://www.dianping.com/search/keyword/1/0_${encodeURIComponent(`BFC外滩金融中心 ${label}`)}`

const report = []
const kept = []

for (const r of rows) {
  // 删除重复行：MEET THE BUND 与 遇外滩 是同一家店（遇外滩英文名 Meet the Bund），
  // 且 BrandExplore 里只有「遇外滩」，该行不可达
  if (r.brand === 'MEET THE BUND') { report.push({ brand: r.brand, action: '删除(与遇外滩重复)' }); continue }

  const label = r.brand
  const before = r.url || ''
  let after = before
  let action = '未变'

  const exact = (resolved[r.brand] && resolved[r.brand].url) || MANUAL[r.brand]
  if (exact) {
    after = exact
    action = '精确店铺页'
  } else if (/^https:\/\/m\.dianping\.com\/(shop|shopshare)\//.test(before)) {
    after = before
    action = '已是精确店铺页'
  } else {
    const pcShop = before.match(/^https?:\/\/www\.dianping\.com\/shop\/([A-Za-z0-9]+)/)
    if (pcShop) {
      after = `https://m.dianping.com/shop/${pcShop[1]}`
      action = 'PC→移动端店铺页'
    } else {
      after = fallback(label)
      action = /search\/keyword\/2\//.test(before) ? '北京搜索→上海+BFC搜索' : '改为上海+BFC搜索兜底'
    }
  }

  r.url = after
  kept.push(r)
  report.push({ brand: label, action, before, after })
}

fs.writeFileSync(DATA, JSON.stringify(kept, null, 2), 'utf8')
fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')

const tally = {}
for (const x of report) tally[x.action] = (tally[x.action] || 0) + 1
console.log('总行数:', kept.length)
for (const [k, v] of Object.entries(tally)) console.log('  ' + k.padEnd(22) + v)

const exactN = kept.filter((r) => /^https:\/\/m\.dianping\.com\/(shop|shopshare)\//.test(r.url)).length
console.log('\n精确店铺页总数:', exactN, '/', kept.length)
console.log('仍为 city=2(北京) 的链接:', kept.filter((r) => /search\/keyword\/2\//.test(r.url)).length)
console.log('仍为 shopinfo/www 登录墙的:', kept.filter((r) => /shopinfo\/|^https:\/\/www\.dianping\.com\/shop\//.test(r.url)).length)
