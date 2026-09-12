// Cloudflare Pages Function —— 智能层入口（/api/agent）
// 薄适配层：只做转发，业务逻辑全部在共享内核 agent-core/agent.ts
// 前端与 API 同域部署，因此无需跨域密钥 AGENT_URL。
import { handleAgent, type Env } from '../../agent-core/agent'

interface PagesContext {
  request: Request
  env: Env
  waitUntil(p: Promise<unknown>): void
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return handleAgent(context.request, context.env, context)
}
