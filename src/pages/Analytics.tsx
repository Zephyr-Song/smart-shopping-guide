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
  MapPin,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
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

type TabType = 'traffic' | 'funnel' | 'segment' | 'store' | 'market' | 'advisor'

// ── 选址顾问：品类适配度数据 ──
interface CategoryFit {
  id: string
  name: string
  emoji: string
  scores: {
    customerMatch: number   // 客群匹配
    competition: number     // 竞争密度（低=好）
    spendingPotential: number // 消费潜力
    districtSynergy: number  // 商圈协同
  }
  recommendation: 'strong' | 'good' | 'caution' | 'not-fit'
  reason: string
  bestFloor: string
  competitorCount: number
  avgRentIndex: number  // 租金指数(外滩均值=100)
}

const CATEGORY_FIT_DATA: CategoryFit[] = [
  {
    id: 'fine-dining',
    name: '精致餐饮',
    emoji: '🍽️',
    scores: { customerMatch: 92, competition: 62, spendingPotential: 94, districtSynergy: 88 },
    recommendation: 'strong',
    reason: '外滩江景溢价显著，金融客群消费力强，与复星艺术中心形成文化+餐饮联动，客单价可较商圈均值高出30-40%',
    bestFloor: 'N-3F / N-4F（江景）、S-3F',
    competitorCount: 3,
    avgRentIndex: 118,
  },
  {
    id: 'luxury',
    name: '奢侈品牌',
    emoji: '💎',
    scores: { customerMatch: 84, competition: 75, spendingPotential: 96, districtSynergy: 80 },
    recommendation: 'good',
    reason: '高净值客群密集，但奢侈品核心阵地在南京西路/陆家嘴，外滩需差异化定位，建议以江景旗舰+艺术联名切入',
    bestFloor: 'S-1F / N-1F（主入口）',
    competitorCount: 5,
    avgRentIndex: 142,
  },
  {
    id: 'trendy',
    name: '潮流品牌',
    emoji: '👟',
    scores: { customerMatch: 76, competition: 70, spendingPotential: 72, districtSynergy: 78 },
    recommendation: 'good',
    reason: '25-35岁新兴消费群体契合，BFC已有潮流品牌集群，借助艺术IP联名可提升溢价感，建议主打设计师/限定系列',
    bestFloor: 'S-2F / N-2F',
    competitorCount: 8,
    avgRentIndex: 95,
  },
  {
    id: 'light-luxury',
    name: '轻奢腕表珠宝',
    emoji: '⌚',
    scores: { customerMatch: 90, competition: 55, spendingPotential: 91, districtSynergy: 85 },
    recommendation: 'strong',
    reason: '外滩金融客群对腕表/珠宝需求强烈，目前竞争密度低于陆家嘴，先发优势明显，单坪产值潜力极高',
    bestFloor: 'S-1F（主力展示位）',
    competitorCount: 2,
    avgRentIndex: 135,
  },
  {
    id: 'coffee-tea',
    name: '精品咖啡/茶饮',
    emoji: '☕',
    scores: { customerMatch: 78, competition: 45, spendingPotential: 65, districtSynergy: 82 },
    recommendation: 'caution',
    reason: 'BFC已有5家咖啡/茶饮品牌，江景位优势已被头部品牌占据，新入局需强差异化（如特调/文化IP），租金回收压力较大',
    bestFloor: 'N-1F 户外区域、S-B1',
    competitorCount: 5,
    avgRentIndex: 88,
  },
  {
    id: 'fast-fashion',
    name: '快时尚',
    emoji: '👕',
    scores: { customerMatch: 42, competition: 30, spendingPotential: 48, districtSynergy: 38 },
    recommendation: 'not-fit',
    reason: '外滩商圈定位高端/精致，快时尚与整体调性不符，客群消费力远超快时尚客单价区间，建议选择五角场/中山公园等商圈',
    bestFloor: '不建议',
    competitorCount: 0,
    avgRentIndex: 72,
  },
  {
    id: 'sports',
    name: '运动品牌',
    emoji: '🏃',
    scores: { customerMatch: 58, competition: 65, spendingPotential: 60, districtSynergy: 52 },
    recommendation: 'caution',
    reason: '大众运动品牌与商圈定位有一定落差，但高端运动（Lululemon/On等）契合度高，需走精品路线，建议搭配健身/SPA类业态组合',
    bestFloor: 'S1-5F（健身同楼层协同）',
    competitorCount: 4,
    avgRentIndex: 78,
  },
  {
    id: 'kids',
    name: '亲子体验',
    emoji: '🧸',
    scores: { customerMatch: 68, competition: 88, spendingPotential: 74, districtSynergy: 70 },
    recommendation: 'good',
    reason: '外滩亲子品牌极少（仅1家），但BFC客群以25-38岁精英为主，亲子消费力强，蓝海机会突出，建议定位高端亲子美育/创意体验',
    bestFloor: 'N-4F / S-4F（家庭区）',
    competitorCount: 1,
    avgRentIndex: 82,
  },
  {
    id: 'bookstore',
    name: '精品书店/文创',
    emoji: '📚',
    scores: { customerMatch: 72, competition: 90, spendingPotential: 60, districtSynergy: 92 },
    recommendation: 'good',
    reason: '与复星艺术中心文化IP高度协同，外滩目前无标杆文创书店，可作为商圈文化锚点，建议引入茑屋/Page One级别品牌',
    bestFloor: 'N-2F / N-3F（艺术动线沿线）',
    competitorCount: 0,
    avgRentIndex: 75,
  },
  {
    id: 'spa-wellness',
    name: '美容/SPA/健康',
    emoji: '🧖',
    scores: { customerMatch: 85, competition: 72, spendingPotential: 86, districtSynergy: 78 },
    recommendation: 'strong',
    reason: '高净值女性客群占比高，工作压力大的金融白领对高端SPA需求旺盛，BFC已有BFC FITNESS，形成健康生活方式集群',
    bestFloor: 'S1-5F（配合健身）、N-4F',
    competitorCount: 2,
    avgRentIndex: 108,
  },
]

// ── 楼层业态推荐矩阵 ──
interface FloorRecommendation {
  floor: string
  zone: 'S' | 'N'
  bestCategories: string[]
  reason: string
  currentHighlight: string
  capacityHint: string
}

const FLOOR_RECS: FloorRecommendation[] = [
  { floor: 'S-B2/B3', zone: 'S', bestCategories: ['餐饮配套', '超市精品', '汽车体验'], reason: '底层客流导入，适合目的型消费，停车楼层联动', currentHighlight: 'BFC汽车生活体验区', capacityHint: '较充裕' },
  { floor: 'S-B1', zone: 'S', bestCategories: ['精品超市', '快餐/咖啡', '美妆零售'], reason: '地铁直达，工作日高频消费，客流稳定', currentHighlight: '地下通道连接', capacityHint: '一般' },
  { floor: 'S-1F', zone: 'S', bestCategories: ['轻奢腕表', '珠宝首饰', '旗舰零售'], reason: '南区主入口，曝光最大，适合高客单价品牌', currentHighlight: '精品零售集群', capacityHint: '紧张' },
  { floor: 'S-2F', zone: 'S', bestCategories: ['潮流品牌', '设计师集合', '生活方式'], reason: '25-35岁核心客群聚集楼层，社交打卡属性强', currentHighlight: '潮流品牌区', capacityHint: '一般' },
  { floor: 'S-3F', zone: 'S', bestCategories: ['精致餐饮', '品质日料', '海鲜烤肉'], reason: '餐饮黄金楼层，客流目的性强，翻台效率高', currentHighlight: '餐饮主力楼层', capacityHint: '紧张' },
  { floor: 'S1-5F', zone: 'S', bestCategories: ['高端健身', 'SPA/美容', '运动轻奢'], reason: 'BFC FITNESS已锚定健康生活方式，同业态协同效应强', currentHighlight: 'BFC FITNESS健身会馆', capacityHint: '有机会' },
  { floor: 'N-1F', zone: 'N', bestCategories: ['精品快餐', '网红茶饮', '精致餐饮'], reason: '北区入口+外摆区，江景视野，打卡属性突出', currentHighlight: '满堂 by Bar Choice等', capacityHint: '一般' },
  { floor: 'N-2F', zone: 'N', bestCategories: ['精品书店', '文创零售', '生活美学'], reason: '连接艺术动线，文化IP协同强，适合有格调的零售', currentHighlight: '生活方式品牌', capacityHint: '较充裕' },
  { floor: 'N-3F', zone: 'N', bestCategories: ['江景餐厅', '高端日料', '精品西餐'], reason: '黄浦江视野最佳，江景溢价30-40%，租金回报高', currentHighlight: '江景餐饮集群', capacityHint: '紧张' },
  { floor: 'N-4F', zone: 'N', bestCategories: ['亲子体验', '美容SPA', '高端日料'], reason: '家庭+休闲目的层，停留时长最长，适合体验型业态', currentHighlight: '休闲体验区', capacityHint: '有机会' },
]

// ── 竞品空白图 ──
const CATEGORY_GAP_DATA = [
  { name: '精品书店/文创', bfc: 0, district: 1, gap: '蓝海', color: '#0F6E56' },
  { name: '亲子美育体验', bfc: 1, district: 2, gap: '机会', color: '#185FA5' },
  { name: '高端SPA/养生', bfc: 2, district: 4, gap: '机会', color: '#185FA5' },
  { name: '轻奢腕表珠宝', bfc: 2, district: 6, gap: '机会', color: '#185FA5' },
  { name: '精致西餐/法餐', bfc: 3, district: 8, gap: '均衡', color: '#EF9F27' },
  { name: '咖啡/茶饮', bfc: 5, district: 12, gap: '均衡', color: '#EF9F27' },
  { name: '潮流/设计师品牌', bfc: 8, district: 15, gap: '均衡', color: '#EF9F27' },
  { name: '日式料理', bfc: 6, district: 8, gap: '饱和', color: '#A32D2D' },
  { name: '快时尚', bfc: 0, district: 0, gap: '不适合', color: '#B4B2A9' },
]


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
  const [selectedCategory, setSelectedCategory] = useState<CategoryFit>(CATEGORY_FIT_DATA[0])
  const [advisorSubTab, setAdvisorSubTab] = useState<'fit' | 'floor' | 'gap'>('fit')
  const [floorZoneFilter, setFloorZoneFilter] = useState<'all' | 'S' | 'N'>('all')

  const tabs: { key: TabType; label: string; icon: typeof BarChart3 }[] = [
    { key: 'traffic', label: '客流趋势', icon: TrendingUp },
    { key: 'funnel', label: '购物路径', icon: BarChart3 },
    { key: 'segment', label: '客群画像', icon: Users },
    { key: 'store', label: '门店热度', icon: DollarSign },
    { key: 'market', label: '商圈对比', icon: MapPin },
    { key: 'advisor', label: '选址顾问', icon: Lightbulb },
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

      {activeTab === 'advisor' && (
        <div className="space-y-4">
          {/* 说明栏 */}
          <div className="bg-amber-50 rounded-xl p-3.5 text-sm text-amber-800 flex gap-2 items-start border border-amber-100">
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <span>基于 BFC 外滩商圈客群画像、现有业态分布、外滩商圈竞争格局，为品牌入驻提供参考建议。数据综合自商务委报告、赢商网及BFC招商资料。</span>
          </div>

          {/* 子Tab */}
          <div className="flex gap-2">
            {([
              { key: 'fit', label: '品类适配度' },
              { key: 'floor', label: '楼层业态推荐' },
              { key: 'gap', label: '竞品空白分析' },
            ] as { key: 'fit' | 'floor' | 'gap'; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setAdvisorSubTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                  advisorSubTab === t.key
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── 品类适配度 ── */}
          {advisorSubTab === 'fit' && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* 左：品类列表 */}
              <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">选择品类查看分析</div>
                <div className="divide-y divide-gray-50">
                  {CATEGORY_FIT_DATA.map(cat => {
                    const recColor = {
                      strong: 'text-emerald-600 bg-emerald-50',
                      good: 'text-blue-600 bg-blue-50',
                      caution: 'text-amber-600 bg-amber-50',
                      'not-fit': 'text-gray-400 bg-gray-50',
                    }[cat.recommendation]
                    const recLabel = {
                      strong: '强推',
                      good: '推荐',
                      caution: '谨慎',
                      'not-fit': '不适合',
                    }[cat.recommendation]
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-none ${
                          selectedCategory.id === cat.id ? 'bg-amber-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                        <span className="flex-1 text-sm text-gray-800">{cat.name}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${recColor}`}>{recLabel}</span>
                        {selectedCategory.id === cat.id && <ChevronRight className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 右：详细分析 */}
              <div className="lg:col-span-2 space-y-3">
                {/* 头部 */}
                <div className={`rounded-xl p-5 border ${
                  selectedCategory.recommendation === 'strong' ? 'bg-emerald-50 border-emerald-100' :
                  selectedCategory.recommendation === 'good' ? 'bg-blue-50 border-blue-100' :
                  selectedCategory.recommendation === 'caution' ? 'bg-amber-50 border-amber-100' :
                  'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{selectedCategory.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">{selectedCategory.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          selectedCategory.recommendation === 'strong' ? 'bg-emerald-100 text-emerald-700' :
                          selectedCategory.recommendation === 'good' ? 'bg-blue-100 text-blue-700' :
                          selectedCategory.recommendation === 'caution' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {{
                            strong: '✓ 强烈推荐',
                            good: '✓ 推荐进驻',
                            caution: '⚠ 谨慎评估',
                            'not-fit': '✗ 不适合',
                          }[selectedCategory.recommendation]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedCategory.reason}</p>
                    </div>
                  </div>
                </div>

                {/* 4维评分 */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">四维适配评分</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'customerMatch', label: '客群匹配度', color: '#185FA5' },
                      { key: 'competition', label: '蓝海空间（低竞争=高分）', color: '#0F6E56' },
                      { key: 'spendingPotential', label: '消费潜力', color: '#854F0B' },
                      { key: 'districtSynergy', label: '商圈协同效应', color: '#534AB7' },
                    ].map(dim => {
                      const val = selectedCategory.scores[dim.key as keyof typeof selectedCategory.scores]
                      return (
                        <div key={dim.key} className="flex items-center gap-3">
                          <span className="w-[140px] text-xs text-gray-500 flex-shrink-0">{dim.label}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${val}%`, background: dim.color }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-mono font-medium" style={{ color: dim.color }}>{val}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 指标卡片行 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">推荐楼层</div>
                    <div className="text-sm font-medium text-gray-800">{selectedCategory.bestFloor}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">外滩现有竞品</div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xl font-bold text-gray-900">{selectedCategory.competitorCount}</span>
                      <span className="text-xs text-gray-400">家</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">租金指数</div>
                    <div className={`text-xl font-bold ${
                      selectedCategory.avgRentIndex >= 110 ? 'text-amber-600' :
                      selectedCategory.avgRentIndex >= 90 ? 'text-blue-600' : 'text-emerald-600'
                    }`}>{selectedCategory.avgRentIndex}</div>
                    <div className="text-[10px] text-gray-400">均值=100</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 楼层业态推荐 ── */}
          {advisorSubTab === 'floor' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {([
                  { key: 'all', label: '全部楼层' },
                  { key: 'S', label: '南区 (S)' },
                  { key: 'N', label: '北区 (N)' },
                ] as { key: 'all' | 'S' | 'N'; label: string }[]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFloorZoneFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                      floorZoneFilter === f.key
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {FLOOR_RECS.filter(f => floorZoneFilter === 'all' || f.zone === floorZoneFilter).map(floor => (
                  <div key={floor.floor} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
                    <div className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl flex flex-col items-center justify-center ${
                      floor.zone === 'S' ? 'bg-amber-50' : 'bg-blue-50'
                    }`}>
                      <span className={`text-xs font-medium mb-0.5 ${floor.zone === 'S' ? 'text-amber-600' : 'text-blue-600'}`}>
                        {floor.zone === 'S' ? '南区' : '北区'}
                      </span>
                      <span className={`text-sm font-bold ${floor.zone === 'S' ? 'text-amber-700' : 'text-blue-700'}`}>
                        {floor.floor.replace('S-', '').replace('N-', '')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          {floor.bestCategories.map(cat => (
                            <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{cat}</span>
                          ))}
                        </div>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                          floor.capacityHint === '紧张' ? 'bg-red-50 text-red-500' :
                          floor.capacityHint === '有机会' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>{floor.capacityHint}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1.5">{floor.reason}</p>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        现有代表：{floor.currentHighlight}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 竞品空白分析 ── */}
          {advisorSubTab === 'gap' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: '蓝海机会', count: CATEGORY_GAP_DATA.filter(d => d.gap === '蓝海').length, color: '#0F6E56', bg: 'bg-emerald-50', desc: '外滩几乎空白' },
                  { label: '值得进入', count: CATEGORY_GAP_DATA.filter(d => d.gap === '机会').length, color: '#185FA5', bg: 'bg-blue-50', desc: '竞争密度适中' },
                  { label: '均衡竞争', count: CATEGORY_GAP_DATA.filter(d => d.gap === '均衡').length, color: '#EF9F27', bg: 'bg-amber-50', desc: '需差异化定位' },
                  { label: '饱和/不适合', count: CATEGORY_GAP_DATA.filter(d => d.gap === '饱和' || d.gap === '不适合').length, color: '#A32D2D', bg: 'bg-red-50', desc: '建议规避' },
                ].map(card => (
                  <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
                    <div className="text-xs text-gray-500 mb-1">{card.label}</div>
                    <div className="text-2xl font-bold" style={{ color: card.color }}>{card.count}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{card.desc}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900 text-sm">品类竞争格局 · BFC vs 外滩商圈</h3>
                  <p className="text-xs text-gray-400 mt-0.5">气泡大小代表市场规模，左侧数字为BFC现有品牌数</p>
                </div>
                <div className="p-5 space-y-3">
                  {CATEGORY_GAP_DATA.map(item => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-[120px] text-xs text-gray-600 flex-shrink-0">{item.name}</span>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 text-xs text-right text-gray-400 flex-shrink-0">{item.bfc}</span>
                        <div className="flex-1 relative h-6">
                          {/* 商圈背景条 */}
                          <div
                            className="absolute inset-y-0 rounded-sm"
                            style={{
                              left: 0,
                              width: `${Math.min((item.district / 18) * 100, 100)}%`,
                              background: `${item.color}22`,
                            }}
                          />
                          {/* BFC 条 */}
                          <div
                            className="absolute inset-y-1 rounded-sm"
                            style={{
                              left: 0,
                              width: `${Math.min((item.bfc / 18) * 100, 100)}%`,
                              background: item.color,
                              minWidth: item.bfc > 0 ? 4 : 0,
                            }}
                          />
                        </div>
                        <span className="w-5 text-xs text-gray-400 flex-shrink-0">{item.district}</span>
                      </div>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                        style={{
                          background: `${item.color}20`,
                          color: item.color,
                        }}
                      >
                        {item.gap}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-50 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 h-2.5 rounded-sm inline-block bg-gray-800 opacity-80"></span>
                      BFC现有
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 h-4 rounded-sm inline-block bg-gray-200"></span>
                      外滩商圈整体
                    </span>
                    <span className="ml-auto">左列=BFC数量，右列=商圈总数</span>
                  </div>
                </div>
              </div>

              {/* 蓝海机会卡片 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">蓝海机会详解</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      title: '精品书店/文创',
                      icon: '📚',
                      color: '#0F6E56',
                      bg: 'bg-emerald-50',
                      points: ['外滩商圈零覆盖', '复星艺术中心强IP协同', '建议引入茑屋/Page One级品牌', '可成为外滩文化新锚点'],
                    },
                    {
                      title: '亲子美育体验',
                      icon: '🎨',
                      color: '#185FA5',
                      bg: 'bg-blue-50',
                      points: ['外滩仅1家，远低于市场需求', 'BFC精英客群家庭消费力强', '建议定位高端美育/创意体验', '客单价可达500-2000元/次'],
                    },
                    {
                      title: '轻奢腕表珠宝',
                      icon: '⌚',
                      color: '#854F0B',
                      bg: 'bg-amber-50',
                      points: ['外滩仅2家，陆家嘴有20+家', '金融客群强购买力', '江景橱窗极具展示价值', '先发优势窗口期约2-3年'],
                    },
                  ].map(card => (
                    <div key={card.title} className={`${card.bg} rounded-xl p-4`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{card.icon}</span>
                        <span className="text-sm font-medium" style={{ color: card.color }}>{card.title}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {card.points.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: card.color }} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* 风险提示 */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">需规避的品类</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span><strong>快时尚（ZARA/H&amp;M类）</strong>：与商圈高端定位严重不符，客群消费力远超快时尚客单价</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span><strong>大众连锁餐饮</strong>：外滩餐饮已饱和，大众定价段空间极小，建议走精致/特色路线</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span><strong>日式料理（大众）</strong>：外滩已有6家，市场趋于饱和，高端怀石料理除外</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span><strong>大型超市/卖场</strong>：商圈配套已有精品超市，大面积卖场与整体氛围不协调</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
