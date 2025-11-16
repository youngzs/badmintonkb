/**
 * 支付按钮组件 - CloudBase 版本
 */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, cloudbase } from '@/lib/cloudbase';
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
      // 计算过期时间(月数)
      const duration = plan === 'vip' ? 12 : 1;

      // 调用 CloudBase 更新订阅(测试用)
      const result = await cloudbase.subscription.updateSubscription(plan, duration);

      if (!result.success) {
        throw new Error(result.error || '开通失败');
      }

      toast.success('开通成功! (开发测试模式)');
      setShowModal(false);

      // 刷新订阅信息
      await refreshSubscription();

      // 回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('支付失败:', error);
      toast.error(error.message || '开通失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理点击
  const handleClick = () => {
    if (!user) {
      toast.info('请先登录');
      return;
    }
    setShowModal(true);
  };

  const buttonClass = `pay-button pay-button--${variant} pay-button--${size}`;

  return (
    <>
      <button
        className={buttonClass}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? '处理中...' : (text || `订阅${planConfig.name}`)}
      </button>

      {/* 支付确认弹窗 */}
      {showModal && (
        <div className="pay-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pay-modal__header">
              <h3>{planConfig.name}</h3>
              <button className="pay-modal__close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="pay-modal__body">
              <div className="pay-modal__price">
                <span className="price-amount">{planConfig.displayPrice}</span>
                <span className="price-unit">/{planConfig.duration}</span>
              </div>

              <div className="pay-modal__features">
                <h4>会员权益</h4>
                <ul>
                  {planConfig.features.map((feature, index) => (
                    <li key={index}>✅ {feature}</li>
                  ))}
                </ul>
              </div>

              <div className="pay-modal__notice">
                <p>⚠️ 开发测试模式</p>
                <p>点击下方按钮直接开通会员（无需真实支付）</p>
              </div>
            </div>

            <div className="pay-modal__footer">
              <button
                className="pay-modal__button pay-modal__button--cancel"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                取消
              </button>
              <button
                className="pay-modal__button pay-modal__button--confirm"
                onClick={handleMockPayment}
                disabled={loading}
              >
                {loading ? '处理中...' : '确认开通'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PayButton;
