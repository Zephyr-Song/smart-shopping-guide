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

type TabType = 'traffic' | 'funnel' | 'segment' | 'store' | 'market'


// ── 上海10大商圈数据（来源：小红书采集报告 2026-05-30，外滩为BFC实际所在）──
const SHANGHAI_DISTRICTS = [
  { rank: 1, name: '南京东路', region: '黄浦区', mentions: 42, heat: 5, trait: '年客流2.5亿，商业第一街', representative: '新世界大丸·第一百货·永安百货', tag: '旅游打卡型' },
  { rank: 2, name: '南京西路', region: '静安区', mentions: 38, heat: 5, trait: '"金三角"奢侈品消费高地', representative: '恒隆广场·SKP·兴业太古汇', tag: '高端消费型' },
  { rank: 3, name: '淮海中路', region: '黄浦区', mentions: 35, heat: 4, trait: '时尚潮流发源地，全长2.2km', representative: 'K11·iapm·淮海755', tag: '潮流年轻型' },
  { rank: 4, name: '徐家汇', region: '徐汇区', mentions: 32, heat: 4, trait: '"全能型"商圈，中央活动区', representative: '港汇恒隆·美罗城·东方商厦', tag: '一站式生活型' },
  { rank: 5, name: '陆家嘴', region: '浦东新区', mentions: 30, heat: 4, trait: '金融中心核心，后起之秀', representative: '国金IFC·正大广场·L+Mall', tag: '金融商务型' },
  { rank: 6, name: '外滩', region: '黄浦区', mentions: 28, heat: 4, trait: '江景金融商圈，BFC所在', representative: 'BFC外滩金融中心·外滩源·半岛酒店', tag: '金融艺术型', highlight: true },
  { rank: 7, name: '新天地', region: '黄浦区', mentions: 25, heat: 3, trait: '石库门海派文化+时尚商业', representative: '新天地时尚·太平洋广场', tag: 'Citywalk型' },
  { rank: 8, name: '静安寺', region: '静安区', mentions: 22, heat: 3, trait: '寺庙文化+高端商圈融合', representative: '芮欧百货·嘉里中心', tag: '精致文化型' },
  { rank: 9, name: '五角场', region: '杨浦区', mentions: 18, heat: 3, trait: '大学城商圈，年轻化消费', representative: '万达广场·百联又一城', tag: '年轻活力型' },
  { rank: 10, name: '中山公园', region: '长宁区', mentions: 12, heat: 2, trait: '社区型商圈，生活便利', representative: '环球港·龙之梦', tag: '社区生活型' },
]

// ── 2025年上海商场销售额排名（来源：小红书多篇笔记交叉验证）──
const MALL_REVENUE = [
  { rank: 1, name: '上海国金中心IFC', district: '陆家嘴', revenue: '200亿+', note: '顶奢集中，业绩稳居全国第一' },
  { rank: 2, name: '上海环球港', district: '中山公园', revenue: '200亿+', note: '体量最大，客流量居全市第一' },
  { rank: 3, name: '上海恒隆广场', district: '南京西路', revenue: '150亿+', note: '奢侈品密度极高，高客单价' },
  { rank: 4, name: '上海SKP', district: '南京西路', revenue: '新开业', note: '2025新开业，数据待统计' },
  { rank: 5, name: '兴业太古汇', district: '南京西路', revenue: '80亿+', note: '办公+零售一体，稳定客群' },
]

// ── 小红书高赞笔记 TOP10 ──
const XHS_TOP_NOTES = [
  { title: '📍上海这么玩就对了❗附3日旅游手绘地图', author: 'GaonaiJ（环球旅行）', likes: 8981, url: 'https://www.xiaohongshu.com/explore/687de836000000001202c56a' },
  { title: '不看＝白玩！你的假期上海citywalk手册上线', author: '上海去哪儿', likes: 8705, url: 'https://www.xiaohongshu.com/explore/68dcccec00000000050028e9' },
  { title: '商业 | 上海市购物中心分布', author: '小观图说', likes: 6560, url: 'https://www.xiaohongshu.com/explore/695769c1000000002200a9dd' },
  { title: '上海必逛9大商圈合集‼跟着逛不踩雷', author: '魔都艾美丽', likes: 5521, url: 'https://www.xiaohongshu.com/explore/686d23ea000000002400fafa' },
  { title: '第一次来上海，上海CityWalk这么逛‼', author: '乐乐麻麻 找乐子', likes: 5242, url: 'https://www.xiaohongshu.com/explore/69be55e30000000023023644' },
  { title: '以为外滩已经够美了，直到我去了徐家汇…', author: '山炮小王子', likes: 3994, url: 'https://www.xiaohongshu.com/explore/69688fc4000000000a02d3c4' },
  { title: '上海十大商场血拼指南！本地人私藏逛街地图', author: '月月博士聊孕期', likes: 3170, url: 'https://www.xiaohongshu.com/explore/6891f26f000000002501ad1f' },
  { title: '上海商场攻略✅LV巨轮地址✅上海逛街指南', author: '小蜂仔', likes: 2981, url: 'https://www.xiaohongshu.com/explore/686f6d7f0000000017031880' },
  { title: '上海旅游必逛的9个商场！上海逛街攻略', author: '酥小爱（海派礼物）', likes: 2847, url: 'https://www.xiaohongshu.com/explore/688b30820000000023024a11' },
  { title: '国内唯一能与东京媲美的地方', author: '杰森商刊', likes: 2500, url: 'https://www.xiaohongshu.com/explore/69660c16000000000a028b4c' },
]

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

  const districtChartData = {
    labels: SHANGHAI_DISTRICTS.map(d => d.name),
    datasets: [
      {
        label: '小红书提及频次',
        data: SHANGHAI_DISTRICTS.map(d => d.mentions),
        backgroundColor: SHANGHAI_DISTRICTS.map(d =>
          d.highlight ? 'rgba(186,117,23,0.85)' : 'rgba(83,74,183,0.55)'
        ),
        borderRadius: 4,
      },
    ],
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
            <span>以下数据来源于小红书浏览器真实采集（2026-05-30），金色标注为 BFC 所在外滩商圈。提及频次为搜索结果中商圈被讨论的统计数量。</span>
          </div>

          {/* 商圈热度柱状图 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900">上海10大商圈小红书热度</h3>
              <span className="text-xs text-gray-400">（60条笔记提及频次统计）</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              <span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: 'rgba(186,117,23,0.85)' }}></span>
              金色标注为 BFC 所在外滩商圈
            </p>
            <Bar data={districtChartData} options={baseOptions} />
          </div>

          {/* 外滩商圈定位 + 销售额》*/}
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
              <p className="text-xs text-gray-400 mt-3">* 来源：小红书多篇笔记交叉验证，非官方数据</p>
            </div>
          </div>

          {/* 商圈多维对比表格 */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">上海商圈多维对比</h3>
              <p className="text-xs text-gray-400 mt-0.5">按小红书热度排序，含商圈类型、客群画像、代表商场</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">商圈</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">区域</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">类型</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">核心特征</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">代表商场</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">热度</th>
                  </tr>
                </thead>
                <tbody>
                  {SHANGHAI_DISTRICTS.map((d, i) => (
                    <tr
                      key={d.rank}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${d.highlight ? 'ring-1 ring-inset ring-amber-200' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-medium"
                          style={{
                            background: d.rank <= 3 ? '#FAEEDA' : '#F1EFE8',
                            color: d.rank <= 3 ? '#854F0B' : '#888780',
                          }}
                        >
                          {d.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-900">{d.name}</span>
                        {d.highlight && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">BFC所在</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{d.region}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{d.tag}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[140px]">{d.trait}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{d.representative}</td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="inline-flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <span key={j} style={{ color: j < d.heat ? starColor : '#D3D1C7', fontSize: 12 }}>★</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 小红书高赞笔记 TOP10 */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">小红书高赞笔记 TOP10</h3>
              <span className="text-xs text-gray-400">实时采集 · 可溯源</span>
            </div>
            <div className="space-y-2">
              {XHS_TOP_NOTES.map((note, i) => (
                <a
                  key={i}
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{
                      background: i < 3 ? '#FAECE7' : '#F1EFE8',
                      color: i < 3 ? '#993C1D' : '#5F5E5A',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 truncate">{note.title}</div>
                    <div className="text-xs text-gray-400">{note.author}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-medium text-red-500">{note.likes.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">赞</span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
