/**
 * 简单的 Express 后端服务
 * 处理微信 OAuth 认证
 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../website/.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 微信配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID || '',
  appSecret: process.env.WECHAT_SECRET || '',
};

/**
 * POST /api/auth/wechat/token
 * 通过 code 换取 access_token
 */
app.post('/api/auth/wechat/token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.appSecret) {
    console.error('Missing WeChat credentials');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // 调用微信 API 换取 access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`;

    const response = await fetch(tokenUrl);
    const data = await response.json();

    if (data.errcode) {
      console.error('WeChat API error:', data);
      return res.status(400).json({
        error: 'Failed to exchange code for token',
        details: data.errmsg,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/wechat/userinfo
 * 获取微信用户信息
 */
app.post('/api/auth/wechat/userinfo', async (req, res) => {
  const { accessToken, openid } = req.body;

  if (!accessToken || !openid) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // 调用微信 API 获取用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;

    const response = await fetch(userInfoUrl);
    const data = await response.json();

    if (data.errcode) {
      console.error('WeChat API error:', data);
      return res.status(400).json({
        error: 'Failed to get user info',
        details: data.errmsg,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('User info fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/wechat/login
 * 完整的微信登录流程：换取 token + 获取用户信息 + 创建 Supabase 会话
 */
app.post('/api/auth/wechat/login', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    // 1. 换取 access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.errcode) {
      return res.status(400).json({
        error: 'Failed to get access token',
        details: tokenData.errmsg,
      });
    }

    // 2. 获取用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}&lang=zh_CN`;
    const userInfoResponse = await fetch(userInfoUrl);
    const userInfo = await userInfoResponse.json();

    if (userInfo.errcode) {
      return res.status(400).json({
        error: 'Failed to get user info',
        details: userInfo.errmsg,
      });
    }

    // 3. 返回用户信息和 token（前端使用这些信息创建 Supabase 会话）
    return res.status(200).json({
      openid: userInfo.openid,
      unionid: userInfo.unionid,
      nickname: userInfo.nickname,
      headimgurl: userInfo.headimgurl,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error('WeChat login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`WeChat OAuth endpoints:`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/wechat/token`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/wechat/userinfo`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/wechat/login`);
});

module.exports = app;
