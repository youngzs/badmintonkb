# 微信登录配置指南

本文档详细说明如何配置微信OAuth登录功能。

## 架构概览

```
┌─────────────┐     OAuth请求     ┌──────────────┐
│             │ ───────────────→   │              │
│  前端应用   │                   │  微信开放平台  │
│ (Docusaurus)│ ←─────────────    │              │
│             │     code回调      └──────────────┘
└─────────────┘                          ↓
       │                                 │
       │ 用户信息                         │ token交换
       ↓                                 ↓
┌─────────────┐                   ┌──────────────┐
│             │ ← API调用 ─────   │              │
│  Supabase   │                   │  后端服务    │
│  (Auth DB)  │                   │  (Express)   │
│             │                   │              │
└─────────────┘                   └──────────────┘
```

## 一、微信开放平台配置

### 1.1 注册并创建网站应用

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号并完成认证
3. 创建"网站应用"类型的应用
4. 填写应用信息：
   - **应用名称**: 青少年羽毛球训练知识库
   - **应用简介**: 专业的羽毛球训练指导平台
   - **应用官网**: 你的网站域名

### 1.2 配置授权回调域

在微信开放平台的应用设置中：

1. 找到"开发信息" → "授权回调域"
2. 添加回调域名（不带协议和端口）：
   ```
   开发环境: localhost
   生产环境: your-domain.com
   ```

### 1.3 获取凭证

从微信开放平台获取：
- **AppID**: 应用唯一标识
- **AppSecret**: 应用密钥（保密）

## 二、Supabase 数据库配置

### 2.1 创建用户表

Supabase 会自动创建 `auth.users` 表，但你需要创建订阅表：

```sql
-- 创建订阅表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'member', 'vip', 'coach', 'venue')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 启用 RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的订阅
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：服务端可以更新所有订阅
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');
```

### 2.2 创建支付日志表

```sql
-- 创建支付日志表
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_no TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX idx_payment_logs_order_no ON payment_logs(order_no);
CREATE INDEX idx_payment_logs_status ON payment_logs(status);

-- 启用 RLS
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- 策略
CREATE POLICY "Users can view own payment logs"
  ON payment_logs FOR SELECT
  USING (auth.uid() = user_id);
```

## 三、本地环境配置

### 3.1 配置环境变量

编辑 `website/.env` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 后端 API 配置
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
BACKEND_PORT=3001

# 微信开放平台配置
NEXT_PUBLIC_WECHAT_APPID=wx123456789  # 替换为你的 AppID
WECHAT_APPID=wx123456789              # 替换为你的 AppID
WECHAT_SECRET=your-wechat-secret      # 替换为你的 AppSecret

# 微信小程序配置（可选）
NEXT_PUBLIC_WECHAT_MINI_APPID=wxMiniProgram123

# 站点配置
NEXT_PUBLIC_SITE_URL=http://localhost:8900

# 会员定价（分）
MEMBER_MONTHLY_PRICE=1990   # 19.9元
VIP_YEARLY_PRICE=19900      # 199元
```

### 3.2 安装后端依赖

```bash
cd backend
npm install
```

### 3.3 启动服务

**终端 1 - 前端（Docusaurus）:**
```bash
cd website
npm run start
```

**终端 2 - 后端（Express API）:**
```bash
cd backend
npm run dev
```

服务地址：
- 前端: http://localhost:8900
- 后端: http://localhost:3001

## 四、测试流程

### 4.1 开发环境测试

1. 访问 http://localhost:8900
2. 点击右上角"微信登录"按钮
3. 会跳转到微信授权页面（需要真实的 AppID）
4. 扫码授权后，会回调到 `/auth/wechat/callback`
5. 系统自动创建 Supabase 用户并登录

### 4.2 生产环境部署

1. **配置域名白名单**
   - 在微信开放平台添加生产域名到授权回调域

2. **更新环境变量**
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

3. **部署后端服务**
   - 推荐使用 Vercel Serverless Functions 或其他云服务
   - 确保 HTTPS 加密

4. **测试完整流程**
   - 使用真实域名测试微信登录
   - 验证用户信息同步到 Supabase
   - 验证会员权限控制

## 五、常见问题

### Q1: "redirect_uri 参数错误"

**原因**: 回调域名未在微信开放平台配置

**解决**:
1. 检查微信开放平台的授权回调域设置
2. 确保域名与代码中的 `redirectUri` 一致
3. 注意不要包含协议（http/https）和端口号

### Q2: "appid 参数错误"

**原因**: AppID 配置错误或未配置

**解决**:
1. 检查 `.env` 文件中的 `NEXT_PUBLIC_WECHAT_APPID`
2. 确保环境变量正确注入到前端代码
3. 重启开发服务器

### Q3: 获取不到用户信息

**原因**: Access Token 过期或无效

**解决**:
1. 检查后端 API 日志
2. 验证微信 API 响应
3. 确保 AppSecret 正确配置

### Q4: Supabase 用户创建失败

**原因**: 用户表或 RLS 策略配置错误

**解决**:
1. 检查 Supabase 数据库表是否正确创建
2. 验证 RLS 策略是否允许用户注册
3. 检查服务端日志

## 六、安全建议

### 6.1 保护敏感信息

- ✅ **AppSecret** 只在后端使用，永远不要暴露到前端
- ✅ 使用环境变量存储所有敏感配置
- ✅ 不要将 `.env` 文件提交到版本控制
- ✅ 生产环境使用 HTTPS

### 6.2 防止 CSRF 攻击

- ✅ 使用随机 `state` 参数
- ✅ 在回调时验证 `state` 参数
- ✅ State 使用一次后立即失效

### 6.3 用户数据保护

- ✅ 启用 Supabase RLS (Row Level Security)
- ✅ 用户只能访问自己的数据
- ✅ 定期审计数据库访问日志

## 七、技术栈

- **前端**: Docusaurus 3.x, React, TypeScript
- **后端**: Express, Node.js
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth + 微信 OAuth
- **支付**: 微信支付 API v3

## 八、相关文档

- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Docusaurus 文档](https://docusaurus.io/)

---

**更新时间**: 2025-01-11
**版本**: v1.0.0
