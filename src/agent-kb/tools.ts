// 商场 agent 工具 —— OpenAI 兼容 function-calling 定义 + 服务端执行器
// 这些工具在 Cloudflare Worker 中由大模型按需调用，结果会转成前端卡片或喂回模型。
import { STORES, CATEGORIES, HOURLY_TRAFFIC } from '../data/mockData'
import type { AgentCard } from '../components/agent/agentTypes'
import { FACILITIES } from './facilities'
import { SERVICES } from './services'
import { FAQ } from './faq'

type StoreCardData = Extract<AgentCard, { type: 'store' }>

export type ToolResult =
  | { kind: 'stores'; data: StoreCardData[] }
  | { kind: 'compare'; data: StoreCardData[] }
  | { kind: 'info'; data: { title: string; text: string } }
  | { kind: 'none'; data: null }

function catOf(category: string) {
  return CATEGORIES.find(c => c.name === category)
}

function toStoreCard(s: (typeof STORES)[number]): StoreCardData {
  const c = catOf(s.category)
  return {
    type: 'store',
    storeId: s.id,
    name: s.name,
    category: s.category,
    icon: c?.icon ?? '🏬',
    color: c?.color ?? '#8b5cf6',
    rating: s.rating,
    floor: s.floor,
    avgPrice: s.avgPrice,
    heatmap: s.heatmap ?? 0.5,
    reason: undefined,
    matchPercent: undefined,
  }
}

// 场景 → 相关品类
const OCCASION_MAP: Record<string, string[]> = {
  约会: ['精致餐饮', '品质中餐', '咖啡茶饮', '茶馆SPA', '国际精品'],
  带娃: ['生活方式', '文创杂货', '宠物服务', '快餐轻食', '潮流品牌'],
  聚餐: ['精致餐饮', '品质中餐', '网红餐饮', '快餐轻食'],
  送礼: ['国际精品', '珠宝配饰', '美容美发', '文创杂货', '生活方式'],
  购物: ['国际精品', '潮流品牌', '运动时尚', '珠宝配饰', '科技数码'],
  闺蜜: ['网红餐饮', '咖啡茶饮', '美容美发', '潮流品牌', '国际精品'],
}

// 餐饮品类（search_stores 的 food_only 参数只返回这些）
const FOOD_CATS = ['精致餐饮', '品质中餐', '网红餐饮', '快餐轻食', '咖啡茶饮']

function scoreStore(
  s: (typeof STORES)[number],
  q: { query?: string; category?: string; budgetMax?: number; occasion?: string; people?: number; foodOnly?: boolean },
): number {
  // food_only：强制只返回餐饮，避免“吃什么”给出美容美发/科技数码
  if (q.foodOnly && !FOOD_CATS.includes(s.category)) return -999
  let sc = 0
  if (q.category && (s.category === q.category || s.tags.includes(q.category))) sc += 3
  if (q.occasion && OCCASION_MAP[q.occasion]?.includes(s.category)) sc += 2
  // 预算 + 人数：超预算直接淘汰；预算内按 人均×人数 越接近预算越高
  if (typeof q.budgetMax === 'number' && typeof q.people === 'number') {
    const total = s.avgPrice * q.people
    if (total > q.budgetMax) return -999 // 硬约束：人均×人数 不得超过总预算
    const ratio = Math.abs(total - q.budgetMax) / (q.budgetMax || 1)
    sc += Math.max(0, 3 - ratio * 2)
  } else if (typeof q.budgetMax === 'number') {
    // 仅有预算：餐饮查询同样硬过滤超预算门店；非餐饮保留轻度容忍
    if (q.foodOnly && s.avgPrice > q.budgetMax) return -999
    if (s.avgPrice <= q.budgetMax) sc += 2
    else if (s.avgPrice <= q.budgetMax * 1.3) sc += 0.5
    else sc -= 2
  }
  if (q.query) {
    const t = q.query.toLowerCase()
    if (s.name.toLowerCase().includes(t) || s.tags.some(tag => tag.toLowerCase().includes(t))) sc += 2
    if (s.description.toLowerCase().includes(t)) sc += 0.5
  }
  // 轻微偏好高评分
  sc += s.rating * 0.1
  return sc
}

function findStore(name: string) {
  const t = name.trim().toLowerCase()
  if (!t) return null
  return (
    STORES.find(s => s.name.toLowerCase() === t) ??
    STORES.find(s => s.name.toLowerCase().includes(t)) ??
    STORES.find(s => t.includes(s.name.toLowerCase()))
  )
}

// ---------------------------------------------------------------------------
// 工具定义（OpenAI / DeepSeek 兼容的 function-calling 格式）
// ---------------------------------------------------------------------------
export const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'search_stores',
      description: '按关键词、品类、预算上限或场景，在 BFC 商场中检索匹配的店铺，返回Top结果。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '自由文本，如“精品咖啡”“川菜”' },
          category: { type: 'string', description: '品类名，如“咖啡茶饮”“国际精品”' },
          budget_max: { type: 'number', description: '总预算上限（元）。与 people 同时给出时，按 人均×人数 最接近预算排序' },
          people: { type: 'number', description: '就餐人数；提供后按 人均×人数 最接近 budget_max 排序' },
          food_only: { type: 'boolean', description: '为 true 时只返回餐饮品类（精致餐饮/品质中餐/网红餐饮/快餐轻食/咖啡茶饮），用于“吃什么”类查询，避免返回美容美发等非餐饮' },
          occasion: { type: 'string', description: '场景：约会/带娃/聚餐/送礼/购物/闺蜜' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_store_detail',
      description: '获取某家店铺的详细信息（楼层、人均、评分、简介）。',
      parameters: {
        type: 'object',
        properties: { name: { type: 'string', description: '店铺名称，可部分匹配' } },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_stores',
      description: '对比两家店铺，便于用户决策。',
      parameters: {
        type: 'object',
        properties: {
          a: { type: 'string', description: '第一家店名（可部分匹配）' },
          b: { type: 'string', description: '第二家店名（可部分匹配）' },
        },
        required: ['a', 'b'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_facility',
      description: '查询商场设施信息（卫生间、停车场、WiFi、寄存、客服等）。',
      parameters: {
        type: 'object',
        properties: { type: { type: 'string', description: '设施类型关键词，如“停车”“寄存”“母婴”' } },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_service',
      description: '查询商场服务（礼品包装、退换货、退税、童车租赁、会员等）。',
      parameters: {
        type: 'object',
        properties: { type: { type: 'string', description: '服务类型关键词' } },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_faq',
      description: '查询常见问题（营业时间、停车收费、宠物政策、发票、支付方式等）。',
      parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: '问题主题关键词' } },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_traffic',
      description: '查询 BFC 各时段客流冷热，给出高峰与清静时段建议。',
      parameters: {
        type: 'object',
        properties: { store_name: { type: 'string', description: '可选，指定店铺名时给出该店热度' } },
        required: [],
      },
    },
  },
]

// ---------------------------------------------------------------------------
// 执行器（在 Worker 中运行）
// ---------------------------------------------------------------------------
export function executeTool(name: string, args: Record<string, any>, userText?: string): ToolResult {
  switch (name) {
    case 'search_stores': {
      // 预算：优先用模型传参；缺省时从用户原话兜底解析（"预算500 / 500元"）
      let budget = args.budget_max != null ? Number(args.budget_max) : undefined
      if (budget == null && userText) {
        const m = String(userText).match(/(?:预算|人均|控制在)\D{0,4}(\d{2,5})|(\d{2,5})\s*(?:元|块|块钱)/)
        const n = m ? Number(m[1] || m[2]) : NaN
        if (!Number.isNaN(n) && n > 0) budget = n
      }
      // 人数：优先用模型传参；缺省时从用户原话兜底解析（"一个人/2个人/两位"）
      let people = args.people != null ? Number(args.people) : undefined
      if (people == null && userText) {
        const ut = String(userText)
        const m = ut.match(/(\d{1,2})\s*(?:个)?\s*(?:人|位)/)
        if (m) people = Number(m[1])
        else if (/一个人|独自|单人|就我自己|自己吃/.test(ut)) people = 1
        else {
          const cn: Record<string, number> = { 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }
          for (const [w, n] of Object.entries(cn)) {
            if (new RegExp(`${w}\\s*(?:个)?\\s*(?:人|位)`).test(ut)) { people = n; break }
          }
        }
      }
      // 餐饮意图强制只返回餐饮品类：显式 food_only、query 含吃、或用户原话含吃，任一即生效
      const foodOnly =
        args.food_only === true ||
        /(好吃|美食|餐厅|吃饭|就餐|用餐|吃货|吃什么|想吃|下馆子|觅食|饭馆|大餐|便饭|吃顿|吃啥|哪里吃|聚餐|宴请|吃口|整点吃的|吃点|吃东西|饿了|找个吃的|来点吃的)/.test(String(args.query || '')) ||
        /(好吃|美食|餐厅|吃饭|就餐|用餐|吃货|吃什么|想吃|下馆子|觅食|饭馆|大餐|便饭|吃顿|吃啥|哪里吃|聚餐|宴请|吃口|整点吃的|吃点|吃东西|饿了|找个吃的|来点吃的)/.test(String(userText || ''))
      const ranked = STORES.map(s => ({ s, sc: scoreStore(s, {
        query: args.query,
        category: args.category,
        budgetMax: budget,
        occasion: args.occasion,
        people,
        foodOnly,
      }) }))
        .filter(x => x.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .slice(0, 5)
      const data = ranked.map(x => toStoreCard(x.s))
      return { kind: 'stores', data }
    }
    case 'get_store_detail': {
      const s = findStore(String(args.name ?? ''))
      if (!s) return { kind: 'none', data: null }
      return { kind: 'stores', data: [toStoreCard(s)] }
    }
    case 'compare_stores': {
      const a = findStore(String(args.a ?? ''))
      const b = findStore(String(args.b ?? ''))
      if (!a || !b) return { kind: 'none', data: null }
      return { kind: 'compare', data: [toStoreCard(a), toStoreCard(b)] }
    }
    case 'get_facility': {
      const r = matchKb(FACILITIES, String(args.type ?? ''))
      return r ?? { kind: 'none', data: null }
    }
    case 'get_service': {
      const r = matchKb(SERVICES, String(args.type ?? ''))
      return r ?? { kind: 'none', data: null }
    }
    case 'get_faq': {
      const r = matchKb(FAQ, String(args.topic ?? ''))
      return r ?? { kind: 'none', data: null }
    }
    case 'get_traffic': {
      const peak = [...HOURLY_TRAFFIC].sort((a, b) => b.visitors - a.visitors)[0]
      const quiet = [...HOURLY_TRAFFIC].sort((a, b) => a.visitors - b.visitors)[0]
      const mentioned = args.store_name ? findStore(String(args.store_name)) : null
      const line = mentioned
        ? `「${mentioned.name}」热度约 ${(mentioned.heatmap * 100).toFixed(0)}%。`
        : ''
      const text = `${line}BFC 全天客流通常 ${peak.hour} 最旺、${quiet.hour} 相对清静。想避开人潮建议 ${quiet.hour} 前后前往，想热闹则 ${peak.hour} 来。`
      return { kind: 'info', data: { title: '客流冷热', text } }
    }
    default:
      return { kind: 'none', data: null }
  }
}

function matchKb(
  items: { id: string; title: string; category: any; content: string; keywords: string[] }[],
  q: string,
): ToolResult | null {
  const t = q.trim().toLowerCase()
  if (!t) return null
  const hit =
    items.find(i => i.title.toLowerCase() === t) ??
    items.find(i => i.keywords.some(k => k.toLowerCase().includes(t) || t.includes(k.toLowerCase()))) ??
    items.find(i => i.content.toLowerCase().includes(t))
  if (!hit) return null
  return { kind: 'info', data: { title: hit.title, text: hit.content } }
}
