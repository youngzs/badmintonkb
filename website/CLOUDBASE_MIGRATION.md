# 腾讯云 CloudBase 迁移方案

## 📋 迁移概览

从 Supabase 迁移到腾讯云 CloudBase，利用国内服务优势，提升用户体验。

---

## 🎯 CloudBase 架构设计

```
┌─────────────────────────────────────────────────┐
│           Docusaurus Website (前端)              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ LoginButton │  │ PremiumGate  │  │PayButton│ │
│  └──────┬──────┘  └──────┬───────┘  └────┬────┘ │
└─────────┼─────────────────┼───────────────┼──────┘
          │                 │               │
          ▼                 ▼               ▼
┌─────────────────────────────────────────────────┐
│         CloudBase SDK (@cloudbase/js-sdk)       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  认证服务 │  │ 数据库   │  │  云函数 SCF   │ │
│  │  Auth    │  │ Database │  │  Functions    │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
└─────────────────────────────────────────────────┘
          │                 │               │
          ▼                 ▼               ▼
┌─────────────────────────────────────────────────┐
│            腾讯云 CloudBase 后端                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ 微信登录  │  │ 云数据库  │  │  微信支付     │ │
│  │ (原生)   │  │ (MongoDB)│  │  (原生集成)   │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 📦 核心模块映射

### 1. 用户认证模块

**Supabase → CloudBase**

| Supabase | CloudBase | 说明 |
|----------|-----------|------|
| `supabase.auth.signInWithOAuth()` | `app.auth().weixinAuthProvider()` | 微信登录 |
| `supabase.auth.getUser()` | `app.auth().currentUser` | 获取当前用户 |
| `supabase.auth.signOut()` | `app.auth().signOut()` | 登出 |
| `supabase.auth.onAuthStateChange()` | `app.auth().onLoginStateChanged()` | 监听状态 |

### 2. 数据库模块

**Supabase (PostgreSQL) → CloudBase (云数据库)**

| Supabase | CloudBase | 说明 |
|----------|-----------|------|
| `supabase.from('subscriptions').select()` | `db.collection('subscriptions').get()` | 查询 |
| `supabase.from('subscriptions').insert()` | `db.collection('subscriptions').add()` | 插入 |
| `supabase.from('subscriptions').update()` | `db.collection('subscriptions').doc().update()` | 更新 |
| RLS (Row Level Security) | 安全规则 (自定义) | 权限控制 |

### 3. 支付模块

**优势：CloudBase 原生支持微信支付**

```javascript
// CloudBase 云函数调用微信支付
exports.main = async (event, context) => {
  const cloud = require('wx-server-sdk');
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

  const res = await cloud.cloudPay.unifiedOrder({
    body: '会员订阅',
    outTradeNo: 'ORDER_' + Date.now(),
    spbillCreateIp: '127.0.0.1',
    subMchId: '您的子商户号',
    totalFee: 1990, // 19.90元
    envId: 'your-env-id',
    functionName: 'pay_callback'
  });

  return res;
};
```

---

## 🔄 数据库结构迁移

### Supabase PostgreSQL Schema

```sql
-- subscriptions 表
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID,
    plan TEXT,
    status TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

-- payment_logs 表
CREATE TABLE payment_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    order_no TEXT,
    amount INTEGER,
    status TEXT
);
```

### CloudBase 云数据库 Schema (MongoDB)

```javascript
// subscriptions 集合
{
  _id: "auto-generated",
  _openid: "用户openid",
  user_id: "用户ID",
  plan: "free|member|vip",
  status: "active|expired|cancelled",
  expires_at: ISODate("2025-12-31T23:59:59Z"),
  created_at: ISODate("2025-01-01T00:00:00Z"),
  updated_at: ISODate("2025-01-01T00:00:00Z")
}

// payment_logs 集合
{
  _id: "auto-generated",
  _openid: "用户openid",
  user_id: "用户ID",
  order_no: "ORDER_123456",
  amount: 1990,
  plan: "member",
  status: "pending|success|failed",
  transaction_id: "微信交易ID",
  created_at: ISODate("2025-01-01T00:00:00Z")
}
```

**安全规则示例**：

```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

---

## 💻 代码实现对比

### 原 Supabase 实现

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 获取用户订阅
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}
```

### 新 CloudBase 实现

```typescript
// src/lib/cloudbase.ts
import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID
});

const auth = app.auth();
const db = app.database();

// 获取用户订阅
export async function getUserSubscription() {
  const user = auth.currentUser;
  if (!user) return null;

  const { data } = await db
    .collection('subscriptions')
    .where({
      user_id: user.uid
    })
    .get();

  return data[0];
}
```

---

## 📁 文件变更清单

### 需要新建的文件

```
website/
├── src/lib/
│   ├── cloudbase.ts                # CloudBase 客户端配置
│   ├── cloudbase-config.ts         # CloudBase 环境变量
│   └── cloudbase-types.ts          # TypeScript 类型定义
│
├── cloudfunctions/                 # 云函数目录
│   ├── payment-create/             # 创建支付订单
│   │   └── index.js
│   ├── payment-callback/           # 支付回调
│   │   └── index.js
│   ├── check-subscription/         # 检查订阅状态
│   │   └── index.js
│   └── expire-subscriptions/       # 定时任务：过期订阅
│       └── index.js
│
└── cloudbaserc.json                # CloudBase 配置文件
```

### 需要修改的文件

```
website/
├── src/components/
│   ├── LoginButton.tsx             # 使用 CloudBase Auth
│   ├── PremiumGate.tsx             # 使用 CloudBase 数据库
│   └── PayButton.tsx               # 使用 CloudBase 云函数
│
├── src/contexts/
│   └── AuthContext.tsx             # 适配 CloudBase API
│
├── package.json                    # 替换依赖
└── .env.local                      # 更新环境变量
```

---

## 🚀 迁移步骤

### Phase 1: 准备工作

1. **申请 CloudBase 服务**
   ```bash
   # 安装 CloudBase CLI
   npm install -g @cloudbase/cli

   # 登录
   cloudbase login

   # 初始化项目
   cloudbase init
   ```

2. **创建环境**
   - 登录 [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
   - 创建新环境
   - 开通服务：云函数、云数据库、云存储

### Phase 2: 数据库迁移

1. **导出 Supabase 数据**
   ```bash
   # 在 Supabase SQL Editor 中执行
   COPY (SELECT * FROM subscriptions) TO '/tmp/subscriptions.csv' CSV HEADER;
   COPY (SELECT * FROM payment_logs) TO '/tmp/payment_logs.csv' CSV HEADER;
   ```

2. **导入 CloudBase 数据库**
   ```bash
   # 使用 CloudBase CLI 导入
   cloudbase database import subscriptions subscriptions.csv
   cloudbase database import payment_logs payment_logs.csv
   ```

### Phase 3: 代码迁移

1. **安装 CloudBase SDK**
   ```bash
   npm uninstall @supabase/supabase-js @supabase/auth-helpers-react
   npm install @cloudbase/js-sdk
   ```

2. **创建适配层**（见下文实现）

3. **更新环境变量**
   ```bash
   # .env.local
   NEXT_PUBLIC_CLOUDBASE_ENV_ID=your-env-id
   NEXT_PUBLIC_CLOUDBASE_APP_SIGN=your-app-sign
   ```

### Phase 4: 云函数部署

1. **创建云函数**（见 cloudfunctions/ 目录）

2. **部署云函数**
   ```bash
   cloudbase functions:deploy payment-create
   cloudbase functions:deploy payment-callback
   cloudbase functions:deploy check-subscription
   cloudbase functions:deploy expire-subscriptions
   ```

3. **配置定时触发器**
   ```bash
   # 每小时检查过期订阅
   cloudbase functions:config:update expire-subscriptions \
     --triggers '{"cron":"0 * * * * * *"}'
   ```

### Phase 5: 测试验证

1. **本地测试**
   ```bash
   npm run dev
   ```

2. **验证清单**
   - [ ] 微信登录正常
   - [ ] 订阅状态查询正常
   - [ ] 支付流程正常
   - [ ] 内容访问控制正常
   - [ ] 过期订阅自动降级

### Phase 6: 上线部署

1. **构建生产版本**
   ```bash
   npm run build
   ```

2. **部署到 CloudBase 静态托管**
   ```bash
   cloudbase hosting deploy build -e your-env-id
   ```

---

## 💰 成本对比

### Supabase (国外服务器)

```yaml
免费版:
  - 500MB 数据库
  - 1GB 文件存储
  - 50,000 月活用户
  限制: 国内访问慢 (200-500ms)

Pro版 ($25/月):
  - 8GB 数据库
  - 100GB 文件存储
  - 100,000 月活用户
```

### CloudBase (国内服务器)

```yaml
按量付费:
  - 数据库: ¥0.07/万次读
  - 云函数: ¥0.0133/GBs
  - 云存储: ¥0.099/GB/月
  - CDN: ¥0.18/GB
  优势: 国内访问快 (<50ms)

免费额度 (每月):
  - 数据库: 5万次读
  - 云函数: 4万GBs
  - 云存储: 5GB
  - CDN: 5GB

预估成本 (1000用户):
  - 月费用: ¥50-100
  - 比 Supabase 省: ~¥150/月
```

---

## ✅ CloudBase 独特优势

1. **国内访问速度**
   - Supabase: 200-500ms (国外服务器)
   - CloudBase: <50ms (国内服务器)
   - **提升 4-10 倍**

2. **微信生态集成**
   - ✅ 微信登录原生支持
   - ✅ 微信支付无缝集成
   - ✅ 小程序云开发同步

3. **合规性**
   - ✅ 数据存储在国内
   - ✅ 符合等保要求
   - ✅ 实名认证支持

4. **开发体验**
   - ✅ 中文文档完善
   - ✅ 技术支持响应快
   - ✅ 社区活跃

---

## 🛡️ 安全配置

### 数据库安全规则

```json
{
  "subscriptions": {
    "read": "auth.openid == doc._openid",
    "write": "auth.openid == doc._openid && doc.plan == 'free'"
  },
  "payment_logs": {
    "read": "auth.openid == doc._openid",
    "write": false
  }
}
```

### 云函数权限控制

```javascript
// 仅管理员可执行
if (context.AUTH_CONTEXT.role !== 'admin') {
  return { code: 403, message: '无权限' };
}
```

---

## 📞 技术支持

- 📚 [CloudBase 官方文档](https://docs.cloudbase.net/)
- 💬 [CloudBase 开发者社区](https://cloud.tencent.com/developer/column/1201)
- 🎓 [CloudBase 视频教程](https://cloud.tencent.com/edu/learning/course-3182)

---

## 🎯 下一步

1. 阅读 `CLOUDBASE_IMPLEMENTATION.md` 查看详细代码实现
2. 运行 `npm run migrate:cloudbase` 开始迁移
3. 按照 Phase 1-6 逐步完成迁移

**迁移时间预估**: 2-3 天（包含测试）

---

**建议优先迁移到 CloudBase，获得更好的用户体验和更低的成本！** 🚀
