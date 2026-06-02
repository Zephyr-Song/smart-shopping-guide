import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
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

type TabType = 'traffic' | 'conversion' | 'segment' | 'store'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabType>('traffic')

  const tabs: { key: TabType; label: string; icon: typeof BarChart3 }[] = [
    { key: 'traffic', label: '客流趋势', icon: TrendingUp },
    { key: 'conversion', label: '转化漏斗', icon: BarChart3 },
    { key: 'segment', label: '客群画像', icon: Users },
    { key: 'store', label: '门店对比', icon: DollarSign },
  ]

  // Traffic chart data
  const trafficChartData = {
    labels: HOURLY_TRAFFIC.map(d => d.hour),
    datasets: [
      {
        label: '客流量',
        data: HOURLY_TRAFFIC.map(d => d.visitors),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: '转化人次',
        data: HOURLY_TRAFFIC.map(d => d.conversions),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const revenueChartData = {
    labels: HOURLY_TRAFFIC.map(d => d.hour),
    datasets: [
      {
        label: '营业额 (¥)',
        data: HOURLY_TRAFFIC.map(d => d.revenue),
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: '#f97316',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  // Segment chart data
  const segmentChartData = {
    labels: CUSTOMER_SEGMENTS.map(s => s.name),
    datasets: [
      {
        data: CUSTOMER_SEGMENTS.map(s => s.percentage),
        backgroundColor: CUSTOMER_SEGMENTS.map(s => s.color),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }

  // Store comparison data
  const storeChartData = {
    labels: STORES.slice(0, 8).map(s => s.name),
    datasets: [
      {
        label: '日客流量',
        data: STORES.slice(0, 8).map(s => s.visitorCount),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 4,
      },
      {
        label: '转化率 (×10000)',
        data: STORES.slice(0, 8).map(s => Math.round(s.conversionRate * 10000)),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  }

  // Conversion funnel data
  const funnelSteps = [
    { label: '商场入口', value: 1200, color: '#6366f1' },
    { label: '进入店铺', value: 580, color: '#818cf8' },
    { label: '商品互动', value: 320, color: '#a5b4fc' },
    { label: '加入购物车', value: 180, color: '#c7d2fe' },
    { label: '完成购买', value: 96, color: '#e0e7ff' },
  ]

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } },
    },
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-500" />
          商圈分析
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          BFC 外滩金融中心 · 数据看板
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '今日客流', value: '11,960', change: '+12.3%', up: true, icon: Users, color: 'text-primary-500' },
          { label: '总转化率', value: '18.7%', change: '+3.2%', up: true, icon: TrendingUp, color: 'text-emerald-500' },
          { label: '日均营业额', value: '¥98.4万', change: '+8.7%', up: true, icon: DollarSign, color: 'text-amber-500' },
          { label: 'AI 推荐点击率', value: '34.5%', change: '+15.1%', up: true, icon: BarChart3, color: 'text-rose-500' },
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
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer border-none ${
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

      {/* Tab Content */}
      {activeTab === 'traffic' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">全天客流量与转化趋势</h3>
            <Line data={trafficChartData} options={chartOptions} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">各时段营业额</h3>
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {activeTab === 'conversion' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">消费者转化漏斗</h3>
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
                          转化 {convRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                      style={{
                        width: `${width}%`,
                        backgroundColor: step.color,
                        minWidth: '60px',
                      }}
                    >
                      {width > 15 && (
                        <span className="text-xs font-semibold text-white">
                          {(width).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {i < funnelSteps.length - 1 && (
                    <div className="text-center text-xs text-gray-400 py-0.5">
                      ↓ {((funnelSteps[i + 1].value / step.value) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-6 bg-amber-50 rounded-lg p-4 text-sm text-amber-700">
            <strong>关键洞察：</strong>从「进入店铺」到「商品互动」环节流失率最高（44.8%），
            AI 个性化推荐可在此环节发挥作用，通过精准推送提升互动意愿。
          </div>
        </div>
      )}

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
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: seg.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {seg.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {seg.percentage}%
                      </span>
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

      {activeTab === 'store' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">门店客流量与转化率对比</h3>
            <Bar data={storeChartData} options={chartOptions} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">店铺</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">品类</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">日客流</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">转化率</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">评分</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">热度</th>
                </tr>
              </thead>
              <tbody>
                {STORES.map((store, i) => (
                  <tr key={store.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{store.name}</td>
                    <td className="px-4 py-2.5 text-gray-500">{store.category}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{store.visitorCount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{(store.conversionRate * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2.5 text-right text-amber-500">⭐ {store.rating}</td>
                    <td className="px-4 py-2.5">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${store.heatmap * 100}%`,
                            background:
                              store.heatmap >= 0.9
                                ? '#ef4444'
                                : store.heatmap >= 0.7
                                ? '#f97316'
                                : '#eab308',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
