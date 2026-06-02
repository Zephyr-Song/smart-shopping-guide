import { useState, useMemo } from 'react'
import { MapPin, Navigation, Info, Layers, Building2, Diamond, Crown, Clapperboard } from 'lucide-react'
import { STORES } from '../data/mockData'

interface FloorInfo {
  id: string
  label: string
  desc: string
  icon: React.ReactNode
}

const SOUTH_FLOORS: FloorInfo[] = [
  { id: 'S-L4', label: 'L4', desc: '精致餐饮', icon: <Crown className="w-3 h-3" /> },
  { id: 'S-L3', label: 'L3', desc: '设计师精品·艺术空间', icon: <Building2 className="w-3 h-3" /> },
  { id: 'S-L2', label: 'L2', desc: '运动时尚·设计师珠宝', icon: <Diamond className="w-3 h-3" /> },
  { id: 'S-L1', label: 'L1', desc: '国际潮流·生活方式', icon: <Diamond className="w-3 h-3" /> },
  { id: 'S-B1', label: 'B1', desc: '休闲餐饮·非遗珠宝·数码', icon: <MapPin className="w-3 h-3" /> },
  { id: 'S-B2', label: 'B2', desc: '东方美学文化区', icon: <Building2 className="w-3 h-3" /> },
]

const NORTH_FLOORS: FloorInfo[] = [
  { id: 'N-L4', label: 'L4', desc: '商务配套', icon: <Building2 className="w-3 h-3" /> },
  { id: 'N-L3', label: 'L3', desc: '米其林星级餐厅', icon: <Crown className="w-3 h-3" /> },
  { id: 'N-L2', label: 'L2', desc: '高茶·下午茶', icon: <Diamond className="w-3 h-3" /> },
  { id: 'N-L1', label: 'L1', desc: '旗舰精品店', icon: <Crown className="w-3 h-3" /> },
  { id: 'N-B1', label: 'B1', desc: '博纳影城·宠物友好', icon: <Clapperboard className="w-3 h-3" /> },
  { id: 'N-B2', label: 'B2', desc: '文艺空间·美食街', icon: <MapPin className="w-3 h-3" /> },
]

const ZONE_COLORS = {
  '精致餐饮': '#c9a96e',
  '米其林餐厅': '#d4a373',
  '高茶': '#e9c46a',
  '旗舰精品': '#8b5cf6',
  '国际精品': '#ec4899',
  '设计师品牌': '#6366f1',
  '设计师珠宝': '#3b82f6',
  '东方非遗珠宝': '#f59e0b',
  '运动时尚': '#10b981',
  '生活方式': '#14b8a6',
  '精品咖啡': '#8b5cf6',
  '文化空间': '#6366f1',
  '文化体验': '#a855f7',
  '美食街': '#f97316',
  '文艺空间': '#a855f7',
  '影院': '#6366f1',
  '宠物服务': '#f59e0b',
  '数码电子': '#3b82f6',
  '休闲餐饮': '#f97316',
}

export default function MallMap() {
  const [zone, setZone] = useState<'south' | 'north'>('south')
  const [selectedFloor, setSelectedFloor] = useState('S-L2')
  const [hoveredStore, setHoveredStore] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const floors = zone === 'south' ? SOUTH_FLOORS : NORTH_FLOORS

  // Auto-switch floor when zone changes
  const currentFloorId = selectedFloor.startsWith(zone === 'south' ? 'S-' : 'N-')
    ? selectedFloor
    : floors[2].id

  const floorStores = useMemo(() => {
    const fid = currentFloorId
    return STORES.filter(s => s.floor === fid)
  }, [currentFloorId])

  const activeStore = STORES.find(s => s.id === (selectedStore || hoveredStore))

  const getHeatColor = (value: number) => {
    if (value >= 0.9) return 'rgba(239, 68, 68, 0.25)'
    if (value >= 0.7) return 'rgba(249, 115, 22, 0.2)'
    if (value >= 0.5) return 'rgba(234, 179, 8, 0.15)'
    return 'rgba(34, 197, 94, 0.1)'
  }

  const getHeatBorder = (value: number) => {
    if (value >= 0.9) return '#ef4444'
    if (value >= 0.7) return '#f97316'
    if (value >= 0.5) return '#eab308'
    return '#22c55e'
  }

  const getCategoryColor = (category: string) => {
    return ZONE_COLORS[category as keyof typeof ZONE_COLORS] || '#9ca3af'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary-500" />
            BFC 商场地图
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            外滩金融中心 · 南区60,000m² + 北区36,000m² · 实时客流热力
          </p>
        </div>
      </div>

      {/* Zone Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setZone('south')
            setSelectedFloor('S-L2')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
            zone === 'south'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          南区 South Retail
          <span className="text-xs opacity-70">60,000m²</span>
        </button>
        <button
          onClick={() => {
            setZone('north')
            setSelectedFloor('N-L3')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
            zone === 'north'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          北区 North Retail
          <span className="text-xs opacity-70">36,000m²</span>
        </button>
      </div>

      {/* Floor Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Layers className="w-4 h-4 text-gray-400" />
        {floors.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFloor(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              currentFloorId === f.id
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
            <span className="opacity-70">{f.desc}</span>
          </button>
        ))}
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 bg-white rounded-lg border border-gray-100 px-4 py-2.5">
        <span className="font-medium text-gray-700">客流热度：</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(34, 197, 94, 0.3)' }} />
          低
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(234, 179, 8, 0.3)' }} />
          中
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(249, 115, 22, 0.3)' }} />
          高
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239, 68, 68, 0.3)' }} />
          极高
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Map area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4">
          <div className="relative w-full bg-gray-50 rounded-lg" style={{ paddingBottom: '60%' }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {/* Grid lines */}
              {[20, 40, 60, 80].map(v => (
                <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="2,2" />
              ))}
              {[20, 40, 60, 80].map(v => (
                <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="2,2" />
              ))}

              {/* Zone label */}
              <text x="50" y="5" textAnchor="middle" fontSize="3.5" fill="#9ca3af" fontWeight="600">
                {zone === 'south' ? '南区 South Retail' : '北区 North Retail'} · {currentFloorId}
              </text>

              {/* Entrance */}
              <rect x="42" y="94" width="16" height="5" rx="1" fill="#6366f1" opacity="0.3" />
              <text x="50" y="98" textAnchor="middle" fontSize="2.5" fill="#6366f1" fontWeight="600">主入口</text>

              {/* Elevator */}
              <rect x="47" y="45" width="6" height="6" rx="1" fill="#d1d5db" />
              <text x="50" y="49" textAnchor="middle" fontSize="2" fill="#6b7280">电梯</text>

              {/* Stores */}
              {floorStores.map(store => {
                const isHovered = hoveredStore === store.id
                const isSelected = selectedStore === store.id
                const isActive = isHovered || isSelected
                const catColor = getCategoryColor(store.category)

                return (
                  <g key={store.id}>
                    <rect
                      x={store.x - 10}
                      y={store.y - 6}
                      width="20"
                      height="12"
                      rx="2"
                      fill={getHeatColor(store.heatmap)}
                      stroke={isActive ? catColor : 'transparent'}
                      strokeWidth={isActive ? '0.8' : '0'}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={() => setHoveredStore(store.id)}
                      onMouseLeave={() => setHoveredStore(null)}
                      onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
                    />
                    <text
                      x={store.x}
                      y={store.y + 1}
                      textAnchor="middle"
                      fontSize="2.2"
                      fill={isActive ? catColor : '#374151'}
                      fontWeight={isActive ? '700' : '500'}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}
                    >
                      {store.name}
                    </text>
                    <text
                      x={store.x}
                      y={store.y + 4.5}
                      textAnchor="middle"
                      fontSize="1.6"
                      fill="#9ca3af"
                      style={{ pointerEvents: 'none' }}
                    >
                      {store.category}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Floor description */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            {zone === 'south' && currentFloorId === 'S-L4' && 'L4 精致餐饮 · Fine Dining · 米其林星级餐饮体验'}
            {zone === 'south' && currentFloorId === 'S-L3' && 'L3 国内设计师精品 / 咖啡 / 艺术空间 / 活动空间'}
            {zone === 'south' && currentFloorId === 'S-L2' && 'L2 运动时尚 & 设计师品牌 & 珠宝 · 国内外设计师珠宝孵化平台'}
            {zone === 'south' && currentFloorId === 'S-L1' && 'L1 国际潮流时装精品 / 生活方式'}
            {zone === 'south' && currentFloorId === 'S-B1' && 'B1 休闲餐饮 / 品质数码 / 东方非遗珠宝区'}
            {zone === 'south' && currentFloorId === 'S-B2' && 'B2 东方美学文化区 · 非遗体验 · 传统文化空间'}
            {zone === 'north' && currentFloorId === 'N-L4' && 'L4 商务配套层'}
            {zone === 'north' && currentFloorId === 'N-L3' && 'L3 米其林星级餐厅 · 高端餐饮体验'}
            {zone === 'north' && currentFloorId === 'N-L2' && 'L2 High Tea · 高茶下午茶体验'}
            {zone === 'north' && currentFloorId === 'N-L1' && 'L1 旗舰店精品店 · 限量单品 · 国奢品牌'}
            {zone === 'north' && currentFloorId === 'N-B1' && 'B1 博纳影城 · 宠物友好区 · IMAX与VIP厅'}
            {zone === 'north' && currentFloorId === 'N-B2' && 'B2 文艺空间 · 美食街 · 音乐现场'}
          </div>
        </div>

        {/* Store detail panel */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {activeStore ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">{activeStore.name}</h3>
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                  {activeStore.floor}
                </span>
              </div>
              <p className="text-sm text-gray-500">{activeStore.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">品类</span>
                  <span className="text-gray-700 font-medium">{activeStore.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">人均消费</span>
                  <span className="text-gray-700 font-medium">¥{activeStore.avgPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">评分</span>
                  <span className="text-gray-700 font-medium">⭐ {activeStore.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">日客流量</span>
                  <span className="text-gray-700 font-medium">{activeStore.visitorCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">转化率</span>
                  <span className="text-gray-700 font-medium">{(activeStore.conversionRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">客流热度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${activeStore.heatmap * 100}%`,
                          background: getHeatBorder(activeStore.heatmap),
                        }}
                      />
                    </div>
                    <span className="text-gray-700 font-medium text-xs">
                      {(activeStore.heatmap * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {activeStore.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <Navigation className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">点击或悬停店铺查看详情</p>
            </div>
          )}

          {/* Floor info card */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary-500" />
              {currentFloorId} 楼层信息
            </h4>
            <div className="text-xs text-gray-500 space-y-1.5">
              {zone === 'south' && (
                <>
                  {currentFloorId === 'S-L4' && <p>南区顶层，汇聚米其林星级及高端精致餐饮，外滩江景fine dining体验</p>}
                  {currentFloorId === 'S-L3' && <p>国内设计师精品买手店、精品咖啡、当代艺术展厅与活动空间</p>}
                  {currentFloorId === 'S-L2' && <p>运动时尚品牌、先锋设计师品牌，以及国内外「设计师珠宝孵化平台」</p>}
                  {currentFloorId === 'S-L1' && <p>国际潮流时装精品与生活方式品牌，汇集全球顶级奢侈与设计师品牌</p>}
                  {currentFloorId === 'S-B1' && <p>休闲餐饮、品质数码、个人护理，以及「东方非遗珠宝区」（周大福、老庙黄金、中国黄金）</p>}
                  {currentFloorId === 'S-B2' && <p>东方美学文化区，朵云轩、上图书店、非遗手工体验工坊</p>}
                </>
              )}
              {zone === 'north' && (
                <>
                  {currentFloorId === 'N-L4' && <p>北区顶层，商务配套与活动空间</p>}
                  {currentFloorId === 'N-L3' && <p>米其林星级餐厅汇聚地，泰安门（三星）、Ultraviolet、甬府（一星）</p>}
                  {currentFloorId === 'N-L2' && <p>高茶下午茶体验层，TWG Tea、Laduree等精致下午茶品牌</p>}
                  {currentFloorId === 'N-L1' && <p>旗舰精品店，限量单品、国奢品牌上海滩SHANGHAI TANG、大豫园文创</p>}
                  {currentFloorId === 'N-B1' && <p>博纳高端影城（IMAX+VIP厅）、宠物友好社交空间</p>}
                  {currentFloorId === 'N-B2' && <p>文艺空间、美食街、TZ House Livehouse演艺空间</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
