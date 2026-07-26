// 小助手 Agent —— 全局浮动对话助手组件
// 挂在 Layout 里即可在所有页面右下角出现一个「小助手」气泡，点击展开对话面板。
// 纯前端、基于真实数据（mockData）的离线推理，无需任何后端或 API key。

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send, Sparkles, Star, MapPin, Wallet, Flame, RotateCcw } from 'lucide-react'
import type { AgentCard, AgentContext, AgentMessage } from './agentTypes'
import { runAgent } from './agentEngine'
import { callAgent, AGENT_API_URL } from './agentClient'
import { SUGGESTIONS, WELCOME_TEXT } from './suggestions'

function uid(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function AgentAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([
    { id: 'welcome', role: 'assistant', text: WELCOME_TEXT },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [ctx, setCtx] = useState<AgentContext>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking, open])

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!text || thinking) return
    const userMsg: AgentMessage = { id: uid(), role: 'user', text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setThinking(true)
    try {
      if (AGENT_API_URL) {
        // 真·LLM agent（RAG + 工具调用），由 Cloudflare Worker 托管
        const { answer, cards } = await callAgent(history)
        setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: answer, cards }])
      } else {
        // 未配置后端 → 离线规则引擎兜底
        await new Promise(r => setTimeout(r, 450))
        const { reply, newCtx } = runAgent(text, ctx)
        setCtx(newCtx)
        setMessages(prev => [...prev, reply])
      }
    } catch {
      // 真 agent 异常（网络/超时/密钥缺失）→ 回退规则引擎，保证可用
      const { reply, newCtx } = runAgent(text, ctx)
      setCtx(newCtx)
      setMessages(prev => [...prev, reply])
    } finally {
      setThinking(false)
    }
  }

  const reset = () => {
    setMessages([{ id: 'welcome', role: 'assistant', text: WELCOME_TEXT }])
    setCtx({})
  }

  const onAction = (card: Extract<AgentCard, { type: 'action' }>) => {
    if (card.to) {
      navigate(card.to)
      setOpen(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes agent-pop { 0%{transform:scale(.6);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes agent-rise { 0%{transform:translateY(16px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes agent-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,.45)} 50%{box-shadow:0 0 0 12px rgba(168,85,247,0)} }
        @keyframes agent-typing { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        .agent-bubble-btn{ animation: agent-pulse 2.4s infinite; }
        .agent-panel{ animation: agent-rise .22s ease-out; }
        .agent-msg{ animation: agent-pop .2s ease-out; }
        .agent-dot{ animation: agent-typing 1.2s infinite; }
        .agent-scroll::-webkit-scrollbar{ width:6px }
        .agent-scroll::-webkit-scrollbar-thumb{ background:#e5e7eb; border-radius:9999px }
      `}</style>

      {/* 浮动气泡 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="打开 BFC 导购助手"
          className="agent-bubble-btn fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-amber-400 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full">
            导购助手
          </span>
        </button>
      )}

      {/* 对话面板 */}
      {open && (
        <div className="agent-panel fixed bottom-5 right-5 z-[60] w-[min(92vw,400px)] h-[min(78vh,620px)] bg-white rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden border border-gray-100">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">BFC 导购助手</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                aria-label="重新对话"
                className="p-1.5 rounded-lg hover:bg-white/15 transition cursor-pointer text-white/90 border-none bg-transparent"
                title="重新对话"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="p-1.5 rounded-lg hover:bg-white/15 transition cursor-pointer text-white border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 消息区 */}
          <div ref={scrollRef} className="agent-scroll flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50">
            {messages.map(m => (
              <MessageBubble key={m.id} msg={m} onAction={onAction} />
            ))}
            {thinking && (
              <div className="agent-msg flex items-center gap-2">
                <Avatar />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="agent-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="agent-dot w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '.2s' }} />
                  <span className="agent-dot w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* 建议 chips */}
          <div className="px-3 pb-1 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2 bg-white">
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[11px] text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-full px-2.5 py-1 transition cursor-pointer border-none"
              >
                {s}
              </button>
            ))}
          </div>

          {/* 输入区 */}
          <form
            onSubmit={e => {
              e.preventDefault()
              send(input)
            }}
            className="p-3 flex items-center gap-2 bg-white border-t border-gray-100"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="问问 BFC 导购助手：约会去哪吃？"
              className="flex-1 text-sm px-3 py-2.5 rounded-xl bg-gray-100 border-none outline-none focus:ring-2 focus:ring-primary-300 text-gray-800 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-600 transition cursor-pointer border-none flex-shrink-0"
              aria-label="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------

function renderRich(text: string): string {
  const escaped = (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function Avatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
  )
}

function MessageBubble({
  msg,
  onAction,
}: {
  msg: AgentMessage
  onAction: (card: Extract<AgentCard, { type: 'action' }>) => void
}) {
  if (msg.role === 'user') {
    return (
      <div className="agent-msg flex justify-end">
        <div
          className="max-w-[80%] bg-primary-500 text-white text-sm rounded-2xl rounded-tr-sm px-3.5 py-2.5 whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: renderRich(msg.text ?? '') }}
        />
      </div>
    )
  }
  return (
    <div className="agent-msg flex items-start gap-2">
      <Avatar />
      <div className="max-w-[85%] space-y-2">
        {msg.text && (
          <div
            className="bg-white border border-gray-100 text-sm text-gray-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: renderRich(msg.text ?? '') }}
          />
        )}
        {msg.cards?.map((card, i) => (
          <CardView key={i} card={card} onAction={onAction} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function CardView({
  card,
  onAction,
}: {
  card: AgentCard
  onAction: (card: Extract<AgentCard, { type: 'action' }>) => void
}) {
  switch (card.type) {
    case 'store':
      return <StoreCard card={card} />
    case 'category':
      return (
        <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm">
          <span className="text-lg">{card.icon}</span>
          <span className="font-medium text-gray-800">{card.name}</span>
          <span className="text-xs text-gray-400">· {card.count} 家</span>
        </div>
      )
    case 'info':
      return (
        <div className="bg-primary-50 border border-primary-100 rounded-xl px-3 py-2 text-sm text-primary-700">
          {card.title && <div className="font-semibold mb-0.5">{card.title}</div>}
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderRich(card.text ?? '') }} />
        </div>
      )
    case 'action':
      return (
        <button
          onClick={() => onAction(card)}
          className="w-full text-left bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl px-4 py-3 transition cursor-pointer border-none flex items-center justify-between"
        >
          <span>{card.label}</span>
          <span className="text-white/80">→</span>
        </button>
      )
    case 'compare':
      return (
        <div className="grid grid-cols-2 gap-2">
          {card.stores.map((s, i) => (
            <StoreCard key={i} card={s} compact />
          ))}
        </div>
      )
    default:
      return null
  }
}

function heatColor(h: number): string {
  if (h >= 0.8) return '#ef4444'
  if (h >= 0.5) return '#f59e0b'
  return '#22c55e'
}

function StoreCard({ card, compact }: { card: Extract<AgentCard, { type: 'store' }>; compact?: boolean }) {
  const color = card.color || '#8b5cf6'
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${color}18`, color }}
        >
          {card.icon} {card.category}
        </span>
        <span className="flex items-center gap-0.5 text-xs text-amber-500">
          <Star className="w-3 h-3 fill-amber-400" />
          {card.rating}
        </span>
      </div>
      <div className="mt-1.5 font-semibold text-gray-900 text-sm">{card.name}</div>
      {!compact && card.reason && (
        <div className="mt-1 inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-1 rounded-lg">
          💡 {card.reason}
        </div>
      )}
      <div className={`mt-2 flex items-center gap-3 text-xs text-gray-400 ${compact ? 'flex-col items-start gap-0.5' : ''}`}>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {card.floor}
        </span>
        <span className="flex items-center gap-1">
          <Wallet className="w-3 h-3" />
          人均 ¥{card.avgPrice.toLocaleString()}
        </span>
        {!compact && (
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3" style={{ color: heatColor(card.heatmap) }} />
            热度 {(card.heatmap * 100).toFixed(0)}%
          </span>
        )}
      </div>
      {!compact && card.matchPercent != null && (
        <div className="mt-2">
          <div className="text-[11px] text-gray-400 mb-0.5">匹配度 {card.matchPercent}%</div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${card.matchPercent}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
