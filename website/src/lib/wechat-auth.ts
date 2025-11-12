/**
 * 微信 OAuth 认证配置和工具函数
 */

// 微信开放平台配置
export const WECHAT_CONFIG = {
  appId: process.env.NEXT_PUBLIC_WECHAT_APPID || '',
  appSecret: process.env.WECHAT_SECRET || '',
  redirectUri: typeof window !== 'undefined'
    ? `${window.location.origin}/auth/wechat/callback`
    : '',
  scope: 'snsapi_login', // 网页应用使用 snsapi_login
  state: 'STATE', // 防止 CSRF 攻击，应该是随机字符串
};

/**
 * 生成微信授权 URL
 */
export function getWeChatAuthUrl(): string {
  const params = new URLSearchParams({
    appid: WECHAT_CONFIG.appId,
    redirect_uri: encodeURIComponent(WECHAT_CONFIG.redirectUri),
    response_type: 'code',
    scope: WECHAT_CONFIG.scope,
    state: generateState(),
  });

  // 微信开放平台授权地址
  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}

/**
 * 生成随机 state 参数（用于防 CSRF）
 */
export function generateState(): string {
  const state = Math.random().toString(36).substring(2, 15);
  // 存储到 sessionStorage 用于验证
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('wechat_oauth_state', state);
  }
  return state;
}

/**
 * 验证 state 参数
 */
export function verifyState(state: string): boolean {
  if (typeof window === 'undefined') return false;
  const savedState = sessionStorage.getItem('wechat_oauth_state');
  sessionStorage.removeItem('wechat_oauth_state');
  return savedState === state;
}

/**
 * 微信用户信息接口
 */
export interface WeChatUserInfo {
  openid: string;
  nickname: string;
  sex: number; // 1:男性, 2:女性
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

/**
 * 微信 access_token 响应
 */
export interface WeChatAccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}

// 后端 API 地址
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * 完整的微信登录流程
 * 调用后端 API 完成整个 OAuth 流程
 */
export async function weChatLogin(code: string): Promise<{
  openid: string;
  unionid?: string;
  nickname: string;
  headimgurl: string;
  accessToken: string;
  expiresIn: number;
}> {
  const response = await fetch(`${BACKEND_API}/api/auth/wechat/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login with WeChat');
  }

  return response.json();
}

/**
 * 通过 code 换取 access_token
 * 注意：这个操作应该在后端完成，因为需要 appSecret
 */
export async function exchangeCodeForToken(code: string): Promise<WeChatAccessTokenResponse> {
  // 调用后端 API
  const response = await fetch(`${BACKEND_API}/api/auth/wechat/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * 获取微信用户信息
 */
export async function getWeChatUserInfo(accessToken: string, openid: string): Promise<WeChatUserInfo> {
  // 调用后端 API
  const response = await fetch(`${BACKEND_API}/api/auth/wechat/userinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, openid }),
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
}

/**
 * 小程序配置（用于小程序环境）
 */
export const MINI_PROGRAM_CONFIG = {
  appId: process.env.NEXT_PUBLIC_WECHAT_MINI_APPID || '',
  scope: 'snsapi_userinfo', // 小程序使用 snsapi_userinfo
};

/**
 * 检测是否在微信环境
 */
export function isWeChatEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
}

/**
 * 检测是否在微信小程序环境
 */
export function isMiniProgramEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /miniprogram/.test(ua);
}
