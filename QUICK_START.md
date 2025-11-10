# 快速开始指南 | Quick Start Guide

## 🚀 项目概述

**青少年羽毛球训练知识库平台** - 一个专业的青少年羽毛球训练内容平台，包含VuePress静态博客和微信小程序。

---

## ✅ 当前状态 (2025-11-10)

### 已完成
- ✅ 完整项目结构 (18个内容板块)
- ✅ VuePress 2.x 配置
- ✅ 微信小程序框架
- ✅ 3篇示例训练文章 (37,000+ 字)
- ✅ **即梦AI图片生成集成** (测试成功)
- ✅ 批量图片生成脚本
- ✅ 完整使用文档

### 待完成
- ⏳ 批量生成19张AI训练图片
- ⏳ 安装npm依赖
- ⏳ 创建剩余11篇文章
- ⏳ VuePress本地测试
- ⏳ 微信小程序开发

---

## 🎨 立即生成AI图片 (推荐第一步)

### 方式1: 批量生成全部19张

```bash
# 运行批量生成脚本
python scripts/batch_generate_images.py

# 按提示选择:
# 1. 全部生成 (推荐) - 自动生成全部图片
# 2. 逐个确认生成 - 手动确认每张
# 3. 指定范围生成 - 如 1-5 或 1,3,5
```

**预期结果**:
- 生成19张专业训练插图
- 每张图片 1024×1024 像素
- 文件大小约 200-400 KB
- 总耗时约 10-15 分钟
- 消耗积分约 19-38 (当前有88积分)

### 方式2: 测试单张图片

```bash
# 快速测试
python scripts/test_single_image.py

# 输出: test-warmup-demo.png
```

**已测试**: ✅ 成功生成 273.8 KB PNG图片

---

## 📦 安装项目依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
npm install                    # 根项目依赖
cd docs && npm install         # VuePress依赖
cd ../scripts && npm install   # 脚本依赖
```

---

## 👀 本地预览VuePress

```bash
# 启动开发服务器
npm run docs:dev

# 访问
http://localhost:8080
```

**包含内容**:
- 3篇完整训练文章
- 18个内容板块导航
- 搜索功能
- 移动端优化

---

## 📂 项目结构

```
sports_training/
├── content/                     # 训练内容 (Markdown)
│   ├── age-groups/              # 按年龄分组 (4-15岁)
│   │   ├── 01-enlightenment-4-6/   # 4-6岁启蒙期
│   │   │   └── physical-training/
│   │   │       ├── coordination-training-basics.md  ✓
│   │   │       ├── balance-training-basics.md       ✓
│   │   │       └── images/                          # AI生成图片
│   │   ├── 02-foundation-7-9/      # 7-9岁基础期
│   │   │   └── physical-training/
│   │   │       ├── speed-agility-training.md        ✓
│   │   │       └── images/
│   │   ├── 03-development-10-12/   # 10-12岁发展期
│   │   └── 04-specialization-13-15/# 13-15岁专项期
│   ├── theory/                  # 理论知识
│   ├── guidance/                # 教练指导
│   └── resources/               # 资源中心
├── docs/                        # VuePress博客
│   ├── .vuepress/config.ts      # VuePress配置
│   └── README.md                # 首页
├── miniprogram/                 # 微信小程序
│   ├── pages/                   # 页面
│   └── app.json                 # 小程序配置
├── scripts/                     # 工具脚本
│   ├── batch_generate_images.py # 批量生成AI图片 ✓
│   ├── test_single_image.py     # 单张图片测试 ✓
│   └── generate-images.js       # Node.js版本
└── docs/
    ├── AI_IMAGE_GENERATION_GUIDE.md  # AI图片生成指南 ✓
    └── IMAGE_GENERATION_PROMPTS.md   # 完整提示词文档 ✓
```

---

## 📝 示例文章

### 已完成 (3篇)

1. **4-6岁协调性训练基础** (~10,000字)
   - 路径: `content/age-groups/01-enlightenment-4-6/physical-training/coordination-training-basics.md`
   - 图片: 6个AI标记

2. **4-6岁平衡能力训练** (~12,000字)
   - 路径: `content/age-groups/01-enlightenment-4-6/physical-training/balance-training-basics.md`
   - 图片: 6个AI标记

3. **7-9岁速度与敏捷性训练** (~15,000字)
   - 路径: `content/age-groups/02-foundation-7-9/physical-training/speed-agility-training.md`
   - 图片: 7个AI标记

### 待创作 (11篇)

- 4-6岁: 柔韧性训练 (1篇)
- 7-9岁: 握拍步法、反应训练 (2篇)
- 10-12岁: 高远球、体能、双打战术 (3篇)
- 13-15岁: 网前技术、心理训练、比赛策略 (3篇)
- 理论: 技术原理、运动营养 (2篇)

---

## 🛠️ 常用命令

### 开发命令

```bash
npm run docs:dev          # 启动VuePress开发服务器
npm run docs:build        # 构建生产版本
npm run validate          # 验证Markdown格式
npm run lint              # 代码检查
npm run format            # 代码格式化
```

### 图片生成命令

```bash
python scripts/test_single_image.py         # 测试单张
python scripts/batch_generate_images.py     # 批量生成
node scripts/generate-images.js --dry-run   # Node.js版本 (预览)
```

---

## 📖 文档参考

- **AI图片生成指南**: `docs/AI_IMAGE_GENERATION_GUIDE.md`
- **完整提示词文档**: `docs/IMAGE_GENERATION_PROMPTS.md`
- **进度报告**: `PROGRESS_REPORT.md`
- **贡献指南**: `CONTRIBUTING.md`
- **README**: `README.md`

---

## ⚙️ 技术栈

### 前端
- **VuePress 2.x** - 静态站点生成器
- **Vue 3** - 前端框架
- **Vite** - 构建工具

### 小程序
- **微信小程序** - 原生开发
- **WebView** - 内容展示

### AI工具
- **即梦AI (Jimeng 4.0)** - 图片生成
- **Python 3.8+** - 脚本语言

### 内容
- **Markdown** - 内容格式
- **Frontmatter** - 元数据

---

## 💡 下一步操作

### 推荐顺序

1. **生成AI图片** (10-15分钟)
   ```bash
   python scripts/batch_generate_images.py
   ```

2. **安装依赖** (5-10分钟)
   ```bash
   npm run install:all
   ```

3. **本地预览** (即时)
   ```bash
   npm run docs:dev
   ```

4. **创作更多文章** (按需)
   - 使用模板: `content/.templates/age-group-article.md`

---

## 🆘 获取帮助

### 问题排查

1. **图片生成失败**: 查看 `docs/AI_IMAGE_GENERATION_GUIDE.md` 故障排除部分
2. **依赖安装失败**: 检查Node.js版本 (需要18+)
3. **VuePress构建失败**: 运行 `npm run validate` 检查Markdown格式

### 联系方式

- **项目路径**: `F:\work\study\sports_training`
- **图片服务**: `D:\study\mysite\mcp-servers\image-gen-server`

---

**最后更新**: 2025-11-10 10:30
**当前版本**: Phase 1 完成，内容创作进行中
**状态**: ✅ AI图片生成就绪，可立即批量生成
