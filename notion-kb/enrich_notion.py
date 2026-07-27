#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把通过公开搜索(官网/腾讯地图/新闻攻略)抓到的 BFC 真实内容,
结构化后灌入 Notion「BFC知识库」下的「公开内容 · 攻略与推荐」库。
无需登录任何社媒账号, 直接补全知识库。

用法:
  NOTION_TOKEN=xxx PARENT_PAGE_ID=xxx python enrich_notion.py
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

# ------------------------- 结构化内容(来自公开搜索) -------------------------
# 类别: 美食餐厅 / 艺术展览 / 购物品牌 / 宠物友好 / 打卡机位 / 夜生活
ENTRIES = [
    # ===== 美食餐厅(腾讯地图 + 官网 + 夜行指南) =====
    dict(name="DA VITTORIO SHANGHAI", cat="美食餐厅", loc="北区 N3 三楼", score=4.8, avg=0,
         tel="021-63302198", why="米其林意大利餐厅, 重视客户反馈与体验, 临江景", src="腾讯地图/BFC官网", url="https://www.bfcsh.com", tags=["米其林","意大利菜","江景"]),
    dict(name="新荣记 (BFC外滩金融中心店)", cat="美食餐厅", loc="北区 N3 3F", score=4.8, avg=0,
         tel="021-63037977", why="台州起家米其林品牌, 荣家菜系中餐天花板, 深夜酒鬼套餐", src="腾讯地图/夜行指南", url="https://www.bfcsh.com", tags=["米其林","浙江菜","夜宵"]),
    dict(name="菁禧荟 (外滩店)", cat="美食餐厅", loc="F4-S401", score=4.8, avg=856,
         tel="021-62677177", why="高端粤菜, 招牌牛杂面好评", src="腾讯地图", url="https://www.bfcsh.com", tags=["粤菜","高人均"]),
    dict(name="遇外滩 (BFC外滩金融中心店)", cat="美食餐厅", loc="F3-S301", score=4.8, avg=0,
         tel="021-63777668", why="福建菜, 香酥芋枣受欢迎", src="腾讯地图", url="https://www.bfcsh.com", tags=["福建菜"]),
    dict(name="Primotable 高桌牛排馆 (外滩店)", cat="美食餐厅", loc="F4-S404", score=4.8, avg=572,
         tel="021-63057157", why="庄重浪漫氛围, 适合情侣约会", src="腾讯地图", url="https://www.bfcsh.com", tags=["西餐","牛排","约会"]),
    dict(name="莆田餐厅 PUTIEN (BFC外滩金融中心店)", cat="美食餐厅", loc="南区 B2 B210-211", score=4.6, avg=131,
         tel="021-53830335", why="福建菜, 芋香鸭特色热吃好吃", src="腾讯地图", url="https://www.bfcsh.com", tags=["福建菜","平价"]),
    dict(name="泰珍荟 Siam Memory (BFC店)", cat="美食餐厅", loc="南区 4层 S413A", score=4.8, avg=273,
         tel="021-63309686", why="泰国菜, 玻璃房和露台氛围棒", src="腾讯地图", url="https://www.bfcsh.com", tags=["泰国菜","露台"]),
    dict(name="橘焱胡同烧肉夜食 (BFC店)", cat="美食餐厅", loc="北区 N2幢 1F", score=4.6, avg=188,
         tel="021-64065647", why="日式烧肉, 和牛拼盘/墨鱼香肠/胡同蟹堡, 夜宵至次日02:00", src="腾讯地图/夜行指南", url="https://www.bfcsh.com", tags=["烧肉","夜宵","日式"]),
    dict(name="上海滩餐厅 (BFC外滩金融中心店)", cat="美食餐厅", loc="5F层", score=4.8, avg=0,
         tel="021-63787777", why="上海菜, 环境时尚, 外滩夜景", src="腾讯地图", url="https://www.bfcsh.com", tags=["上海菜","江景"]),
    dict(name="清晨家烤肉 (BFC外滩金融中心店)", cat="美食餐厅", loc="F4-S413b", score=4.8, avg=229,
         tel="18121214336", why="韩国料理, 用餐氛围温馨舒适", src="腾讯地图", url="https://www.bfcsh.com", tags=["韩国料理","烤肉"]),
    dict(name="沧南云海·云南菜 (外滩店)", cat="美食餐厅", loc="北区负一层 B135", score=4.3, avg=87,
         tel="13122692279", why="云贵菜, 蒙自过桥米线料多味正", src="腾讯地图", url="https://www.bfcsh.com", tags=["云南菜","平价"]),
    dict(name="三利音·东方司宴 (外滩店)", cat="美食餐厅", loc="外滩三楼", score=4.8, avg=398,
         tel="021-63357838", why="高端粤菜, 装修大气", src="腾讯地图", url="https://www.bfcsh.com", tags=["粤菜","高人均"]),
    dict(name="RIVIERA 松鹤楼 (外滩店)", cat="美食餐厅", loc="中山东二路505号 2F", score=4.8, avg=523,
         tel="021-33313777", why="苏式/本帮, 招牌松鼠桂鱼每桌必点", src="腾讯地图", url="https://www.bfcsh.com", tags=["苏帮菜","本帮"]),
    dict(name="柴门荟", cat="美食餐厅", loc="北区 N3幢 2F", score=0, avg=0,
         tel="021-63306690", why="米其林江景川菜, 非遗传承人创立, 夜宵21:00-24:00", src="夜行指南", url="https://www.bfcsh.com", tags=["米其林","川菜","夜宵"]),
    dict(name="白茸 Bistro", cat="美食餐厅", loc="北区 N2栋 1F", score=0, avg=0,
         tel="021-52798975", why="新鲁菜/胶东海鲜, 入选2025上海米其林指南精选, 近50道时鲜", src="夜行指南", url="https://www.bfcsh.com", tags=["米其林精选","鲁菜","海鲜"]),
    dict(name="隐溪茶馆", cat="美食餐厅", loc="北区 N2栋 2层 201/202", score=0, avg=0,
         tel="021-63153705", why="深夜隐逸茶室, 499元4人晚间畅玩套餐, 含茶饮茶点+桌游", src="夜行指南", url="https://www.bfcsh.com", tags=["茶馆","夜茶","聚会"]),
    dict(name="CLOUD Bistro (外滩店)", cat="美食餐厅", loc="复星艺术中心 4楼", score=4.6, avg=158,
         tel="15901964711", why="小聚/约会/商务皆宜", src="腾讯地图", url="https://www.bfcsh.com", tags=["西餐","艺术中心"]),
    dict(name="Cloud·SU LOUNGE the bund", cat="夜生活", loc="复星艺术中心 4楼", score=4.6, avg=134,
         tel="", why="酒吧/lounge, 营业 19:00-01:30", src="腾讯地图", url="https://www.bfcsh.com", tags=["酒吧","夜生活","江景"]),
    dict(name="潮民公馆", cat="美食餐厅", loc="南区三层", score=0, avg=0,
         tel="", why="港式国潮粤菜, 古法烹饪+摩登元素, 被称为魔都最正宗粤菜之一", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["粤菜","国潮"]),
    dict(name="泡茶店·微醺lab", cat="美食餐厅", loc="南区 1层", score=0, avg=0,
         tel="", why="茶饮+酒元素创新饮品, 户外外摆号称外滩最美外摆", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["茶饮","微醺","外摆"]),

    # ===== 艺术展览 =====
    dict(name="复星艺术中心", cat="艺术展览", loc="BFC 1F层", score=4.8, avg=98,
         tel="", why="非营利当代艺术机构, 高品质展览+公众教育, 营业时间详见官网(周一常闭)", src="腾讯地图/BFC官网", url="https://www.bfcsh.com", tags=["当代艺术","展览馆","IP"]),
    dict(name="Miss Dior 展览", cat="艺术展览", loc="复星艺术中心", score=0, avg=0,
         tel="", why="梦幻粉色主题展, 迪丽热巴同款打卡地(展期约9.13-10.8)", src="携程/网易攻略", url="https://www.bfcsh.com", tags=["Dior","打卡","粉色"]),
    dict(name="邱岸雄《早春长歌行》", cat="艺术展览", loc="复星艺术中心", score=0, avg=0,
         tel="", why="数字艺术+山水美学, 中式美学浪漫", src="携程攻略", url="https://www.bfcsh.com", tags=["数字艺术","山水"]),
    dict(name="空山基《机械姬-无限》", cat="艺术展览", loc="南区 2F VIP LOUNGE", score=0, avg=0,
         tel="", why="隐藏版赛博朋克未来世界展览", src="网易攻略", url="https://www.bfcsh.com", tags=["赛博朋克","隐藏展"]),

    # ===== 购物品牌 =====
    dict(name="Paul Smith", cat="购物品牌", loc="南区", score=0, avg=0,
         tel="", why="英伦设计品牌, BFC南区入驻", src="网易攻略", url="https://www.bfcsh.com", tags=["设计师","服饰"]),
    dict(name="alexanderwang", cat="购物品牌", loc="南区", score=0, avg=0,
         tel="", why="高街潮流品牌, BFC南区入驻", src="网易攻略", url="https://www.bfcsh.com", tags=["高街","潮流"]),
    dict(name="Versace", cat="购物品牌", loc="南区", score=0, avg=0,
         tel="", why="奢侈品牌, BFC南区入驻", src="网易攻略", url="https://www.bfcsh.com", tags=["奢侈","服饰"]),
    dict(name="PHANTACi", cat="购物品牌", loc="北区", score=0, avg=0,
         tel="", why="周杰伦潮牌, 嘉年华演唱会系列限量发售", src="网易攻略", url="https://www.bfcsh.com", tags=["潮牌","周杰伦"]),
    dict(name="URLAZH 有兰", cat="购物品牌", loc="2层", score=0, avg=0,
         tel="", why="女性服饰, 轻松趣味穿着理念, 运动/旅行/工作多元线", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["女装","设计师"]),
    dict(name="DETTAGLI", cat="购物品牌", loc="2层", score=0, avg=0,
         tel="", why="意式高端女装, 极简优雅流畅线条", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["女装","意式"]),
    dict(name="CIGALONG", cat="购物品牌", loc="南区二楼珠宝区", score=0, avg=0,
         tel="", why="设计师珠宝品牌, 款式独特不撞款", src="母亲节攻略", url="https://www.bfcsh.com", tags=["珠宝","设计师"]),
    dict(name="上海表 / 海鸥表", cat="购物品牌", loc="南区二楼珠宝区", score=0, avg=0,
         tel="", why="海派金雕腕表 / 时韵小酒窝腕表, 母亲节礼遇", src="母亲节攻略", url="https://www.bfcsh.com", tags=["腕表","国产"]),

    # ===== 宠物友好 =====
    dict(name="PET WISH 宠物愿望", cat="宠物友好", loc="南区 B2层", score=0, avg=0,
         tel="", why="宠物集合店: 撸猫咖啡馆+洗护SPA+寄养+零售", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["宠物","集合店"]),
    dict(name="探汪馆", cat="宠物友好", loc="南区 B2层", score=0, avg=0,
         tel="", why="萌犬互动馆, 高颜值犬种, 浪漫主题适合拍照", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["宠物","萌犬"]),
    dict(name="BFC 宠友会 / 爱心宠物领养", cat="宠物友好", loc="BFC全馆", score=0, avg=0,
         tel="", why="不定期举办宠友会、爱心宠物领养活动", src="宠物友好攻略", url="https://www.bfcsh.com", tags=["宠物","公益活动"]),

    # ===== 打卡机位 =====
    dict(name="BFC 南区 5F 心动露台", cat="打卡机位", loc="南区 5F", score=0, avg=0,
         tel="", why="外滩绝美江景露台, 超级月亮光影装置(国庆展期), 蓝调时刻出片", src="网易/携程攻略", url="https://www.bfcsh.com", tags=["江景","露台","出片"]),
    dict(name="米菲 Miffy 主题店", cat="打卡机位", loc="南区 B2", score=0, avg=0,
         tel="", why="限时主题店+限定周边, BFC变身米菲痛城", src="网易攻略", url="https://www.bfcsh.com", tags=["IP","治愈","限时"]),
    dict(name="外滩枫径", cat="打卡机位", loc="北外滩/滨水", score=0, avg=0,
         tel="", why="周末限定市集, BFC知名IP, 澳门风情/节庆游乐场", src="BFC官网/网易攻略", url="https://www.bfcsh.com", tags=["市集","IP","周末"]),
]


def create_parent():
    body = {
        "parent": {"type": "page_id", "page_id": PARENT_PAGE_ID},
        "properties": {"title": {"title": [{"text": {"content": "公开内容 · 攻略与推荐"}}]}},
        "children": [
            {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [
                {"type": "text", "text": {"content": "本库由 smart-shopping-guide 通过公开网络搜索(官网/腾讯地图/新闻攻略)采集整理, 无需登录社媒账号。覆盖 BFC 外滩金融中心的美食餐厅、艺术展览、购物品牌、宠物友好店铺、打卡机位与夜生活, 供 AI 导购助手检索调用。"}}]}},
            {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "数据说明"}}]}},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "评分/人均/电话来自腾讯地图公开数据, 仅供参考, 以门店实时为准。"}}]}},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "如需社媒评论级声量(小红书/抖音/微博), 仍可用 MediaCrawler 在你本机登录后爬取, 再行归一化灌库。"}}]}},
        ],
    }
    page = req("POST", "/pages", body)
    print(f"[OK] 父页面已建: {page['id']}")
    return page["id"]


def create_database(parent_id):
    props = {
        "名称": {"title": {}},
        "类别": {"select": {"options": [
            {"name": "美食餐厅"}, {"name": "艺术展览"}, {"name": "购物品牌"},
            {"name": "宠物友好"}, {"name": "打卡机位"}, {"name": "夜生活"}]}},
        "位置": {"rich_text": {}},
        "评分": {"number": {"format": "number"}},
        "人均(¥)": {"number": {"format": "number"}},
        "电话": {"rich_text": {}},
        "推荐理由": {"rich_text": {}},
        "来源": {"rich_text": {}},
        "链接": {"url": {}},
        "标签": {"multi_select": {}},
    }
    body = {
        "parent": {"type": "page_id", "page_id": parent_id},
        "title": [{"type": "text", "text": {"content": "BFC 公开内容总表"}}],
        "properties": props,
    }
    db = req("POST", "/databases", body)
    print(f"[OK] 数据库已建: {db['id']}")
    return db["id"]


def insert_rows(db_id, entries):
    ok = 0
    for e in entries:
        props = {
            "名称": {"title": [{"text": {"content": e["name"]}}]},
            "类别": {"select": {"name": e["cat"]}},
            "位置": {"rich_text": [{"text": {"content": e["loc"]}}]},
            "评分": {"number": e["score"]},
            "人均(¥)": {"number": e["avg"]},
            "电话": {"rich_text": [{"text": {"content": e["tel"]}}]},
            "推荐理由": {"rich_text": [{"text": {"content": e["why"]}}]},
            "来源": {"rich_text": [{"text": {"content": e["src"]}}]},
            "链接": {"url": e["url"]},
            "标签": {"multi_select": [{"name": t} for t in e["tags"]]},
        }
        req("POST", "/pages", {"parent": {"type": "database_id", "database_id": db_id}, "properties": props})
        ok += 1
        if ok % 10 == 0:
            print(f"  ...已写入 {ok}/{len(entries)}")
        time.sleep(0.35)
    print(f"[OK] 共写入 {ok} 条")


def main():
    if not TOKEN or not PARENT_PAGE_ID:
        print("缺少 NOTION_TOKEN 或 PARENT_PAGE_ID"); sys.exit(1)
    print(f"[INFO] 待入库条目: {len(ENTRIES)}")
    parent = create_parent()
    db = create_database(parent)
    insert_rows(db, ENTRIES)
    print("\n✅ 公开内容补库完成!")
    print(f"父页面ID: {parent}")
    print(f"数据库ID: {db}")


if __name__ == "__main__":
    main()
