// fix_urls2.mjs —— 把 dataset 中所有点评链接收敛为「可用形态」：
//   1) 已有精确店铺页(m.dianping.com/shop|shopshare/{id}) → 保留
//   2) shop_url_resolved.json 里反查到的                          → 用精确店铺页
//   3) 其余（含 city=1 搜索兜底）→ 置空。
//      原因（实测）：点评搜索页对未登录用户全部跳登录墙
//        · m.dianping.com/search/keyword/...  → mlogin 短信登录页
//        · www.dianping.com/search/keyword/... → PC 扫码登录页
//      因此"搜索兜底"是不可用死链，宁可不显示，也不给用户一个打不开的链接。
import fs from 'node:fs'
import path from 'node:path'

const SDIR = 'D:/WorkBuddy/smart-shopping-guide/scripts/dianping-ingest'
const DATA = path.join(SDIR, 'dataset.json')
const RESOLVED = path.join(SDIR, 'shop_url_resolved.json')
const OUT = path.join(SDIR, 'url_fix_report2.json')

const resolved = JSON.parse(fs.readFileSync(RESOLVED, 'utf8'))
const rows = JSON.parse(fs.readFileSync(DATA, 'utf8'))
// 精确店铺页：允许带查询串（历史数据里有 ?msource=applemaps 这类参数）
const PRECISE_ANY = /^https:\/\/m\.dianping\.com\/(shop|shopshare)\/[A-Za-z0-9]+/
const canonical = (u) => {
  const m = String(u || '').match(/^https:\/\/m\.dianping\.com\/(shop|shopshare)\/([A-Za-z0-9]+)/)
  return m ? `https://m.dianping.com/${m[1]}/${m[2]}` : null
}

// 自愈：若上一轮脚本把「带参数但本来可用」的链接误置空，从报告里恢复
const prevReport = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : []
const recover = {}
for (const x of prevReport) {
  if (x.action && x.action.startsWith('无精确页') && PRECISE_ANY.test(x.before || '')) {
    const c = canonical(x.before)
    if (c) recover[x.brand] = c
  }
}
if (Object.keys(recover).length) console.log('自愈恢复:', Object.entries(recover).map(([k, v]) => k + '→' + v).join(', '))

const report = []
for (const r of rows) {
  const before = r.url || ''
  const hit = resolved[r.brand]
  let after = before
  let action = '未变'

  const canonBefore = canonical(before)
  if (canonBefore) {
    after = canonBefore
    action = canonBefore === before ? '已是精确店铺页' : '精确店铺页(去参数)'
  } else if (recover[r.brand]) {
    after = recover[r.brand]
    action = '恢复误置空的精确店铺页'
  } else if (hit && canonical(hit.url)) {
    after = canonical(hit.url)
    action = '反查升级为精确店铺页'
  } else {
    after = ''
    action = before ? '无精确页→置空(搜索兜底是登录墙死链)' : '无链接'
  }

  r.url = after
  report.push({ brand: r.brand, action, before, after, shopName: hit ? hit.shopName : null })
}

fs.writeFileSync(DATA, JSON.stringify(rows, null, 2), 'utf8')
fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')

const tally = {}
for (const x of report) tally[x.action] = (tally[x.action] || 0) + 1
console.log('总行数:', rows.length)
for (const [k, v] of Object.entries(tally)) console.log('  ' + k.padEnd(38) + v)

const precise = rows.filter((r) => canonical(r.url)).length
const empty = rows.filter((r) => !r.url).length
const bad = rows.filter((r) => r.url && !canonical(r.url)).length
console.log('\n精确店铺页:', precise, '/', rows.length)
console.log('无链接(前端隐藏按钮):', empty)
console.log('仍为其它形态(应为0):', bad)
if (bad) rows.filter((r) => r.url && !canonical(r.url)).forEach((r) => console.log('   !', r.brand, r.url))
