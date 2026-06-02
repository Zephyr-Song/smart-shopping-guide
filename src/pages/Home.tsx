import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Map,
  BarChart3,
  FlaskConical,
  ArrowRight,
  TrendingUp,
  Users,
  Store,
  Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ShoppingBag,
    title: '智能导购',
    desc: '基于消费者画像的 AI 个性化推荐，提升购物体验与决策效率',
    path: '/guide',
    color: 'bg-primary-500',
    lightColor: 'bg-primary-50',
    textColor: 'text-primary-600',
  },
  {
    icon: Map,
    title: '商场导航',
    desc: '交互式商场地图，实时客流热力图，智能路线规划',
    path: '/map',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: BarChart3,
    title: '商圈分析',
    desc: '客流趋势、转化漏斗、客群画像、营销 ROI 全景数据看板',
    path: '/analytics',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: FlaskConical,
    title: '实验中心',
    desc: 'A/B 测试框架，精准营销策略验证，数据驱动决策',
    path: '/experiment',
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50',
    textColor: 'text-rose-600',
  },
]

const STATS = [
  { icon: Store, value: '12', label: '入驻品牌', color: 'text-primary-500' },
  { icon: Users, value: '2,400+', label: '日客流量', color: 'text-emerald-500' },
  { icon: TrendingUp, value: '23%', label: 'AI 提升转化', color: 'text-amber-500' },
  { icon: Zap, value: '96%', label: '推荐准确率', color: 'text-rose-500' },
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
            AI 智能导购系统
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
            探究 AI 精准营销对线下商业综合体消费者购物体验与购买决策的影响，为实体商业数字化转型提供实证依据
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition no-underline text-sm"
            >
              开始导购体验 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/25 transition no-underline text-sm border border-white/20"
            >
              查看数据分析
            </Link>
          </div>
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
        <div className="grid sm:grid-cols-2 gap-4">
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
