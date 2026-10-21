// MediaCrawler XHS 输出 → Cloudflare D1 store_posts 推送
// 用法: node push.mjs   (需在 smart-shopping-guide 目录下执行 wrangler)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const MC_DIR = 'D:/MediaCrawler/data/xhs'
const SITE_DIR = 'D:/WorkBuddy/smart-shopping-guide'
const SQL_OUT = 'D:/WorkBuddy/bfc-verify/store_posts_push.sql'

// 品牌名 → 匹配 token（标题/描述命中即归属；source_keyword 优先，保证精确归属到门店）
// 每个店铺以自身品牌名为搜索关键词，因此每条笔记都能精确归属到对应门店
const BRAND_TOKENS = [
  ['LANVIN', ['LANVIN']],
  ['VERSACE', ['VERSACE', '范思哲']],
  ['BALLY', ['BALLY']],
  ['Sandriver', ['Sandriver']],
  ['Jimmy Choo', ['Jimmy Choo']],
  ['alexanderwang', ['alexanderwang']],
  ['Paul Smith', ['Paul Smith']],
  ['Maison Kitsuné', ['Maison Kitsuné', 'MAISON KITSUNE', 'KITSUNE']],
  ['I.T', ['I.T']],
  ['ON/OFF', ['ON/OFF']],
  ['bebe', ['bebe']],
  ['PHANTACI', ['PHANTACI']],
  ['Wolford', ['Wolford']],
  ['周大福', ['周大福']],
  ['LA PRAIRIE', ['LA PRAIRIE', '莱珀妮']],
  ['AHAVA SPA', ['AHAVA SPA']],
  ['美丽田园', ['美丽田园']],
  ['Nail Soul', ['Nail Soul']],
  ['L.J Nail Salon', ['L.J Nail Salon']],
  ['Carr Barbershop', ['Carr Barbershop']],
  ['京都之家', ['京都之家', 'KYOTO HOUSE', 'KYOTO']],
  ['aaddd', ['aaddd']],
  ['kidsland', ['kidsland']],
  ['小米', ['小米', '小米之家', 'XIAOMI']],
  ['Sir Rudy\'s Pro Shop', ['Sir Rudy']],
  ['DA VITTORIO SHANGHAI', ['DA VITTORIO SHANGHAI', 'DAVITTORIO']],
  ['新荣记', ['新荣记']],
  ['菁禧荟', ['菁禧荟']],
  ['遇外滩', ['遇外滩']],
  ['上海滩', ['上海滩', 'SHANGHAI TANG']],
  ['老吉堂', ['老吉堂']],
  ['泰珍荟', ['泰珍荟']],
  ['晴空', ['晴空']],
  ['NUMATASOU 沼田双', ['NUMATASOU 沼田双']],
  ['橘焱胡同烧肉夜食', ['橘焱胡同烧肉夜食', '橘焱', '胡同烧肉']],
  ['高桌牛排馆', ['高桌牛排馆', '高桌牛排']],
  ['莆田餐厅', ['莆田餐厅']],
  ['白茸', ['白茸']],
  ['松鹤楼苏式汤面', ['松鹤楼苏式汤面', '松鹤楼']],
  ['蝶园海鲜酒馆', ['蝶园海鲜酒馆', '蝶园']],
  ['M Stand', ['M Stand', 'M STAND']],
  ['喜茶', ['喜茶', 'HEYTEA']],
  ['隐溪茶馆', ['隐溪茶馆', '隐溪']],
  ['Baker&Spice', ['Baker&Spice', 'BAKER&SPICE', 'BAKER & SPICE']],
  ['巴黎蜜语', ['巴黎蜜语']],
  ['Whites', ['Whites']],
  ['Le Jardin de JR', ['Le Jardin de JR', 'LE JARDIN']],
  ['MARSMART 火星宠物超市', ['MARSMART 火星宠物超市', 'MARSMART', '火星宠物']],
  ['阿飞和巴弟 PET MART', ['阿飞和巴弟 PET MART', '阿飞和巴弟', 'EFPC']],
  ['宠物愿望 PET WISH', ['宠物愿望 PET WISH', '宠物愿望']],
  ['Pet&Fresh 派特鲜生', ['Pet&Fresh 派特鲜生', '派特鲜生', 'PET&FRESH']],
  ['AIRPARK 人类友好公园', ['AIRPARK 人类友好公园', 'AIRPARK']],
  ['K·1 PET', ['K·1 PET']],
  // —— 补爬的 80 个缺失门店（brand=店名，token=店名；靠 source_keyword 精确归属）——
  ["满愿家", ["满愿家"]],
  ["青鹤荟", ["青鹤荟"]],
  ["高桌", ["高桌"]],
  ["晴空", ["晴空"]],
  ["Moon N Back", ["Moon N Back"]],
  ["DIM SUM MARVEL", ["DIM SUM MARVEL"]],
  ["MEET THE BUND", ["MEET THE BUND"]],
  ["炙焰炉子炉馆", ["炙焰炉子炉馆"]],
  ["A&M CROWNED SALON", ["A&M CROWNED SALON"]],
  ["MOMODA", ["MOMODA"]],
  ["OUTCICS", ["OUTCICS"]],
  ["ON/OFF", ["ON/OFF"]],
  ["J.Lindeberg", ["J.Lindeberg"]],
  ["PIU", ["PIU"]],
  ["gudgood", ["gudgood"]],
  ["华为", ["华为"]],
  ["Luminox", ["Luminox"]],
  ["THE ATELIER", ["THE ATELIER"]],
  ["尊界 MAEXTRO", ["尊界 MAEXTRO"]],
  ["Knatify", ["Knatify"]],
  ["DJULA", ["DJULA"]],
  ["Starbucks", ["Starbucks"]],
  ["b3 Coffee", ["b3 Coffee"]],
  ["永璞", ["永璞"]],
  ["Tuna Maki", ["Tuna Maki"]],
  ["麦当劳", ["麦当劳"]],
  ["SUBWAY", ["SUBWAY"]],
  ["么蛮", ["么蛮"]],
  ["混果汁", ["混果汁"]],
  ["超级猩猩", ["超级猩猩"]],
  ["charfon bijun", ["charfon bijun"]],
  ["丽拉瓦迪泰式SPA", ["丽拉瓦迪泰式SPA"]],
  ["BRANEW", ["BRANEW"]],
  ["丝域养发", ["丝域养发"]],
  ["美妆灵感空间", ["美妆灵感空间"]],
  ["周大福", ["周大福"]],
  ["FIVE DOCTORS", ["FIVE DOCTORS"]],
  ["阿不就台湾食堂", ["阿不就台湾食堂"]],
  ["莆田", ["莆田"]],
  ["小爱同学", ["小爱同学"]],
  ["小米", ["小米"]],
  ["哈曼卡顿", ["哈曼卡顿"]],
  ["PET WISH", ["PET WISH"]],
  ["全家", ["全家"]],
  ["PonyStar", ["PonyStar"]],
  ["GALAXY AUTO STUDIO", ["GALAXY AUTO STUDIO"]],
  ["上海滩餐厅", ["上海滩餐厅"]],
  ["柴门荟", ["柴门荟"]],
  ["陆家居", ["陆家居"]],
  ["梅赛德斯-迈巴赫", ["梅赛德斯-迈巴赫"]],
  ["隐溪茶馆 SPA", ["隐溪茶馆 SPA"]],
  ["白茸", ["白茸"]],
  ["复兴面王深夜食堂", ["复兴面王深夜食堂"]],
  ["橘炭胡同·乌喜", ["橘炭胡同·乌喜"]],
  ["哥哥的深夜食堂", ["哥哥的深夜食堂"]],
  ["PEANUT BUTTER", ["PEANUT BUTTER"]],
  ["满堂 by Bar Choice", ["满堂 by Bar Choice"]],
  ["NUMATA·SOU 沼田双", ["NUMATA·SOU 沼田双"]],
  ["不入川豆花馆", ["不入川豆花馆"]],
  ["米崎", ["米崎"]],
  ["沄南云海肴", ["沄南云海肴"]],
  ["MANNER", ["MANNER"]],
  ["林里柠檬茶", ["林里柠檬茶"]],
  ["陈香贵", ["陈香贵"]],
  ["小吃堂", ["小吃堂"]],
  ["火星宠物超市", ["火星宠物超市"]],
  ["AirPark", ["AirPark"]],
  ["PET MART", ["PET MART"]],
  ["大丰和风食堂", ["大丰和风食堂"]],
  ["茶姬", ["茶姬"]],
  ["湖南饭店", ["湖南饭店"]],
  ["东发道茶冰厅", ["东发道茶冰厅"]],
  ["丘大叔米粉", ["丘大叔米粉"]],
  ["一点点", ["一点点"]],
  ["九木杂物社", ["九木杂物社"]],
  ["多抓鱼", ["多抓鱼"]],
  ["READ&SOCIAL", ["READ&SOCIAL"]],
  ["CLAWGALLERY", ["CLAWGALLERY"]],
  ["Sir Rudy's Pro Shop", ["Sir Rudy's Pro Shop"]],
  ["B'S Brows", ["B'S Brows"]],
]

// 品牌名 → 前端 store.name 映射：D1 里 brand 是小红书抓取时的品牌写法（大小写/重音/空格差异），
// 而前端抽屉是按 store.name 查询的。把 frontend 设成真实 store.name，OR frontend=? 才能命中。
// （与 dianping-ingest 的 brand/frontend 双列思路一致）
const BRAND_TO_FRONTEND = {
  'DA VITTORIO SHANGHAI': 'DA Vittorio Shanghai',
  'LA PRAIRIE': '莱珀妮 La Prairie',
  LANVIN: 'Lanvin',
  'Maison Kitsuné': 'Maison Kitsune',
  VERSACE: 'Versace',
  alexanderwang: 'Alexander Wang',
  // 以下 brand 已与 store.name 完全一致，保留以便未来抓取归一
  BALLY: 'BALLY',
  'I.T': 'I.T',
  'Jimmy Choo': 'Jimmy Choo',
  PHANTACI: 'PHANTACI',
  'Paul Smith': 'Paul Smith',
  Wolford: 'Wolford',
  喜茶: '喜茶',
  新荣记: '新荣记',
  泰珍荟: '泰珍荟',
  老吉堂: '老吉堂',
}

// 品牌名过于通用 / 搜索噪声主导的店铺：小红书按关键词搜到的多为无关内容
// （地名、影视、K-pop、通用短语等），误配展示会误导用户 → 直接丢弃不入库。
// 这些店后续若要补笔记，需用「品牌名 + BFC」这类限定词重新采集。
const DROP_BRANDS = new Set([
  '上海滩',   // "上海滩"→地名/电视剧/歌曲
  'ON/OFF',   // "on/off"→通用短语
  'bebe',     // "bebe"→K-pop/通用
  '周大福',   // 搜到的是泛娱乐内容，非该珠宝门店
  '京都之家', // 搜到的是 BFC 商圈通用内容，非该店
  '满愿家',   // 与《崩坏星穹铁道》角色「满愿」撞名，搜回 19 条全是游戏内容（0% 相关）
])

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e)
    let st; try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) walk(p, out)
    else if (/\.(json|jsonl)$/i.test(e)) out.push(p)
  }
  return out
}

function parseFile(p) {
  const text = readFileSync(p, 'utf-8').trim()
  if (!text) return []
  const items = []
  // jsonl: 每行一个对象
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t) continue
    try {
      const o = JSON.parse(t)
      if (Array.isArray(o)) items.push(...o)
      else items.push(o)
    } catch { /* skip bad line */ }
  }
  return items
}

function matchBrand(text, keyword) {
  // 1) 优先用搜索关键词归属品牌（关键词直接表达意图）
  const kw = (keyword || '').toUpperCase()
  if (kw) {
    for (const [brand, tokens] of BRAND_TOKENS) {
      if (tokens.some(tok => kw.includes(tok.toUpperCase()))) return brand
    }
  }
  // 2) 退回标题/正文文本匹配
  const t = (text || '').toUpperCase()
  for (const [brand, tokens] of BRAND_TOKENS) {
    if (tokens.some(tok => t.includes(tok.toUpperCase()))) return brand
  }
  return '__MALL__'
}

const esc = (v) => `'${String(v == null ? '' : v).replace(/'/g, "''")}'`
const int = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

function main() {
  const files = walk(MC_DIR)
  if (files.length === 0) { console.error('NO_DATA: 未找到 MediaCrawler xhs 输出:', MC_DIR); process.exit(1) }

  const rows = new Map() // note_id -> row
  for (const f of files) {
    for (const it of parseFile(f)) {
      // 只要笔记内容条目（有 note_id），跳过评论等
      if (!it || !it.note_id) continue
      const title = it.title || ''
      const desc = it.desc || it.description || ''
      let cover = null
      const rawIL = it.cover_url || it.image_list || it.images
      if (typeof rawIL === 'string' && rawIL) {
        cover = rawIL.split(',')[0].trim()
      } else if (Array.isArray(rawIL) && rawIL[0]) {
        cover = typeof rawIL[0] === 'string' ? rawIL[0] : (rawIL[0].url || rawIL[0].default || null)
      }
      let url = it.note_url || ''
      if (!url) {
        url = `https://www.xiaohongshu.com/explore/${it.note_id}`
        if (it.xsec_token) url += `?xsec_token=${encodeURIComponent(it.xsec_token)}&xsec_source=pc_search`
      }
      const brand = matchBrand(title + ' ' + desc, it.source_keyword)
      if (DROP_BRANDS.has(brand)) continue // 通用词误配品牌：丢弃
      rows.set(String(it.note_id), {
        brand,
        note_id: String(it.note_id),
        title: title.slice(0, 120),
        desc: desc.slice(0, 500),
        cover_url: cover || null,
        author: it.nickname || it.author || null,
        avatar_url: it.avatar || null,
        liked_count: int(it.liked_count),
        note_url: url,
        note_time: it.time || it.last_update_time || null,
      })
    }
  }

  if (rows.size === 0) { console.error('NO_NOTES: 文件存在但未解析出笔记'); process.exit(1) }
  const now = Date.now()
  const lines = [...rows.values()].map(r =>
    `INSERT OR REPLACE INTO store_posts (brand, frontend, note_id, title, "desc", cover_url, author, avatar_url, liked_count, note_url, note_time, crawled_at) VALUES (${esc(r.brand)}, ${esc(BRAND_TO_FRONTEND[r.brand] || r.brand)}, ${esc(r.note_id)}, ${esc(r.title)}, ${esc(r.desc)}, ${esc(r.cover_url)}, ${esc(r.author)}, ${esc(r.avatar_url)}, ${r.liked_count}, ${esc(r.note_url)}, ${esc(r.note_time)}, ${now});`
  )
  // upsert：只按 note_id 覆盖/新增，绝不 DELETE。
  // （曾用「先删再灌」，结果 jsonl 轮转收缩时误删了 8 个品牌的 147 条历史笔记——
  //   后经 D1 time-travel 才恢复。upsert 保证老数据永远保留，frontend 由上方 BRAND_TO_FRONTEND 归一。）
  writeFileSync(SQL_OUT, lines.join('\n'), 'utf-8')

  const brands = {}
  for (const r of rows.values()) brands[r.brand] = (brands[r.brand] || 0) + 1
  console.log('PARSED', rows.size, 'notes ->', JSON.stringify(brands))

  execSync('npx wrangler d1 execute bfc-agent-db --remote --file="' + SQL_OUT + '"', {
    cwd: SITE_DIR,
    stdio: 'inherit',
    env: { ...process.env, NO_PROXY: '*', no_proxy: '*', HTTP_PROXY: '', HTTPS_PROXY: '' },
  })
  console.log('PUSHED', rows.size, 'notes to D1 store_posts')
}

main()
