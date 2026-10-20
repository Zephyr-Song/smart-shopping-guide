// Cloudflare Pages Function —— 流式导购入口（POST /api/agent/stream）
// 与 /api/agent 共用同一套检索、记忆、限流与清洗逻辑，只是把最终回答改为 SSE 推送。
// 前端用 fetch + ReadableStream 消费（EventSource 不支持 JSON 请求体）。
import { handleAgentStream, type Env } from '../../../agent-core/agent'

interface PagesContext {
  request: Request
  env: Env
  waitUntil(p: Promise<unknown>): void
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return handleAgentStream(context.request, context.env, context)
}
