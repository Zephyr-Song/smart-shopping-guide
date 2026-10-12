# 🛍️ BFC AI 智能导购

> **BFC AI Smart Shopping Guide** · 基于真实商业数据的 AI 导购助手

为 BFC 外滩金融中心打造的 AI 智能导购 Web 应用：自然语言问购、个性化推荐、商场导航与客流洞察，帮助顾客更聪明地逛街。

## ✨ 功能模块

### 🤖 智能导购
- 消费者画像采集（年龄、预算、兴趣、购物风格）
- AI 个性化推荐引擎（多维度匹配算法）
- 推荐理由可解释性展示

### 🗺️ 商场导航
- 交互式商场平面图（SVG）
- 实时客流热力图可视化
- 店铺详情面板（客流/转化率/热度）

### 📊 商圈分析
- 客流趋势与转化曲线
- 消费者转化漏斗分析
- 客群画像分布（5 大客群）
- 门店客流量/转化率对比

### 🧪 实验中心
- A/B 测试框架
- 推送时机、推荐策略、优惠力度实验
- 统计显著性分析
- 研究启示提炼

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6 | 构建工具 |
| TailwindCSS | 4 | 样式系统 |
| Chart.js | 4 | 数据可视化 |
| React Router | 7 | 页面路由 |
| Lucide React | - | 图标库 |

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/Zephyr-Song/smart-shopping-guide.git
cd smart-shopping-guide

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
src/
├── components/
│   └── Layout.tsx          # 全局布局与导航
├── data/
│   └── mockData.ts         # 模拟数据与推荐算法
├── pages/
│   ├── Home.tsx            # 首页
│   ├── SmartGuide.tsx      # 智能导购
│   ├── MallMap.tsx         # 商场地图
│   ├── Analytics.tsx       # 商圈分析
│   └── Experiment.tsx      # 实验中心
├── App.tsx                 # 路由配置
├── main.tsx                # 入口文件
└── index.css               # 全局样式
```

## 🔗 相关链接

- **GitHub：** https://github.com/Zephyr-Song/smart-shopping-guide
- **线上地址：** https://bfc-shopping-guide.pages.dev

## 📄 License

MIT
