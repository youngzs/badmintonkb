/**
 * SSG-safe wrapper for PremiumGate component
 * 用于MDX文件中的内容保护
 */
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { PremiumGate } from './PremiumGate';
import { UserRole } from '@/lib/supabase';

interface PremiumContentProps {
  children: React.ReactNode;
  level?: UserRole;
  previewLines?: number;
  message?: string;
  showPricing?: boolean;
}

/**
 * SSG-safe PremiumContent component
 * 在静态生成时显示占位符，在浏览器中显示真实内容
 */
export function PremiumContent({
  children,
  level = 'member',
  previewLines = 3,
  message,
  showPricing = true
}: PremiumContentProps) {
  return (
    <BrowserOnly
      fallback={
        <div className="premium-gate__skeleton">
          <div style={{
            padding: '2rem',
            borderRadius: '8px',
            backgroundColor: '#f5f5f5',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
            <p style={{ color: '#666' }}>
              {message || `此内容需要${level === 'vip' ? 'VIP会员' : '会员'}权限`}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              加载中...
            </p>
          </div>
        </div>
      }
    >
      {() => (
        <PremiumGate
          requiredRole={level}
          previewLines={previewLines}
          message={message}
          showPricing={showPricing}
        >
          {children}
        </PremiumGate>
      )}
    </BrowserOnly>
  );
}

export default PremiumContent;
