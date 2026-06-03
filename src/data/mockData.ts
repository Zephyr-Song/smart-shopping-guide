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
  gender: string
  age: string
  persona: string
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
// BFC 店铺数据 - 基于官方楼层规划（2026最新）
// ============================================================
export const STORES: Store[] = [
  // ==================== 南区 South Retail ====================
  // 4F - 品质中餐聚集区（7家）
  { id: 's001', name: '老吉堂', category: '精致餐饮', floor: 'S-L4', x: 8, y: 16, description: '本帮菜传承名店', tags: ['本帮菜', '老字号'], rating: 4.5, avgPrice: 500, visitorCount: 320, conversionRate: 0.78, heatmap: 0.60 },
  { id: 's002', name: '满愿家', category: '精致餐饮', floor: 'S-L4', x: 24, y: 16, description: '高端中式私宴', tags: ['私宴', '中式'], rating: 4.6, avgPrice: 680, visitorCount: 260, conversionRate: 0.82, heatmap: 0.55 },
  { id: 's003', name: '青鹤荟', category: '精致餐饮', floor: 'S-L4', x: 40, y: 16, description: '新派东方料理', tags: ['新派', '东方'], rating: 4.4, avgPrice: 550, visitorCount: 240, conversionRate: 0.75, heatmap: 0.52 },
  { id: 's004', name: '泰珍荟', category: '精致餐饮', floor: 'S-L4', x: 56, y: 16, description: '泰式精致料理', tags: ['泰餐', '精致'], rating: 4.5, avgPrice: 480, visitorCount: 300, conversionRate: 0.72, heatmap: 0.58 },
  { id: 's005', name: '高桌', category: '精致餐饮', floor: 'S-L4', x: 72, y: 16, description: '高端西餐牛排馆', tags: ['牛排', '西餐'], rating: 4.6, avgPrice: 880, visitorCount: 200, conversionRate: 0.85, heatmap: 0.48 },
  { id: 's006', name: '晴空', category: '精致餐饮', floor: 'S-L4', x: 88, y: 16, description: '日式料理名店', tags: ['日料', '精致'], rating: 4.6, avgPrice: 700, visitorCount: 220, conversionRate: 0.76, heatmap: 0.50 },
  { id: 's007', name: 'Moon N Back', category: '精致餐饮', floor: 'S-L4', x: 48, y: 24, description: '融合创意料理酒吧', tags: ['创意', '酒吧'], rating: 4.4, avgPrice: 450, visitorCount: 350, conversionRate: 0.65, heatmap: 0.55 },
  // 3F - 时尚餐饮 + 生活方式（5家）
  { id: 's008', name: 'DIM SUM MARVEL', category: '品质中餐', floor: 'S-L3', x: 12, y: 34, description: '新派点心专门店', tags: ['点心', '新派'], rating: 4.3, avgPrice: 120, visitorCount: 800, conversionRate: 0.62, heatmap: 0.72 },
  { id: 's009', name: 'MEET THE BUND', category: '品质中餐', floor: 'S-L3', x: 32, y: 34, description: '外滩江景中餐', tags: ['江景', '中餐'], rating: 4.4, avgPrice: 350, visitorCount: 550, conversionRate: 0.70, heatmap: 0.65 },
  { id: 's010', name: '炙焰炉子炉馆', category: '品质中餐', floor: 'S-L3', x: 54, y: 34, description: '明火烤炉料理', tags: ['烤炉', '创意'], rating: 4.3, avgPrice: 200, visitorCount: 600, conversionRate: 0.68, heatmap: 0.62 },
  { id: 's011', name: 'A&M CROWNED SALON', category: '美容美发', floor: 'S-L3', x: 74, y: 34, description: '高端美发沙龙', tags: ['美发', '高端'], rating: 4.5, avgPrice: 500, visitorCount: 280, conversionRate: 0.55, heatmap: 0.45 },
  { id: 's012', name: 'MOMODA', category: '网红餐饮', floor: 'S-L3', x: 90, y: 34, description: '网红创意轻食', tags: ['网红', '轻食'], rating: 4.2, avgPrice: 80, visitorCount: 1100, conversionRate: 0.60, heatmap: 0.75 },
  // 2F - 设计师买手 + 运动（6家）
  { id: 's013', name: "Sir Rudy's Pro Shop", category: '运动健身', floor: 'S-L2', x: 8, y: 46, description: '高尔夫专业装备', tags: ['高尔夫', '运动'], rating: 4.4, avgPrice: 2800, visitorCount: 150, conversionRate: 0.25, heatmap: 0.35 },
  { id: 's014', name: 'OUTCICS', category: '设计师买手', floor: 'S-L2', x: 26, y: 46, description: '小众设计师集合', tags: ['小众', '设计师'], rating: 4.3, avgPrice: 1800, visitorCount: 400, conversionRate: 0.18, heatmap: 0.48 },
  { id: 's015', name: 'ON/OFF', category: '设计师买手', floor: 'S-L2', x: 42, y: 46, description: '先锋买手店', tags: ['先锋', '买手'], rating: 4.4, avgPrice: 2200, visitorCount: 480, conversionRate: 0.15, heatmap: 0.52 },
  { id: 's016', name: 'J.Lindeberg', category: '运动时尚', floor: 'S-L2', x: 56, y: 46, description: '瑞典运动时尚品牌', tags: ['运动', '时尚'], rating: 4.3, avgPrice: 1500, visitorCount: 600, conversionRate: 0.22, heatmap: 0.58 },
  { id: 's017', name: 'PIU', category: '设计师买手', floor: 'S-L2', x: 72, y: 46, description: '韩系潮流集合店', tags: ['韩系', '潮流'], rating: 4.2, avgPrice: 800, visitorCount: 750, conversionRate: 0.28, heatmap: 0.65 },
  { id: 's018', name: 'gudgood', category: '设计师买手', floor: 'S-L2', x: 88, y: 46, description: '生活方式买手店', tags: ['生活', '买手'], rating: 4.3, avgPrice: 600, visitorCount: 650, conversionRate: 0.30, heatmap: 0.60 },
  // 1F - 国际精品 + 奢侈品 + 咖啡（最密集区，约19家分两行）
  { id: 's019', name: 'Alexander Wang', category: '国际精品', floor: 'S-L1', x: 5, y: 56, description: '纽约先锋设计师品牌', tags: ['设计师', '先锋'], rating: 4.5, avgPrice: 4500, visitorCount: 850, conversionRate: 0.14, heatmap: 0.68 },
  { id: 's020', name: 'I.T', category: '设计师买手', floor: 'S-L1', x: 17, y: 56, description: '香港潮流集合店', tags: ['潮流', '集合'], rating: 4.4, avgPrice: 2500, visitorCount: 1200, conversionRate: 0.20, heatmap: 0.72 },
  { id: 's021', name: 'NEITH', category: '设计师买手', floor: 'S-L1', x: 27, y: 56, description: '独立设计师品牌', tags: ['独立', '设计师'], rating: 4.3, avgPrice: 1800, visitorCount: 500, conversionRate: 0.16, heatmap: 0.55 },
  { id: 's022', name: 'Paul Smith', category: '国际精品', floor: 'S-L1', x: 37, y: 56, description: '英国设计师品牌', tags: ['英伦', '设计师'], rating: 4.5, avgPrice: 3200, visitorCount: 700, conversionRate: 0.18, heatmap: 0.62 },
  { id: 's023', name: '华为', category: '科技数码', floor: 'S-L1', x: 49, y: 56, description: '华为旗舰体验店', tags: ['科技', '旗舰'], rating: 4.6, avgPrice: 5000, visitorCount: 2500, conversionRate: 0.22, heatmap: 0.85 },
  { id: 's024', name: 'BALLY', category: '国际精品', floor: 'S-L1', x: 58, y: 56, description: '瑞士奢侈皮具品牌', tags: ['皮具', '奢侈'], rating: 4.5, avgPrice: 5000, visitorCount: 600, conversionRate: 0.15, heatmap: 0.58 },
  { id: 's025', name: 'Jimmy Choo', category: '国际精品', floor: 'S-L1', x: 67, y: 56, description: '奢华鞋履与配饰', tags: ['鞋履', '奢华'], rating: 4.6, avgPrice: 5500, visitorCount: 750, conversionRate: 0.16, heatmap: 0.62 },
  { id: 's026', name: 'Versace', category: '国际精品', floor: 'S-L1', x: 79, y: 56, description: '意大利奢侈品牌', tags: ['奢侈', '意式'], rating: 4.5, avgPrice: 6000, visitorCount: 800, conversionRate: 0.13, heatmap: 0.65 },
  { id: 's027', name: 'Lanvin', category: '国际精品', floor: 'S-L1', x: 91, y: 56, description: '法国高级时装品牌', tags: ['高定', '法式'], rating: 4.6, avgPrice: 7000, visitorCount: 500, conversionRate: 0.12, heatmap: 0.55 },
  // 1F 第二排（珠宝/汽车/咖啡）
  { id: 's028', name: 'Luminox', category: '珠宝配饰', floor: 'S-L1', x: 5, y: 64, description: '瑞士军表品牌', tags: ['腕表', '军表'], rating: 4.3, avgPrice: 3500, visitorCount: 380, conversionRate: 0.14, heatmap: 0.42 },
  { id: 's029', name: 'THE ATELIER', category: '珠宝配饰', floor: 'S-L1', x: 17, y: 64, description: '高端婚纱礼服定制', tags: ['婚纱', '定制'], rating: 4.7, avgPrice: 20000, visitorCount: 120, conversionRate: 0.08, heatmap: 0.38 },
  { id: 's030', name: '尊界 MAEXTRO', category: '汽车体验', floor: 'S-L1', x: 30, y: 64, description: '华为尊界豪华汽车体验中心', tags: ['汽车', '豪华'], rating: 4.6, avgPrice: 500000, visitorCount: 600, conversionRate: 0.05, heatmap: 0.55 },
  { id: 's031', name: 'Wolford', category: '国际精品', floor: 'S-L1', x: 43, y: 64, description: '奥地利奢华丝袜内衣', tags: ['内衣', '奢华'], rating: 4.4, avgPrice: 800, visitorCount: 400, conversionRate: 0.22, heatmap: 0.48 },
  { id: 's032', name: 'Knatify', category: '设计师买手', floor: 'S-L1', x: 53, y: 64, description: '新锐设计师品牌集合', tags: ['新锐', '设计师'], rating: 4.2, avgPrice: 1200, visitorCount: 350, conversionRate: 0.18, heatmap: 0.45 },
  { id: 's033', name: 'DJULA', category: '珠宝配饰', floor: 'S-L1', x: 63, y: 64, description: '巴黎先锋珠宝品牌', tags: ['珠宝', '先锋'], rating: 4.5, avgPrice: 8000, visitorCount: 280, conversionRate: 0.12, heatmap: 0.42 },
  { id: 's034', name: 'Maison Kitsune', category: '国际精品', floor: 'S-L1', x: 73, y: 64, description: '法日融合生活方式品牌', tags: ['法日', '生活方式'], rating: 4.4, avgPrice: 2500, visitorCount: 550, conversionRate: 0.20, heatmap: 0.55 },
  { id: 's035', name: 'Starbucks', category: '咖啡茶饮', floor: 'S-L1', x: 85, y: 64, description: '星巴克臻选门店', tags: ['咖啡', '臻选'], rating: 4.3, avgPrice: 40, visitorCount: 3500, conversionRate: 0.82, heatmap: 0.90 },
  { id: 's036', name: 'b3 Coffee', category: '咖啡茶饮', floor: 'S-L1', x: 94, y: 64, description: '精品手冲咖啡', tags: ['手冲', '精品'], rating: 4.5, avgPrice: 38, visitorCount: 1200, conversionRate: 0.75, heatmap: 0.68 },
  { id: 's037', name: '永璞', category: '咖啡茶饮', floor: 'S-L1', x: 90, y: 70, description: '上海本土精品咖啡', tags: ['精品', '本土'], rating: 4.4, avgPrice: 32, visitorCount: 1500, conversionRate: 0.72, heatmap: 0.65 },
  // B1 - 快餐/美容/珠宝/健身（约14家分两行）
  { id: 's038', name: 'Tuna Maki', category: '快餐轻食', floor: 'S-B1', x: 6, y: 76, description: '日式手卷寿司', tags: ['日料', '快餐'], rating: 4.2, avgPrice: 55, visitorCount: 1800, conversionRate: 0.70, heatmap: 0.78 },
  { id: 's039', name: '麦当劳', category: '快餐轻食', floor: 'S-B1', x: 20, y: 76, description: '全球快餐连锁', tags: ['快餐', '人气'], rating: 4.1, avgPrice: 35, visitorCount: 4500, conversionRate: 0.75, heatmap: 0.92 },
  { id: 's040', name: 'SUBWAY', category: '快餐轻食', floor: 'S-B1', x: 32, y: 76, description: '三明治快餐', tags: ['三明治', '健康'], rating: 4.0, avgPrice: 30, visitorCount: 2200, conversionRate: 0.72, heatmap: 0.75 },
  { id: 's041', name: '么蛮', category: '快餐轻食', floor: 'S-B1', x: 44, y: 76, description: '创意中式简餐', tags: ['中式', '创意'], rating: 4.3, avgPrice: 45, visitorCount: 1200, conversionRate: 0.68, heatmap: 0.62 },
  { id: 's042', name: '混果汁', category: '咖啡茶饮', floor: 'S-B1', x: 56, y: 76, description: '鲜榨果汁品牌', tags: ['果汁', '健康'], rating: 4.2, avgPrice: 25, visitorCount: 2000, conversionRate: 0.78, heatmap: 0.80 },
  { id: 's043', name: '超级猩猩', category: '运动健身', floor: 'S-B1', x: 68, y: 76, description: '团课健身品牌', tags: ['健身', '团课'], rating: 4.4, avgPrice: 129, visitorCount: 800, conversionRate: 0.55, heatmap: 0.60 },
  { id: 's044', name: 'charfon bijun', category: '美容美发', floor: 'S-B1', x: 82, y: 76, description: '日式美甲美睫', tags: ['美甲', '美睫'], rating: 4.3, avgPrice: 280, visitorCount: 350, conversionRate: 0.52, heatmap: 0.48 },
  { id: 's045', name: '丽拉瓦迪泰式SPA', category: '美容美发', floor: 'S-B1', x: 6, y: 84, description: '正宗泰式按摩SPA', tags: ['SPA', '泰式'], rating: 4.5, avgPrice: 500, visitorCount: 180, conversionRate: 0.55, heatmap: 0.40 },
  { id: 's046', name: 'BRANEW', category: '美容美发', floor: 'S-B1', x: 20, y: 84, description: '韩式皮肤管理', tags: ['护肤', '韩式'], rating: 4.4, avgPrice: 400, visitorCount: 250, conversionRate: 0.48, heatmap: 0.42 },
  { id: 's047', name: '丝域养发', category: '美容美发', floor: 'S-B1', x: 34, y: 84, description: '头皮头发护理', tags: ['养发', '护理'], rating: 4.3, avgPrice: 300, visitorCount: 200, conversionRate: 0.50, heatmap: 0.38 },
  { id: 's048', name: "B'S Brows", category: '美容美发', floor: 'S-B1', x: 46, y: 84, description: '专业眉形设计', tags: ['眉形', '设计'], rating: 4.3, avgPrice: 180, visitorCount: 220, conversionRate: 0.55, heatmap: 0.40 },
  { id: 's049', name: '美妆灵感空间', category: '美容美发', floor: 'S-B1', x: 58, y: 84, description: '美妆体验空间', tags: ['美妆', '体验'], rating: 4.2, avgPrice: 200, visitorCount: 400, conversionRate: 0.42, heatmap: 0.48 },
  { id: 's050', name: '周大福', category: '珠宝配饰', floor: 'S-B1', x: 72, y: 84, description: '中华老字号珠宝品牌', tags: ['珠宝', '黄金'], rating: 4.5, avgPrice: 3800, visitorCount: 1100, conversionRate: 0.28, heatmap: 0.62 },
  { id: 's051', name: 'FIVE DOCTORS', category: '美容美发', floor: 'S-B1', x: 86, y: 84, description: '高端医美诊所', tags: ['医美', '高端'], rating: 4.3, avgPrice: 3000, visitorCount: 100, conversionRate: 0.20, heatmap: 0.30 },
  // B2 - 餐饮/数码/宠物（10家）
  { id: 's052', name: '阿不就台湾食堂', category: '快餐轻食', floor: 'S-B2', x: 6, y: 78, description: '台湾风味小吃', tags: ['台湾', '小吃'], rating: 4.3, avgPrice: 45, visitorCount: 900, conversionRate: 0.68, heatmap: 0.55 },
  { id: 's053', name: '莆田', category: '品质中餐', floor: 'S-B2', x: 20, y: 78, description: '福建莆田米其林餐厅', tags: ['福建菜', '米其林'], rating: 4.4, avgPrice: 180, visitorCount: 650, conversionRate: 0.72, heatmap: 0.58 },
  { id: 's054', name: '喜茶', category: '咖啡茶饮', floor: 'S-B2', x: 32, y: 78, description: '新式茶饮开创者', tags: ['茶饮', '网红'], rating: 4.3, avgPrice: 25, visitorCount: 3500, conversionRate: 0.80, heatmap: 0.88 },
  { id: 's055', name: '小爱同学', category: '科技数码', floor: 'S-B2', x: 44, y: 78, description: '小米AIoT体验店', tags: ['智能', '体验'], rating: 4.3, avgPrice: 500, visitorCount: 1800, conversionRate: 0.25, heatmap: 0.70 },
  { id: 's056', name: '小米', category: '科技数码', floor: 'S-B2', x: 58, y: 78, description: '小米之家旗舰店', tags: ['数码', '旗舰'], rating: 4.4, avgPrice: 1500, visitorCount: 2500, conversionRate: 0.32, heatmap: 0.78 },
  { id: 's057', name: '哈曼卡顿', category: '科技数码', floor: 'S-B2', x: 72, y: 78, description: '高端音响体验店', tags: ['音响', '高端'], rating: 4.5, avgPrice: 3000, visitorCount: 600, conversionRate: 0.15, heatmap: 0.42 },
  { id: 's058', name: 'PET WISH', category: '宠物服务', floor: 'S-B2', x: 86, y: 78, description: '宠物愿望清单商店', tags: ['宠物', '用品'], rating: 4.2, avgPrice: 150, visitorCount: 500, conversionRate: 0.55, heatmap: 0.40 },
  { id: 's059', name: '全家', category: '便利生活', floor: 'S-B2', x: 20, y: 84, description: '24小时便利店', tags: ['便利店', '24h'], rating: 4.1, avgPrice: 15, visitorCount: 5000, conversionRate: 0.85, heatmap: 0.92 },
  { id: 's060', name: 'PonyStar', category: '宠物服务', floor: 'S-B2', x: 42, y: 84, description: '萌宠互动体验馆', tags: ['萌宠', '互动'], rating: 4.3, avgPrice: 80, visitorCount: 800, conversionRate: 0.60, heatmap: 0.52 },
  // B3 + S1-5F - 汽车/健身
  { id: 's061', name: 'GALAXY AUTO STUDIO', category: '汽车体验', floor: 'S-B3', x: 40, y: 90, description: '车皇汽车体验中心', tags: ['汽车', '体验'], rating: 4.6, avgPrice: 300000, visitorCount: 300, conversionRate: 0.04, heatmap: 0.42 },
  { id: 's062', name: 'BFC FITNESS健身会馆', category: '运动健身', floor: 'S1-5F', x: 75, y: 50, description: '高端健身会馆，泳池/私教/团课', tags: ['健身', '高端'], rating: 4.5, avgPrice: 800, visitorCount: 380, conversionRate: 0.35, heatmap: 0.48 },

  // ==================== 北区 North Retail ====================
  // N3 - 精致餐饮集群
  { id: 'n001', name: '上海滩餐厅', category: '精致餐饮', floor: 'N-L3-5F', x: 40, y: 16, description: '上海滩品牌旗舰餐厅', tags: ['上海菜', '地标'], rating: 4.5, avgPrice: 700, visitorCount: 220, conversionRate: 0.72, heatmap: 0.52 },
  { id: 'n002', name: '新荣记', category: '精致餐饮', floor: 'N-L3-3F', x: 18, y: 24, description: '米其林台州菜标杆', tags: ['米其林', '台州菜'], rating: 4.8, avgPrice: 1200, visitorCount: 280, conversionRate: 0.85, heatmap: 0.60 },
  { id: 'n003', name: 'DA Vittorio Shanghai', category: '精致餐饮', floor: 'N-L3-3F', x: 62, y: 24, description: '米其林三星意大利餐厅', tags: ['米其林三星', '意餐'], rating: 4.8, avgPrice: 2000, visitorCount: 160, conversionRate: 0.90, heatmap: 0.48 },
  { id: 'n004', name: '柴门荟', category: '精致餐饮', floor: 'N-L3-2F', x: 40, y: 32, description: '川菜高端品牌', tags: ['川菜', '高端'], rating: 4.4, avgPrice: 500, visitorCount: 300, conversionRate: 0.78, heatmap: 0.55 },
  { id: 'n005', name: '莱珀妮 La Prairie', category: '国际精品', floor: 'N-L3-1F', x: 18, y: 40, description: '瑞士奢华护肤品牌', tags: ['护肤', '奢华'], rating: 4.7, avgPrice: 5000, visitorCount: 350, conversionRate: 0.15, heatmap: 0.48 },
  { id: 'n006', name: '陆家居', category: '生活方式', floor: 'N-L3-1F', x: 48, y: 40, description: '高端家居品牌集合', tags: ['家居', '高端'], rating: 4.3, avgPrice: 3000, visitorCount: 200, conversionRate: 0.12, heatmap: 0.38 },
  { id: 'n007', name: '梅赛德斯-迈巴赫', category: '汽车体验', floor: 'N-L3-1F', x: 78, y: 40, description: '迈巴赫城市品牌中心', tags: ['汽车', '迈巴赫'], rating: 4.7, avgPrice: 2000000, visitorCount: 400, conversionRate: 0.02, heatmap: 0.48 },
  // N2 - 茶馆SPA + 网红餐饮（不再叫高茶）
  { id: 'n008', name: '隐溪茶馆 SPA', category: '茶馆SPA', floor: 'N-L2-2F', x: 40, y: 50, description: '精品茶馆与SPA养生空间', tags: ['茶馆', 'SPA', '养生'], rating: 4.6, avgPrice: 300, visitorCount: 500, conversionRate: 0.58, heatmap: 0.55 },
  { id: 'n009', name: '白茸', category: '网红餐饮', floor: 'N-L2-1F', x: 10, y: 58, description: '新派创意料理', tags: ['创意', '新派'], rating: 4.3, avgPrice: 180, visitorCount: 900, conversionRate: 0.62, heatmap: 0.65 },
  { id: 'n010', name: '复兴面王深夜食堂', category: '网红餐饮', floor: 'N-L2-1F', x: 28, y: 58, description: '深夜人气面馆', tags: ['面馆', '深夜'], rating: 4.4, avgPrice: 45, visitorCount: 2200, conversionRate: 0.75, heatmap: 0.82 },
  { id: 'n011', name: 'PHANTACI', category: '设计师买手', floor: 'N-L2-1F', x: 48, y: 58, description: '周杰伦潮流品牌店', tags: ['周杰伦', '潮牌'], rating: 4.3, avgPrice: 1200, visitorCount: 1500, conversionRate: 0.20, heatmap: 0.72 },
  { id: 'n012', name: '橘炭胡同·乌喜', category: '网红餐饮', floor: 'N-L2-1F', x: 66, y: 58, description: '日式烧鸟居酒屋', tags: ['烧鸟', '居酒屋'], rating: 4.4, avgPrice: 200, visitorCount: 600, conversionRate: 0.68, heatmap: 0.58 },
  { id: 'n013', name: '哥哥的深夜食堂', category: '网红餐饮', floor: 'N-L2-1F', x: 86, y: 58, description: '深夜日式食堂', tags: ['日式', '深夜'], rating: 4.2, avgPrice: 100, visitorCount: 800, conversionRate: 0.65, heatmap: 0.60 },
  // N1
  { id: 'n014', name: 'PEANUT BUTTER', category: '网红餐饮', floor: 'N-L1-1F', x: 18, y: 68, description: '美式创意汉堡', tags: ['汉堡', '美式'], rating: 4.2, avgPrice: 75, visitorCount: 1100, conversionRate: 0.70, heatmap: 0.68 },
  { id: 'n039', name: '满堂 by Bar Choice', category: '精致餐饮', floor: 'N-L1-1F', x: 50, y: 68, description: '精品鸡尾酒餐吧', tags: ['鸡尾酒', '餐吧'], rating: 4.5, avgPrice: 280, visitorCount: 600, conversionRate: 0.55, heatmap: 0.62 },
  { id: 'n015', name: 'NUMATA·SOU 沼田双', category: '设计师买手', floor: 'N-L1-1F', x: 82, y: 68, description: '日系买手集合店', tags: ['日系', '买手'], rating: 4.3, avgPrice: 1500, visitorCount: 450, conversionRate: 0.18, heatmap: 0.48 },
  // B1 - 餐饮/宠物/便利
  { id: 'n016', name: '不入川豆花馆', category: '快餐轻食', floor: 'N-B1', x: 6, y: 76, description: '地道川味豆花', tags: ['川味', '豆花'], rating: 4.3, avgPrice: 30, visitorCount: 1200, conversionRate: 0.68, heatmap: 0.62 },
  { id: 'n017', name: '米崎', category: '快餐轻食', floor: 'N-B1', x: 20, y: 76, description: '日式便当', tags: ['日式', '便当'], rating: 4.2, avgPrice: 40, visitorCount: 900, conversionRate: 0.65, heatmap: 0.55 },
  { id: 'n018', name: '沄南云海肴', category: '品质中餐', floor: 'N-B1', x: 32, y: 76, description: '云南菜名店', tags: ['云南菜', '特色'], rating: 4.4, avgPrice: 120, visitorCount: 750, conversionRate: 0.72, heatmap: 0.58 },
  { id: 'n019', name: 'MANNER', category: '咖啡茶饮', floor: 'N-B1', x: 46, y: 76, description: '上海精品咖啡标杆', tags: ['精品', '咖啡'], rating: 4.5, avgPrice: 20, visitorCount: 2800, conversionRate: 0.78, heatmap: 0.85 },
  { id: 'n020', name: '林里柠檬茶', category: '咖啡茶饮', floor: 'N-B1', x: 58, y: 76, description: '手打柠檬茶', tags: ['柠檬茶', '手打'], rating: 4.3, avgPrice: 18, visitorCount: 2000, conversionRate: 0.75, heatmap: 0.75 },
  { id: 'n021', name: '陈香贵', category: '快餐轻食', floor: 'N-B1', x: 72, y: 76, description: '兰州牛肉面', tags: ['面食', '兰州'], rating: 4.3, avgPrice: 35, visitorCount: 1800, conversionRate: 0.72, heatmap: 0.70 },
  { id: 'n022', name: '小吃堂', category: '快餐轻食', floor: 'N-B1', x: 86, y: 76, description: '各地小吃集合', tags: ['小吃', '集合'], rating: 4.1, avgPrice: 25, visitorCount: 2200, conversionRate: 0.70, heatmap: 0.72 },
  { id: 'n023', name: '全家', category: '便利生活', floor: 'N-B1', x: 6, y: 84, description: '24小时便利店', tags: ['便利店', '24h'], rating: 4.1, avgPrice: 15, visitorCount: 3500, conversionRate: 0.82, heatmap: 0.85 },
  { id: 'n024', name: '火星宠物超市', category: '宠物服务', floor: 'N-B1', x: 22, y: 84, description: '大型宠物用品超市', tags: ['宠物', '超市'], rating: 4.2, avgPrice: 120, visitorCount: 600, conversionRate: 0.55, heatmap: 0.50 },
  { id: 'n025', name: 'AirPark', category: '宠物服务', floor: 'N-B1', x: 40, y: 84, description: '宠物友好时尚街区', tags: ['宠物', '时尚'], rating: 4.3, avgPrice: 50, visitorCount: 700, conversionRate: 0.50, heatmap: 0.55 },
  { id: 'n026', name: 'PET MART', category: '宠物服务', floor: 'N-B1', x: 56, y: 84, description: '宠物精品集合店', tags: ['宠物', '精品'], rating: 4.2, avgPrice: 180, visitorCount: 450, conversionRate: 0.48, heatmap: 0.45 },
  // B2 - 餐饮/文创（11家）
  { id: 'n027', name: '大丰和风食堂', category: '快餐轻食', floor: 'N-B2', x: 4, y: 78, description: '日式定食食堂', tags: ['日式', '定食'], rating: 4.2, avgPrice: 50, visitorCount: 800, conversionRate: 0.68, heatmap: 0.52 },
  { id: 'n028', name: '茶姬', category: '咖啡茶饮', floor: 'N-B2', x: 16, y: 78, description: '新式茶饮', tags: ['茶饮', '新式'], rating: 4.3, avgPrice: 22, visitorCount: 1600, conversionRate: 0.72, heatmap: 0.65 },
  { id: 'n029', name: '湖南饭店', category: '品质中餐', floor: 'N-B2', x: 26, y: 78, description: '地道湘菜', tags: ['湘菜', '地道'], rating: 4.3, avgPrice: 80, visitorCount: 700, conversionRate: 0.70, heatmap: 0.55 },
  { id: 'n030', name: '东发道茶冰厅', category: '快餐轻食', floor: 'N-B2', x: 38, y: 78, description: '港式茶餐厅', tags: ['港式', '茶餐厅'], rating: 4.3, avgPrice: 60, visitorCount: 1200, conversionRate: 0.72, heatmap: 0.65 },
  { id: 'n031', name: '丘大叔米粉', category: '快餐轻食', floor: 'N-B2', x: 52, y: 78, description: '手工米粉', tags: ['米粉', '手工'], rating: 4.1, avgPrice: 30, visitorCount: 900, conversionRate: 0.65, heatmap: 0.52 },
  { id: 'n032', name: 'MANNER', category: '咖啡茶饮', floor: 'N-B2', x: 64, y: 78, description: '精品咖啡', tags: ['精品', '咖啡'], rating: 4.5, avgPrice: 20, visitorCount: 2000, conversionRate: 0.78, heatmap: 0.78 },
  { id: 'n033', name: '一点点', category: '咖啡茶饮', floor: 'N-B2', x: 76, y: 78, description: '台式手摇茶', tags: ['台式', '奶茶'], rating: 4.2, avgPrice: 15, visitorCount: 2500, conversionRate: 0.75, heatmap: 0.80 },
  { id: 'n034', name: '陈香贵', category: '快餐轻食', floor: 'N-B2', x: 88, y: 78, description: '兰州牛肉面', tags: ['面食', '兰州'], rating: 4.3, avgPrice: 35, visitorCount: 1400, conversionRate: 0.72, heatmap: 0.62 },
  { id: 'n035', name: '九木杂物社', category: '文创杂货', floor: 'N-B2', x: 6, y: 84, description: '文创杂货集合店', tags: ['文创', '杂货'], rating: 4.3, avgPrice: 50, visitorCount: 900, conversionRate: 0.55, heatmap: 0.55 },
  { id: 'n036', name: '多抓鱼', category: '文创杂货', floor: 'N-B2', x: 24, y: 84, description: '二手循环商店', tags: ['二手', '循环'], rating: 4.4, avgPrice: 40, visitorCount: 1100, conversionRate: 0.62, heatmap: 0.60 },
  { id: 'n037', name: 'READ&SOCIAL', category: '文创杂货', floor: 'N-B2', x: 40, y: 84, description: '阅读社交空间', tags: ['阅读', '社交'], rating: 4.3, avgPrice: 35, visitorCount: 600, conversionRate: 0.45, heatmap: 0.42 },
  { id: 'n038', name: 'CLAWGALLERY', category: '文创杂货', floor: 'N-B2', x: 62, y: 84, description: '潮流艺术画廊', tags: ['艺术', '潮流'], rating: 4.4, avgPrice: 200, visitorCount: 400, conversionRate: 0.32, heatmap: 0.40 },
]


export const CATEGORIES = [
  { id: 'fine-dining', name: '精致餐饮', icon: '🍽️', color: '#c9a96e' },
  { id: 'luxury', name: '国际精品', icon: '👜', color: '#ec4899' },
  { id: 'curated-fashion', name: '设计师买手', icon: '🎯', color: '#6366f1' },
  { id: 'sports-fashion', name: '运动时尚', icon: '🏃', color: '#10b981' },
  { id: 'chinese-cuisine', name: '品质中餐', icon: '🥢', color: '#d97706' },
  { id: 'trendy-dining', name: '网红餐饮', icon: '🔥', color: '#f97316' },
  { id: 'fast-food', name: '快餐轻食', icon: '🍔', color: '#f59e0b' },
  { id: 'cafe-tea', name: '咖啡茶饮', icon: '☕', color: '#8b5cf6' },
  { id: 'tea-spa', name: '茶馆SPA', icon: '🍵', color: '#14b8a6' },
  { id: 'auto', name: '汽车体验', icon: '🚗', color: '#3b82f6' },
  { id: 'jewelry', name: '珠宝配饰', icon: '💎', color: '#eab308' },
  { id: 'beauty', name: '美容美发', icon: '💄', color: '#ec4899' },
  { id: 'fitness', name: '运动健身', icon: '🏋️', color: '#22c55e' },
  { id: 'pet', name: '宠物服务', icon: '🐾', color: '#f59e0b' },
  { id: 'lifestyle-culture', name: '文创杂货', icon: '📚', color: '#a855f7' },
  { id: 'tech', name: '科技数码', icon: '📱', color: '#3b82f6' },
  { id: 'lifestyle', name: '生活方式', icon: '🏠', color: '#14b8a6' },
  { id: 'convenience', name: '便利生活', icon: '🏪', color: '#6b7280' },
]

// ============================================================
// 2026 BFC 全年营销活动日历（基于官方资料图片）
// 左侧标注：③ S级活动(3个) / ⑥ A类活动(6个) / X 主题活动(大量)
//
// ★ S级（3个）：花花大豫园、大豫园夏日奇幻夜、外滩非遗季/珠宝节
// ★ A类（6个）：外滩国际光影节(9月)、外滩国际电影节专场(6月)、
//               BFC外滩圣诞季(12月)、外滩超现实未来花园、
//               外滩夏日游乐园、上海国际光影节
// ★ 新春灯会：普通主题活动（无等级）
// ============================================================
export const MARKETING_CALENDAR: MarketingEvent[] = [
  {
    month: 2,
    monthName: '2-3月',
    theme: '新民俗',
    color: '#dc2626',
    events: [
      // 主题活动（新春灯会无等级）
      { name: '新春灯会', level: 'theme', location: '全域', description: '传统灯会、民俗表演、古风氛围体验' },
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
      // S级（3个之一）
      { name: '花花大豫园', level: 'S', location: '全域', description: 'BFC年度S级核心活动，春日花卉主题，花神巡游、花艺装置' },
      // A类（6个之一）
      { name: '外滩超现实未来花园', level: 'A', location: '外滩', description: 'SANTU G-DRAGON 818 Bloom 龙道宇宙，超现实花园艺术装置' },
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
      // A类（6个之二）
      { name: '外滩国际电影节专场', level: 'A', location: '博纳影城', description: '电影节专属展映场次，导演见面会' },
      // 主题活动
      { name: '上海国际电影节·大豫园分会场', level: 'theme', location: '北区', description: '上海国际电影节官方分会场活动' },
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
      // S级（3个之二）
      { name: '大豫园夏日奇幻夜', level: 'S', location: '全域', description: 'BFC年度S级核心活动，夏日奇幻主题夜，IP联名沉浸式体验' },
      // A类（6个之三）
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
      // A类（6个之四、之五）
      { name: '外滩国际光影节', level: 'A', location: '外滩', description: '外滩年度光影艺术盛会，灯光装置与沉浸式体验' },
      { name: '上海国际光影节', level: 'A', location: '全域', description: '上海城市级光影艺术节，BFC为核心展场' },
      // 主题活动
      { name: 'BFC VIP DAY', level: 'theme', location: '全域', description: 'VIP会员专属活动日与积分兑换' },
      { name: '国风露台派对', level: 'theme', location: '北区L4', description: '中秋国风主题露台派对' },
      { name: '中泰菲对话（市集/mini展）', level: 'theme', location: '南区B2', description: '东南亚文化主题市集与微型展览' },
      { name: '中秋非遗创意workshop', level: 'theme', location: '南区B2', description: '中秋主题非遗手作体验工坊' },
      { name: '中秋露台主题场景', level: 'theme', location: '北区L4', description: '中秋赏月露台美陈布置' },
    ],
  },
  {
    month: 10,
    monthName: '10-11月',
    theme: '新非遗',
    color: '#f59e0b',
    events: [
      // S级（3个之三）
      { name: '外滩非遗季·珠宝节', level: 'S', location: '全域', description: 'BFC年度S级核心活动，大豫园珠宝玉/非遗季，东方非遗文化展示' },
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
      // A类（6个之六）
      { name: 'BFC外滩圣诞季', level: 'A', location: '全域', description: '外滩年度圣诞灯光秀与圣诞市集' },
      // 主题活动
      { name: '新年消费季', level: 'theme', location: '全域', description: '跨年消费季系列活动，全场联动促销' },
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
    description: '基于BFC六大客群画像的定向推荐 vs 通用推荐的效果对比',
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
    '白领': ['精致餐饮', '国际精品', '咖啡茶饮', '生活方式', '科技数码', '茶馆SPA'],
    '艺术家/设计师': ['设计师买手', '文创杂货', '国际精品', '生活方式', '珠宝配饰', '咖啡茶饮'],
    '高收入家庭': ['精致餐饮', '品质中餐', '宠物服务', '运动健身', '生活方式', '汽车体验'],
    '本国外国游客': ['文创杂货', '珠宝配饰', '品质中餐', '咖啡茶饮', '精致餐饮', '设计师买手'],
    '年轻潮人': ['设计师买手', '网红餐饮', '运动时尚', '咖啡茶饮', '科技数码', '文创杂货'],
    'Z世代/网红': ['网红餐饮', '运动时尚', '咖啡茶饮', '设计师买手', '文创杂货', '生活方式'],
    '其他': ['精致餐饮', '咖啡茶饮', '生活方式', '设计师买手', '运动健身', '文创杂货'],
  }

  const priorityBoost: Record<string, string[]> = {
    '品质美食': ['精致餐饮', '品质中餐', '网红餐饮', '快餐轻食', '咖啡茶饮', '茶馆SPA'],
    '潮流购物': ['国际精品', '设计师买手', '珠宝配饰', '运动时尚', '文创杂货', '科技数码'],
    '休闲娱乐': ['茶馆SPA', '运动健身', '汽车体验', '生活方式', '美容美发', '咖啡茶饮'],
    '社交打卡': ['网红餐饮', '咖啡茶饮', '设计师买手', '文创杂货', '宠物服务', '生活方式'],
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
