import { useState } from 'react'
import {
  User,
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
  Crown,
  Baby,
  Zap,
  Gem,
} from 'lucide-react'
import type { UserProfile, Recommendation } from '../data/mockData'
import { STORES, CATEGORIES, BFC_SEGMENTS, generateRecommendations } from '../data/mockData'

const PERSONA_OPTIONS = BFC_SEGMENTS.map(s => ({
  value: s.name,
  label: s.name,
  nameEn: s.nameEn,
  description: s.description,
  icon: s.id === 'hnw-pop' ? Crown : s.id === 'urban-family' ? Baby : s.id === 'gen-z' ? Zap : Gem,
  traits: s.traits,
  color: s.color,
}))

const AGE_OPTIONS = ['18-24', '25-30', '31-38', '39-45', '46+']

const COMPANION_OPTIONS = [
  { value: 'solo', label: '独自出行', desc: '一个人来逛' },
  { value: 'partner', label: '情侣/伴侣', desc: '二人世界' },
  { value: 'family', label: '家庭亲子', desc: '带孩子/家人' },
  { value: 'friends', label: '朋友聚会', desc: '三五好友' },
  { value: 'colleague', label: '商务/同事', desc: '工作社交' },
]

const PRIORITY_OPTIONS = [
  { value: '美食体验', label: '美食体验', desc: '探索BFC米其林与精致餐饮', icon: '🍽️' },
  { value: '购物血拼', label: '购物血拼', desc: '设计师品牌与非遗珠宝', icon: '🛍️' },
  { value: '文化休闲', label: '文化休闲', desc: '非遗体验与艺术展览', icon: '🎭' },
  { value: '社交打卡', label: '社交打卡', desc: '网红点拍照与下午茶', icon: '📸' },
]

const BUDGET_OPTIONS = [
  { value: '精打细算', label: '精打细算', desc: '追求性价比，<200元' },
  { value: '适中消费', label: '适中消费', desc: '合理消费，200-1000元' },
  { value: '品质消费', label: '品质消费', desc: '注重品质，1000-5000元' },
  { value: '不设上限', label: '不设上限', desc: '高端体验，>5000元' },
]

const INTEREST_OPTIONS = [
  { name: '米其林餐饮', icon: '⭐', keywords: ['米其林', '精致', '高端'] },
  { name: '设计师品牌', icon: '✂️', keywords: ['设计师', '先锋', '高街'] },
  { name: '珠宝饰品', icon: '💎', keywords: ['珠宝', '钻石', '非遗'] },
  { name: '非遗文化', icon: '🏮', keywords: ['非遗', '传统', '手作'] },
  { name: '运动时尚', icon: '🏃', keywords: ['运动', '瑜伽', '潮流'] },
  { name: '精致咖啡', icon: '☕', keywords: ['咖啡', '精品', '极简'] },
  { name: '艺术展览', icon: '🎨', keywords: ['艺术', '展览', '文化'] },
  { name: '宠物友好', icon: '🐾', keywords: ['宠物', '萌宠', '社交'] },
  { name: '音乐现场', icon: '🎵', keywords: ['音乐', 'Live', '演出'] },
  { name: '电影娱乐', icon: '🎬', keywords: ['电影', 'IMAX', '娱乐'] },
  { name: '高茶下午茶', icon: '🫖', keywords: ['茶', '甜点', '社交'] },
  { name: '国潮文创', icon: '🏯', keywords: ['国潮', '文创', '豫园'] },
]

const PROFILE_QUESTIONS = [
  { key: 'persona' as const, label: '你是哪类BFC消费者？', icon: User, stepType: 'persona' },
  { key: 'age' as const, label: '年龄段', icon: Users, stepType: 'age' },
  { key: 'companion' as const, label: '和谁一起来？', icon: Heart, stepType: 'companion' },
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
      persona: profile.persona || '都市潮人',
      age: profile.age || '25-30',
      companion: profile.companion || 'friends',
      priority: profile.priority || '社交打卡',
      interests: profile.interests?.length ? profile.interests : ['精致咖啡', '社交打卡'],
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
          基于BFC四大客群画像，获取个性化店铺推荐
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

      {/* BFC Segment Preview (when persona selected) */}
      {profile.persona && !isResultsStep && step > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: selectedPersona?.color }}
          >
            {selectedPersona?.label.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{selectedPersona?.label}</span>
              <span className="text-xs text-gray-400">{selectedPersona?.nameEn}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{selectedPersona?.description}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedPersona?.traits.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interest selection step */}
      {isInterestStep && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              你对哪些体验感兴趣？
            </h2>
            <p className="text-sm text-gray-500 mt-1">可多选，匹配BFC店铺标签</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

                {/* Age selection */}
                {stepType === 'age' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          {selectedPersona && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: selectedPersona.color }}
              >
                {selectedPersona.label.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-gray-900">{selectedPersona.label}</span>
                <span className="text-xs text-gray-400 ml-2">{selectedPersona.nameEn}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {profile.age} · {profile.companion === 'solo' ? '独自' : profile.companion === 'partner' ? '情侣' : profile.companion === 'family' ? '家庭' : profile.companion === 'friends' ? '朋友' : '商务'} · {profile.priority} · {profile.budgetStyle}
                </p>
              </div>
            </div>
          )}

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
