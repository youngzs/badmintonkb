/**
 * 微信 OAuth 回调页面
 * 处理微信授权后的回调
 */
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';
import { weChatLogin, verifyState } from '@/lib/wechat-auth';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function WeChatCallback() {
  const location = useLocation();
  const history = useHistory();
  const { refreshSubscription } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleWeChatCallback();
  }, []);

  async function handleWeChatCallback() {
    try {
      // 从 URL 获取参数
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');

      // 验证参数
      if (!code) {
        throw new Error('缺少授权码');
      }

      if (!state || !verifyState(state)) {
        throw new Error('State 验证失败，可能存在安全风险');
      }

      setStatus('loading');

      // 调用后端 API 完成微信登录
      const wechatUser = await weChatLogin(code);

      // 创建或更新 Supabase 用户
      // 使用微信的 openid 作为唯一标识
      const email = `${wechatUser.openid}@wechat.placeholder.com`;
      const password = wechatUser.openid; // 使用 openid 作为密码

      // 尝试登录
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 如果用户不存在，则注册
      if (signInError && signInError.message.includes('Invalid login')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              provider: 'wechat',
              wechat_openid: wechatUser.openid,
              wechat_unionid: wechatUser.unionid,
              nickname: wechatUser.nickname,
              avatar_url: wechatUser.headimgurl,
            },
          },
        });

        if (signUpError) {
          throw new Error(`注册失败: ${signUpError.message}`);
        }

        signInData = signUpData;
      } else if (signInError) {
        throw new Error(`登录失败: ${signInError.message}`);
      }

      // 更新用户元数据
      if (signInData.user) {
        await supabase.auth.updateUser({
          data: {
            nickname: wechatUser.nickname,
            avatar_url: wechatUser.headimgurl,
            last_login: new Date().toISOString(),
          },
        });
      }

      // 刷新订阅信息
      await refreshSubscription();

      setStatus('success');

      // 3秒后跳转到首页
      setTimeout(() => {
        history.push('/');
      }, 3000);
    } catch (err) {
      console.error('微信登录失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setStatus('error');
    }
  }

  return (
    <Layout title="微信登录">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
        }}
      >
        {status === 'loading' && (
          <>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>正在登录...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', color: '#4caf50' }}>✓</div>
            <h2 style={{ color: '#4caf50' }}>登录成功!</h2>
            <p style={{ marginTop: '1rem' }}>即将跳转到首页...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', color: '#f44336' }}>✗</div>
            <h2 style={{ color: '#f44336' }}>登录失败</h2>
            <p style={{ marginTop: '1rem', color: '#666' }}>{error}</p>
            <button
              onClick={() => history.push('/')}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              返回首页
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
