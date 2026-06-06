import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Star,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  HOURLY_TRAFFIC,
  CUSTOMER_SEGMENTS,
  STORES,
} from '../data/mockData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type TabType = 'traffic' | 'funnel' | 'segment' | 'store'


export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabType>('traffic')
  const [storeSearch, setStoreSearch] = useState('')
  const [storeCategoryFilter, setStoreCategoryFilter] = useState('全部')

  const tabs: { key: TabType; label: string; icon: typeof BarChart3 }[] = [
    { key: 'traffic', label: '客流趋势', icon: TrendingUp },
    { key: 'funnel', label: '购物路径', icon: BarChart3 },
    { key: 'segment', label: '客群画像', icon: Users },
    { key: 'store', label: '门店热度', icon: DollarSign },
  ]

  // ── 品类汇总客流 ──
  const categoryTraffic = useMemo(() => {
    const map: Record<string, number> = {}
    STORES.forEach(s => {
      map[s.category] = (map[s.category] || 0) + s.visitorCount
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count }))
  }, [])

  // ── 过滤后门店列表 ──
  const filteredStores = useMemo(() => {
    return STORES.filter(s => {
      const matchSearch = storeSearch === '' || s.name.toLowerCase().includes(storeSearch.toLowerCase()) || s.category.includes(storeSearch)
      const matchCat = storeCategoryFilter === '全部' || s.category === storeCategoryFilter
      return matchSearch && matchCat
    })
  }, [storeSearch, storeCategoryFilter])

  const allCategories = useMemo(() => ['全部', ...Array.from(new Set(STORES.map(s => s.category)))], [])

  // ── Chart Data ──
  const trafficChartData = {
    labels: HOURLY_TRAFFIC.map(d => d.hour),
    datasets: [
      {
        label: '客流量',
        data: HOURLY_TRAFFIC.map(d => d.visitors),
        borderColor: '#534AB7',
        backgroundColor: 'rgba(83,74,183,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: '成交人次',
        data: HOURLY_TRAFFIC.map(d => d.conversions),
        borderColor: '#0F6E56',
        backgroundColor: 'rgba(15,110,86,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }

  const revenueChartData = {
    labels: HOURLY_TRAFFIC.map(d => d.hour),
    datasets: [
      {
        label: '营业额 (¥)',
        data: HOURLY_TRAFFIC.map(d => d.revenue),
        backgroundColor: 'rgba(186,117,23,0.65)',
        borderColor: '#BA7517',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const segmentChartData = {
    labels: CUSTOMER_SEGMENTS.map(s => s.name),
    datasets: [
      {
        data: CUSTOMER_SEGMENTS.map(s => s.percentage),
        backgroundColor: CUSTOMER_SEGMENTS.map(s => s.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  const categoryChartData = {
    labels: categoryTraffic.map(d => d.cat),
    datasets: [
      {
        label: '品类日客流',
        data: categoryTraffic.map(d => d.count),
        backgroundColor: 'rgba(83,74,183,0.65)',
        borderRadius: 4,
      },
    ],
  }

  const baseOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  }

  const categoryOptions = {
    ...baseOptions,
    indexAxis: 'y' as const,
    scales: {
      x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  }

  const funnelSteps = [
    { label: '商场入口', value: 1200, color: '#534AB7' },
    { label: '进入店铺', value: 580, color: '#7F77DD' },
    { label: '商品互动', value: 320, color: '#AFA9EC' },
    { label: '加入购物车', value: 180, color: '#CECBF6' },
    { label: '完成购买', value: 96, color: '#EEEDFE' },
  ]

  const heatColor = (v: number) =>
    v >= 0.85 ? '#E24B4A' : v >= 0.65 ? '#BA7517' : '#639922'

  const starColor = '#BA7517'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-500" />
          商圈分析
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          BFC 外滩金融中心 · 数据看板 · 客流与品类数据为仿真数据，商圈竞争数据来源于小红书采集（2026-05-30）
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '今日客流', value: '14,260', change: '+18.6%', up: true, icon: Users, color: 'text-primary-500' },
          { label: '购物路径转化', value: '8.0%', change: '+1.2pp', up: true, icon: TrendingUp, color: 'text-emerald-500' },
          { label: '日均营业额', value: '¥156.8万', change: '+12.4%', up: true, icon: DollarSign, color: 'text-amber-500' },
          { label: 'AI 推荐点击率', value: '38.2%', change: '+22.1%', up: true, icon: BarChart3, color: 'text-rose-500' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{card.value}</div>
              <div className={`flex items-center gap-0.5 text-xs mt-1 ${card.up ? 'text-green-500' : 'text-red-500'}`}>
                {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.change} vs 上周
              </div>
            </div>
          )
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer border-none whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 bg-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab 1: 客流趋势 ── */}
      {activeTab === 'traffic' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">全天客流量与成交趋势</h3>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>客流量</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>成交人次</span>
              </div>
            </div>
            <Line data={trafficChartData} options={baseOptions} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">各时段营业额</h3>
            <Bar data={revenueChartData} options={baseOptions} />
          </div>
        </div>
      )}

      {/* ── Tab 2: 购物路径 ── */}
      {activeTab === 'funnel' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-1">购物路径转化漏斗</h3>
          <p className="text-xs text-gray-400 mb-6">追踪访客从入场到完成消费的各阶段流转</p>
          <div className="max-w-lg mx-auto space-y-3">
            {funnelSteps.map((step, i) => {
              const width = (step.value / funnelSteps[0].value) * 100
              const convRate = i > 0 ? ((step.value / funnelSteps[i - 1].value) * 100).toFixed(1) : '100'
              return (
                <div key={i} className="relative">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{step.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{step.value.toLocaleString()} 人</span>
                      {i > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          留存 {convRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 bg-gray-50 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${width}%`, backgroundColor: step.color, minWidth: '60px' }}
                    >
                      {width > 15 && (
                        <span className="text-xs font-semibold" style={{ color: i < 2 ? '#fff' : '#534AB7' }}>
                          {width.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {i < funnelSteps.length - 1 && (
                    <div className="text-center text-xs text-gray-400 py-0.5">
                      ↓ 流失 {(100 - (funnelSteps[i + 1].value / step.value) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-6 bg-amber-50 rounded-lg p-4 text-sm text-amber-700">
            <strong>关键洞察：</strong>从「进入店铺」到「商品互动」流失率最高（44.8%）。
            AI 个性化推荐可在此环节发力——精准推送减少无效浏览，提升互动意愿。
          </div>
        </div>
      )}

      {/* ── Tab 3: 客群画像 ── */}
      {activeTab === 'segment' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">客群构成分布</h3>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={segmentChartData}
                options={{
                  responsive: true,
                  cutout: '60%',
                  plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">各客群关键指标</h3>
            <div className="space-y-3">
              {CUSTOMER_SEGMENTS.map(seg => (
                <div key={seg.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{seg.name}</span>
                      <span className="text-xs text-gray-500">{seg.percentage}%</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>客单价 ¥{seg.avgSpend}</span>
                      <span>复购率 {(seg.revisitRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: 门店热度 ── */}
      {activeTab === 'store' && (
        <div className="space-y-4">
          {/* 品类汇总柱状图 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">各品类总客流分布</h3>
            <p className="text-xs text-gray-400 mb-4">按商品/服务品类汇总全部门店日客流量</p>
            <div style={{ height: `${categoryTraffic.length * 38 + 60}px` }}>
              <Bar data={categoryChartData} options={categoryOptions} />
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索店铺名称或品类…"
                value={storeSearch}
                onChange={e => setStoreSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <select
              value={storeCategoryFilter}
              onChange={e => setStoreCategoryFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* 门店列表 */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
              共 {filteredStores.length} 家店铺
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">店铺</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">品类</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">楼层</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">日客流</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">评分</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">热度</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map((store, i) => (
                    <tr key={store.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{store.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{store.category}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{store.floor}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700">{store.visitorCount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right" style={{ color: starColor }}>
                        <span className="flex items-center justify-end gap-0.5">
                          <Star className="w-3 h-3" />
                          {store.rating}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${store.heatmap * 100}%`, background: heatColor(store.heatmap) }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
