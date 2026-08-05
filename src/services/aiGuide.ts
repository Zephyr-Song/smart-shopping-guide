// ============================================================
// BFC AI 导购服务层（可配置大模型）
// 支持任意 OpenAI 兼容接口：DeepSeek / 阿里云 MaaS / 自定义。
// - API Key / Base URL / 模型名 仅存浏览器 localStorage，不进入代码/仓库
// - 浏览器直连（已验证 DeepSeek 与阿里云 MaaS 均支持 CORS），纯前端可跑于 GitHub Pages
// - 任何失败（无 Key / 网络 / 401 / 解析失败）由调用方回退到规则推荐
// ============================================================

import type { Store, UserProfile } from '../data/mockData'

const KEY_STORAGE = 'bfc_ai_key'
const BASEURL_STORAGE = 'bfc_ai_baseurl'
const MODEL_STORAGE = 'bfc_ai_model'

export type ProviderId = 'deepseek' | 'alibaba' | 'custom'

export interface ProviderPreset {
  id: ProviderId
  label: string
  baseUrl: string
  defaultModel: string
  docUrl?: string
  docLabel?: string
}

// 预设服务商（选择后自动填入 Base URL 与默认模型，字段仍可手改）
export const PROVIDERS: ProviderPreset[] = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    docUrl: 'https://platform.deepseek.com',
    docLabel: 'platform.deepseek.com',
  },
  {
    id: 'alibaba',
    label: '阿里云 MaaS（DashScope 兼容）',
    baseUrl:
      'https://ws-rpz6r7sem6fuiceu.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions',
    defaultModel: 'qwen-plus',
    docUrl: 'https://help.aliyun.com/zh/model-studio',
    docLabel: '阿里云百炼',
  },
  {
    id: 'custom',
    label: '自定义 OpenAI 兼容',
    baseUrl: '',
    defaultModel: '',
  },
]

// ---------- 配置读写 ----------
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
    /* ignore */
  }
}

export function getBaseUrl(): string {
  try {
    return localStorage.getItem(BASEURL_STORAGE) || ''
  } catch {
    return ''
  }
}
export function setBaseUrl(url: string): void {
  try {
    if (url && url.trim()) localStorage.setItem(BASEURL_STORAGE, url.trim())
    else localStorage.removeItem(BASEURL_STORAGE)
  } catch {
    /* ignore */
  }
}

export function getModel(): string {
  try {
    return localStorage.getItem(MODEL_STORAGE) || ''
  } catch {
    return ''
  }
}
export function setModel(model: string): void {
  try {
    if (model && model.trim()) localStorage.setItem(MODEL_STORAGE, model.trim())
    else localStorage.removeItem(MODEL_STORAGE)
  } catch {
    /* ignore */
  }
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0
}

// 是否已具备调用条件（Key + Base URL + 模型名）
export function isAiReady(): boolean {
  return getApiKey().length > 0 && getBaseUrl().length > 0 && getModel().length > 0
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
async function callAI(messages: AiMessage[], jsonMode: boolean): Promise<string> {
  const key = getApiKey()
  const baseUrl = getBaseUrl()
  const model = getModel()

  if (!key) throw new Error('未配置 API Key')
  if (!baseUrl) throw new Error('未配置 API Base URL')
  if (!model) throw new Error('未配置模型名')

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: jsonMode ? 0.8 : 0.9,
    stream: false,
  }
  if (jsonMode) body.response_format = { type: 'json_object' }

  let res: Response
  try {
    res = await fetch(baseUrl, {
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
    let msg = `API ${res.status}`
    try {
      const err = (await res.json()) as { error?: { message?: string } }
      if (err?.error?.message) msg = err.error.message
    } catch {
      /* ignore parse error */
    }
    if (res.status === 401) msg = 'API Key 无效或已过期'
    if (res.status === 404) msg = '模型名或接口地址不正确（404）'
    throw new Error(msg)
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')
  return content
}

// 容错解析：先直接解析，失败则剥离 ```json 代码块围栏与首尾非 JSON 字符
function parseJsonSafe<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    /* fall through */
  }
  let txt = raw.trim()
  // 去掉 ```json ... ``` 围栏
  const fence = txt.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) txt = fence[1].trim()
  const start = txt.indexOf('{')
  const end = txt.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(txt.slice(start, end + 1)) as T
    } catch {
      /* ignore */
    }
  }
  throw new Error('AI 返回格式异常，无法解析')
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

  const raw = await callAI(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    true
  )

  const parsed = parseJsonSafe<AiRecommendationResult>(raw)

  const validIds = new Set(stores.map((s) => s.id))
  parsed.picks = (parsed.picks || [])
    .filter((p) => p && validIds.has(p.storeId))
    .slice(0, 6)

  if (parsed.picks.length === 0) throw new Error('AI 未返回有效店铺')

  return parsed
}

// ---------- 追问对话 ----------
export async function askFollowUp(messages: AiMessage[]): Promise<string> {
  return callAI(messages, false)
}

// 构建追问的系统上下文（含当次画像与已推荐店铺，便于 AI 基于真实情况回答）
export function buildFollowUpSystem(profile: UserProfile, storeNames: string[]): string {
  return `你是 BFC 外滩金融中心的 AI 导购助手。当前用户画像：
- 客群：${profile.persona}｜同行：${profile.companion}｜今日目的：${profile.priority}｜预算：${profile.budgetStyle}｜兴趣：${profile.interests?.join('、') || '无'}
本次已推荐店铺：${storeNames.join('、') || '无'}。
请基于 BFC 外滩金融中心的真实业态，用中文简洁回答用户的追问，可补充具体店铺、楼层、预算建议，语气像专业又贴心的导购。`
}
