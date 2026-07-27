#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 MediaCrawler 导出的各平台 CSV 归一化，生成：
  1) bfc_social_corpus.json   —— 统一结构的全部帖子（供 agent 知识库）
  2) notion_import/            —— Notion 数据库导入用 CSV + 每平台 Markdown 页面
用法：
  python transform.py [--src D:/MediaCrawler/data] [--out .] [--stores ../src/data/mockData.ts]
只依赖标准库，无需联网、无需第三方包。
"""
import csv
import json
import os
import re
import sys

# 平台中文名
PLATFORM_CN = {
    "xhs": "小红书", "weibo": "微博", "douyin": "抖音",
    "bilibili": "哔哩哔哩", "zhihu": "知乎", "tieba": "百度贴吧",
    "kuaishou": "快手",
}

# 各平台常见列名 -> 统一字段
COL_MAP = {
    "note_id": "id", "aweme_id": "id", "id": "id",
    "title": "title", "content": "content", "desc": "content",
    "nickname": "author", "user_name": "author", "author": "author",
    "liked_count": "likes", "like_count": "likes", "liked": "likes",
    "comments_count": "comments", "comment_count": "comments",
    "collected_count": "collects", "share_count": "shares",
    "update_time": "time", "create_time": "time", "publish_time": "time",
    "ip_location": "location", "location": "location", "region": "location",
    "tag_list": "tags", "tag": "tags",
}

# 从 CSV 路径推断平台
def detect_platform(path):
    low = path.lower().replace("\\", "/")
    for key in PLATFORM_CN:
        if f"/{key}/" in low or low.endswith(f"/{key}.csv") or f"_{key}" in low:
            return key
    return os.path.basename(path).split("_")[0].split(".")[0]

def norm_num(v):
    if v is None:
        return 0
    s = str(v).strip()
    if not s:
        return 0
    m = re.search(r"[\d.]+", s.replace(",", ""))
    if not m:
        return 0
    num = float(m.group())
    if "万" in s:
        num *= 10000
    return int(num)

def norm_record(row, platform):
    rec = {"platform": platform, "platform_cn": PLATFORM_CN.get(platform, platform)}
    for k, v in row.items():
        if not k:
            continue
        key = k.strip().lower()
        if key in COL_MAP:
            target = COL_MAP[key]
            rec[target] = (v or "").strip() if target in ("title", "content", "author", "time", "location", "tags", "id") else norm_num(v)
    rec.setdefault("id", "")
    rec.setdefault("title", "")
    rec.setdefault("content", "")
    rec.setdefault("author", "")
    rec.setdefault("time", "")
    rec.setdefault("location", "")
    rec.setdefault("tags", "")
    rec.setdefault("likes", 0)
    rec.setdefault("comments", 0)
    if isinstance(rec.get("tags"), str) and rec["tags"]:
        rec["tags"] = re.sub(r"[\[\]'\"]", "", rec["tags"]).replace(",", "、")
    text = (rec["title"] + " " + rec["content"]).strip()
    rec["_text"] = text
    return rec

# 从 mockData.ts 抽店铺名（粗抽，够做关联）
def load_store_names(ts_path):
    names = []
    if not ts_path or not os.path.exists(ts_path):
        return names
    try:
        txt = open(ts_path, encoding="utf-8", errors="ignore").read()
        for m in re.finditer(r"name:\s*'([^']+)'", txt):
            names.append(m.group(1))
    except Exception:
        pass
    return names

def main():
    src = None
    out = "."
    stores = None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--src" and i + 1 < len(args):
            src = args[i + 1]; i += 2
        elif args[i] == "--out" and i + 1 < len(args):
            out = args[i + 1]; i += 2
        elif args[i] == "--stores" and i + 1 < len(args):
            stores = args[i + 1]; i += 2
        else:
            i += 1

    if not src:
        # 默认找 MediaCrawler 的 data 目录
        for cand in ["D:/MediaCrawler/data", "../MediaCrawler/data", "D:/MediaCrawler/data"]:
            if os.path.isdir(cand):
                src = cand
                break
    if not src or not os.path.isdir(src):
        print("未找到 MediaCrawler 的 data 目录，请用 --src 指定。")
        sys.exit(1)

    store_names = load_store_names(stores)
    print(f"加载店铺名 {len(store_names)} 个（用于关联）")

    records = []
    csv_files = []
    for root, _, files in os.walk(src):
        for f in files:
            if f.lower().endswith(".csv"):
                csv_files.append(os.path.join(root, f))

    for fp in csv_files:
        platform = detect_platform(fp)
        try:
            with open(fp, encoding="utf-8-sig", errors="ignore", newline="") as fh:
                reader = csv.DictReader(fh)
                for row in reader:
                    rec = norm_record(row, platform)
                    # 只保留与 BFC/外滩/复星 相关的，或带店铺名的
                    if not rec["_text"]:
                        continue
                    hit = any(k in rec["_text"] for k in ["BFC", "外滩", "复星", "黄浦江", "豫园"])
                    if store_names:
                        hit = hit or any(sn in rec["_text"] for sn in store_names if len(sn) >= 3)
                    if hit:
                        # 关联到的店铺
                        linked = [sn for sn in store_names if sn in rec["_text"] and len(sn) >= 3]
                        rec["linked_stores"] = "、".join(linked)
                        records.append(rec)
        except Exception as e:
            print(f"跳过 {fp}: {e}")

    print(f"归一化得到相关帖子 {len(records)} 条")

    os.makedirs(out, exist_ok=True)
    corpus = os.path.join(out, "bfc_social_corpus.json")
    with open(corpus, "w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)
    print(f"写出 {corpus}")

    # Notion 导入：每个平台一个 CSV（数据库行）
    notion_dir = os.path.join(out, "notion_import")
    os.makedirs(notion_dir, exist_ok=True)
    by_plat = {}
    for r in records:
        by_plat.setdefault(r["platform"], []).append(r)
    for plat, recs in by_plat.items():
        csv_path = os.path.join(notion_dir, f"social_{plat}.csv")
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["平台", "店铺", "标题", "正文", "作者", "地区", "点赞", "评论", "时间", "标签", "链接"])
            for r in recs:
                url = f"https://www.{plat}.com"  # 占位，MediaCrawler 导出若有原始链接可替换
                w.writerow([r["platform_cn"], r.get("linked_stores", ""),
                            r["title"], r["content"], r["author"], r["location"],
                            r["likes"], r["comments"], r["time"], r["tags"], url])
        print(f"写出 {csv_path}（{len(recs)} 条）")

    # 每平台一个 Markdown 页面（可直接拖进 Notion）
    md_path = os.path.join(notion_dir, "BFC社交媒体内容.md")
    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write("# BFC 社交媒体内容库\n\n> 由 MediaCrawler 采集、transform.py 归一化。\n\n")
        for plat, recs in by_plat.items():
            fh.write(f"## {PLATFORM_CN.get(plat, plat)}（{len(recs)} 条）\n\n")
            for r in recs[:50]:
                title = r["title"] or "(无标题)"
                fh.write(f"### {title}\n")
                if r.get("linked_stores"):
                    fh.write(f"- 关联店铺：{r['linked_stores']}\n")
                fh.write(f"- 作者：{r['author']} ｜ 地区：{r['location']} ｜ 点赞：{r['likes']} ｜ 评论：{r['comments']}\n")
                fh.write(f"- 时间：{r['time']}\n")
                if r["content"]:
                    fh.write(f"\n{r['content'][:800]}\n\n")
                fh.write("---\n\n")
    print(f"写出 {md_path}")
    print("完成。把 notion_import/ 下的 CSV/MD 拖进 Notion 即可建库。")

if __name__ == "__main__":
    main()
