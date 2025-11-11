# Docusaurus会员系统集成指南

快速将会员系统集成到Docusaurus项目!

## 🎯 当前状态

✅ **已完成**:
- 3个核心组件 (LoginButton, PremiumGate, PayButton)
- Supabase认证和数据库
- 开发测试模式(无需微信支付)
- 响应式设计 + 暗色模式

⚠️ **简化版本**:
- PayButton使用测试模式(直接开通会员)
- 正式支付功能需要后续集成

---

## 📦 Step 1: 安装依赖 (已完成)

```bash
cd website
npm install @supabase/supabase-js @supabase/auth-helpers-react dayjs react-toastify
```

✅ 依赖已安装!

---

## ⚙️ Step 2: 配置Docusaurus

### 2.1 修改 `docusaurus.config.js`

```javascript
// @ts-check
const {themes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  // ... 现有配置

  webpack: {
    configure: (webpackConfig) => {
      // 解决Supabase兼容性问题
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
      };
      return webpackConfig;
    },
  },

  plugins: [
    // 会员系统插件
    function premiumSystemPlugin() {
      return {
        name: 'premium-system-plugin',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                '@': path.resolve(__dirname, 'src'),
              },
            },
          };
        },
      };
    },
  ],
};

module.exports = config;
```

### 2.2 创建 `src/theme/Root.js`

```jsx
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </AuthProvider>
  );
}
```

### 2.3 自定义导航栏组件

`src/theme/Navbar/Content/index.js`:

```jsx
import React from 'react';
import Content from '@theme-original/Navbar/Content';
import LoginButton from '@/components/LoginButton';

export default function ContentWrapper(props) {
  return (
    <>
      <Content {...props} />
      <div style={{ marginLeft: 'auto', paddingLeft: '12px' }}>
        <LoginButton showUserInfo={true} />
      </div>
    </>
  );
}
```

---

## 🔐 Step 3: 配置Supabase

### 3.1 创建Supabase项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写:
   - Name: `badminton-knowledge`
   - Database Password: `强密码`
   - Region: `Southeast Asia (Singapore)`
4. 等待项目创建(~2分钟)

### 3.2 初始化数据库

1. 进入 SQL Editor
2. 复制 `supabase-schema.sql` 内容
3. 点击 RUN
4. 看到 "✅ Database schema initialized successfully!"

### 3.3 配置环境变量

创建 `.env.local`:

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

获取方式:
- Settings → API → Project URL
- Settings → API → anon public key

---

## 🎨 Step 4: 使用组件

### 4.1 在MDX中保护内容

```mdx
---
title: 高级训练技巧
---

import { PremiumContent } from '@/components/PremiumGate';

## 免费内容

所有人都可以看...

<PremiumContent level="member">

## 会员专属

只有会员能看到这里的内容...

</PremiumContent>

<PremiumContent level="vip">

## VIP专属

只有VIP能看到这里的内容...

</PremiumContent>
```

### 4.2 创建定价页面

`src/pages/pricing.mdx`:

```mdx
---
title: 会员订阅
---

import { PayButton } from '@/components';

# 升级会员,解锁完整内容

<div style="display: flex; gap: 20px; margin: 40px 0;">
  <div style="flex: 1; border: 2px solid #667eea; borderRadius: 12px; padding: 24px;">
    <h3>普通会员</h3>
    <div style="fontSize: 36px; fontWeight: bold; color: #667eea;">¥19.9<span style="fontSize: 16px;">/月</span></div>
    <ul>
      <li>✅ 完整知识库访问</li>
      <li>✅ AI助手无限使用</li>
      <li>✅ 训练计划定制</li>
    </ul>
    <PayButton plan="member" />
  </div>

  <div style="flex: 1; border: 2px solid #f5576c; borderRadius: 12px; padding: 24px;">
    <h3>VIP会员</h3>
    <div style="fontSize: 36px; fontWeight: bold; color: #f5576c;">¥199<span style="fontSize: 16px;">/年</span></div>
    <ul>
      <li>✅ 以上所有权益</li>
      <li>✅ 1对1在线答疑</li>
      <li>✅ 线下活动优先</li>
    </ul>
    <PayButton plan="vip" />
  </div>
</div>
```

### 4.3 在React组件中使用

```tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumGate } from '@/components';

export default function MyComponent() {
  const { user, subscription } = useAuth();

  return (
    <div>
      {user && <p>欢迎, {subscription?.plan}用户!</p>}

      <PremiumGate requiredRole="member">
        <h2>会员专属功能</h2>
        <p>这里的内容只有会员能看到</p>
      </PremiumGate>
    </div>
  );
}
```

---

## 🧪 Step 5: 测试

### 5.1 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5.2 测试流程

1. **测试登录**:
   - 点击右上角"登录"按钮
   - ⚠️ 微信登录需要配置(可选)
   - 暂时可以直接在Supabase创建测试用户

2. **Supabase创建测试用户**:
   ```sql
   -- 在Supabase SQL Editor执行
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     confirmation_sent_at,
     confirmation_token,
     recovery_token,
     email_change_token_new,
     email_change
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'test@example.com',
     crypt('password123', gen_salt('bf')),
     NOW(),
     NOW(),
     '',
     '',
     '',
     ''
   );
   ```

3. **测试会员开通**:
   - 登录后访问 `/pricing`
   - 点击"订阅会员"
   - 点击"🧪 测试开通"
   - 看到"开通成功"提示

4. **测试内容保护**:
   - 访问带 `<PremiumContent>` 的页面
   - 免费用户看到付费墙
   - 会员用户看到完整内容

---

## 🔧 Step 6: 安装Webpack Polyfills

如果遇到crypto/stream错误:

```bash
npm install crypto-browserify stream-browserify buffer
```

---

## 📝 常见问题

### Q: 构建时报 "Module not found" 错误

**A**: 检查路径别名配置,确保 `@/` 指向 `src/`

### Q: Toast通知不显示

**A**: 确保在 `Root.js` 中导入了CSS:
```javascript
import 'react-toastify/dist/ReactToastify.css';
```

### Q: 组件样式不生效

**A**: 检查CSS文件是否正确导入

### Q: 登录后刷新页面会话丢失

**A**: Supabase会自动持久化会话,检查浏览器存储是否被禁用

---

## 🚀 生产部署

### Vercel部署

```bash
vercel --prod

# 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy build --project-name=badminton-kb
```

---

## 📈 下一步

### 集成微信登录

1. 申请微信开放平台账号
2. 在Supabase配置WeChat Provider
3. 更新环境变量

### 集成真实支付

可选方案:
- **Supabase Edge Functions** + 微信支付
- **外部支付服务** (如Stripe, Paddle)
- **第三方支付网关**

参考文档: `docs/monetization-plan.md`

---

## ✅ 完成!

现在你已经:
- ✅ 配置好Docusaurus
- ✅ 集成了Supabase认证
- ✅ 实现了内容访问控制
- ✅ 添加了会员管理功能

开始构建你的会员系统吧! 🎉
