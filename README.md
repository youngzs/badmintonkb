# 青少年羽毛球训练知识库平台
# Youth Badminton Training Knowledge Platform

> 专业的青少年羽毛球训练知识平台，覆盖4-15岁全年龄段

## 项目概述 / Project Overview

本平台提供全面的青少年羽毛球训练知识体系，包括：

- **18个内容板块**: 涵盖4个年龄组专项内容、理论模块、指导手册和资源库
- **200+训练模块**: 专业教练编写的体能、技术、战术、心理等全方位训练内容
- **AI辅助功能**: 个性化训练计划和营养建议生成
- **微信小程序**: 便捷的移动端访问和分享

## 技术架构 / Tech Stack

- **静态站点生成**: VuePress 2.x (Vue 3 + Vite)
- **小程序框架**: WeChat Mini Program SDK
- **CDN部署**: Aliyun OSS + CDN
- **AI服务**: Image Generation (MCP) + Content Generation API
- **构建工具**: Node.js 18+, npm workspaces

## 项目结构 / Project Structure

```
.
├── content/              # Markdown 内容源文件
│   ├── age-groups/       # 年龄组专项内容 (4个)
│   ├── theory/           # 理论模块 (5个)
│   ├── guidance/         # 指导手册 (2个)
│   ├── resources/        # 资源库 (4个)
│   └── glossary/         # 术语表
├── docs/                 # VuePress 文档站点
│   ├── .vuepress/        # VuePress 配置和主题
│   ├── package.json
│   └── README.md
├── miniprogram/          # 微信小程序
│   ├── pages/            # 小程序页面
│   ├── components/       # 小程序组件
│   ├── utils/            # 工具函数
│   ├── app.js
│   └── app.json
├── scripts/              # 构建和部署脚本
│   ├── validate-content.js
│   ├── generate-images.js
│   ├── build-static.sh
│   └── deploy-cdn.sh
├── tests/                # 测试文件
├── .github/              # CI/CD 配置
└── package.json          # 根 package.json (工作区配置)
```

## 快速开始 / Quick Start

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd sports_training

# 安装所有依赖
npm run install:all
```

### 开发模式

```bash
# 启动 VuePress 开发服务器 (H5 预览)
npm run docs:dev

# 访问 http://localhost:8080
```

### 微信小程序开发

```bash
# 构建小程序 (需要在开发者工具中导入 miniprogram/ 目录)
# 使用微信开发者工具打开 miniprogram/ 文件夹
```

### 构建生产版本

```bash
# 构建静态站点
npm run docs:build

# 验证内容
npm run validate

# 部署到 CDN (需要配置 Aliyun credentials)
npm run deploy
```

## 内容管理 / Content Management

### 内容结构

所有内容以 Markdown 格式存储在 `content/` 目录下，遵循以下命名规范：

```
content/
├── age-groups/
│   ├── 01-enlightenment-4-6/     # 启蒙期 (4-6岁)
│   ├── 02-foundation-7-9/        # 基础期 (7-9岁)
│   ├── 03-development-10-12/     # 发展期 (10-12岁)
│   └── 04-advanced-13-15/        # 提高期 (13-15岁)
└── theory/
    ├── technique-theory/
    ├── physical-training-science/
    ├── injury-prevention/
    ├── nutrition/
    └── psychology/
```

### Frontmatter 元数据

每篇文章需包含以下元数据：

```yaml
---
title: "文章标题"
section: "age-groups"
category: "foundation-7-9"
age_group: [7, 8, 9]
tags: ["体能训练", "速度", "敏捷性"]
author: "专家姓名"
created_date: "2025-11-01"
description: "文章描述 (用于分享和SEO)"
---
```

### AI 图片生成

在 Markdown 中使用特殊标记触发 AI 图片生成：

```markdown
![训练动作](./images/GENERATE:shoulder-rotation-drill.png)
```

运行脚本生成：

```bash
npm run generate-images
```

## 开发指南 / Development Guide

### 代码风格

- JavaScript/TypeScript: ESLint + Prettier
- Vue组件: Vue 3 Composition API
- Markdown: markdownlint

### 运行测试

```bash
# 内容验证测试
npm run validate

# 运行所有测试
npm test
```

### 提交规范

```bash
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复bug"
git commit -m "docs: 更新文档"
git commit -m "style: 代码格式调整"
git commit -m "refactor: 重构代码"
git commit -m "test: 添加测试"
```

## 部署 / Deployment

### 自动部署 (GitHub Actions)

推送到 `main` 分支时自动触发：

1. 内容验证
2. 构建静态站点
3. 部署到 Aliyun OSS + CDN

### 手动部署

```bash
# 1. 构建
npm run build

# 2. 部署到 CDN
npm run deploy
```

## 贡献指南 / Contributing

请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证 / License

MIT License - 详见 [LICENSE](./LICENSE)

## 联系方式 / Contact

如有问题或建议，请通过 Issues 联系我们。

---

**项目状态**: 开发中 (Development)
**版本**: 1.0.0
**最后更新**: 2025-11-10
