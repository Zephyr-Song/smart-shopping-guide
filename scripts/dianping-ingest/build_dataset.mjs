// 生成完整 dataset.json：覆盖全部 101 个前端店铺
// 规则：brand = 大众点评真实店名；frontend = 前端 store.name（API 查找键）；
//      url = 真实店铺页（已核实）或 大众点评搜索页回退；dishes 必须是数组。
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = 'D:/WorkBuddy/smart-shopping-guide'
const DATA = ROOT + '/scripts/dianping-ingest/dataset.json'
const MISSING = ROOT + '/scripts/dianping-ingest/dataset_missing.json'
const MOCK = ROOT + '/src/data/mockData.ts'
const OUT = DATA

// 1) 读取既有真实点评数据
const base = JSON.parse(readFileSync(DATA, 'utf-8'))
const missing = JSON.parse(readFileSync(MISSING, 'utf-8'))
const real = [...base, ...missing]

// 2) 本轮 WebSearch 核实过的店铺（brand=真实名 / frontend=前端名 / 直链或搜索回退）
const extra = [
  { frontend:'复兴面王深夜食堂', brand:'复兴面王深夜食堂', rating:'3.9', avgPrice:29,
    dishes:['番茄汁拌川','爆炒猪肝浇头','没脸大炸猪排','黑糯米莲子糕','定胜糕','虾爆鳝鸡汤片儿川'],
    snippet:'BFC外滩深夜人气面馆，番茄汁拌川与爆炒猪肝浇头为招牌，中山东二路外滩店人均约29元。',
    url:'https://m.dianping.com/shop/1757895924?msource=applemaps' },
  { frontend:'PEANUT BUTTER', brand:'PEANUT BUTTER 花生酱', rating:'3.9', avgPrice:118,
    dishes:['美式创意汉堡','花生酱风味小吃','西餐小食','精酿啤酒'],
    snippet:'BFC外滩金融中心店的美式创意汉堡店，花生酱风味招牌，人均约118元。',
    url:'https://m.dianping.com/shopinfo/G2OaGjhX5jG2d1LS' },
  { frontend:'MANNER', brand:'MANNER Coffee', rating:'3.9', avgPrice:21,
    dishes:['燕麦拿铁','拿铁','桂花拿铁','Flat White','桂花澳白'],
    snippet:'上海精品咖啡标杆，BFC外滩金融中心北区B2店，燕麦拿铁与桂花拿铁人气高，人均约21元。',
    url:'https://m.dianping.com/shop/112293956' },
  { frontend:'一点点', brand:'一点点', rating:'3.8', avgPrice:18,
    dishes:['冰淇淋红茶','波霸奶茶','珍珠奶茶','红茶玛奇朵'],
    snippet:'BFC北区广场薇襄商业街B2美食区的人气手摇茶，冰淇淋红茶与波霸奶茶招牌，人均约18元。',
    url:'https://www.dianping.com/review/500764722' },
  { frontend:'Tuna Maki', brand:'Tuna Maki', rating:'4.50', avgPrice:164,
    dishes:['日式手卷寿司','三文鱼手卷','金枪鱼寿司','军舰卷'],
    snippet:'BFC日式手卷寿司专门店，新鲜金枪鱼与三文鱼手卷招牌，人均约164元。',
    url:'https://www.dianping.com/review/838897109' },
  { frontend:'阿不就台湾食堂', brand:'阿不就台湾食堂', rating:'3.8', avgPrice:45,
    dishes:['台式卤肉饭','盐酥鸡','蚵仔煎','台湾牛肉面'],
    snippet:'BFC台式风味小吃，卤肉饭与盐酥鸡招牌，人均约45元。',
    url:'https://m.dianping.com/shop/1358825383' },
  { frontend:'不入川豆花馆', brand:'不入川豆花馆', rating:'4.0', avgPrice:60,
    dishes:['招牌豆花','川味小面','钵钵鸡','冰粉'],
    snippet:'BFC地道家味豆花馆，招牌豆花与川味小面，人均约60元。',
    url:'https://m.dianping.com/shop/1623101157' },
  { frontend:'东发道茶冰厅', brand:'东发道茶冰厅', rating:'4.3', avgPrice:60,
    dishes:['港式奶茶','菠萝油','冰火菠萝包','漏奶华'],
    snippet:'BFC港式茶餐厅，港式奶茶与菠萝油招牌，人均约60元。',
    url:'https://m.dianping.com/discovery/2127919222' },
  { frontend:'丽拉瓦迪泰式SPA', brand:'丽拉瓦迪 LILAWADI', rating:'4.8', avgPrice:370,
    dishes:['泰式古法按摩','精油SPA','足部护理','肩颈放松'],
    snippet:'BFC南区地下一层S-B108泰式SPA，泰式古法按摩90分钟招牌，人均约370元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E4%B8%BD%E6%8B%89%E7%93%A6%E8%BF%AA%E6%B3%B0%E5%BC%8FSPA' },
  { frontend:'PonyStar', brand:'PonyStar', rating:'4.3', avgPrice:80,
    dishes:['人宠肖像摄影','宠物互动','萌宠体验','宠物写真'],
    snippet:'BFC南区B2人宠肖像摄影体验馆，宠物友好，适合带毛孩子打卡。',
    url:'https://m.dianping.com/ugcdetail/249651098' },
  { frontend:'陈香贵', brand:'陈香贵·兰州牛肉面', rating:'4.3', avgPrice:32,
    dishes:['牛骨清汤面','陈香贵拌面','钢钎羊肉串','牛杂肉夹馍','杏皮茶'],
    snippet:'BFC北区B2兰州牛肉面，牛骨清汤面与钢钎羊肉串招牌，人均约32元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E9%99%88%E9%A6%99%E8%B4%B5' },
  { frontend:'哥哥的深夜食堂', brand:'哥哥的深夜食堂', rating:'4.2', avgPrice:100,
    dishes:['鹅肝寿司','烤牛舌','梅子茶泡饭','深夜居酒屋小食'],
    snippet:'BFC北区N2栋1F深夜日式食堂，鹅肝寿司与烤牛舌招牌，营业至凌晨。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%93%A5%E5%93%A5%E7%9A%84%E6%B7%B1%E5%A4%9C%E9%A3%9F%E5%A0%82' },
  { frontend:'喜茶', brand:'喜茶 HEYTEA', rating:'4.3', avgPrice:25,
    dishes:['多肉葡萄冻','芝芝莓莓','多肉杨梅','满杯红柚'],
    snippet:'BFC外滩金融中心南区B2新式茶饮，多肉葡萄冻与芝芝莓莓人气高。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%96%9C%E8%8C%B6' },
  { frontend:'Starbucks', brand:'星巴克臻选', rating:'4.3', avgPrice:40,
    dishes:['馥芮白','燕麦拿铁','星冰乐','手冲咖啡'],
    snippet:'BFC外滩臻选门店，临江景观与手冲咖啡体验。',
    url:'https://www.dianping.com/search/keyword/2/0_Starbucks' },
  { frontend:'超级猩猩', brand:'超级猩猩', rating:'4.4', avgPrice:129,
    dishes:['团课','私教','自由训练','燃脂课'],
    snippet:'BFC团课健身品牌，按次预约的便捷健身模式。',
    url:'https://www.dianping.com/search/keyword/2/0_%E8%B6%85%E7%BA%A7%E7%8C%A9%E7%8C%B4' },
  { frontend:'周大福', brand:'周大福', rating:'4.5', avgPrice:3800,
    dishes:['黄金首饰','钻石戒指','婚嫁金饰','翡翠'],
    snippet:'BFC南区B1中华老字号珠宝品牌，黄金与婚嫁金饰齐全。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%91%A8%E5%A4%A7%E7%A6%8F' },
  // ===== 第二轮 WebSearch 逐店核实（BFC 本店数据）=====
  { frontend:'上海滩餐厅', brand:'上海滩餐厅(BFC外滩金融中心店)', rating:'4.9', avgPrice:580,
    dishes:['精品烤鸭','上海熏鱼','文火焖雪花牛肉','糟骨头黑豚肉碎蒸膏蟹'],
    snippet:'黑珍珠一钻餐厅，北区N3幢5层坐拥270°江景；大众点评总评4.91（2320条点评），精品烤鸭需提前预定。',
    url:'https://www.dianping.com/review/404354149' },
  { frontend:'高桌', brand:'高桌牛排馆 Primotable by Jstone(BFC外滩金融中心店)', rating:'4.9', avgPrice:610,
    dishes:['惠灵顿牛排','战斧牛排','炙烤和牛西冷','黑松露蘑菇汤'],
    snippet:'BFC唯一牛排馆，开业首月即大众点评BFC外滩美食人气榜/口味榜/环境榜第一，口味分9.4，人均约¥610。',
    url:'https://s.dianping.com/topic/60251474' },
  { frontend:'晴空', brand:'晴空·日本料理(BFC外滩金融中心店)', rating:'5.0', avgPrice:2111,
    dishes:['蟹肉真丈','涮松茸和牛','柔煮章鱼','松茸和牛釜饭','喉黑鱼九条葱釜饭','金枪鱼牡丹虾刺身'],
    snippet:'深圳日料名店落户外滩，BFC南区4层S405怀石料理，桧木板前仅六席；携程点评5.0分，人均约2111元。',
    url:'https://m.dianping.com/ugcdetail/442042536' },
  { frontend:'丝域养发', brand:'丝域养发(BFC外滩金融中心店)', rating:null, avgPrice:300,
    dishes:['头部护理','头皮检测','珍珠养发','双胶原护理'],
    snippet:'BFC外滩金融中心F3专业养发馆，先做头皮检测再选项目，购物中心正规门店单次约90-200元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E4%B8%9D%E5%9F%9F%E5%85%BB%E5%8F%91' },
  { frontend:'么蛮', brand:'么蛮 POKE POKE(BFC外滩金融中心店)', rating:'4.3', avgPrice:58,
    dishes:['招牌波奇饭','招牌海鲜面','夏威夷牛肉饭','鱼籽波奇','三文鱼头'],
    snippet:'BFC外滩金融中心店(中山东二路558号)美式波奇饭，点评口味8.6/环境8.6/服务8.8，人均约58元。',
    url:'https://www.dianping.com/review/483816660' },
  { frontend:'火星宠物超市', brand:'火星宠物超市 MARSMART(BFC概念店)', rating:null, avgPrice:null,
    dishes:['宠物用品集合','宠物玩具','宠物鲜食','日常用品'],
    snippet:'BFC北区B1大型宠物集合店，特别概念店引入7个头部宠物用品品牌，玩具约40-90元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E7%81%AB%E6%98%9F%E5%AE%A0%E7%89%A9%E8%B6%85%E5%B8%82' },
  { frontend:'AirPark', brand:'AIRPARK 人类友好公园(BFC店)', rating:null, avgPrice:null,
    dishes:['宠物活动草坪','洗护美容','宠物鲜食','狗狗礼服'],
    snippet:'全国首家室内人宠共生公园，BFC北区B1约500平，狗狗公厕+咖啡区+洗护美容一站搞定。',
    url:'https://www.dianping.com/search/keyword/2/0_AIRPARK%E4%BA%BA%E7%B1%BB%E5%8F%8B%E5%A5%BD%E5%85%AC%E5%9B%AD' },
  { frontend:'沄南云海肴', brand:'沄南云海肴·云南菜(外滩店)', rating:null, avgPrice:80,
    dishes:['经典汽锅鸡','菠萝饭','老奶洋芋','小锅米线','黑三剁'],
    snippet:'云南菜名店外滩店，紫陶汽锅鸡与菠萝饭招牌，人均约80元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E4%BA%91%E6%B5%B7%E7%91%B3' },
  { frontend:'林里柠檬茶', brand:'LINLEE林里·手打柠檬茶(BFC店)', rating:'4.8', avgPrice:19,
    dishes:['招牌手打柠檬茶','单丛鸭屎香柠檬茶','泰绿柠檬茶','五窲茉莉柠檬茶'],
    snippet:'鲜切现锤广东香水柠檬茶，品牌评分4.8，人均约19元。',
    url:'https://www.dianping.com/search/keyword/2/0_LINLEE%E6%9E%97%E9%87%8C' },
  { frontend:'茶姬', brand:'霸王茶姬 CHAGEE(BFC外滩金融中心店)', rating:'4.8', avgPrice:19,
    dishes:['伯牙绝弦','桂馥兰香','武夷大红袍','花田乌龙'],
    snippet:'国风茶饮，CHAGEE茶姬现萃BFC北区B2店，伯牙绝弦招牌，人均约18-20元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E9%9C%B8%E7%8E%8B%E8%8C%B6%E5%A7%AC' },
  { frontend:'九木杂物社', brand:'九木杂物社(BFC店)', rating:null, avgPrice:null,
    dishes:['文创文具','罐头猪LuLu联名','jELLYCAT萌物','手账贴纸'],
    snippet:'晨光旗下文创杂货集合店，BFC北区B2，LuLu联名杜邦纸包与jELLYCAT人气高。',
    url:'https://www.dianping.com/search/keyword/2/0_%E4%B9%9D%E6%9C%A8%E6%9D%82%E7%89%A9%E7%A4%BE' },
  { frontend:'炙焰炉子炉馆', brand:'炙焰炉子炉馆(BFC外滩金融中心店)', rating:null, avgPrice:77,
    dishes:['炉子烤肉','铁板料理','明火烤炉'],
    snippet:'明火烤炉创意料理，人均约77元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E7%82%99%E7%84%B0%E7%82%89%E5%AD%90%E7%82%89%E9%A6%86' },
  { frontend:'麦当劳', brand:'麦当劳(外滩BFC店)', rating:'4.4', avgPrice:34,
    dishes:['双层吉士汉堡','麦辣鸡腿堡','那么大鸡排','甜筒新地'],
    snippet:'BFC南区B1外滩BFC餐厅，综合评分4.4，人均约34元，工作日"穷鬼套餐"人气高。',
    url:'https://m.dianping.com/ugcdetail/414073161' },
  { frontend:'SUBWAY', brand:'赛百味SUBWAY(BFC外滩金融中心店)', rating:null, avgPrice:31,
    dishes:['金枪鱼三明治','意大利香肠三明治','烤牛肉卷饼','现烤曲奇'],
    snippet:'BFC西式快餐，三明治现做现烤DIY搭配，外滩店人均约31元。',
    url:'https://www.dianping.com/search/keyword/2/0_%E8%B5%9B%E7%99%BE%E5%91%B3' },
  { frontend:'MOMODA', brand:'Momoda宝宝戏剧(BFC店)', rating:null, avgPrice:430,
    dishes:['宝宝戏剧','亲子互动剧','感官启蒙','演出工作坊'],
    snippet:'BFC南区3层S321，国内原创0-3岁全感开发沉浸式婴幼儿戏剧，单次票价约430元。',
    url:'https://www.dianping.com/search/keyword/2/0_Momoda%E5%AE%9D%E5%AE%9D%E6%88%8F%E5%89%A7' },
  { frontend:'华为', brand:'华为授权体验店(BFC外滩金融中心)', rating:null, avgPrice:null,
    dishes:['手机','平板','智能穿戴','智慧屏','全屋智能'],
    snippet:'BFC南区1层S119B，营业10:00-22:00，Pura系列新品首发与鸿蒙全场景体验。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%8D%8E%E4%B8%BA%E6%8E%88%E6%9D%83%E4%BD%93%E9%AA%8C%E5%BA%97' },
  { frontend:'b3 Coffee', brand:'b³咖啡 B3COFFEE(BFC店)', rating:null, avgPrice:null,
    dishes:['一豆三吃','瑰夏拿铁','生椰拿铁','瑰夏冷萃'],
    snippet:'BFC南区1F瑰夏专门店，哥伦比亚蕙兰SOE，咖啡+gelato"一豆三吃"。',
    url:'https://www.dianping.com/search/keyword/2/0_b3%E5%92%96%E5%95%A1' },
  { frontend:'ON/OFF', brand:'ON/OFF(BFC店)', rating:null, avgPrice:null,
    dishes:['潮流服饰','设计师品牌','时尚配饰'],
    snippet:'BFC南区2F潮流集合空间，时髦调性与日常趣味兼具。',
    url:'https://www.dianping.com/search/keyword/2/0_ON%2FOFF' },
  { frontend:'美妆灵感空间', brand:'aaddd美妆灵感空间(BFC店)', rating:null, avgPrice:null,
    dishes:['美妆护肤','香氛蜡烛','香薰礼盒'],
    snippet:'BFC南区B1美妆灵感空间，aaddd香氛与彩妆，逛街顺路补妆灵感。',
    url:'https://www.dianping.com/search/keyword/2/0_%E7%BE%8E%E5%A6%86%E7%81%B5%E6%84%9F%E7%A9%BA%E9%97%B4' },
  { frontend:'梅赛德斯-迈巴赫', brand:'梅赛德斯-迈巴赫·礼境城市品牌中心(BFC)', rating:null, avgPrice:null,
    dishes:['车型品鉴','MANUFAKTUR匠心高定','礼境顾问服务'],
    snippet:'全球首座迈巴赫礼境城市品牌中心，BFC外滩金融中心558号，541平私享沙龙与数字化体验。',
    url:'https://www.dianping.com/search/keyword/2/0_%E8%BF%88%E5%B7%B4%E8%B5%AB' },
  { frontend:'BFC FITNESS健身会馆', brand:'BFC FITNESS(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['器械健身','团课','拳击燃脂课','25米泳池','桑拿蒸汽'],
    snippet:'BFC S1栋5楼健身会馆，25米泳池+180度观景按摩池，营业7:00-22:00。',
    url:'https://m.dianping.com/ugcdetail/285676632' },
  { frontend:'陆家居', brand:'LULACASA陆家居(BFC全球展示中心)', rating:null, avgPrice:null,
    dishes:['意式定制家具','豪宅整装','欧洲家居名品'],
    snippet:'维迈科建旗下意式高定家居品牌，BFC全球展示中心，一站式家居消费体验。',
    url:'https://www.dianping.com/search/keyword/2/0_%E9%99%86%E5%AE%B6%E5%B1%85' },
  { frontend:'GALAXY AUTO STUDIO', brand:'GALAXY AUTO STUDIO(BFC店)', rating:null, avgPrice:null,
    dishes:['车型展示','试驾体验','汽车周边','创意生活用品'],
    snippet:'汽车品牌创意体验空间，车型展示与试驾，兼售创意生活用品。',
    url:'https://www.dianping.com/search/keyword/2/0_GALAXY%20AUTO%20STUDIO' },
  { frontend:'PET MART', brand:'阿飞和巴弟PET MART(BFC店)', rating:null, avgPrice:null,
    dishes:['迪士尼主题宠物食品','宠物用品','宠物零食'],
    snippet:'BFC北区B1人宠友好专区，全国首家沉浸式迪士尼主题宠物产品零售店。',
    url:'https://www.dianping.com/search/keyword/2/0_%E9%98%BF%E9%A3%9E%E5%92%8C%E5%B7%B4%E5%BC%9F' },
  { frontend:'CLAWGALLERY', brand:'卡洛CLAWGALLERY(BFC店)', rating:null, avgPrice:null,
    dishes:['宠物写真','人宠摄影','影像定制'],
    snippet:'BFC北区B1宠物摄影空间，用镜头捕捉毛孩子的亲情故事，预约摄影套系享8折。',
    url:'https://www.dianping.com/search/keyword/2/0_%E5%8D%A1%E6%B4%9BCLAWGALLERY' },
  { frontend:'OUTCICS', brand:'OUTCiRCS(BFC店)', rating:null, avgPrice:null,
    dishes:['极简风尚服饰','黑白灰单品','潮流配饰'],
    snippet:'BFC南区2F，玩转日常趣味与态度的时髦买手店，极简风黑白灰高级配色。',
    url:'https://www.dianping.com/search/keyword/2/0_OUTCiRCS' },
  // ===== 第三轮：奢侈品/潮牌门店（BFC 官方活动+店铺页核实）=====
  { frontend:'Versace', brand:'VERSACE范思哲(BFC外滩金融中心店)', rating:'4.0', avgPrice:null,
    dishes:['女装成衣','男装成衣','皮具配饰','墨镜'],
    snippet:'意大利奢侈品牌直营店，BFC南区一层S101（中山东二路588号），营业10:00-22:00，携程点评4.0分。',
    url:'https://www.dianping.com/search/keyword/2/0_Versace' },
  { frontend:'Lanvin', brand:'LANVIN 浪凡(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['猫包手袋','手拿包','羊毛围巾','腰带耳饰'],
    snippet:'法国高定时装品牌亚洲旗舰店，BFC南区1F，经典猫包与配饰，折扣季低至5折起。',
    url:'https://www.dianping.com/search/keyword/2/0_LANVIN' },
  { frontend:'BALLY', brand:'BALLY(BFC外滩店)', rating:'4.5', avgPrice:null,
    dishes:['皮包','皮鞋','皮带','双肩包'],
    snippet:'瑞士皮具品牌BFC南区1F，大众点评4.5分，外滩商圈奢侈品好评榜第10名，折扣季低至5折。',
    url:'https://m.dianping.com/shop/751266139' },
  { frontend:'Jimmy Choo', brand:'JIMMY CHOO(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['高跟鞋','平底鞋','手拿包','时尚配饰'],
    snippet:'英国奢侈鞋履品牌，BFC南区1F，经典闪粉高跟鞋与当季新款，折扣季低至5折。',
    url:'https://www.dianping.com/search/keyword/2/0_Jimmy%20Choo' },
  { frontend:'I.T', brand:'I.T(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['潮牌集合','Acne Studios','OPENYY','设计师配饰'],
    snippet:'BFC南区1F潮流集合店，Acne Studios等设计师品牌聚合，折扣季多件6折起、满千返百。',
    url:'https://www.dianping.com/search/keyword/2/0/I.T' },
  { frontend:'Alexander Wang', brand:'alexanderwang(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['徽标卫衣','印花短袖','牛仔','水钻配饰'],
    snippet:'纽约潮牌，BFC南区1F，徽标螺纹拉链连帽衫与印花短袖，折扣季6折起。',
    url:'https://www.dianping.com/search/keyword/2/0_alexanderwang' },
  { frontend:'Maison Kitsune', brand:'Maison Kitsuné(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['狐狸Logo针织','学院风开衫','托特包','保暖马甲'],
    snippet:'法日融合品牌，BFC南区1F，狐狸学院风毛衣与泡芙外套，折扣季低至6折。',
    url:'https://www.dianping.com/search/keyword/2/0_Maison%20Kitsun%C3%A9' },
  // ===== 第四轮：核实「是否真搜不到」（Paul Smith/J.Lindeberg/Sir Rudy's/Wolford）=====
  { frontend:'Paul Smith', brand:'Paul Smith(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['印花西装','条纹针织Polo','撞色长裤','绅士配饰'],
    snippet:'中国上海旗舰店，BFC南区1层S103（2024年10月开幕），试衣间走廊贴满6385张复古英国巴士车票。',
    url:'https://www.dianping.com/search/keyword/2/0_Paul%20Smith' },
  { frontend:'J.Lindeberg', brand:'J.LINDEBERG(BFC外滩金融中心店)', rating:'4.7', avgPrice:null,
    dishes:['高尔夫Polo','商务休闲Polo','吸湿速干长裤','休闲短裤'],
    snippet:'瑞典轻奢时尚运动品牌，BFC南区2F，男士高尔夫Polo约¥1290-1390，综合评分4.7。',
    url:'https://www.dianping.com/search/keyword/2/0_J.Lindeberg' },
  { frontend:"Sir Rudy's Pro Shop", brand:"Sir Rudy's Pro Shop(BFC外滩金融中心店)", rating:null, avgPrice:580,
    dishes:['球杆量身定制','高尔夫球具','高尔夫配件'],
    snippet:'BFC南区2F高尔夫专业装备店，球杆量身定制约¥580，送礼自用两相宜。',
    url:'https://www.dianping.com/search/keyword/2/0_Sir%20Rudy%27s%20Pro%20Shop' },
  { frontend:'Wolford', brand:'Wolford(BFC外滩金融中心店)', rating:null, avgPrice:null,
    dishes:['连裤袜','丝袜','连体服','针织内搭'],
    snippet:'奥地利奢侈内衣品牌BFC店，Elisabeth Tights连裤袜（原价¥500）与秋冬内搭、大衣外套。',
    url:'https://www.dianping.com/search/keyword/2/0_Wolford' },
]
const extraMap = Object.fromEntries(extra.map(e => [e.frontend, e]))

// 3) 解析 mockData.ts 的全部 101 个前端店铺
const mock = readFileSync(MOCK, 'utf-8')
const re = /\{\s*id:\s*'([^']+)',\s*name:\s*["']((?:[^'"\\]|\\.)*)["'],\s*category:\s*'([^']+)',\s*floor:\s*'([^']*)',\s*x:\s*\d+,\s*y:\s*\d+,\s*description:\s*["']((?:[^'"\\]|\\.)*)["'],\s*tags:\s*\[([^\]]*)\],\s*rating:\s*([\d.]+),\s*avgPrice:\s*(\d+)/g
const stores = []
let m
while ((m = re.exec(mock))) {
  stores.push({ id:m[1], name:m[2], category:m[3], desc:m[4],     rating:Number(m[7]), avgPrice:Number(m[8]) })
}
// 双引号包名且含单引号的店铺（正则不易匹配），手动补齐
const manualStores = [
  { id:'s013', name:"Sir Rudy's Pro Shop", category:'运动健身', desc:'高尔夫专业装备', rating:4.4, avgPrice:2800 },
  { id:'s044', name:"B'S Brows", category:'美容美发', desc:'专业眉形设计', rating:4.3, avgPrice:180 },
]
for (const s of manualStores) if (!stores.find(x => x.name === s.name)) stores.push(s)

// 4) 真实数据匹配：frontend===name 或 brand===name
const realByKey = {}
for (const r of real) {
  if (r.frontend) realByKey[r.frontend] = r
  if (r.brand) realByKey[r.brand] = r
}

const CATEGORY_DISHES = {
  '精致餐饮':['招牌主菜','精致前菜','主厨推荐','甜点'],
  '国际精品':['当季新品','经典款','限量系列','配饰'],
  '潮流品牌':['当季新款','联名系列','基础百搭','配饰'],
  '运动时尚':['运动服饰','鞋款','训练装备','配饰'],
  '咖啡茶饮':['招牌饮品','季节限定','咖啡/茶','小食'],
  '快餐轻食':['招牌主食','小食','套餐','饮品'],
  '品质中餐':['招牌菜','时令菜','点心','汤品'],
  '网红餐饮':['人气单品','创意菜','甜品','饮品'],
  '茶馆SPA':['原叶茶','茶点','SPA护理','养生套餐'],
  '汽车体验':['车型体验','试驾','专属顾问','周边'],
  '珠宝配饰':['珠宝首饰','腕表','定制款','礼品'],
  '美容美发':['护理项目','发型设计','美甲美睫','套餐'],
  '运动健身':['团课','私教','自由训练','体测'],
  '宠物服务':['宠物用品','洗护SPA','互动体验','零食'],
  '生活方式':['家居好物','香氛','器皿','配饰'],
  '文创杂货':['文创周边','杂货','文具','礼品'],
  '科技数码':['旗舰新品','智能设备','配件','体验'],
  '便利生活':['便当','咖啡','鲜食','日用品'],
}
const searchUrl = (name) => 'https://www.dianping.com/search/keyword/2/0_' + encodeURIComponent(name)

const out = []
const seen = new Set()
const addEntry = (e) => {
  if (seen.has(e.frontend)) return
  seen.add(e.frontend)
  out.push({
    brand: e.brand,
    source: 'dianping',
    rating: e.rating != null ? String(e.rating) : null,
    avgPrice: e.avgPrice != null ? Number(e.avgPrice) : null,
    dishes: Array.isArray(e.dishes) ? e.dishes : [],
    snippet: e.snippet || null,
    url: e.url || null,
    frontend: e.frontend,
  })
}

for (const s of stores) {
  if (extraMap[s.name]) { addEntry({ ...extraMap[s.name], frontend: s.name }); continue }
  const rb = realByKey[s.name]
  if (rb) { addEntry({ brand: rb.brand, rating: rb.rating, avgPrice: rb.avgPrice, dishes: rb.dishes, snippet: rb.snippet, url: rb.url, frontend: s.name }); continue }
  // 兜底：真实品牌名 + 大众点评搜索页 + 品类通用菜品
  addEntry({
    frontend: s.name, brand: s.name, rating: null, avgPrice: null,
    dishes: CATEGORY_DISHES[s.category] || ['门店推荐'],
    snippet: s.desc + '（点击在大众点评查看门店详情、团购与用户评价）',
    url: searchUrl(s.name),
  })
}

// 4.5) 为所有有 frontend 但 url 为空的条目补上「按前端店名的大众点评搜索链接」
for (const e of out) { if (e.frontend && !e.url) e.url = searchUrl(e.frontend) }

// 5) 保留未匹配到前端店铺的真实点评条目（BFC 真实店，frontend 置空，不主动参与匹配但保留数据）
const coveredKeys = new Set([...out.map(o => o.frontend), ...real.map(r => r.frontend).filter(Boolean), ...real.map(r => r.brand).filter(Boolean)])
for (const r of real) {
  const key = r.frontend || r.brand
  if (key && !coveredKeys.has(key)) {
    out.push({ brand:r.brand, source:'dianping', rating:r.rating??null, avgPrice:r.avgPrice??null, dishes:Array.isArray(r.dishes)?r.dishes:[], snippet:r.snippet||null, url:r.url||null, frontend:null })
  }
}

writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf-8')
console.log('WROTE', out.length, 'entries; stores=', stores.length, 'covered-frontends=', out.filter(o=>o.frontend).length)
// 统计：直链数 vs 搜索回退数
const direct = out.filter(o => o.url && o.url.includes('m.dianping.com/shop') || (o.url||'').includes('review') || (o.url||'').includes('discovery') || (o.url||'').includes('ugcdetail') || (o.url||'').includes('shopinfo'))
const fb = out.filter(o => o.url && o.url.includes('/search/keyword/'))
console.log('direct-ish urls:', direct.length, ' search-fallback urls:', fb.length, ' null urls:', out.filter(o=>!o.url).length)
