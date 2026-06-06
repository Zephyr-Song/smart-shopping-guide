import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ExternalLink,
  Star,
  MapPin,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2'
import {
  HOURLY_TRAFFIC,
  CUSTOMER_SEGMENTS,
  STORES,
} from '../data/mockData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type TabType = 'traffic' | 'funnel' | 'segment' | 'store' | 'market'


// ── 上海10大商圈多维数据（综合来源：上海市商务委2025年1-5月商圈报告、赢商网、各商场年报、地铁官网）──
type DimKey = 'traffic' | 'retail' | 'spending' | 'transport' | 'firstStore'

interface DistrictData {
  rank: number
  name: string
  region: string
  scores: Record<DimKey, number>
  trait: string
  representative: string
  tag: string
  highlight: boolean
  metroLines: string
}

const DIM_LABELS: Record<DimKey, string> = {
  traffic: '客流体量',
  retail: '零售规模',
  spending: '消费力',
  transport: '交通便利',
  firstStore: '首店经济',
}

const SHANGHAI_DISTRICTS: DistrictData[] = [
  { rank: 1, name: '南京东路', region: '黄浦区', scores: { traffic: 5, retail: 4, spending: 3, transport: 3, firstStore: 4 }, trait: '年客流1.14亿，销售额破110亿', representative: '新世界大丸·第一百货·永安百货', tag: '旅游打卡型', highlight: false, metroLines: '2/10号线' },
  { rank: 2, name: '南京西路', region: '静安区', scores: { traffic: 4, retail: 5, spending: 5, transport: 4, firstStore: 5 }, trait: '"金三角"奢侈品消费高地，首店第一', representative: '恒隆广场·兴业太古汇·中信泰富', tag: '高端消费型', highlight: false, metroLines: '2/12/13号线' },
  { rank: 3, name: '小陆家嘴-张杨路', region: '浦东新区', scores: { traffic: 5, retail: 5, spending: 5, transport: 3, firstStore: 4 }, trait: '国际高端品牌矩阵，零售规模第一', representative: '国金IFC·正大广场·第一八佰伴', tag: '金融商务型', highlight: false, metroLines: '2/14号线' },
  { rank: 4, name: '淮海中路', region: '黄浦区', scores: { traffic: 4, retail: 4, spending: 4, transport: 4, firstStore: 4 }, trait: '时尚潮流发源地，全长2.2km', representative: 'K11·iapm·淮海755', tag: '潮流年轻型', highlight: false, metroLines: '1/10/13号线' },
  { rank: 5, name: '徐家汇', region: '徐汇区', scores: { traffic: 4, retail: 4, spending: 3, transport: 4, firstStore: 3 }, trait: '"全能型"商圈，ITC再造一个徐家汇', representative: '港汇恒隆·美罗城·ITC', tag: '一站式生活型', highlight: false, metroLines: '1/9/11号线' },
  { rank: 6, name: '外滩', region: '黄浦区', scores: { traffic: 3, retail: 3, spending: 4, transport: 3, firstStore: 3 }, trait: '江景金融+艺术商圈，BFC所在', representative: 'BFC外滩金融中心·外滩源·半岛酒店', tag: '金融艺术型', highlight: true, metroLines: '2/10/14号线' },
  { rank: 7, name: '新天地', region: '黄浦区', scores: { traffic: 3, retail: 3, spending: 4, transport: 4, firstStore: 3 }, trait: '石库门海派文化+时尚商业', representative: '新天地时尚·太平洋广场', tag: 'Citywalk型', highlight: false, metroLines: '1/10/13号线' },
  { rank: 8, name: '静安寺', region: '静安区', scores: { traffic: 3, retail: 3, spending: 4, transport: 4, firstStore: 4 }, trait: '寺庙文化+高端商圈融合', representative: '芮欧百货·嘉里中心·久光', tag: '精致文化型', highlight: false, metroLines: '2/7/14号线' },
  { rank: 9, name: '五角场', region: '杨浦区', scores: { traffic: 4, retail: 3, spending: 2, transport: 2, firstStore: 2 }, trait: '大学城商圈，客流增速超20%', representative: '万达广场·百联又一城·合生汇', tag: '年轻活力型', highlight: false, metroLines: '10号线' },
  { rank: 10, name: '中山公园', region: '长宁区', scores: { traffic: 3, retail: 3, spending: 2, transport: 3, firstStore: 2 }, trait: '社区型商圈，餐饮规模第三', representative: '环球港·龙之梦·来福士', tag: '社区生活型', highlight: false, metroLines: '2/3/4号线' },
]

// 计算10商圈各维度均值
const AVG_SCORES: Record<DimKey, number> = {
  traffic: 0, retail: 0, spending: 0, transport: 0, firstStore: 0,
}
const allDims: DimKey[] = ['traffic', 'retail', 'spending', 'transport', 'firstStore']
allDims.forEach(d => {
  AVG_SCORES[d] = Math.round(SHANGHAI_DISTRICTS.reduce((s, x) => s + x.scores[d], 0) / SHANGHAI_DISTRICTS.length * 10) / 10
})

// ── 2025年上海商场销售额排名（综合来源：联商网、赢商网年报、各商场官方披露）──
const MALL_REVENUE = [
  { rank: 1, name: '上海国金中心IFC', district: '陆家嘴', revenue: '218亿', note: '顶奢集中，全国商场销售额第一' },
  { rank: 2, name: '上海环球港', district: '中山公园', revenue: '217亿', note: '体量最大，客流量全市第一' },
  { rank: 3, name: '上海恒隆广场', district: '南京西路', revenue: '135亿', note: '奢侈品密度极高，高客单价' },
  { rank: 4, name: '龙之梦城市生活中心', district: '中山公园', revenue: '135亿', note: '2025年首次突破百亿大关' },
  { rank: 5, name: '兴业太古汇', district: '南京西路', revenue: '80亿+', note: '办公+零售一体，销售额同比增41.9%' },
]
  // ── 雷达图：BFC外滩 vs 10商圈均值 ──

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabType>('traffic')
  const [storeSearch, setStoreSearch] = useState('')
  const [storeCategoryFilter, setStoreCategoryFilter] = useState('全部')

  const tabs: { key: TabType; label: string; icon: typeof BarChart3 }[] = [
    { key: 'traffic', label: '客流趋势', icon: TrendingUp },
    { key: 'funnel', label: '购物路径', icon: BarChart3 },
    { key: 'segment', label: '客群画像', icon: Users },
    { key: 'store', label: '门店热度', icon: DollarSign },
    { key: 'market', label: '商圈对比', icon: MapPin },
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

  // ── 雷达图：BFC外滩 vs 10商圈均值 ──
  const bfcDistrict = SHANGHAI_DISTRICTS.find(d => d.highlight)!
  const radarData = {
    labels: allDims.map(d => DIM_LABELS[d]),
    datasets: [
      {
        label: 'BFC 外滩',
        data: allDims.map(d => bfcDistrict.scores[d]),
        borderColor: '#BA7517',
        backgroundColor: 'rgba(186,117,23,0.12)',
        borderWidth: 2,
        pointBackgroundColor: '#BA7517',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
      {
        label: '10商圈均值',
        data: allDims.map(d => AVG_SCORES[d]),
        borderColor: '#9CA3AF',
        backgroundColor: 'rgba(156,163,175,0.05)',
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: '#9CA3AF',
        pointBorderColor: '#fff',
        pointRadius: 3,
      },
    ],
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        min: 1,
        ticks: { stepSize: 1, display: false },
        grid: { color: '#E5E7EB' },
        pointLabels: { font: { size: 11 }, color: '#374151' },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      },
      tooltip: { enabled: true },
    },
  }

  // ── 多维打分总表：按综合分排序 ──
  const complexScore = (d: DistrictData) =>
    allDims.reduce((s, k) => s + d.scores[k], 0)

  const rankedDistricts = [...SHANGHAI_DISTRICTS].sort((a, b) => complexScore(b) - complexScore(a))

  // ── 得分色阶 ──
  const scoreColor = (v: number) => {
    if (v >= 5) return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    if (v >= 4) return { bg: 'bg-blue-100', text: 'text-blue-700' }
    if (v >= 3) return { bg: 'bg-amber-100', text: 'text-amber-700' }
    return { bg: 'bg-gray-100', text: 'text-gray-500' }
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
          BFC 外滩金融中心 · 数据看板
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
      {/* ── Tab 5: 商圈对比 ── */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          {/* 数据来源说明 */}
          <div className="bg-blue-50 rounded-xl p-3.5 text-sm text-blue-700 flex gap-2 items-start">
            <span className="flex-shrink-0">📌</span>
            <span>综合上海市商务委《2025年1-5月商圈发展报告》、赢商网、联商网、各商场年报及地铁官网数据。多维评分 1-5 分，金色标注为 BFC 所在外滩商圈。</span>
          </div>

          {/* 雷达图：BFC vs 均值 + 总分排名 */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* 雷达图 */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">BFC 外滩 vs 10商圈均值 · 多维雷达</h3>
              <div className="max-w-[360px] mx-auto">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            {/* 综合排名卡片 */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">商圈综合力排名 (5维加权)</h3>
              <div className="space-y-1.5">
                {rankedDistricts.map((d, i) => {
                  const total = complexScore(d)
                  const max = 25
                  const pct = (total / max) * 100
                  return (
                    <div
                      key={d.name}
                      className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-sm ${
                        d.highlight ? 'bg-amber-50 ring-1 ring-amber-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`w-[72px] text-xs flex-shrink-0 ${d.highlight ? 'font-semibold text-amber-700' : 'text-gray-700'}`}>
                        {d.name}
                        {d.highlight && <span className="ml-1 text-[10px] bg-amber-200 text-amber-700 px-1 py-0.5 rounded">BFC</span>}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: d.highlight
                              ? 'linear-gradient(90deg, #BA7517, #D4952B)'
                              : pct >= 80 ? 'linear-gradient(90deg, #534AB7, #7F77DD)' : pct >= 64 ? '#7F77DD' : '#AFA9EC',
                          }}
                        />
                      </div>
                      <span className="w-[28px] text-right text-xs font-mono text-gray-500">{total}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">满分 25 分（5维度 × 5分），来源同上</p>
            </div>
          </div>

          {/* 外滩商圈定位 + 销售额 */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">外滩商圈 · BFC 定位分析</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="w-16 text-xs text-gray-400 flex-shrink-0 pt-0.5">区域</span>
                  <span className="text-gray-700">浦西·黄浦区，中山东二路，紧邻外滩万国建筑群</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-16 text-xs text-gray-400 flex-shrink-0 pt-0.5">定位</span>
                  <span className="text-gray-700">江景金融+文化艺术商圈，黄浦江第一排</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-16 text-xs text-gray-400 flex-shrink-0 pt-0.5">核心场所</span>
                  <span className="text-gray-700">BFC外滩金融中心 · 外滩源 · 半岛酒店 · 复星艺术中心</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-16 text-xs text-gray-400 flex-shrink-0 pt-0.5">主要客群</span>
                  <span className="text-gray-700">金融白领 · 艺术爱好者 · 江景观光客 · 家庭消费</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-16 text-xs text-gray-400 flex-shrink-0 pt-0.5">竞争优势</span>
                  <span className="text-gray-700">外滩江景稀缺资源 + 复星艺术中心文化IP + 精致餐饮集群，与对岸陆家嘴形成差异化互补</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">2025上海商场销售额 TOP5</h3>
              <div className="space-y-2">
                {MALL_REVENUE.map(mall => (
                  <div key={mall.rank} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                      style={{
                        background: mall.rank <= 3 ? '#FAEEDA' : '#F1EFE8',
                        color: mall.rank <= 3 ? '#854F0B' : '#5F5E5A',
                      }}
                    >
                      {mall.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{mall.name}</div>
                      <div className="text-xs text-gray-400">{mall.district} · {mall.note}</div>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 flex-shrink-0">{mall.revenue}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">* 来源：联商网、赢商网及各商场官方年报，2025全年数据</p>
            </div>
          </div>

          {/* 多维打分对比总表 */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">10大商圈 · 五维对比总表</h3>
                <p className="text-xs text-gray-400 mt-0.5">按综合得分排序：客流体量 · 零售规模 · 消费力 · 交通便利 · 首店经济</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block"></span>BFC所在</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-100 inline-block"></span>5分</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-100 inline-block"></span>4分</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 inline-block"></span>3分</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-100 inline-block"></span>1-2分</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">商圈</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">区域·地铁</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">类型</th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600 w-[64px]">客流体量</th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600 w-[64px]">零售规模</th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600 w-[64px]">消费力</th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600 w-[64px]">交通便利</th>
                    <th className="text-center px-2 py-3 font-medium text-gray-600 w-[64px]">首店经济</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600 w-[48px]">总分</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">代表商场</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedDistricts.map((d, i) => {
                    const total = complexScore(d)
                    return (
                      <tr
                        key={d.name}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${d.highlight ? 'ring-1 ring-inset ring-amber-200 bg-amber-50/30' : ''}`}
                      >
                        <td className="px-4 py-2.5 text-center">
                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                            i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-medium ${d.highlight ? 'text-amber-700' : 'text-gray-900'}`}>{d.name}</span>
                          {d.highlight && <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-700 px-1 py-0.5 rounded">BFC</span>}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-gray-400">
                          <div>{d.region}</div>
                          <div>{d.metroLines}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{d.tag}</span>
                        </td>
                        {allDims.map(dim => {
                          const v = d.scores[dim]
                          const c = scoreColor(v)
                          return (
                            <td key={dim} className="px-2 py-2.5 text-center">
                              <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center text-xs font-semibold ${c.bg} ${c.text}`}>
                                {v}
                              </span>
                            </td>
                          )
                        })}
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-xs font-bold font-mono ${
                            d.highlight ? 'text-amber-600' : 'text-gray-700'
                          }`}>{total}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-gray-400 max-w-[160px]">{d.representative}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 商圈基准对比卡片 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {allDims.map(dim => {
              const bfcVal = bfcDistrict.scores[dim]
              const avgVal = AVG_SCORES[dim]
              const diff = bfcVal - avgVal
              const ahead = diff >= 0
              return (
                <div key={dim} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">{DIM_LABELS[dim]}</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`text-lg font-bold ${ahead ? 'text-amber-600' : 'text-gray-400'}`}>{bfcVal}</span>
                    <span className="text-xs text-gray-300">/</span>
                    <span className="text-xs text-gray-400">{avgVal}</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${ahead ? 'text-green-600' : 'text-red-400'}`}>
                    {ahead ? `+${diff.toFixed(1)}` : diff.toFixed(1)} vs 均值
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
