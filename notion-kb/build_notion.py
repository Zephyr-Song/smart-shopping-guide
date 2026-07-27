#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
通过 Notion 官方 REST API 把 BFC 101 家店铺建成知识库。
用法:
  NOTION_TOKEN=ntn_xxx PARENT_PAGE_ID=页面ID python build_notion.py

依赖: 仅 Python 标准库 (urllib)。无需 pip install。
"""
import csv
import os
import sys
import time
import json
import urllib.request
import urllib.error

TOKEN = os.environ.get("NOTION_TOKEN", "")
PARENT_PAGE_ID = os.environ.get("PARENT_PAGE_ID", "").replace("-", "")
CSV_PATH = os.path.join(os.path.dirname(__file__), "BFC店铺知识库.csv")

API = "https://api.notion.com/v1"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}


def req(method, path, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    r = urllib.request.Request(f"{API}{path}", data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[ERR] {method} {path} -> {e.code}: {e.read().decode('utf-8', 'ignore')}")
        raise


def clean(v):
    return (v or "").strip()


def to_num(v):
    v = clean(v)
    if v == "":
        return None
    try:
        f = float(v)
        return int(f) if f.is_integer() else f
    except ValueError:
        return None


def read_stores():
    out = []
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            out.append({
                "name": clean(row["名称"]),
                "cat": clean(row["品类"]),
                "floor": clean(row["楼层"]),
                "rating": to_num(row["评分"]),
                "price": to_num(row["人均(¥)"]),
                "tags": [t for t in clean(row["标签"]).replace("、", ",").split(",") if t],
                "desc": clean(row["简介"]),
                "traffic": to_num(row["月均客流"]),
                "heat": to_num(row["热度"]),
            })
    return out


def append_intro(parent_id):
    body = {"children": [
        {
            "object": "block", "type": "paragraph",
            "paragraph": {"rich_text": [{"type": "text", "text": {
                "content": "本知识库由 smart-shopping-guide 项目自动生成，收录 BFC 外滩金融中心 101 家真实店铺，供 AI 导购助手检索调用。下方为按楼层分组的店铺总览页面 + 可筛选/排序的店铺数据库。"
            }}]},
        },
        {"object": "block", "type": "divider", "divider": {}},
    ]}
    req("PATCH", f"/blocks/{parent_id}/children", body)
    print(f"[OK] 已写入简介到承接页 {parent_id}")


def create_floor_pages(parent_id, stores):
    floors = {}
    for s in stores:
        floors.setdefault(s["floor"] or "其他", []).append(s)
    # 固定楼层顺序
    order = ["N-B2", "N-B1", "S-B2", "S-B1", "S-L1", "S-L2", "S-L3", "S-L4", "其他"]
    keys = sorted(floors.keys(), key=lambda k: order.index(k) if k in order else 99)
    for fl in keys:
        items = floors[fl]
        children = []
        for s in items:
            line = f"{s['name']}（{s['cat']} · {s['floor']}）"
            if s["rating"] is not None:
                line += f" 评分{s['rating']}★"
            if s["price"] is not None:
                line += f" 人均¥{s['price']}"
            if s["tags"]:
                line += f" 标签：{', '.join(s['tags'])}"
            blocks = [{
                "object": "block", "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": line}}]},
            }]
            if s["desc"]:
                blocks.append({
                    "object": "block", "type": "paragraph",
                    "paragraph": {"rich_text": [{"type": "text", "text": {"content": "简介：" + s["desc"]}}]},
                })
            children.extend(blocks)
        body = {
            "parent": {"type": "page_id", "page_id": parent_id},
            "properties": {"title": {"title": [{"text": {"content": f"📍 {fl} 楼层店铺（{len(items)} 家）"}}]}},
            "children": children[:100],  # 单页子块上限保护
        }
        p = req("POST", "/pages", body)
        print(f"[OK] 楼层页 {fl}: {p['id']} ({len(items)} 家)")
        time.sleep(0.4)


def create_database(parent_id):
    props = {
        "店铺名称": {"title": {}},
        "品类": {"select": {}},
        "楼层": {"select": {}},
        "评分": {"number": {"format": "number"}},
        "人均": {"number": {"format": "yuan"}},
        "标签": {"multi_select": {}},
        "月均客流": {"number": {"format": "number"}},
        "热度": {"number": {"format": "number"}},
        "简介": {"rich_text": {}},
    }
    body = {
        "parent": {"type": "page_id", "page_id": parent_id},
        "title": [{"type": "text", "text": {"content": "BFC 店铺总表"}}],
        "properties": props,
        "is_inline": True,
    }
    db = req("POST", "/databases", body)
    print(f"[OK] 数据库已建: {db['id']}")
    return db["id"]


def insert_rows(db_id, stores):
    n = 0
    for s in stores:
        props = {
            "店铺名称": {"title": [{"text": {"content": s["name"]}}]},
            "品类": {"select": {"name": s["cat"]}} if s["cat"] else {"select": None},
            "楼层": {"select": {"name": s["floor"]}} if s["floor"] else {"select": None},
            "评分": {"number": s["rating"]} if s["rating"] is not None else {"number": None},
            "人均": {"number": s["price"]} if s["price"] is not None else {"number": None},
            "标签": {"multi_select": [{"name": t} for t in s["tags"]]},
            "月均客流": {"number": s["traffic"]} if s["traffic"] is not None else {"number": None},
            "热度": {"number": s["heat"]} if s["heat"] is not None else {"number": None},
            "简介": {"rich_text": [{"text": {"content": s["desc"]}}]} if s["desc"] else {"rich_text": []},
        }
        req("POST", "/pages", {"parent": {"database_id": db_id}, "properties": props})
        n += 1
        if n % 20 == 0:
            print(f"  ...已写入 {n}/{len(stores)}")
        time.sleep(0.35)  # 限流保护
    print(f"[OK] 数据库共写入 {n} 家店铺")


def main():
    if not TOKEN or not PARENT_PAGE_ID:
        print("缺少环境变量: 请设置 NOTION_TOKEN 与 PARENT_PAGE_ID")
        sys.exit(1)
    # 校验 token
    me = req("GET", "/users/me")
    print(f"[OK] token 有效, bot: {me.get('name')} <{me.get('bot',{}).get('owner',{})}>")
    stores = read_stores()
    print(f"[OK] 读取本地店铺 {len(stores)} 家")
    parent = PARENT_PAGE_ID
    create_floor_pages(parent, stores)
    db = create_database(parent)
    insert_rows(db, stores)
    print("\n✅ 知识库建库完成!")
    print(f"承接页ID: {parent}")
    print(f"数据库ID: {db}")


if __name__ == "__main__":
    main()
