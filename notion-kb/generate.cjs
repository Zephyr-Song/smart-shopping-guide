// 从真实 BFC 数据生成 Notion 导入文件（CSV + Markdown）
// 用法：先 tsc 编译 mockData.ts → dist/mockData.js（dist 内需有 {"type":"commonjs"}），再 node generate.cjs
const fs = require('fs')
const path = require('path')

const REPO = path.resolve(__dirname, '..')
const md = require(path.join(REPO, 'notion-kb/dist/mockData.js'))
const stores = md.STORES || []
console.log('真实 STORES 数量：', stores.length)

const headers = ['名称', '品类', '楼层', '评分', '人均(¥)', '标签', '简介', '月均客流', '热度']
const esc = (v) => {
  const s = String(v == null ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
let csv = '﻿' + headers.join(',') + '\n'
for (const s of stores) {
  csv += [s.name, s.category, s.floor, s.rating, s.avgPrice, (s.tags || []).join('、'), s.description, s.visitorCount, s.heatmap].map(esc).join(',') + '\n'
}
fs.writeFileSync(path.join(__dirname, 'BFC店铺知识库.csv'), csv, 'utf8')

const floorOrder = ['S-L4','S-L3','S-L2','S-L1','S-B1','S-B2','N-L4','N-L3','N-L2','N-L1','N-B1','N-B2']
const byFloor = {}
for (const s of stores) {
  const f = floorOrder.includes(s.floor) ? s.floor : '其他'
  ;(byFloor[f] = byFloor[f] || []).push(s)
}
const sortedFloors = Object.keys(byFloor).sort((a, b) => floorOrder.indexOf(a) + 99 - (floorOrder.indexOf(b) + 99))

let out = '# BFC 外滩金融中心 · 店铺知识库\n\n'
out += '> 数据来源：BFC 官方招商资料 & 全年营销规划，共 **' + stores.length + '** 家店铺。\n\n'
out += '## 楼层总览\n\n'
for (const f of sortedFloors) out += '- **' + f + '**：' + byFloor[f].length + ' 家\n'
out += '\n---\n\n'
for (const f of sortedFloors) {
  out += '## ' + f + '（' + byFloor[f].length + ' 家）\n\n'
  const byCat = {}
  for (const s of byFloor[f]) (byCat[s.category] = byCat[s.category] || []).push(s)
  for (const cat of Object.keys(byCat)) {
    out += '### ' + cat + '\n\n'
    for (const s of byCat[cat]) {
      out += '- **' + s.name + '** ｜ 评分 ' + s.rating + ' ｜ 人均 ¥' + s.avgPrice + ' ｜ 标签：' + ((s.tags || []).join('、') || '—') + '\n'
      out += '  - ' + s.description + '\n'
    }
    out += '\n'
  }
}
fs.writeFileSync(path.join(__dirname, 'BFC知识库.md'), out, 'utf8')
console.log('已生成：BFC店铺知识库.csv / BFC知识库.md')
