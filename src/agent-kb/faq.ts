import type { KbItem } from './types'

// 常见问题 FAQ
export const FAQ: KbItem[] = [
  {
    id: 'faq-hours',
    title: '营业时间',
    category: '常见问题',
    content:
      '常规营业时间：周日—周四 10:00–22:00，周五—周六及节假日 10:00–22:30。餐饮与影院可能延长。具体以当日商场公告为准。',
    keywords: ['营业时间', '几点开门', '几点关门', '开门', '关门', '几点营业', 'hours', '营业'],
  },
  {
    id: 'faq-parking-fee',
    title: '停车收费',
    category: '常见问题',
    content:
      '停车首小时约 ¥15，之后约 ¥10/小时，会员可兑免费停车券；消费满额常赠抵扣券。封顶与免费时段以现场公示为准。',
    keywords: ['停车费', '停车收费', '停车多少钱', '停车券', '免费停车', '停车价格', 'parking fee'],
  },
  {
    id: 'faq-pet',
    title: '宠物政策',
    category: '常见问题',
    content:
      'BFC 为宠物友好商场，室内须使用宠物推车或牵绳，并及时清理。部分餐饮与食品店铺谢绝宠物入内，请留意店门口标识。',
    keywords: ['宠物', '狗', '猫', '能不能带狗', '宠物政策', 'pet policy', '携宠'],
  },
  {
    id: 'faq-invoice',
    title: '发票',
    category: '常见问题',
    content: '消费后可向门店索取电子发票（增值税普通/专用视商户资质），客服中心可指引开票流程。',
    keywords: ['发票', '开票', '报销', '电子发票', 'invoice', 'fapiao'],
  },
  {
    id: 'faq-payment',
    title: '支付方式',
    category: '常见问题',
    content: '全场支持微信、支付宝、银联及主流外卡（Visa / Master / 运通），多数门店支持 NFC 闪付与手机 Pay。',
    keywords: ['支付', '付款', '微信', '支付宝', '刷卡', '外卡', 'visa', 'master', 'apple pay', '银联'],
  },
  {
    id: 'faq-food',
    title: '可否携带外食',
    category: '常见问题',
    content: '公共区域一般不禁止自带饮水与简餐，但餐饮楼层与店铺内请遵守店方规定；大量外食建议至户外广场就餐区。',
    keywords: ['外食', '带饭', '自带', '吃的', '食物', 'outside food'],
  },
  {
    id: 'faq-kids',
    title: '亲子 / 儿童',
    category: '常见问题',
    content: '设有母婴室、童车借用与多家亲子/儿童品牌；室外广场常有亲子活动。带娃逛吃推荐见智能导购的「带娃」场景。',
    keywords: ['亲子', '儿童', '小孩', '宝宝', '带娃', '母婴', 'kids', 'family'],
  },
  {
    id: 'faq-accessibility',
    title: '无障碍',
    category: '常见问题',
    content: '全场无障碍通道、电梯与卫生间；提供轮椅免费借用；停车位设无障碍专用位（B1 近电梯厅）。',
    keywords: ['无障碍', '轮椅', '残障', '残疾人', 'accessibility', '老人', '行动不便'],
  },
]
