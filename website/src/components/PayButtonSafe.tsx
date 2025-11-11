/**
 * SSG-safe wrapper for PayButton component
 * 用于MDX文件中的支付按钮
 */
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import PayButton from './PayButton';
import { UserRole } from '@/lib/supabase';

interface PayButtonSafeProps {
  plan?: UserRole;
  text?: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  onSuccess?: () => void;
}

/**
 * SSG-safe PayButton component
 * 在静态生成时显示占位按钮，在浏览器中显示真实按钮
 */
export function PayButtonSafe({
  plan = 'member',
  text,
  variant = 'primary',
  size = 'medium',
  onSuccess
}: PayButtonSafeProps) {
  const defaultText = plan === 'vip' ? '订阅VIP会员' : '订阅会员';

  return (
    <BrowserOnly
      fallback={
        <button
          disabled
          style={{
            padding: size === 'small' ? '0.5rem 1rem' : size === 'large' ? '1rem 2rem' : '0.75rem 1.5rem',
            fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem',
            backgroundColor: variant === 'primary' ? '#0066cc' : '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
        >
          {text || defaultText}
        </button>
      }
    >
      {() => (
        <PayButton
          plan={plan}
          text={text}
          variant={variant}
          size={size}
          onSuccess={onSuccess}
        />
      )}
    </BrowserOnly>
  );
}

export default PayButtonSafe;
