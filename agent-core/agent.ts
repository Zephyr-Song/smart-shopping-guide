// 智能层共享内核 —— 由 Pages Functions 调用（部署统一走 Pages Functions）
// 架构：共享内核 + 薄适配层（functions/api/agent.ts 只做转发）。
// 注：原先还有一份独立 worker/index.ts 部署路径，已作为冗余删除，部署统一走 Pages Functions。
//
// 十步提问生命周期（对标 BFC Admin V2.0，裁剪为 serverless 可落地版）：
//   闸门(Origin+限流) → D1 记忆装配 → decider 意图决策(JSON) → 四路分流
//   → TOOL_REGISTRY(链步≤3) → replyGuard 后处理 → waitUntil 异步落库
// 返回 { answer, cards, route, sessionId }
// 密钥放在环境变量/机密里，绝不暴露给浏览器。

import { retrieveWithScore } from '../src/agent-kb/index'
import { buildSystemPrompt } from '../src/agent-kb/prompt'
import { TOOL_DEFS, executeTool, type ToolResult } from '../src/agent-kb/tools'
import { STORES } from '../src/data/mockData'
import type { AgentCard } from '../src/components/agent/agentTypes'

// 最小 D1 结构类型（避免引入 workers-types 依赖）
export interface D1Row { [k: string]: any }
export interface DB {
  prepare(sql: string): {
    bind(...v: any[]): {
      first<T = D1Row>(): Promise<T | null>
      all<T = D1Row>(): Promise<{ results?: T[] }>
      run(): Promise<unknown>
    }
  }
}

export interface Env {
  LLM_BASE_URL: string
  LLM_API_KEY: string
  LLM_MODEL: string
  LLM_MODEL_FALLBACK?: string
  DECIDER_MIN_CONFIDENCE?: string
  MEMORY_SUMMARY_EVERY?: string
  RATE_LIMIT_PER_MIN?: string
  DB?: DB
}

export interface Ctx {
  waitUntil(p: Promise<unknown>): void
}

// 同域部署（Cloudflare Pages）下浏览器请求不带 Origin；
// 本地 vite(5173) 经代理、或 wrangler pages dev(8788) 直连时需要放行。
const CORS_ALLOWED_ORIGINS = [
  'https://zephyr-song.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
  'http://localhost:8789',
  'http://127.0.0.1:8789',
  'http://localhost:8790',
  'http://127.0.0.1:8790',
]

const FALLBACK_TEXT =
  '这个问题我还需要再确认一下～你可以问我 BFC 的餐厅推荐、店铺对比、设施服务、客流冷热或者娱乐体验，我可以直接给你答案～'

const MAX_TOOL_CHAIN = 3

/** 清洗模型偶发混入的非预期外文（西里尔等），保留中文、拉丁、数字、标点与 emoji */
function sanitizeAnswer(text: string): string {
  return stripFunctionCallMarkup(
    text.replace(/[\u0400-\u04FF\u0500-\u052F\uA640-\uA69F]/g, ''),
  )
}

/**
 * 部分模型（如 dots3-note-prev）在多工具 + 长 system prompt 场景下，
 * 不走 OpenAI 的 tool_calls 结构化调用，而是把函数调用以 XML 文本吐出来，例如：
 *   <dots_function_call><invoke name="search_kb"><parameter name="query">…</parameter></invoke></dots_function_call>
 * 这类内容属于协议残留，绝不能展示给终端用户。
 */
const FN_CALL_MARKUP_RE =
  /<\s*\/?\s*(?:dots_)?function_call\b[^>]*>|<\s*\/?\s*(?:antml:)?invoke\b[^>]*>|<\s*\/?\s*(?:antml:)?parameter\b[^>]*>/i

function containsFunctionCallMarkup(text: string): boolean {
  return FN_CALL_MARKUP_RE.test(text || '')
}

/** 剔除整段 <dots_function_call>…</dots_function_call> 以及残留的 invoke/parameter 标签 */
function stripFunctionCallMarkup(text: string): string {
  return (text || '')
    .replace(/<(?:dots_)?function_call\b[^>]*>[\s\S]*?<\/(?:dots_)?function_call\s*>/gi, '')
    .replace(/<\s*\/?\s*(?:antml:)?(?:invoke|parameter)\b[^>]*>/gi, '')
    .trim()
}

/**
 * replyGuard：识别"复读式无效回答"。
 * 纯 OCR / 抽取类模型（如 qwen3.5-ocr）不生成对话内容，只会把用户原文或 system prompt
 * 原样返回（甚至包一层 ```json 代码块）。这类结果绝不能直接发给用户。
 */
function looksLikeEcho(answer: string, userText: string): boolean {
  const raw = answer.trim()
  if (!raw) return true
  const norm = (s: string) => s.replace(/[\s\p{P}\p{S}`]/gu, '').toLowerCase()
  const a = norm(raw)
  const u = norm(userText)
  if (!a) return true
  if (a.length < 6) return true
  if (a === u) return true
  if (u.includes(a) && a.length >= Math.max(4, u.length * 0.8)) return true
  if (/^```/.test(raw) || /^json/i.test(raw)) return true
  return false
}

function collectCards(r: ToolResult, cards: AgentCard[]) {
  if (r.kind === 'stores') for (const c of r.data) cards.push(c)
  else if (r.kind === 'compare') cards.push({ type: 'compare', stores: r.data })
}

async function llm(
  env: Env,
  messages: any[],
  opts?: { tools?: boolean; temperature?: number; maxTokens?: number },
): Promise<any> {
  const base = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  // 备用模型通道：主模型 403/429（未开通/限流）时自动切换
  const models = [env.LLM_MODEL || 'deepseek-chat']
  if (env.LLM_MODEL_FALLBACK && env.LLM_MODEL_FALLBACK !== models[0]) models.push(env.LLM_MODEL_FALLBACK)
  let lastErr = 'LLM request failed'
  for (const model of models) {
    const body: any = { model, messages, temperature: opts?.temperature ?? 0.3 }
    if (opts?.maxTokens) body.max_tokens = opts.maxTokens
    if (opts?.tools !== false) {
      body.tools = TOOL_DEFS
      body.tool_choice = 'auto'
    }
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.LLM_API_KEY}` },
      body: JSON.stringify(body),
    })
    if (res.ok) return res.json()
    const text = await res.text().catch(() => '')
    lastErr = `LLM ${res.status}: ${text.slice(0, 200)}`
    if (res.status !== 403 && res.status !== 429) break
  }
  throw new Error(lastErr)
}

function textOf(data: any): string {
  return data?.choices?.[0]?.message?.content ?? ''
}

/** 从 JSON 文本中稳健提取第一个完整 JSON 对象 */
function extractJson(s: string): any | null {
  const m = s.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    return JSON.parse(m[0])
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// TOOL_REGISTRY：工具注册表（链步限制 + 执行留痕）
// trace 由调用方按请求传入，避免模块级可变状态在并发请求间互相污染
// ---------------------------------------------------------------------------
const TOOL_REGISTRY = new Map(TOOL_DEFS.map(t => [t.function.name, t]))

function execTool(
  name: string,
  args: Record<string, any>,
  userText: string,
  trace: { name: string; ok: boolean }[],
): ToolResult {
  if (!TOOL_REGISTRY.has(name)) return { kind: 'none', data: null }
  const ok = trace.length < MAX_TOOL_CHAIN
  const r = ok ? executeTool(name, args, userText) : { kind: 'none', data: null }
  trace.push({ name, ok })
  return r
}

async function runAgentLoop(
  messages: any[],
  env: Env,
  onTool: (r: ToolResult) => void,
  lastUser: string,
  trace: { name: string; ok: boolean }[],
): Promise<string> {
  let msgs = messages.map(m => ({ ...m }))
  let chain = 0
  for (let i = 0; i < 5; i++) {
    const data = await llm(env, msgs, { tools: chain < MAX_TOOL_CHAIN })
    const msg = data?.choices?.[0]?.message
    if (!msg) throw new Error('empty LLM response')
    const toolCalls = msg.tool_calls
    if (Array.isArray(toolCalls) && toolCalls.length && chain < MAX_TOOL_CHAIN) {
      msgs.push(msg)
      for (const tc of toolCalls) {
        let args: Record<string, any> = {}
        try {
          args = JSON.parse(tc.function?.arguments || '{}')
        } catch {
          args = {}
        }
        chain++
        const result = execTool(tc.function?.name || '', args, lastUser, trace)
        onTool(result)
        msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
      }
    } else {
      return sanitizeAnswer(msg.content || '')
    }
  }
  throw new Error('agent loop exhausted')
}

// ---------------------------------------------------------------------------
// decider 意图决策（JSON 模式）→ 四路分流
// ---------------------------------------------------------------------------
export type Route = 'tool_call' | 'kb_rag' | 'direct' | 'fallback'
interface Decision {
  route: Route
  tool?: string
  args?: Record<string, any>
  confidence: number
}

async function decide(env: Env, recent: any[], lastUser: string): Promise<Decision | null> {
  const sys =
    '你是 BFC 导购助手的意图路由器。根据对话判断应走哪条处理路径，只输出一个 JSON 对象：\n' +
    '{"route":"tool_call|kb_rag|direct|fallback","tool":"工具名或空","args":{},"confidence":0到1的小数}\n' +
    '- tool_call：需要结构化数据或检索——找店/吃什么/推荐餐厅咖啡/涉及预算或人数的推荐/比店/设施/服务/常见问题/客流/查询某店铺信息，以及任何需要查 BFC 资料才能回答的事实问题\n' +
    '- kb_rag：关于 BFC 商圈的知识性问题——品牌或场馆的位置、楼层、介绍、娱乐业态（影城/livehouse/艺术中心/酒吧）、展览、活动\n' +
    '- direct：寒暄、创意、无需数据的对话\n' +
    '- fallback：与 BFC 商场无关，或无法理解\n' +
    '规则：只要用户在问“具体的东西”（店、吃、楼层、设施），优先 tool_call；只有纯知识介绍才 kb_rag。confidence 为判断置信度。不要输出 JSON 以外的任何文字。'
  try {
    const data = await llm(
      env,
      [
        { role: 'system', content: sys },
        ...recent.slice(-4),
        { role: 'user', content: `当前用户发言：${lastUser}` },
      ],
      // 推理型模型（如 dots3-note-prev）会先把 token 消耗在 reasoning_content 上，
      // 上限过小会导致 content 为空、分流 JSON 解析失败。max_tokens 只是上限、不预分配，故放大。
      { tools: false, temperature: 0.1, maxTokens: 2000 },
    )
    const j = extractJson(textOf(data))
    if (!j || typeof j.route !== 'string') return null
    const route = j.route as Route
    if (!['tool_call', 'kb_rag', 'direct', 'fallback'].includes(route)) return null
    return {
      route,
      tool: typeof j.tool === 'string' ? j.tool : undefined,
      args: j.args && typeof j.args === 'object' ? j.args : undefined,
      confidence: typeof j.confidence === 'number' ? Math.min(1, Math.max(0, j.confidence)) : 0.5,
    }
  } catch {
    return null // decider 失败 → 熔断回完整 agent loop
  }
}

// ---------------------------------------------------------------------------
// 会话记忆（D1）：装载 / 事实抽取 / 滚动摘要 / 落库
// ---------------------------------------------------------------------------
interface SessionMemory {
  facts: Record<string, any>
  summary: string
  lastQuery: string
  entities: string[]
  turns: number
}

async function loadMemory(db: DB, sessionId: string): Promise<SessionMemory> {
  const row = await db
    .prepare('SELECT facts, summary, last_query, entities, turns FROM session_memory WHERE session_id = ?1')
    .bind(sessionId)
    .first<D1Row>()
  if (!row) return { facts: {}, summary: '', lastQuery: '', entities: [], turns: 0 }
  return {
    facts: safeJson(row.facts, {}),
    summary: String(row.summary ?? ''),
    lastQuery: String(row.last_query ?? ''),
    entities: safeJson(row.entities, []),
    turns: Number(row.turns ?? 0),
  }
}

function safeJson<T>(s: string, dflt: T): T {
  try {
    return JSON.parse(s) as T
  } catch {
    return dflt
  }
}

/** 规则抽取本轮用户事实（预算 / 人数 / 场景），合并进已有 facts */
function extractFacts(userText: string, prev: Record<string, any>): Record<string, any> {
  const f: Record<string, any> = { ...prev }
  const mBudget = userText.match(/(?:预算|人均|控制在)\D{0,4}(\d{2,5})|(\d{2,5})\s*(?:元|块)/)
  if (mBudget) {
    const n = Number(mBudget[1] || mBudget[2])
    if (!Number.isNaN(n) && n > 0) f.budget = n
  }
  const mPeople = userText.match(/(\d{1,2})\s*(?:个)?\s*(?:人|位)/)
  if (mPeople) f.people = Number(mPeople[1])
  else if (/一个人|独自|单人|就我自己/.test(userText)) f.people = 1
  else {
    const cn: Record<string, number> = { 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }
    for (const [w, n] of Object.entries(cn)) {
      if (new RegExp(`${w}\\s*(?:个)?\\s*(?:人|位)`).test(userText)) {
        f.people = n
        break
      }
    }
  }
  const occasions = (f.occasions as string[]) ?? []
  for (const o of ['约会', '带娃', '聚餐', '送礼', '购物', '闺蜜']) {
    if (userText.includes(o) && !occasions.includes(o)) occasions.push(o)
  }
  f.occasions = occasions
  return f
}

/** 抽取提到的店铺名（实体） */
function extractEntities(userText: string): string[] {
  const t = userText.toLowerCase()
  return STORES.filter(s => t.includes(s.name.toLowerCase())).map(s => s.name)
}

function memoryPrompt(m: SessionMemory): string {
  const bits: string[] = []
  if (Object.keys(m.facts).length) bits.push(`已知用户事实：${JSON.stringify(m.facts)}`)
  if (m.summary) bits.push(`历史对话摘要：${m.summary}`)
  if (m.entities.length) bits.push(`用户提到过的店铺：${m.entities.join('、')}`)
  return bits.length ? `\n\n[会话记忆]\n${bits.join('\n')}` : ''
}

async function persistTurn(
  env: Env,
  ctx: Ctx,
  sessionId: string,
  ua: string,
  userText: string,
  answer: string,
  route: Route,
) {
  const db = env.DB
  if (!db) return
  const now = Date.now()
  ctx.waitUntil((async () => {
    try {
      await db
        .prepare(
          'INSERT INTO sessions (session_id, created_at, last_active, ua) VALUES (?1, ?2, ?2, ?3) ' +
            'ON CONFLICT(session_id) DO UPDATE SET last_active = ?2, ua = ?3',
        )
        .bind(sessionId, now, ua)
        .run()
      await db
        .prepare('INSERT INTO messages (session_id, role, content, route, ts) VALUES (?1, ?2, ?3, ?4, ?5)')
        .bind(sessionId, 'user', userText, route, now)
        .run()
      await db
        .prepare('INSERT INTO messages (session_id, role, content, route, ts) VALUES (?1, ?2, ?3, ?4, ?5)')
        .bind(sessionId, 'assistant', answer, route, now + 1)
        .run()

      // 记忆更新：规则抽 facts + 实体；每 N 轮后台 LLM 滚动摘要
      const mem = await loadMemory(db, sessionId)
      const facts = extractFacts(userText, mem.facts)
      const entities = [...new Set([...mem.entities, ...extractEntities(userText)])].slice(-20)
      const turns = mem.turns + 1
      const every = Number(env.MEMORY_SUMMARY_EVERY || 8)
      let summary = mem.summary
      if (every > 0 && turns % every === 0) {
        try {
          const hist = await db
            .prepare('SELECT role, content FROM messages WHERE session_id = ?1 ORDER BY ts DESC LIMIT 16')
            .bind(sessionId)
            .all<D1Row>()
          const convo = (hist.results ?? [])
            .reverse()
            .map(r => `${r.role === 'user' ? '用户' : '助手'}: ${String(r.content).slice(0, 160)}`)
            .join('\n')
          const data = await llm(
            env,
            [
              { role: 'system', content: '把对话压缩为不超过120字的事实性摘要，只保留用户偏好、预算、人数、场景与已推荐店铺。直接输出摘要。' },
              { role: 'user', content: convo },
            ],
            // 同 decider：推理模型需预留思考 token，避免 content 被截断为空
            { tools: false, temperature: 0.2, maxTokens: 1200 },
          )
          summary = textOf(data).trim() || summary
        } catch {
          // 摘要失败不阻塞主流程
        }
      }
      await db
        .prepare(
          'INSERT INTO session_memory (session_id, facts, summary, last_query, entities, turns, updated_at) ' +
            'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) ' +
            'ON CONFLICT(session_id) DO UPDATE SET facts=?2, summary=?3, last_query=?4, entities=?5, turns=?6, updated_at=?7',
        )
        .bind(sessionId, JSON.stringify(facts), summary, userText.slice(0, 200), JSON.stringify(entities), turns, now)
        .run()
    } catch {
      // 落库失败不影响回答
    }
  })())
}

// ---------------------------------------------------------------------------
// 闸门：限流（每 session 每分钟）
// ---------------------------------------------------------------------------
async function rateLimited(env: Env, sessionId: string): Promise<boolean> {
  const db = env.DB
  if (!db) return false
  const now = Date.now()
  const limit = Number(env.RATE_LIMIT_PER_MIN || 20)
  const row = await db
    .prepare('SELECT COUNT(*) AS c FROM rate_events WHERE session_id = ?1 AND ts > ?2')
    .bind(sessionId, now - 60_000)
    .first<D1Row>()
  if (Number(row?.c ?? 0) >= limit) return true
  await db.prepare('INSERT INTO rate_events (session_id, ts) VALUES (?1, ?2)').bind(sessionId, now).run()
  if (Math.random() < 0.05) {
    await db.prepare('DELETE FROM rate_events WHERE ts < ?1').bind(now - 3_600_000).run()
  }
  return false
}

// ---------------------------------------------------------------------------
// 主入口：共享内核（Pages Functions 与独立 Worker 都调用它）
// ---------------------------------------------------------------------------
export async function handleAgent(request: Request, env: Env, ctx: Ctx): Promise<Response> {
  const origin = request.headers.get('Origin') || ''
  const cors = {
    'Access-Control-Allow-Origin': CORS_ALLOWED_ORIGINS.includes(origin) ? origin : CORS_ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  if (request.method === 'GET') {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/health')) {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors })
  }

  // 闸门：Origin 白名单（同域请求/curl 无 Origin，放行）
  if (origin && !CORS_ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: 'origin_not_allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response('Bad Request', { status: 400, headers: cors })
  }
  const messages: { role: string; content: string }[] = Array.isArray(body?.messages) ? body.messages : []
  if (!messages.length) {
    return new Response(JSON.stringify({ error: 'messages_required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
  const sessionId: string =
    typeof body?.sessionId === 'string' && body.sessionId.length <= 64
      ? body.sessionId
      : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  // 限流
  if (await rateLimited(env, sessionId)) {
    return new Response(JSON.stringify({ error: 'rate_limited', sessionId }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  // 装配：RAG + 会话记忆
  const { context: kbContext, topScore: kbTopScore } = retrieveWithScore(lastUser, 6)
  let memory: SessionMemory = { facts: {}, summary: '', lastQuery: '', entities: [], turns: 0 }
  if (env.DB) {
    try {
      memory = await loadMemory(env.DB, sessionId)
    } catch {
      // 记忆不可用 → 降级为无记忆
    }
  }
  const system = buildSystemPrompt(kbContext) + memoryPrompt(memory)
  const chatMessages = [{ role: 'system', content: system }, ...messages]

  // decider 意图决策 → 四路分流
  const trace: { name: string; ok: boolean }[] = []
  let route: Route = 'tool_call'
  let answer = ''
  const cards: AgentCard[] = []
  try {
    const minConf = Number(env.DECIDER_MIN_CONFIDENCE || 0.55)
    const decision = await decide(env, messages, lastUser)

    if (!decision) {
      // 熔断：decider 失败 → 完整 agent loop
      route = 'tool_call'
      answer = await runAgentLoop(chatMessages, env, r => collectCards(r, cards), lastUser, trace)
    } else if (decision.route === 'fallback' || decision.confidence < minConf) {
      route = 'fallback'
      answer = FALLBACK_TEXT
    } else if (decision.route === 'tool_call') {
      route = 'tool_call'
      answer = await runAgentLoop(chatMessages, env, r => collectCards(r, cards), lastUser, trace)
    } else {
      // kb_rag / direct：不带工具直接生成（kb 已注入 system）
      route = decision.route
      const data = await llm(env, chatMessages, { tools: false, temperature: 0.5, maxTokens: 1200 })
      answer = sanitizeAnswer(textOf(data))
    }

    // —— 统一清洗，覆盖所有路由 ——
    // 旧代码只在 direct 分支 sanitize，runAgentLoop（tool_call）路径的函数调用 markup
    // 会原样发给用户，故统一在这里处理一次。
    const hadFnMarkup = containsFunctionCallMarkup(answer)
    answer = sanitizeAnswer(answer)

    // replyGuard 后处理：复读 / 空回答 / 函数调用 markup → 重试一次 → 仍无效则走兜底引导话术
    const isInvalid = () => looksLikeEcho(answer, lastUser) || containsFunctionCallMarkup(answer)
    if (isInvalid() && route !== 'fallback') {
      try {
        // 若上次是「把函数调用当文本吐出」，重试时明确禁止再输出任何标签
        const nudge = hadFnMarkup
          ? [
              {
                role: 'system',
                content:
                  '严禁以任何 XML/标签形式输出函数调用（例如 <dots_function_call>、<invoke>、<parameter>）。' +
                  '只输出面向用户的自然语言回答，不要包含任何尖括号标签。',
              },
            ]
          : []
        const data = await llm(env, [...chatMessages, ...nudge], { tools: false, temperature: 0.5, maxTokens: 1200 })
        answer = sanitizeAnswer(textOf(data))
      } catch {
        // 重试失败 → 走兜底
      }
      if (isInvalid()) {
        answer = FALLBACK_TEXT
        route = 'fallback'
      }
    }

    // —— 统一兜底救援 ——
    // 落到标准兜底话术且 KB 明确命中(topScore 达阈值)时，说明问题与 BFC 相关，
    // 直接基于 KB 作答；覆盖「decider 误判」与「replyGuard 重试后仍无效」两类偶发 fallback。
    if (route === 'fallback' && answer === FALLBACK_TEXT) {
      const rescueMin = Number(env.KB_RESCUE_MIN_SCORE || 3)
      if (kbTopScore >= rescueMin) {
        // 推理模型偶发把 token 耗尽在 reasoning_content 上导致 content 为空，
        // 故最多重试 2 次，直到拿到可用回答为止。
        let rescued = ''
        for (let attempt = 0; attempt < 2 && !rescued; attempt++) {
          try {
            const data = await llm(env, chatMessages, { tools: false, temperature: 0.5, maxTokens: 1200 })
            const cand = sanitizeAnswer(textOf(data))
            if (cand && !containsFunctionCallMarkup(cand) && !looksLikeEcho(cand, lastUser)) rescued = cand
          } catch {
            // 单次失败 → 重试
          }
        }
        if (rescued) {
          answer = rescued
          route = 'kb_rag'
        }
      }
    }
  } catch (e: any) {
    // 全链路失败 → 502，前端 callAgent 抛异常 → 回退本地规则引擎
    return new Response(
      JSON.stringify({ error: 'agent_upstream_failed', message: String(e?.message || e).slice(0, 200), sessionId }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...cors } },
    )
  }

  // 异步落库（不阻塞响应）
  if (env.DB) {
    persistTurn(env, ctx, sessionId, request.headers.get('User-Agent') || '', lastUser, answer, route)
  }

  return new Response(JSON.stringify({ answer, cards, route, sessionId }), {
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
