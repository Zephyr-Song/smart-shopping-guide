import type { KbItem } from './types'

// 商场服务（具体规则与收费以现场公示为准）
export const SERVICES: KbItem[] = [
  {
    id: 'svc-giftwrap',
    title: '礼品包装',
    category: '服务',
    content: '部分品牌与 L1 客服中心提供礼品包装服务，节日期间设主题包装台；奢侈品专柜通常含品牌专属包装。',
    keywords: ['礼品包装', '包装', '送礼', '礼盒', 'wrap', 'gift'],
  },
  {
    id: 'svc-return',
    title: '退换货',
    category: '服务',
    content:
      '凭购物小票与原始支付凭证，符合品牌政策的商品可在规定期限内退换。食品、贴身用品、定制类通常不支持无理由退换。详见「政策-退换货」。',
    keywords: ['退换', '退货', '换货', '退钱', '退款', '小票', 'return'],
  },
  {
    id: 'svc-taxfree',
    title: '免税 / 退税',
    category: '服务',
    content: '部分国际品牌门店支持境外旅客退税（Tax Free），结账时出示护照登记，离境时按海关规定办理退税。',
    keywords: ['退税', '免税', 'taxfree', 'tax free', '护照', '境外', '游客', 'tourist'],
  },
  {
    id: 'svc-stroller',
    title: '童车 / 轮椅租赁',
    category: '服务',
    content: 'L1 客服中心提供婴儿车与轮椅免费借用（押金可退），先到先得，旺季建议早到。',
    keywords: ['童车', '婴儿车', '轮椅', '借用', '宝宝', '小孩车', 'stroller', 'wheelchair'],
  },
  {
    id: 'svc-parking-book',
    title: '预约停车',
    category: '服务',
    content: '可通过 BFC 官方小程序提前预约车位与代客泊车（视时段开放），减少高峰等候。',
    keywords: ['预约停车', '代客泊车', '车位预约', '泊车'],
  },
  {
    id: 'svc-member',
    title: '会员中心',
    category: '服务',
    content:
      'BFC 会员可积分、兑换停车券与专属活动名额，等级越高权益越多。会员中心位于 L1，或在官方小程序开通电子会员。',
    keywords: ['会员', '积分', 'vip', '权益', '等级', '电子会员', '小程序'],
  },
  {
    id: 'svc-lost',
    title: '失物招领',
    category: '服务',
    content: '遗失物品请到 L1 客服中心登记，或致电商场服务热线；拾获物品统一由客服中心保管。',
    keywords: ['失物', '招领', '丢失', '丢东西', '落东西', 'lost', 'found'],
  },
  {
    id: 'svc-translate',
    title: '翻译 / 外币',
    category: '服务',
    content: '客服中心可提供基础外语指引与外币兑换信息，主要国际品牌门店多配有英语店员。',
    keywords: ['翻译', '外语', '英语', '日文', '韩文', 'translate', '外币', '兑换'],
  },
]
