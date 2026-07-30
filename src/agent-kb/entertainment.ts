// BFC 休闲娱乐业态（影院 / 现场音乐 / 艺术 / 酒吧 / 宠物乐园）
// 数据来源：官网 + 公开新闻/攻略核实（2026-07）。
// 说明：BFC 官方四大业态为「时尚潮流·艺术文化·美食美酒·人宠友好」，
// 商场内无 KTV、无密室逃脱；以下为已核实存在的休闲玩乐去处。
import type { KbItem } from './types'

export const ENTERTAINMENT: KbItem[] = [
  {
    id: 'ent-overview',
    title: 'BFC 娱乐业态总览',
    category: '娱乐休闲',
    content:
      'BFC 以「时尚潮流·艺术文化·美食美酒·人宠友好」四大业态为主，商场内没有 KTV、也没有密室逃脱。但休闲玩乐并不少：看电影去博悦汇影城、听现场去 TZ HOUSE Livehouse、看展去复星艺术中心、小酌去 Moon N Back / 满堂 by Bar Choice。想找 KTV / 密室逃脱这类，可去附近商圈（如豫园、新天地）补全。',
    keywords: ['ktv', '密室', '逃脱', '娱乐', '玩乐', '电影院', '影院', '电影', 'livehouse', '艺术中心', '业态'],
  },
  {
    id: 'ent-cinema',
    title: '博悦汇影城',
    category: '娱乐休闲',
    content:
      '博悦汇影城是 BFC 商场内的电影院，常年放映新片并承接上海国际电影节展映（如「向大师致敬」主题展）。位于 BFC 内，具体影厅楼层以场内导视为准 🎬 想看电影直接来这就行。',
    keywords: ['电影院', '影院', '电影', '博悦汇', '看电影', '影城', 'cinema', '观影'],
  },
  {
    id: 'ent-livehouse',
    title: 'TZ HOUSE Livehouse',
    category: '娱乐休闲',
    content:
      'TZ HOUSE Livehouse 位于 BFC 北区 N1 幢 2F，是全国现象级音乐现场，专业级声学设计、常驻实力唱将，涵盖 Pop / Jazz / Rock。听现场、释放压力的好去处 🎤',
    keywords: ['livehouse', 'tz house', '现场', '音乐现场', '听歌', '演出', '演唱会', '乐队'],
  },
  {
    id: 'ent-art',
    title: '复星艺术中心',
    category: '娱乐休闲',
    content:
      '复星艺术中心是 BFC 标志性的鼓形建筑，非营利当代艺术机构，常设高品质艺术展与公众教育活动，逛展、拍照打卡都合适 🖼️',
    keywords: ['复星艺术中心', '艺术中心', '展览', '看展', '美术馆', '画廊', 'art'],
  },
  {
    id: 'ent-bar',
    title: '酒吧 / 夜生活',
    category: '娱乐休闲',
    content:
      '想小酌去 Moon N Back（南区 4 楼，融合创意料理酒吧）或 满堂 by Bar Choice（北区 1 楼，精品鸡尾酒餐吧）🍸 此外 BFC 夜生活还有外滩枫径市集、艺术季等限时活动。',
    keywords: ['酒吧', '夜生活', '小酌', '鸡尾酒', '餐吧', '喝酒', 'bar', '微醺'],
  },
]
