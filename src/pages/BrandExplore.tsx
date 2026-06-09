import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  MapPin,
  Star,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react'

// ── 真实品牌数据（来源：BFC官网 bfcsh.com、腾讯新闻2025.10、复星集团公告）──

type BrandCategory =
  | 'luxury'
  | 'designer'
  | 'jewelry'
  | 'beauty'
  | 'lifestyle'
  | 'dining'
  | 'cafe'
  | 'pets'

interface Brand {
  id: string
  name: string
  nameEn: string
  category: BrandCategory
  floor: string
  zone: 'S' | 'N'
  desc: string
  tags: string[]
  highlight: boolean
  emoji: string
}

const CATEGORY_LABELS: Record<BrandCategory, string> = {
  luxury: '奢侈品牌',
  designer: '设计师/潮流',
  jewelry: '珠宝配饰',
  beauty: '美容个护',
  lifestyle: '生活方式',
  dining: '精致餐饮',
  cafe: '咖啡茶饮',
  pets: '宠物友好',
}

const CATEGORY_COLORS: Record<BrandCategory, string> = {
  luxury: 'bg-violet-100 text-violet-700',
  designer: 'bg-rose-100 text-rose-700',
  jewelry: 'bg-amber-100 text-amber-700',
  beauty: 'bg-pink-100 text-pink-700',
  lifestyle: 'bg-teal-100 text-teal-700',
  dining: 'bg-orange-100 text-orange-700',
  cafe: 'bg-yellow-100 text-yellow-700',
  pets: 'bg-green-100 text-green-700',
}

const BRANDS: Brand[] = [
  // ── 奢侈品牌 ──
  {
    id: 'lanvin', name: 'LANVIN', nameEn: 'Lanvin', category: 'luxury',
    floor: 'S-1F', zone: 'S',
    desc: '法国历史最悠久的时装屋，1889年创立，以精湛剪裁和法式优雅著称',
    tags: ['法国', '百年品牌', '外滩首店'], highlight: true, emoji: '👗',
  },
  {
    id: 'versace', name: 'VERSACE', nameEn: 'Versace', category: 'luxury',
    floor: 'S-1F', zone: 'S',
    desc: '意大利奢侈品牌，以大胆印花和美杜莎标志闻名全球',
    tags: ['意大利', '美杜莎', '时尚标杆'], highlight: false, emoji: '🏛️',
  },
  {
    id: 'bally', name: 'BALLY', nameEn: 'Bally', category: 'luxury',
    floor: 'S-1F', zone: 'S',
    desc: '瑞士百年奢侈皮具品牌，1851年创立，以精湛制鞋工艺闻名',
    tags: ['瑞士', '百年品牌', '皮具鞋履'], highlight: false, emoji: '👞',
  },
  {
    id: 'jimmychoo', name: 'Jimmy Choo', nameEn: 'Jimmy Choo', category: 'luxury',
    floor: 'S-1F', zone: 'S',
    desc: '英国奢侈鞋履品牌，戴安娜王妃御用，明星红毯首选',
    tags: ['英国', '鞋履', '明星同款'], highlight: false, emoji: '👠',
  },

  // ── 设计师/潮流 ──
  {
    id: 'alexanderwang', name: 'alexanderwang', nameEn: 'alexander wang', category: 'designer',
    floor: 'S-1F', zone: 'S',
    desc: '纽约华裔设计师品牌，以街头感与高级时装融合的风格著称',
    tags: ['纽约', '华裔设计师', '街头高定'], highlight: true, emoji: '🖤',
  },
  {
    id: 'paulsmith', name: 'Paul Smith', nameEn: 'Paul Smith', category: 'designer',
    floor: 'S-2F', zone: 'S',
    desc: '英国设计师品牌，标志性彩色条纹设计，融合经典与幽默',
    tags: ['英国', '彩色条纹', '男装'], highlight: false, emoji: '🌈',
  },
  {
    id: 'maisonkitsune', name: 'Maison Kitsuné', nameEn: 'Maison Kitsuné', category: 'designer',
    floor: 'S-2F', zone: 'S',
    desc: '法日混血潮流品牌，以经典小狐狸标志和法式慵懒风闻名',
    tags: ['法日混血', '小狐狸标志', '咖啡服饰'], highlight: false, emoji: '🦊',
  },
  {
    id: 'it', name: 'I.T', nameEn: 'I.T Concept Store', category: 'designer',
    floor: 'S-1F', zone: 'S',
    desc: '香港潮流集合店，集结 ACNE STUDIOS、ESSENTIALS、MARINE SERRE、ADER ERROR 等国际潮牌',
    tags: ['集合店', '香港', 'ACNE STUDIOS'], highlight: false, emoji: '🛍️',
  },
  {
    id: 'onoff', name: 'ON/OFF', nameEn: 'ON/OFF Designer Store', category: 'designer',
    floor: 'S-2F', zone: 'S',
    desc: 'BFC自营买手集合店，精选60+中国设计师品牌，涵盖服装、首饰、包袋、生活方式',
    tags: ['自营', '60+设计师', 'Feng Chen Wang', 'Nan Knits'], highlight: true, emoji: '🇨🇳',
  },
  {
    id: 'bebe', name: 'bebe', nameEn: 'bebe', category: 'designer',
    floor: 'S-2F', zone: 'S',
    desc: '美国当代女装品牌，以大胆性感的都市风格深受年轻女性喜爱',
    tags: ['美国', '女装', '都市风'], highlight: false, emoji: '💃',
  },
  {
    id: 'phantaci', name: 'PHANTACI', nameEn: 'PHANTACI', category: 'designer',
    floor: 'S-2F', zone: 'S',
    desc: '周杰伦创立的潮流品牌，以音乐与街头文化为灵感',
    tags: ['周杰伦', '明星品牌', '街头潮流'], highlight: true, emoji: '🎵',
  },
  {
    id: 'wolford', name: 'Wolford', nameEn: 'Wolford', category: 'designer',
    floor: 'S-2F', zone: 'S',
    desc: '奥地利高端贴身服饰品牌，以极致舒适的无缝针织技术闻名',
    tags: ['奥地利', '丝袜', '无缝针织'], highlight: false, emoji: '🧦',
  },

  // ── 珠宝配饰 ──
  {
    id: 'chowtaifook', name: '周大福', nameEn: 'Chow Tai Fook', category: 'jewelry',
    floor: 'S-1F', zone: 'S',
    desc: '香港上市珠宝集团，全球最大珠宝零售商之一，传承近百年',
    tags: ['香港', '黄金', '婚嫁珠宝'], highlight: false, emoji: '💍',
  },

  // ── 美容个护 ──
  {
    id: 'laprairie', name: 'LA PRAIRIE', nameEn: 'La Prairie', category: 'beauty',
    floor: 'S-1F', zone: 'S',
    desc: '瑞士顶级护肤品牌，以鱼子精华系列闻名，奢华抗衰老科技',
    tags: ['瑞士', '鱼子精华', '顶级抗衰'], highlight: true, emoji: '✨',
  },
  {
    id: 'ahava', name: 'AHAVA SPA', nameEn: 'AHAVA Dead Sea Spa', category: 'beauty',
    floor: 'N-4F', zone: 'N',
    desc: '以色列死海矿物护肤品牌，全球首个死海实验室认证SPA',
    tags: ['以色列', '死海矿物', 'SPA'], highlight: false, emoji: '🧂',
  },
  {
    id: 'beautyfarm', name: '美丽田园', nameEn: 'Beauty Farm', category: 'beauty',
    floor: 'N-4F', zone: 'N',
    desc: '国内高端美容连锁品牌，专注面部护理与身体管理',
    tags: ['国内品牌', '面部护理', '连锁'], highlight: false, emoji: '🌸',
  },
  {
    id: 'nailsoul', name: 'Nail Soul', nameEn: 'Nail Soul', category: 'beauty',
    floor: 'S-2F', zone: 'S',
    desc: '日式高端美甲沙龙，提供定制化艺术美甲服务',
    tags: ['日式美甲', '艺术定制'], highlight: false, emoji: '💅',
  },
  {
    id: 'carr', name: 'Carr Barbershop', nameEn: 'Carr Barbershop', category: 'beauty',
    floor: 'S-B1', zone: 'S',
    desc: '英式复古男士理发修容，提供经典热毛巾剃须服务',
    tags: ['男士', '英式复古', '剃须'], highlight: false, emoji: '💈',
  },

  // ── 生活方式 ──
  {
    id: 'kyoto-house', name: '京都之家', nameEn: 'Kyoto House', category: 'lifestyle',
    floor: 'N-2F', zone: 'N',
    desc: '复星与京都市政府合作项目，日本海外首个京都文化体验空间',
    tags: ['京都市政府', '海外首店', '日式美学'], highlight: true, emoji: '🏯',
  },
  {
    id: 'aaddd', name: 'aaddd', nameEn: 'aaddd Beauty Lab', category: 'lifestyle',
    floor: 'N-2F', zone: 'N',
    desc: '美妆香氛集合空间，精选全球小众香气品牌',
    tags: ['香氛', '集合店', '小众'], highlight: false, emoji: '🧴',
  },
  {
    id: 'kidsland', name: 'kidsland', nameEn: 'kidsland', category: 'lifestyle',
    floor: 'N-4F', zone: 'N',
    desc: '国内领先的玩具零售品牌，精选乐高、万代等国际品牌',
    tags: ['玩具', '乐高', '万代'], highlight: false, emoji: '🧸',
  },
  {
    id: 'xiaomi', name: '小米', nameEn: 'Xiaomi', category: 'lifestyle',
    floor: 'N-2F', zone: 'N',
    desc: '小米之家体验店，智能家居+手机数码一站式体验',
    tags: ['数码', '智能家居', '国货'], highlight: false, emoji: '📱',
  },
  {
    id: 'rudy', name: "Sir Rudy's Pro Shop", nameEn: "Sir Rudy's Pro Shop", category: 'lifestyle',
    floor: 'S-B1', zone: 'S',
    desc: '专业高尔夫装备店，提供定制fitting与高端球具',
    tags: ['高尔夫', '定制', '运动'], highlight: false, emoji: '⛳',
  },

  // ── 精致餐饮 ──
  {
    id: 'davittorio', name: 'DA VITTORIO SHANGHAI', nameEn: 'DA VITTORIO Shanghai', category: 'dining',
    floor: 'N-3F', zone: 'N',
    desc: '意大利米其林三星餐厅，上海分店连续多年摘星，主打海鲜意面与意式服务',
    tags: ['米其林', '意大利', '三星', '江景'], highlight: true, emoji: '⭐',
  },
  {
    id: 'xinrongji', name: '新荣记', nameEn: 'Xin Rong Ji', category: 'dining',
    floor: 'N-3F', zone: 'N',
    desc: '台州菜代表，中国大陆首个米其林三星中餐品牌，以东海海鲜著称',
    tags: ['米其林', '台州菜', '三星', '江景'], highlight: true, emoji: '🐟',
  },
  {
    id: 'jingxihui', name: '菁禧荟', nameEn: 'Jing Xi Hui', category: 'dining',
    floor: 'N-3F', zone: 'N',
    desc: '高端潮州菜，连续多年米其林推荐，以卤水和功夫菜闻名',
    tags: ['米其林', '潮州菜', '功夫菜'], highlight: false, emoji: '🦀',
  },
  {
    id: 'yuwaitan', name: '遇外滩', nameEn: 'Yu Wai Tan', category: 'dining',
    floor: 'N-3F', zone: 'N',
    desc: '外滩江景福建菜，米其林指南入选，以佛跳墙和闽南小食著称',
    tags: ['米其林', '福建菜', '佛跳墙', '江景'], highlight: false, emoji: '🏮',
  },
  {
    id: 'shanghaitan', name: '上海滩', nameEn: 'Shanghai Tang Restaurant', category: 'dining',
    floor: 'N-3F', zone: 'N',
    desc: '魔都本帮菜标杆，演绎传统上海味道，蟹粉和红烧肉为招牌',
    tags: ['本帮菜', '蟹粉', '江景'], highlight: false, emoji: '🦐',
  },
  {
    id: 'laojitang', name: '老吉堂', nameEn: 'Lao Ji Tang', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '传承三代的上海本帮菜，以红烧划水和葱油拌面为镇店之宝',
    tags: ['本帮菜', '三代传承', '老字号'], highlight: false, emoji: '🍜',
  },
  {
    id: 'thaizhen', name: '泰珍荟', nameEn: 'Saffron Thai', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '上海高端泰国料理标杆，连续蝉联米其林指南，正宗宫廷泰味',
    tags: ['米其林', '泰国菜', '宫廷料理'], highlight: false, emoji: '🌶️',
  },
  {
    id: 'haruka', name: '晴空', nameEn: 'Haruka Japanese', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '板前Omakase高端日料，空运当季食材，每日限量接待',
    tags: ['Omakase', '空运食材', '限量'], highlight: false, emoji: '🍣',
  },
  {
    id: 'numataso', name: 'NUMATASOU 沼田双', nameEn: 'Numataso', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '日本主厨主理的高端和食，以天妇罗和季节怀石为主题',
    tags: ['和食', '天妇罗', '怀石'], highlight: false, emoji: '🍤',
  },
  {
    id: 'hutong', name: '橘焱胡同烧肉夜食', nameEn: 'Hutong Yakiniku', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '台北米其林推荐烧肉品牌，主打澳洲和牛与胡同秘制酱料',
    tags: ['米其林推荐', '和牛', '台北'], highlight: false, emoji: '🥩',
  },
  {
    id: 'primesteak', name: '高桌牛排馆', nameEn: 'Prime Steakhouse', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '干式熟成牛排专门店，选用USDA Prime级牛肉，红酒墙打卡',
    tags: ['干式熟成', 'USDA Prime', '牛排'], highlight: false, emoji: '🍷',
  },
  {
    id: 'putian', name: '莆田餐厅', nameEn: 'Putien', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '新加坡米其林一星福建菜，以百秒黄花鱼和莆田卤面闻名',
    tags: ['米其林', '新加坡', '福建菜'], highlight: false, emoji: '🐠',
  },
  {
    id: 'bairong', name: '白茸', nameEn: 'Bai Rong', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '新中式创意菜，以云南菌菇入馔，呈现东方美学用餐体验',
    tags: ['新中式', '云南菌菇', '创意菜'], highlight: false, emoji: '🍄',
  },
  {
    id: 'songhelou', name: '松鹤楼苏式汤面', nameEn: 'Song He Lou', category: 'dining',
    floor: 'S-B2', zone: 'S',
    desc: '始于1757年的中华老字号，苏式红汤面和焖肉面为经典',
    tags: ['百年老字号', '苏式面', '非遗'], highlight: false, emoji: '🍝',
  },
  {
    id: 'dieyuan', name: '蝶园海鲜酒馆', nameEn: 'Die Yuan Seafood', category: 'dining',
    floor: 'S-3F', zone: 'S',
    desc: '鲜活海鲜现捞现做，主打粤式海鲜料理与港式点心',
    tags: ['活海鲜', '粤式', '点心'], highlight: false, emoji: '🦞',
  },

  // ── 咖啡茶饮 ──
  {
    id: 'matcha', name: 'M Stand', nameEn: 'M Stand Coffee', category: 'cafe',
    floor: 'N-1F', zone: 'N',
    desc: '上海起家的精品咖啡品牌，水泥工业风设计，燕麦曲奇拿铁爆款',
    tags: ['上海品牌', '工业风', '创意咖啡'], highlight: false, emoji: '☕',
  },
  {
    id: 'heytea', name: '喜茶', nameEn: 'HEYTEA', category: 'cafe',
    floor: 'N-1F', zone: 'N',
    desc: '新茶饮头部品牌，芝士奶盖首创者，多肉葡萄和芝芝莓莓招牌',
    tags: ['新茶饮', '芝士奶盖', '排队'], highlight: false, emoji: '🧋',
  },
  {
    id: 'yinxi', name: '隐溪茶馆', nameEn: 'Yin Xi Tea House', category: 'cafe',
    floor: 'N-2F', zone: 'N',
    desc: '新中式美学茶馆，以"隐于都市"为理念，提供高端茶叶品鉴',
    tags: ['新中式', '茶道', '包间'], highlight: false, emoji: '🍵',
  },
  {
    id: 'bakerspice', name: 'Baker&Spice', nameEn: 'Baker & Spice', category: 'cafe',
    floor: 'N-1F', zone: 'N',
    desc: 'Wagas旗下健康烘焙轻食品牌，全麦面包和沙拉碗为主打',
    tags: ['健康', '烘焙', '轻食'], highlight: false, emoji: '🥖',
  },
  {
    id: 'laparisienne', name: '巴黎蜜语', nameEn: 'La Parisienne', category: 'cafe',
    floor: 'N-1F', zone: 'N',
    desc: '法式手工甜品店，马卡龙和拿破仑为招牌，选用法国进口原料',
    tags: ['法式', '甜品', '马卡龙'], highlight: false, emoji: '🥐',
  },
  {
    id: 'whites', name: 'Whites', nameEn: 'Whites', category: 'cafe',
    floor: 'N-1F', zone: 'N',
    desc: '全白极简风早午餐店，ins风网红打卡，班尼迪克蛋人气王',
    tags: ['brunch', 'ins风', '打卡'], highlight: false, emoji: '🥚',
  },
  {
    id: 'lejardin', name: 'Le Jardin de JR', nameEn: 'Le Jardin de JR', category: 'cafe',
    floor: 'N-4F', zone: 'N',
    desc: '法式花园风下午茶，露台江景位，玫瑰主题甜品套餐',
    tags: ['下午茶', '花园', '江景'], highlight: false, emoji: '🌹',
  },

  // ── 宠物友好 ──
  {
    id: 'marsmart', name: 'MARSMART 火星宠物超市', nameEn: 'Marsmart Pets', category: 'pets',
    floor: 'N-4F', zone: 'N',
    desc: '新概念宠物生活超市，宠物用品+洗护+社交空间一站式',
    tags: ['宠物超市', '洗护', '社交'], highlight: true, emoji: '🐾',
  },
  {
    id: 'afei', name: '阿飞和巴弟', nameEn: 'Alfie & Buddy', category: 'pets',
    floor: 'N-4F', zone: 'N',
    desc: '国产高端宠物食品品牌，以鲜肉冻干和功能性主粮出圈',
    tags: ['国货', '鲜肉冻干', '猫狗粮'], highlight: false, emoji: '🐱',
  },
  {
    id: 'petwish', name: '宠物愿望', nameEn: 'Pet Wish', category: 'pets',
    floor: 'N-4F', zone: 'N',
    desc: '宠物综合服务店，涵盖美容、寄养、摄影、生日派对定制',
    tags: ['美容', '寄养', '宠物摄影'], highlight: false, emoji: '🐶',
  },
]

const ALL_CATEGORIES: BrandCategory[] = ['luxury', 'designer', 'jewelry', 'beauty', 'lifestyle', 'dining', 'cafe', 'pets']
const ZONES = [
  { key: 'all', label: '南北区' },
  { key: 'S', label: '南区 (S)' },
  { key: 'N', label: '北区 (N)' },
]

export default function BrandExplore() {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<BrandCategory | 'all'>('all')
  const [zoneFilter, setZoneFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = BRANDS

    if (activeCat !== 'all') {
      list = list.filter(b => b.category === activeCat)
    }
    if (zoneFilter !== 'all') {
      list = list.filter(b => b.zone === zoneFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.nameEn.toLowerCase().includes(q) ||
          b.desc.toLowerCase().includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    return list
  }, [search, activeCat, zoneFilter])

  const stats = {
    total: BRANDS.length,
    luxury: BRANDS.filter(b => b.category === 'luxury').length,
    designer: BRANDS.filter(b => b.category === 'designer').length,
    dining: BRANDS.filter(b => b.category === 'dining').length,
    highlights: BRANDS.filter(b => b.highlight).length,
  }

  return (
    <div className="space-y-5">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">品牌探索</h1>
        <p className="text-sm text-gray-500 mt-1">
          数据来源：BFC官方官网 (bfcsh.com)、腾讯新闻、复星集团公告 · 共计 {stats.total} 个品牌
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: '全部品牌', value: stats.total, color: 'bg-gray-800' },
          { label: '奢侈品牌', value: stats.luxury, color: 'bg-violet-500' },
          { label: '设计师/潮流', value: stats.designer, color: 'bg-rose-500' },
          { label: '精致餐饮', value: stats.dining, color: 'bg-orange-500' },
          { label: '首店/旗舰', value: stats.highlights, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className={`w-8 h-1.5 rounded-full mx-auto mb-2 ${s.color}`} />
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-[11px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 搜索 + 筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索品牌名称、品类或标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 区域筛选 */}
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {ZONES.map(z => (
            <button
              key={z.key}
              onClick={() => setZoneFilter(z.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors cursor-pointer border-none ${
                zoneFilter === z.key
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* 品类标签 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
            activeCat === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
          }`}
        >
          全部品类
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border whitespace-nowrap ${
              activeCat === cat
                ? 'border-transparent text-white'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
            style={
              activeCat === cat
                ? { background: CATEGORY_COLORS[cat].includes('violet') ? '#7C3AED' : CATEGORY_COLORS[cat].includes('rose') ? '#F43F5E' : CATEGORY_COLORS[cat].includes('amber') ? '#D97706' : CATEGORY_COLORS[cat].includes('pink') ? '#EC4899' : CATEGORY_COLORS[cat].includes('teal') ? '#0D9488' : CATEGORY_COLORS[cat].includes('orange') ? '#EA580C' : CATEGORY_COLORS[cat].includes('yellow') ? '#CA8A04' : '#16A34A' }
                : {}
            }
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 结果数量 + 排序提示 */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Filter className="w-3 h-3" />
        共 <span className="font-medium text-gray-600">{filtered.length}</span> 个品牌
        {activeCat !== 'all' && <span className="text-gray-300">· {CATEGORY_LABELS[activeCat]}</span>}
        {zoneFilter !== 'all' && <span className="text-gray-300">· {zoneFilter === 'S' ? '南区' : '北区'}</span>}
      </div>

      {/* 品牌卡片网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">未找到匹配品牌</p>
          <p className="text-xs mt-1">试试其他关键词或筛选条件</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(brand => {
            const zoneColor = brand.zone === 'S' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'
            const zoneLabel = brand.zone === 'S' ? '南区' : '北区'
            return (
              <div
                key={brand.id}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                  brand.highlight ? 'ring-1 ring-amber-200 border-amber-200' : 'border-gray-100'
                }`}
              >
                {/* 顶部：emoji + 名称 + 徽章 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                    {brand.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">{brand.name}</span>
                      {brand.highlight && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                          首店/旗舰
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">{brand.nameEn}</div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{brand.desc}</p>

                {/* 标签行 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {brand.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 底部：楼层 + 品类 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${zoneColor}`}>
                      {zoneLabel} {brand.floor}
                    </span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_COLORS[brand.category]}`}>
                    {CATEGORY_LABELS[brand.category]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 数据来源说明 */}
      <div className="bg-blue-50 rounded-xl p-3.5 text-sm text-blue-700 flex gap-2 items-start">
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-medium mb-0.5">数据来源与更新说明</p>
          <p className="text-xs leading-relaxed">
            品牌数据整理自 BFC 外滩金融中心官方网站 (bfcsh.com) 2026年公开商户列表、腾讯新闻2025年10月《BFC时尚潮流矩阵再升级》专题报道、复星集团2025年公告。
            部分品牌可能因商场业态调整发生变化，以商场实际运营为准。
            BFC共有42个商业面积约 96,000m²，分为南区 (S) 和北区 (N) 两大区域，涵盖 S-B3 至 S1-5F、N-1F 至 N-4F 共 10 层商业空间。
          </p>
        </div>
      </div>
    </div>
  )
}
