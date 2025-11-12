/**
 * Docusaurus Root wrapper
 * 用于提供全局的 Context Providers
 */
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

// Docusaurus Root组件会包裹整个应用
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
