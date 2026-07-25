# 小助手 · 真 Agent 部署指南

把「小助手」从一个纯前端规则脚本，升级为 **RAG + 工具调用的真 agent**。
架构分两层，互不依赖、可独立部署：

```
┌─────────────────────┐         POST /chat          ┌──────────────────────────┐
│  前端 (GitHub Pages) │ ─────────────────────────▶ │  Cloudflare Worker        │
│  React + AgentAssistant│◀─────────────────────────│  · 检索「商场知识库」      │
│  - 有后端: 调 agent  │    { answer, cards } JSON   │  · 调 LLM(OpenAI兼容)     │
│  - 无后端: 规则兜底  │                             │  · agent loop + 工具执行  │
└─────────────────────┘                             └──────────────────────────┘
                                                          │
                                                          ▼
                                                  你的 LLM（DeepSeek / OpenAI / 通义 / Kimi…）
                                                 密钥只存在 Worker 环境变量，不进浏览器
```

- **知识库**：`src/agent-kb/`（真实店铺 `mockData` + 设施/服务/FAQ/政策），前端与 Worker 共用。
- **工具**：`src/agent-kb/tools.ts`（search_stores / get_store_detail / compare_stores / get_facility / get_service / get_faq / get_traffic）。
- **系统提示词**：`src/agent-kb/prompt.ts`。
- **前端客户端**：`src/agent/agentClient.ts`。
- **Worker**：`worker/`。

---

## 一、部署 Cloudflare Worker（agent 大脑）

> 需要：Node.js、`wrangler`、一个 OpenAI 兼容的 LLM API Key。

```bash
cd worker

# 1. 登录 Cloudflare（首次需浏览器授权）
npx wrangler login

# 2. 选定厂商，编辑 worker/wrangler.toml 的 LLM_BASE_URL / LLM_MODEL
#    DeepSeek（默认）：BASE=https://api.deepseek.com/v1  MODEL=deepseek-chat
#    OpenAI：         BASE=https://api.openai.com/v1     MODEL=gpt-4o-mini
#    通义千问：       BASE=https://dashscope.aliyuncs.com/compatible-mode/v1  MODEL=qwen-plus
#    月之暗面 Kimi：  BASE=https://api.moonshot.cn/v1    MODEL=moonshot-v1-8k

# 3. 设置密钥（只走 secret，不会进代码库）
npx wrangler secret put LLM_API_KEY      # 粘贴你的 API Key

# 4. 部署
npx wrangler deploy
# 终端会输出类似 https://bfc-agent.<subdomain>.workers.dev 的地址
```

记下这个 Worker 地址，下一步要用。

---

## 二、把 Worker 地址接到前端

### 方式 A：GitHub Pages（推荐，自动化）
仓库已配置 Pages 工作流。只需在仓库 **Settings → Secrets and variables → Actions** 加一个仓库密钥：

- Name: `AGENT_API_URL`
- Value: 你的 Worker 地址（如 `https://bfc-agent.xxx.workers.dev`）

工作流构建时会把它注入 `VITE_AGENT_API_URL`（见 `.github/workflows/deploy.yml`）。
之后任意一次 push 到 `main` 都会重新部署前端并启用真 agent。

### 方式 B：本地开发
```bash
cp .env.example .env.local
# 编辑 .env.local，填入 VITE_AGENT_API_URL=https://...workers.dev
npm run dev
```

> 不设置 `VITE_AGENT_API_URL` 时，前端自动回退到「离线规则引擎」，网站照常可用。

---

## 三、验证

1. 打开站点，右下角「小助手」气泡。
2. 问它：「约会去哪吃」「BFC 停车怎么收费」「带狗能进吗」「老吉堂在几楼」「A 和 B 哪个好」。
3. 真 agent 模式下，回答由 LLM 生成并基于知识库，店铺/对比会渲染成卡片；规则模式下则走原来的关键词引擎。

---

## 四、常见问题

- **CORS 报错**：Worker 已返回 `Access-Control-Allow-Origin: *`，若仍报错请确认前端调用的地址与 Worker 部署地址一致。
- **返回「连不上」**：检查 Worker 的 `LLM_API_KEY` secret 是否已设置、`LLM_BASE_URL` 是否含 `/v1` 且不要带尾斜杠。
- **想换模型**：改 `worker/wrangler.toml` 的 `LLM_MODEL` 后重新 `wrangler deploy`。
- **知识库要扩内容**：直接在 `src/agent-kb/*.ts` 增删条目，前端与 Worker 同时生效。
- **更强检索**：当前是关键词/二元组检索；若店铺很多，可换成 embedding + 向量库（在 Worker 内做）。
