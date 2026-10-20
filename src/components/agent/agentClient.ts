// 小助手 —— 前端调用 Cloudflare Pages Functions 的客户端
// 两条通道：
//   1. streamAgent  → POST /api/agent/stream（SSE，逐 token 渲染，首选）
//   2. callAgent    → POST /api/agent（非流式，流式不可用时的回退）
// 仅在设置了 VITE_AGENT_API_URL 时才会指向外部地址；默认同域。
import type { AgentCard, AgentMessage } from './agentTypes'

// 默认走同域 /api/agent（Cloudflare Pages Functions 与前端同域部署，无需跨域密钥）。
// 若要指向独立 Worker，设 VITE_AGENT_API_URL=https://xxx.workers.dev
const CONFIGURED =
  ((import.meta as any).env?.VITE_AGENT_API_URL as string | undefined)?.replace(/\/+$/, '') ?? ''
export const AGENT_API_URL: string = CONFIGURED || '/api/agent'
export const AGENT_STREAM_URL: string = `${AGENT_API_URL.replace(/\/+$/, '')}/stream`

export interface AgentReply {
  answer: string
  cards?: AgentCard[]
  route?: string
}

/** done 事件载荷：answer 是服务端最终清洗后的回答，前端以它覆盖流式原文 */
export interface StreamDone {
  requestId?: string
  reason?: string
  route?: string
  answer: string
  cards?: AgentCard[]
  sessionId?: string
  firstTokenMs?: number | null
  totalMs?: number
}

export interface StreamCallbacks {
  /** 阶段状态文案，如「正在检索 BFC 门店…」 */
  onState?: (text: string) => void
  /** 增量文本；full 为已累积全文，便于直接替换消息体 */
  onToken?: (delta: string, full: string) => void
  /** 检索到的卡片，先于正文推送 */
  onCard?: (card: AgentCard) => void
}

interface SseFrame {
  event: string
  data: any
}

function parseFrame(frame: string): SseFrame | null {
  let event = 'message'
  let data = ''
  for (const rawLine of frame.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) data += line.slice(5).trim()
  }
  if (!data) return null
  try {
    return { event, data: JSON.parse(data) }
  } catch {
    return null
  }
}

export interface StreamHttpError extends Error {
  status?: number
  code?: string
  detail?: any
}

/**
 * 流式调用导购助手。
 * 任何「没有任何 token 就失败」的情况都会抛出异常，调用方应回退到 callAgent。
 */
export async function streamAgent(
  messages: AgentMessage[],
  opts?: { sessionId?: string; signal?: AbortSignal; timeoutMs?: number } & StreamCallbacks,
): Promise<StreamDone> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 60000)
  const onOuterAbort = () => controller.abort()
  opts?.signal?.addEventListener('abort', onOuterAbort)

  let full = ''
  let done: StreamDone | null = null
  const cards: AgentCard[] = []

  try {
    const res = await fetch(AGENT_STREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.text })),
        sessionId: opts?.sessionId,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const detail = await res.json().catch(() => null)
      const err = new Error(detail?.message || `agent stream http ${res.status}`) as StreamHttpError
      err.status = res.status
      err.code = detail?.error || `http_${res.status}`
      err.detail = detail
      throw err
    }
    if (!res.body) throw new Error('agent stream: empty body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    for (;;) {
      const { done: eof, value } = await reader.read()
      if (eof) break
      buf += decoder.decode(value, { stream: true })

      let sep: number
      while ((sep = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, sep)
        buf = buf.slice(sep + 2)
        const ev = parseFrame(frame)
        if (!ev) continue

        if (ev.event === 'state') {
          if (ev.data?.text) opts?.onState?.(String(ev.data.text))
        } else if (ev.event === 'token') {
          const piece = String(ev.data?.text || '')
          if (piece) {
            full += piece
            opts?.onToken?.(piece, full)
          }
        } else if (ev.event === 'card') {
          if (ev.data?.card) {
            cards.push(ev.data.card as AgentCard)
            opts?.onCard?.(ev.data.card as AgentCard)
          }
        } else if (ev.event === 'done') {
          done = {
            ...(ev.data || {}),
            cards: Array.isArray(ev.data?.cards) && ev.data.cards.length ? ev.data.cards : cards.slice(),
          } as StreamDone
        } else if (ev.event === 'error') {
          const err = new Error(ev.data?.message || 'agent stream error') as StreamHttpError
          err.code = ev.data?.code
          err.detail = ev.data
          throw err
        }
      }
    }
  } finally {
    clearTimeout(timer)
    opts?.signal?.removeEventListener('abort', onOuterAbort)
  }

  if (!done) {
    if (!full.trim()) throw new Error('agent stream: ended without result')
    done = { reason: 'no_done_frame', answer: full, cards: cards.slice() }
  }
  return done
}

/** 非流式调用（流式通道不可用时的回退路径） */
export async function callAgent(
  messages: AgentMessage[],
  opts?: { timeoutMs?: number; sessionId?: string },
): Promise<AgentReply> {
  if (!AGENT_API_URL) throw new Error('AGENT_API_URL not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 45000)
  try {
    const res = await fetch(AGENT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.text })),
        sessionId: opts?.sessionId,
      }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`agent http ${res.status}`)
    const data = await res.json()
    const answer: string = data.answer ?? ''
    // 防御：Worker 侧异常兜底文案 / 空回答 → 视为失败，抛异常让调用方回退本地引擎
    if (!answer.trim() || /暂时连不上|稍后再试或联系客服/.test(answer)) {
      throw new Error('agent degraded answer')
    }
    return { answer, cards: data.cards, route: data.route }
  } finally {
    clearTimeout(timer)
  }
}
