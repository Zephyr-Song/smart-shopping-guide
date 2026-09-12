// 店铺活动数据：全网公开信息检索整理（检索日期见 RETRIEVED_AT）
// key 与品牌名保持一致（BrandExplore / Offers 两页共用）
export interface StoreActivity {
  title: string
  desc: string
  type: string
  valid?: string
  source: string
  date: string
}

export const RETRIEVED_AT = '2026-09-11'

// 商场通用权益：所有店铺详情抽屉中均展示
export const MALL_PERKS: StoreActivity[] = [
  {
    title: 'BFC × 韩国现代百货 VIP 权益联盟',
    desc: '9 月起双向互通：BFC 会员到访首尔可享 The Hyundai Seoul VIP 休息室、奢侈品牌购物快速通道与 ALT.1 三张展览入场券；现代百货会员来沪可享 BFC VIP 专属休息室、复星艺术中心展览门票与高端餐厅预订礼宾服务。',
    type: '会员',
    valid: '2026 年 9 月起',
    source: '上观新闻 / BFC 官方发布',
    date: '2026-09-10',
  },
  {
    title: '银联信用卡会籍礼遇',
    desc: '银联白金卡可领 BFC 金卡会籍、钻石卡可领钻石卡会籍，享优惠停车、生日礼、升级礼与品牌折扣；钻石卡每月限量领取复星艺术中心展览门票。',
    type: '会员',
    valid: '至 2026-12-31',
    source: '银联权益平台 benefits.95516.com',
    date: '2026-09-11',
  },
  {
    title: 'BFC 会员积分 & 停车权益',
    desc: '场内消费积分累计可兑礼，会员享优惠停车；「外滩枫径」周末市集会员礼遇不定期上新。',
    type: '常规',
    valid: '长期',
    source: 'BFC 官网 bfcsh.com',
    date: '2026-09-11',
  },
]

// 店铺专属活动（全网公开信息检索整理，非官方实时接口）
export const STORE_ACTIVITIES: Record<string, StoreActivity[]> = {
  'DA VITTORIO SHANGHAI': [
    {
      title: '米其林二星午市套餐 ¥688/位',
      desc: '周二至周五午市供应多道式套餐，含餐前手工面包与餐后开心果泡芙；需提前预订，靠窗江景位紧张。',
      type: '套餐',
      valid: '常年 · 周二至周五午市',
      source: '穷游 Biu / Trip.com 实探',
      date: '2026-09-11',
    },
  ],
  'LA PRAIRIE': [
    {
      title: '鱼子精华体验装满赠',
      desc: '会员消费满 ¥5,000 赠明星鱼子精华体验装（7 日量），可叠加积分。',
      type: '赠礼',
      valid: '至 2026-10-31',
      source: '品牌柜台公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  'VERSACE': [
    {
      title: '季末精选低至 6 折',
      desc: '意大利奢侈品牌季末特辑，精选成衣与配饰低至 6 折。',
      type: '折扣',
      valid: '售完即止',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '喜茶': [
    {
      title: '指定饮品第二杯半价',
      desc: '金凤茶王 / 多肉葡萄系列，同单第二杯半价（每单限 2 杯）。',
      type: '满减',
      valid: '新品季限定',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '京都之家': [
    {
      title: '京都和服体验 9 折 + 限定和菓子',
      desc: '海外首个京都文化体验空间，和服试穿与茶道体验同享 9 折。',
      type: '新店',
      valid: '新店开业首月',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  'MARSMART 火星宠物超市': [
    {
      title: '新会员首单满 199 减 50',
      desc: '宠物食品 / 洗护 / 社交空间一站式，新会员首单立减。',
      type: '满减',
      valid: '长期有效',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '新荣记': [
    {
      title: '工作日午市套餐 ¥198 / 位',
      desc: '台州菜米其林三星，工作日午市精选套餐，含招牌东海小鲜。',
      type: '套餐',
      valid: '周一至周五',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '阿飞和巴弟 PET MART': [
    {
      title: '上海首店到店礼 + 洗护 8 折',
      desc: '国产宠物食品沉浸式 IP 乐园，首店限定到店礼，洗护服务 8 折。',
      type: '新店',
      valid: '开业首 30 天',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '隐溪茶馆': [
    {
      title: '新中式茶席体验 7 折',
      desc: '隐于都市的茶道空间，茶席体验与高端茶叶品鉴同享 7 折。',
      type: '体验',
      valid: '至 2026-10-15',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '小米': [
    {
      title: '以旧换新补贴最高 ¥500',
      desc: '小米之家智能家居与数码体验店，旧机回收叠加换新补贴。',
      type: '满减',
      valid: '活动期以门店公告为准',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '美丽田园': [
    {
      title: '新客面部护理体验 ¥9.9',
      desc: '国内高端美容连锁，新客首单面部护理 9.9 元体验价。',
      type: '体验',
      valid: '每用户限一次',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
  '白茸': [
    {
      title: '云南菌菇季套餐 8 折',
      desc: '新中式创意菜，云南菌菇入馔，菌菇火锅双人套餐 8 折。',
      type: '折扣',
      valid: '菌菇季限定',
      source: '公开信息整理',
      date: RETRIEVED_AT,
    },
  ],
}

export function getStoreActivities(name: string): StoreActivity[] {
  return STORE_ACTIVITIES[name] ?? []
}
