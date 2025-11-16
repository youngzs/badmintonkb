/**
 * 内容访问控制组件
 * 用于保护需要会员权限的内容
 */
import React, { useState, useEffect } from 'react';
import { useRequireAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/cloudbase';
import PayButton from './PayButton';
import LoginButton from './LoginButton';
import './PremiumGate.css';

interface PremiumGateProps {
  /** 子元素(受保护的内容) */
  children: React.ReactNode;
  /** 所需权限等级 */
  requiredRole?: UserRole;
  /** 模糊预览(显示前几行) */
  previewLines?: number;
  /** 自定义提示文本 */
  message?: string;
  /** 显示定价信息 */
  showPricing?: boolean;
}

export function PremiumGate({
  children,
  requiredRole = 'member',
  previewLines = 3,
  message,
  showPricing = true
}: PremiumGateProps) {
  const { user, subscription, loading, hasAccess } = useRequireAuth(requiredRole);
  const [isClient, setIsClient] = useState(false);

  // 处理客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 服务端或加载中: 显示骨架屏
  if (!isClient || loading) {
    return (
      <div className="premium-gate__skeleton">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    );
  }

  // 有权限: 直接显示内容
  if (hasAccess) {
    return <>{children}</>;
  }

  // 获取角色显示名称
  const getRoleName = (role: UserRole): string => {
    const names: Record<UserRole, string> = {
      free: '注册用户',
      member: '普通会员',
      vip: 'VIP会员',
      coach: '教练',
      venue: '球场管理员'
    };
    return names[role];
  };

  // 获取升级建议
  const getUpgradePlan = (currentRole: UserRole | undefined, required: UserRole): UserRole => {
    if (!currentRole || currentRole === 'free') {
      return required === 'vip' ? 'vip' : 'member';
    }
    return required;
  };

  const suggestedPlan = getUpgradePlan(subscription?.plan, requiredRole);

  return (
    <div className="premium-gate">
      {/* 预览内容 */}
      {previewLines > 0 && (
        <div className="premium-gate__preview">
          <div className="premium-gate__preview-content" data-lines={previewLines}>
            {children}
          </div>
          <div className="premium-gate__preview-fade"></div>
        </div>
      )}

      {/* 付费墙 */}
      <div className="premium-gate__wall">
        <div className="premium-gate__icon">
          {requiredRole === 'vip' ? '💎' : '🔒'}
        </div>

        <h3 className="premium-gate__title">
          {message || `此内容仅限${getRoleName(requiredRole)}查看`}
        </h3>

        <p className="premium-gate__description">
          {!user && '登录后即可解锁更多专业训练内容'}
          {user && subscription?.plan === 'free' && '升级会员，享受完整学习体验'}
          {user && subscription?.plan === 'member' && requiredRole === 'vip' && '升级VIP，解锁全部高级内容'}
        </p>

        {/* 会员权益 */}
        {showPricing && (
          <div className="premium-gate__benefits">
            <h4>会员权益</h4>
            <ul>
              <li>✅ 完整知识库访问</li>
              <li>✅ AI助手无限使用</li>
              <li>✅ 训练计划定制</li>
              {suggestedPlan === 'vip' && (
                <>
                  <li>✅ 1对1在线答疑</li>
                  <li>✅ 线下活动优先</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="premium-gate__actions">
          {!user ? (
            <LoginButton
              text="立即登录"
              variant="primary"
              size="large"
            />
          ) : (
            <PayButton
              plan={suggestedPlan}
              text={`升级到${getRoleName(suggestedPlan)}`}
              variant="primary"
              size="large"
            />
          )}

          {!user && (
            <p className="premium-gate__hint">
              新用户注册即可免费查看80%内容
            </p>
          )}
        </div>

        {/* 定价对比 */}
        {showPricing && user && (
          <div className="premium-gate__pricing">
            <div className="pricing-card">
              <div className="pricing-card__badge">推荐</div>
              <h5>普通会员</h5>
              <div className="pricing-card__price">
                <span className="price-amount">¥19.9</span>
                <span className="price-unit">/月</span>
              </div>
              <PayButton
                plan="member"
                text="立即订阅"
                variant={suggestedPlan === 'member' ? 'primary' : 'outline'}
                size="medium"
              />
            </div>

            <div className="pricing-card">
              <div className="pricing-card__badge pricing-card__badge--vip">超值</div>
              <h5>VIP会员</h5>
              <div className="pricing-card__price">
                <span className="price-amount">¥199</span>
                <span className="price-unit">/年</span>
              </div>
              <p className="pricing-card__save">节省¥39.8</p>
              <PayButton
                plan="vip"
                text="立即订阅"
                variant={suggestedPlan === 'vip' ? 'primary' : 'outline'}
                size="medium"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PremiumGate;
