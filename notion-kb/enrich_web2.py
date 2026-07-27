#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第二批补库: 通过公开网络检索(官网/腾讯地图/新闻攻略/小红书聚合)抓到的 BFC 真实内容,
结构化后灌入 Notion「BFC知识库」下的「网络口碑·探店与活动」分区。
无需登录任何社媒账号, 直接补全知识库。

数据库:
  1) BFC 餐厅详表（营业时间·电话·人均）  — 24 家, 含评分/人均/电话/营业时间/地址
  2) BFC 探店攻略·打卡机位（社媒口碑）    — 12 条, 小红书式打卡/出片/机位
  3) BFC 2026 暑期活动日历                — 12 条, 2026-07~08 真实活动
  4) BFC 品牌购物指南                    — 18 条, 旗舰店/买手店/文创

用法:
  NOTION_TOKEN=xxx PARENT_PAGE_ID=xxx python enrich_web2.py
"""
import os, sys, time, json, urllib.request

TOKEN = os.environ.get("NOTION_TOKEN")
PARENT_PAGE_ID = os.environ.get("PARENT_PAGE_ID")  # BFC知识库 承接页
API = "https://api.notion.com/v1"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

def req(method, path, body=None):
    url = API + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    r = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "ignore")
        print(f"  [HTTP {e.code}] {path}\n  {msg[:300]}")
        if e.code == 429:
            time.sleep(5); return req(method, path, body)
        raise

# ============================================================
# 1) 餐厅详表（营业时间·电话·人均） 来源: 腾讯地图/官网/BFC百科
# ============================================================
RESTAURANTS = [
    dict(name="DA VITTORIO SHANGHAI", cuisine="意大利菜", floor="北区 N3 三楼", score=4.8, avg=0,
         tel="021-63302198", hours="周二至周日 12:00-16:00, 18:00-24:00", addr="中山东二路600号 BFC 外滩金融中心 N3 三楼",
         honor="米其林意餐天花板, 坐瞰陆家嘴天际线", src="腾讯地图"),
    dict(name="新荣记 (BFC外滩金融中心店)", cuisine="浙江菜/荣家菜", floor="北区", score=4.8, avg=0,
         tel="021-63037977", hours="11:30-13:30, 17:30-20:30", addr="中山东二路与枫泾路交叉口",
         honor="米其林品牌, 台州起家", src="腾讯地图"),
    dict(name="菁禧荟 (外滩店)", cuisine="潮汕菜/粤菜", floor="南区 4F F4-S401", score=4.8, avg=856,
         tel="021-62677177", hours="11:00-14:00, 17:00-21:30", addr="中山东二路600号 BFC 南区4层",
         honor="米其林一星 / 黑珍珠三钻, 招牌牛杂面", src="腾讯地图"),
    dict(name="遇外滩 (BFC外滩金融中心店)", cuisine="福建菜", floor="南区 3F F3-S301", score=4.8, avg=0,
         tel="021-63777668", hours="11:30-14:00, 17:30-21:00", addr="中山东二路600号 BFC 南区3层",
         honor="米其林一星 / 黑珍珠, 香酥芋枣", src="腾讯地图"),
    dict(name="Primotable 高桌牛排馆 (外滩店)", cuisine="西餐/牛排", floor="南区 4F F4-S404", score=4.8, avg=572,
         tel="021-63057157", hours="11:30-14:00, 17:00-22:00", addr="中山东二路600号 BFC 南区4层",
         honor="庄重浪漫氛围, 情侣约会", src="腾讯地图"),
    dict(name="莆田餐厅 PUTIEN (BFC外滩金融中心店)", cuisine="福建菜", floor="南区 B2 B210-211", score=4.6, avg=131,
         tel="021-53830335", hours="11:00-15:30, 16:30-21:00", addr="中山东二路600号 BFC 南区B2",
         honor="平价闽菜, 芋香鸭", src="腾讯地图"),
    dict(name="泰珍荟 Siam Memory (BFC店)", cuisine="泰国菜", floor="南区 4F S413A", score=4.8, avg=273,
         tel="021-63309686", hours="11:00-14:00, 17:00-21:00", addr="中山东二路600号 BFC 南区4层",
         honor="玻璃房+露台, 南洋氛围", src="腾讯地图"),
    dict(name="橘焱胡同烧肉夜食 (BFC店)", cuisine="日式烧肉", floor="北区 N2幢 1F", score=4.6, avg=188,
         tel="021-64065647", hours="11:30-13:30, 17:30-21:30", addr="中山东二路558号2幢102室",
         honor="和牛拼盘/胡同蟹堡, 夜宵", src="腾讯地图"),
    dict(name="上海滩餐厅 (BFC外滩金融中心店)", cuisine="上海菜", floor="5F层", score=4.8, avg=0,
         tel="021-63787777", hours="11:00-14:00, 17:00-21:00", addr="中山东二路600号 BFC 5F",
         honor="海派环境+外滩夜景", src="腾讯地图"),
    dict(name="清晨家烤肉 (BFC外滩金融中心店)", cuisine="韩国料理", floor="南区 4F S413b", score=4.8, avg=229,
         tel="18121214336", hours="周一至五 11:00-14:00,17:00-21:00; 周末 11:00-14:30,17:00-21:00", addr="中山东二路600号 BFC 南区4层",
         honor="温馨烤肉氛围", src="腾讯地图"),
    dict(name="沧南云海·云南菜 (外滩店)", cuisine="云贵菜", floor="北区 B1 B135", score=4.3, avg=87,
         tel="13122692279", hours="11:00-16:00, 17:00-21:30", addr="中山东二路600号 BFC 北区B1",
         honor="蒙自过桥米线料多味正, 平价", src="腾讯地图"),
    dict(name="三利音·东方司宴 (外滩店)", cuisine="粤菜", floor="外滩三楼", score=4.8, avg=398,
         tel="021-63357838", hours="11:00-13:30, 17:00-21:00", addr="中山东二路585号外滩3楼",
         honor="高端粤菜, 装修大气", src="腾讯地图"),
    dict(name="RIVIERA 松鹤楼 (外滩店)", cuisine="苏帮菜/本帮", floor="中山东二路505号 2F", score=4.8, avg=523,
         tel="021-33313777", hours="11:30-13:30, 17:00-21:00", addr="中山东二路505号2F",
         honor="招牌松鼠桂鱼每桌必点", src="腾讯地图"),
    dict(name="柴门荟 (BFC外滩店)", cuisine="川菜", floor="北区 N3幢 2F", score=4.8, avg=0,
         tel="021-63306690", hours="11:00-14:00, 17:00-21:00", addr="中山东二路558号 BFC 2层",
         honor="米其林川菜, 非遗传承人创立", src="腾讯地图"),
    dict(name="白茸·米其林指南入选餐厅 (BFC店)", cuisine="鲁菜/胶东海鲜", floor="北区 N2幢 1F 104a", score=4.8, avg=411,
         tel="021-52798975", hours="11:00-14:30, 17:00-21:30", addr="中山东二路558号 BFC 北区2幢1楼104a",
         honor="入选米其林指南, 近50道时鲜", src="腾讯地图"),
    dict(name="哥哥の深夜食堂 (外滩BFC黑金店)", cuisine="日本料理", floor="北区 N2幢 1F 101A", score=4.6, avg=142,
         tel="17521682558", hours="周二至日 17:00-02:00; 周一 17:00-01:00", addr="中山东二路558号 BFC 北区2幢1层101室A",
         honor="深夜食堂, 浪花寿司", src="腾讯地图"),
    dict(name="晴空·日本料理 (BFC外滩金融中心店)", cuisine="日本料理", floor="南区 4F F4-S405", score=4.8, avg=0,
         tel="17510450550", hours="12:00-14:00, 18:00-22:00", addr="中山东二路600号 BFC 南区4层",
         honor="日料, 环境雅致", src="腾讯地图"),
    dict(name="鮨吉月", cuisine="日本料理/寿司", floor="北区 瑞吉酒店后门 1F 104B", score=4.8, avg=880,
         tel="", hours="12:00-14:00, 17:30-19:30, 20:00-22:00", addr="中山东二路538号1层104B",
         honor="高端寿司, 人均880", src="腾讯地图"),
    dict(name="一藏 IZAKAYA (BFC店)", cuisine="日本料理", floor="南区 B2 S-B212", score=4.6, avg=150,
         tel="021-63670007", hours="11:00-14:00, 17:00-22:00", addr="中山东二路600号 BFC 南区B2",
         honor="居酒屋, 浪花寿司", src="腾讯地图"),
    dict(name="老吉堂上海本帮菜 (上海店)", cuisine="上海菜", floor="中山东二路588号 4F S415", score=4.8, avg=206,
         tel="021-63731303", hours="", addr="中山东二路588号四层S415",
         honor="本帮菜, 友人小聚/家庭聚餐", src="腾讯地图"),
    dict(name="蝶园 (BFC外滩店)", cuisine="浙江菜", floor="南区 4F S414", score=4.6, avg=247,
         tel="021-53837338", hours="10:00-22:00", addr="中山东二路588号 BFC 南区4楼S414",
         honor="就餐环境优雅, 菜品新鲜", src="腾讯地图"),
    dict(name="沼田双天妇罗", cuisine="日本料理/天妇罗", floor="北区 N1幢 1F 107a", score=4.8, avg=1591,
         tel="", hours="周二至日 12:00-14:00, 18:30-22:30", addr="中山东二路558号 BFC 北区N1幢1楼107a",
         honor="高端天妇罗, 人均1591", src="腾讯地图"),
    dict(name="甜绿新集 GreenBazar (BFC店)", cuisine="西餐/轻食", floor="南区 B105H", score=4.5, avg=72,
         tel="021-61929598", hours="11:00-21:00", addr="中山东二路600号 BFC 南区B105H",
         honor="小清新风格轻食, 平价", src="腾讯地图"),
    dict(name="叙夏 中式糖水 (外滩店)", cuisine="糖水/甜品", floor="南区 3F", score=0, avg=0,
         tel="", hours="11:00-21:30", addr="中山东二路600号 BFC 南区3楼",
         honor="古风雅致+庭院, 安静出片, 与黄油小熊联名", src="小红书聚合"),
]

# ============================================================
# 2) 探店攻略·打卡机位（社媒口碑） 来源: 小红书/携程/网易攻略聚合
# ============================================================
GUIDES = [
    dict(title="外滩 5F 心动露台", typ="打卡机位", place="南区 5F",
         content="BFC 南区 5F 露台是拍陆家嘴三件套+浦江夜景的绝佳机位, 蓝调时刻/圣诞灯光秀出片率极高, 也是黄油小熊冰淇淋车与面包配送站巨型装置所在地。", src="小红书/携程攻略"),
    dict(title="米菲 Miffy 主题店（70周年全国首站）", typ="IP打卡", place="南区 B2",
         content="全国首个 miffy café 限时主题店, BFC 曾化身米菲痛城, 随处可见米菲装置与限定周边, 治愈系拍照必去。", src="BFC官网/小红书"),
    dict(title="复星艺术中心 流苏帘幕", typ="艺术打卡", place="BFC 1F",
         content="由 Foster+Partners 与 Heatherwick Studio 设计, 全球首创三层可移动『流苏』帘幕每日定时配合音乐转动, 建筑本身即展品。", src="BFC百科/官网"),
    dict(title="叙夏中式糖水", typ="美食出片", place="南区 3F",
         content="室内古风雅致+室外自带庭院, 安静又出片, 营业 11:00-21:30, 夏日与黄油小熊联名主题糖水。", src="小红书"),
    dict(title="外滩枫泾路 / 外滩枫径", typ="市集打卡", place="枫泾路",
         content="BFC 知名 IP 周末市集『外滩枫径』, 叠加黄油小熊装置与泰国泼水节, 全年节庆游乐场氛围。", src="BFC官网/小红书"),
    dict(title="Light & Salt Daily", typ="下午茶", place="南区 1F",
         content="圣诞限定下午茶超上镜, 临江景观位适合闺蜜小聚打卡。", src="携程攻略"),
    dict(title="黄油小熊烘焙工坊（上海首展）", typ="IP打卡", place="南区大中庭+5F露台",
         content="32 只黄油小熊装置空降, 甜甜圈报到处+主题沉浸式电梯+五楼露台面包配送站, 至 8/16, 软萌治愈打卡宇宙。", src="上观新闻/小红书"),
    dict(title="北外滩/外滩源江边夜景", typ="夜景机位", place="江边步道",
         content="黄昏到蓝调时段是最佳拍摄窗口, 可同时收外滩万国建筑群与陆家嘴天际线。", src="小红书"),
    dict(title="BFC 文创里", typ="逛街文创", place="北区 B1/B2",
         content="汇集 50 余家原创设计店铺、超 100 个品牌, 融文化/创意/生活美学, B1 展演空间常有艺文活动。", src="BFC百科"),
    dict(title="ON/OFF 买手集合店", typ="购物打卡", place="南区 2F",
         content="精选近 60 个中国设计师品牌(服装/首饰/配件/鞋包/生活方式), 潮流打卡+淘独特单品。", src="BFC百科"),
    dict(title="外滩圣诞树灯光秀", typ="节日打卡", place="枫泾路天桥",
         content="16 米圣诞树每晚 6 点亮灯, 站枫泾路天桥拍照角度最佳; 同期红书美妆限定展+圣诞市集。", src="携程攻略"),
    dict(title="红书美妆限定展", typ="美妆打卡", place="北区 1F 中庭",
         content="粉色展台聚集各大美妆圣诞限定, 可试色+礼物盲盒交换, 魔都女孩圣诞打卡 list。", src="携程攻略"),
]

# ============================================================
# 3) 2026 暑期活动日历  来源: 上观新闻/文汇/本地宝/新浪官博(2026-07 真实)
# ============================================================
EVENTS = [
    dict(name="漫游奇境嘉年华", when="2026-07 至 08", place="BFC 全馆",
         desc="暑期主IP活动: 黄油小熊上海首展+1000㎡外滩夏日水世界+外滩音乐季, 全天候夏日奇遇。", src="上观新闻"),
    dict(name="黄油小熊烘焙工坊·上海首展", when="即日起至 2026-08-16", place="南区大中庭",
         desc="50+ 款全新烘焙系列首发, 甜甜圈报到处+主题电梯+五楼露台冰淇淋车; 与『叙夏』联名全国首个黄油小熊主题糖水店。", src="上观新闻"),
    dict(name="黄油小熊见面会", when="2026-07-05 / 07-31 / 08-01", place="BFC",
         desc="黄油小熊姐姐 Bianca 首次惊喜亮相, 暑期多场近距离互动。", src="上观新闻"),
    dict(name="外滩夏日水世界", when="2026 暑期", place="北广场",
         desc="1000㎡ 沉浸式水乐园回归, 新增 3 岁以下低龄泡泡浅水池, 含热血闯关区/戏水区/成人专场/水上微醺夜。", src="文汇/上观"),
    dict(name="外滩音乐季", when="2026-07 至 08 周末", place="5F 江景露台",
         desc="集结 10+ 顶尖音乐厂牌、30+ DJ(Lost&Chill/ASYLUM/OVERDRIVE 等), House/HardTechno 多元风格; TZHouse 与 MadHouse 音乐空间同期入驻。", src="文汇"),
    dict(name="泰文化周·外滩首届泰国文化月", when="2026-07-25~26 / 08-01~02", place="枫泾路",
         desc="升级版『马路泼水节』, 每日 15:00 起(周六至午夜), 20+ 泰领馆推荐纯正泰式商家, 芒果饭/斑斓甜点/泰拳/手作。", src="文汇"),
    dict(name="复星艺术中心『为真实的世界设计』展", when="2026-07-04 至 08-22", place="复星艺术中心",
         desc="可持续发展目标 10 周年特展, 汇集全球 17 国 100 个聚焦可持续发展的创新案例。", src="本地宝"),
    dict(name="沉浸式金鱼剧场", when="2026 暑期", place="外滩 BFC",
         desc="国风沉浸式文旅新地标, 上千尾珍稀金鱼+数字光影+『化身游鱼』第一视角动线, 活态《金鱼谱》。", src="文汇"),
    dict(name="黄油小熊×外滩甜品集", when="2026-07-04 至 07-12 周末", place="BFC",
         desc="汇聚 50+ 国内外甜品品牌, 特设黄油小熊主题专区, 沉浸式 IP 烟火市集。", src="上观新闻"),
    dict(name="西施佳雅 Sassicaia 亚洲首座主题餐厅", when="2026 新开", place="BFC",
         desc="『意大利酒王』亚洲首座主题餐厅, 意式生活美学+轻奢餐饮+专业侍酒品鉴。", src="文汇"),
    dict(name="TZHouse & MadHouse 音乐空间入驻", when="2026 暑期", place="BFC",
         desc="沪上知名现场音乐品牌 TZHouse 与电子音乐空间 MadHouse 入驻, 与露台音乐季交相辉映。", src="文汇"),
    dict(name="大豫园夏日奇幻夜", when="2026-07-03 至 08-23", place="大豫园+BFC",
         desc="跨次元夜游: 豫园『时光代理人』痛街+AR 打卡+焕彩灯光秀, 与 BFC 泰式泼水/水世界联动激活夜经济。", src="文汇"),
]

# ============================================================
# 4) 品牌购物指南  来源: BFC官网/黄浦政府/腾讯新闻/百度百科
# ============================================================
BRANDS = [
    dict(name="LANVIN", cat="时装", floor="南区", feat="亚洲旗舰店, BFC 开业首店业态之一", src="BFC官网/黄浦政府"),
    dict(name="京都之家", cat="家居/文创", floor="南区", feat="全球首店, 日式美学家居", src="黄浦政府"),
    dict(name="Paul Smith", cat="设计师时装", floor="南区", feat="英伦彩色条纹设计品牌", src="BFC官网"),
    dict(name="VERSACE", cat="奢侈时装", floor="南区", feat="范思哲奢侈品牌入驻", src="BFC官网"),
    dict(name="alexanderwang", cat="高街潮流", floor="南区", feat="华裔设计师高街潮牌", src="BFC官网"),
    dict(name="Jimmy Choo", cat="鞋履", floor="南区", feat="奢华鞋履品牌", src="BFC官网"),
    dict(name="BALLY", cat="皮具", floor="南区", feat="瑞士皮具世家", src="BFC官网"),
    dict(name="Maison Kitsuné", cat="时装", floor="南区", feat="法日混血潮流品牌", src="BFC官网"),
    dict(name="I.T", cat="时装集合", floor="南区", feat="多品牌时装集合店", src="BFC官网"),
    dict(name="ON/OFF 买手集合店", cat="买手店", floor="南区 2F", feat="精选近 60 个中国设计师品牌(服装/首饰/配件/鞋包/生活方式)", src="BFC百科"),
    dict(name="BFC 文创里", cat="文创集合", floor="北区 B1/B2", feat="50 余家原创设计店铺、超 100 个品牌, 文化+创意+生活美学", src="BFC百科"),
    dict(name="The Atelier", cat="婚纱礼服", floor="南区", feat="中国首家旗舰店(继伦敦/吉隆坡后第三家), 含独有珠宝配饰区+The Bridal 新娘系列", src="腾讯新闻"),
    dict(name="Moon and Back", cat="创意餐饮", floor="南区", feat="上海首店, 墨尔本创意融合菜+国际鸡尾酒, 原创无预制", src="腾讯新闻"),
    dict(name="陶溪川", cat="艺术陶瓷", floor="南区", feat="上海首店, 艺术陶瓷+文创好物, 龙珠阁/陶溪川文创系列", src="腾讯新闻"),
    dict(name="LA PRAIRIE", cat="护肤", floor="南区", feat="瑞士奢华护肤沙龙", src="BFC官网"),
    dict(name="AHAVA", cat="护肤", floor="南区", feat="死海矿物护肤", src="BFC官网"),
    dict(name="小米之家 (外滩 BFC 店)", cat="数码家电", floor="南区 B218", feat="小米官方专卖, 评分4.6", src="腾讯地图"),
    dict(name="SANKI 叁贵 (上海旗舰店)", cat="体育户外", floor="南区 2F S212", feat="运动户外旗舰店, 评分4.2", src="腾讯地图"),
]


def create_section_parent():
    body = {
        "parent": {"type": "page_id", "page_id": PARENT_PAGE_ID},
        "properties": {"title": {"title": [{"text": {"content": "网络口碑 · 探店与活动（社媒/官网采集）"}}]}},
        "children": [
            {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [
                {"type": "text", "text": {"content": "本分区由 smart-shopping-guide 通过公开网络检索(官网/腾讯地图/新闻攻略/小红书聚合)采集整理, 无需登录社媒账号。覆盖 BFC 外滩金融中心的餐厅详表(含营业时间/电话/人均)、探店打卡攻略、2026 暑期真实活动、品牌购物指南, 供 AI 导购助手检索调用。"}}]}},
            {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "数据说明"}}]}},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "评分/人均/电话/营业时间来自腾讯地图公开数据与官网, 仅供参考, 以门店实时为准。"}}]}},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "活动日期为 2026 暑期公开报道, 具体以 BFC 官方公告为准。"}}]}},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "如需社媒评论级声量(小红书/抖音/微博用户原评), 仍可用 MediaCrawler 在你本机登录后爬取, 再行归一化灌库。"}}]}},
        ],
    }
    page = req("POST", "/pages", body)
    print(f"[OK] 分区父页面已建: {page['id']}")
    return page["id"]


def build_db(parent_id, title, props):
    body = {
        "parent": {"type": "page_id", "page_id": parent_id},
        "title": [{"type": "text", "text": {"content": title}}],
        "properties": props,
    }
    db = req("POST", "/databases", body)
    print(f"[OK] 数据库已建: {db['id']}  ({title})")
    return db["id"]


def rt(content):
    return {"rich_text": [{"text": {"content": content}}]} if content else {"rich_text": []}


def insert_rows(db_id, rows):
    ok = 0
    for props in rows:
        req("POST", "/pages", {"parent": {"type": "database_id", "database_id": db_id}, "properties": props})
        ok += 1
        if ok % 8 == 0:
            print(f"  ...已写入 {ok}")
        time.sleep(0.35)
    print(f"[OK] 本库写入 {ok} 条")


def main():
    if not TOKEN or not PARENT_PAGE_ID:
        print("缺少 NOTION_TOKEN 或 PARENT_PAGE_ID"); sys.exit(1)

    parent = create_section_parent()

    # DB1 餐厅详表
    p1 = {
        "名称": {"title": {}},
        "菜系": {"rich_text": {}},
        "楼层": {"rich_text": {}},
        "评分": {"number": {"format": "number"}},
        "人均(¥)": {"number": {"format": "number"}},
        "电话": {"rich_text": {}},
        "营业时间": {"rich_text": {}},
        "地址": {"rich_text": {}},
        "荣誉/特色": {"rich_text": {}},
        "来源": {"rich_text": {}},
    }
    db1 = build_db(parent, "BFC 餐厅详表（营业时间·电话·人均）", p1)
    r1 = []
    for e in RESTAURANTS:
        pr = {
            "名称": {"title": [{"text": {"content": e["name"]}}]},
            "菜系": rt(e["cuisine"]),
            "楼层": rt(e["floor"]),
            "电话": rt(e["tel"]),
            "营业时间": rt(e["hours"]),
            "地址": rt(e["addr"]),
            "荣誉/特色": rt(e["honor"]),
            "来源": rt(e["src"]),
        }
        if e["score"] > 0: pr["评分"] = {"number": e["score"]}
        if e["avg"] > 0: pr["人均(¥)"] = {"number": e["avg"]}
        r1.append(pr)
    insert_rows(db1, r1)

    # DB2 探店攻略
    p2 = {
        "标题": {"title": {}},
        "类型": {"rich_text": {}},
        "关联地点": {"rich_text": {}},
        "内容": {"rich_text": {}},
        "来源": {"rich_text": {}},
    }
    db2 = build_db(parent, "BFC 探店攻略·打卡机位（社媒口碑）", p2)
    r2 = [{
        "标题": {"title": [{"text": {"content": e["title"]}}]},
        "类型": rt(e["typ"]),
        "关联地点": rt(e["place"]),
        "内容": rt(e["content"]),
        "来源": rt(e["src"]),
    } for e in GUIDES]
    insert_rows(db2, r2)

    # DB3 活动日历
    p3 = {
        "名称": {"title": {}},
        "时间": {"rich_text": {}},
        "地点": {"rich_text": {}},
        "简介": {"rich_text": {}},
        "来源": {"rich_text": {}},
    }
    db3 = build_db(parent, "BFC 2026 暑期活动日历", p3)
    r3 = [{
        "名称": {"title": [{"text": {"content": e["name"]}}]},
        "时间": rt(e["when"]),
        "地点": rt(e["place"]),
        "简介": rt(e["desc"]),
        "来源": rt(e["src"]),
    } for e in EVENTS]
    insert_rows(db3, r3)

    # DB4 品牌购物
    p4 = {
        "品牌": {"title": {}},
        "品类": {"rich_text": {}},
        "楼层": {"rich_text": {}},
        "特色": {"rich_text": {}},
        "来源": {"rich_text": {}},
    }
    db4 = build_db(parent, "BFC 品牌购物指南", p4)
    r4 = [{
        "品牌": {"title": [{"text": {"content": e["name"]}}]},
        "品类": rt(e["cat"]),
        "楼层": rt(e["floor"]),
        "特色": rt(e["feat"]),
        "来源": rt(e["src"]),
    } for e in BRANDS]
    insert_rows(db4, r4)

    print("\n✅ 第二批补库完成!")
    print(f"分区父页面ID: {parent}")
    print(f"餐厅库: {db1} | 攻略库: {db2} | 活动库: {db3} | 品牌库: {db4}")


if __name__ == "__main__":
    main()
