// Cloudflare Worker —— 小助手后端代理
// 职责：接收前端对话 → 检索商场知识库 → 调用可配置 LLM（OpenAI 兼容）带工具 →
//       跑 agent loop → 收集工具结果转前端卡片 → 返回 { answer, cards }
// 密钥放在 Worker 环境变量/机密里，绝不暴露给浏览器。

import { retrieve } from '../src/agent-kb/index'
import { buildSystemPrompt } from '../src/agent-kb/prompt'
import { TOOL_DEFS, executeTool, type ToolResult } from '../src/agent-kb/tools'
import type { AgentCard } from '../src/components/agent/agentTypes'

interface Env {
  LLM_BASE_URL: string
  LLM_API_KEY: string
  LLM_MODEL: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function collectCards(r: ToolResult, cards: AgentCard[]) {
  if (r.kind === 'stores') {
    for (const c of r.data) cards.push(c)
  } else if (r.kind === 'compare') {
    cards.push({ type: 'compare', stores: r.data })
  }
  // info / none 不单独成卡片（答案文本已覆盖）
}

async function llmChat(messages: any[], env: Env): Promise<any> {
  const base = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.LLM_MODEL || 'deepseek-chat',
      messages,
      tools: TOOL_DEFS,
      tool_choice: 'auto',
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

async function runAgentLoop(
  messages: any[],
  env: Env,
  onTool: (r: ToolResult) => void,
): Promise<string> {
  let msgs = messages.map(m => ({ ...m }))
  for (let i = 0; i < 5; i++) {
    const data = await llmChat(msgs, env)
    const msg = data?.choices?.[0]?.message
    if (!msg) return '抱歉，我这边有点忙，请稍后再试～'
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
        const result = executeTool(tc.function?.name || '', args)
        onTool(result)
        msgs.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        })
      }
    } else {
      return msg.content || ''
    }
  }
  return '抱歉，我这边有点忙，请稍后再试～'
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS })
    }
    let body: any
    try {
      body = await request.json()
    } catch {
      return new Response('Bad Request', { status: 400, headers: CORS })
    }

    const messages: { role: string; content: string }[] = Array.isArray(body?.messages)
      ? body.messages
      : []
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || ''
    const kbContext = retrieve(lastUser, 6)
    const system = buildSystemPrompt(kbContext)
    const chatMessages = [{ role: 'system', content: system }, ...messages]

    const cards: AgentCard[] = []
    try {
      const answer = await runAgentLoop(chatMessages, env, r => collectCards(r, cards))
      return new Response(JSON.stringify({ answer, cards }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      })
    } catch (e: any) {
      return new Response(
        JSON.stringify({ answer: '抱歉，智能助手暂时连不上，请稍后再试或联系客服中心 🙏', cards: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } },
      )
    }
  },
}
