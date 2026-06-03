import { useState, useMemo } from 'react'
import { MapPin, Navigation, Info, Layers, Building2, Crown, Flame, Sparkles } from 'lucide-react'
import { STORES } from '../data/mockData'

interface FloorInfo {
  id: string
  label: string
  desc: string
  icon: React.ReactNode
}

const SOUTH_FLOORS: FloorInfo[] = [
  { id: 'S-L4', label: '4F', desc: '品质中餐聚集区', icon: <Crown className="w-3 h-3" /> },
  { id: 'S-L3', label: '3F', desc: '时尚餐饮·生活方式', icon: <Flame className="w-3 h-3" /> },
  { id: 'S-L2', label: '2F', desc: '设计师品牌·运动时尚', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'S-L1', label: '1F', desc: '国际精品·奢侈品', icon: <Crown className="w-3 h-3" /> },
  { id: 'S-B1', label: 'B1', desc: '快餐·美容·珠宝·健身', icon: <MapPin className="w-3 h-3" /> },
  { id: 'S-B2', label: 'B2', desc: '数码·宠物·快餐', icon: <MapPin className="w-3 h-3" /> },
  { id: 'S-B3', label: 'B3', desc: '汽车体验', icon: <Building2 className="w-3 h-3" /> },
  { id: 'S1-5F', label: 'S1-5F', desc: '健身会馆', icon: <Building2 className="w-3 h-3" /> },
]

const NORTH_FLOORS: FloorInfo[] = [
  { id: 'N-L3-5F', label: 'N3-5F', desc: '上海滩餐厅', icon: <Crown className="w-3 h-3" /> },
  { id: 'N-L3-3F', label: 'N3-3F', desc: '新荣记·DA Vittorio', icon: <Crown className="w-3 h-3" /> },
  { id: 'N-L3-2F', label: 'N3-2F', desc: '柴门荟', icon: <Flame className="w-3 h-3" /> },
  { id: 'N-L3-1F', label: 'N3-1F', desc: '精品·迈巴赫', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'N-L2-2F', label: 'N2-2F', desc: '茶馆SPA养生', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'N-L2-1F', label: 'N2-1F', desc: '网红餐饮', icon: <Flame className="w-3 h-3" /> },
  { id: 'N-L1-1F', label: 'N1-1F', desc: '潮流·买手', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'N-B1', label: 'B1', desc: '餐饮·宠物·便利', icon: <MapPin className="w-3 h-3" /> },
  { id: 'N-B2', label: 'B2', desc: '餐饮·文创', icon: <MapPin className="w-3 h-3" /> },
]

const ZONE_COLORS: Record<string, string> = {
  '精致餐饮': '#c9a96e',
  '国际精品': '#ec4899',
  '设计师品牌': '#6366f1',
  '运动时尚': '#10b981',
  '品质中餐': '#d97706',
  '网红餐饮': '#f97316',
  '快餐轻食': '#f59e0b',
  '咖啡茶饮': '#8b5cf6',
  '茶馆SPA': '#14b8a6',
  '汽车体验': '#3b82f6',
  '珠宝配饰': '#eab308',
  '美容美发': '#ec4899',
  '运动健身': '#22c55e',
  '宠物服务': '#f59e0b',
  '文创杂货': '#a855f7',
  '科技数码': '#3b82f6',
  '生活方式': '#14b8a6',
  '便利生活': '#6b7280',
}

export default function MallMap() {
  const [zone, setZone] = useState<'south' | 'north'>('south')
  const [selectedFloor, setSelectedFloor] = useState('S-L1')
  const [hoveredStore, setHoveredStore] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const floors = zone === 'south' ? SOUTH_FLOORS : NORTH_FLOORS

  const currentFloorId = selectedFloor.startsWith(zone === 'south' ? 'S' : 'N')
    ? selectedFloor
    : zone === 'south' ? 'S-L1' : 'N-L3-3F'

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
            setSelectedFloor('S-L1')
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
            setSelectedFloor('N-L3-3F')
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
              <rect x="42" y="96" width="16" height="3.5" rx="1" fill="#6366f1" opacity="0.3" />
              <text x="50" y="99.2" textAnchor="middle" fontSize="2.2" fill="#6366f1" fontWeight="600">主入口</text>

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
            {zone === 'south' && currentFloorId === 'S-L4' && '4F 品质中餐聚集区 · 老吉堂、满愿家、青鹤荟、泰珍荟、高桌、晴空'}
            {zone === 'south' && currentFloorId === 'S-L3' && '3F 时尚餐饮 / 生活方式 · DIM SUM MARVEL、MEET THE BUND、A&M SALON'}
            {zone === 'south' && currentFloorId === 'S-L2' && '2F 设计师品牌 / 运动时尚 · ON/OFF、J.Lindeberg、OUTCICS、PIU'}
            {zone === 'south' && currentFloorId === 'S-L1' && '1F 国际精品 / 奢侈品最密集区 · Alexander Wang、Versace、Jimmy Choo 等19家品牌'}
            {zone === 'south' && currentFloorId === 'S-B1' && 'B1 快餐 / 美容 / 珠宝 / 健身 · 麦当劳、超级猩猩、周大福'}
            {zone === 'south' && currentFloorId === 'S-B2' && 'B2 数码 / 餐饮 / 宠物 · 小米、哈曼卡顿、喜茶、PET WISH'}
            {zone === 'south' && currentFloorId === 'S-B3' && 'B3 GALAXY AUTO STUDIO 车皇汽车体验中心'}
            {zone === 'south' && currentFloorId === 'S1-5F' && 'S1-5F BFC FITNESS健身会馆 · 泳池/私教/团课'}
            {zone === 'north' && currentFloorId === 'N-L3-5F' && 'N3-5F 上海滩餐厅 · 外滩地标餐饮旗舰'}
            {zone === 'north' && currentFloorId === 'N-L3-3F' && 'N3-3F 新荣记 · DA Vittorio Shanghai · 米其林星级'}
            {zone === 'north' && currentFloorId === 'N-L3-2F' && 'N3-2F 柴门荟 · 高端川菜'}
            {zone === 'north' && currentFloorId === 'N-L3-1F' && 'N3-1F 莱珀妮 · 陆家居 · 梅赛德斯-迈巴赫城市品牌中心'}
            {zone === 'north' && currentFloorId === 'N-L2-2F' && 'N2-2F 隐溪茶馆 SPA · 精品茶馆与养生空间'}
            {zone === 'north' && currentFloorId === 'N-L2-1F' && 'N2-1F 网红餐饮 · 白茸、复兴面王、PHANTACI、橘炭胡同、哥哥的深夜食堂'}
            {zone === 'north' && currentFloorId === 'N-L1-1F' && 'N1-1F PEANUT BUTTER · 满堂 by Bar Choice · NUMATA·SOU 沼田双'}
            {zone === 'north' && currentFloorId === 'N-B1' && 'B1 餐饮/宠物/便利 · MANNER、火星宠物超市、AirPark、PET MART、全家'}
            {zone === 'north' && currentFloorId === 'N-B2' && 'B2 餐饮/文创 · 茶姬、东发道、九木杂物社、多抓鱼、READ&SOCIAL'}
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
                  {currentFloorId === 'S-L4' && <p>南区4F，品质中餐聚集区，老吉堂、满愿家、青鹤荟、泰珍荟、高桌、晴空、Moon N Back等7家精致餐饮</p>}
                  {currentFloorId === 'S-L3' && <p>南区3F，时尚餐饮与生活方式，DIM SUM MARVEL点心、MEET THE BUND江景中餐、A&M高端美发沙龙</p>}
                  {currentFloorId === 'S-L2' && <p>南区2F，设计师品牌与运动时尚，ON/OFF先锋买手店、J.Lindeberg北欧运动、OUTCICS小众设计师集合</p>}
                  {currentFloorId === 'S-L1' && <p>南区1F，奢侈品与国际精品最密集区，Alexander Wang、Versace、Jimmy Choo、BALLY、Lanvin等19个品牌，另有星巴克/b3 Coffee/永璞咖啡矩阵</p>}
                  {currentFloorId === 'S-B1' && <p>南区B1，快餐（麦当劳/SUBWAY/么蛮）+美容（丽拉瓦迪SPA/丝域养发/美妆灵感空间）+珠宝（周大福）+健身（超级猩猩）</p>}
                  {currentFloorId === 'S-B2' && <p>南区B2，数码体验（小米/华为小爱同学/哈曼卡顿）+ 宠物（PET WISH/PonyStar）+ 快餐（喜茶/莆田/台湾食堂）</p>}
                  {currentFloorId === 'S-B3' && <p>南区B3，GALAXY AUTO STUDIO 车皇汽车体验中心</p>}
                  {currentFloorId === 'S1-5F' && <p>南区S1-5F，BFC高端健身会馆，配备游泳池、私教区、团课教室</p>}
                </>
              )}
              {zone === 'north' && (
                <>
                  {currentFloorId === 'N-L3-5F' && <p>北区N3顶层，上海滩品牌旗舰餐厅，外滩全景地标餐饮</p>}
                  {currentFloorId === 'N-L3-3F' && <p>北区N3-3F，新荣记（米其林台州菜）+ DA Vittorio Shanghai（米其林三星意餐）</p>}
                  {currentFloorId === 'N-L3-2F' && <p>北区N3-2F，柴门荟，高端川菜品牌</p>}
                  {currentFloorId === 'N-L3-1F' && <p>北区N3-1F，莱珀妮奢华护肤、陆家居高端家居、梅赛德斯-迈巴赫城市品牌中心</p>}
                  {currentFloorId === 'N-L2-2F' && <p>北区N2-2F，隐溪茶馆 SPA，精品茶馆与养生空间（非高茶）</p>}
                  {currentFloorId === 'N-L2-1F' && <p>北区N2-1F，网红餐饮集群：白茸、复兴面王深夜食堂、PHANTACI（周杰伦潮牌）、橘炭胡同·乌喜、哥哥的深夜食堂</p>}
                  {currentFloorId === 'N-L1-1F' && <p>北区N1-1F，PEANUT BUTTER美式汉堡 + 满堂 by Bar Choice鸡尾酒餐吧 + NUMATA·SOU 沼田双日系买手</p>}
                  {currentFloorId === 'N-B1' && <p>北区B1，餐饮（不入川豆花/云海肴/MANNER等多品牌）+ 宠物（火星宠物超市/AirPark/PET MART）+ 全家便利店</p>}
                  {currentFloorId === 'N-B2' && <p>北区B2，餐饮（茶姬/湖南饭店/东发道等）+ 文创（九木杂物社/多抓鱼/READ&SOCIAL/CLAWGALLERY）</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
