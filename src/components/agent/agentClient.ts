// 小助手 —— 前端调用 Cloudflare Worker 的客户端
// 仅在设置了 VITE_AGENT_API_URL 时启用真·LLM agent；否则 AgentAssistant 会回退到离线规则引擎。
import type { AgentCard, AgentMessage } from './agentTypes'

// 默认走同域 /api/agent（Cloudflare Pages Functions 与前端同域部署，无需跨域密钥）。
// 若要指向独立 Worker，设 VITE_AGENT_API_URL=https://xxx.workers.dev
const CONFIGURED =
  ((import.meta as any).env?.VITE_AGENT_API_URL as string | undefined)?.replace(/\/+$/, '') ?? ''
export const AGENT_API_URL: string = CONFIGURED || '/api/agent'

export interface AgentReply {
  answer: string
  cards?: AgentCard[]
  route?: string
}

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
