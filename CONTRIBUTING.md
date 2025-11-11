# 贡献指南 / Contributing Guide

感谢您对青少年羽毛球训练知识库平台的关注！

## 如何贡献

### 报告问题

如果您发现任何bug或有功能建议，请通过 [GitHub Issues](../../issues) 提交。

提交时请包含：
- 问题描述
- 复现步骤 (如果是bug)
- 期望行为
- 实际行为
- 环境信息 (浏览器版本、Node.js版本等)

### 贡献代码

1. **Fork 本仓库**

2. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **进行更改**
   - 遵循代码风格指南
   - 添加必要的测试
   - 更新相关文档

4. **提交更改**
   ```bash
   git commit -m "feat: 简短描述您的更改"
   ```

5. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**

## 代码风格

### JavaScript/TypeScript

- 使用 ES2021+ 语法
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 运行 `npm run lint:fix` 自动修复

### Vue 组件

- 使用 Vue 3 Composition API
- 组件文件使用 PascalCase 命名
- Props 和 events 使用 kebab-case

### Markdown

- 使用 markdownlint 规则
- 中英文之间添加空格
- 代码块指定语言

## 内容贡献

### 添加训练内容

1. 在对应的 `content/` 子目录下创建 Markdown 文件
2. 添加完整的 frontmatter 元数据
3. 使用正确的图片引用格式
4. 运行 `npm run validate` 验证内容

### Frontmatter 规范

```yaml
---
title: "文章标题"
section: "age-groups|theory|guidance|resources"
category: "具体分类"
age_group: [7, 8, 9]  # 适用年龄
tags: ["标签1", "标签2"]
author: "作者姓名"
created_date: "YYYY-MM-DD"
description: "简短描述"
---
```

## 测试

### 运行测试

```bash
# 内容验证
npm run validate

# 所有测试
npm test
```

### 添加测试

- 单元测试位于 `tests/` 目录
- E2E测试位于 `tests/e2e/` 目录
- 测试覆盖率目标: 80%+

## Pull Request 流程

1. 确保所有测试通过
2. 更新相关文档
3. 清晰描述 PR 的目的和变更
4. 关联相关 Issue (如果有)
5. 等待代码审查

## 许可证

贡献的代码将使用与项目相同的 MIT 许可证。

## 问题？

如有疑问，欢迎在 Issues 中提问或联系维护者。

感谢您的贡献！ 🎉
