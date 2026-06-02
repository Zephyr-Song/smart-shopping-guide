import { useState } from 'react'
import {
  User,
  Heart,
  Wallet,
  Target,
  ShoppingBag,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'
import type { UserProfile, Recommendation } from '../data/mockData'
import {
  STORES,
  CATEGORIES,
  generateRecommendations,
} from '../data/mockData'

const INTEREST_OPTIONS = CATEGORIES.map(c => c.name)

const PROFILE_QUESTIONS = [
  {
    key: 'age' as const,
    label: '年龄段',
    icon: User,
    options: ['18-25', '26-35', '36-45', '46+'],
  },
  {
    key: 'gender' as const,
    label: '性别',
    icon: Heart,
    options: ['男', '女', '其他'],
  },
  {
    key: 'budget' as const,
    label: '消费预算',
    icon: Wallet,
    options: [
      { value: 'low', label: '实惠为主（<200）' },
      { value: 'medium', label: '适中消费（200-800）' },
      { value: 'high', label: '品质消费（>800）' },
      { value: 'any', label: '看心情' },
    ],
  },
  {
    key: 'visitPurpose' as const,
    label: '今天来商场的主要目的',
    icon: Target,
    options: [
      { value: 'shopping', label: '逛街购物' },
      { value: 'dining', label: '吃饭聚餐' },
      { value: 'social', label: '社交休闲' },
      { value: 'explore', label: '随便逛逛' },
    ],
  },
  {
    key: 'shoppingStyle' as const,
    label: '购物风格',
    icon: ShoppingBag,
    options: [
      { value: 'planned', label: '目标明确，直奔主题' },
      { value: 'casual', label: '随性逛逛，看到喜欢的再说' },
      { value: 'impulse', label: '容易被种草，冲动消费' },
    ],
  },
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
      age: profile.age || '26-35',
      gender: profile.gender || '其他',
      budget: profile.budget || 'medium',
      interests: profile.interests?.length ? profile.interests : ['时尚服饰'],
      visitPurpose: profile.visitPurpose || 'explore',
      shoppingStyle: profile.shoppingStyle || 'casual',
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

  // Interest selection step
  const isInterestStep = step === PROFILE_QUESTIONS.length

  // Results step
  const isResultsStep = step > PROFILE_QUESTIONS.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          AI 智能导购
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          回答几个问题，获取个性化店铺推荐
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

      {/* Interest selection step */}
      {isInterestStep && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              你对哪些品类感兴趣？
            </h2>
            <p className="text-sm text-gray-500 mt-1">可多选</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {INTEREST_OPTIONS.map(interest => {
              const selected = profile.interests?.includes(interest)
              const cat = CATEGORIES.find(c => c.name === interest)
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                    selected
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{cat?.icon}</span>
                  {interest}
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
              生成推荐
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
            return (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-500 mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {q.label}
                  </h2>
                </div>
                <div className="grid gap-2">
                  {q.options.map(opt => {
                    const value =
                      typeof opt === 'string' ? opt : opt.value
                    const label =
                      typeof opt === 'string' ? opt : opt.label
                    const selected = profile[q.key as keyof UserProfile] === value
                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(q.key, value)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                          selected
                            ? 'bg-primary-50 border-primary-300 text-primary-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    )
                  })}
                </div>
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
              为你推荐
            </h2>
            <button
              onClick={reset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 transition cursor-pointer bg-transparent border-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新填写
            </button>
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
                        <h3 className="font-semibold text-gray-900">
                          {store.name}
                        </h3>
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
                      <p className="text-sm text-gray-500 mt-1">
                        {store.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />F{store.floor}
                        </span>
                        <span>人均 ¥{store.avgPrice}</span>
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
            <strong>推荐说明：</strong>基于你填写的消费者画像（预算、兴趣、目的、购物风格），
            系统通过多维度匹配算法生成个性化推荐。实际研究中，推荐引擎将接入用户行为数据与协同过滤模型。
          </div>
        </div>
      )}
    </div>
  )
}
