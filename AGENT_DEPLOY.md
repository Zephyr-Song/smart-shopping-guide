# 小助手 · 部署与架构指南（Cloudflare Pages 一体化）

「小助手」已从"GitHub Pages 静态前端 + 独立 Worker"两套部署，**重构为 Cloudflare Pages 一体化**：
前端与智能层同域，不再需要跨域、`AGENT_URL` 密钥。

## 架构

```
┌──────────────────────────────────────────────────────────┐
│  Cloudflare Pages（同域）                                 │
│                                                           │
│   静态前端（dist）          Functions（/api/*）            │
│   React 19 + Vite      ───▶  agent.ts / health.ts         │
│                                │                          │
└────────────────────────────────┼──────────────────────────┘
                                 ▼
                    共享内核 agent-core/agent.ts
                    · 闸门(Origin + 限流)
                    · D1 会话记忆装配
                    · decider 意图决策 → 四路分流
                    · TOOL_REGISTRY 工具链（链步 ≤3）
                    · replyGuard 复读守卫
                    · waitUntil 异步落库
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        本地知识库 KB        D1 SQLite         LLM（OpenAI 兼容）
        src/agent-kb/      会话/消息/记忆      qwen3.7-flash
```

**设计原则：共享内核 + 薄适配层**

| 目录 | 职责 |
|---|---|
| `agent-core/agent.ts` | 智能层共享内核，全部业务逻辑在此 |
| `functions/api/*.ts` | Pages Functions 薄封装（主部署方式） |
| `worker/index.ts` | 独立 Worker 薄封装（可选，单独部署时用） |
| `src/agent-kb/` | 知识库、工具定义、系统提示词（前端与服务端共用） |
| `migrations/` | D1 表结构 |
| `wrangler.toml` | Pages 配置（根目录） |

---

## 一、本地开发

需要两个终端（前端热更新 + Functions 同域）：

```bash
# 终端 1：Functions（含 D1，默认 8788）
npm run build
npx wrangler pages dev dist

# 终端 2：前端热更新（5173，/api 已配置代理到 8788）
npm run dev
```

打开 <http://localhost:5173>，右下角「小助手」即可对话。
也可以只用 `npx wrangler pages dev dist`，前端与 `/api` 都在 8788（无热更新）。

首次使用需建本地表：

```bash
npx wrangler d1 migrations apply bfc-agent-db --local
```

密钥放根目录 `.dev.vars`（已 gitignore）：

```
LLM_BASE_URL=https://.../compatible-mode/v1
LLM_MODEL=qwen3.7-flash
LLM_API_KEY=sk-xxx
```

---

## 二、部署到 Cloudflare Pages

```bash
# 1. 登录
npx wrangler login

# 2. 建 D1 数据库，把返回的 database_id 填进 wrangler.toml
npx wrangler d1 create bfc-agent-db

# 3. 建表
npx wrangler d1 migrations apply bfc-agent-db --remote

# 4. 部署（前端 + Functions 一起）
npm run pages:deploy
```

生产环境变量在 **Cloudflare Pages 控制台 → Settings → Environment variables** 设置：

| 变量 | 说明 |
|---|---|
| `LLM_API_KEY` | **必须**，密钥，不要写进仓库 |
| `LLM_BASE_URL` | 已在 `wrangler.toml` 明文配置 |
| `LLM_MODEL` | 默认 `qwen3.7-flash` |

> 也可在 Cloudflare 控制台把仓库连到 Pages，**push 即自动构建部署**（构建命令 `npm run build`，输出目录 `dist`）。

---

## 三、验证

```bash
curl https://bfc-shopping-guide.pages.dev/api/health
curl -X POST https://bfc-shopping-guide.pages.dev/api/agent \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"预算500两个人吃什么？"}]}'
```

或在 GitHub 上手动触发 **Agent Smoke Test** 工作流（`.github/workflows/agent-smoke.yml`）。

---

## 四、模型说明

- **主模型 `qwen3.7-flash`**：具备对话能力，真正走 decider → 工具调用 / RAG。
- **`qwen3.5-ocr` 是纯 OCR 模型，不能对话**：给它 system prompt 只会原样复读，已不再作为主模型。
  它的正确用途是"图片转文字"（如拍照识别楼层导视牌/菜单），将来要做图片上传功能时可单独调用。
- 备用通道 `LLM_MODEL_FALLBACK` 在主模型 403/429 时自动切换。

---

## 五、数据准确性原则（重要）

**严禁让模型编造数据。** 知识库 `src/agent-kb/` 里没有的楼层/价格，模型必须如实说明"资料中未标注"，
不能凭空生成。系统提示词 `src/agent-kb/prompt.ts` 已写入该约束。

> 已知数据缺口：`博悦汇影城` 只在娱乐知识库（`entertainment.ts`）中，且未记录具体楼层，
> 因此"博悦汇影城在几楼"会如实回答"未标注具体楼层"。如需精确楼层，把真实楼层补进知识库即可，
> 不需要改任何代码。

---

## 六、常见问题

- **本地 500 / 限流报错**：先跑 `npx wrangler d1 migrations apply bfc-agent-db --local` 建表。
- **改了 `agent-core/` 没生效**：重启 `wrangler pages dev`（该目录不在 vite 监听范围）。
- **想换模型**：改 `wrangler.toml` 的 `LLM_MODEL` 后重新部署。
- **前端没走大模型**：确认 `VITE_AGENT_API_URL` 未设置时会默认同域 `/api/agent`；
  若 `/api` 不可用，前端会自动回退离线规则引擎（网站照常可用）。
- **扩展知识库**：直接改 `src/agent-kb/*.ts`，前端与服务端同时生效。
