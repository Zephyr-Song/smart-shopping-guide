import { useState } from 'react'
import { MapPin, Navigation, Info, Layers } from 'lucide-react'
import { STORES, CATEGORIES } from '../data/mockData'

const FLOORS = [1, 2]

export default function MallMap() {
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [hoveredStore, setHoveredStore] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const floorStores = STORES.filter(s => s.floor === selectedFloor)
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary-500" />
            商场地图
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            BFC 外滩金融中心 · 实时客流热力图
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          {FLOORS.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                selectedFloor === f
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              F{f}
            </button>
          ))}
        </div>
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
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
            >
              {/* Grid lines */}
              {[20, 40, 60, 80].map(v => (
                <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="2,2" />
              ))}
              {[20, 40, 60, 80].map(v => (
                <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="2,2" />
              ))}

              {/* Entrance */}
              <rect x="42" y="94" width="16" height="5" rx="1" fill="#6366f1" opacity="0.3" />
              <text x="50" y="98" textAnchor="middle" fontSize="2.5" fill="#6366f1" fontWeight="600">入口</text>

              {/* Elevator */}
              <rect x="47" y="45" width="6" height="6" rx="1" fill="#d1d5db" />
              <text x="50" y="49" textAnchor="middle" fontSize="2" fill="#6b7280">电梯</text>

              {/* Stores */}
              {floorStores.map(store => {
                const isHovered = hoveredStore === store.id
                const isSelected = selectedStore === store.id
                const isActive = isHovered || isSelected
                const cat = CATEGORIES.find(c => c.name === store.category)

                return (
                  <g key={store.id}>
                    <rect
                      x={store.x - 8}
                      y={store.y - 5}
                      width="16"
                      height="10"
                      rx="1.5"
                      fill={getHeatColor(store.heatmap)}
                      stroke={isActive ? getHeatBorder(store.heatmap) : 'transparent'}
                      strokeWidth={isActive ? '0.6' : '0'}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={() => setHoveredStore(store.id)}
                      onMouseLeave={() => setHoveredStore(null)}
                      onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
                    />
                    <text
                      x={store.x}
                      y={store.y + 1}
                      textAnchor="middle"
                      fontSize="2.5"
                      fill={isActive ? getHeatBorder(store.heatmap) : '#374151'}
                      fontWeight={isActive ? '700' : '500'}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}
                    >
                      {store.name}
                    </text>
                    <text
                      x={store.x}
                      y={store.y + 4}
                      textAnchor="middle"
                      fontSize="1.8"
                      fill="#9ca3af"
                      style={{ pointerEvents: 'none' }}
                    >
                      {cat?.icon}
                    </text>
                  </g>
                )
              })}

              {/* Floor label */}
              <text x="5" y="5" fontSize="4" fill="#9ca3af" fontWeight="600">
                F{selectedFloor}
              </text>
            </svg>
          </div>
        </div>

        {/* Store detail panel */}
        <div className="w-full lg:w-72 flex-shrink-0">
          {activeStore ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{activeStore.name}</h3>
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                  F{activeStore.floor}
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
                  <span className="text-gray-700 font-medium">¥{activeStore.avgPrice}</span>
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
                <div className="flex justify-between">
                  <span className="text-gray-500">客流热度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
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
              <p className="text-sm text-gray-400">
                点击或悬停店铺查看详情
              </p>
              <div className="mt-4 space-y-2 text-left">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> 操作提示
                </p>
                <p className="text-xs text-gray-400">· 悬停店铺名称查看基本信息</p>
                <p className="text-xs text-gray-400">· 点击店铺查看完整详情</p>
                <p className="text-xs text-gray-400">· 切换楼层查看不同区域</p>
                <p className="text-xs text-gray-400">· 颜色深浅代表客流密度</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
