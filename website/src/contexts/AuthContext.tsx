/**
 * 用户认证上下文 - CloudBase 版本
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  cloudbase,
  CloudBaseUser,
  UserSubscription,
  UserRole
} from '@/lib/cloudbase';

interface AuthContextType {
  user: CloudBaseUser | null;
  subscription: UserSubscription | null;
  loading: boolean;
  signIn: (provider: 'wechat' | 'anonymous') => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CloudBaseUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 初始化认证系统...');

        // 获取当前用户
        const currentUser = await cloudbase.auth.getCurrentUser();
        console.log('✅ 初始用户状态:', currentUser);
        setUser(currentUser);

        if (currentUser) {
          await loadSubscription();
        } else {
          setLoading(false);
        }

        console.log('✅ 认证系统初始化完成');

        // 暂时禁用 onAuthStateChanged 监听器以避免死循环
        // 依赖手动的 signIn/signOut 来更新状态
      } catch (error) {
        console.error('❌ 初始化认证失败:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 加载订阅信息
  const loadSubscription = async () => {
    try {
      const sub = await cloudbase.subscription.getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('加载订阅信息失败:', error);
      setSubscription({
        plan: 'free',
        status: 'expired',
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  // 刷新订阅信息
  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription();
    }
  };

  // 登录
  const signIn = async (provider: 'wechat' | 'anonymous') => {
    try {
      setLoading(true);

      if (provider === 'wechat') {
        // 微信登录
        const result = await cloudbase.auth.signInWithWeChat();
        if (!result.success) {
          throw new Error(result.error || '微信登录失败');
        }
      } else if (provider === 'anonymous') {
        // 匿名登录（测试用）
        const result = await cloudbase.auth.signInAnonymously();
        if (!result.success) {
          throw new Error(result.error || '匿名登录失败');
        }
      }

      // 登录成功后，手动获取用户信息和订阅状态
      const currentUser = await cloudbase.auth.getCurrentUser();
      console.log('✅ 登录成功，用户信息:', currentUser);
      setUser(currentUser);

      if (currentUser) {
        await loadSubscription();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setLoading(false);
      throw error;
    }
  };

  // 登出
  const signOut = async () => {
    try {
      const result = await cloudbase.auth.signOut();
      if (!result.success) {
        throw new Error(result.error || '登出失败');
      }
      setUser(null);
      setSubscription(null);
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  };

  const value = {
    user,
    subscription,
    loading,
    signIn,
    signOut,
    refreshSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook: 使用认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
}

// Hook: 检查权限
export function useRequireAuth(requiredPlan: UserRole = 'member') {
  const { user, subscription, loading } = useAuth();

  const hasAccess = React.useMemo(() => {
    if (!user || !subscription) return false;

    const hierarchy: Record<UserRole, number> = {
      free: 0,
      member: 1,
      vip: 2,
      coach: 3,
      venue: 3
    };

    return hierarchy[subscription.plan] >= hierarchy[requiredPlan];
  }, [user, subscription, requiredPlan]);

  return { user, subscription, loading, hasAccess };
}
