// BFC 智能导购 —— 系统架构数据（与真实代码/部署保持一致）
// 任何架构变动请同步本文件，页面 /architecture 直接消费。

export interface ArchNode {
  title: string
  subtitle?: string
  items: { k: string; v: string }[]
  accent?: 'gold' | 'amber' | 'jade' | 'slate'
}

export interface ArchLayer {
  id: string
  code: string
  name: string
  desc: string
  nodes: ArchNode[]
}

export const DEPLOY_SUMMARY =
  '部署形态：Cloudflare Pages（dist 静态前端）+ Pages Functions（/api/*）+ D1 托管 SQLite；智能能力集中于 L3 共享内核'

export const LAYERS: ArchLayer[] = [
  {
    id: 'access',
    code: 'L1',
    name: '访问层',
    desc: '用户触点与前端应用',
    nodes: [
      {
        title: '浏览器 / 用户',
        items: [
          { k: '', v: '导购问答、店铺浏览、地图查看' },
          { k: '', v: '会话记忆由 sessionId 贯穿' },
        ],
        accent: 'gold',
      },
      {
        title: '前端应用（React 19 + Vite）',
        items: [
          { k: '', v: 'Home / Guide / Map / Brands / Analytics' },
          { k: '', v: '浮动助手 AgentAssistant（全局）' },
          { k: '', v: 'IndexedDB 无 · 全走同域 API' },
        ],
        accent: 'gold',
      },
      {
        title: '构建产物（dist）',
        items: [
          { k: '', v: 'Vite 静态打包 / assets 指纹命名' },
          { k: '', v: 'Tailwind 4 内联主题 token' },
          { k: '', v: '无外部 CDN / 无 Google Fonts' },
        ],
        accent: 'gold',
      },
    ],
  },
  {
    id: 'gateway',
    code: '网关',
    name: '反代 + 统一入口',
    desc: '边缘接入与准入控制',
    nodes: [
      {
        title: 'Cloudflare Edge / Pages',
        subtitle: '同域统一入口',
        items: [
          { k: '', v: '/ → 静态资源（dist）' },
          { k: '', v: '/api/* → Pages Functions' },
        ],
        accent: 'amber',
      },
      {
        title: '请求闸门（agent-core）',
        items: [
          { k: '', v: 'Origin 白名单校验（CORS_ALLOWED_ORIGINS）' },
          { k: '', v: '每 session 限流 RATE_LIMIT_PER_MIN=20' },
          { k: '', v: 'OPTIONS 预检 / 405 方法拦截' },
        ],
        accent: 'amber',
      },
    ],
  },
  {
    id: 'app',
    code: 'L2',
    name: '应用服务层',
    desc: 'Pages Functions 薄适配 + 共享内核',
    nodes: [
      {
        title: 'functions/api/agent',
        subtitle: '薄适配层',
        items: [
          { k: '', v: '仅做转发，无业务逻辑' },
          { k: '', v: 'handleAgent(request, env, ctx)' },
        ],
        accent: 'slate',
      },
      {
        title: 'functions/api/health',
        subtitle: '健康探针',
        items: [
          { k: '', v: 'GET /api/health → { ok, ts }' },
          { k: '', v: '供监控与冒烟测试使用' },
        ],
        accent: 'slate',
      },
      {
        title: 'agent-core/agent.ts',
        subtitle: '共享内核（580 行）',
        items: [
          { k: '', v: '闸门 → 记忆装配 → decider → 四路分流' },
          { k: '', v: '统一清洗 + replyGuard 重试 + KB 兜底救援' },
          { k: '', v: '异步落库 persistTurn（不阻塞响应）' },
        ],
        accent: 'slate',
      },
    ],
  },
  {
    id: 'intel',
    code: 'L3',
    name: '智能能力层',
    desc: '导购对话的核心逻辑组件',
    nodes: [
      {
        title: 'decider 意图路由',
        items: [
          { k: '', v: 'temperature 0.1 / max_tokens 2000' },
          { k: '', v: '输出 { route, tool, args, confidence }' },
          { k: '', v: '置信度 < 0.55 → 触发兜底链' },
        ],
        accent: 'gold',
      },
      {
        title: 'systemPrompt 五层装配',
        items: [
          { k: '', v: '角色 / 能力 / 上下文' },
          { k: '', v: 'KB 检索结果（top 6）注入' },
          { k: '', v: '会话记忆片段（facts / summary）' },
        ],
        accent: 'gold',
      },
      {
        title: 'sessionMemory 记忆',
        items: [
          { k: '', v: 'facts 结构化事实抽取' },
          { k: '', v: '每 8 轮 LLM 滚动摘要（1200 tokens）' },
          { k: '', v: 'lastQuery / entities / turns' },
        ],
        accent: 'gold',
      },
      {
        title: 'replyGuard 回复守卫',
        items: [
          { k: '', v: '复读检测 looksLikeEcho' },
          { k: '', v: '函数调用 markup 检测与剥离' },
          { k: '', v: '无效 → 重试一次 → 兜底话术' },
        ],
        accent: 'gold',
      },
      {
        title: 'KB 检索（bi-gram TF-IDF）',
        items: [
          { k: '', v: 'CJK 二元组 + 拉丁词切分' },
          { k: '', v: '加权打分：keyword 3 / title 5 / content 0.5' },
          { k: '', v: 'topScore ≥ 3 → 误判救援通道' },
        ],
        accent: 'gold',
      },
      {
        title: 'TOOL_DEFS 工具集',
        items: [
          { k: '', v: '8 工具：search_stores / get_store_detail' },
          { k: '', v: 'compare_stores / get_facility / get_service' },
          { k: '', v: 'get_faq / get_traffic / search_kb' },
        ],
        accent: 'gold',
      },
      {
        title: 'KB 知识库',
        subtitle: '123 条结构化条目',
        items: [
          { k: '', v: '店铺 42（真实 BFC 品牌数据）' },
          { k: '', v: '设施 9 / 服务 8 / FAQ 8 / 政策 5' },
          { k: '', v: '娱乐 5 / 官网抓取 86 条' },
        ],
        accent: 'gold',
      },
    ],
  },
  {
    id: 'external',
    code: 'L4',
    name: '外部服务层',
    desc: 'LLM 与数据源',
    nodes: [
      {
        title: 'dots.ai（主模型）',
        subtitle: 'dots3-note-prev',
        items: [
          { k: '', v: 'OpenAI 兼容 /chat/completions' },
          { k: '', v: '推理型：reasoning_content + content' },
          { k: '', v: '支持 tool_calls / SSE stream' },
        ],
        accent: 'jade',
      },
      {
        title: '备用模型通道',
        subtitle: 'LLM_MODEL_FALLBACK',
        items: [
          { k: '', v: '主模型 403 / 429 时自动切换' },
          { k: '', v: '需同服务商 key（当前留空=关闭）' },
        ],
        accent: 'jade',
      },
      {
        title: 'BFC 商业数据',
        subtitle: 'mockData 静态镜像',
        items: [
          { k: '', v: '42 家店铺 / 6 大客群画像' },
          { k: '', v: '楼层业态 / 客流热力 / 营销日历' },
        ],
        accent: 'jade',
      },
      {
        title: 'KB 生成流水线',
        subtitle: 'notion-kb/（构建期）',
        items: [
          { k: '', v: 'BFC 官网抓取 → enrich → webContent.ts' },
          { k: '', v: '产物为 TS 常量，运行时零网络' },
        ],
        accent: 'jade',
      },
    ],
  },
  {
    id: 'storage',
    code: 'L5',
    name: '存储层',
    desc: '结构化 / 文件 / 日志',
    nodes: [
      {
        title: 'D1 托管 SQLite',
        subtitle: 'bfc-agent-db',
        items: [
          { k: '', v: 'sessions（会话登记 / 活跃时间）' },
          { k: '', v: 'messages（对话审计流水 + route 留痕）' },
          { k: '', v: 'session_memory（结构化记忆）' },
          { k: '', v: 'rate_events（限流计数窗口）' },
        ],
        accent: 'amber',
      },
      {
        title: '静态资源（dist）',
        items: [
          { k: '', v: 'HTML / 指纹化 JS / CSS' },
          { k: '', v: 'favicon 等品牌资源' },
        ],
        accent: 'amber',
      },
      {
        title: '可观测性',
        items: [
          { k: '', v: 'Cloudflare 请求日志 / Analytics' },
          { k: '', v: '/api/health 冒烟探针' },
          { k: '', v: 'D1 route 字段支持对话回放' },
        ],
        accent: 'amber',
      },
    ],
  },
]

export interface DataFlowStep {
  step: string
  title: string
  desc: string
  detail: string[]
}

export const DATA_FLOW: DataFlowStep[] = [
  {
    step: '01',
    title: '请求接入',
    desc: '浏览器发起对话请求',
    detail: [
      '前端 AgentAssistant 组装 messages + sessionId',
      'POST /api/agent（同域，无跨域密钥）',
      'Cloudflare Edge 命中 Pages Functions',
    ],
  },
  {
    step: '02',
    title: '闸门校验',
    desc: 'Origin 白名单 + 限流',
    detail: [
      '检查 Origin 是否在 CORS_ALLOWED_ORIGINS',
      '查询 rate_events 判断本分钟是否超 20 次',
      '超限返回 429，并写入本次计数',
    ],
  },
  {
    step: '03',
    title: '上下文装配',
    desc: 'KB 检索 + 会话记忆',
    detail: [
      'retrieveWithScore(lastUser, 6) 取 KB top 6 与命中分',
      'loadMemory 从 session_memory 读取 facts/summary',
      '拼装 systemPrompt 五层结构',
    ],
  },
  {
    step: '04',
    title: '意图路由',
    desc: 'decider 决策四路分流',
    detail: [
      'LLM 输出 JSON：route / tool / args / confidence',
      'kb_rag · tool_call · direct · fallback',
      'decider 失败 → 熔断走完整 agent loop',
    ],
  },
  {
    step: '05',
    title: '执行与生成',
    desc: '工具调用或直接生成',
    detail: [
      'tool_call：runAgentLoop 多轮工具调用 + 卡片收集',
      'kb_rag / direct：无工具直接生成（max_tokens 1200）',
      '统一清洗函数调用 markup',
    ],
  },
  {
    step: '06',
    title: '守卫与救援',
    desc: 'replyGuard + KB 兜底',
    detail: [
      '检测复读 / 空回答 / markup → 重试一次',
      '仍无效且 KB topScore ≥ 3 → 基于 KB 重生成',
      '最终仍失败 → 兜底引导话术',
    ],
  },
  {
    step: '07',
    title: '落库与返回',
    desc: '异步持久化 + 响应',
    detail: [
      'persistTurn 写入 messages / session_memory',
      'ctx.waitUntil 不阻塞响应',
      '返回 { answer, cards, route, sessionId }',
    ],
  },
]

export interface DbTable {
  name: string
  cn: string
  cols: { name: string; type: string; note: string }[]
  indexes?: string[]
  note: string
}

export const DB_TABLES: DbTable[] = [
  {
    name: 'sessions',
    cn: '会话登记',
    cols: [
      { name: 'session_id', type: 'TEXT PK', note: '会话唯一标识，由前端生成' },
      { name: 'created_at', type: 'INTEGER', note: '首次创建时间戳' },
      { name: 'last_active', type: 'INTEGER', note: '最近活跃时间戳' },
      { name: 'ua', type: 'TEXT', note: 'User-Agent，用于设备维度排查' },
    ],
    note: '闸门限流与活跃度统计的基准表；ON CONFLICT 更新避免重复插入。',
  },
  {
    name: 'messages',
    cn: '对话审计流水',
    cols: [
      { name: 'id', type: 'INTEGER PK', note: '自增主键' },
      { name: 'session_id', type: 'TEXT', note: '外键指向 sessions' },
      { name: 'role', type: 'TEXT', note: 'user / assistant' },
      { name: 'content', type: 'TEXT', note: '消息正文' },
      { name: 'route', type: 'TEXT', note: '路由留痕：kb_rag / tool_call / …' },
      { name: 'ts', type: 'INTEGER', note: '写入时间戳' },
    ],
    indexes: ['idx_messages_session (session_id, ts)'],
    note: '支撑对话回放与路由分布分析；滚动摘要也从本表取最近 16 条。',
  },
  {
    name: 'session_memory',
    cn: '结构化会话记忆',
    cols: [
      { name: 'session_id', type: 'TEXT PK', note: '一会话一条' },
      { name: 'facts', type: 'TEXT', note: 'JSON：抽取的结构化事实' },
      { name: 'summary', type: 'TEXT', note: 'LLM 滚动摘要文本' },
      { name: 'last_query', type: 'TEXT', note: '上一轮用户提问（截断 200 字）' },
      { name: 'entities', type: 'TEXT', note: 'JSON：提及的店铺/品类实体' },
      { name: 'turns', type: 'INTEGER', note: '累计轮次，驱动摘要触发' },
      { name: 'updated_at', type: 'INTEGER', note: '更新时间戳' },
    ],
    note: '实现跨轮记忆的关键表；每 MEMORY_SUMMARY_EVERY=8 轮触发一次摘要压缩。',
  },
  {
    name: 'rate_events',
    cn: '限流事件',
    cols: [
      { name: 'id', type: 'INTEGER PK', note: '自增主键' },
      { name: 'session_id', type: 'TEXT', note: '限流维度 = 会话' },
      { name: 'ts', type: 'INTEGER', note: '请求时间戳' },
    ],
    indexes: ['idx_rate_session (session_id, ts)'],
    note: '滑动窗口计数（60s）；5% 概率触发过期清理，避免表无限增长。',
  },
]

export const KEY_NOTES = [
  {
    title: '模型密钥零泄漏',
    desc: 'LLM_API_KEY 仅存于 Pages 环境变量 / 机密，代码与 git 中均无明文；前端只调用同域 /api，密钥永不进入浏览器可见范围。',
  },
  {
    title: '推理模型截断防护',
    desc: 'dots3-note-prev 为推理型模型，reasoning_content 会抢占 token。decider（2000）、摘要（1200）、生成（1200）均显式设置上限，避免 content 被吃空。',
  },
  {
    title: '双保险回复质量',
    desc: 'replyGuard 拦截复读/空回答/函数调用 markup；若落到兜底话术且 KB 命中分 ≥ 3，则改用 KB 直接作答，显著降低误兜底率。',
  },
  {
    title: '薄适配 + 共享内核',
    desc: 'Pages Functions 只做转发，全部业务逻辑收敛在 agent-core/agent.ts 单文件。本地与线上运行同一份代码，避免逻辑分叉。',
  },
  {
    title: '对话全量可回放',
    desc: 'messages 表记录每轮 role / content / route / ts，可完整还原任意会话，并统计各路由占比，为调优 decider 提供数据依据。',
  },
  {
    title: '无外部 CDN 依赖',
    desc: '字体走系统字体栈，图标内联 SVG，KB 为编译期常量。除 LLM 调用外运行时零外部网络请求，国内访问稳定性最大化。',
  },
]
