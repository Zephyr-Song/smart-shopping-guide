import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquareText,
} from 'lucide-react'
import BFCLogo from '../BFCLogo'
import type { AgentCard, AgentContext, AgentMessage } from './agentTypes'
import { runAgent } from './agentEngine'
import { callAgent, AGENT_API_URL } from './agentClient'
import { SUGGESTIONS, WELCOME_TEXT } from './suggestions'

function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function uid(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const ROUTE_LABEL: Record<string, { label: string; desc: string }> = {
  kb_rag: { label: '知识库检索', desc: '基于 BFC 商场知识库直接检索并生成回答' },
  tool_call: { label: '工具调用', desc: '调用店铺搜索/对比等工具获取结构化数据' },
  direct: { label: '直接回答', desc: '无需检索，直接由模型生成回答' },
  fallback: { label: '兜底响应', desc: '模型判定问题超出范围，已转本地规则引擎' },
  local_fallback: { label: '本地兜底', desc: '网络或服务异常，已切换到离线规则引擎' },
}

export default function AgentAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([
    { id: 'welcome', role: 'assistant', text: WELCOME_TEXT },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [ctx, setCtx] = useState<AgentContext>({})
  const [sessionId, setSessionId] = useState(() => newSessionId())
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
        const { answer, cards, route } = await callAgent(history, { sessionId })
        if (route === 'fallback') {
          const local = runAgent(text, ctx)
          setCtx(local.newCtx)
          setMessages(prev => [
            ...prev,
            { id: uid(), role: 'assistant', text: local.reply.text, cards: local.reply.cards, route: 'local_fallback' },
          ])
          return
        }
        setMessages(prev => [
          ...prev,
          { id: uid(), role: 'assistant', text: answer, cards, route },
        ])
      } else {
        await new Promise(r => setTimeout(r, 450))
        const { reply, newCtx } = runAgent(text, ctx)
        setCtx(newCtx)
        setMessages(prev => [
          ...prev,
          { id: uid(), role: 'assistant', text: reply.text, cards: reply.cards, route: 'local_fallback' },
        ])
      }
    } catch {
      const { reply, newCtx } = runAgent(text, ctx)
      setCtx(newCtx)
      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'assistant', text: reply.text, cards: reply.cards, route: 'local_fallback' },
      ])
    } finally {
      setThinking(false)
    }
  }

  const reset = () => {
    setMessages([{ id: 'welcome', role: 'assistant', text: WELCOME_TEXT }])
    setCtx({})
    setSessionId(newSessionId())
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
        @keyframes bfc-pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes bfc-rise { 0%{transform:translateY(16px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes bfc-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,.35)} 50%{box-shadow:0 0 0 14px rgba(201,169,110,0)} }
        @keyframes bfc-typing { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-4px);opacity:1} }
        .bfc-bubble-btn{ animation: bfc-pulse 2.8s infinite; }
        .bfc-panel{ animation: bfc-rise .24s cubic-bezier(.22,1,.36,1); }
        .bfc-msg{ animation: bfc-pop .2s cubic-bezier(.22,1,.36,1); }
        .bfc-dot{ animation: bfc-typing 1.3s infinite; }
        .bfc-scroll::-webkit-scrollbar{ width:5px }
        .bfc-scroll::-webkit-scrollbar-thumb{ background:rgba(201,169,110,.35); border-radius:9999px }
      `}</style>

      {/* 浮动气泡 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="打开 BFC 导购助手"
          className="bfc-bubble-btn fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-white border border-bfc-gold-200 shadow-bfc-lift flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
        >
          <BFCLogo size={30} showText={false} variant="gold" />
        </button>
      )}

      {/* 对话面板 */}
      {open && (
        <div className="bfc-panel fixed bottom-5 right-5 z-[60] w-[min(92vw,420px)] h-[min(80vh,680px)] bg-bfc-cream border border-bfc-gold-200/70 rounded-[1.75rem] shadow-bfc-lift flex flex-col overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-white/80 border-b border-bfc-gold-200/50">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-bfc-gold-100 flex items-center justify-center">
                <BFCLogo size={24} showText={false} variant="gold" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-bfc-charcoal">BFC 导购助手</div>
                <div className="flex items-center gap-1.5 text-[11px] text-bfc-warm-gray">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  在线
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={reset}
                aria-label="重新对话"
                className="p-2 rounded-lg hover:bg-bfc-gold-100 transition cursor-pointer text-bfc-warm-gray border-none bg-transparent"
                title="重新对话"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="p-2 rounded-lg hover:bg-bfc-gold-100 transition cursor-pointer text-bfc-charcoal border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 消息区 */}
          <div ref={scrollRef} className="bfc-scroll flex-1 overflow-y-auto px-3.5 py-4 space-y-4 bg-bfc-cream/70">
            {messages.map(m => (
              <MessageBubble key={m.id} msg={m} onAction={onAction} />
            ))}
            {thinking && (
              <div className="bfc-msg flex items-start gap-2.5">
                <Avatar />
                <div className="bg-white border border-bfc-gold-200/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <span className="bfc-dot w-1.5 h-1.5 bg-bfc-gold-400 rounded-full" />
                  <span className="bfc-dot w-1.5 h-1.5 bg-bfc-gold-400 rounded-full" style={{ animationDelay: '.2s' }} />
                  <span className="bfc-dot w-1.5 h-1.5 bg-bfc-gold-400 rounded-full" style={{ animationDelay: '.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* 建议 chips */}
          <div className="px-3.5 pb-2 flex flex-wrap gap-2 border-t border-bfc-gold-200/40 pt-3 bg-white/50">
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[11px] text-bfc-gold-700 bg-bfc-gold-50 hover:bg-bfc-gold-100 border border-bfc-gold-200 rounded-full px-3 py-1.5 transition cursor-pointer"
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
            className="p-3 bg-white border-t border-bfc-gold-200/50"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="随便问我点什么..."
                className="flex-1 text-sm px-3.5 py-3 rounded-xl bg-bfc-cream border border-bfc-gold-200 outline-none focus:ring-2 focus:ring-bfc-gold-400/40 text-bfc-charcoal placeholder:text-bfc-warm-gray/60 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="w-11 h-11 rounded-xl bg-bfc-gold text-white flex items-center justify-center disabled:opacity-40 hover:bg-bfc-gold-600 transition cursor-pointer border-none flex-shrink-0 shadow-bfc"
                aria-label="发送"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
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
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

function Avatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-bfc-gold-100 flex items-center justify-center flex-shrink-0 border border-bfc-gold-200/50">
      <BFCLogo size={18} showText={false} variant="gold" />
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
  const [showReasoning, setShowReasoning] = useState(false)
  const routeInfo = msg.route ? ROUTE_LABEL[msg.route] : null

  if (msg.role === 'user') {
    return (
      <div className="bfc-msg flex justify-end">
        <div
          className="max-w-[82%] bg-bfc-gold text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 whitespace-pre-wrap break-words shadow-sm"
          dangerouslySetInnerHTML={{ __html: renderRich(msg.text ?? '') }}
        />
      </div>
    )
  }

  return (
    <div className="bfc-msg flex items-start gap-2.5">
      <Avatar />
      <div className="max-w-[85%] space-y-2">
        {routeInfo && (
          <button
            onClick={() => setShowReasoning(v => !v)}
            className="flex items-center gap-1 text-[11px] text-bfc-warm-gray hover:text-bfc-gold-700 transition cursor-pointer border-none bg-transparent p-0"
          >
            <Sparkles className="w-3 h-3" />
            <span>深度思考 · {routeInfo.label}</span>
            {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {showReasoning && routeInfo && (
          <div className="bg-bfc-gold-50 border border-bfc-gold-200/60 rounded-xl px-3 py-2 text-xs text-bfc-warm-gray leading-relaxed">
            {routeInfo.desc}
          </div>
        )}

        {msg.text && (
          <div
            className="bg-white border border-bfc-gold-200/60 text-sm text-bfc-charcoal rounded-2xl rounded-tl-sm px-4 py-3 whitespace-pre-wrap break-words shadow-sm"
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
        <div className="inline-flex items-center gap-2 bg-white border border-bfc-gold-200/60 rounded-xl px-3 py-2 text-sm shadow-sm">
          <span className="text-lg">{card.icon}</span>
          <span className="font-medium text-bfc-charcoal">{card.name}</span>
          <span className="text-xs text-bfc-warm-gray">· {card.count} 家</span>
        </div>
      )
    case 'info':
      return (
        <div className="bg-bfc-gold-50 border border-bfc-gold-200/60 rounded-xl px-3 py-2 text-sm text-bfc-gold-800">
          {card.title && <div className="font-semibold mb-0.5">{card.title}</div>}
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderRich(card.text ?? '') }} />
        </div>
      )
    case 'action':
      return (
        <button
          onClick={() => onAction(card)}
          className="w-full text-left bg-bfc-gold hover:bg-bfc-gold-600 text-white text-sm font-medium rounded-xl px-4 py-3 transition cursor-pointer border-none flex items-center justify-between shadow-bfc"
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

import { Star, MapPin, Wallet, Flame } from 'lucide-react'

function heatColor(h: number): string {
  if (h >= 0.8) return '#ef4444'
  if (h >= 0.5) return '#f59e0b'
  return '#22c55e'
}

function StoreCard({ card, compact }: { card: Extract<AgentCard, { type: 'store' }>; compact?: boolean }) {
  const color = card.color || '#c9a96e'
  return (
    <div className="bg-white border border-bfc-gold-200/60 rounded-xl p-3 shadow-sm">
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
      <div className="mt-1.5 font-semibold text-bfc-charcoal text-sm">{card.name}</div>
      {!compact && card.reason && (
        <div className="mt-1 inline-flex items-center gap-1 bg-bfc-gold-50 text-bfc-gold-700 text-xs px-2 py-1 rounded-lg">
          <MessageSquareText className="w-3 h-3" /> {card.reason}
        </div>
      )}
      <div className={`mt-2 flex items-center gap-3 text-xs text-bfc-warm-gray ${compact ? 'flex-col items-start gap-0.5' : ''}`}>
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
          <div className="text-[11px] text-bfc-warm-gray mb-0.5">匹配度 {card.matchPercent}%</div>
          <div className="h-1.5 bg-bfc-gold-100 rounded-full overflow-hidden">
            <div className="h-full bg-bfc-gold rounded-full" style={{ width: `${card.matchPercent}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
