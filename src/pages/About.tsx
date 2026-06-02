import { GraduationCap, Building2, BookOpen, Target, Users, Calendar, ExternalLink } from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-500" />
          关于项目
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          西浦第七届校外导师科研项目 #26054
        </p>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">项目信息</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Target, label: '项目编号', value: '26054' },
            { icon: Building2, label: '导师单位', value: '上海复星外滩商业有限公司' },
            { icon: Users, label: '导师', value: '张丹琦 Stephen' },
            { icon: Calendar, label: '项目周期', value: '6 个月' },
            { icon: BookOpen, label: '项目类型', value: '科研项目' },
            { icon: Building2, label: '线下地点', value: 'BFC 外滩金融中心' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-900 font-medium ml-auto">{item.value}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Research Topic */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <h2 className="font-bold text-lg mb-2">研究课题</h2>
        <p className="text-white/90 leading-relaxed">
          AI 智能导购系统对线下商业综合体消费者购物体验与购买决策的影响
        </p>
        <p className="text-white/60 text-sm mt-2 italic">
          The Impact of AI-Powered Smart Shopping Guide Systems on Consumer
          Shopping Experience and Purchase Decisions in Offline Commercial
          Complexes
        </p>
      </div>

      {/* Background */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-3">研究背景</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          线下商业综合体面临线上分流、传统营销低效等运营困境，AI
          驱动的精准营销通过用户画像与个性化触达，成为实体商业激活客流、提升转化的核心抓手。本项目以国内典型商业综合体为研究对象，采用实地实验与数据分析方法，探究
          AI 精准营销在不同场景下对客流规模、消费转化与客群复购的影响机制，识别关键影响因素，为商业综合体构建
          AI 数字化营销体系、优化运营策略提供实证依据与实践参考。
        </p>
      </div>

      {/* Student Tasks */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-3">学生任务</h2>
        <div className="space-y-3">
          {[
            { num: 1, text: '梳理 AI 精准营销、线下商业综合体运营相关理论，完成文献综述与研究框架搭建' },
            { num: 2, text: '设计 AI 精准营销场景实验方案，开展线下调研与数据采集（客流、转化、客群行为等）' },
            { num: 3, text: '运用数据分析工具处理实验数据，实证检验 AI 营销对客流与转化的影响机制' },
            { num: 4, text: '撰写研究报告，提炼可落地的商业运营优化策略，完成项目成果汇报' },
          ].map(task => (
            <div key={task.num} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {task.num}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pt-1">
                {task.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Outcomes */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-3">预期成果</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { emoji: '📋', title: '研究报告', desc: '明确 AI 精准营销对客流提升与消费转化的影响规律' },
            { emoji: '🛠️', title: '优化方案', desc: '可落地的 AI 数字化营销优化方案' },
            { emoji: '📄', title: '学术论文', desc: '可用于学术交流或行业分享' },
            { emoji: '🎯', title: '能力提升', desc: '实证研究方法、数据分析与商业运营逻辑' },
          ].map(item => (
            <div
              key={item.title}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="text-lg mb-1">{item.emoji}</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-3">技术栈</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'React 19',
            'TypeScript',
            'Vite 6',
            'TailwindCSS 4',
            'Chart.js',
            'React Router',
            'Lucide Icons',
          ].map(tech => (
            <span
              key={tech}
              className="text-xs bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/Zephyr-Song/smart-shopping-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition no-underline"
        >
          <ExternalLink className="w-4 h-4" />
          GitHub 仓库
        </a>
      </div>
    </div>
  )
}
