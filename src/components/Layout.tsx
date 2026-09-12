import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import AgentAssistant from './agent/AgentAssistant'
import BFCLogo from './BFCLogo'
import {
  ShoppingBag,
  Map,
  BarChart3,
  Info,
  Menu,
  X,
  Calendar,
  Store,
  Compass,
  Layers,
  Ticket,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Compass },
  { path: '/guide', label: '智能导购', icon: ShoppingBag },
  { path: '/map', label: '商场地图', icon: Map },
  { path: '/calendar', label: '营销日历', icon: Calendar },
  { path: '/brands', label: '品牌探索', icon: Store },
  { path: '/offers', label: '限时优惠', icon: Ticket },
  { path: '/analytics', label: '商圈分析', icon: BarChart3 },
  { path: '/architecture', label: '系统架构', icon: Layers },
  { path: '/about', label: '关于项目', icon: Info },
]

export default function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-bfc-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-bfc-gold-200/60 bg-bfc-cream/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <BFCLogo size={32} showText={false} variant="gold" />
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold text-bfc-charcoal tracking-tight">
                  BFC 智能导购
                </span>
                <span className="text-[10px] text-bfc-warm-gray tracking-widest mt-0.5">
                  AI SHOPPING GUIDE
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium no-underline transition-all ${
                      active
                        ? 'text-bfc-gold-700 bg-bfc-gold-100'
                        : 'text-bfc-warm-gray hover:text-bfc-charcoal hover:bg-bfc-gold-100/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-bfc-gold-100 border-none bg-transparent cursor-pointer text-bfc-charcoal"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-bfc-gold-200/60 bg-bfc-cream/95 backdrop-blur-xl">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium no-underline border-b border-bfc-gold-200/40 ${
                    active
                      ? 'bg-bfc-gold-100 text-bfc-gold-800'
                      : 'text-bfc-charcoal hover:bg-bfc-gold-100/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-bfc-gold-200/60 bg-bfc-cream/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BFCLogo size={24} showText={false} variant="gold" />
              <div>
                <div className="text-sm font-semibold text-bfc-charcoal">BFC 智能导购</div>
                <div className="text-xs text-bfc-warm-gray">BFC 外滩金融中心 · 上海复星外滩商业有限公司</div>
              </div>
            </div>
            <p className="text-xs text-bfc-warm-gray/80">
              基于真实商业数据的 AI 精准营销研究
            </p>
          </div>
        </div>
      </footer>

      <AgentAssistant />
    </div>
  )
}
