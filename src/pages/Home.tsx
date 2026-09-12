import { Link } from 'react-router-dom'
import BFCLogo from '../components/BFCLogo'
import {
  Map,
  BarChart3,
  ArrowRight,
  Users,
  Store,
  Calendar,
  Building2,
  Gem,
  Search,
  Compass,
  Ticket,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Compass,
    title: '智能导购',
    desc: '基于BFC六大客群画像，AI 个性化推荐店铺与路线',
    path: '/guide',
  },
  {
    icon: Map,
    title: '商场地图',
    desc: '南北双区交互式平面图，7层真实业态与客流热力',
    path: '/map',
  },
  {
    icon: Calendar,
    title: '营销日历',
    desc: '2026全年12个月BFC营销活动规划与分级展示',
    path: '/calendar',
  },
  {
    icon: Search,
    title: '品牌探索',
    desc: '42个入驻品牌全览，按品类/楼层/区域多维筛选',
    path: '/brands',
  },
  {
    icon: BarChart3,
    title: '商圈分析',
    desc: '客流趋势、转化漏斗、客群画像、营销ROI全景数据',
    path: '/analytics',
  },
  {
    icon: Ticket,
    title: '限时优惠',
    desc: '当前可享折扣 / 满减 / 赠礼，品牌活动一站速览',
    path: '/offers',
  },
]

const STATS = [
  { icon: Building2, value: '96,000m²', label: '总商业面积' },
  { icon: Store, value: '42', label: '入驻品牌' },
  { icon: Users, value: '14,000+', label: '日客流量' },
  { icon: Gem, value: '¥1,800', label: '平均客单价' },
]

const BFC_SEGMENTS_PREVIEW = [
  { name: '白领', nameEn: 'White Collar', percentage: 18, avgSpend: '¥2,600', color: '#c9a96e' },
  { name: '艺术家/设计师', nameEn: 'Artist / Designer', percentage: 10, avgSpend: '¥1,800', color: '#b8a97a' },
  { name: '高收入家庭', nameEn: 'High-Income Families', percentage: 26, avgSpend: '¥1,200', color: '#e07a5f' },
  { name: '本国外国游客', nameEn: 'Domestic or Foreign Tourists', percentage: 12, avgSpend: '¥1,500', color: '#6d8fa0' },
  { name: '年轻潮人', nameEn: 'Young Hipsters', percentage: 18, avgSpend: '¥580', color: '#81b29a' },
  { name: 'Z世代/网红', nameEn: 'GEN Z / Influencers', percentage: 16, avgSpend: '¥450', color: '#3d405b' },
]

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero / Welcome Card */}
      <section className="relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[420px] bg-gradient-to-b from-bfc-gold-100/50 via-transparent to-transparent -z-10 blur-3xl opacity-60" />

        <div className="max-w-xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-bfc-gold-200/60 rounded-[2rem] p-8 sm:p-10 shadow-bfc-lift text-center">
            <div className="flex justify-center mb-6">
              <BFCLogo size={52} variant="gold" />
            </div>

            <h1 className="font-display text-[28px] sm:text-[34px] font-semibold text-bfc-charcoal tracking-wide mb-2">
              智能导购助手
            </h1>
            <p className="text-bfc-warm-gray text-sm sm:text-[15px] mb-8 leading-relaxed">
              基于 BFC 外滩金融中心真实商业数据，为你提供个性化店铺推荐、路线规划与商场资讯。
            </p>

            <Link
              to="/guide"
              className="inline-flex items-center justify-center gap-2 bg-bfc-gold text-white font-medium px-8 py-3.5 rounded-xl hover:bg-bfc-gold-600 transition shadow-bfc no-underline"
            >
              <Search className="w-4 h-4" />
              开始导购体验
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white/70 border border-bfc-gold-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-bfc card-hover"
            >
              <div className="p-2.5 rounded-xl bg-bfc-gold-100 text-bfc-gold-700">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-bfc-charcoal">{stat.value}</div>
                <div className="text-xs text-bfc-warm-gray">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="font-display text-lg font-semibold text-bfc-charcoal mb-5">核心功能模块</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feature => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group block bg-white/70 border border-bfc-gold-200/50 rounded-2xl p-6 shadow-bfc card-hover no-underline"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-bfc-gold-100 text-bfc-gold-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-bfc-charcoal group-hover:text-bfc-gold-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-bfc-warm-gray mt-1 leading-relaxed">{feature.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-bfc-gold-300 group-hover:text-bfc-gold-600 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Segments */}
      <section>
        <h2 className="font-display text-lg font-semibold text-bfc-charcoal mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-bfc-gold" />
          BFC 六大核心客群
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {BFC_SEGMENTS_PREVIEW.map((seg, i) => (
            <div
              key={i}
              className="bg-white/70 border border-bfc-gold-200/50 rounded-2xl p-5 shadow-bfc card-hover"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3"
                style={{ background: seg.color }}
              >
                {seg.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-bfc-charcoal text-sm">{seg.name}</h3>
              <p className="text-[10px] text-bfc-warm-gray mt-0.5">{seg.nameEn}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-bfc-gold-200/40">
                <span className="text-xs text-bfc-warm-gray">占比 {seg.percentage}%</span>
                <span className="text-xs font-semibold text-bfc-charcoal">客单 {seg.avgSpend}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Zone Overview */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white/70 border border-bfc-gold-200/50 rounded-2xl p-6 shadow-bfc card-hover">
          <h3 className="font-semibold text-bfc-charcoal mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-bfc-gold" />
            南区 South Retail
          </h3>
          <p className="text-sm text-bfc-warm-gray mb-3">建筑面积 60,000m²</p>
          <div className="space-y-2 text-xs text-bfc-charcoal/80">
            {[
              ['4F', '品质中餐聚集区（7家）'],
              ['3F', '时尚餐饮·生活方式'],
              ['2F', '潮流品牌·运动时尚'],
              ['1F', '国际精品最密集（19家）'],
              ['B1', '快餐·美容·珠宝·健身'],
              ['B2/B3/S1', '数码·宠物·汽车·健身'],
            ].map(([f, d]) => (
              <div key={f} className="flex justify-between py-1 border-b border-bfc-gold-200/30 last:border-0">
                <span>{f}</span>
                <span className="text-bfc-warm-gray">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/70 border border-bfc-gold-200/50 rounded-2xl p-6 shadow-bfc card-hover">
          <h3 className="font-semibold text-bfc-charcoal mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-bfc-gold" />
            北区 North Retail
          </h3>
          <p className="text-sm text-bfc-warm-gray mb-3">建筑面积 36,000m² · 车位 1,524</p>
          <div className="space-y-2 text-xs text-bfc-charcoal/80">
            {[
              ['N3', '精致餐饮集群'],
              ['N2', '茶馆SPA·网红餐饮'],
              ['N1', '潮流·买手'],
              ['B1', '餐饮·宠物·便利'],
              ['B2', '餐饮·文创'],
            ].map(([f, d]) => (
              <div key={f} className="flex justify-between py-1 border-b border-bfc-gold-200/30 last:border-0">
                <span>{f}</span>
                <span className="text-bfc-warm-gray">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Context */}
      <section className="bg-white/70 border border-bfc-gold-200/50 rounded-2xl p-6 shadow-bfc card-hover">
        <h2 className="font-display text-lg font-semibold text-bfc-charcoal mb-3">研究背景</h2>
        <p className="text-sm text-bfc-warm-gray leading-relaxed">
          线下商业综合体面临线上分流、传统营销低效等运营困境，AI 驱动的精准营销通过用户画像与个性化触达，成为实体商业激活客流、提升转化的核心抓手。本项目以 BFC 外滩金融中心等典型商业综合体为研究对象，采用实地实验与数据分析方法，探究 AI 精准营销在不同场景下对客流规模、消费转化与客群复购的影响机制。
        </p>
        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          {['文献综述与框架搭建', '线下调研与数据采集', '数据实证分析', '研究报告与优化方案'].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-bfc-gold text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                {i + 1}
              </div>
              <span className="text-xs text-bfc-charcoal/80">{step}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
