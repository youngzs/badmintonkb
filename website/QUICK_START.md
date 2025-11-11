# 会员系统 - 5分钟快速上手

最快速度体验会员系统功能!

## 🚀 超快启动 (3步)

### Step 1: 安装依赖 (1分钟)

```bash
cd website
npm run install-premium
```

### Step 2: 配置环境 (2分钟)

```bash
# 复制配置文件
cp .env.example .env.local

# 编辑配置(最小配置)
nano .env.local
```

最小配置:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Step 3: 启动测试 (1分钟)

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📝 组件使用示例

### 1. 添加登录按钮

```tsx
import LoginButton from '@/components/LoginButton';

function Header() {
  return (
    <nav>
      <LoginButton showUserInfo={true} />
    </nav>
  );
}
```

### 2. 保护内容

```tsx
import { PremiumGate } from '@/components/PremiumGate';

function Article() {
  return (
    <div>
      <h1>文章标题</h1>
      <p>免费内容...</p>

      <PremiumGate requiredRole="member">
        <p>会员专属内容...</p>
      </PremiumGate>
    </div>
  );
}
```

### 3. 添加支付按钮

```tsx
import PayButton from '@/components/PayButton';

function Pricing() {
  return (
    <div>
      <PayButton plan="member" />
      <PayButton plan="vip" />
    </div>
  );
}
```

### 4. MDX中使用

```mdx
import { PremiumContent } from '@/components/PremiumGate';

## 免费内容

这里所有人都能看...

<PremiumContent level="member">

## 会员内容

这里只有会员能看...

</PremiumContent>
```

---

## 🎯 核心API

### AuthContext

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, subscription, signIn, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <p>欢迎, {user.email}</p>
      ) : (
        <button onClick={() => signIn('wechat')}>登录</button>
      )}

      {subscription && (
        <p>当前计划: {subscription.plan}</p>
      )}
    </div>
  );
}
```

### useRequireAuth Hook

```tsx
import { useRequireAuth } from '@/contexts/AuthContext';

function VipContent() {
  const { hasAccess, loading } = useRequireAuth('vip');

  if (loading) return <div>加载中...</div>;
  if (!hasAccess) return <div>需要VIP权限</div>;

  return <div>VIP专属内容</div>;
}
```

---

## 🛠️ 工具函数

```tsx
import {
  formatDate,
  formatPrice,
  daysRemaining,
  getPlanName,
  getPlanColor
} from '@/utils/helpers';

// 格式化日期
formatDate(new Date()); // "2024年1月1日"

// 格式化价格
formatPrice(1990); // "¥19.90"

// 剩余天数
daysRemaining('2024-12-31'); // 365

// 获取计划名称
getPlanName('vip'); // "VIP会员"

// 获取计划颜色
getPlanColor('member'); // "#667eea"
```

---

## 📦 文件结构

```
website/
├── src/
│   ├── components/          # 组件
│   │   ├── LoginButton.tsx
│   │   ├── PremiumGate.tsx
│   │   └── PayButton.tsx
│   │
│   ├── contexts/            # 上下文
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                 # 核心库
│   │   └── supabase.ts
│   │
│   ├── pages/api/           # API路由
│   │   └── payment/
│   │       ├── create.ts
│   │       ├── status.ts
│   │       └── webhook.ts
│   │
│   ├── utils/               # 工具函数
│   │   └── helpers.ts
│   │
│   └── styles/              # 样式
│       └── globals.css
│
├── .env.example             # 环境变量模板
├── supabase-schema.sql      # 数据库结构
└── package-premium.json     # 依赖清单
```

---

## ✅ 检查清单

部署前确保:

- [ ] Supabase项目已创建
- [ ] 数据库表已初始化
- [ ] 环境变量已配置
- [ ] 依赖已安装
- [ ] 本地测试通过
- [ ] 微信支付已配置(可选)

---

## 🐛 快速调试

### 问题: 组件不显示

```bash
# 检查导入路径
# 确保使用了正确的别名 @/
```

### 问题: 认证失败

```bash
# 检查Supabase URL和Key
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 问题: 样式不生效

```tsx
// 确保在_app.tsx中导入了全局样式
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
```

---

## 📚 完整文档

- 详细部署指南: `PREMIUM_SETUP.md`
- 商业化方案: `docs/monetization-plan.md`

---

## 🎉 完成!

现在你已经:
- ✅ 安装了所有依赖
- ✅ 配置了基础环境
- ✅ 了解了核心API
- ✅ 知道如何使用组件

开始构建你的会员系统吧! 💪
