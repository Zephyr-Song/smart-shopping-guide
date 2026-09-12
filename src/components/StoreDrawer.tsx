import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Globe, Store, Ticket, Heart, RefreshCw, ExternalLink, Star } from 'lucide-react'
import {
  MALL_PERKS,
  getStoreActivities,
  type StoreActivity,
} from '../data/storeActivities'

const TYPE_COLORS: Record<string, string> = {
  折扣: 'bg-rose-100 text-rose-700',
  满减: 'bg-amber-100 text-amber-700',
  赠礼: 'bg-pink-100 text-pink-700',
  新店: 'bg-teal-100 text-teal-700',
  体验: 'bg-violet-100 text-violet-700',
  会员: 'bg-bfc-gold-100 text-bfc-gold-800',
  套餐: 'bg-orange-100 text-orange-700',
  常规: 'bg-stone-100 text-stone-600',
}

export interface DrawerStore {
  name: string
  emoji: string
  floor: string
  zone: 'S' | 'N'
  desc?: string
  category?: string
}

interface XhsPost {
  noteId: string
  title: string
  desc: string
  cover: string | null
  author: string | null
  liked: number
  url: string | null
  time: string | null
  scope: 'store' | 'mall'
}

interface DianpingReview {
  id: number
  brand: string | null
  source: 'dianping' | 'meituan'
  rating: string | null
  avgPrice: number | null
  dishes: string[]
  snippet: string | null
  url: string | null
}

interface PostsState {
  status: 'idle' | 'loading' | 'ok' | 'empty' | 'error'
  posts: XhsPost[]
  crawledAt: string | null
  fallback: boolean
}

interface ReviewsState {
  status: 'idle' | 'loading' | 'ok' | 'empty' | 'error'
  reviews: DianpingReview[]
  crawledAt: string | null
}

function ActivityCard({ a }: { a: StoreActivity }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[a.type] ?? 'bg-stone-100 text-stone-600'}`}>
          {a.type}
        </span>
        {a.valid && <span className="text-[10px] text-gray-400">{a.valid}</span>}
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{a.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
      <p className="text-[10px] text-gray-300 mt-2">来源：{a.source} · {a.date}</p>
    </div>
  )
}

function XhsCard({ p }: { p: XhsPost }) {
  return (
    <a
      href={p.url || 'https://www.xiaohongshu.com'}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow no-underline"
    >
      {p.cover ? (
        <img
          src={p.cover}
          alt={p.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-32 object-cover bg-gray-50"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-16 bg-gradient-to-r from-bfc-gold-100 to-bfc-gold-50" />
      )}
      <div className="p-3">
        <p className="text-xs font-medium text-bfc-charcoal leading-snug line-clamp-2 mb-1.5">{p.title || '小红书笔记'}</p>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span className="truncate max-w-[60%]">{p.author || '小红书用户'}</span>
          <span className="inline-flex items-center gap-0.5 flex-shrink-0">
            <Heart className="w-3 h-3 text-rose-400" />
            {p.liked}
          </span>
        </div>
      </div>
    </a>
  )
}

function DianpingCard({ r }: { r: DianpingReview }) {
  const isMeituan = r.source === 'meituan'
  const label = r.brand || '该店铺'
  // 只有反查到该店的「精确店铺页」(m.dianping.com/shop|shopshare/{id}) 时才给跳转。
  // 点评的搜索页对未登录用户一律跳登录墙（m. 站跳短信登录，www. 站跳扫码登录），
  // 所以 city=1 的搜索兜底其实是打不开的死链——宁可不出按钮，也不给死链。
  const jump = r.url || ''
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5">
      {r.rating && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
            <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            {r.rating}
          </span>
          {r.avgPrice ? (
            <span className="text-[11px] text-gray-500">人均 ¥{r.avgPrice}</span>
          ) : null}
        </div>
      )}
      {!r.rating && r.avgPrice ? (
        <p className="text-[11px] text-gray-500 mb-1.5">人均 ¥{r.avgPrice}</p>
      ) : null}
      {(r.dishes || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {(r.dishes || []).slice(0, 4).map(d => (
            <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">{d}</span>
          ))}
        </div>
      )}
      {r.snippet && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{r.snippet}</p>
      )}
      <p className="text-[10px] text-gray-300 mt-2">
        来源：{isMeituan ? '美团' : '大众点评'} 公开信息
      </p>
      {jump ? (
        <a
          href={jump}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-orange-500 hover:underline mt-1 inline-flex items-center gap-0.5 no-underline"
        >
          在{isMeituan ? '美团' : '大众点评'}查看「{label}」›
        </a>
      ) : null}
    </div>
  )
}

export default function StoreDrawer({ store, onClose }: { store: DrawerStore | null; onClose: () => void }) {
  const [posts, setPosts] = useState<PostsState>({ status: 'idle', posts: [], crawledAt: null, fallback: false })
  const [reviews, setReviews] = useState<ReviewsState>({ status: 'idle', reviews: [], crawledAt: null })

  useEffect(() => {
    if (!store) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [store, onClose])

  // 打开抽屉时实时拉取小红书真实笔记（MediaCrawler 采集 → D1）
  useEffect(() => {
    if (!store) { setPosts({ status: 'idle', posts: [], crawledAt: null, fallback: false }); return }
    let alive = true
    setPosts({ status: 'loading', posts: [], crawledAt: null, fallback: false })
    fetch(`/api/store-posts?brand=${encodeURIComponent(store.name)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { source?: string; posts?: XhsPost[]; crawledAt?: string | null; fallback?: boolean }) => {
        if (!alive) return
        if (d.source === 'xhs' && d.posts && d.posts.length > 0) {
          setPosts({ status: 'ok', posts: d.posts, crawledAt: d.crawledAt || null, fallback: !!d.fallback })
        } else if (d.source === 'xhs') {
          setPosts({ status: 'empty', posts: [], crawledAt: d.crawledAt || null, fallback: false })
        } else {
          setPosts({ status: 'error', posts: [], crawledAt: null, fallback: false })
        }
      })
      .catch(() => { if (alive) setPosts({ status: 'error', posts: [], crawledAt: null, fallback: false }) })
    return () => { alive = false }
  }, [store])

  // 打开抽屉时实时拉取大众点评 / 美团 真实探店（WebSearch 采集 → D1 store_reviews）
  useEffect(() => {
    if (!store) { setReviews({ status: 'idle', reviews: [], crawledAt: null }); return }
    let alive = true
    setReviews({ status: 'loading', reviews: [], crawledAt: null })
    fetch(`/api/store-reviews?brand=${encodeURIComponent(store.name)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { source?: string; reviews?: DianpingReview[]; crawledAt?: string | null }) => {
        if (!alive) return
        if (d.reviews && d.reviews.length > 0) {
          setReviews({ status: 'ok', reviews: d.reviews, crawledAt: d.crawledAt || null })
        } else {
          setReviews({ status: 'empty', reviews: [], crawledAt: null })
        }
      })
      .catch(() => { if (alive) setReviews({ status: 'error', reviews: [], crawledAt: null }) })
    return () => { alive = false }
  }, [store])

  if (!store) return null
  const acts = getStoreActivities(store.name)
  const zoneColor = store.zone === 'S' ? 'text-amber-600 bg-amber-50' : 'text-stone-600 bg-stone-100'

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-bfc-cream shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="flex items-start gap-3 p-5 border-b border-bfc-gold-200/60 bg-white">
          <div className="w-12 h-12 rounded-xl bg-bfc-gold-50 flex items-center justify-center text-2xl flex-shrink-0">
            {store.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-bfc-charcoal truncate">{store.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${zoneColor}`}>
                {store.zone === 'S' ? '南区' : '北区'} {store.floor}
              </span>
              {store.category && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{store.category}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer border-none bg-transparent"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {store.desc && (
            <p className="text-xs text-gray-500 leading-relaxed">{store.desc}</p>
          )}

          {/* 大众点评 / 美团 真实探店（仅有数据时才显示该区块；无数据的店铺整块隐藏） */}
          {reviews.status === 'ok' && reviews.reviews.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">评</span>
                <p className="text-sm font-semibold text-bfc-charcoal">大众点评 / 美团 真实探店</p>
                <span className="text-[10px] text-gray-400 inline-flex items-center gap-0.5">
                  <RefreshCw className="w-2.5 h-2.5" /> 实时读取
                </span>
              </div>
              <div className="space-y-2.5">
                {reviews.reviews.map(r => <DianpingCard key={r.id} r={r} />)}
              </div>
              {reviews.crawledAt && (
                <p className="text-[10px] text-gray-300 mt-2">数据采集于 {reviews.crawledAt} · 来自大众点评 / 美团公开信息</p>
              )}
            </section>
          )}

          {/* 小红书 种草笔记（实时拉取） */}
          <section>
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">红</span>
              <p className="text-sm font-semibold text-bfc-charcoal">小红书 种草笔记</p>
              <span className="text-[10px] text-gray-400 inline-flex items-center gap-0.5">
                <RefreshCw className="w-2.5 h-2.5" /> 实时读取
              </span>
            </div>
            {posts.status === 'loading' && (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <RefreshCw className="w-4 h-4 mx-auto mb-1.5 text-gray-300 animate-spin" />
                <p className="text-xs text-gray-400">正在读取小红书最新笔记…</p>
              </div>
            )}
            {posts.status === 'ok' && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  {posts.posts.map(p => <XhsCard key={p.noteId} p={p} />)}
                </div>
                {posts.crawledAt && (
                  <p className="text-[10px] text-gray-300 mt-2">笔记采集于 {posts.crawledAt} · 点击卡片可跳转原笔记</p>
                )}
              </>
            )}
            {posts.status === 'empty' && (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400">暂无该店铺的小红书笔记入库</p>
                <p className="text-[10px] text-gray-300 mt-0.5">采集管线运行后会自动出现</p>
              </div>
            )}
            {posts.status === 'error' && (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400">实时读取暂不可用</p>
                <p className="text-[10px] text-gray-300 mt-0.5">可参考下方活动信息</p>
              </div>
            )}
          </section>

          {/* 店铺专属活动 */}
          <section>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Store className="w-3.5 h-3.5 text-bfc-gold-700" />
              <p className="text-sm font-semibold text-bfc-charcoal">店铺专属活动</p>
              <span className="text-[10px] text-gray-400">{acts.length} 条</span>
            </div>
            {acts.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400">暂未检索到该店铺当前专属活动</p>
                <p className="text-[10px] text-gray-300 mt-0.5">可参考下方商场通用权益</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {acts.map(a => <ActivityCard key={a.title} a={a} />)}
              </div>
            )}
          </section>

          {/* 商场通用权益 */}
          <section>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Ticket className="w-3.5 h-3.5 text-bfc-gold-700" />
              <p className="text-sm font-semibold text-bfc-charcoal">商场通用权益</p>
              <span className="text-[10px] text-gray-400">全场可用</span>
            </div>
            <div className="space-y-2.5">
              {MALL_PERKS.map(a => <ActivityCard key={a.title} a={a} />)}
            </div>
          </section>
        </div>

        {/* 底部说明 */}
        <div className="border-t border-bfc-gold-200/60 bg-white p-4">
          <div className="flex items-start gap-2 text-[11px] text-gray-400 leading-relaxed">
            <Globe className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              探店数据来自大众点评 / 美团公开信息（WebSearch 采集）；小红书笔记来自 MediaCrawler 真实采集；活动信息为全网公开信息检索，以门店实际公示为准。
            </p>
          </div>
          <Link
            to="/map"
            onClick={onClose}
            className="mt-2.5 inline-flex items-center gap-1 text-xs text-bfc-gold-700 hover:text-bfc-gold-800 font-medium no-underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            在商场地图中查看位置
          </Link>
        </div>
      </aside>
    </div>
  )
}
