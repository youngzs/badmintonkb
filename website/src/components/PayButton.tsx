/**
 * 支付按钮组件 - Docusaurus简化版
 * 注意: 完整支付功能需要后端支持,这里提供模拟版本
 */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import './PayButton.css';

interface PayButtonProps {
  /** 订阅计划 */
  plan: 'member' | 'vip';
  /** 按钮文本 */
  text?: string;
  /** 按钮样式 */
  variant?: 'primary' | 'outline' | 'text';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 支付成功回调 */
  onSuccess?: () => void;
}

// 计划配置
const PLAN_CONFIG = {
  member: {
    name: '普通会员',
    price: 1990,
    displayPrice: '¥19.9',
    duration: '月',
    features: [
      '完整知识库访问',
      'AI助手无限使用',
      '训练计划定制',
      '无广告体验'
    ]
  },
  vip: {
    name: 'VIP会员',
    price: 19900,
    displayPrice: '¥199',
    duration: '年',
    features: [
      '以上所有权益',
      '1对1在线答疑(每月2次)',
      '线下活动优先',
      '专属VIP标识'
    ]
  }
};

export function PayButton({
  plan,
  text,
  variant = 'primary',
  size = 'medium',
  onSuccess
}: PayButtonProps) {
  const { user, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const planConfig = PLAN_CONFIG[plan];

  // 模拟支付(开发测试用)
  const handleMockPayment = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    setLoading(true);

    try {
      // 计算过期时间
      const expiresAt = new Date();
      if (plan === 'vip') {
        expiresAt.setDate(expiresAt.getDate() + 365);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      // 直接更新订阅(仅用于开发测试!)
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan: plan,
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast.success('开通成功! (开发测试模式)');
      setShowModal(false);

      // 刷新订阅信息
      await refreshSubscription();

      onSuccess?.();
    } catch (error) {
      console.error('开通失败:', error);
      toast.error(error instanceof Error ? error.message : '开通失败');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到支付页面(生产环境)
  const handleRealPayment = () => {
    // TODO: 跳转到实际的支付页面
    toast.info('支付功能开发中,请联系管理员开通');
    // window.location.href = `/pricing?plan=${plan}`;
  };

  const handleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        className={`pay-button pay-button--${variant} pay-button--${size}`}
        onClick={handleClick}
        disabled={loading || !user}
      >
        {loading ? (
          <>
            <span className="pay-button__spinner"></span>
            <span>处理中...</span>
          </>
        ) : (
          text || `订阅${planConfig.name}`
        )}
      </button>

      {/* 支付选择弹窗 */}
      {showModal && (
        <div className="payment-modal" onClick={closeModal}>
          <div className="payment-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="payment-modal__close" onClick={closeModal}>
              ×
            </button>

            <h3 className="payment-modal__title">
              订阅{planConfig.name}
            </h3>

            <div className="payment-modal__plan">
              <div className="plan-name">{planConfig.name}</div>
              <div className="plan-price">
                {planConfig.displayPrice}
                <span className="plan-duration">/{planConfig.duration}</span>
              </div>
            </div>

            <div className="payment-modal__features">
              <h4>包含权益</h4>
              <ul>
                {planConfig.features.map((feature, index) => (
                  <li key={index}>
                    <svg className="check-icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="payment-modal__actions">
              {/* 开发测试按钮 */}
              <button
                className="pay-button pay-button--primary pay-button--large"
                onClick={handleMockPayment}
                disabled={loading}
                style={{ width: '100%', marginBottom: '12px' }}
              >
                {loading ? '处理中...' : '🧪 测试开通 (开发模式)'}
              </button>

              {/* 生产支付按钮 */}
              <button
                className="pay-button pay-button--outline pay-button--large"
                onClick={handleRealPayment}
                style={{ width: '100%' }}
              >
                💳 正式支付 (即将上线)
              </button>
            </div>

            <div className="payment-modal__tips">
              <p className="tip-main">⚠️ 当前为开发测试模式</p>
              <p className="tip-sub">正式支付功能需要配置微信支付</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PayButton;
