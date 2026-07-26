// 小助手 —— 前端调用 Cloudflare Worker 的客户端
// 仅在设置了 VITE_AGENT_API_URL 时启用真·LLM agent；否则 AgentAssistant 会回退到离线规则引擎。
import type { AgentCard, AgentMessage } from './agentTypes'

export const AGENT_API_URL: string =
  ((import.meta as any).env?.VITE_AGENT_API_URL as string | undefined)?.replace(/\/+$/, '') ?? ''

export interface AgentReply {
  answer: string
  cards?: AgentCard[]
}

export async function callAgent(
  messages: AgentMessage[],
  opts?: { timeoutMs?: number },
): Promise<AgentReply> {
  if (!AGENT_API_URL) throw new Error('AGENT_API_URL not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 8000)
  try {
    const res = await fetch(`${AGENT_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.text })),
      }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`agent http ${res.status}`)
    const data = await res.json()
    return { answer: data.answer ?? '', cards: data.cards }
  } finally {
    clearTimeout(timer)
  }
}
