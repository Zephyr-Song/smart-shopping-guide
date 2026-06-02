import { useState } from 'react'
import {
  FlaskConical,
  Play,
  CheckCircle2,
  Clock,
  FileText,
  Trophy,
  ArrowRight,
} from 'lucide-react'
import { AB_TESTS } from '../data/mockData'

export default function Experiment() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const activeTest = AB_TESTS.find(t => t.id === selectedTest)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600', label: '已完成' }
      case 'running':
        return { icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600', label: '进行中' }
      default:
        return { icon: FileText, bg: 'bg-gray-50', text: 'text-gray-600', label: '草稿' }
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary-500" />
          实验中心
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          A/B 测试框架，精准营销策略验证
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Test list */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
          {AB_TESTS.map(test => {
            const status = getStatusStyle(test.status)
            const StatusIcon = status.icon
            const isSelected = selectedTest === test.id
            return (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-300 ring-1 ring-primary-100'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {test.name}
                  </h3>
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                  {test.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>样本量 {test.sampleSize}</span>
                  <span>{test.startDate}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Test detail */}
        <div className="flex-1">
          {activeTest ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {activeTest.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTest.description}
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-5">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center text-xs font-bold">
                        A
                      </span>
                      <span className="text-sm font-medium text-blue-700">
                        对照组
                      </span>
                    </div>
                    <p className="text-sm text-blue-900">{activeTest.variantA}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-md flex items-center justify-center text-xs font-bold">
                        B
                      </span>
                      <span className="text-sm font-medium text-purple-700">
                        实验组
                      </span>
                    </div>
                    <p className="text-sm text-purple-900">{activeTest.variantB}</p>
                  </div>
                </div>
              </div>

              {activeTest.results && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    实验结果
                  </h3>

                  {/* Winner announcement */}
                  <div
                    className={`rounded-xl p-4 ${
                      activeTest.results.winner === 'B'
                        ? 'bg-green-50 border border-green-100'
                        : 'bg-blue-50 border border-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm text-gray-900">
                        方案 {activeTest.results.winner} 胜出
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      统计显著性 {(activeTest.results.significance * 100).toFixed(0)}%
                      （p &lt; 0.05），实验结果可信赖
                    </p>
                  </div>

                  {/* Metrics comparison */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">
                        转化率对比
                      </h4>
                      <div className="space-y-2">
                        {[
                          { label: 'A', value: activeTest.results.variantAConversion },
                          { label: 'B', value: activeTest.results.variantBConversion },
                        ].map(variant => {
                          const maxVal = Math.max(
                            activeTest.results!.variantAConversion,
                            activeTest.results!.variantBConversion
                          )
                          const isWinner =
                            variant.label === activeTest.results!.winner
                          return (
                            <div key={variant.label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span
                                  className={`font-medium ${
                                    isWinner ? 'text-green-600' : 'text-gray-600'
                                  }`}
                                >
                                  方案 {variant.label}
                                  {isWinner && ' ✓'}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {(variant.value * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isWinner ? 'bg-green-500' : 'bg-gray-400'
                                  }`}
                                  style={{
                                    width: `${(variant.value / maxVal) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        方案 B 转化率提升{' '}
                        {(
                          ((activeTest.results.variantBConversion -
                            activeTest.results.variantAConversion) /
                            activeTest.results.variantAConversion) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">
                        客单价对比 (¥)
                      </h4>
                      <div className="space-y-2">
                        {[
                          { label: 'A', value: activeTest.results.variantARevenue },
                          { label: 'B', value: activeTest.results.variantBRevenue },
                        ].map(variant => {
                          const maxVal = Math.max(
                            activeTest.results!.variantARevenue,
                            activeTest.results!.variantBRevenue
                          )
                          const isWinner =
                            variant.label === activeTest.results!.winner
                          return (
                            <div key={variant.label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span
                                  className={`font-medium ${
                                    isWinner ? 'text-green-600' : 'text-gray-600'
                                  }`}
                                >
                                  方案 {variant.label}
                                  {isWinner && ' ✓'}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  ¥{variant.value}
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isWinner ? 'bg-green-500' : 'bg-gray-400'
                                  }`}
                                  style={{
                                    width: `${(variant.value / maxVal) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        方案 B 客单价提升{' '}
                        {(
                          ((activeTest.results.variantBRevenue -
                            activeTest.results.variantARevenue) /
                            activeTest.results.variantARevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTest.status === 'running' && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-sm text-blue-700">
                      实验进行中
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">
                    当前已收集 {activeTest.sampleSize} 个样本数据，实验仍在进行中。
                    完成后系统将自动计算统计显著性并输出结果。
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-blue-500 mb-1">
                      <span>进度</span>
                      <span>{Math.round((activeTest.sampleSize / 3000) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(activeTest.sampleSize / 3000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Research Insight */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  研究启示
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeTest.id === 'ab1'
                    ? '实验结果表明，浏览5分钟后推送个性化推荐的转化率（24%）显著高于入店即时推送（12%）。这验证了「了解用户需求后再推荐」比「即时优惠刺激」更有效，为BFC AI智能导购系统的推荐时机设计提供了实证依据。'
                    : activeTest.id === 'ab2'
                    ? '本实验正在验证基于BFC六大客群画像（白领/艺术家/高收入家庭/游客/年轻潮人/Z世代网红）的定向推荐 vs 通用推荐的效果差异。预期客群定向推荐在白领与高收入家庭客群中效果更显著，将为AI精准营销系统选择最优推荐算法提供数据支撑。'
                    : '本实验验证营销活动AI智能推送的效果——根据客群画像匹配全年活动推送（如向高收入家庭推送亲子活动、向年轻潮人推送音乐节、向游客推送非遗体验）vs 统一推送。结果将指导BFC全年营销日历的AI自动化触达策略。'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-400 mb-1">选择一个实验</h3>
              <p className="text-sm text-gray-400">
                点击左侧实验卡片查看详情与结果
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-400 max-w-sm mx-auto text-left">
                <p className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  已完成实验可查看统计分析
                </p>
                <p className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  进行中实验可查看进度
                </p>
                <p className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  每个实验均附研究启示
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
