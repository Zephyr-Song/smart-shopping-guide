import { useState } from 'react'
import {
  Layers,
  GitBranch,
  Database,
  ChevronRight,
  Cpu,
  Server,
  HardDrive,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import {
  LAYERS,
  DEPLOY_SUMMARY,
  DATA_FLOW,
  DB_TABLES,
  KEY_NOTES,
  type ArchNode,
} from '../data/architecture'

type TabKey = 'arch' | 'flow' | 'db'

const TABS: { key: TabKey; label: string; icon: typeof Layers }[] = [
  { key: 'arch', label: '系统架构图', icon: Layers },
  { key: 'flow', label: '数据交互走向', icon: GitBranch },
  { key: 'db', label: '数据库交互图', icon: Database },
]

const ACCENT: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  gold: { bg: 'bg-bfc-gold-50', border: 'border-bfc-gold-300/60', dot: 'bg-bfc-gold-400', text: 'text-bfc-gold-800' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300/60', dot: 'bg-amber-400', text: 'text-amber-800' },
  jade: { bg: 'bg-emerald-50', border: 'border-emerald-300/60', dot: 'bg-emerald-400', text: 'text-emerald-800' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-300/60', dot: 'bg-slate-400', text: 'text-slate-700' },
}

const LAYER_ICON: Record<string, typeof Layers> = {
  access: Globe,
  gateway: ShieldCheck,
  app: Server,
  intel: Cpu,
  external: Cpu,
  storage: HardDrive,
}

export default function Architecture() {
  const [tab, setTab] = useState<TabKey>('arch')

  return (
    <div className="space-y-8 -mt-2">
      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition cursor-pointer border ${
                active
                  ? 'bg-bfc-gold text-white border-bfc-gold shadow-bfc'
                  : 'bg-white/70 text-bfc-warm-gray border-bfc-gold-200/60 hover:text-bfc-charcoal hover:border-bfc-gold-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'arch' && <ArchView />}
      {tab === 'flow' && <FlowView />}
      {tab === 'db' && <DbView />}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tab 1 — 系统架构图                                                        */
/* -------------------------------------------------------------------------- */

function ArchView() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-[26px] font-semibold text-bfc-charcoal mb-2">
          系统架构图（五层）
        </h1>
        <p className="text-sm text-bfc-warm-gray leading-relaxed max-w-4xl">
          <span className="font-medium text-bfc-charcoal">部署形态：</span>
          <span className="text-bfc-gold-700"> Cloudflare Pages</span> 静态前端（dist）
          <span className="mx-1.5 text-bfc-gold-300">+</span>
          <span className="text-bfc-gold-700">Pages Functions</span>（/api/*）
          <span className="mx-1.5 text-bfc-gold-300">+</span>
          <span className="text-bfc-gold-700">D1 托管 SQLite</span>
          <span className="mx-1.5 text-bfc-gold-300">|</span>
          智能能力集中于 L3 共享内核
        </p>
        <span className="hidden">{DEPLOY_SUMMARY}</span>
      </div>

      {/* Layers */}
      <div className="space-y-3">
        {LAYERS.map((layer, li) => {
          const isCollapsed = collapsed[layer.id]
          const LayerIcon = LAYER_ICON[layer.id] || Layers
          return (
            <div key={layer.id}>
              <div className="flex items-stretch gap-3">
                {/* Layer label */}
                <div className="w-[92px] sm:w-[110px] shrink-0 rounded-2xl bg-bfc-gold text-white flex flex-col items-center justify-center py-4 px-2 shadow-bfc">
                  <LayerIcon className="w-4 h-4 mb-1.5 opacity-90" />
                  <div className="text-[11px] font-semibold tracking-wider opacity-90">
                    {layer.code}
                  </div>
                  <div className="text-[13px] font-semibold text-center leading-tight mt-0.5">
                    {layer.name}
                  </div>
                  <div className="text-[9px] text-center opacity-80 mt-1 leading-tight px-1">
                    {layer.desc}
                  </div>
                </div>

                {/* Nodes */}
                <div className="flex-1 rounded-2xl border border-bfc-gold-200/50 bg-white/60 p-3 shadow-bfc">
                  <div
                    className={`grid gap-3 ${
                      layer.nodes.length === 1
                        ? 'grid-cols-1'
                        : layer.nodes.length === 2
                          ? 'sm:grid-cols-2'
                          : layer.nodes.length === 3
                            ? 'sm:grid-cols-3'
                            : 'sm:grid-cols-2 lg:grid-cols-4'
                    }`}
                  >
                    {(isCollapsed ? layer.nodes.slice(0, 3) : layer.nodes).map(node => (
                      <NodeCard key={node.title} node={node} />
                    ))}
                  </div>

                  {layer.nodes.length > 3 && (
                    <button
                      onClick={() => toggle(layer.id)}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] text-bfc-gold-700 hover:text-bfc-gold-800 transition cursor-pointer border-none bg-transparent"
                    >
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                      />
                      {isCollapsed
                        ? `展开剩余 ${layer.nodes.length - 3} 个组件`
                        : '收起'}
                    </button>
                  )}
                </div>
              </div>

              {/* Connector */}
              {li < LAYERS.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-bfc-gold-300" />
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-bfc-gold-400" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Key notes */}
      <div className="rounded-2xl bg-bfc-gold-50 border border-bfc-gold-200/70 p-5">
        <div className="text-[13px] font-semibold text-bfc-gold-800 mb-3">关键标注</div>
        <ul className="space-y-2.5">
          {KEY_NOTES.map((n, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-bfc-gold-400 mt-[7px] shrink-0" />
              <span className="text-bfc-charcoal/85">
                <span className="font-semibold text-bfc-gold-800">{n.title}：</span>
                {n.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function NodeCard({ node }: { node: ArchNode }) {
  const a = ACCENT[node.accent || 'gold']
  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-3 h-full`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
        <span className={`text-[12.5px] font-semibold ${a.text} leading-tight`}>
          {node.title}
        </span>
      </div>
      {node.subtitle && (
        <div className="text-[10.5px] text-bfc-warm-gray mb-1.5 -mt-1 pl-3">
          {node.subtitle}
        </div>
      )}
      <ul className="space-y-1">
        {node.items.map((it, i) => (
          <li key={i} className="text-[11.5px] text-bfc-charcoal/75 leading-snug pl-3 relative">
            <span className="absolute left-0 top-[6px] w-1 h-1 rounded-full bg-bfc-warm-gray/50" />
            {it.k && <span className="text-bfc-warm-gray mr-1">{it.k}</span>}
            {it.v}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tab 2 — 数据交互走向                                                       */
/* -------------------------------------------------------------------------- */

function FlowView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-semibold text-bfc-charcoal mb-2">
          数据交互走向
        </h1>
        <p className="text-sm text-bfc-warm-gray">
          一次导购问答请求，从浏览器到落库的完整生命周期 —— 七步闭环。
        </p>
      </div>

      <div className="relative">
        {/* vertical rail */}
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-bfc-gold-300 via-bfc-gold-200 to-transparent" />

        <div className="space-y-4">
          {DATA_FLOW.map(s => (
            <div key={s.step} className="flex gap-4 relative">
              <div className="relative z-10 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white border border-bfc-gold-200 flex flex-col items-center justify-center shadow-bfc">
                  <span className="text-[15px] font-semibold text-bfc-gold-700 leading-none">
                    {s.step}
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-2xl border border-bfc-gold-200/50 bg-white/70 p-4 shadow-bfc">
                <div className="flex items-baseline gap-2 flex-wrap mb-2">
                  <h3 className="text-[15px] font-semibold text-bfc-charcoal">{s.title}</h3>
                  <span className="text-[11.5px] text-bfc-warm-gray">{s.desc}</span>
                </div>
                <ul className="space-y-1.5">
                  {s.detail.map((d, j) => (
                    <li key={j} className="flex gap-2 text-[12.5px] text-bfc-charcoal/75 leading-relaxed">
                      <span className="text-bfc-gold-400 shrink-0">›</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route legend */}
      <div className="rounded-2xl border border-bfc-gold-200/60 bg-white/60 p-5">
        <div className="text-[13px] font-semibold text-bfc-charcoal mb-3">四路分流说明</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { r: 'kb_rag', d: '知识性问题：品牌位置、楼层、场馆介绍', c: 'gold' },
            { r: 'tool_call', d: '结构化查询：找店、比价、设施、客流、FAQ', c: 'jade' },
            { r: 'direct', d: '寒暄、创意类，无需数据与检索', c: 'slate' },
            { r: 'fallback', d: '超出 BFC 范围或无法理解，走引导话术', c: 'amber' },
          ].map(x => {
            const a = ACCENT[x.c]
            return (
              <div key={x.r} className={`rounded-xl border ${a.border} ${a.bg} p-3`}>
                <div className={`text-[12px] font-mono font-semibold ${a.text} mb-1`}>{x.r}</div>
                <div className="text-[11.5px] text-bfc-charcoal/75 leading-snug">{x.d}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tab 3 — 数据库交互图                                                       */
/* -------------------------------------------------------------------------- */

function DbView() {
  const totalCols = DB_TABLES.reduce((n, t) => n + t.cols.length, 0)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-semibold text-bfc-charcoal mb-2">
          D1 数据库交互图
          <span className="text-base font-normal text-bfc-warm-gray ml-2">
            （{DB_TABLES.length} 表 · {totalCols} 字段）
          </span>
        </h1>
        <p className="text-sm text-bfc-warm-gray">
          Cloudflare D1（托管 SQLite）· binding <code className="text-bfc-gold-700 bg-bfc-gold-50 px-1.5 py-0.5 rounded text-[12px]">DB</code>
          <span className="mx-1.5">→</span>
          bfc-agent-db · migrations 目录 <code className="text-bfc-gold-700 bg-bfc-gold-50 px-1.5 py-0.5 rounded text-[12px]">migrations/0001_init.sql</code>
        </p>
      </div>

      {/* ER overview */}
      <div className="rounded-2xl border border-bfc-gold-200/60 bg-white/60 p-5 shadow-bfc">
        <div className="text-[13px] font-semibold text-bfc-charcoal mb-4">表关系总览</div>
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          <ErBox name="sessions" cn="会话登记" cols={4} highlight />
          <div className="flex items-center justify-center text-bfc-gold-400 shrink-0">
            <ChevronRight className="w-5 h-5 hidden lg:block" />
            <span className="lg:hidden text-[11px]">1 : N</span>
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-3">
            <ErBox name="messages" cn="对话审计流水" cols={6} />
            <ErBox name="session_memory" cn="结构化记忆" cols={7} />
          </div>
          <div className="flex items-center justify-center text-bfc-gold-400 shrink-0">
            <ChevronRight className="w-5 h-5 hidden lg:block" />
            <span className="lg:hidden text-[11px]">旁路</span>
          </div>
          <ErBox name="rate_events" cn="限流计数" cols={3} />
        </div>
        <p className="text-[11.5px] text-bfc-warm-gray mt-3 leading-relaxed">
          sessions 为中心：messages 与 session_memory 通过 session_id 关联（1:N）；
          rate_events 独立按 session_id + ts 做滑动窗口计数，不参与业务查询。
        </p>
      </div>

      {/* Table details */}
      <div className="grid lg:grid-cols-2 gap-4">
        {DB_TABLES.map(t => (
          <div key={t.name} className="rounded-2xl border border-bfc-gold-200/60 bg-white/70 overflow-hidden shadow-bfc">
            <div className="px-4 py-3 bg-bfc-gold-50 border-b border-bfc-gold-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-bfc-gold-600" />
                <span className="text-[13px] font-mono font-semibold text-bfc-gold-800">
                  {t.name}
                </span>
              </div>
              <span className="text-[11px] text-bfc-warm-gray">{t.cn}</span>
            </div>
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-bfc-warm-gray border-b border-bfc-gold-200/40">
                  <th className="text-left font-medium px-4 py-2">字段</th>
                  <th className="text-left font-medium px-2 py-2 w-[92px]">类型</th>
                  <th className="text-left font-medium px-2 py-2 pr-4">说明</th>
                </tr>
              </thead>
              <tbody>
                {t.cols.map(c => (
                  <tr key={c.name} className="border-b border-bfc-gold-200/20 last:border-0">
                    <td className="px-4 py-2 font-mono text-bfc-charcoal">{c.name}</td>
                    <td className="px-2 py-2 text-bfc-gold-700 font-mono text-[10.5px]">{c.type}</td>
                    <td className="px-2 py-2 pr-4 text-bfc-charcoal/70">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {t.indexes?.length ? (
              <div className="px-4 py-2.5 bg-bfc-gold-50/50 border-t border-bfc-gold-200/40">
                {t.indexes.map(ix => (
                  <div key={ix} className="text-[10.5px] font-mono text-bfc-gold-700">
                    INDEX {ix}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="px-4 py-3 border-t border-bfc-gold-200/40 bg-white/50">
              <p className="text-[11.5px] text-bfc-warm-gray leading-relaxed">{t.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ops */}
      <div className="rounded-2xl bg-bfc-gold-50 border border-bfc-gold-200/70 p-5">
        <div className="text-[13px] font-semibold text-bfc-gold-800 mb-3">运维命令</div>
        <div className="space-y-2 font-mono text-[11.5px] text-bfc-charcoal/85">
          {[
            'wrangler d1 create bfc-agent-db',
            'wrangler d1 migrations apply bfc-agent-db --remote',
            'wrangler d1 execute bfc-agent-db --remote --command "SELECT COUNT(*) FROM messages"',
          ].map(c => (
            <div key={c} className="bg-white/70 border border-bfc-gold-200/50 rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">
              <span className="text-bfc-gold-500 mr-2">$</span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErBox({
  name,
  cn,
  cols,
  highlight,
}: {
  name: string
  cn: string
  cols: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? 'border-bfc-gold-400 bg-bfc-gold-100 shadow-bfc'
          : 'border-bfc-gold-200/70 bg-bfc-gold-50/60'
      }`}
    >
      <div className="text-[12.5px] font-mono font-semibold text-bfc-gold-800">{name}</div>
      <div className="text-[10.5px] text-bfc-warm-gray mt-0.5">{cn}</div>
      <div className="text-[10.5px] text-bfc-gold-700 mt-1.5">{cols} 字段</div>
    </div>
  )
}
