/**
 * 登录按钮组件
 * 支持微信登录和手机号登录
 */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import './LoginButton.css';

interface LoginButtonProps {
  /** 按钮文本 */
  text?: string;
  /** 按钮样式 */
  variant?: 'primary' | 'outline' | 'text';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 登录成功回调 */
  onSuccess?: () => void;
  /** 显示用户信息 */
  showUserInfo?: boolean;
}

export function LoginButton({
  text = '登录',
  variant = 'primary',
  size = 'medium',
  onSuccess,
  showUserInfo = false
}: LoginButtonProps) {
  const { user, subscription, signIn, signOut, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // 处理登录
  const handleLogin = async (provider: 'wechat' | 'phone') => {
    setLoginLoading(true);
    try {
      await signIn(provider);
      toast.success('登录成功!');
      setShowModal(false);
      onSuccess?.();
    } catch (error) {
      console.error('登录失败:', error);
      toast.error(error instanceof Error ? error.message : '登录失败,请重试');
    } finally {
      setLoginLoading(false);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (error) {
      console.error('登出失败:', error);
      toast.error('登出失败,请重试');
    }
  };

  // 已登录状态
  if (user) {
    if (!showUserInfo) {
      return (
        <button
          className={`login-button login-button--${variant} login-button--${size}`}
          onClick={handleLogout}
          disabled={loading}
        >
          退出登录
        </button>
      );
    }

    return (
      <div className="user-info">
        <div className="user-info__avatar">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="头像" />
          ) : (
            <div className="user-info__avatar-placeholder">
              {user.user_metadata?.full_name?.[0] || '用'}
            </div>
          )}
        </div>
        <div className="user-info__details">
          <div className="user-info__name">
            {user.user_metadata?.full_name || '用户'}
          </div>
          <div className="user-info__plan">
            {subscription?.plan === 'vip' && '💎 VIP会员'}
            {subscription?.plan === 'member' && '⭐ 普通会员'}
            {subscription?.plan === 'free' && '免费用户'}
          </div>
        </div>
        <button
          className="user-info__logout"
          onClick={handleLogout}
          title="退出登录"
        >
          ×
        </button>
      </div>
    );
  }

  // 未登录状态
  return (
    <>
      <button
        className={`login-button login-button--${variant} login-button--${size}`}
        onClick={() => setShowModal(true)}
        disabled={loading}
      >
        {text}
      </button>

      {/* 登录弹窗 */}
      {showModal && (
        <div className="login-modal" onClick={() => setShowModal(false)}>
          <div className="login-modal__content" onClick={(e) => e.stopPropagation()}>
            <button
              className="login-modal__close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <h2 className="login-modal__title">登录羽毛球知识库</h2>
            <p className="login-modal__subtitle">解锁完整学习内容</p>

            <div className="login-modal__methods">
              {/* 微信登录 */}
              <button
                className="login-method login-method--wechat"
                onClick={() => handleLogin('wechat')}
                disabled={loginLoading}
              >
                <svg className="login-method__icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M8.5 5C4.9 5 2 7.5 2 10.6c0 1.8 1 3.4 2.6 4.4l-.6 2 2.3-1.2c.8.2 1.6.3 2.5.3h.5c-.1-.5-.2-1-.2-1.5 0-3.4 3.1-6.2 7-6.2.3 0 .6 0 .9.1C16.3 6.2 12.7 5 8.5 5m-2 2.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1m5 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1M15.5 11c-3.1 0-5.6 2.1-5.6 4.7s2.5 4.7 5.6 4.7c.7 0 1.4-.1 2.1-.3l1.9 1-.5-1.7c1.4-.9 2.3-2.3 2.3-3.9 0-2.6-2.5-4.7-5.6-4.7m-2.3 2.3c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7m4.6 0c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z"
                  />
                </svg>
                <span>微信登录</span>
              </button>

              {/* 手机号登录(暂未实现) */}
              <button
                className="login-method login-method--phone"
                onClick={() => toast.info('手机号登录即将上线')}
                disabled={true}
              >
                <svg className="login-method__icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"
                  />
                </svg>
                <span>手机号登录 (即将上线)</span>
              </button>
            </div>

            <div className="login-modal__footer">
              <p>登录即表示同意</p>
              <a href="/terms">《用户协议》</a>
              <span>和</span>
              <a href="/privacy">《隐私政策》</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginButton;
