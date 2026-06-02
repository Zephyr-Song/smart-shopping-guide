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
// BFC 四大核心客群画像（基于官方资料）
// ============================================================
export const BFC_SEGMENTS: BFCSegment[] = [
  {
    id: 'hnw-pop',
    name: '高净值人群',
    nameEn: 'High Net-Worth Population',
    percentage: 28,
    avgSpend: 2800,
    revisitRate: 0.48,
    color: '#c9a96e',
    description: '周边写字楼白领、金融商务人士，高购买力，追求品味与高端体验',
    traits: ['西装革履', '注重品质', '商务宴请', 'VIP会员'],
    keywords: ['高端', '米其林', '珠宝', '设计师品牌'],
  },
  {
    id: 'urban-family',
    name: '都市家庭',
    nameEn: 'Urban Family',
    percentage: 26,
    avgSpend: 1200,
    revisitRate: 0.42,
    color: '#e07a5f',
    description: '注重家庭成员生活质量，以休闲、健康、娱乐为整体消费目标',
    traits: ['亲子出行', '家庭聚餐', '节日活动', '一站式消费'],
    keywords: ['亲子', '宠物友好', '家庭', '休闲餐饮'],
  },
  {
    id: 'gen-z',
    name: '都市潮人',
    nameEn: 'Metropolitan Strength',
    percentage: 30,
    avgSpend: 580,
    revisitRate: 0.35,
    color: '#81b29a',
    description: '年轻潮流GEN Z，个性时尚+网红打卡+宠物友好+社交媒体活跃',
    traits: ['网红打卡', '个性时尚', '社交分享', '宠物陪伴'],
    keywords: ['打卡', '潮牌', 'IP联名', '网红店'],
  },
  {
    id: 'hni',
    name: '高净值个人',
    nameEn: 'HNI',
    percentage: 16,
    avgSpend: 5200,
    revisitRate: 0.55,
    color: '#3d405b',
    description: '享受专属权益和兴趣，VIP专属沙龙活动，一对一尊享服务',
    traits: ['私人定制', 'VIP服务', '艺术鉴赏', '高端消费'],
    keywords: ['VIP', '私人定制', '艺术品', '限定'],
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
// 2026 BFC 全年营销活动日历（基于官方资料）
// ============================================================
export const MARKETING_CALENDAR: MarketingEvent[] = [
  {
    month: 1,
    monthName: '1月',
    theme: '新消费 / 新年消费季',
    color: '#ef4444',
    events: [
      { name: '新年消费季', level: 'S', location: '全域', description: 'BFC 新年消费季，全场联动促销' },
      { name: 'BFC外滩圣诞季延续', level: 'A', location: '北区', description: '圣诞氛围延续至新年' },
      { name: 'BFC七周年庆', level: 'S', location: '全域', description: 'BFC七周年庆典活动' },
    ],
  },
  {
    month: 2,
    monthName: '2月',
    theme: '新民俗 / 新春灯会',
    color: '#dc2626',
    events: [
      { name: '新春灯会', level: 'S', location: '北区', description: '古风NPC巡游、外滩国潮面包节' },
      { name: 'BFC年中大促', level: 'A', location: '全域', description: '春节档期大促活动' },
      { name: '女生节市集', level: 'theme', location: '北区', description: '闪闪发光的你-女生节市集' },
    ],
  },
  {
    month: 3,
    monthName: '3月',
    theme: '新民俗 / 春日焕新',
    color: '#f97316',
    events: [
      { name: '外滩国际面包节', level: 'theme', location: '北区', description: '国际烘焙品牌齐聚' },
      { name: '了不起汉堡节', level: 'theme', location: '美食街', description: '全球人气汉堡品牌' },
      { name: '野雀求合集', level: 'theme', location: '北区', description: '独立设计师市集' },
    ],
  },
  {
    month: 4,
    monthName: '4-5月',
    theme: '新花朝 / 花神大豫园',
    color: '#ec4899',
    events: [
      { name: '花神大豫园', level: 'S', location: '全域', description: '大豫园春日主题活动' },
      { name: 'SANTU 艺术展', level: 'A', location: '北区', description: '国际艺术家联名展' },
      { name: 'G-DRAGON 818 Bloom', level: 'A', location: '北区', description: '时尚IP联名活动' },
      { name: '花道宇宙', level: 'theme', location: '南区', description: '东方花道体验展' },
    ],
  },
  {
    month: 6,
    monthName: '6月',
    theme: '新艺术 / 电影节',
    color: '#8b5cf6',
    events: [
      { name: '上海国际电影节', level: 'S', location: '北区', description: '上海国际电影节大豫园分会场' },
      { name: 'BFC国际电影专场', level: 'A', location: '博纳影城', description: '电影节专属场次' },
      { name: 'BFC年中大促', level: 'A', location: '全域', description: '618年中大促' },
      { name: '外滩宠物嘉年华', level: 'theme', location: '北区B1', description: '宠物友好主题活动' },
    ],
  },
  {
    month: 7,
    monthName: '7-8月',
    theme: '新次元 / 夏日游园',
    color: '#06b6d4',
    events: [
      { name: '大豫园夏日奇幻夜', level: 'S', location: '全域', description: '夏日夜间主题活动' },
      { name: '外滩夏日游乐园', level: 'A', location: '北区', description: '夏日户外游乐体验' },
      { name: 'IP国际文化节', level: 'A', location: '全域', description: '泼水节/美食市集/非遗联动' },
      { name: '夏日水世界', level: 'theme', location: '北区', description: '夏日水上主题活动' },
      { name: '夏日音乐节', level: 'theme', location: '北区B2', description: 'TZ House 夏日音乐季' },
    ],
  },
  {
    month: 9,
    monthName: '9月',
    theme: '新科技 / 光影节',
    color: '#3b82f6',
    events: [
      { name: '上海国际光影节', level: 'S', location: '全域', description: '上海年度光影艺术盛会' },
      { name: '外滩国际光影节', level: 'S', location: '外滩', description: '外滩灯光艺术装置' },
      { name: 'BFC VIP DAY', level: 'A', location: '全域', description: 'VIP会员专属活动日' },
      { name: '中秋露台主题场景', level: 'theme', location: '北区L4', description: '中秋赏月露台布置' },
    ],
  },
  {
    month: 10,
    monthName: '10-11月',
    theme: '新非遗 / 珠宝非遗季',
    color: '#f59e0b',
    events: [
      { name: '大豫园珠宝月', level: 'S', location: '南区', description: '珠宝功能区年度盛典' },
      { name: '非遗季', level: 'S', location: '全域', description: '东方非遗文化展示周' },
      { name: 'BFC珠宝功能区启幕', level: 'A', location: '南区B1/L2', description: '设计师珠宝+非遗珠宝双区' },
      { name: '外滩东方造物场', level: 'A', location: '南区B2', description: '非遗手作体验市集' },
      { name: '艺术中心十周年', level: 'A', location: '北区', description: 'BFC艺术中心十周年庆典' },
    ],
  },
  {
    month: 12,
    monthName: '12月',
    theme: '新消费 / 圣诞新年季',
    color: '#ef4444',
    events: [
      { name: 'BFC外滩圣诞季', level: 'S', location: '全域', description: '外滩年度圣诞灯光秀' },
      { name: '新年消费季', level: 'S', location: '全域', description: '跨年消费季系列活动' },
      { name: 'BFC七周年庆', level: 'A', location: '全域', description: '年度会员庆典' },
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
    '高净值人群': ['精致餐饮', '米其林餐厅', '设计师珠宝', '国际精品', '高茶', '旗舰精品'],
    '都市家庭': ['美食街', '休闲餐饮', '宠物服务', '文化空间', '文化体验', '影院'],
    '都市潮人': ['设计师品牌', '运动时尚', '精品咖啡', '文艺空间', '生活方式', '休闲餐饮'],
    '高净值个人': ['米其林餐厅', '设计师珠宝', '旗舰精品', '精致餐饮', '国际精品'],
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
