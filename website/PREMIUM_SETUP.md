# 羽毛球知识库会员系统 - 完整部署指南

本指南将帮助你一步步部署完整的会员系统。

## 📋 目录

1. [系统架构](#系统架构)
2. [前置准备](#前置准备)
3. [Supabase配置](#supabase配置)
4. [微信支付配置](#微信支付配置)
5. [代码集成](#代码集成)
6. [部署上线](#部署上线)
7. [测试验证](#测试验证)
8. [常见问题](#常见问题)

---

## 系统架构

```
┌─────────────┐
│  Docusaurus │  静态文档站点
│   Website   │
└──────┬──────┘
       │
       ├─── 组件层
       │    ├─ LoginButton (微信登录)
       │    ├─ PremiumGate (内容保护)
       │    └─ PayButton (支付)
       │
       ├─── API层 (/api/payment)
       │    ├─ create.ts (创建订单)
       │    ├─ status.ts (查询状态)
       │    └─ webhook.ts (支付回调)
       │
       ├─── 数据层 (Supabase)
       │    ├─ subscriptions (订阅表)
       │    └─ payment_logs (支付记录)
       │
       └─── 支付层 (微信支付)
            └─ Native API (二维码支付)
```

---

## 前置准备

### 1. 环境要求

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.40.0
```

### 2. 账号准备

- ✅ Supabase账号 (https://supabase.com)
- ✅ 微信公众平台账号 (https://mp.weixin.qq.com)
- ✅ 微信支付商户号 (https://pay.weixin.qq.com)
- ✅ 域名 (需备案)

---

## Supabase配置

### Step 1: 创建Supabase项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写项目信息:
   - Name: `badminton-knowledge`
   - Database Password: `保存好密码!`
   - Region: `Southeast Asia (Singapore)` (国内访问较快)
4. 点击 "Create new project"

### Step 2: 配置数据库

1. 在Supabase控制台,进入 "SQL Editor"
2. 创建新查询
3. 复制 `supabase-schema.sql` 的内容
4. 点击 "Run" 执行

验证:
```sql
-- 检查表是否创建成功
SELECT * FROM public.subscriptions;
SELECT * FROM public.payment_logs;
```

### Step 3: 获取API密钥

1. 进入 "Settings" > "API"
2. 复制以下信息:
   - `Project URL`: https://xxx.supabase.co
   - `anon public`: eyJhbGc...
   - `service_role`: eyJhbGc... (仅用于服务端)

### Step 4: 配置认证

1. 进入 "Authentication" > "Providers"
2. 找到 "WeChat"
3. 启用并配置:
   - App ID: `你的微信AppID`
   - App Secret: `你的微信AppSecret`
   - Redirect URL: 复制显示的URL

---

## 微信支付配置

### Step 1: 申请微信支付

1. 登录微信支付商户平台
2. 产品中心 > 我的产品 > Native支付
3. 申请开通 (需营业执照)

### Step 2: 下载API证书

1. 账户中心 > API安全 > 下载证书
2. 将证书保存到 `website/certs/` 目录:
   ```
   website/
   └── certs/
       ├── apiclient_cert.pem
       ├── apiclient_key.pem
       └── apiclient_cert.p12
   ```

### Step 3: 配置API密钥

1. 账户中心 > API安全 > 设置密钥
2. 设置32位APIv3密钥
3. 保存好密钥!

### Step 4: 获取配置信息

记录以下信息:
- `AppID`: wx1234567890abcdef
- `商户号(mchid)`: 1234567890
- `API证书序列号`: 5ABC123...
- `APIv3密钥`: your-api-v3-key-32-chars-long

---

## 代码集成

### Step 1: 安装依赖

```bash
cd website

# 安装会员系统依赖
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install wechatpay-node-v3 dayjs react-toastify
```

### Step 2: 配置环境变量

复制 `.env.example` 到 `.env.local`:

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 微信支付
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-secret
WECHAT_MCHID=1234567890
WECHAT_SERIAL_NO=5ABC123...
WECHAT_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHAT_API_V3_KEY=your-api-v3-key-32-chars-long

# 站点
NEXT_PUBLIC_SITE_URL=https://badminton.yourdomain.com

# 定价(分)
MEMBER_MONTHLY_PRICE=1990
VIP_YEARLY_PRICE=19900
```

### Step 3: 集成到Docusaurus

#### 3.1 修改 `docusaurus.config.js`

```javascript
module.exports = {
  // ... 现有配置

  // 添加主题配置
  themeConfig: {
    // ... 现有配置

    // 添加顶部导航登录按钮
    navbar: {
      items: [
        // ... 现有导航项
        {
          type: 'custom-loginButton',
          position: 'right',
        },
      ],
    },
  },

  // 添加插件
  plugins: [
    // 自定义组件注入
    function premiumSystemPlugin() {
      return {
        name: 'premium-system',
        getClientModules() {
          return [
            require.resolve('./src/contexts/AuthContext.tsx'),
            require.resolve('./src/styles/globals.css'),
          ];
        },
      };
    },
  ],
};
```

#### 3.2 创建主题组件包装

`src/theme/Root.tsx`:

```tsx
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}
```

#### 3.3 自定义导航组件

`src/theme/Navbar/NavbarItem/CustomLoginButton.tsx`:

```tsx
import React from 'react';
import LoginButton from '@/components/LoginButton';

export default function CustomLoginButton() {
  return <LoginButton showUserInfo={true} />;
}
```

#### 3.4 标记高级内容

在MDX文档中使用:

```mdx
---
title: 高级训练技巧
premium: true
---

import { PremiumContent } from '@/components/PremiumGate';

## 基础内容(所有人可见)

这里是免费内容...

<PremiumContent level="member">

## 会员专属内容

这里是会员才能看到的内容...

</PremiumContent>

<PremiumContent level="vip">

## VIP专属内容

这里是VIP才能看到的内容...

</PremiumContent>
```

---

## 部署上线

### 方案1: Vercel部署 (推荐)

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... 添加所有环境变量

# 5. 重新部署
vercel --prod
```

### 方案2: Cloudflare Pages

```bash
# 1. 构建
npm run build

# 2. 部署到Cloudflare Pages
npx wrangler pages deploy build --project-name=badminton-kb

# 3. 在Cloudflare控制台配置环境变量
```

### 方案3: 自托管

```bash
# 1. 构建
npm run build

# 2. 使用Nginx部署
sudo cp -r build/* /var/www/badminton/

# 3. 配置Nginx
# /etc/nginx/sites-available/badminton

server {
    listen 80;
    server_name badminton.yourdomain.com;

    root /var/www/badminton;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 4. 重启Nginx
sudo systemctl restart nginx
```

---

## 测试验证

### 1. 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

测试清单:
- [ ] 点击"登录"按钮能正常弹窗
- [ ] 微信登录流程正常(需要配置本地域名)
- [ ] 登录后显示用户信息
- [ ] 高级内容显示付费墙
- [ ] 点击"订阅"能生成二维码
- [ ] 使用沙箱环境测试支付

### 2. 生产测试

1. **支付测试**:
   - 使用微信支付沙箱环境
   - 扫码支付¥0.01测试
   - 验证回调处理

2. **权限测试**:
   - 免费用户: 只能看基础内容
   - 会员: 能看会员内容
   - VIP: 能看所有内容

3. **过期测试**:
   - 修改数据库订阅到期时间
   - 验证过期后权限降级

---

## 常见问题

### Q1: 微信登录报"redirect_uri参数错误"

**A**: 检查以下配置:
1. Supabase AuthRedirect URL设置正确
2. 微信公众平台授权回调域名已配置
3. 域名需要备案

### Q2: 支付回调没有触发

**A**:
1. 检查webhook URL是否公网可访问
2. 查看Supabase日志
3. 微信支付后台查看通知记录

### Q3: 订阅状态不更新

**A**:
1. 检查 `process_payment` 函数是否执行成功
2. 查看 `payment_logs` 表状态
3. 前端调用 `refreshSubscription()`

### Q4: 本地开发无法测试支付

**A**:
使用内网穿透工具:
```bash
# 使用ngrok
ngrok http 3000

# 或使用localtunnel
npx localtunnel --port 3000
```

### Q5: 部署后样式丢失

**A**:
检查CSS导入路径和构建配置。

---

## 下一步优化

1. **性能优化**:
   - CDN加速
   - 图片懒加载
   - 代码分割

2. **功能增强**:
   - 添加手机号登录
   - 实现优惠券系统
   - 增加推荐返利

3. **运营工具**:
   - 数据分析看板
   - 用户留存报告
   - 收入统计

4. **用户体验**:
   - 添加引导动画
   - 优化移动端体验
   - 增加离线支持

---

## 技术支持

遇到问题?

- 📧 邮件: support@yourdomain.com
- 💬 微信群: 扫码加入开发者群
- 📚 文档: https://docs.yourdomain.com

---

**祝你部署顺利! 🎉**
