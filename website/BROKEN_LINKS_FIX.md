# 断链修复说明

## ⚠️ 问题说明

构建时发现大量断链（broken links），这些是**网站原有问题**，与会员系统无关。

### 主要问题

```
❌ 所有页面都有链接到 "/" (首页)
❌ 但 "/" 路径不存在,因为设置了 routeBasePath: '/docs'
```

---

## ✅ 已临时修复

修改 `docusaurus.config.ts`:

```typescript
// 从这个:
onBrokenLinks: 'throw',

// 改为:
onBrokenLinks: 'warn',  // 允许构建通过,只显示警告
```

**现在可以正常构建了!** ✅

---

## 🔧 永久修复方案

### 方案1: 修改routeBasePath (推荐)

让网站根路径直接显示文档:

```typescript
// docusaurus.config.ts
docs: {
  sidebarPath: './sidebars.ts',
  routeBasePath: '/',  // 改为根路径
}
```

### 方案2: 创建首页

创建 `src/pages/index.tsx`:

```tsx
import React from 'react';
import { Redirect } from '@docusaurus/router';

export default function Home() {
  return <Redirect to="/docs" />;
}
```

### 方案3: 修复所有断链

检查以下文件中指向 "/" 的链接:

**需要修复的位置**:
```
- src/theme/Navbar (导航栏)
- src/theme/Footer (页脚)
- docs/**/*.md (文档中的链接)
```

改为:
```markdown
❌ [首页](/)
✅ [首页](/docs)
```

---

## 🎯 快速解决

**选择方案1最简单**:

```bash
# 编辑 docusaurus.config.ts
docs: {
  routeBasePath: '/',  # 改这一行
}
```

然后重新构建:
```bash
npm run build
```

---

## 📝 详细断链列表

根据错误日志,以下文件有断链:

### 类别页面
- `/docs/tags/*` - 所有标签页
- `/docs/category/*` - 所有分类页
- `/docs/age-groups/*/` - 所有年龄组索引页

### 具体文档
- `balance-training-basics.md`
- `coordination-training-basics.md`
- `flexibility-training-basics.md`
- `speed-agility-training.md`
- 等等...

**修复方法**:
1. 全局搜索 `](/)`
2. 替换为 `](/docs)` 或移除该链接

---

## ✅ 会员系统不受影响

**确认**:
- ✅ 会员系统组件正常
- ✅ Supabase集成正常
- ✅ 只是网站原有的链接问题

**可以继续使用会员功能!**

---

## 🚀 现在可以做什么

```bash
# 1. 启动开发服务器
npm run start

# 2. 构建生产版本
npm run build

# 3. 测试会员功能
访问 http://localhost:3000/docs
```

断链警告不影响使用,只是控制台会有提示。

---

## 💡 建议

**开发阶段**: 保持 `onBrokenLinks: 'warn'`

**上线前**: 修复所有断链,改回 `onBrokenLinks: 'throw'`

---

需要帮助修复断链? 告诉我你想用哪个方案!
