import { useState, useMemo } from 'react'
import { Ticket, Search, Filter, MapPin, Sparkles, X, MousePointerClick } from 'lucide-react'
import StoreDrawer from '../components/StoreDrawer'

type OfferType = '折扣' | '满减' | '赠礼' | '新店' | '体验'

interface Offer {
  id: string
  brand: string
  emoji: string
  floor: string
  zone: 'S' | 'N'
  type: OfferType
  title: string
  desc: string
  valid: string
  hot?: boolean
}

const TYPE_LABELS: OfferType[] = ['折扣', '满减', '赠礼', '新店', '体验']

const TYPE_COLORS: Record<OfferType, string> = {
  折扣: 'bg-rose-100 text-rose-700',
  满减: 'bg-amber-100 text-amber-700',
  赠礼: 'bg-pink-100 text-pink-700',
  新店: 'bg-teal-100 text-teal-700',
  体验: 'bg-violet-100 text-violet-700',
}

const OFFERS: Offer[] = [
  {
    id: 'lp', brand: 'LA PRAIRIE', emoji: '✨', floor: 'S-1F', zone: 'S',
    type: '赠礼', title: '鱼子精华体验装满赠',
    desc: '会员消费满 ¥5,000 赠明星鱼子精华体验装（7 日量），可叠加积分。',
    valid: '有效期至 2026.10.31', hot: true,
  },
  {
    id: 'dv', brand: 'DA VITTORIO SHANGHAI', emoji: '⭐', floor: 'N-3F', zone: 'N',
    type: '折扣', title: '米其林午市双人套餐 85 折',
    desc: '周一至周五 11:30–14:00，双人套餐享 85 折并赠气泡酒一杯。',
    valid: '即日起至 2026.11.15',
  },
  {
    id: 'ht', brand: '喜茶', emoji: '🧋', floor: 'N-1F', zone: 'N',
    type: '满减', title: '指定饮品第二杯半价',
    desc: '金凤茶王 / 多肉葡萄系列，同单第二杯半价（每单限 2 杯）。',
    valid: '新品季限定',
  },
  {
    id: 'ky', brand: '京都之家', emoji: '🏯', floor: 'N-2F', zone: 'N',
    type: '新店', title: '京都和服体验 9 折 + 限定和菓子',
    desc: '海外首个京都文化体验空间，和服试穿与茶道体验同享 9 折。',
    valid: '新店开业首月',
  },
  {
    id: 'ms', brand: 'MARSMART 火星宠物超市', emoji: '🐾', floor: 'N-B1', zone: 'N',
    type: '满减', title: '新会员首单满 199 减 50',
    desc: '宠物食品 / 洗护 / 社交空间一站式，新会员首单立减。',
    valid: '长期有效',
  },
  {
    id: 'xrj', brand: '新荣记', emoji: '🐟', floor: 'N-3F', zone: 'N',
    type: '折扣', title: '工作日午市套餐 ¥198 / 位',
    desc: '台州菜米其林三星，工作日午市精选套餐，含招牌东海小鲜。',
    valid: '周一至周五',
  },
  {
    id: 'afei', brand: '阿飞和巴弟 PET MART', emoji: '🐱', floor: 'N-B1', zone: 'N',
    type: '新店', title: '上海首店到店礼 + 洗护 8 折',
    desc: '国产宠物食品沉浸式 IP 乐园，首店限定到店礼，洗护服务 8 折。',
    valid: '开业首 30 天', hot: true,
  },
  {
    id: 'yx', brand: '隐溪茶馆', emoji: '🍵', floor: 'N-2F', zone: 'N',
    type: '体验', title: '新中式茶席体验 7 折',
    desc: '隐于都市的茶道空间，茶席体验与高端茶叶品鉴同享 7 折。',
    valid: '即日起至 2026.10.15',
  },
  {
    id: 'xm', brand: '小米', emoji: '📱', floor: 'N-2F', zone: 'N',
    type: '满减', title: '以旧换新补贴最高 ¥500',
    desc: '小米之家智能家居与数码体验店，旧机回收叠加换新补贴。',
    valid: '活动期以门店公告为准',
  },
  {
    id: 'mft', brand: '美丽田园', emoji: '🌸', floor: 'N-4F', zone: 'N',
    type: '体验', title: '新客面部护理体验 ¥9.9',
    desc: '国内高端美容连锁，新客首单面部护理 9.9 元体验价。',
    valid: '每用户限一次',
  },
  {
    id: 'vc', brand: 'VERSACE', emoji: '🏛️', floor: 'S-1F', zone: 'S',
    type: '折扣', title: '季末精选低至 6 折',
    desc: '意大利奢侈品牌季末特辑，精选成衣与配饰低至 6 折。',
    valid: '售完即止',
  },
  {
    id: 'br', brand: '白茸', emoji: '🍄', floor: 'S-3F', zone: 'S',
    type: '折扣', title: '云南菌菇季套餐 8 折',
    desc: '新中式创意菜，云南菌菇入馔，菌菇火锅双人套餐 8 折。',
    valid: '菌菇季限定',
  },
]

export default function Offers() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<OfferType | 'all'>('all')
  const [active, setActive] = useState<Offer | null>(null)

  const filtered = useMemo(() => {
    let list = OFFERS
    if (activeType !== 'all') list = list.filter(o => o.type === activeType)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        o => o.brand.toLowerCase().includes(q) || o.title.toLowerCase().includes(q) || o.desc.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, activeType])

  const stats = {
    total: OFFERS.length,
    brands: new Set(OFFERS.map(o => o.brand)).size,
    south: OFFERS.filter(o => o.zone === 'S').length,
    north: OFFERS.filter(o => o.zone === 'N').length,
  }

  return (
    <div className="space-y-5">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">限时优惠快讯</h1>
        <p className="text-sm text-gray-500 mt-1">
          BFC 外滩金融中心 · 当前可享优惠与品牌活动（与「营销日历」互补）
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '进行中优惠', value: stats.total, color: 'bg-amber-500' },
          { label: '覆盖品牌', value: stats.brands, color: 'bg-rose-500' },
          { label: '南区 (S)', value: stats.south, color: 'bg-stone-500' },
          { label: '北区 (N)', value: stats.north, color: 'bg-teal-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className={`w-8 h-1.5 rounded-full mx-auto mb-2 ${s.color}`} />
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-[11px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 搜索 */}
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索品牌或优惠关键词..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 类型筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
            activeType === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
          }`}
        >
          全部类型
        </button>
        {TYPE_LABELS.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
              activeType === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 结果数量 */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Filter className="w-3 h-3" />
        共 <span className="font-medium text-gray-600">{filtered.length}</span> 条优惠
        {activeType !== 'all' && <span className="text-gray-300">· {activeType}</span>}
        <span className="ml-auto inline-flex items-center gap-1 text-gray-300">
          <MousePointerClick className="w-3 h-3" />
          点击卡片查看店铺详情
        </span>
      </div>

      {/* 优惠卡片网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">未找到匹配优惠</p>
          <p className="text-xs mt-1">试试其他关键词或筛选条件</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(o => {
            const zoneColor = o.zone === 'S' ? 'text-amber-600 bg-amber-50' : 'text-stone-600 bg-stone-100'
            const zoneLabel = o.zone === 'S' ? '南区' : '北区'
            return (
              <div
                key={o.id}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  o.hot ? 'ring-1 ring-amber-200 border-amber-200' : 'border-gray-100'
                }`}
                onClick={() => setActive(o)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                    {o.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">{o.brand}</span>
                      {o.hot && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                          热门
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${TYPE_COLORS[o.type]}`}>
                      {o.type}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium text-bfc-charcoal mb-1">{o.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{o.desc}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${zoneColor}`}>
                      {zoneLabel} {o.floor}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">{o.valid}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 提示 */}
      <div className="bg-amber-50 rounded-xl p-3.5 text-sm text-amber-700 flex gap-2 items-start">
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <p className="font-medium mb-0.5">温馨提示</p>
          <p className="text-xs leading-relaxed">
            以上优惠信息整理自各品牌公开活动，部分优惠可能因商场业态调整或门店公告发生变化，最终以品牌实际门店公示为准。
          </p>
        </div>
      </div>

      <StoreDrawer
        store={active ? { name: active.brand, emoji: active.emoji, floor: active.floor, zone: active.zone, desc: active.desc } : null}
        onClose={() => setActive(null)}
      />
    </div>
  )
}
