import { useState } from 'react'
import {
  Users,
  Target,
  Heart,
  Wallet,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Baby,
  Briefcase,
  Palette,
  Globe,
  Flame,
  Smartphone,
  HelpCircle,
} from 'lucide-react'
import type { UserProfile, Recommendation } from '../data/mockData'
import { STORES, CATEGORIES, BFC_SEGMENTS, generateRecommendations } from '../data/mockData'

const AGE_OPTIONS = ['18-24', '24-30', '30-38', '38+']

const PERSONA_OPTIONS = [
  ...BFC_SEGMENTS.map(s => ({
    value: s.name,
    label: s.name,
    nameEn: s.nameEn,
    description: s.description,
    icon: s.id === 'white-collar' ? Briefcase : s.id === 'artist-designer' ? Palette : s.id === 'high-income-family' ? Baby : s.id === 'tourists' ? Globe : s.id === 'young-hipster' ? Flame : Smartphone,
    traits: s.traits,
    color: s.color,
  })),
  {
    value: '其他',
    label: '其他',
    nameEn: 'Other',
    description: '不属于以上类别，我有自己的消费风格',
    icon: HelpCircle,
    traits: ['自由消费', '多元兴趣', '不设限'],
    color: '#8b8fa3',
  },
]

const COMPANION_OPTIONS = [
  { value: 'solo', label: '独自出行', desc: '一个人来逛' },
  { value: 'partner', label: '情侣/伴侣', desc: '二人世界' },
  { value: 'family', label: '家庭亲子', desc: '带孩子/家人' },
  { value: 'friends', label: '朋友聚会', desc: '三五好友' },
  { value: 'colleague', label: '商务/同事', desc: '工作社交' },
]

// 优先级 = 今日体验目的（体验维度，不与品类重叠）
const PRIORITY_OPTIONS = [
  { value: '品质美食', label: '品质美食', desc: '探索BFC精选餐饮', icon: '🍽️' },
  { value: '潮流购物', label: '潮流购物', desc: '国际精品与买手店', icon: '🛍️' },
  { value: '休闲娱乐', label: '休闲娱乐', desc: '养生健身放松', icon: '♨️' },
  { value: '社交打卡', label: '社交打卡', desc: '网红拍照与体验分享', icon: '📸' },
]

const BUDGET_OPTIONS = [
  { value: '精打细算', label: '精打细算', desc: '追求性价比，<200元' },
  { value: '适中消费', label: '适中消费', desc: '合理消费，200-1000元' },
  { value: '品质消费', label: '品质消费', desc: '注重品质，1000-5000元' },
  { value: '不设上限', label: '不设上限', desc: '高端体验，>5000元' },
]

// 兴趣标签 = 品类偏好（具体的品类，与优先级是不同维度）
const INTEREST_OPTIONS = [
  { name: '精致餐饮', icon: '⭐', keywords: ['精致', '米其林', '高端'] },
  { name: '快餐轻食', icon: '🥗', keywords: ['轻食', '快餐', '简餐'] },
  { name: '咖啡茶饮', icon: '☕', keywords: ['咖啡', '茶饮', '精品'] },
  { name: '国际精品', icon: '👜', keywords: ['奢侈', '设计师', '高定'] },
  { name: '潮流买手', icon: '🎯', keywords: ['买手', '先锋', '潮牌'] },
  { name: '运动健身', icon: '🏋️', keywords: ['运动', '健身', '瑜伽'] },
  { name: '茶馆SPA', icon: '🧖', keywords: ['SPA', '养生', '茶馆'] },
  { name: '宠物服务', icon: '🐾', keywords: ['宠物', '萌宠', '互动'] },
]

const PROFILE_QUESTIONS = [
  { key: 'age' as const, label: '年龄段', icon: Users, stepType: 'age' },
  { key: 'persona' as const, label: '你是哪类BFC消费者？', icon: Heart, stepType: 'persona' },
  { key: 'companion' as const, label: '和谁一起来？', icon: Users, stepType: 'companion' },
  { key: 'priority' as const, label: '今天最想体验什么？', icon: Target, stepType: 'priority' },
  { key: 'budgetStyle' as const, label: '消费预算风格', icon: Wallet, stepType: 'budget' },
]

export default function SmartGuide() {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    interests: [],
  })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  const handleSelect = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }))
    if (step < PROFILE_QUESTIONS.length) {
      setStep(prev => prev + 1)
    }
  }

  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const interests = prev.interests || []
      return {
        ...prev,
        interests: interests.includes(interest)
          ? interests.filter(i => i !== interest)
          : [...interests, interest],
      }
    })
  }

  const generateResults = () => {
    const fullProfile: UserProfile = {
      gender: '',
      age: profile.age || '24-30',
      persona: profile.persona || '其他',
      companion: profile.companion || 'friends',
      priority: profile.priority || '社交打卡',
      interests: profile.interests?.length ? profile.interests : ['精致餐饮', '咖啡茶饮'],
      budgetStyle: profile.budgetStyle || '适中消费',
    }
    const recs = generateRecommendations(fullProfile)
    setRecommendations(recs)
    setStep(PROFILE_QUESTIONS.length + 1)
  }

  const reset = () => {
    setStep(0)
    setProfile({ interests: [] })
    setRecommendations([])
  }

  const isInterestStep = step === PROFILE_QUESTIONS.length
  const isResultsStep = step > PROFILE_QUESTIONS.length

  // Get matched persona info
  const selectedPersona = PERSONA_OPTIONS.find(p => p.value === profile.persona)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          AI 智能导购
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          基于BFC六大客群画像，获取个性化店铺推荐
        </p>
      </div>

      {/* Progress bar */}
      {!isResultsStep && (
        <div className="flex items-center gap-1 justify-center">
          {Array.from({ length: PROFILE_QUESTIONS.length + 1 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? 'bg-primary-500' : 'bg-gray-200'
              }`}
              style={{ width: i <= step ? '40px' : '20px' }}
            />
          ))}
        </div>
      )}

      {/* Selected context preview - removed per user request */}

      {/* Interest selection step */}
      {isInterestStep && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              你对哪些品类感兴趣？
            </h2>
            <p className="text-sm text-gray-500 mt-1">可多选，匹配BFC店铺品类标签</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {INTEREST_OPTIONS.map(interest => {
              const selected = profile.interests?.includes(interest.name)
              return (
                <button
                  key={interest.name}
                  onClick={() => toggleInterest(interest.name)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all cursor-pointer ${
                    selected
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base">{interest.icon}</span>
                  <span className="font-medium text-xs">{interest.name}</span>
                </button>
              )
            })}
          </div>
          <div className="flex justify-center">
            <button
              onClick={generateResults}
              className="flex items-center gap-2 bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition cursor-pointer border-none text-sm"
            >
              <Sparkles className="w-4 h-4" />
              生成BFC专属推荐
            </button>
          </div>
        </div>
      )}

      {/* Profile questions */}
      {!isInterestStep && !isResultsStep && step < PROFILE_QUESTIONS.length && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          {(() => {
            const q = PROFILE_QUESTIONS[step]
            const Icon = q.icon
            const stepType = q.stepType

            return (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-500 mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{q.label}</h2>
                </div>

                {/* Age selection */}
                {stepType === 'age' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AGE_OPTIONS.map(opt => {
                      const selected = profile.age === opt
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelect(q.key, opt)}
                          className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Persona selection */}
                {stepType === 'persona' && (
                  <div className="grid gap-3">
                    {PERSONA_OPTIONS.map(opt => {
                      const PersonaIcon = opt.icon
                      const selected = profile.persona === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(q.key, opt.value)}
                          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-50 border-primary-300'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                            style={{ background: opt.color }}
                          >
                            <PersonaIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${selected ? 'text-primary-700' : 'text-gray-900'}`}>
                                {opt.label}
                              </span>
                              <span className="text-xs text-gray-400">{opt.nameEn}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {opt.traits.map(t => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-2 ${selected ? 'text-primary-500' : 'text-gray-300'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Companion selection */}
                {stepType === 'companion' && (
                  <div className="grid gap-2">
                    {COMPANION_OPTIONS.map(opt => {
                      const selected = profile.companion === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(q.key, opt.value)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${selected ? 'text-primary-500' : 'text-gray-300'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Priority selection */}
                {stepType === 'priority' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map(opt => {
                      const selected = profile.priority === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(q.key, opt.value)}
                          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-50 border-primary-300'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                          <div>
                            <span className={`font-semibold text-sm ${selected ? 'text-primary-700' : 'text-gray-900'}`}>
                              {opt.label}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Budget selection */}
                {stepType === 'budget' && (
                  <div className="grid gap-2">
                    {BUDGET_OPTIONS.map(opt => {
                      const selected = profile.budgetStyle === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(q.key, opt.value)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${selected ? 'text-primary-500' : 'text-gray-300'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Results */}
      {isResultsStep && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              BFC 为你推荐
            </h2>
            <button
              onClick={reset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 transition cursor-pointer bg-transparent border-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新填写
            </button>
          </div>

          {/* Profile summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            {selectedPersona && (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: selectedPersona.color }}
              >
                {selectedPersona.label.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{selectedPersona?.label}</span>
                <span className="text-xs text-gray-400">{selectedPersona?.nameEn}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {profile.age} · {profile.companion === 'solo' ? '独自' : profile.companion === 'partner' ? '情侣' : profile.companion === 'family' ? '家庭' : profile.companion === 'friends' ? '朋友' : '商务'} · {profile.priority} · {profile.budgetStyle}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => {
              const store = STORES.find(s => s.id === rec.storeId)!
              const cat = CATEGORIES.find(c => c.name === store.category)
              return (
                <div
                  key={rec.storeId}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-lg font-bold text-primary-500">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: cat ? `${cat.color}15` : '#f3f4f6',
                            color: cat?.color || '#6b7280',
                          }}
                        >
                          {cat?.icon} {store.category}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {store.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{store.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{store.floor}
                        </span>
                        <span>人均 ¥{store.avgPrice.toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          匹配度 {(rec.score * 10).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-1 rounded-lg">
                        💡 {rec.reason}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-primary-50 rounded-xl p-4 text-sm text-primary-700">
            <strong>推荐说明：</strong>基于你选择的BFC客群画像（{profile.persona}），
            系统结合消费优先级（{profile.priority}）、预算风格（{profile.budgetStyle}）及兴趣标签，
            通过多维度匹配算法生成个性化推荐。实际研究中，推荐引擎将接入用户行为数据与协同过滤模型。
          </div>
        </div>
      )}
    </div>
  )
}
