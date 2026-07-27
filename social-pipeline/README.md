# BFC 社交媒体知识库 · 采集流水线

目标：用 MediaCrawler 采集小红书/微博/抖音/知乎/B站/贴吧上关于 BFC 外滩金融中心的内容，
清洗后灌进 Notion，供「BFC 导购助手」AI 使用。

> ⚠️ 本项目无法直接由 AI 在你机器外完成——**登录和采集必须在你自己的 Windows 上跑**，
> 因为各平台要登录态（cookie），而 cookie 需要你本人扫码/验证码，且本环境取不到。

---

## 你（用户）要做的 3 步

### 第 1 步：在 MediaCrawler 里登录平台
打开 `D:\MediaCrawler`，按项目 README 启动一次登录（会弹真实浏览器让你扫码）：
```bash
cd D:\MediaCrawler
python main.py --platform xhs --lt qrcode   # 小红书，二维码登录
python main.py --platform weibo --lt cookie # 微博
# 同理 douyin / zhihu / bilibili / tieba
```
登录成功后，`browser_data/` 里会生成带 `Cookies` 库的浏览器档案，**这一步只需做一次**。

### 第 2 步：跑采集（用 keywords.md 里的词）
```bash
cd D:\MediaCrawler
python main.py --platform xhs --type search --keywords "BFC 外滩,外滩金融中心 探店"
python main.py --platform weibo --type search --keywords "BFC 外滩"
# ……其余平台同理
```
采集结果默认落在 `D:\MediaCrawler\data\<平台>\*.csv`。

### 第 3 步：把导出文件交给 AI（WorkBuddy）
把 `D:\MediaCrawler\data\` 整个目录（或里面几个 CSV）发给我，或直接说"跑 transform"。
我会执行 `transform.py` 归一化，并：
- 生成 `bfc_social_corpus.json`（喂 AI 助手知识库）
- 生成 `notion_import/`（CSV + MD，直接拖进 Notion 建库）

> 前提：Notion 连接器在 WorkBuddy 里**处于 connected 且写工具已加载**的状态
> （若之前连过又断了，重连或开新对话让工具加载）。

---

## AI 这边自动做的（transform.py）

`python transform.py --src D:/MediaCrawler/data --out . --stores ../src/data/mockData.ts`

- 递归读 MediaCrawler 所有导出 CSV
- 按平台归一化字段（标题/正文/作者/点赞/评论/时间/地区/标签）
- 只保留含 **BFC/外滩/复星/黄浦江/豫园** 或 101 家店铺名的帖子
- 把帖子关联到具体店铺（`linked_stores`）
- 输出：
  - `bfc_social_corpus.json` —— 统一结构，供 agent 知识库
  - `notion_import/social_<平台>.csv` —— Notion 数据库导入
  - `notion_import/BFC社交媒体内容.md` —— Notion 页面导入

---

## 合规提醒
MediaCrawler 的定位是「学习/研究」。把采集内容用于商业导购助手前，请确认：
- 不存储用户个人信息（昵称/头像可脱敏）
- 遵守各平台用户协议与版权要求
- 评价类内容仅作内部参考，对外展示需获授权
