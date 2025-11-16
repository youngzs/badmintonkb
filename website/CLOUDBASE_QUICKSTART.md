# CloudBase 快速上手指南

## 🚀 5分钟快速开始

### Step 1: 安装 CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

### Step 2: 登录腾讯云

```bash
cloudbase login
```

### Step 3: 创建环境

```bash
# 方式1：通过CLI创建
cloudbase env:create badminton-prod --alias="羽毛球知识库生产环境"

# 方式2：在控制台创建
# https://console.cloud.tencent.com/tcb
```

### Step 4: 配置环境变量

```bash
# 复制环境变量模板
cp .env.cloudbase.example .env.local

# 编辑 .env.local，填入您的配置
# NEXT_PUBLIC_CLOUDBASE_ENV_ID=your-env-id
# NEXT_PUBLIC_WECHAT_APPID=wxXXXXXXXXXXXXXXXX
```

### Step 5: 安装依赖

```bash
cd website
npm install @cloudbase/js-sdk
```

### Step 6: 初始化数据库

#### 6.1 创建集合

在 [CloudBase 控制台](https://console.cloud.tencent.com/tcb) 中：

1. 进入 **云数据库** → **集合管理**
2. 创建两个集合：
   - `subscriptions` - 用户订阅信息
   - `payment_logs` - 支付记录

#### 6.2 配置安全规则

**subscriptions 集合**：

```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

**payment_logs 集合**：

```json
{
  "read": "auth.openid == doc._openid",
  "write": false
}
```

### Step 7: 部署云函数

```bash
# 部署所有云函数
cloudbase functions:deploy payment-create
cloudbase functions:deploy payment-callback
cloudbase functions:deploy check-subscription
cloudbase functions:deploy expire-subscriptions
```

### Step 8: 配置定时触发器

```bash
# 为过期订阅检查函数配置定时触发器（每小时执行一次）
cloudbase functions:config:update expire-subscriptions \
  --triggers '[{"name":"timer","config":"0 * * * * * *"}]'
```

### Step 9: 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 测试！

---

## 🎯 核心功能测试

### 1. 测试微信登录

```javascript
import { cloudbase } from '@/lib/cloudbase';

// 测试匿名登录（开发环境）
await cloudbase.auth.signInAnonymously();

// 生产环境：微信登录
await cloudbase.auth.signInWithWeChat();
```

### 2. 测试订阅查询

```javascript
import { cloudbase } from '@/lib/cloudbase';

const subscription = await cloudbase.subscription.getUserSubscription();
console.log('订阅信息:', subscription);
```

### 3. 测试支付流程

```javascript
import { cloudbase } from '@/lib/cloudbase';

// 创建支付订单
const result = await cloudbase.payment.createOrder('member', 1990);
console.log('支付二维码:', result.data.codeUrl);
```

---

## 📦 云函数本地测试

### 使用 CloudBase CLI 本地调试

```bash
# 启动本地云函数模拟器
cloudbase functions:invoke payment-create --params '{
  "plan": "member",
  "amount": 1990
}'
```

---

## 🌐 部署到生产环境

### 方式1: 一键部署

```bash
# 在项目根目录执行
cloudbase framework deploy
```

### 方式2: 分步部署

```bash
# 1. 构建网站
cd website
npm run build

# 2. 部署静态网站到 CloudBase 静态托管
cloudbase hosting deploy build -e your-env-id

# 3. 部署云函数
cd ..
cloudbase functions:deploy payment-create
cloudbase functions:deploy payment-callback
cloudbase functions:deploy check-subscription
cloudbase functions:deploy expire-subscriptions
```

---

## 🔧 常见问题

### Q1: 本地开发如何测试微信登录？

**A**: 开发环境使用匿名登录代替：

```typescript
// src/lib/cloudbase.ts
if (process.env.NODE_ENV === 'development') {
  await auth.anonymousAuthProvider().signIn();
} else {
  await auth.weixinAuthProvider().signIn();
}
```

### Q2: 云函数如何调试？

**A**: 使用 CloudBase CLI 本地调试：

```bash
cloudbase functions:invoke function-name --params '{"key": "value"}'
```

或在控制台查看云函数日志：

**云开发控制台** → **云函数** → **日志**

### Q3: 数据库安全规则如何配置？

**A**:

1. 进入 **云数据库** → **集合管理**
2. 选择集合 → **权限设置**
3. 使用以下规则模板：

```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

### Q4: 如何查看用户订阅数据？

**A**:

```bash
# 使用 CloudBase CLI 查询
cloudbase database:query subscriptions '{
  "user_id": "user-xxx"
}'
```

或在控制台 **云数据库** → **数据管理** 中查看。

### Q5: 支付回调没有触发怎么办？

**A**:

1. 检查微信支付配置：商户平台 → API安全 → 回调地址
2. 查看云函数日志：控制台 → 云函数 → payment-callback → 日志
3. 确保云函数部署成功：`cloudbase functions:list`

---

## 📊 监控与运维

### 查看云函数调用统计

```bash
cloudbase functions:stat payment-create
```

### 查看数据库用量

```bash
cloudbase database:stat
```

### 导出用户数据

```bash
cloudbase database:export subscriptions subscriptions.json
```

---

## 🎓 学习资源

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
- [云开发 Web SDK](https://docs.cloudbase.net/api-reference/webv2/initialization.html)
- [云函数开发指南](https://docs.cloudbase.net/cloud-function/introduce.html)

---

## ✅ 检查清单

部署前确认：

- [ ] CloudBase 环境已创建
- [ ] 数据库集合已创建（subscriptions, payment_logs）
- [ ] 安全规则已配置
- [ ] 云函数已部署
- [ ] 定时触发器已配置
- [ ] 环境变量已设置
- [ ] 微信登录已配置
- [ ] 微信支付已开通
- [ ] 本地测试通过

---

**准备好了吗？开始您的 CloudBase 之旅！** 🚀
