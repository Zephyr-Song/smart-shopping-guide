// 小助手 —— 前端直连大模型（OpenAI 兼容接口，阿里云百炼 MaaS）
// 不依赖 Cloudflare Worker：浏览器直接调用。对话模型默认 qwen3.7-flash（可在 AI 设置中修改），
// 用户上传图片时先由 qwen3.5-ocr 识别为文字，再把识别结果交给对话模型理解回答。
import type { AgentCard, AgentMessage } from './agentTypes'
import { retrieve } from '../../agent-kb'
import { buildSystemPrompt } from '../../agent-kb/prompt'
import { TOOL_DEFS, executeTool, type ToolResult } from '../../agent-kb/tools'
import { getApiKey, getBaseUrl, getModel, ocrImage } from '../../services/aiGuide'

export interface AgentReplyData {
  answer: string
  cards?: AgentCard[]
}

// 工具调用是否可用（部分 Key/模型未开通 function calling，实测会返回 403）。
// 首次失败后置为 false，后续消息直接走纯对话，避免每条消息都白跑一次失败请求。
let toolsSupported = true
const MAX_TOKENS_TOOL = 300
const MAX_TOKENS_ANSWER = 600

/** 清洗模型偶发混入的非预期外文（如西里尔字母/俄文），保留中文、拉丁字母、数字与 emoji */
function sanitizeAnswer(text: string): string {
  return text.replace(/[\u0400-\u04FF\u0500-\u052F\uA640-\uA69F]/g, '')
}

function collectCards(r: ToolResult, cards: AgentCard[]) {
  if (r.kind === 'stores') {
    for (const c of r.data) cards.push(c)
  } else if (r.kind === 'compare') {
    cards.push({ type: 'compare', stores: r.data })
  }
}

async function llmChat(
  messages: unknown[],
  opts: { withTools: boolean },
  signal?: AbortSignal,
): Promise<any> {
  const base = getBaseUrl().trim().replace(/\/+$/, '')
  if (!base) throw new Error('未配置 API Base URL')
  const url = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`
  const body: Record<string, unknown> = {
    model: getModel(),
    messages,
    temperature: 0.3,
    stream: false,
    max_tokens: opts.withTools ? MAX_TOKENS_TOOL : MAX_TOKENS_ANSWER,
  }
  if (opts.withTools) {
    body.tools = TOOL_DEFS
    body.tool_choice = 'auto'
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getApiKey()}` },
      body: JSON.stringify(body),
      signal,
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('请求超时')
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
    throw new Error(msg)
  }
  return res.json()
}

/** agent loop：带工具调用（search_stores 等）跑多轮；工具不可用时降级为纯对话 */
async function runAgentLoop(
  initialMessages: unknown[],
  lastUser: string,
  signal?: AbortSignal,
): Promise<{ answer: string; cards: AgentCard[] }> {
  const cards: AgentCard[] = []
  const msgs = initialMessages.map(m => ({ ...(m as object) }))

  // 该 Key/模型未开通 function calling 时（实测 403），直接走纯对话，避免无效失败请求
  if (!toolsSupported) {
    const data = await llmChat(initialMessages, { withTools: false }, signal)
    const msg = data?.choices?.[0]?.message
    if (!msg?.content) throw new Error('模型无返回')
    return { answer: sanitizeAnswer(msg.content), cards: [] }
  }

  try {
    for (let i = 0; i < 3; i++) {
      const data = await llmChat(msgs, { withTools: true }, signal)
      const msg = data?.choices?.[0]?.message
      if (!msg) throw new Error('模型无返回')
      const toolCalls = msg.tool_calls
      if (Array.isArray(toolCalls) && toolCalls.length) {
        msgs.push(msg)
        for (const tc of toolCalls) {
          let args: Record<string, any> = {}
          try {
            args = JSON.parse(tc.function?.arguments || '{}')
          } catch {
            args = {}
          }
          const result = executeTool(tc.function?.name || '', args, lastUser)
          collectCards(result, cards)
          msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
        }
      } else {
        return { answer: sanitizeAnswer(msg.content || ''), cards }
      }
    }
  } catch (e) {
    // 带工具调用失败（如模型未开通 function calling）→ 记住并降级为纯对话再试一次
    toolsSupported = false
    const data = await llmChat(initialMessages, { withTools: false }, signal)
    const msg = data?.choices?.[0]?.message
    if (msg?.content) return { answer: sanitizeAnswer(msg.content), cards: [] }
    throw e
  }
  throw new Error('模型未能在限定轮数内完成回答')
}

/**
 * 调用小助手：图片先 OCR（qwen3.5-ocr）识别文字 → 拼进用户消息 →
 * 检索知识库注入系统提示 → qwen3.7-flash 带工具 agent loop 回答。
 */
export async function callAgent(
  messages: AgentMessage[],
  opts?: { timeoutMs?: number; imageDataUrl?: string },
): Promise<AgentReplyData> {
  const last = messages[messages.length - 1]
  let userContent = (last?.text ?? '').trim()

  if (opts?.imageDataUrl) {
    try {
      const ocrText = await ocrImage(opts.imageDataUrl)
      if (ocrText.trim()) {
        userContent = userContent
          ? `${userContent}\n[图片内容]：${ocrText.trim()}`
          : `[图片内容]：${ocrText.trim()}`
      }
    } catch (e) {
      userContent = userContent
        ? `${userContent}\n[⚠️ 图片识别失败：${(e as Error).message}]`
        : `[⚠️ 图片识别失败：${(e as Error).message}]`
    }
  }

  const kbContext = retrieve(userContent, 4)
  const system = buildSystemPrompt(kbContext)
  const chatMessages = [
    { role: 'system', content: system },
    ...messages.slice(0, -1).map(m => ({ role: m.role, content: m.text ?? '' })),
    { role: 'user', content: userContent },
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 45000)
  try {
    return await runAgentLoop(chatMessages, userContent, controller.signal)
  } finally {
    clearTimeout(timer)
  }
}
