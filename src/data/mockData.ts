export interface Store {
  id: string
  name: string
  category: string
  floor: number
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
  age: string
  gender: string
  budget: string
  interests: string[]
  visitPurpose: string
  shoppingStyle: string
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

export const STORES: Store[] = [
  { id: 's1', name: 'ZARA', category: '时尚服饰', floor: 1, x: 20, y: 30, description: '国际快时尚品牌，提供男女装、童装及配饰', tags: ['时尚', '服装', '国际品牌'], rating: 4.3, avgPrice: 350, visitorCount: 2840, conversionRate: 0.18, heatmap: 0.85 },
  { id: 's2', name: '星巴克', category: '餐饮咖啡', floor: 1, x: 60, y: 25, description: '全球知名咖啡连锁，提供精品咖啡与轻食', tags: ['咖啡', '休闲', '社交'], rating: 4.5, avgPrice: 45, visitorCount: 4200, conversionRate: 0.72, heatmap: 0.95 },
  { id: 's3', name: 'Apple Store', category: '数码电子', floor: 1, x: 80, y: 35, description: '苹果官方零售店，提供全线产品及体验服务', tags: ['科技', '数码', '高端'], rating: 4.7, avgPrice: 8000, visitorCount: 3100, conversionRate: 0.12, heatmap: 0.88 },
  { id: 's4', name: '海底捞', category: '餐饮美食', floor: 2, x: 25, y: 40, description: '知名火锅连锁，以优质服务著称', tags: ['火锅', '聚餐', '服务好'], rating: 4.6, avgPrice: 150, visitorCount: 1800, conversionRate: 0.45, heatmap: 0.78 },
  { id: 's5', name: '优衣库', category: '时尚服饰', floor: 1, x: 45, y: 55, description: '日本休闲服饰品牌，基础款与联名系列', tags: ['休闲', '基础款', '性价比'], rating: 4.2, avgPrice: 150, visitorCount: 3600, conversionRate: 0.25, heatmap: 0.90 },
  { id: 's6', name: '丝芙兰', category: '美妆护肤', floor: 1, x: 70, y: 60, description: '全球美妆零售品牌，汇集各大品牌', tags: ['美妆', '护肤', '香水'], rating: 4.4, avgPrice: 400, visitorCount: 2200, conversionRate: 0.20, heatmap: 0.72 },
  { id: 's7', name: 'Nike', category: '运动户外', floor: 2, x: 55, y: 30, description: '全球运动品牌，运动鞋服及配件', tags: ['运动', '潮牌', '球鞋'], rating: 4.5, avgPrice: 600, visitorCount: 2600, conversionRate: 0.16, heatmap: 0.82 },
  { id: 's8', name: '西西弗书店', category: '文化生活', floor: 2, x: 35, y: 65, description: '精品连锁书店，提供阅读与文化体验', tags: ['书籍', '文化', '休闲'], rating: 4.6, avgPrice: 60, visitorCount: 1500, conversionRate: 0.35, heatmap: 0.55 },
  { id: 's9', name: '喜茶', category: '餐饮咖啡', floor: 1, x: 30, y: 75, description: '新式茶饮品牌，创意茶饮与轻食', tags: ['茶饮', '网红', '拍照'], rating: 4.3, avgPrice: 30, visitorCount: 3800, conversionRate: 0.68, heatmap: 0.92 },
  { id: 's10', name: '泡泡玛特', category: '潮玩文创', floor: 2, x: 75, y: 55, description: '潮玩品牌，盲盒与收藏品', tags: ['潮玩', '盲盒', 'IP'], rating: 4.1, avgPrice: 70, visitorCount: 2900, conversionRate: 0.30, heatmap: 0.75 },
  { id: 's11', name: '外婆家', category: '餐饮美食', floor: 2, x: 15, y: 20, description: '江浙菜连锁餐厅，性价比高', tags: ['中餐', '江浙菜', '家常'], rating: 4.0, avgPrice: 80, visitorCount: 1600, conversionRate: 0.38, heatmap: 0.65 },
  { id: 's12', name: 'MUJI', category: '家居生活', floor: 2, x: 60, y: 70, description: '日本生活品牌，简约家居与文具', tags: ['简约', '家居', '文具'], rating: 4.3, avgPrice: 120, visitorCount: 2000, conversionRate: 0.22, heatmap: 0.68 },
]

export const CATEGORIES = [
  { id: 'fashion', name: '时尚服饰', icon: '👗', color: '#ec4899' },
  { id: 'food', name: '餐饮美食', icon: '🍜', color: '#f97316' },
  { id: 'coffee', name: '餐饮咖啡', icon: '☕', color: '#8b5cf6' },
  { id: 'tech', name: '数码电子', icon: '📱', color: '#3b82f6' },
  { id: 'beauty', name: '美妆护肤', icon: '💄', color: '#f43f5e' },
  { id: 'sports', name: '运动户外', icon: '🏃', color: '#10b981' },
  { id: 'culture', name: '文化生活', icon: '📚', color: '#6366f1' },
  { id: 'home', name: '家居生活', icon: '🏠', color: '#14b8a6' },
  { id: 'trendy', name: '潮玩文创', icon: '🎨', color: '#a855f7' },
]

export const HOURLY_TRAFFIC: TrafficData[] = [
  { hour: '10:00', visitors: 320, conversions: 58, revenue: 28500 },
  { hour: '11:00', visitors: 580, conversions: 104, revenue: 52300 },
  { hour: '12:00', visitors: 890, conversions: 312, revenue: 46800 },
  { hour: '13:00', visitors: 760, conversions: 228, revenue: 34200 },
  { hour: '14:00', visitors: 650, conversions: 143, revenue: 71500 },
  { hour: '15:00', visitors: 720, conversions: 180, revenue: 90000 },
  { hour: '16:00', visitors: 810, conversions: 202, revenue: 101000 },
  { hour: '17:00', visitors: 950, conversions: 285, revenue: 142500 },
  { hour: '18:00', visitors: 1200, conversions: 480, revenue: 72000 },
  { hour: '19:00', visitors: 1350, conversions: 540, revenue: 81000 },
  { hour: '20:00', visitors: 1100, conversions: 330, revenue: 165000 },
  { hour: '21:00', visitors: 680, conversions: 136, revenue: 68000 },
]

export const CUSTOMER_SEGMENTS = [
  { name: '年轻白领', percentage: 32, avgSpend: 480, revisitRate: 0.42, color: '#6366f1' },
  { name: '家庭客群', percentage: 24, avgSpend: 620, revisitRate: 0.38, color: '#ec4899' },
  { name: '学生群体', percentage: 20, avgSpend: 180, revisitRate: 0.28, color: '#10b981' },
  { name: '商务人士', percentage: 14, avgSpend: 850, revisitRate: 0.35, color: '#f97316' },
  { name: '游客', percentage: 10, avgSpend: 350, revisitRate: 0.12, color: '#8b5cf6' },
]

export const AB_TESTS: ABTestConfig[] = [
  {
    id: 'ab1',
    name: '推送时机优化',
    description: '测试不同推送时机对消费者到店转化的影响',
    variantA: '入店即时推送优惠',
    variantB: '浏览3分钟后推送个性化推荐',
    status: 'completed',
    startDate: '2026-04-15',
    sampleSize: 2400,
    results: {
      variantAConversion: 0.15,
      variantBConversion: 0.23,
      variantARevenue: 85,
      variantBRevenue: 128,
      significance: 0.96,
      winner: 'B',
    },
  },
  {
    id: 'ab2',
    name: '推荐策略对比',
    description: '基于协同过滤 vs 基于内容推荐的转化效果',
    variantA: '协同过滤推荐（相似用户偏好）',
    variantB: '内容推荐（商品特征匹配）',
    status: 'running',
    startDate: '2026-05-20',
    sampleSize: 1600,
  },
  {
    id: 'ab3',
    name: '优惠力度测试',
    description: '不同折扣力度对客单价与复购率的影响',
    variantA: '满300减30（10%折扣）',
    variantB: '满300减50（17%折扣）',
    status: 'running',
    startDate: '2026-05-25',
    sampleSize: 800,
  },
]

export function generateRecommendations(profile: UserProfile): Recommendation[] {
  const scores = STORES.map(store => {
    let score = 0
    let reason = ''

    // Budget match
    if (profile.budget === 'low' && store.avgPrice < 100) score += 3
    else if (profile.budget === 'medium' && store.avgPrice >= 100 && store.avgPrice <= 500) score += 3
    else if (profile.budget === 'high' && store.avgPrice > 500) score += 3
    else if (profile.budget === 'any') score += 1

    // Interest match
    const interestMatch = profile.interests.some(interest =>
      store.tags.some(tag => tag.includes(interest) || interest.includes(tag))
    )
    if (interestMatch) score += 4

    // Purpose match
    if (profile.visitPurpose === 'dining' && (store.category === '餐饮美食' || store.category === '餐饮咖啡')) score += 3
    if (profile.visitPurpose === 'shopping' && store.category !== '餐饮美食' && store.category !== '餐饮咖啡') score += 2
    if (profile.visitPurpose === 'social' && (store.category === '餐饮咖啡' || store.category === '文化生活')) score += 3
    if (profile.visitPurpose === 'explore') score += 1

    // Shopping style
    if (profile.shoppingStyle === 'impulse' && store.conversionRate > 0.3) score += 2
    if (profile.shoppingStyle === 'planned' && store.rating > 4.3) score += 2
    if (profile.shoppingStyle === 'casual' && store.heatmap > 0.7) score += 2

    // Popularity boost
    score += store.heatmap * 2

    // Build reason
    const matchedTags = store.tags.filter(tag =>
      profile.interests.some(i => tag.includes(i) || i.includes(tag))
    )
    if (matchedTags.length > 0) {
      reason = `匹配你的兴趣「${matchedTags.join('、')}」`
    } else if (profile.visitPurpose === 'dining' && store.category.includes('餐饮')) {
      reason = '符合你的用餐需求'
    } else if (store.rating >= 4.5) {
      reason = `高评分店铺（${store.rating}分）`
    } else if (store.heatmap >= 0.85) {
      reason = '热门店铺，人气旺盛'
    } else {
      reason = '综合推荐'
    }

    return { storeId: store.id, score: Math.round(score * 100) / 100, reason }
  })

  return scores.sort((a, b) => b.score - a.score).slice(0, 6)
}
