import { useMemo, useState } from 'react'
import { Box, MapPin, Search, MousePointerClick, Rotate3d, Layers3, Info } from 'lucide-react'
import { STORES, CATEGORIES, type Store } from '../data/mockData'
import MallScene3D, { type CategoryColor } from '../components/mall3d/MallScene3D'

const CATEGORY_COLORS: CategoryColor[] = CATEGORIES.map(c => ({ name: c.name, color: c.color }))

type ZoneFilter = 'all' | 'south' | 'north'

export default function Mall3D() {
  const [zone, setZone] = useState<ZoneFilter>('all')
  const [selected, setSelected] = useState<Store | null>(null)
  const [query, setQuery] = useState('')

  const visibleStores = useMemo(
    () => STORES.filter(s => zone === 'all' || (zone === 'south' ? s.id.startsWith('s') : s.id.startsWith('n'))),
    [zone],
  )

  const onSelectFromScene = (store: Store | null) => {
    setSelected(store)
    if (store) setQuery(store.name)
  }

  const focusByName = (name: string) => {
    const hit = STORES.find(s => s.name === name)
    if (hit) {
      setSelected(hit)
      setQuery(hit.name)
    }
  }

  // 选中即驱动 MallScene3D 聚焦该店铺（按 id 变化触发）
  const focusId = selected?.id ?? null

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
      </div>

      {/* 3D viewport */}
      <div className="relative w-full h-[68vh] min-h-[520px] rounded-2xl overflow-hidden border border-bfc-gold-200 bg-[#14110e]">
        <MallScene3D
          stores={STORES}
          categories={CATEGORY_COLORS}
          zoneFilter={zone}
          focusStoreId={focusId}
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
              onClick={() => focusByName(selected.name)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-bfc-gold-500 text-white hover:bg-bfc-gold-600 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4" /> 在 3D 中定位
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-bfc-warm-gray/80 text-center">
        提示：本页为增量优化方案中的「3D 导览骨架」，几何体与店铺标签均由代码程序化生成，未加载任何外部 3D 模型或贴图。
      </p>
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
