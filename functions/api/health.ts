// Cloudflare Pages Function —— 健康检查（/api/health）
import { handleAgent, type Env } from '../../agent-core/agent'

interface PagesContext {
  request: Request
  env: Env
  waitUntil(p: Promise<unknown>): void
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return handleAgent(context.request, context.env, context)
}
