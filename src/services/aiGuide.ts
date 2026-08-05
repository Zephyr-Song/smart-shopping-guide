// ============================================================
// BFC AI 导购服务层
// 调用 DeepSeek Chat API 生成真实个性化推荐与追问对话。
// - API Key 仅存于浏览器 localStorage，不进入代码/仓库
// - 浏览器直连 DeepSeek（已验证支持 CORS），纯前端可跑于 GitHub Pages
// - 任何失败（无 Key / 网络 / 401）由调用方回退到规则推荐
// ============================================================

import type { Store, UserProfile } from '../data/mockData'

const API_URL = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'
const KEY_STORAGE = 'bfc_deepseek_key'

// ---------- Key 管理 ----------
export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) || ''
  } catch {
    return ''
  }
}
export function setApiKey(key: string): void {
  try {
    if (key && key.trim()) localStorage.setItem(KEY_STORAGE, key.trim())
    else localStorage.removeItem(KEY_STORAGE)
  } catch {
    /* localStorage 不可用时忽略 */
  }
}
export function hasApiKey(): boolean {
  return getApiKey().length > 0
}

// ---------- 类型 ----------
export interface AiPick {
  storeId: string
  reason: string
  score: number // 0-10 匹配度
}
export interface AiRecommendationResult {
  narrative: string
  picks: AiPick[]
}
export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ---------- 底层调用 ----------
async function callDeepSeek(messages: AiMessage[], jsonMode: boolean): Promise<string> {
  const key = getApiKey()
  if (!key) throw new Error('未配置 DeepSeek API Key')

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: jsonMode ? 0.8 : 0.9,
    stream: false,
  }
  if (jsonMode) body.response_format = { type: 'json_object' }

  let res: Response
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw new Error('网络请求失败（可能被 CORS 拦截或网络不通）')
  }

  if (!res.ok) {
    let msg = `DeepSeek API ${res.status}`
    try {
      const err = (await res.json()) as { error?: { message?: string } }
      if (err?.error?.message) msg = err.error.message
    } catch {
      /* ignore parse error */
    }
    if (res.status === 401) msg = 'API Key 无效或已过期'
    throw new Error(msg)
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')
  return content
}

// ---------- 生成推荐 ----------
export async function generateAiRecommendation(
  profile: UserProfile,
  stores: Store[]
): Promise<AiRecommendationResult> {
  const catalog = stores.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    floor: s.floor,
    tags: s.tags,
    avgPrice: s.avgPrice,
    rating: s.rating,
  }))

  const system = `你是 BFC 外滩金融中心（上海顶奢购物中心）的 AI 智能导购。你熟悉 BFC 的 90+ 家真实店铺，涵盖精致餐饮、国际精品、潮流品牌、宠物服务、咖啡茶饮、文创杂货等。
任务：根据用户画像，从【店铺列表】中挑选最匹配的 6 家店铺，生成一段亲切的导购语，以及每家店一句话推荐理由。
要求：
1. narrative：30-60 字，第一人称导购口吻，点出用户画像与今日需求，自然引出推荐，不要列清单。
2. picks：严格选 6 家；storeId 必须来自列表；score 为 0-10 的匹配度（可含一位小数）；reason 为 15-25 字、有画面感的一句话理由，禁止出现"契合""匹配度高"等机械词。
3. 只能输出 JSON，不要任何额外文字或 Markdown 代码块。`

  const user = `用户画像：
- 年龄段：${profile.age}
- 客群：${profile.persona}
- 同行人：${profile.companion}
- 今日目的：${profile.priority}
- 预算风格：${profile.budgetStyle}
- 兴趣标签：${profile.interests?.join('、') || '无'}

店铺列表（JSON）：
${JSON.stringify(catalog)}

请返回如下结构：
{"narrative":"...","picks":[{"storeId":"s035","reason":"...","score":9.2}]}`

  const raw = await callDeepSeek(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    true
  )

  let parsed: AiRecommendationResult
  try {
    parsed = JSON.parse(raw) as AiRecommendationResult
  } catch {
    throw new Error('AI 返回格式异常，无法解析')
  }

  const validIds = new Set(stores.map((s) => s.id))
  parsed.picks = (parsed.picks || [])
    .filter((p) => p && validIds.has(p.storeId))
    .slice(0, 6)

  if (parsed.picks.length === 0) throw new Error('AI 未返回有效店铺')

  return parsed
}

// ---------- 追问对话 ----------
export async function askFollowUp(messages: AiMessage[]): Promise<string> {
  return callDeepSeek(messages, false)
}

// 构建追问的系统上下文（含当次画像与已推荐店铺，便于 AI 基于真实情况回答）
export function buildFollowUpSystem(profile: UserProfile, storeNames: string[]): string {
  return `你是 BFC 外滩金融中心的 AI 导购助手。当前用户画像：
- 客群：${profile.persona}｜同行：${profile.companion}｜今日目的：${profile.priority}｜预算：${profile.budgetStyle}｜兴趣：${profile.interests?.join('、') || '无'}
本次已推荐店铺：${storeNames.join('、') || '无'}。
请基于 BFC 外滩金融中心的真实业态，用中文简洁回答用户的追问，可补充具体店铺、楼层、预算建议，语气像专业又贴心的导购。`
}
