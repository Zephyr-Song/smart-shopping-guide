import { useMemo, useState } from 'react'
import { Box, MapPin, Search, MousePointerClick, Rotate3d, Layers3, Info, BookOpen } from 'lucide-react'
import { STORES, CATEGORIES, type Store } from '../data/mockData'
import MallScene3D, { type CategoryColor } from '../components/mall3d/MallScene3D'
import StoreDrawer, { type DrawerStore } from '../components/StoreDrawer'

const CATEGORY_COLORS: CategoryColor[] = CATEGORIES.map(c => ({ name: c.name, color: c.color }))
const CATEGORY_ICON = new Map(CATEGORIES.map(c => [c.name, c.icon]))

type ZoneFilter = 'all' | 'south' | 'north'

/** Store → 探店抽屉所需的最小结构（zone 由 id 前缀推出，emoji 由品类映射） */
function toDrawerStore(s: Store): DrawerStore {
  return {
    name: s.name,
    emoji: CATEGORY_ICON.get(s.category) ?? '🏬',
    floor: s.floor,
    zone: s.id.startsWith('s') ? 'S' : 'N',
    desc: s.description,
    category: s.category,
  }
}

/** 楼层字符串 → 层高数字（S-L4→4, N-B1→-1） */
function levelOf(floor: string): number {
  const nums = floor.match(/\d+/g)?.map(Number) ?? [1]
  let level = nums[nums.length - 1]
  if (/B/i.test(floor)) level = -level
  return level
}

export default function Mall3D() {
  const [zone, setZone] = useState<ZoneFilter>('all')
  const [floor, setFloor] = useState<number | 'all'>('all')
  const [selected, setSelected] = useState<Store | null>(null)
  const [drawerStore, setDrawerStore] = useState<DrawerStore | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [resetSignal, setResetSignal] = useState(0)

  // 层高 → 显示标签（B3..L4，升序）
  const LEVELS = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of STORES) {
      const lv = levelOf(s.floor)
      if (!m.has(lv)) m.set(lv, lv < 0 ? `B${-lv}` : `L${lv}`)
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0])
  }, [])

  const visibleStores = useMemo(
    () =>
      STORES.filter(
        s =>
          (zone === 'all' || (zone === 'south' ? s.id.startsWith('s') : s.id.startsWith('n'))) &&
          (floor === 'all' || levelOf(s.floor) === floor),
      ),
    [zone, floor],
  )

  const onSelectFromScene = (store: Store | null) => {
    // 点击只选中 + 高亮，不动相机（定位交给「在 3D 中定位」按钮或搜索）
    setSelected(store)
    if (store) setQuery(store.name)
  }

  const focusByName = (name: string) => {
    const q = name.trim()
    if (!q) return
    // 模糊匹配：店名包含关键词、或关键词包含店名（如输「喜」「茶」也能命中）、或品类匹配
    const hits = STORES.filter(
      s => s.name.includes(q) || q.includes(s.name) || s.category.includes(q),
    )
    if (!hits.length) return
    hits.sort((a, b) => (a.name.startsWith(q) ? -1 : 0) - (b.name.startsWith(q) ? -1 : 0))
    setSelected(hits[0])
    setQuery(hits[0].name)
    setFocusId(hits[0].id)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bfc-charcoal flex items-center gap-2">
            <Box className="w-6 h-6 text-bfc-gold-600" />
            BFC 3D 立体导览
          </h1>
          <p className="text-sm text-bfc-warm-gray mt-1">
            程序化生成的 BFC 双区楼宇 · 90 家真实店铺按楼层与品类铺陈 · 拖拽旋转、点击查看
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bfc-warm-gray" />
          <input
            list="store-names"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') focusByName(query.trim())
            }}
            placeholder="搜索店铺并定位…"
            className="w-64 pl-9 pr-3 py-2 rounded-xl text-sm border border-bfc-gold-200 bg-white text-bfc-charcoal outline-none focus:border-bfc-gold-500"
          />
          <datalist id="store-names">
            {STORES.map(s => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Zone toggle + count */}
      <div className="flex items-center gap-3 flex-wrap">
        {([
          { id: 'all', label: '全部' },
          { id: 'south', label: '南区 South' },
          { id: 'north', label: '北区 North' },
        ] as { id: ZoneFilter; label: string }[]).map(z => (
          <button
            key={z.id}
            onClick={() => setZone(z.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              zone === z.id
                ? 'bg-bfc-gold-500 text-white border-bfc-gold-500'
                : 'bg-white text-bfc-warm-gray border-bfc-gold-200 hover:border-bfc-gold-300'
            }`}
          >
            <Layers3 className="w-4 h-4" />
            {z.label}
          </button>
        ))}
        <span className="text-xs text-bfc-warm-gray">当前显示 {visibleStores.length} 家店铺</span>
        <button
          onClick={() => setResetSignal(t => t + 1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-bfc-gold-200 bg-white text-bfc-warm-gray hover:border-bfc-gold-300 cursor-pointer"
        >
          <Rotate3d className="w-4 h-4" />
          重置视角
        </button>
      </div>

      {/* 楼层切换 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-bfc-warm-gray flex items-center gap-1">
          <Layers3 className="w-3.5 h-3.5" />楼层
        </span>
        <button
          onClick={() => setFloor('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            floor === 'all'
              ? 'bg-bfc-charcoal text-white border-bfc-charcoal'
              : 'bg-white text-bfc-warm-gray border-bfc-gold-200 hover:border-bfc-gold-300'
          }`}
        >
          全部
        </button>
        {LEVELS.map(([lv, label]) => (
          <button
            key={lv}
            onClick={() => setFloor(lv)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              floor === lv
                ? 'bg-bfc-charcoal text-white border-bfc-charcoal'
                : 'bg-white text-bfc-warm-gray border-bfc-gold-200 hover:border-bfc-gold-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3D viewport */}
      <div className="relative w-full h-[68vh] min-h-[520px] rounded-2xl overflow-hidden border border-bfc-gold-200 bg-[#14110e]">
        <MallScene3D
          stores={STORES}
          categories={CATEGORY_COLORS}
          zoneFilter={zone}
          floorFilter={floor === 'all' ? null : floor}
          focusStoreId={focusId}
          resetSignal={resetSignal}
          onSelect={onSelectFromScene}
        />

        {/* 操作提示 浮层 */}
        <div className="absolute top-3 right-3 flex items-center gap-3 text-[11px] text-white/70 bg-black/35 backdrop-blur px-3 py-1.5 rounded-lg pointer-events-none">
          <span className="flex items-center gap-1"><Rotate3d className="w-3.5 h-3.5" />拖拽旋转</span>
          <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />点击店铺</span>
          <span>滚轮缩放</span>
        </div>

        {/* 品类图例 浮层 */}
        <div className="absolute bottom-3 left-3 max-h-[55%] overflow-y-auto bg-black/35 backdrop-blur rounded-xl p-3 pointer-events-auto">
          <div className="text-[11px] text-white/80 font-medium mb-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />品类图例
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {CATEGORY_COLORS.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                <span className="text-[11px] text-white/80 whitespace-nowrap">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 选中店铺信息卡 */}
        {selected && (
          <div className="absolute top-3 left-3 w-72 max-w-[calc(100%-1.5rem)] bg-white/95 backdrop-blur rounded-2xl border border-bfc-gold-200 p-4 shadow-xl pointer-events-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-bfc-charcoal text-lg leading-tight">{selected.name}</h3>
                <span className="inline-block mt-1 text-[11px] bg-bfc-gold-100 text-bfc-gold-700 px-2 py-0.5 rounded-full font-medium">
                  {selected.floor}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelected(null)
                  setQuery('')
                  setFocusId(null)
                }}
                className="text-bfc-warm-gray hover:text-bfc-charcoal text-lg leading-none px-1 cursor-pointer"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-bfc-warm-gray mt-2">{selected.description}</p>

            <div className="mt-3 space-y-1.5 text-xs">
              <Row label="品类" value={selected.category} />
              <Row label="人均" value={`¥${selected.avgPrice.toLocaleString()}`} />
              <Row label="评分" value={`⭐ ${selected.rating}`} />
              <Row label="日客流" value={selected.visitorCount.toLocaleString()} />
              <Row label="转化率" value={`${(selected.conversionRate * 100).toFixed(0)}%`} />
              <div className="flex justify-between items-center">
                <span className="text-bfc-warm-gray">客流热度</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-bfc-gold-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${selected.heatmap * 100}%`,
                        background: selected.heatmap >= 0.9 ? '#ef4444' : selected.heatmap >= 0.7 ? '#f97316' : selected.heatmap >= 0.5 ? '#eab308' : '#22c55e',
                      }}
                    />
                  </div>
                  <span className="text-bfc-charcoal font-medium">{(selected.heatmap * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {selected.tags.map(t => (
                  <span key={t} className="text-[11px] bg-bfc-gold-100 text-bfc-gold-700 px-2 py-0.5 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setDrawerStore(toDrawerStore(selected))}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border border-bfc-gold-300 text-bfc-gold-700 hover:bg-bfc-gold-50 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> 查看探店笔记
            </button>
            <button
              onClick={() => focusByName(selected.name)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-bfc-gold-500 text-white hover:bg-bfc-gold-600 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4" /> 在 3D 中定位
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-bfc-warm-gray/80 text-center">
        提示：几何体与店铺标签均由代码程序化生成，未加载任何外部 3D 模型或贴图；点击方块可查看该店的大众点评 / 小红书探店笔记。
      </p>

      {/* 探店抽屉：点击店铺信息卡里的「查看探店笔记」触发 */}
      <StoreDrawer store={drawerStore} onClose={() => setDrawerStore(null)} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-bfc-warm-gray">{label}</span>
      <span className="text-bfc-charcoal font-medium">{value}</span>
    </div>
  )
}
