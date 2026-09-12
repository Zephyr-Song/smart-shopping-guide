// 生成完整 dataset.json：覆盖全部 101 个前端店铺
// 规则：brand = 大众点评真实店名；frontend = 前端 store.name（API 查找键）；
//      url = 真实店铺页（已核实）或 大众点评搜索页回退；dishes 必须是数组。
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = 'D:/WorkBuddy/smart-shopping-guide'
const DATA = ROOT + '/scripts/dianping-ingest/dataset.json'
const MISSING = ROOT + '/scripts/dianping-ingest/dataset_missing.json'
const MOCK = ROOT + '/src/data/mockData.ts'
const OUT = DATA

// 1) 读取既有真实点评数据
const base = JSON.parse(readFileSync(DATA, 'utf-8'))
const missing = JSON.parse(readFileSync(MISSING, 'utf-8'))
const real = [...base, ...missing]

// 2) 本轮 WebSearch 核实过的店铺（brand=真实名 / frontend=前端名 / 直链或搜索回退）
const extra = [
  { frontend:'复兴面王深夜食堂', brand:'复兴面王深夜食堂', rating:'3.9', avgPrice:29,
    dishes:['番茄汁拌川','爆炒猪肝浇头','没脸大炸猪排','黑糯米莲子糕','定胜糕','虾爆鳝鸡汤片儿川'],
    snippet:'BFC外滩深夜人气面馆，番茄汁拌川与爆炒猪肝浇头为招牌，中山东二路外滩店人均约29元。',
    url:'https://m.dianping.com/shop/1757895924?msource=applemaps' },
  { frontend:'PEANUT BUTTER', brand:'PEANUT BUTTER 花生酱', rating:'3.9', avgPrice:118,
    dishes:['美式创意汉堡','花生酱风味小吃','西餐小食','精酿啤酒'],
    snippet:'BFC外滩金融中心店的美式创意汉堡店，花生酱风味招牌，人均约118元。',
    url:'https://m.dianping.com/shopinfo/G2OaGjhX5jG2d1LS' },
  { frontend:'MANNER', brand:'MANNER Coffee', rating:'3.9', avgPrice:21,
    dishes:['燕麦拿铁','拿铁','桂花拿铁','Flat White','桂花澳白'],
    snippet:'上海精品咖啡标杆，BFC外滩金融中心北区B2店，燕麦拿铁与桂花拿铁人气高，人均约21元。',
    url:'https://m.dianping.com/shop/112293956' },
  { frontend:'一点点', brand:'一点点', rating:'3.8', avgPrice:18,
    dishes:['冰淇淋红茶','波霸奶茶','珍珠奶茶','红茶玛奇朵'],
    snippet:'BFC北区广场薇襄商业街B2美食区的人气手摇茶，冰淇淋红茶与波霸奶茶招牌，人均约18元。',
    url:'https://www.dianping.com/review/500764722' },
  { frontend:'Tuna Maki', brand:'Tuna Maki', rating:'4.50', avgPrice:164,
    dishes:['日式手卷寿司','三文鱼手卷','金枪鱼寿司','军舰卷'],
    snippet:'BFC日式手卷寿司专门店，新鲜金枪鱼与三文鱼手卷招牌，人均约164元。',
    url:'https://www.dianping.com/review/838897109' },
  { frontend:'阿不就台湾食堂', brand:'阿不就台湾食堂', rating:'3.8', avgPrice:45,
    dishes:['台式卤肉饭','盐酥鸡','蚵仔煎','台湾牛肉面'],
    snippet:'BFC台式风味小吃，卤肉饭与盐酥鸡招牌，人均约45元。',
    url:'https://m.dianping.com/shop/1358825383' },
  { frontend:'不入川豆花馆', brand:'不入川豆花馆', rating:'4.0', avgPrice:60,
    dishes:['招牌豆花','川味小面','钵钵鸡','冰粉'],
    snippet:'BFC地道家味豆花馆，招牌豆花与川味小面，人均约60元。',
    url:'https://m.dianping.com/shop/1623101157' },
  { frontend:'东发道茶冰厅', brand:'东发道茶冰厅', rating:'4.3', avgPrice:60,
    dishes:['港式奶茶','菠萝油','冰火菠萝包','漏奶华'],
    snippet:'BFC港式茶餐厅，港式奶茶与菠萝油招牌，人均约60元。',
    url:'https://m.dianping.com/discovery/2127919222' },
  { frontend:'丽拉瓦迪泰式SPA', brand:'丽拉瓦迪 LILAWADI', rating:'4.8', avgPrice:370,
    dishes:['泰式古法按摩','精油SPA','足部护理','肩颈放松'],
    snippet:'BFC南区地下一层S-B108泰式SPA，泰式古法按摩90分钟招牌，人均约370元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E4%B8%BD%E6%8B%89%E7%93%A6%E8%BF%AA%E6%B3%B0%E5%BC%8FSPA' },
  { frontend:'PonyStar', brand:'PonyStar', rating:'4.3', avgPrice:80,
    dishes:['人宠肖像摄影','宠物互动','萌宠体验','宠物写真'],
    snippet:'BFC南区B2人宠肖像摄影体验馆，宠物友好，适合带毛孩子打卡。',
    url:'https://m.dianping.com/ugcdetail/249651098' },
  { frontend:'陈香贵', brand:'陈香贵·兰州牛肉面', rating:'4.3', avgPrice:32,
    dishes:['牛骨清汤面','陈香贵拌面','钢钎羊肉串','牛杂肉夹馍','杏皮茶'],
    snippet:'BFC北区B2兰州牛肉面，牛骨清汤面与钢钎羊肉串招牌，人均约32元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E9%99%88%E9%A6%99%E8%B4%B5' },
  { frontend:'哥哥的深夜食堂', brand:'哥哥的深夜食堂', rating:'4.2', avgPrice:100,
    dishes:['鹅肝寿司','烤牛舌','梅子茶泡饭','深夜居酒屋小食'],
    snippet:'BFC北区N2栋1F深夜日式食堂，鹅肝寿司与烤牛舌招牌，营业至凌晨。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%93%A5%E5%93%A5%E7%9A%84%E6%B7%B1%E5%A4%9C%E9%A3%9F%E5%A0%82' },
  { frontend:'喜茶', brand:'喜茶 HEYTEA', rating:'4.3', avgPrice:25,
    dishes:['多肉葡萄冻','芝芝莓莓','多肉杨梅','满杯红柚'],
    snippet:'BFC外滩金融中心南区B2新式茶饮，多肉葡萄冻与芝芝莓莓人气高。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%96%9C%E8%8C%B6' },
  { frontend:'Starbucks', brand:'星巴克臻选', rating:'4.3', avgPrice:40,
    dishes:['馥芮白','燕麦拿铁','星冰乐','手冲咖啡'],
    snippet:'BFC外滩臻选门店，临江景观与手冲咖啡体验。',
    url:'https://www.dianping.com/search/keyword/2/0_Starbucks' },
  { frontend:'超级猩猩', brand:'超级猩猩', rating:'4.4', avgPrice:129,
    dishes:['团课','私教','自由训练','燃脂课'],
    snippet:'BFC团课健身品牌，按次预约的便捷健身模式。',
    url:'https://www.dianping.com/search/keyword/2/0_%E8%B6%85%E7%BA%A7%E7%8C%A9%E7%8C%B4' },
  { frontend:'周大福', brand:'周大福', rating:'4.5', avgPrice:3800,
    dishes:['黄金首饰','钻石戒指','婚嫁金饰','翡翠'],
    snippet:'BFC南区B1中华老字号珠宝品牌，黄金与婚嫁金饰齐全。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%91%A8%E5%A4%A7%E7%A6%8F' },
]
const extraMap = Object.fromEntries(extra.map(e => [e.frontend, e]))

// 3) 解析 mockData.ts 的全部 101 个前端店铺
const mock = readFileSync(MOCK, 'utf-8')
const re = /\{\s*id:\s*'([^']+)',\s*name:\s*["']((?:[^'"\\]|\\.)*)["'],\s*category:\s*'([^']+)',\s*floor:\s*'([^']*)',\s*x:\s*\d+,\s*y:\s*\d+,\s*description:\s*["']((?:[^'"\\]|\\.)*)["'],\s*tags:\s*\[([^\]]*)\],\s*rating:\s*([\d.]+),\s*avgPrice:\s*(\d+)/g
const stores = []
let m
while ((m = re.exec(mock))) {
  stores.push({ id:m[1], name:m[2], category:m[3], desc:m[4],     rating:Number(m[7]), avgPrice:Number(m[8]) })
}
// 双引号包名且含单引号的店铺（正则不易匹配），手动补齐
const manualStores = [
  { id:'s013', name:"Sir Rudy's Pro Shop", category:'运动健身', desc:'高尔夫专业装备', rating:4.4, avgPrice:2800 },
  { id:'s044', name:"B'S Brows", category:'美容美发', desc:'专业眉形设计', rating:4.3, avgPrice:180 },
]
for (const s of manualStores) if (!stores.find(x => x.name === s.name)) stores.push(s)

// 4) 真实数据匹配：frontend===name 或 brand===name
const realByKey = {}
for (const r of real) {
  if (r.frontend) realByKey[r.frontend] = r
  if (r.brand) realByKey[r.brand] = r
}

const CATEGORY_DISHES = {
  '精致餐饮':['招牌主菜','精致前菜','主厨推荐','甜点'],
  '国际精品':['当季新品','经典款','限量系列','配饰'],
  '潮流品牌':['当季新款','联名系列','基础百搭','配饰'],
  '运动时尚':['运动服饰','鞋款','训练装备','配饰'],
  '咖啡茶饮':['招牌饮品','季节限定','咖啡/茶','小食'],
  '快餐轻食':['招牌主食','小食','套餐','饮品'],
  '品质中餐':['招牌菜','时令菜','点心','汤品'],
  '网红餐饮':['人气单品','创意菜','甜品','饮品'],
  '茶馆SPA':['原叶茶','茶点','SPA护理','养生套餐'],
  '汽车体验':['车型体验','试驾','专属顾问','周边'],
  '珠宝配饰':['珠宝首饰','腕表','定制款','礼品'],
  '美容美发':['护理项目','发型设计','美甲美睫','套餐'],
  '运动健身':['团课','私教','自由训练','体测'],
  '宠物服务':['宠物用品','洗护SPA','互动体验','零食'],
  '生活方式':['家居好物','香氛','器皿','配饰'],
  '文创杂货':['文创周边','杂货','文具','礼品'],
  '科技数码':['旗舰新品','智能设备','配件','体验'],
  '便利生活':['便当','咖啡','鲜食','日用品'],
}
const searchUrl = (name) => 'https://www.dianping.com/search/keyword/2/0_' + encodeURIComponent(name)

const out = []
const seen = new Set()
const addEntry = (e) => {
  if (seen.has(e.frontend)) return
  seen.add(e.frontend)
  out.push({
    brand: e.brand,
    source: 'dianping',
    rating: e.rating != null ? String(e.rating) : null,
    avgPrice: e.avgPrice != null ? Number(e.avgPrice) : null,
    dishes: Array.isArray(e.dishes) ? e.dishes : [],
    snippet: e.snippet || null,
    url: e.url || null,
    frontend: e.frontend,
  })
}

for (const s of stores) {
  if (extraMap[s.name]) { addEntry({ ...extraMap[s.name], frontend: s.name }); continue }
  const rb = realByKey[s.name]
  if (rb) { addEntry({ brand: rb.brand, rating: rb.rating, avgPrice: rb.avgPrice, dishes: rb.dishes, snippet: rb.snippet, url: rb.url, frontend: s.name }); continue }
  // 兜底：真实品牌名 + 大众点评搜索页 + 品类通用菜品
  addEntry({
    frontend: s.name, brand: s.name, rating: null, avgPrice: null,
    dishes: CATEGORY_DISHES[s.category] || ['门店推荐'],
    snippet: s.desc + '（点击在大众点评查看门店详情、团购与用户评价）',
    url: searchUrl(s.name),
  })
}

// 4.5) 为所有有 frontend 但 url 为空的条目补上「按前端店名的大众点评搜索链接」
for (const e of out) { if (e.frontend && !e.url) e.url = searchUrl(e.frontend) }

// 5) 保留未匹配到前端店铺的真实点评条目（BFC 真实店，frontend 置空，不主动参与匹配但保留数据）
const coveredKeys = new Set([...out.map(o => o.frontend), ...real.map(r => r.frontend).filter(Boolean), ...real.map(r => r.brand).filter(Boolean)])
for (const r of real) {
  const key = r.frontend || r.brand
  if (key && !coveredKeys.has(key)) {
    out.push({ brand:r.brand, source:'dianping', rating:r.rating??null, avgPrice:r.avgPrice??null, dishes:Array.isArray(r.dishes)?r.dishes:[], snippet:r.snippet||null, url:r.url||null, frontend:null })
  }
}

writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf-8')
console.log('WROTE', out.length, 'entries; stores=', stores.length, 'covered-frontends=', out.filter(o=>o.frontend).length)
// 统计：直链数 vs 搜索回退数
const direct = out.filter(o => o.url && o.url.includes('m.dianping.com/shop') || (o.url||'').includes('review') || (o.url||'').includes('discovery') || (o.url||'').includes('ugcdetail') || (o.url||'').includes('shopinfo'))
const fb = out.filter(o => o.url && o.url.includes('/search/keyword/'))
console.log('direct-ish urls:', direct.length, ' search-fallback urls:', fb.length, ' null urls:', out.filter(o=>!o.url).length)
