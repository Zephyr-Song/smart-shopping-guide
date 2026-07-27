// 小助手 Agent —— 离线推理引擎（无需后端 / API key）
// 输入用户自然语言 + 对话上下文，输出一条助手消息（文本 + 富卡片）并更新上下文。
//
// 设计目标：像小红书式对话导购一样，能听懂口语化的购物问题，基于 BFC 真实数据
// （STORES / CATEGORIES / HOURLY_TRAFFIC）给出可解释的推荐，并支持多轮追问。

import { STORES, CATEGORIES, HOURLY_TRAFFIC } from '../../data/mockData'
import type { Store } from '../../data/mockData'
import type { AgentContext, AgentMessage, StoreCardData } from './agentTypes'
import { searchKb } from '../../agent-kb'

// ---------------------------------------------------------------------------
// 词典与映射
// ---------------------------------------------------------------------------

/** 文本关键词 -> 店铺品类 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  咖啡茶饮: ['咖啡', 'coffee', '茶饮', '奶茶', 'tea', '喝一杯', '拿铁', '美式'],
  精致餐饮: ['正餐', '本帮', '上海菜', '米其林', '西餐', '精致', '餐厅', '好吃', '吃货', '美食', '吃饭', '宴', '法餐', '日料', '牛排'],
  品质中餐: ['中餐', '火锅', '家常', '川菜', '粤菜', '烤鸭', '中式', '小炒'],
  网红餐饮: ['网红', '打卡', '拍照', '探店', '热门餐厅', '出片'],
  快餐轻食: ['快餐', '轻食', '简餐', '便餐', '沙拉', '三明治', '随便吃', '填饱肚子'],
  茶馆SPA: ['茶', 'spa', 'SPA', '按摩', '养生', '放松', '足疗', '推拿', '采耳'],
  珠宝配饰: ['珠宝', '首饰', '钻戒', '项链', '配饰', '戒指', '黄金', '奢侈品'],
  国际精品: ['奢侈', '高定', '设计师', '包', '买手', '国际品牌', '精品店', '大牌', 'lv', 'gucci', 'hermes', '香奈儿', 'chanel', 'dior'],
  潮流品牌: ['潮牌', '潮流', '小众', '设计师品牌', '穿搭', '衣服', '服饰', '女装', '男装', '买衣服', '球鞋'],
  运动时尚: ['运动', '健身', '瑜伽', '运动服', '跑鞋', '运动鞋', '潮鞋'],
  运动健身: ['健身', '瑜伽馆', '撸铁', '游泳', '攀岩'],
  宠物服务: ['宠物', '猫', '狗', '萌宠', '撸猫', '狗狗', '宠物店'],
  文创杂货: ['文创', '杂货', '手作', '周边', '礼物', '礼品', '盲盒', '香薰', '文具', '手信'],
  科技数码: ['数码', '手机', '科技', '3c', '电脑', '相机', '耳机', 'ipad'],
  美容美发: ['美容', '美发', '美甲', '造型', '理发', '护肤', '医美'],
  汽车体验: ['汽车', '试驾', '车', '新能源', '展车'],
  生活方式: ['家居', '香氛', '生活', '家居店', '买手店', '买手'],
  便利生活: ['便利', '超市', '药店', '日常', '便利店'],
}

/** 场景 -> 偏好的品类 + 一句话理由 */
const OCCASION_MAP: Record<string, { cats: string[]; note: string }> = {
  约会: { cats: ['精致餐饮', '茶馆SPA', '咖啡茶饮', '国际精品'], note: '约会氛围感拉满' },
  送礼: { cats: ['珠宝配饰', '国际精品', '文创杂货', '生活方式'], note: '体面又好送的礼物' },
  带娃: { cats: ['宠物服务', '运动健身', '生活方式', '品质中餐'], note: '带娃也能轻松逛' },
  聚会: { cats: ['网红餐饮', '咖啡茶饮', '潮流品牌', '文创杂货'], note: '朋友聚会的热闹去处' },
  商务: { cats: ['精致餐饮', '国际精品', '咖啡茶饮'], note: '适合商务宴请' },
  单人: { cats: ['咖啡茶饮', '文创杂货', '快餐轻食', '科技数码'], note: '一个人也逛得舒服' },
}

const OCCASION_KEYWORDS: Record<string, string[]> = {
  约会: ['约会', '情侣', '女朋友', '男朋友', 'crush', '表白', '浪漫', '对象'],
  送礼: ['送礼', '礼物', '礼品', '送人', '送妈妈', '送女友', '送朋友', '伴手礼', '生日礼物', '送爸爸'],
  带娃: ['带娃', '亲子', '孩子', '小孩', '宝宝', '遛娃', '家庭'],
  聚会: ['聚会', '朋友', '闺蜜', '兄弟', '团建', '派对', '轰趴', '社交'],
  商务: ['商务', '同事', '客户', '宴请', '谈事', '开会', '老板', '应酬'],
  单人: ['一个人', '独自', '自己逛', '独处', ' solo'],
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function uid(prefix = 'a'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function catOf(category: string) {
  return CATEGORIES.find(c => c.name === category)
}

function toStoreCard(store: Store, reason?: string, matchPercent?: number): StoreCardData {
  const cat = catOf(store.category)
  return {
    type: 'store',
    storeId: store.id,
    name: store.name,
    category: store.category,
    icon: cat?.icon,
    color: cat?.color,
    rating: store.rating,
    floor: store.floor,
    avgPrice: store.avgPrice,
    heatmap: store.heatmap,
    reason,
    matchPercent,
  }
}

/** 识别预算区间（返回 [min, max]，无信号返回 null） */
function detectBudget(text: string): [number, number] | null {
  const m = text.match(/(?:预算|人均|花费|大概|约|控制在)\D{0,4}(\d{2,5})|(\d{2,5})\s*(?:元|块|rmb|RMB)/i)
  const num = m ? Number(m[1] || m[2]) : null
  if (num && !Number.isNaN(num)) {
    if (num <= 200) return [0, 200]
    if (num <= 1000) return [0, 1000]
    if (num <= 5000) return [0, 5000]
    return [0, 99999]
  }
  if (/便宜|实惠|性价比|划算|省钱|平替/.test(text)) return [0, 200]
  if (/中档|适中|中等|正常消费|日常/.test(text)) return [200, 1000]
  if (/高档|高端|轻奢|奢华|贵一点|品质|不将就/.test(text)) return [1000, 5000]
  if (/不差钱|随便|不设限|顶配|闭眼入/.test(text)) return [0, 99999]
  return null
}

function detectCategories(text: string): string[] {
  const hit: string[] = []
  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keys.some(k => text.includes(k))) hit.push(cat)
  }
  return hit
}

function detectOccasion(text: string): string | null {
  for (const [occ, keys] of Object.entries(OCCASION_KEYWORDS)) {
    if (keys.some(k => text.toLowerCase().includes(k.toLowerCase()))) return occ
  }
  return null
}

/** 在文本中找到一个被提及的店铺（优先长名，避免误匹配短词） */
function findMentionedStore(text: string): Store | null {
  const sorted = [...STORES].sort((a, b) => b.name.length - a.name.length)
  for (const s of sorted) {
    if (s.name.length >= 2 && text.includes(s.name)) return s
  }
  return null
}

/** 代词消解：它 / 这家 / 刚才那家 / 上一家 -> 上下文里的上一店铺 */
function pronounStore(text: string, ctx: AgentContext): Store | null {
  if (/(它|这家|那家|刚才|上一家|刚刚|这间|那间)/.test(text) && ctx.lastStoreId) {
    return STORES.find(s => s.id === ctx.lastStoreId) || null
  }
  return null
}

// ---------------------------------------------------------------------------
// 评分（核心推荐逻辑）
// ---------------------------------------------------------------------------

interface Scored {
  store: Store
  score: number
  reasons: string[]
}

function scoreStores(opts: {
  categories: string[]
  occasion: string | null
  budget: [number, number] | null
  text: string
}): Scored[] {
  const { categories, occasion, budget, text } = opts
  const occasionCats = occasion ? OCCASION_MAP[occasion]?.cats || [] : []

  const scored: Scored[] = STORES.map(store => {
    let score = 0
    const reasons: string[] = []

    if (categories.includes(store.category)) {
      score += 5
      reasons.push('品类契合')
    }
    if (occasionCats.includes(store.category)) {
      score += 4
      reasons.push(OCCASION_MAP[occasion!].note)
    }
    // 标签匹配
    const tagHits = store.tags.filter(tag => text.includes(tag))
    if (tagHits.length) {
      score += tagHits.length * 2
      reasons.push(`标签命中：${tagHits.join('、')}`)
    }
    // 预算
    if (budget) {
      const [min, max] = budget
      if (store.avgPrice >= min && store.avgPrice <= max) {
        score += 3
        reasons.push('预算合适')
      } else {
        score -= 3
      }
    }
    if (store.rating >= 4.6) {
      score += 2
      if (!reasons.includes('高分店铺')) reasons.push('高分店铺')
    }
    score += store.heatmap * 3

    return { store, score, reasons }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
}

function buildReason(s: Scored): string {
  if (s.reasons.length) return s.reasons.slice(0, 2).join('，')
  if (s.store.rating >= 4.5) return `高评分（${s.store.rating}分）`
  if (s.store.heatmap >= 0.8) return 'BFC 热门店铺'
  return '综合匹配推荐'
}

function budgetStyleFromRange([, max]: [number, number]): string {
  if (max <= 200) return '精打细算'
  if (max <= 1000) return '适中消费'
  if (max <= 5000) return '品质消费'
  return '不设上限'
}

// ---------------------------------------------------------------------------
// 各类意图的回复构造（统一返回 { reply, newCtx }）
// ---------------------------------------------------------------------------

type Reply = { reply: AgentMessage; newCtx: AgentContext }

function recommendReply(text: string, ctx: AgentContext): Reply {
  const categories = detectCategories(text)
  const occasion = detectOccasion(text)
  const budget = detectBudget(text)

  // 信号不足：引导用户补充
  if (categories.length === 0 && !occasion && !budget) {
    const cats = CATEGORIES.slice(0, 8).map(c => ({
      type: 'category' as const,
      name: c.name,
      icon: c.icon,
      color: c.color,
      count: STORES.filter(s => s.category === c.name).length,
    }))
    return {
      reply: {
        id: uid(),
        role: 'assistant',
        text: '你想找哪一类呀？我可以按餐饮、购物、休闲来帮你挑～也可以直接说场景，比如「约会」「带娃」「送礼」。',
        cards: cats,
      },
      newCtx: ctx,
    }
  }

  const scored = scoreStores({ categories, occasion, budget, text })
  const top = scored.slice(0, 4)
  const cards: StoreCardData[] = top.map(s => {
    const maxScore = top[0].score || 1
    const match = Math.min(99, Math.round((s.score / maxScore) * 100))
    return toStoreCard(s.store, buildReason(s), match)
  })

  const bits: string[] = []
  if (occasion) bits.push(occasion + '场景')
  if (categories.length) bits.push('偏好「' + categories.join('、') + '」')
  if (budget) {
    const lo = budget[0] === 0 ? '' : budget[0] + '-'
    const hi = budget[1] >= 99999 ? '不限' : budget[1] + '元'
    bits.push('预算 ' + lo + hi)
  }

  const joined = bits.join('，')
  const lead = bits.length
    ? '根据你的想法（' + joined + '），我挑了 ' + cards.length + ' 家最合适的好去处 👇'
    : '我帮你挑了几家 BFC 里挺不错的去处 👇'
  const newCtx: AgentContext = {
    ...ctx,
    lastCategory: categories[0],
    lastOccasion: occasion || ctx.lastOccasion,
    profile: {
      ...ctx.profile,
      budgetStyle: budget ? budgetStyleFromRange(budget) : ctx.profile?.budgetStyle,
    },
  }
  if (cards[0]) {
    newCtx.lastStoreId = cards[0].storeId
    newCtx.lastStoreName = cards[0].name
  }

  return { reply: { id: uid(), role: 'assistant', text: lead, cards }, newCtx }
}

function storeInfoReply(store: Store, opinion: boolean): Reply {
  const reason = store.rating >= 4.6 ? `评分高达 ${store.rating}，口碑很稳` : `评分 ${store.rating}，可以去看看`
  const text = opinion
    ? `「${store.name}」${store.description}。${reason}，值得一去～`
    : `「${store.name}」${store.description}。人均约 ¥${store.avgPrice.toLocaleString()}，热度 ${(store.heatmap * 100).toFixed(0)}%。`
  return {
    reply: { id: uid(), role: 'assistant', text, cards: [toStoreCard(store, reason)] },
    newCtx: { lastStoreId: store.id, lastStoreName: store.name },
  }
}

function navigationReply(store: Store): Reply {
  const text = `「${store.name}」在 ${store.floor} 📍 你可以从 BFC 主中庭乘直梯直达，或者跟着楼层指示牌走。需要我顺路推荐附近的咖啡或餐厅吗？`
  return {
    reply: { id: uid(), role: 'assistant', text, cards: [toStoreCard(store, `位于 ${store.floor}`)] },
    newCtx: { lastStoreId: store.id, lastStoreName: store.name },
  }
}

function trafficReply(_text: string, mentioned: Store | null): Reply {
  const peak = [...HOURLY_TRAFFIC].sort((a, b) => b.visitors - a.visitors)[0]
  const quiet = [...HOURLY_TRAFFIC].sort((a, b) => a.visitors - b.visitors)[0]

  if (mentioned) {
    const heat = (mentioned.heatmap * 100).toFixed(0)
    const tip = mentioned.heatmap >= 0.8 ? '这家现在挺火的，想安静体验建议错峰～' : '这家目前相对宽松，逛起来比较舒服。'
    const text2 = `「${mentioned.name}」当前热度约 ${heat}%。${tip} 整体来看 BFC 一般 ${peak.hour} 最旺、${quiet.hour} 人少一些。`
    return {
      reply: { id: uid(), role: 'assistant', text: text2, cards: [toStoreCard(mentioned, `热度 ${heat}%`)] },
      newCtx: { lastStoreId: mentioned.id, lastStoreName: mentioned.name },
    }
  }

  const text2 = `BFC 通常 ${peak.hour} 客流最旺，${quiet.hour} 相对清静 🤫 想避开人潮，建议 ${quiet.hour} 前后去；想热闹氛围就 ${peak.hour} 来。`
  const quietStores = [...STORES].sort((a, b) => a.heatmap - b.heatmap).slice(0, 3)
  const cards: StoreCardData[] = quietStores.map(s => toStoreCard(s, `当前热度 ${(s.heatmap * 100).toFixed(0)}%`))
  return { reply: { id: uid(), role: 'assistant', text: text2, cards }, newCtx: {} }
}

function compareReply(a: Store, b: Store): Reply {
  const pick = (x: Store, y: Store) => (x.rating > y.rating ? x.name : y.name)
  const text = `帮你对比一下：「${a.name}」人均 ¥${a.avgPrice.toLocaleString()}、评分 ${a.rating}；「${b.name}」人均 ¥${b.avgPrice.toLocaleString()}、评分 ${b.rating}。${pick(a, b)} 评分更高，${a.avgPrice < b.avgPrice ? a.name : b.name} 更划算，看你更看重哪点～`
  return {
    reply: {
      id: uid(),
      role: 'assistant',
      text,
      cards: [{ type: 'compare', stores: [toStoreCard(a), toStoreCard(b)] }],
    },
    newCtx: { lastStoreId: a.id, lastStoreName: a.name },
  }
}

function helpReply(): Reply {
  const text =
    '我是 BFC 导购助手 ✨ 我能帮你：\n· 按场景/品类/预算推荐店铺（如「约会去哪吃」「预算500吃什么」）\n· 查店铺位置与楼层（「老吉堂在几楼」）\n· 看实时客流冷热（「现在人少吗」）\n· 对比两家店（「A 和 B 哪个好」）\n· 引导你做完整画像拿专属推荐\n直接说人话就行，不用客气～'
  return {
    reply: {
      id: uid(),
      role: 'assistant',
      text,
      cards: [{ type: 'action', label: '🧭 去智能导购做完整画像', to: '/guide' }],
    },
    newCtx: {},
  }
}

function profileReply(): Reply {
  return {
    reply: {
      id: uid(),
      role: 'assistant',
      text: '好主意！完成 30 秒画像（年龄 / 客群 / 同行人 / 目的 / 预算），系统会用多维匹配算法给你专属推荐～我帮你打开：',
      cards: [{ type: 'action', label: '🧭 打开智能导购', to: '/guide' }],
    },
    newCtx: {},
  }
}

function fallbackReply(): Reply {
  const text =
    '这个问题我还在学习 🤔 不过关于 BFC 逛吃逛买，我可以帮你推荐店铺、查位置、看客流。你可以试试问我：\n· “带娃去哪里合适”\n· “哪里能喝精品咖啡”\n· “现在商场人少吗”'
  return { reply: { id: uid(), role: 'assistant', text }, newCtx: {} }
}

// ---------------------------------------------------------------------------
// 知识问答：活动 / 展览 / 打卡机位 / 品牌导购 / 宠物友好 / 夜生活 / 餐厅详情
// 检索已接入 Notion 知识库的本地镜像（src/agent-kb/webContent.ts），无需联网。
// ---------------------------------------------------------------------------

const KB_LEAD: Record<string, string> = {
  '活动': 'BFC 近期有这些活动可以逛 👇',
  '展览': 'BFC 这边的艺术展览 👇',
  '打卡攻略': 'BFC 这几处很出片 / 好打卡 📸',
  '品牌导购': 'BFC 这些品牌 / 店铺值得逛 🛍️',
  '宠物友好': 'BFC 宠物友好好去处 🐾',
  '夜生活': 'BFC 夜生活去处 🌙',
  '餐厅信息': '这几家餐厅你可以看看 🍽️',
}

/** 当问题命中知识库（活动/展览/打卡/品牌/宠物/夜生活/餐厅详情）时，用检索结果组织回答 */
function knowledgeReply(text: string, ctx: AgentContext): Reply | null {
  const hits = searchKb(text, 8).filter(h => h.score > 0)
  if (!hits.length) return null
  const seen = new Set<string>()
  const top = hits
    .filter(h => {
      if (seen.has(h.item.title)) return false
      seen.add(h.item.title)
      return true
    })
    .slice(0, 5)
  const cats = top.map(h => h.item.category)
  const leadCat =
    (['活动', '展览', '打卡攻略', '品牌导购', '宠物友好', '夜生活'] as const).find(c => cats.includes(c)) ||
    '餐厅信息'
  const lines = top.map(h => {
    const one = h.item.content.length > 48 ? h.item.content.slice(0, 46) + '…' : h.item.content
    return `· ${h.item.title}（${h.item.category}）：${one}`
  })
  const replyText =
    `${KB_LEAD[leadCat]}\n${lines.join('\n')}\n\n（信息来自公开采集，以门店 / 官方实时为准）`
  return { reply: { id: uid(), role: 'assistant', text: replyText }, newCtx: ctx }
}

/** 店铺被点名且问电话/营业时间时，从知识库补全详情 */
function storeDetailReply(store: Store, text: string): Reply | null {
  if (!/电话|营业时间|几点开|几点营业|什么时候开|几点关门|营业吗/.test(text)) return null
  const detail = searchKb(store.name, 5).find(h => h.score > 0 && /电话|营业时间/.test(h.item.content))
  if (!detail) return null
  const text2 = `「${store.name}」${detail.item.content.replace(/｜/g, '，')}。`
  return {
    reply: { id: uid(), role: 'assistant', text: text2, cards: [toStoreCard(store)] },
    newCtx: { lastStoreId: store.id, lastStoreName: store.name },
  }
}

// ---------------------------------------------------------------------------
// 入口：意图识别 + 分发
// ---------------------------------------------------------------------------

export function runAgent(input: string, ctx: AgentContext): { reply: AgentMessage; newCtx: AgentContext } {
  const text = input.trim()

  // 1. 问候
  if (/^(你好|您好|hi|hello|嗨|在吗|在不在|哈喽)$/i.test(text) || (/^(你好|您好|hi|hello|嗨|哈喽)/i.test(text) && text.length <= 12)) {
    return {
      reply: { id: uid(), role: 'assistant', text: '你好呀～我是 BFC 导购助手。想找好吃的、挑礼物，还是看今天哪家店人少？直接说就行 😊' },
      newCtx: ctx,
    }
  }
  // 2. 能力说明
  if (/怎么用|你能|你会|帮我做什么|有什么用|功能|干嘛的|你是谁/.test(text)) return helpReply()
  // 3. 画像
  if (/测一测|画像|我是谁|我的类型|完善|专属推荐|推荐引擎/.test(text)) return profileReply()

  // 4. 店铺相关（提及店名或代词）
  const mentioned = findMentionedStore(text) || pronounStore(text, ctx)
  if (mentioned) {
    const detail = storeDetailReply(mentioned, text)
    if (detail) return detail
    if (/在哪|怎么去|楼层|位置|路线|怎么走|几楼|怎么到/.test(text)) return navigationReply(mentioned)
    if (/人少|人多|清静|安静|不挤|冷清|客流|热闹|现在.*人|营业/.test(text)) return trafficReply(text, mentioned)
    if (/怎么样|好吗|评价|评分|推荐吗|值得|行不行|靠不靠谱/.test(text)) return storeInfoReply(mentioned, true)
    return storeInfoReply(mentioned, false)
  }

  // 5. 对比（文本里出现两个店名 + 比较词）
  const allMentioned = STORES.filter(s => s.name.length >= 2 && text.includes(s.name))
  if (allMentioned.length >= 2 && /(对比|比较|vs|还是|哪个好|选哪个|和.*比|跟.*比)/.test(text)) {
    return compareReply(allMentioned[0], allMentioned[1])
  }

  // 6. 客流 / 冷热
  if (/人少|清静|安静|不挤|人不多|冷清|客流|人多|热闹|几点|什么时候|现在.*人|营业时间/.test(text)) {
    return trafficReply(text, null)
  }

  // 7. 知识问答（活动 / 展览 / 打卡 / 品牌 / 宠物 / 夜生活 / 餐厅详情）—— 优先于泛推荐
  if (/活动|展览|机位|出片|拍照|探店|品牌|旗舰店|买手|市集|音乐节|演艺|宠物|夜生活|酒吧|电话|营业时间|几点开|什么时候开|几点营业/.test(text)) {
    const r = knowledgeReply(text, ctx)
    if (r) return r
  }

  // 8. 推荐类
  if (
    /推荐|选一家|选个|去哪|哪里|帮我找|帮我选|有什么.*(店|品牌|餐厅|地方|好去处)|想吃|想买|想逛|适合/.test(text) ||
    detectCategories(text).length ||
    detectOccasion(text) ||
    detectBudget(text)
  ) {
    return recommendReply(text, ctx)
  }

  // 8. 兜底
  return fallbackReply()
}
