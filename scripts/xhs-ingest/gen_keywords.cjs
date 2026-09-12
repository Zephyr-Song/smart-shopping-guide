const fs = require('fs')

// 1) Read brand names from BrandExplore.tsx
const src = fs.readFileSync('src/pages/BrandExplore.tsx', 'utf8')
const re = /name:\s*["']([^"']+)["']/g
const brands = []
let m
while ((m = re.exec(src)) !== null) brands.push(m[1])
console.log('BRANDS', brands.length)

// 2) Keyword per store = exact brand name (bare). Max 53 comma-separated.
const keywords = brands.join(',')
fs.writeFileSync('scripts/xhs-ingest/keywords.txt', keywords, 'utf-8')
console.log('KEYWORDS_LEN', keywords.length)

// 3) BRAND_TOKENS: each brand -> [brandName] (lowercased match handles source_keyword)
//    plus a few latin aliases for robustness.
const aliases = {
  'DA VITTORIO SHANGHAI': ['DAVITTORIO'],
  '喜茶': ['HEYTEA'],
  '京都之家': ['KYOTO HOUSE', 'KYOTO'],
  'MARSMART 火星宠物超市': ['MARSMART', '火星宠物'],
  '阿飞和巴弟 PET MART': ['阿飞和巴弟', 'EFPC'],
  'LA PRAIRIE': ['LA PRAIRIE', '莱珀妮'],
  'VERSACE': ['VERSACE', '范思哲'],
  'Maison Kitsuné': ['MAISON KITSUNE', 'KITSUNE'],
  'M Stand': ['M STAND'],
  'Baker&Spice': ['BAKER&SPICE', 'BAKER & SPICE'],
  'Pet&Fresh 派特鲜生': ['派特鲜生', 'PET&FRESH'],
  '隐溪茶馆': ['隐溪'],
  '橘焱胡同烧肉夜食': ['橘焱', '胡同烧肉'],
  '高桌牛排馆': ['高桌牛排'],
  '松鹤楼苏式汤面': ['松鹤楼'],
  '蝶园海鲜酒馆': ['蝶园'],
  'Le Jardin de JR': ['LE JARDIN'],
  'AIRPARK 人类友好公园': ['AIRPARK'],
  '宠物愿望 PET WISH': ['宠物愿望'],
  '小米': ['小米之家', 'XIAOMI'],
  '上海滩': ['SHANGHAI TANG'],
}
const tokensArr = brands.map(b => {
  const toks = [b, ...(aliases[b] || [])]
  return `  ['${b.replace(/'/g, "\\'")}', [${toks.map(t => `'${t.replace(/'/g, "\\'")}'`).join(', ')}]],`
})
const block = `// 品牌名 -> 匹配 token（标题/描述命中即归属；source_keyword 优先）
// 每个店铺以自身品牌名为搜索关键词，保证笔记精确归属到该门店
const BRAND_TOKENS = [
${tokensArr.join('\n')}
]
`
fs.writeFileSync('scripts/xhs-ingest/brand_tokens.txt', block, 'utf-8')
console.log('TOKENS', brands.length)
console.log('--- keywords preview ---')
console.log(keywords.slice(0, 200))
