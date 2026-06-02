import { useState } from 'react'
import { Calendar, Crown, Flame, Sparkles, ChevronRight, MapPin, Info } from 'lucide-react'
import { MARKETING_CALENDAR } from '../data/mockData'

const LEVEL_ICONS = {
  S: <Crown className="w-3.5 h-3.5" />,
  A: <Flame className="w-3.5 h-3.5" />,
  theme: <Sparkles className="w-3.5 h-3.5" />,
}

const LEVEL_STYLES = {
  S: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24', label: 'S级' },
  A: { bg: '#fee2e2', text: '#991b1b', border: '#f87171', label: 'A类' },
  theme: { bg: '#ede9fe', text: '#5b21b6', border: '#a78bfa', label: '主题' },
}

export default function MarketingCalendar() {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary-500" />
          2026 BFC 全年营销活动日历
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          基于BFC官方全年营销规划 · 大豫园融通置顶 · 活动互动打通 · 全域流量联动
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs bg-white rounded-lg border border-gray-100 px-4 py-2.5">
        <span className="font-medium text-gray-700">活动等级：</span>
        {(['S', 'A', 'theme'] as const).map(level => (
          <span key={level} className="flex items-center gap-1">
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: LEVEL_STYLES[level].bg, color: LEVEL_STYLES[level].text }}
            >
              {LEVEL_ICONS[level]}
              {LEVEL_STYLES[level].label}
            </span>
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {MARKETING_CALENDAR.map((monthData) => {
            const isExpanded = expandedMonth === monthData.month
            const eventCount = monthData.events.length
            const sCount = monthData.events.filter(e => e.level === 'S').length

            return (
              <div key={monthData.month} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className="absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                  style={{ background: monthData.color }}
                />

                <div
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all cursor-pointer hover:shadow-md"
                  onClick={() => setExpandedMonth(isExpanded ? null : monthData.month)}
                >
                  {/* Month header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 px-2.5 min-w-[2.5rem]"
                        style={{ background: monthData.color }}
                      >
                        {monthData.monthName}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {monthData.theme}
                          {sCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-200">
                              {sCount}个S级
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {eventCount} 个活动 · 点击展开详情
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded events */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="p-4 space-y-3">
                        {monthData.events.map((event, idx) => {
                          const style = LEVEL_STYLES[event.level]
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-gray-50"
                              style={{ borderColor: style.border, background: `${style.bg}40` }}
                            >
                              <div
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: style.bg, color: style.text }}
                              >
                                {LEVEL_ICONS[event.level]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-gray-900">
                                    {event.name}
                                  </span>
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                    style={{ background: style.bg, color: style.text }}
                                  >
                                    {style.label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI 场景落地方法论 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-500" />
          AI 场景落地方法论
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="text-xs font-semibold text-amber-800 mb-1">场景闭环</div>
            <p className="text-xs text-amber-700">
              有明确的输入源（全年活动Excel/截图）与输出交付物（简报/PDF）
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs font-semibold text-blue-800 mb-1">规则清晰</div>
            <p className="text-xs text-blue-700">
              业务流程虽繁但内部逻辑具备可推导性
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs font-semibold text-green-800 mb-1">= 启动AI自动化</div>
            <p className="text-xs text-green-700">
              AI智能导购可根据营销日历自动推送活动信息
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
