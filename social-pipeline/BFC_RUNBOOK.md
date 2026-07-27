# BFC 社媒内容爬取执行手册（MediaCrawler）

目标：用 `D:\MediaCrawler`（NanmiCoder/MediaCrawler）爬取小红书/抖音/微博/知乎/B站 上关于
**BFC 外滩金融中心** 的内容，归一化后灌入 Notion 知识库（「BFC知识库」页）。

> 现状（2026-07-26）：仓库 venv 已损坏（指向已卸载的 QClaw Python），已由助手在后台用
> 本机 anaconda Python 重建并安装依赖。爬虫**必须先登录（扫码）**，这一步只能在用户本机
> 终端完成（需弹浏览器 + 走本机正常网络）。登录态存于 `D:\MediaCrawler\browser_data\`。

## 一、确认环境可用（助手侧已做，用户可自查）
```
cd D:\MediaCrawler
venv\Scripts\python.exe main.py --help
```
能打印参数即环境 OK。

## 二、逐平台登录（用户在本机终端执行，需扫码）
每个平台一行，跑起来会弹浏览器二维码，用对应 App 扫码：
```
venv\Scripts\python.exe main.py --platform xhs    --lt qrcode
venv\Scripts\python.exe main.py --platform dy     --lt qrcode
venv\Scripts\python.exe main.py --platform wb     --lt qrcode
venv\Scripts\python.exe main.py --platform zhihu  --lt qrcode
venv\Scripts\python.exe main.py --platform bili   --lt qrcode
# 可选：tieba / ks
venv\Scripts\python.exe main.py --platform tieba  --lt qrcode
```
登录成功后会话自动保存在 `browser_data/`，关掉终端也没事。

## 三、爬取 BFC 内容（登录后执行）
用 `--keywords` 直接传 BFC 检索词（也可改 `keywords.txt`），jsonl 落盘到 `data/<平台>/jsonl/`：
```
venv\Scripts\python.exe main.py --platform xhs   --type search --keywords "外滩金融中心,BFC,复星艺术中心,外滩枫径,北外滩" --get_comment y --save_data_option jsonl
venv\Scripts\python.exe main.py --platform dy    --type search --keywords "外滩金融中心,BFC,复星艺术中心,外滩枫径,北外滩" --get_comment y --save_data_option jsonl
venv\Scripts\python.exe main.py --platform wb    --type search --keywords "外滩金融中心 BFC 复星艺术中心 外滩枫径 北外滩" --get_comment y --save_data_option jsonl
venv\Scripts\python.exe main.py --platform zhihu --type search --keywords "外滩金融中心,BFC,复星艺术中心" --get_comment y --save_data_option jsonl
venv\Scripts\python.exe main.py --platform bili  --type search --keywords "外滩金融中心,BFC,复星艺术中心" --get_comment y --save_data_option jsonl
```
> 注意：抖音/小红书对未登录或频次敏感，建议每个平台爬完停顿一下；如遇风控，隔天再爬。

## 四、归一化 + 灌入 Notion（助手侧自动完成）
数据落到 `D:\MediaCrawler\data\` 后，通知助手。助手会：
1. 用 `transform.py` 把 `search_contents_*.jsonl` / `search_comments_*.jsonl` 归一化为
   结构化记录（平台 / 关键词 / 标题 / 正文 / 作者 / 互动量 / 链接 / 时间）。
2. 过滤掉与 BFC 无关的内容（按关键词 + 文本相关性）。
3. 在 Notion「BFC知识库」下新建「社媒声量」数据库/页面，按平台+关键词归类，供 AI 导购助手检索。

## 五、已知限制
- MediaCrawler 仅用于学习研究，遵守各平台 ToS，控制频次，不商用。
- 现有 `data/douyin/jsonl/` 里 07-09 那批是「Dify部署」内容，与 BFC 无关，已确认不采用。
- 小红书/抖音强依赖登录态，未登录爬不动。
