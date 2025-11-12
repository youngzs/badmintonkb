# 快速开始 - 微信登录配置

## 当前状态

✅ 前端服务运行: http://localhost:8900
✅ 后端服务运行: http://localhost:3001
✅ 微信 OAuth 配置完成
✅ Supabase 认证集成完成

## 快速配置（5步）

### 步骤 1: 配置微信开放平台

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 创建"网站应用"
3. 获取 **AppID** 和 **AppSecret**
4. 配置授权回调域: `localhost` (开发) / `your-domain.com` (生产)

### 步骤 2: 更新环境变量

编辑 `website/.env` 文件，替换为你的真实配置:

```env
NEXT_PUBLIC_WECHAT_APPID=你的AppID
WECHAT_APPID=你的AppID
WECHAT_SECRET=你的AppSecret
```

### 步骤 3: 配置 Supabase 数据库

在 Supabase SQL Editor 中执行 SQL（见 WECHAT_LOGIN_SETUP.md）

### 步骤 4: 测试登录

1. 访问 http://localhost:8900
2. 点击右上角"微信登录"按钮
3. 扫码授权后自动完成登录

## 详细文档

完整配置说明: [WECHAT_LOGIN_SETUP.md](./WECHAT_LOGIN_SETUP.md)
