// ============================================================
// BFC 外滩金融中心 - 真实数据层
// 数据来源：BFC官方招商资料 & 全年营销规划
// ============================================================

export interface Store {
  id: string
  name: string
  category: string
  floor: string
  x: number
  y: number
  description: string
  tags: string[]
  rating: number
  avgPrice: number
  visitorCount: number
  conversionRate: number
  heatmap: number
}

export interface UserProfile {
  persona: string
  age: string
  companion: string
  priority: string
  interests: string[]
  budgetStyle: string
}

export interface Recommendation {
  storeId: string
  score: number
  reason: string
}

export interface TrafficData {
  hour: string
  visitors: number
  conversions: number
  revenue: number
}

export interface ABTestConfig {
  id: string
  name: string
  description: string
  variantA: string
  variantB: string
  status: 'running' | 'completed' | 'draft'
  startDate: string
  sampleSize: number
  results?: {
    variantAConversion: number
    variantBConversion: number
    variantARevenue: number
    variantBRevenue: number
    significance: number
    winner: 'A' | 'B' | 'none'
  }
}

export interface MarketingEvent {
  month: number
  monthName: string
  theme: string
  events: {
    name: string
    level: 'S' | 'A' | 'theme'
    location: string
    description: string
  }[]
  color: string
}

export interface BFCSegment {
  id: string
  name: string
  nameEn: string
  percentage: number
  avgSpend: number
  revisitRate: number
  color: string
  description: string
  traits: string[]
  keywords: string[]
}

// ============================================================
// BFC 六大核心客群画像（基于官方资料 - BFC Consumer Portrait）
// 图片中左侧列出6类人群，右侧归为4大类别
// ============================================================
export const BFC_SEGMENTS: BFCSegment[] = [
  {
    id: 'white-collar',
    name: '白领',
    nameEn: 'White Collar',
    percentage: 18,
    avgSpend: 2600,
    revisitRate: 0.52,
    color: '#c9a96e',
    description: '周边写字楼白领、金融商务人士，高购买力，追求品味与高端体验',
    traits: ['西装革履', '商务宴请', '注重品质', '工作日午餐'],
    keywords: ['高端', '米其林', '商务', '精致餐饮'],
  },
  {
    id: 'artist-designer',
    name: '艺术家/设计师',
    nameEn: 'Artist / Designer',
    percentage: 10,
    avgSpend: 1800,
    revisitRate: 0.45,
    color: '#b8a97a',
    description: '创意行业从业者，对设计感、美学、文化体验有高度敏感度',
    traits: ['艺术品味', '设计敏感', '文化消费', '独立审美'],
    keywords: ['艺术空间', '设计师品牌', '文创', '展览'],
  },
  {
    id: 'high-income-family',
    name: '高收入家庭',
    nameEn: 'High-Income Families',
    percentage: 26,
    avgSpend: 1200,
    revisitRate: 0.42,
    color: '#e07a5f',
    description: '注重家庭成员生活质量，以休闲、健康、娱乐为整体消费目标',
    traits: ['亲子出行', '家庭聚餐', '节日活动', '一站式消费'],
    keywords: ['亲子', '宠物友好', '家庭', '休闲餐饮'],
  },
  {
    id: 'tourists',
    name: '本国外国游客',
    nameEn: 'Domestic or Foreign Tourists',
    percentage: 12,
    avgSpend: 1500,
    revisitRate: 0.18,
    color: '#6d8fa0',
    description: '来沪旅游客群，彩色都市体验，打卡地标与特色文化消费',
    traits: ['打卡拍照', '文化体验', '伴手礼', '观光游览'],
    keywords: ['外滩', '打卡', '非遗', '文创', '上海特色'],
  },
  {
    id: 'young-hipster',
    name: '年轻潮人',
    nameEn: 'Young Hipsters',
    percentage: 18,
    avgSpend: 580,
    revisitRate: 0.38,
    color: '#81b29a',
    description: '追求个性时尚，社交媒体活跃，热衷网红打卡与潮牌消费',
    traits: ['网红打卡', '个性时尚', '社交分享', '潮牌穿搭'],
    keywords: ['打卡', '潮牌', 'IP联名', '网红店', '社交'],
  },
  {
    id: 'gen-z-influencer',
    name: 'Z世代/网红',
    nameEn: 'GEN Z / Influencers',
    percentage: 16,
    avgSpend: 450,
    revisitRate: 0.40,
    color: '#3d405b',
    description: 'GEN Z与社交媒体创作者，热衷内容创作、品牌联名与限量商品',
    traits: ['内容创作', '限量追求', '品牌联名', '社交媒体'],
    keywords: ['限量', '联名', '打卡', '内容', '潮流'],
  },
]

// ============================================================
// BFC 店铺数据 - 基于官方楼层规划
// ============================================================
export const STORES: Store[] = [
  // === 南区 South Retail ===
  // L4 - Fine Dining 精致餐饮
  { id: 's001', name: '新荣记', category: '精致餐饮', floor: 'S-L4', x: 25, y: 30, description: '米其林星级高端中餐，东海海鲜与台州风味', tags: ['米其林', '海鲜', '高端宴请'], rating: 4.8, avgPrice: 1200, visitorCount: 380, conversionRate: 0.85, heatmap: 0.65 },
  { id: 's002', name: 'Jean Georges', category: '精致餐饮', floor: 'S-L4', x: 55, y: 35, description: '国际知名法餐，外滩江景fine dining', tags: ['法餐', '江景', '约会'], rating: 4.7, avgPrice: 1500, visitorCount: 320, conversionRate: 0.80, heatmap: 0.62 },
  { id: 's003', name: '8 1/2 Otto', category: '精致餐饮', floor: 'S-L4', x: 80, y: 25, description: '米其林意餐，传统意大利风味', tags: ['意餐', '米其林', '红酒'], rating: 4.6, avgPrice: 980, visitorCount: 260, conversionRate: 0.78, heatmap: 0.58 },

  // L3 - 国内设计师精品 / 咖啡 / 艺术空间
  { id: 's004', name: 'BFC ART', category: '艺术空间', floor: 'S-L3', x: 20, y: 30, description: '当代艺术展厅，定期举办国内外艺术家个展', tags: ['艺术', '展览', '文化'], rating: 4.5, avgPrice: 0, visitorCount: 1200, conversionRate: 0.15, heatmap: 0.60 },
  { id: 's005', name: 'RE而意', category: '生活方式', floor: 'S-L3', x: 50, y: 25, description: '独立设计师买手店，咖啡与骑行文化', tags: ['设计师', '咖啡', '骑行'], rating: 4.4, avgPrice: 450, visitorCount: 1500, conversionRate: 0.28, heatmap: 0.68 },
  { id: 's006', name: '% Arabica', category: '精品咖啡', floor: 'S-L3', x: 75, y: 40, description: '日本精品咖啡品牌，极简风格', tags: ['咖啡', '极简', '打卡'], rating: 4.5, avgPrice: 42, visitorCount: 2800, conversionRate: 0.75, heatmap: 0.88 },

  // L2 - 运动时尚 + 设计师品牌 + 珠宝（设计师珠宝孵化平台）
  { id: 's007', name: 'DUSTON BILLEKAMP', category: '设计师珠宝', floor: 'S-L2', x: 15, y: 35, description: '国际设计师珠宝品牌，东西方美学融合', tags: ['珠宝', '设计师', '东方美学'], rating: 4.6, avgPrice: 3500, visitorCount: 420, conversionRate: 0.22, heatmap: 0.48 },
  { id: 's008', name: 'FOREVERMARK', category: '设计师珠宝', floor: 'S-L2', x: 40, y: 30, description: '戴比尔斯旗下钻石品牌，永恒印记', tags: ['钻石', '高端', '婚戒'], rating: 4.7, avgPrice: 8800, visitorCount: 350, conversionRate: 0.18, heatmap: 0.45 },
  { id: 's009', name: 'CIRCLE', category: '设计师珠宝', floor: 'S-L2', x: 65, y: 25, description: '日本轻奢珠宝，精致日常佩戴设计', tags: ['轻奢', '珠宝', '日系'], rating: 4.5, avgPrice: 1800, visitorCount: 680, conversionRate: 0.30, heatmap: 0.55 },
  { id: 's010', name: 'lululemon', category: '运动时尚', floor: 'S-L2', x: 30, y: 55, description: '加拿大运动生活方式品牌', tags: ['运动', '瑜伽', '生活方式'], rating: 4.4, avgPrice: 680, visitorCount: 1800, conversionRate: 0.32, heatmap: 0.72 },
  { id: 's011', name: 'Maison Margiela', category: '设计师品牌', floor: 'S-L2', x: 55, y: 50, description: '法国先锋设计师品牌，解构主义美学', tags: ['高街', '设计师', '先锋'], rating: 4.6, avgPrice: 4200, visitorCount: 520, conversionRate: 0.15, heatmap: 0.52 },

  // L1 - 国际潮流时装精品 / 生活方式
  { id: 's012', name: 'LOEWE', category: '国际精品', floor: 'S-L1', x: 25, y: 30, description: '西班牙奢侈品牌，手工艺与当代设计', tags: ['奢侈品', '手袋', '艺术'], rating: 4.7, avgPrice: 6500, visitorCount: 890, conversionRate: 0.12, heatmap: 0.68 },
  { id: 's013', name: 'Acne Studios', category: '国际精品', floor: 'S-L1', x: 55, y: 25, description: '瑞典设计师品牌，极简北欧风格', tags: ['设计师', '北欧', '极简'], rating: 4.5, avgPrice: 2800, visitorCount: 1200, conversionRate: 0.20, heatmap: 0.70 },
  { id: 's014', name: 'BYREDO', category: '生活方式', floor: 'S-L1', x: 80, y: 35, description: '瑞典香氛与生活方式品牌', tags: ['香氛', '小众', '精致'], rating: 4.6, avgPrice: 1200, visitorCount: 1400, conversionRate: 0.35, heatmap: 0.75 },

  // B1 - 休闲餐饮 + 品质数码 + 东方非遗珠宝区
  { id: 's015', name: '周大福', category: '东方非遗珠宝', floor: 'S-B1', x: 20, y: 30, description: '中华老字号珠宝，传承东方非遗工艺', tags: ['非遗', '黄金', '老字号'], rating: 4.5, avgPrice: 3800, visitorCount: 1100, conversionRate: 0.28, heatmap: 0.62 },
  { id: 's016', name: '老庙黄金', category: '东方非遗珠宝', floor: 'S-B1', x: 50, y: 25, description: '上海百年金饰品牌，非遗花丝工艺', tags: ['非遗', '黄金', '传统工艺'], rating: 4.4, avgPrice: 3200, visitorCount: 950, conversionRate: 0.25, heatmap: 0.58 },
  { id: 's017', name: '中国黄金', category: '东方非遗珠宝', floor: 'S-B1', x: 75, y: 35, description: '央企品牌，投资金条与古法金饰', tags: ['投资', '黄金', '央企'], rating: 4.3, avgPrice: 2800, visitorCount: 880, conversionRate: 0.22, heatmap: 0.55 },
  { id: 's018', name: 'Shake Shack', category: '休闲餐饮', floor: 'S-B1', x: 30, y: 60, description: '纽约人气汉堡，美式休闲快餐', tags: ['汉堡', '美式', '网红'], rating: 4.3, avgPrice: 85, visitorCount: 3200, conversionRate: 0.72, heatmap: 0.92 },
  { id: 's019', name: 'Apple Store', category: '数码电子', floor: 'S-B1', x: 60, y: 55, description: '苹果官方零售店，全线产品及体验服务', tags: ['科技', '数码', '苹果'], rating: 4.7, avgPrice: 5000, visitorCount: 4200, conversionRate: 0.15, heatmap: 0.85 },

  // B2 - 东方美学文化区
  { id: 's020', name: '朵云轩', category: '文化空间', floor: 'S-B2', x: 25, y: 35, description: '百年文化老字号，书画文房与非遗体验', tags: ['非遗', '书画', '文化'], rating: 4.6, avgPrice: 280, visitorCount: 800, conversionRate: 0.25, heatmap: 0.48 },
  { id: 's021', name: '上图书店', category: '文化空间', floor: 'S-B2', x: 55, y: 30, description: '上海图书馆旗下精品书店', tags: ['书店', '阅读', '文化'], rating: 4.5, avgPrice: 65, visitorCount: 1100, conversionRate: 0.38, heatmap: 0.52 },
  { id: 's022', name: '非遗工坊', category: '文化体验', floor: 'S-B2', x: 80, y: 25, description: '非遗手工体验工坊，花丝/剪纸/泥塑', tags: ['体验', '非遗', '手作'], rating: 4.4, avgPrice: 150, visitorCount: 650, conversionRate: 0.55, heatmap: 0.42 },

  // === 北区 North Retail ===
  // L3 - 米其林星级餐厅
  { id: 'n001', name: '泰安门', category: '米其林餐厅', floor: 'N-L3', x: 30, y: 35, description: '米其林三星，现代欧洲料理', tags: ['米其林三星', '西餐', '高端'], rating: 4.9, avgPrice: 2200, visitorCount: 180, conversionRate: 0.90, heatmap: 0.50 },
  { id: 'n002', name: 'Ultraviolet', category: '米其林餐厅', floor: 'N-L3', x: 60, y: 30, description: '多感官沉浸式 dining experience', tags: ['沉浸式', '创意', '预约制'], rating: 4.8, avgPrice: 3800, visitorCount: 120, conversionRate: 0.95, heatmap: 0.45 },
  { id: 'n003', name: '甬府', category: '米其林餐厅', floor: 'N-L3', x: 85, y: 40, description: '米其林一星宁波菜，东海海鲜', tags: ['米其林一星', '海鲜', '宁波菜'], rating: 4.7, avgPrice: 800, visitorCount: 280, conversionRate: 0.82, heatmap: 0.55 },

  // L2 - High Tea 高茶
  { id: 'n004', name: 'TWG Tea', category: '高茶', floor: 'N-L2', x: 35, y: 30, description: '新加坡奢华茶品牌，下午茶体验', tags: ['下午茶', '茶', '社交'], rating: 4.5, avgPrice: 180, visitorCount: 1500, conversionRate: 0.68, heatmap: 0.72 },
  { id: 'n005', name: 'Laduree', category: '高茶', floor: 'N-L2', x: 65, y: 25, description: '法国马卡龙与精致甜点', tags: ['甜点', '马卡龙', '法式'], rating: 4.4, avgPrice: 120, visitorCount: 1800, conversionRate: 0.65, heatmap: 0.75 },

  // L1 - Flagship Store Boutique 旗舰店精品店
  { id: 'n006', name: 'BFC 旗舰店', category: '旗舰精品', floor: 'N-L1', x: 25, y: 30, description: 'BFC 自营旗舰集合空间，限量单品', tags: ['限量', '旗舰', '集合'], rating: 4.5, avgPrice: 1800, visitorCount: 1100, conversionRate: 0.22, heatmap: 0.60 },
  { id: 'n007', name: '大豫园文创', category: '文创精品', floor: 'N-L1', x: 55, y: 25, description: '豫园传统文创与非遗衍生品', tags: ['文创', '非遗', '豫园'], rating: 4.4, avgPrice: 180, visitorCount: 1400, conversionRate: 0.35, heatmap: 0.65 },
  { id: 'n008', name: '上海滩 SHANGHAI TANG', category: '旗舰精品', floor: 'N-L1', x: 80, y: 35, description: '中国奢侈品牌，东方现代美学', tags: ['国奢', '旗袍', '中式'], rating: 4.6, avgPrice: 3200, visitorCount: 680, conversionRate: 0.18, heatmap: 0.52 },

  // B1 - 宠物区 + 博纳影城
  { id: 'n009', name: 'BONA Palace', category: '影院', floor: 'N-B1', x: 30, y: 30, description: '博纳高端影城，IMAX与VIP厅', tags: ['电影', 'IMAX', '娱乐'], rating: 4.5, avgPrice: 120, visitorCount: 3500, conversionRate: 0.85, heatmap: 0.80 },
  { id: 'n010', name: 'PetArea 宠物友好区', category: '宠物服务', floor: 'N-B1', x: 65, y: 25, description: '宠物社交空间，宠物用品与美容', tags: ['宠物', '社交', '萌宠'], rating: 4.3, avgPrice: 200, visitorCount: 1600, conversionRate: 0.60, heatmap: 0.55 },

  // B2 - 文艺空间 + 美食街
  { id: 'n011', name: '美食街', category: '美食街', floor: 'N-B2', x: 25, y: 35, description: '各国街头美食聚集地，人气小吃', tags: ['小吃', '人气', '平价'], rating: 4.2, avgPrice: 45, visitorCount: 4500, conversionRate: 0.78, heatmap: 0.95 },
  { id: 'n012', name: '艺文空间', category: '文艺空间', floor: 'N-B2', x: 55, y: 30, description: '文学与艺术主题活动空间', tags: ['文学', '艺术', '沙龙'], rating: 4.4, avgPrice: 0, visitorCount: 900, conversionRate: 0.20, heatmap: 0.40 },
  { id: 'n013', name: 'TZ House', category: '演艺空间', floor: 'N-B2', x: 80, y: 25, description: 'Livehouse 演艺空间，音乐现场', tags: ['音乐', 'Live', '演出'], rating: 4.5, avgPrice: 200, visitorCount: 1200, conversionRate: 0.70, heatmap: 0.72 },
]

export const CATEGORIES = [
  { id: 'fine-dining', name: '精致餐饮', icon: '🍽️', color: '#c9a96e' },
  { id: 'michelin', name: '米其林餐厅', icon: '⭐', color: '#d4a373' },
  { id: 'high-tea', name: '高茶', icon: '🫖', color: '#e9c46a' },
  { id: 'flagship', name: '旗舰精品', icon: '👑', color: '#8b5cf6' },
  { id: 'intl-fashion', name: '国际精品', icon: '👜', color: '#ec4899' },
  { id: 'designer-brand', name: '设计师品牌', icon: '✂️', color: '#6366f1' },
  { id: 'designer-jewelry', name: '设计师珠宝', icon: '💎', color: '#3b82f6' },
  { id: 'heritage-jewelry', name: '东方非遗珠宝', icon: '🏮', color: '#f59e0b' },
  { id: 'sports', name: '运动时尚', icon: '🏃', color: '#10b981' },
  { id: 'lifestyle', name: '生活方式', icon: '🏠', color: '#14b8a6' },
  { id: 'coffee', name: '精品咖啡', icon: '☕', color: '#8b5cf6' },
  { id: 'culture', name: '文化空间', icon: '📚', color: '#6366f1' },
  { id: 'heritage', name: '文化体验', icon: '🎭', color: '#a855f7' },
  { id: 'food-street', name: '美食街', icon: '🍜', color: '#f97316' },
  { id: 'art-space', name: '文艺空间', icon: '🎨', color: '#a855f7' },
  { id: 'cinema', name: '影院', icon: '🎬', color: '#6366f1' },
  { id: 'pet', name: '宠物服务', icon: '🐾', color: '#f59e0b' },
  { id: 'tech', name: '数码电子', icon: '📱', color: '#3b82f6' },
  { id: 'casual-food', name: '休闲餐饮', icon: '🍔', color: '#f97316' },
]

// ============================================================
// 2026 BFC 全年营销活动日历（基于官方资料图片）
// 左侧标注：③ S级活动(3个) / ⑥ A类活动(6个) / X 主题活动(大量)
// ============================================================
export const MARKETING_CALENDAR: MarketingEvent[] = [
  {
    month: 2,
    monthName: '2-3月',
    theme: '新民俗',
    color: '#dc2626',
    events: [
      // S级（3个之一）
      { name: '新春灯会', level: 'S', location: '全域', description: 'BFC年度核心S级活动，古风NPC巡游、传统灯会、民俗表演' },
      // 主题活动
      { name: '古风NPC巡游', level: 'theme', location: '全域', description: '沉浸式古风角色互动巡游' },
      { name: '外滩国潮面包节', level: 'theme', location: '北区', description: '国潮烘焙品牌齐聚外滩' },
      { name: '野餐食合集', level: 'theme', location: '北区B2', description: '春日野餐主题美食市集' },
      { name: '闪闪发光的你·女生节市集', level: 'theme', location: '北区', description: '三八女生节主题创意市集' },
    ],
  },
  {
    month: 4,
    monthName: '4-5月',
    theme: '新花朝',
    color: '#ec4899',
    events: [
      // A类（6个之一、之二）
      { name: '花花大豫园', level: 'A', location: '全域', description: '春日花卉主题大型活动，花神巡游、花艺装置' },
      { name: '外滩超现实未来花园', level: 'A', location: '外滩', description: '上海国际花卉节 SANTU G-DRAGON 818 Bloom 龙道宇宙' },
      // 主题活动
      { name: '了不起汉服节', level: 'theme', location: '南区B2', description: '汉服文化展示与体验活动' },
      { name: '花神巡游', level: 'theme', location: '全域', description: '十二花神主题巡游表演' },
      { name: 'TZ House演艺', level: 'theme', location: '北区B2', description: '春日主题音乐现场演出' },
    ],
  },
  {
    month: 6,
    monthName: '6月',
    theme: '新艺之城',
    color: '#8b5cf6',
    events: [
      // S级（3个之二）
      { name: '上海国际电影节·大豫园分会场', level: 'S', location: '北区', description: '上海国际电影节官方分会场，星光红毯、首映礼' },
      { name: '外滩国际电影节专场', level: 'S', location: '博纳影城', description: '电影节专属展映场次，导演见面会' },
      // 主题活动
      { name: '珠宝功能区启幕仪式', level: 'theme', location: '南区B1/L2', description: '设计师珠宝+东方非遗珠宝双区启幕' },
      { name: '硅基好吃节', level: 'theme', location: '美食街', description: '科技主题创意美食节' },
      { name: '冷饮饮品嘉年华', level: 'theme', location: '北区', description: '夏日冷饮特调与创意饮品市集' },
    ],
  },
  {
    month: 7,
    monthName: '7-8月',
    theme: '新次元',
    color: '#06b6d4',
    events: [
      // A类（6个之三、之四）
      { name: '大豫园夏日海夜宴', level: 'A', location: '全域', description: '国际IP夏日主题季，IP关联主题文化体验' },
      { name: '外滩夏日游乐园', level: 'A', location: '外滩', description: '夏日户外游乐体验，美食市集、非遗联动' },
      // 主题活动
      { name: '夏日冰世界', level: 'theme', location: '北区', description: '室内冰雪主题体验空间' },
      { name: '夏邑露音乐节', level: 'theme', location: '北区B2', description: 'TZ House夏日露天音乐节' },
      { name: '时光代理人快闪·生日会·主唱LIVE', level: 'theme', location: '北区', description: 'IP联名快闪活动与音乐现场' },
      { name: '人宠友好时尚步行街AIRPARK', level: 'theme', location: '北区B1', description: '宠物友好主题时尚步行街区' },
      { name: '周周有活动·月月有精彩', level: 'theme', location: '全域', description: '暑期常态主题活动不间断' },
    ],
  },
  {
    month: 9,
    monthName: '9月',
    theme: '新科技',
    color: '#3b82f6',
    events: [
      // A类（6个之五）
      { name: '外滩国际光影节', level: 'A', location: '外滩', description: '上海年度光影艺术盛会，BFC VIP DAY联动' },
      // 主题活动
      { name: '国风露台派对', level: 'theme', location: '北区L4', description: '中秋国风主题露台派对' },
      { name: '中泰菲对话（市集/mini展）', level: 'theme', location: '南区B2', description: '东南亚文化主题市集与微型展览' },
      { name: '中秋非遗创意workshop', level: 'theme', location: '南区B2', description: '中秋主题非遗手作体验工坊' },
      { name: 'BFC VIP DAY', level: 'theme', location: '全域', description: 'VIP会员专属活动日与积分兑换' },
      { name: '中秋露台主题场景', level: 'theme', location: '北区L4', description: '中秋赏月露台美陈布置' },
    ],
  },
  {
    month: 10,
    monthName: '10-11月',
    theme: '新非遗',
    color: '#f59e0b',
    events: [
      // A类（6个之六）
      { name: '外滩非遗季·珠宝节', level: 'A', location: '全域', description: '大豫园珠宝玉/非遗季，东方非遗文化展示' },
      // 主题活动
      { name: 'BFC珠宝功能区启幕', level: 'theme', location: '南区B1/L2', description: '珠宝功能区域启幕，主邻季活动' },
      { name: '艺术东方浩拍场', level: 'theme', location: '北区', description: '艺术品拍卖与鉴赏活动' },
      { name: '艺术中心十周年', level: 'theme', location: '北区', description: 'BFC艺术中心十周年庆典展览' },
      { name: '外滩宠咖嘉年华', level: 'theme', location: '北区B1', description: '宠物主题嘉年华活动' },
      { name: '潮星市集', level: 'theme', location: '北区', description: '潮流明星联名主题市集' },
      { name: '墨西哥文化夜', level: 'theme', location: '北区B2', description: '墨西哥主题文化体验夜' },
      { name: '外滩鸡尾酒节', level: 'theme', location: '北区L4', description: '外滩露台鸡尾酒文化体验' },
      { name: '露台长桌宴', level: 'theme', location: '北区L4', description: '秋日露台长桌晚宴' },
    ],
  },
  {
    month: 12,
    monthName: '12月',
    theme: '新消费',
    color: '#ef4444',
    events: [
      // S级（3个之三）
      { name: 'BFC外滩圣诞季', level: 'S', location: '全域', description: '外滩年度圣诞灯光秀与圣诞市集' },
      { name: '新年消费季', level: 'S', location: '全域', description: '跨年消费季系列活动，全场联动促销' },
      // 主题活动
      { name: '露台迎新舞会', level: 'theme', location: '北区L4', description: '新年露台主题舞会派对' },
      { name: '必吃榜·黑珍珠市集', level: 'theme', location: '美食街', description: '年度必吃榜单与黑珍珠餐厅联名市集' },
      { name: '北欧圣诞文化市集·workshop', level: 'theme', location: '北区', description: '北欧传统圣诞文化体验市集与手作坊' },
    ],
  },
]

// ============================================================
// 客流数据（按时段）
// ============================================================
export const HOURLY_TRAFFIC: TrafficData[] = [
  { hour: '10:00', visitors: 420, conversions: 126, revenue: 285000 },
  { hour: '11:00', visitors: 780, conversions: 234, revenue: 523000 },
  { hour: '12:00', visitors: 1290, conversions: 516, revenue: 468000 },
  { hour: '13:00', visitors: 1060, conversions: 371, revenue: 342000 },
  { hour: '14:00', visitors: 850, conversions: 204, revenue: 715000 },
  { hour: '15:00', visitors: 920, conversions: 230, revenue: 900000 },
  { hour: '16:00', visitors: 1110, conversions: 278, revenue: 1010000 },
  { hour: '17:00', visitors: 1350, conversions: 405, revenue: 1425000 },
  { hour: '18:00', visitors: 1800, conversions: 720, revenue: 720000 },
  { hour: '19:00', visitors: 2050, conversions: 820, revenue: 810000 },
  { hour: '20:00', visitors: 1700, conversions: 510, revenue: 1650000 },
  { hour: '21:00', visitors: 980, conversions: 196, revenue: 680000 },
]

export const CUSTOMER_SEGMENTS = BFC_SEGMENTS.map(s => ({
  name: s.name,
  percentage: s.percentage,
  avgSpend: s.avgSpend,
  revisitRate: s.revisitRate,
  color: s.color,
}))

// ============================================================
// A/B 测试配置
// ============================================================
export const AB_TESTS: ABTestConfig[] = [
  {
    id: 'ab1',
    name: 'AI导购推送时机优化',
    description: '测试不同推送时机对消费者到店转化的影响（基于BFC客群特征）',
    variantA: '入店即时推送活动优惠',
    variantB: '浏览5分钟后推送个性化推荐',
    status: 'completed',
    startDate: '2026-04-15',
    sampleSize: 3200,
    results: {
      variantAConversion: 0.12,
      variantBConversion: 0.24,
      variantARevenue: 185,
      variantBRevenue: 328,
      significance: 0.98,
      winner: 'B',
    },
  },
  {
    id: 'ab2',
    name: '客群定向推荐策略',
    description: '基于BFC四大客群画像的定向推荐 vs 通用推荐的效果对比',
    variantA: '通用推荐（不分客群）',
    variantB: 'BFC客群定向推荐（高净值/家庭/潮人/HNI）',
    status: 'running',
    startDate: '2026-05-20',
    sampleSize: 2400,
  },
  {
    id: 'ab3',
    name: '营销活动AI触达优化',
    description: '不同AI触达方式对BFC全年活动客流的影响',
    variantA: '统一推送所有活动',
    variantB: '根据客群画像智能匹配活动推送',
    status: 'running',
    startDate: '2026-05-25',
    sampleSize: 1600,
  },
]

// ============================================================
// 智能导购推荐算法（基于BFC客群画像匹配）
// ============================================================
export function generateRecommendations(profile: UserProfile): Recommendation[] {
  const personaBoost: Record<string, string[]> = {
    '白领': ['精致餐饮', '米其林餐厅', '国际精品', '高茶', '旗舰精品', '精品咖啡'],
    '艺术家/设计师': ['艺术空间', '设计师品牌', '生活方式', '文化空间', '文创精品', '文化体验'],
    '高收入家庭': ['休闲餐饮', '文化空间', '文化体验', '高茶', '生活方式', '宠物服务'],
    '本国外国游客': ['东方非遗珠宝', '文创精品', '文化空间', '文化体验', '旗舰精品', '休闲餐饮'],
    '年轻潮人': ['设计师品牌', '运动时尚', '精品咖啡', '生活方式', '休闲餐饮', '文创精品'],
    'Z世代/网红': ['精品咖啡', '生活方式', '设计师品牌', '运动时尚', '休闲餐饮', '文创精品'],
  }

  const priorityBoost: Record<string, string[]> = {
    '美食体验': ['精致餐饮', '米其林餐厅', '高茶', '美食街', '休闲餐饮'],
    '购物血拼': ['国际精品', '设计师品牌', '设计师珠宝', '东方非遗珠宝', '旗舰精品'],
    '文化休闲': ['文化空间', '文化体验', '文艺空间', '影院', '艺术空间'],
    '社交打卡': ['精品咖啡', '高茶', '文艺空间', '生活方式', '宠物服务'],
  }

  const budgetMap: Record<string, number[]> = {
    '精打细算': [0, 200],
    '适中消费': [200, 1000],
    '品质消费': [1000, 5000],
    '不设上限': [0, 99999],
  }

  const scores = STORES.map(store => {
    let score = 0
    const reasons: string[] = []

    // 客群画像匹配
    const personaMatch = personaBoost[profile.persona] || []
    if (personaMatch.includes(store.category)) {
      score += 5
      reasons.push(`契合「${profile.persona}」消费偏好`)
    }

    // 消费优先级匹配
    const priorityMatch = priorityBoost[profile.priority] || []
    if (priorityMatch.includes(store.category)) {
      score += 4
      reasons.push(`匹配「${profile.priority}」需求`)
    }

    // 预算匹配
    const [minBudget, maxBudget] = budgetMap[profile.budgetStyle] || [0, 99999]
    if (store.avgPrice >= minBudget && store.avgPrice <= maxBudget) {
      score += 3
    } else if (profile.budgetStyle === '不设上限') {
      score += 2
    }

    // 兴趣匹配
    const interestKeywords = profile.interests || []
    const matchedTags = store.tags.filter(tag =>
      interestKeywords.some(ik => tag.includes(ik) || ik.includes(tag))
    )
    if (matchedTags.length > 0) {
      score += matchedTags.length * 2
      reasons.push(`标签匹配：${matchedTags.join('、')}`)
    }

    // 评分加成
    if (store.rating >= 4.6) score += 2

    // 热度加成
    score += store.heatmap * 2

    // 组装推荐理由
    let reason = reasons[0] || ''
    if (!reason) {
      if (store.rating >= 4.5) reason = `高评分推荐（${store.rating}分）`
      else if (store.heatmap >= 0.8) reason = 'BFC热门店铺'
      else reason = '综合匹配推荐'
    }

    return { storeId: store.id, score: Math.round(score * 100) / 100, reason }
  })

  return scores.sort((a, b) => b.score - a.score).slice(0, 6)
}
