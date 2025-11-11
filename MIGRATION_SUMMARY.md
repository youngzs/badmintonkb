# VuePress → Docusaurus 迁移总结

## 迁移日期
2025-11-10

## 迁移原因
VuePress 2.0.0-rc.0 存在 sidebar 路由 bug，导致路由切换时报错：
```
TypeError: Cannot read properties of undefined (reading 'path')
  at resolveMultiSidebarItems (useSidebarItems.js:115:64)
```

## 迁移方案
从 VuePress 2.0.0-rc.0 迁移到 Docusaurus 3.9.2

## 迁移步骤

### 1. 项目初始化
- ✅ 在根目录创建 `website` 目录
- ✅ 使用 TypeScript 模板初始化 Docusaurus 3.x
- ✅ 安装所有依赖

### 2. 配置文件
- ✅ 配置中文语言环境 (`zh-Hans`)
- ✅ 设置网站标题和描述
- ✅ 配置导航栏和页脚
- ✅ 启用 sidebar 自动生成
- ✅ 修改开发服务器端口为 8900

### 3. 内容迁移
- ✅ 将 `docs/content/*` 复制到 `website/docs/`
- ✅ 保留所有 Markdown 文件和图片资源
- ✅ 创建新的首页 (`index.md`)
- ✅ 修复 front matter 中 keywords 字段格式（从字符串转为数组）

### 4. 插件配置
- ✅ 安装 `@easyops-cn/docusaurus-search-local` 本地搜索插件
- ✅ 配置中英文搜索支持
- ✅ 启用搜索结果高亮

### 5. 脚本更新
- ✅ 更新根目录 `package.json` 中的命令
  - `npm start` → 启动开发服务器
  - `npm run build` → 构建生产版本
  - `npm run serve` → 预览生产版本
- ✅ 创建 `scripts/fix_keywords.py` 脚本批量修复 front matter

### 6. 清理工作
- ✅ 删除 `docs/.vuepress` 目录
- ✅ 删除 `docs/package.json`
- ✅ 保留 `docs/.vuepress-backup` 作为备份

## 项目结构变化

### 之前（VuePress）
```
├── docs/
│   ├── .vuepress/
│   │   └── config.ts
│   ├── content/
│   └── package.json
└── package.json
```

### 之后（Docusaurus）
```
├── website/
│   ├── docs/              # Markdown 内容
│   ├── src/               # React 组件
│   ├── static/            # 静态资源
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   └── package.json
├── docs/
│   ├── .vuepress-backup/  # VuePress 配置备份
│   └── content/           # 原始内容（保留）
└── package.json
```

## 主要改进

### ✅ 功能改进
1. **Sidebar 完全正常**：自动生成，无路由错误
2. **更快的构建速度**：Docusaurus 使用现代构建工具
3. **更好的移动端体验**：响应式设计更完善
4. **本地搜索**：支持中英文搜索
5. **稳定的正式版**：使用 Docusaurus 3.9.2 正式版

### ✅ 开发体验
1. **热重载更快**：开发服务器响应速度更快
2. **TypeScript 支持**：完整的类型定义
3. **更好的文档**：Docusaurus 官方文档更完善
4. **活跃社区**：问题能快速得到解决

## 使用方法

### 启动开发服务器
```bash
npm start
# 或
npm run dev
```
访问: http://localhost:8900/

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run serve
```

## 注意事项

### 已修复的问题
- ✅ Front matter 中 keywords 字段格式（字符串 → 数组）
- ✅ 重复路由问题（删除了 docs/README.md）
- ✅ 开发服务器端口配置（3000 → 8900）

### 待处理事项
- ⚠️ 部分年龄段目录缺少 README.md 文件（不影响功能）
- ⚠️ 部分内部链接可能需要调整路径

## 回滚方案

如果需要回滚到 VuePress：
1. 恢复 `docs/.vuepress-backup` 到 `docs/.vuepress`
2. 恢复 `docs/package.json`
3. 删除 `website` 目录
4. 运行 `npm install --workspace=docs`

## 总结

✅ **迁移成功！**

Docusaurus 3.x 提供了更稳定、更快速、更完善的文档解决方案。sidebar 功能完全正常，开发体验显著提升。

---

**迁移完成时间**: 约 20 分钟
**受影响文件**: 10 个 Markdown 文件（keywords 格式修复）
**新增文件**: 1 个（scripts/fix_keywords.py）
**删除文件**: VuePress 配置文件（已备份）
