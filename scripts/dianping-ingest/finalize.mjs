// 生成最终 dataset：剔除占位数据 + 补齐有大众点评数据的店铺
// 输出 dataset.json（原文件备份为 dataset_raw_backup.json）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const DATA = path.join(__dirname, 'dataset.json')

const dpSearch = (kw) => `https://www.dianping.com/search/keyword/2/0_${encodeURIComponent(kw)}`

/* ── 1. BrandExplore 品牌名（精确匹配，与后端 SQL 的 = 语义一致） ── */
const src = fs.readFileSync(path.join(root, 'src/pages/BrandExplore.tsx'), 'utf8')
const start = src.indexOf('const BRANDS')
const end = src.indexOf('export default', start)
const seg = src.slice(start, end > start ? end : src.length)
const names = [...seg.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])

/* ── 2. 读原始 dataset ── */
const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const rows = Array.isArray(raw) ? raw : raw.reviews || []
fs.writeFileSync(path.join(__dirname, 'dataset_raw_backup.json'), JSON.stringify(rows, null, 2))

/* ── 3. 剔除占位数据（无评分、无人均，且简介是"点击在大众点评查看门店详情"模板） ── */
const GENERIC = new Set(['当季新品', '经典款', '限量系列', '配饰'])
const isPlaceholder = (r) =>
  !r.rating &&
  !r.avgPrice &&
  (String(r.snippet || '').includes('点击在大众点评查看门店详情') ||
    (Array.isArray(r.dishes) && r.dishes.length > 0 && r.dishes.every((d) => GENERIC.has(d))))

const placeholders = rows.filter(isPlaceholder)
let keep = rows.filter((r) => !isPlaceholder(r))

/* ── 4. 修补：已核实到的真实评分 ── */
const PATCH = { 菁禧荟: { rating: '4.8' } }
for (const r of keep) {
  const p = PATCH[r.brand]
  if (p) Object.assign(r, p)
}

/* ── 5. 补齐：BrandExplore 中确实存在大众点评数据的店铺（本轮 WebSearch 核实） ── */
const NEW = [
  {
    brand: '遇外滩', frontend: '遇外滩', source: 'dianping', rating: '4.8', avgPrice: 818,
    dishes: ['厦门红蟳蒸米糕', '葱头油肉汁焗荔浦芋头', '姜母鸽腿', '海鲜佛跳墙'],
    snippet: 'BFC南区3层S301，米其林一星闽菜，厦门红蟳蒸米糕与海鲜佛跳墙为招牌，临江夜景，人均约818元。',
    url: dpSearch('遇外滩'),
  },
  {
    brand: 'M Stand', frontend: 'M Stand', source: 'dianping', rating: '4.5', avgPrice: 48,
    dishes: ['鲜椰冰咖', '燕麦曲奇拿铁', '燕麦丝绒拿铁', '水泥芝士蛋糕'],
    snippet: 'BFC南区B1层B106C，外滩人气精品咖啡，鲜椰冰咖与燕麦曲奇拿铁是常点组合，人均约48元。',
    url: dpSearch('M Stand'),
  },
  {
    brand: 'Baker&Spice', frontend: 'Baker&Spice', source: 'dianping', rating: '4.3', avgPrice: 80,
    dishes: ['杏仁羊角', '海盐卷', '芝士柠檬蛋糕', '蓝莓乳酪蛋糕'],
    snippet: 'BFC南区1F，主打健康轻食与现烤烘焙，杏仁羊角与海盐卷人气高，甜品水准在线，人均约80元。',
    url: dpSearch('Baker&Spice'),
  },
  {
    brand: '松鹤楼苏式汤面', frontend: '松鹤楼苏式汤面', source: 'dianping', rating: '4.3', avgPrice: 46,
    dishes: ['古法焖肉面', '蟹粉汤包', '枫镇大肉面', '虾仁两面黄'],
    snippet: 'BFC南区B2，苏州老字号松鹤楼的苏式面馆，古法焖肉面与蟹粉汤包为招牌，人均约46元。',
    url: dpSearch('松鹤楼苏式汤面'),
  },
  {
    brand: '蝶园海鲜酒馆', frontend: '蝶园海鲜酒馆', source: 'dianping', rating: '4.6', avgPrice: 229,
    dishes: ['红烧肉烤蛋', '荠菜笋壳鱼', '油爆虾', '蟹粉豆腐'],
    snippet: 'BFC 4F S414，主打本帮海鲜的蝶园外滩店，红烧肉烤蛋与荠菜笋壳鱼好评多，人均约229元。',
    url: dpSearch('蝶园海鲜酒馆'),
  },
  {
    brand: '巴黎蜜语', frontend: 'La Parisienne 巴黎蜜语', source: 'dianping', rating: '4.3', avgPrice: 68,
    dishes: ['国王饼', '海盐焦糖闪电泡芙', '佛手柑挞', '马卡龙'],
    snippet: 'BFC南区1F S115a，法式甜品屋，国王饼与海盐焦糖闪电泡芙为招牌，下午茶套餐人气高，人均约68元。',
    url: dpSearch('巴黎蜜语'),
  },
  {
    brand: 'Whites', frontend: 'Whites', source: 'dianping', rating: null, avgPrice: 59,
    dishes: ['大發蛋糕', 'Gelato大橘冰淇淋', '草莓奶糕', '巧克力时钟'],
    snippet: 'BFC南区B1层B115单元，颜值系甜品店，大發蛋糕与仿真Gelato大橘冰淇淋为招牌，人均约59元。',
    url: dpSearch('Whites BFC'),
  },
  {
    brand: 'Le Jardin de JR', frontend: 'La Boutique de JR', source: 'dianping', rating: null, avgPrice: 52,
    dishes: ['巧克力蝴蝶酥', '杏仁可颂', '焦糖可颂', '迷你提拉米苏'],
    snippet: 'BFC南区2F S217A，法国米其林三星品牌旗下烘焙甜品，巧克力蝴蝶酥与杏仁可颂为必买，人均约52元。',
    url: dpSearch('Le Jardin de JR'),
  },
  {
    brand: 'AHAVA SPA', frontend: 'AHAVA SPA', source: 'dianping', rating: '4.7', avgPrice: 704,
    dishes: ['Osmoter黄金奢颜面部护理', '释然无忧身体按摩', '死海泥膜护理', '零重力漂浮仓'],
    snippet: 'BFC南区3层与B1，以色列死海矿物品牌旗舰SPA，外滩美容/SPA好评榜第3名，人均约704元。',
    url: 'https://m.dianping.com/shop/128556008',
  },
  {
    brand: '京都之家', frontend: '京都之家 Kyoto House', source: 'dianping', rating: '4.8', avgPrice: 789,
    dishes: ['京烧·清水烧', 'SOU·SOU 足袋', '清课堂锡器', '京都清酒'],
    snippet: 'BFC南区1F，京都府指定全球首家海外平台，集合京烧清水烧、SOU·SOU 与京都清酒，人均约789元。',
    url: 'https://m.dianping.com/shop/H2W8aJ79EuTMAtaQ',
  },
  {
    brand: '美丽田园', frontend: '美丽田园', source: 'dianping', rating: '4.6', avgPrice: 324,
    dishes: ['面部护理', '身体SPA', '嫩肤护理', '肩颈舒缓'],
    snippet: 'BFC美妆美体连锁门店，主打面部护理与身体SPA，门店评分约4.6，人均约324元。',
    url: dpSearch('美丽田园 BFC'),
  },
]

const existingBrands = new Set(keep.flatMap((r) => [r.brand, r.frontend].filter(Boolean)))
const added = NEW.filter((n) => !existingBrands.has(n.brand) && !existingBrands.has(n.frontend))
const finalRows = [...keep, ...added]

/* ── 6. 写回 ── */
fs.writeFileSync(DATA, JSON.stringify(finalRows, null, 2), 'utf-8')

/* ── 7. 报告（精确匹配，等同后端 SQL） ── */
const keySet = new Set(finalRows.flatMap((r) => [r.brand, r.frontend].filter(Boolean)))
const hit = names.filter((n) => keySet.has(n))
const miss = names.filter((n) => !keySet.has(n))

console.log('原始行数:', rows.length)
console.log('剔除占位:', placeholders.length, '| 保留真实:', keep.length, '| 新增补齐:', added.length)
console.log('最终行数:', finalRows.length)
console.log('\n覆盖: ' + hit.length + '/' + names.length + ' 家（精确匹配）')
console.log('\n--- 仍无大众点评数据的店铺（抽屉内整块隐藏）---')
console.log(miss.join(' | '))
console.log('\n新增:', added.map((a) => a.brand).join(' | '))
