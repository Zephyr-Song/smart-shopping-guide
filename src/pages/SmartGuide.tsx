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
  Settings,
  Send,
  Loader2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'
import type { UserProfile, Recommendation } from '../data/mockData'
import { STORES, CATEGORIES, BFC_SEGMENTS, generateRecommendations } from '../data/mockData'
import {
  generateAiRecommendation,
  askFollowUp,
  buildFollowUpSystem,
  getApiKey,
  setApiKey,
  getBaseUrl,
  setBaseUrl,
  getModel,
  setModel,
  isAiReady,
  PROVIDERS,
  type ProviderId,
  type AiMessage,
} from '../services/aiGuide'

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
  { value: '品质美食', label: '品质美食', desc: '探索精选餐饮', icon: '🍽️' },
  { value: '潮流购物', label: '潮流购物', desc: '国际精品与买手店', icon: '🛍️' },
  { value: '休闲娱乐', label: '休闲娱乐', desc: '养生放松与健身', icon: '♨️' },
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
  { name: '潮流品牌', icon: '🎯', keywords: ['潮流', '潮牌', '小众'] },
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

  // AI 相关状态
  const [loading, setLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [narrative, setNarrative] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [providerInput, setProviderInput] = useState<ProviderId>('deepseek')
  const [baseUrlInput, setBaseUrlInput] = useState('')
  const [modelInput, setModelInput] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const [keyTesting, setKeyTesting] = useState(false)
  const [keyTestMsg, setKeyTestMsg] = useState('')

  // 追问对话状态
  const [chat, setChat] = useState<AiMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

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

  const generateResults = async () => {
    const fullProfile: UserProfile = {
      gender: '',
      age: profile.age || '24-30',
      persona: profile.persona || '其他',
      companion: profile.companion || 'friends',
      priority: profile.priority || '社交打卡',
      interests: profile.interests?.length ? profile.interests : ['精致餐饮', '咖啡茶饮'],
      budgetStyle: profile.budgetStyle || '适中消费',
    }

    setStep(PROFILE_QUESTIONS.length + 1)
    setLoading(true)
    setAiError('')
    setNarrative('')
    setChat([])

    // 未完整配置 → 直接走规则推荐
    if (!isAiReady()) {
      setRecommendations(generateRecommendations(fullProfile))
      setLoading(false)
      return
    }

    // 有 Key → 调真 AI，失败回退规则推荐
    try {
      const result = await generateAiRecommendation(fullProfile, STORES)
      setNarrative(result.narrative)
      setRecommendations(
        result.picks.map((p) => ({
          storeId: p.storeId,
          score: p.score,
          reason: p.reason,
        }))
      )
    } catch (e) {
      setRecommendations(generateRecommendations(fullProfile))
      setAiError((e as Error).message || 'AI 生成失败，已使用规则推荐')
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async () => {
    const q = chatInput.trim()
    if (!q || chatLoading || !isAiReady()) return
    const chosenNames = recommendations
      .map((r) => STORES.find((s) => s.id === r.storeId)?.name)
      .filter(Boolean) as string[]
    const messages: AiMessage[] = [
      { role: 'system', content: buildFollowUpSystem(profile as UserProfile, chosenNames) },
      ...chat,
      { role: 'user', content: q },
    ]
    setChat((prev) => [...prev, { role: 'user', content: q }])
    setChatInput('')
    setChatLoading(true)
    try {
      const answer = await askFollowUp(messages)
      setChat((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setChat((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${(e as Error).message || '回答失败'}` },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleSaveKey = () => {
    setApiKey(apiKeyInput)
    setBaseUrl(baseUrlInput)
    setModel(modelInput)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const handleTestKey = async () => {
    setKeyTesting(true)
    setKeyTestMsg('')
    const prevKey = getApiKey()
    const prevUrl = getBaseUrl()
    const prevModel = getModel()
    // 临时用输入框的值测试（测试完若未保存则恢复原值）
    setApiKey(apiKeyInput.trim())
    setBaseUrl(baseUrlInput.trim())
    setModel(modelInput.trim())
    try {
      const r = await askFollowUp([{ role: 'user', content: '回复 ok 两个字即可' }])
      setKeyTestMsg(r ? '✅ 配置有效，可正常调用' : '⚠️ 返回为空')
    } catch (e) {
      setKeyTestMsg(`❌ ${(e as Error).message}`)
    } finally {
      if (!prevKey && !apiKeyInput.trim()) setApiKey('')
      if (!prevUrl && !baseUrlInput.trim()) setBaseUrl('')
      if (!prevModel && !modelInput.trim()) setModel('')
      setKeyTesting(false)
    }
  }

  const reset = () => {
    setStep(0)
    setProfile({ interests: [] })
    setRecommendations([])
    setNarrative('')
    setAiError('')
    setChat([])
    setChatInput('')
  }

  const isInterestStep = step === PROFILE_QUESTIONS.length
  const isResultsStep = step > PROFILE_QUESTIONS.length

  // Get matched persona info
  const selectedPersona = PERSONA_OPTIONS.find(p => p.value === profile.persona)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            AI 智能导购
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            基于BFC客群画像与可配置大模型，获取个性化店铺推荐
          </p>
        </div>
        <button
          onClick={() => {
            const savedUrl = getBaseUrl()
            const matched = PROVIDERS.find(
              (p) => p.id !== 'custom' && p.baseUrl === savedUrl
            )
            setProviderInput(matched ? matched.id : 'custom')
            setApiKeyInput(getApiKey())
            setBaseUrlInput(savedUrl)
            setModelInput(getModel())
            setShowSettings(true)
          }}
          className="mt-1 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 transition cursor-pointer bg-white"
          title="配置 AI 接口（服务商 / Key / 模型）"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs">AI 设置</span>
          {isAiReady() ? (
            <span className="w-2 h-2 rounded-full bg-green-500" title="已接入真 AI" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-300" title="未完整配置，使用规则推荐" />
          )}
        </button>
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

          {/* 加载态 */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-sm">AI 正在为你生成专属推荐…</span>
            </div>
          )}

          {/* AI 导购语 */}
          {!loading && narrative && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/60 rounded-xl p-4 border border-primary-100">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-primary-800 leading-relaxed">{narrative}</p>
              </div>
            </div>
          )}

          {/* AI 失败提示 */}
          {!loading && aiError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              ⚠️ {aiError}（可在右上角「AI 设置」中检查 Key）
            </div>
          )}

          {/* 未配置提示 */}
          {!loading && !isAiReady() && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5" />
              当前使用规则推荐。点击右上角「AI 设置」填入 Key 与接口信息，即可切换为真 AI 个性化导购。
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

          {/* 追问对话 */}
          {isAiReady() && !loading && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Sparkles className="w-4 h-4 text-primary-500" />
                继续问 AI 导购
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {chat.length === 0 && (
                  <p className="text-xs text-gray-400">
                    例如：「带小孩去哪家安静点？」「有没有人均 200 以内的咖啡？」「这些店今天营业到几点？」
                  </p>
                )}
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] text-sm px-3 py-2 rounded-xl whitespace-pre-wrap ${
                        m.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-400 text-sm px-3 py-2 rounded-xl flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> 思考中…
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAsk()
                  }}
                  placeholder="追问你的导购需求…"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-300"
                />
                <button
                  onClick={handleAsk}
                  disabled={chatLoading || !chatInput.trim()}
                  className="flex items-center gap-1 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-600 disabled:opacity-40 transition cursor-pointer border-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  发送
                </button>
              </div>
            </div>
          )}

          <div className="bg-primary-50 rounded-xl p-4 text-sm text-primary-700">
            <strong>推荐说明：</strong>基于你选择的 BFC 客群画像（{profile.persona}），
            消费优先级（{profile.priority}）、预算风格（{profile.budgetStyle}）及兴趣标签，
            {isAiReady() ? (
              <>由 <strong>大模型实时推理</strong> 生成个性化推荐与推荐理由，可继续追问细化。</>
            ) : (
              <>通过多维度匹配算法生成个性化推荐（在右上角「AI 设置」填入 Key 与接口信息后切换为真 AI）。</>
            )}
          </div>
        </div>
      )}

      {/* AI 设置弹窗 */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary-500" />
                AI 接口设置
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none bg-transparent border-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              配置仅保存在你本机浏览器（localStorage），不会上传或写入代码。支持 DeepSeek、阿里云 MaaS 或任意 OpenAI 兼容接口。
            </p>

            {/* 服务商预设 */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500">服务商</label>
              <select
                value={providerInput}
                onChange={(e) => {
                  const id = e.target.value as ProviderId
                  setProviderInput(id)
                  const p = PROVIDERS.find((x) => x.id === id)
                  if (p && p.baseUrl) {
                    setBaseUrlInput(p.baseUrl)
                    setModelInput(p.defaultModel)
                  }
                }}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 bg-white"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Base URL */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500">API Base URL</label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="https://.../chat/completions"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 font-mono"
              />
            </div>

            {/* 模型名 */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500">模型名</label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="如 qwen-plus / deepseek-chat"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 font-mono"
              />
            </div>

            {/* Key */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500">API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveKey}
                className="flex-1 flex items-center justify-center gap-1 bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition cursor-pointer border-none"
              >
                <CheckCircle2 className="w-4 h-4" />
                保存配置
              </button>
              <button
                onClick={handleTestKey}
                disabled={keyTesting}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:border-primary-300 transition cursor-pointer bg-white disabled:opacity-40"
              >
                {keyTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : '测试'}
              </button>
              <button
                onClick={() => {
                  setApiKey('')
                  setApiKeyInput('')
                  setBaseUrl('')
                  setBaseUrlInput('')
                  setModel('')
                  setModelInput('')
                }}
                className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition cursor-pointer bg-white"
              >
                清除
              </button>
            </div>
            {keySaved && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 已保存
              </p>
            )}
            {keyTestMsg && <p className="text-xs text-gray-600">{keyTestMsg}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
