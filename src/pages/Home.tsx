import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Map,
  BarChart3,
  FlaskConical,
  ArrowRight,
  Users,
  Store,
  Calendar,
  Building2,
  Gem,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ShoppingBag,
    title: '智能导购',
    desc: '基于BFC四大客群画像的AI个性化推荐，提升购物体验与决策效率',
    path: '/guide',
    color: 'bg-primary-500',
    lightColor: 'bg-primary-50',
    textColor: 'text-primary-600',
  },
  {
    icon: Map,
    title: '商场地图',
    desc: 'BFC南北双区交互式平面图，实时客流热力图，7层真实业态',
    path: '/map',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: Calendar,
    title: '营销日历',
    desc: '2026全年12个月BFC营销活动规划，S/A/主题活动分级展示',
    path: '/calendar',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: BarChart3,
    title: '商圈分析',
    desc: 'BFC四大客群客流趋势、转化漏斗、客群画像、营销ROI全景数据',
    path: '/analytics',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    icon: FlaskConical,
    title: '实验中心',
    desc: 'A/B测试框架，客群定向推荐策略验证，数据驱动决策',
    path: '/experiment',
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50',
    textColor: 'text-rose-600',
  },
]

const STATS = [
  { icon: Building2, value: '96,000m²', label: '总商业面积', color: 'text-primary-500' },
  { icon: Store, value: '22', label: '入驻品牌', color: 'text-emerald-500' },
  { icon: Users, value: '14,000+', label: '日客流量', color: 'text-amber-500' },
  { icon: Gem, value: '¥1,800', label: '平均客单价', color: 'text-violet-500' },
]

const BFC_SEGMENTS_PREVIEW = [
  {
    name: '高净值人群',
    nameEn: 'High Net-Worth Population',
    percentage: 28,
    avgSpend: '¥2,800',
    color: '#c9a96e',
    desc: '周边写字楼白领、金融商务人士',
  },
  {
    name: '都市家庭',
    nameEn: 'Urban Family',
    percentage: 26,
    avgSpend: '¥1,200',
    color: '#e07a5f',
    desc: '注重家庭成员生活质量',
  },
  {
    name: '都市潮人',
    nameEn: 'Metropolitan Strength',
    percentage: 30,
    avgSpend: '¥580',
    color: '#81b29a',
    desc: '年轻潮流GEN Z，个性时尚',
  },
  {
    name: '高净值个人',
    nameEn: 'HNI',
    percentage: 16,
    avgSpend: '¥5,200',
    color: '#3d405b',
    desc: 'VIP专属沙龙，尊享服务',
  },
]

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-8 py-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            西浦校外导师科研项目 #26054
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            BFC AI 智能导购系统
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
            基于 BFC 外滩金融中心真实商业数据，探究 AI 精准营销对线下商业综合体消费者购物体验与购买决策的影响
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition no-underline text-sm"
            >
              开始导购体验 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/25 transition no-underline text-sm border border-white/20"
            >
              查看商场地图
            </Link>
          </div>
        </div>
      </div>

      {/* BFC Core Segments */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          BFC 四大核心客群
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BFC_SEGMENTS_PREVIEW.map((seg, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3"
                style={{ background: seg.color }}
              >
                {seg.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{seg.name}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{seg.nameEn}</p>
              <p className="text-xs text-gray-500 mt-2">{seg.desc}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">占比 {seg.percentage}%</span>
                <span className="text-xs font-semibold text-gray-700">客单 {seg.avgSpend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`p-2.5 rounded-lg bg-gray-50 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">核心功能模块</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feature => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all no-underline"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-xl ${feature.lightColor} ${feature.textColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* BFC Zone Overview */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-500" />
            南区 South Retail
          </h3>
          <p className="text-sm text-gray-500 mb-3">建筑面积 60,000m²</p>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L4</span><span className="text-gray-400">精致餐饮 Fine Dining</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L3</span><span className="text-gray-400">设计师精品·艺术空间</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L2</span><span className="text-gray-400">运动时尚·设计师珠宝孵化平台</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L1</span><span className="text-gray-400">国际潮流·生活方式</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>B1</span><span className="text-gray-400">休闲餐饮·东方非遗珠宝区</span></div>
            <div className="flex justify-between py-1"><span>B2</span><span className="text-gray-400">东方美学文化区</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            北区 North Retail
          </h3>
          <p className="text-sm text-gray-500 mb-3">建筑面积 36,000m² · 车位 1,524</p>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L3</span><span className="text-gray-400">米其林星级餐厅</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L2</span><span className="text-gray-400">高茶下午茶</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>L1</span><span className="text-gray-400">旗舰店精品店</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50"><span>B1</span><span className="text-gray-400">博纳影城·宠物友好</span></div>
            <div className="flex justify-between py-1"><span>B2</span><span className="text-gray-400">文艺空间·美食街·Livehouse</span></div>
          </div>
        </div>
      </div>

      {/* Research Context */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">研究背景</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          线下商业综合体面临线上分流、传统营销低效等运营困境，AI
          驱动的精准营销通过用户画像与个性化触达，成为实体商业激活客流、提升转化的核心抓手。本项目以
          BFC
          外滩金融中心等典型商业综合体为研究对象，采用实地实验与数据分析方法，探究
          AI
          精准营销在不同场景下对客流规模、消费转化与客群复购的影响机制。
        </p>
        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          {['文献综述与框架搭建', '线下调研与数据采集', '数据实证分析', '研究报告与优化方案'].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                {i + 1}
              </div>
              <span className="text-xs text-gray-600">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
