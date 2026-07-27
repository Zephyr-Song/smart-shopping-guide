#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""续跑: 复用 enrich_web2 已建的 分区父页 + DB2(攻略库),
把 攻略/活动/品牌 三个库补齐。req 带 SSL 重试。"""
import os, sys, time, json, importlib.util, urllib.request, urllib.error

TOKEN = os.environ.get("NOTION_TOKEN")
SECTION_PARENT = "3a9fb2b4-a563-8148-8724-f724bbd939a8"  # 已建 分区父页
DB2_GUIDE = "3a9fb2b4-a563-812a-b991-f074d6dbb8a7"        # 已建 攻略库(0行)
API = "https://api.notion.com/v1"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Notion-Version": "2022-06-28", "Content-Type": "application/json"}

def req(method, path, body=None):
    url = API + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    last = None
    for attempt in range(5):
        r = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
        try:
            with urllib.request.urlopen(r, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.HTTPError) as e:
            msg = e.read().decode("utf-8", "ignore")
            if e.code == 429:
                time.sleep(5); continue
            print(f"  [HTTP {e.code}] {path}\n  {msg[:200]}"); raise
        except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
            last = e; time.sleep(2 + attempt * 2); continue
    raise last

# 复用 enrich_web2 的数据
spec = importlib.util.spec_from_file_location("ew2", r"D:/WorkBuddy/smart-shopping-guide/notion-kb/enrich_web2.py")
ew2 = importlib.util.module_from_spec(spec); spec.loader.exec_module(ew2)
GUIDES, EVENTS, BRANDS = ew2.GUIDES, ew2.EVENTS, ew2.BRANDS
rt = ew2.rt

def build_db(parent_id, title, props):
    body = {"parent": {"type": "page_id", "page_id": parent_id},
            "title": [{"type": "text", "text": {"content": title}}], "properties": props}
    db = req("POST", "/databases", body)
    print(f"[OK] 数据库已建: {db['id']}  ({title})"); return db["id"]

def insert_rows(db_id, rows):
    ok = 0
    for props in rows:
        req("POST", "/pages", {"parent": {"type": "database_id", "database_id": db_id}, "properties": props})
        ok += 1
        if ok % 8 == 0: print(f"  ...已写入 {ok}")
        time.sleep(0.35)
    print(f"[OK] 本库写入 {ok} 条")

def main():
    if not TOKEN: print("缺少 NOTION_TOKEN"); sys.exit(1)
    # 攻略库(已有空库, 直接灌)
    print(f"[INFO] 攻略库 {DB2_GUIDE} 补写 {len(GUIDES)} 条")
    r2 = [{"标题": {"title": [{"text": {"content": e["title"]}}]}, "类型": rt(e["typ"]),
            "关联地点": rt(e["place"]), "内容": rt(e["content"]), "来源": rt(e["src"])} for e in GUIDES]
    insert_rows(DB2_GUIDE, r2)

    # 活动库
    p3 = {"名称": {"title": {}}, "时间": {"rich_text": {}}, "地点": {"rich_text": {}},
          "简介": {"rich_text": {}}, "来源": {"rich_text": {}}}
    db3 = build_db(SECTION_PARENT, "BFC 2026 暑期活动日历", p3)
    r3 = [{"名称": {"title": [{"text": {"content": e["name"]}}]}, "时间": rt(e["when"]),
            "地点": rt(e["place"]), "简介": rt(e["desc"]), "来源": rt(e["src"])} for e in EVENTS]
    insert_rows(db3, r3)

    # 品牌库
    p4 = {"品牌": {"title": {}}, "品类": {"rich_text": {}}, "楼层": {"rich_text": {}},
          "特色": {"rich_text": {}}, "来源": {"rich_text": {}}}
    db4 = build_db(SECTION_PARENT, "BFC 品牌购物指南", p4)
    r4 = [{"品牌": {"title": [{"text": {"content": e["name"]}}]}, "品类": rt(e["cat"]),
            "楼层": rt(e["floor"]), "特色": rt(e["feat"]), "来源": rt(e["src"])} for e in BRANDS]
    insert_rows(db4, r4)

    print("\n✅ 续跑补库完成!")
    print(f"攻略库: {DB2_GUIDE} | 活动库: {db3} | 品牌库: {db4}")

if __name__ == "__main__":
    main()
