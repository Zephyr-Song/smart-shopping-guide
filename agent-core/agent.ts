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
  DECIDER_TIMEOUT_MS?: string
  // 关闭推理模型的「思考」阶段以提速（chat 场景不需要 CoT）。
  // 实测 dots3-note-prev 经 chat_template_kwargs.enable_thinking=false 后首 token <1s。
  // 设为 "false" 可恢复思考（质量优先时使用）。
  LLM_DISABLE_THINKING?: string
  MEMORY_SUMMARY_EVERY?: string
  RATE_LIMIT_PER_MIN?: string
  KB_RESCUE_MIN_SCORE?: string
  // 请求体保护上限（不设则用内置默认值，见 limitsOf）
  MAX_BODY_BYTES?: string
  MAX_MESSAGES?: string
  MAX_MESSAGE_CHARS?: string
  MAX_TOTAL_CHARS?: string
  DB?: DB
}

export interface Ctx {
  waitUntil(p: Promise<unknown>): void
}

// 同域部署（Cloudflare Pages）下前端与 /api 同源，但仍必须把自己列入白名单：
// 浏览器对所有 POST 请求都会带Origin 头（同源也一样，只有 GET/HEAD 例外），
// 白名单里没有生产域名会让真实用户的每一次提问都撞上 403 origin_not_allowed。
// （2026-10-16 修复：此前误以为"同域不带 Origin"，导致线上小助手完全不可用。）
const CORS_ALLOWED_ORIGINS = [
  'https://bfc-shopping-guide.pages.dev',
  // GitHub Pages 上的静态镜像 / 演示页
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

/**
 * 推理型模型（dots3-note-prev 等）在实时对话场景应先关掉「思考」，否则会先吐一长段
 * reasoning_content 再吐正文，首 token 拖到 10s+，复杂问题直接撞 45s 硬超时。
 * 实测该网关认 chat_template_kwargs.enable_thinking=false（顶层 enable_thinking 无效）。
 * LLM_DISABLE_THINKING=false 可恢复思考。
 */
function thinkingDisableFields(env: Env): Record<string, unknown> {
  if (env.LLM_DISABLE_THINKING === 'false') return {}
  return { chat_template_kwargs: { enable_thinking: false } }
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
    const body: any = { model, messages, temperature: opts?.temperature ?? 0.3, ...thinkingDisableFields(env) }
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
// 快速路由：decider 超时 / 失败时的启发式兜底
//   推理型模型（dots3-note-prev）单次 decider 就要 8~12s，直接把首 token 预算吃光。
//   超过 DECIDER_TIMEOUT_MS 仍不返回时不再干等，按关键词先选一个工具检索，
//   让卡片和首 token 在几秒内出现；判错最多是「答得不够贴」，不会答非所问。
//   DECIDER_TIMEOUT_MS=0 可关闭该超时，恢复「一直等 decider」的原行为。
// ---------------------------------------------------------------------------
const TOOL_RESULT_NOTE =
  '以下是刚刚检索到的结构化结果（JSON）。请只基于它作答，信息不足就直说，不要编造不存在的门店、价格或活动：\n'

function guessTool(text: string, facts: Record<string, any>): { name: string; args: Record<string, any> } {
  const t = text || ''
  if (/停车|车位|母婴|寄存|卫生间|洗手间|无障碍|充电宝|电梯|存包/.test(t)) {
    return { name: 'get_facility', args: { type: t } }
  }
  if (/怎么去|地铁|公交|打车|交通|开车|自驾|导航|路线怎么走/.test(t)) {
    return { name: 'get_traffic', args: {} }
  }
  if (/客服|会员|积分|退换|发票|服务台|失物/.test(t)) {
    return { name: 'get_service', args: { type: t } }
  }
  if (/营业时间|几点开|几点关|关门|电话|地址|宠物|支付方式/.test(t)) {
    return { name: 'get_faq', args: { topic: t } }
  }
  if (/品牌|楼层|几楼|介绍|展览|活动|影城|艺术中心|业态|场馆/.test(t) && !/吃|餐|咖啡|奶茶|喝|甜品/.test(t)) {
    return { name: 'search_kb', args: { query: t } }
  }
  const args: Record<string, any> = { query: t }
  if (typeof facts?.budget === 'number') args.budget_max = facts.budget
  if (typeof facts?.people === 'number') args.people = facts.people
  return { name: 'search_stores', args }
}

/** decider 带超时：超时返回 null，由调用方走 guessTool 快路径 */
async function decideFast(env: Env, recent: any[], lastUser: string): Promise<Decision | null> {
  const ms = Number(env.DECIDER_TIMEOUT_MS ?? 4500)
  if (!Number.isFinite(ms) || ms <= 0) return decide(env, recent, lastUser)
  let timer: any
  const timeout = new Promise<null>(resolve => {
    timer = setTimeout(() => resolve(null), ms)
  })
  try {
    return await Promise.race([decide(env, recent, lastUser), timeout])
  } finally {
    clearTimeout(timer)
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
  try {
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
  } catch {
    // D1 未初始化 / 表缺失 / 查询失败 → 放行（可用性优先，限流失效好过导购整体不可用）
    return false
  }
}

// ---------------------------------------------------------------------------
// 请求体保护：客户端与 Function 双层校验
//   上限取「平台网关 / 模型服务 / 业务约束」三者最小值，可通过环境变量覆盖，
//   不把同一份限制写死在多个位置。超限返回结构化 413，前端提示拆分后重试。
// ---------------------------------------------------------------------------
export interface Limits {
  bodyBytes: number
  messages: number
  messageChars: number
  totalChars: number
}

function limitsOf(env: Env): Limits {
  const num = (v: string | undefined, d: number) => {
    const x = Number(v)
    return Number.isFinite(x) && x > 0 ? x : d
  }
  return {
    bodyBytes: num(env.MAX_BODY_BYTES, 32 * 1024),
    messages: num(env.MAX_MESSAGES, 24),
    messageChars: num(env.MAX_MESSAGE_CHARS, 4000),
    totalChars: num(env.MAX_TOTAL_CHARS, 16000),
  }
}

export type BodyResult =
  | { ok: true; body: any }
  | { ok: false; status: number; payload: Record<string, any> }

/** 统一读取并校验请求体：Content-Length 预检 → 实测字节 → JSON → 结构上限 */
export async function readAgentBody(request: Request, env: Env): Promise<BodyResult> {
  const lim = limitsOf(env)

  // 1) Content-Length 预检：不必读流就能拒掉超大请求
  const declared = Number(request.headers.get('Content-Length') || '0')
  if (declared && declared > lim.bodyBytes) {
    return {
      ok: false,
      status: 413,
      payload: {
        error: 'payload_too_large',
        reason: 'body_bytes',
        limit: lim.bodyBytes,
        actual: declared,
        message: '输入内容过长，请拆分后重试',
      },
    }
  }

  // 2) 实测字节数（Content-Length 可能缺失或被伪造，必须再量一次）
  let raw = ''
  try {
    raw = await request.text()
  } catch {
    return { ok: false, status: 400, payload: { error: 'body_unreadable', message: '请求内容无法读取' } }
  }
  const bytes = new TextEncoder().encode(raw).byteLength
  if (bytes > lim.bodyBytes) {
    return {
      ok: false,
      status: 413,
      payload: {
        error: 'payload_too_large',
        reason: 'body_bytes',
        limit: lim.bodyBytes,
        actual: bytes,
        message: '输入内容过长，请拆分后重试',
      },
    }
  }
  if (!raw.trim()) {
    return { ok: false, status: 400, payload: { error: 'body_empty', message: '请求内容为空' } }
  }

  // 3) JSON 解析
  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    return { ok: false, status: 400, payload: { error: 'body_invalid_json', message: '请求格式错误' } }
  }

  // 4) 业务结构上限
  const messages: any[] = Array.isArray(body?.messages) ? body.messages : []
  if (!messages.length) {
    return { ok: false, status: 400, payload: { error: 'messages_required', message: '缺少对话内容' } }
  }
  if (messages.length > lim.messages) {
    return {
      ok: false,
      status: 413,
      payload: {
        error: 'payload_too_large',
        reason: 'messages_count',
        limit: lim.messages,
        actual: messages.length,
        message: '对话轮次过多，请点击「重新对话」后重试',
      },
    }
  }
  let total = 0
  for (const m of messages) {
    const c = typeof m?.content === 'string' ? m.content : ''
    if (!c.trim()) {
      return { ok: false, status: 400, payload: { error: 'message_content_required', message: '存在空消息' } }
    }
    if (c.length > lim.messageChars) {
      return {
        ok: false,
        status: 413,
        payload: {
          error: 'payload_too_large',
          reason: 'message_chars',
          limit: lim.messageChars,
          actual: c.length,
          message: '单条消息过长，请拆分后重试',
        },
      }
    }
    total += c.length
  }
  if (total > lim.totalChars) {
    return {
      ok: false,
      status: 413,
      payload: {
        error: 'payload_too_large',
        reason: 'total_chars',
        limit: lim.totalChars,
        actual: total,
        message: '对话内容总量过长，请点击「重新对话」后重试',
      },
    }
  }

  return { ok: true, body }
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

  const parsed = await readAgentBody(request, env)
  if (!parsed.ok) {
    return new Response(JSON.stringify(parsed.payload), {
      status: parsed.status,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
  const body = parsed.body
  const messages: { role: string; content: string }[] = body.messages
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
    const decision = await decideFast(env, messages, lastUser)

    if (!decision) {
      // 熔断：decider 超时/失败 → 启发式先检索，再基于检索结果生成（与流式端点同一套逻辑）
      route = 'tool_call'
      const guess = guessTool(lastUser, memory.facts)
      const r = executeTool(guess.name, guess.args, lastUser)
      trace.push({ name: guess.name, ok: true })
      collectCards(r, cards)
      if (cards.length === 0) {
        // 启发式没检索到东西 → 回到完整 agent loop（慢一些但更灵活）
        answer = await runAgentLoop(chatMessages, env, x => collectCards(x, cards), lastUser, trace)
      } else {
        const data = await llm(
          env,
          [...chatMessages, { role: 'system', content: TOOL_RESULT_NOTE + JSON.stringify(r).slice(0, 4000) }],
          { tools: false, temperature: 0.5, maxTokens: 1200 },
        )
        answer = textOf(data)
      }
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

// ===========================================================================
// SSE 流式导购（POST /api/agent/stream）
//   事件：state / token / card / done / error
// 设计要点：
//   1. 浏览器必须用 fetch + ReadableStream 消费（EventSource 无法携带 JSON 请求体）
//   2. 先卡片后文本：decider 已给出 tool + args，据此先检索并推送 card，再流式生成回答
//   3. done 事件携带「最终清洗后的 answer」，前端以它覆盖流式原文，
//      避免逐 token 推送把函数调用协议残留（<dots_function_call> 等）漏给用户
//   4. 20s 未出首 token → 发状态事件续命；45s 仍未出 → 用已检索卡片收尾并保留重试
// ===========================================================================

/** 逐 token 读取 OpenAI 兼容流；上游不支持流式时自动退化为整包 JSON */
async function llmStream(
  env: Env,
  messages: any[],
  opts: { temperature?: number; maxTokens?: number; signal?: AbortSignal },
  onDelta: (t: string) => void,
): Promise<string> {
  const base = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = env.LLM_MODEL || 'deepseek-chat'
  const body: any = {
    model,
    messages,
    temperature: opts.temperature ?? 0.5,
    stream: true,
    ...thinkingDisableFields(env),
  }
  if (opts.maxTokens) body.max_tokens = opts.maxTokens

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.LLM_API_KEY}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${t.slice(0, 200)}`)
  }

  const ctype = res.headers.get('Content-Type') || ''
  // 上游（或中间代理）不支持流式：返回整包 JSON，仍按增量一次性吐出
  if (!ctype.includes('text/event-stream') || !res.body) {
    const data = await res.json().catch(() => null)
    const text = textOf(data) || ''
    if (text) onDelta(text)
    return text
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line || line.startsWith(':') || !line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const j = JSON.parse(payload)
        // dots3-note-prev 会先吐 reasoning_content 再吐 content，这里只转正文
        const delta = j?.choices?.[0]?.delta ?? {}
        const piece = typeof delta.content === 'string' ? delta.content : ''
        if (piece) {
          full += piece
          onDelta(piece)
        }
      } catch {
        // 不完整帧，等下一个 chunk 补齐
      }
    }
  }
  return full
}

export async function handleAgentStream(request: Request, env: Env, ctx: Ctx): Promise<Response> {
  const origin = request.headers.get('Origin') || ''
  const cors = {
    'Access-Control-Allow-Origin': CORS_ALLOWED_ORIGINS.includes(origin) ? origin : CORS_ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
  const jsonError = (status: number, payload: Record<string, any>) =>
    new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json', ...cors } })

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors })
  if (origin && !CORS_ALLOWED_ORIGINS.includes(origin)) {
    return jsonError(403, { error: 'origin_not_allowed' })
  }

  const parsed = await readAgentBody(request, env)
  if (!parsed.ok) return jsonError(parsed.status, parsed.payload)

  const body = parsed.body
  const messages: { role: string; content: string }[] = body.messages
  const sessionId: string =
    typeof body?.sessionId === 'string' && body.sessionId.length <= 64
      ? body.sessionId
      : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  if (await rateLimited(env, sessionId)) {
    return new Response(JSON.stringify({ error: 'rate_limited', sessionId }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60', ...cors },
    })
  }

  const encoder = new TextEncoder()
  let cancelled = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false
      const write = (chunk: string) => {
        if (closed || cancelled) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          closed = true
        }
      }
      const send = (event: string, data: any) => write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      const heartbeat = setInterval(() => write(': ping\n\n'), 15000)
      const close = () => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          // 连接已断开
        }
      }

      const t0 = Date.now()
      const requestId = `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      const cards: AgentCard[] = []
      const trace: { name: string; ok: boolean }[] = []
      const emitCards = () => {
        for (const c of cards) send('card', { card: c })
      }
      let answer = ''
      let route: Route = 'tool_call'
      let firstTokenMs: number | null = null
      let gotToken = false

      const genAbort = new AbortController()
      // 推理型模型会先消耗 reasoning token 再吐正文，正文首 token 可能 10s 后才到。
      // 每 8s 用状态事件续命，让用户知道系统还在工作，而不是盯着空白。
      let slowTicks = 0
      const softTimer = setInterval(() => {
        if (gotToken) return
        slowTicks++
        send('state', {
          stage: 'slow',
          text: slowTicks === 1 ? '还在整理，请稍候…' : '内容较多，仍在生成…',
        })
      }, 8000)
      const hardTimer = setTimeout(() => {
        if (!gotToken) genAbort.abort()
      }, 45000)

      try {
        send('state', { stage: 'understanding', text: '正在理解你的问题…' })

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

        const streamOnce = async (msgs: any[], label: string) => {
          send('state', { stage: 'generating', text: label })
          return llmStream(env, msgs, { temperature: 0.5, maxTokens: 1200, signal: genAbort.signal }, piece => {
            if (firstTokenMs === null) firstTokenMs = Date.now() - t0
            gotToken = true
            send('token', { text: piece })
          })
        }

        // 非流式得到的整段文本 → 分片推送，前端仍可逐字渲染
        const flushAsTokens = async (text: string) => {
          const CHUNK = 24
          for (let i = 0; i < text.length; i += CHUNK) {
            if (genAbort.signal.aborted || cancelled) break
            if (firstTokenMs === null) firstTokenMs = Date.now() - t0
            gotToken = true
            send('token', { text: text.slice(i, i + CHUNK) })
            await new Promise(r => setTimeout(r, 24))
          }
          return text
        }

        const minConf = Number(env.DECIDER_MIN_CONFIDENCE || 0.55)
        const decision = await decideFast(env, messages, lastUser)

        if (decision && (decision.route === 'fallback' || decision.confidence < minConf)) {
          // 兜底：KB 明确命中就基于知识库作答，否则给引导话术
          const rescueMin = Number(env.KB_RESCUE_MIN_SCORE || 3)
          if (kbTopScore >= rescueMin) {
            route = 'kb_rag'
            answer = await streamOnce(chatMessages, '正在整理 BFC 资料…')
            if (!answer) answer = FALLBACK_TEXT
          } else {
            route = 'fallback'
            answer = FALLBACK_TEXT
            await flushAsTokens(answer)
          }
        } else if (!decision || decision.route === 'tool_call') {
          // 工具路径（含 decider 超时/失败后的启发式快路径）：
          // 先检索出卡片并立刻推送，再基于检索结果流式生成回答
          route = 'tool_call'
          const explicit =
            decision?.tool && TOOL_REGISTRY.has(decision.tool)
              ? { name: decision.tool, args: decision.args || {} }
              : null
          const guess = explicit || guessTool(lastUser, memory.facts)
          send('state', { stage: 'retrieving', text: '正在检索 BFC 门店…' })
          const r = executeTool(guess.name, guess.args, lastUser)
          trace.push({ name: guess.name, ok: true })
          collectCards(r, cards)
          emitCards()
          if (!explicit && cards.length === 0) {
            // 启发式没检索到东西 → 回到完整 agent loop（慢一些但更灵活）
            answer = await runAgentLoop(chatMessages, env, x => collectCards(x, cards), lastUser, trace)
            emitCards()
            await flushAsTokens(answer)
          } else {
            answer = await streamOnce(
              [...chatMessages, { role: 'system', content: TOOL_RESULT_NOTE + JSON.stringify(r).slice(0, 4000) }],
              '正在整理建议…',
            )
          }
        } else {
          // kb_rag / direct：知识库已在 system 中，直接流式生成
          route = decision.route
          answer = await streamOnce(chatMessages, '正在整理建议…')
        }

        // 统一清洗 + replyGuard（与 /api/agent 保持同一套规则）
        const hadFnMarkup = containsFunctionCallMarkup(answer)
        answer = sanitizeAnswer(answer)
        const invalid = () => looksLikeEcho(answer, lastUser) || containsFunctionCallMarkup(answer)
        if (invalid() && route !== 'fallback') {
          try {
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
          if (invalid()) {
            answer = FALLBACK_TEXT
            route = 'fallback'
          }
        }

        if (env.DB) {
          persistTurn(env, ctx, sessionId, request.headers.get('User-Agent') || '', lastUser, answer, route)
        }

        // done 携带最终答案，前端以它覆盖流式原文（防止协议残留漏出）
        send('done', {
          requestId,
          reason: 'complete',
          route,
          answer,
          cards,
          sessionId,
          firstTokenMs,
          totalMs: Date.now() - t0,
        })
        close()
      } catch (e: any) {
        const aborted = genAbort.signal.aborted
        if (aborted && cards.length) {
          // 超时但已检索到卡片 → 用卡片收尾，保留重试入口
          send('done', {
            requestId,
            reason: 'soft_timeout',
            route,
            answer: '回答生成超时了～这次检索到的门店先放在下面，可以再问一次或点重试。',
            cards,
            sessionId,
            firstTokenMs,
            totalMs: Date.now() - t0,
          })
        } else if (aborted) {
          send('error', { code: 'timeout', message: '回答生成超时，请重试', retryable: true })
        } else {
          send('error', {
            code: 'agent_upstream_failed',
            message: String(e?.message || e).slice(0, 200),
            retryable: true,
          })
        }
        close()
      } finally {
        clearInterval(softTimer)
        clearTimeout(hardTimer)
        clearInterval(heartbeat)
      }
    },
    cancel() {
      cancelled = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
      ...cors,
    },
  })
}
