/**
 * 用户认证上下文
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserSubscription, UserSubscription, UserRole } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  subscription: UserSubscription | null;
  loading: boolean;
  signIn: (provider: 'wechat' | 'phone') => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化认证状态
  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSubscription(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 监听认证状态变化
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // 加载订阅信息
  const loadSubscription = async (userId: string) => {
    try {
      const sub = await getUserSubscription(userId);
      setSubscription(sub);
    } catch (error) {
      console.error('加载订阅信息失败:', error);
      setSubscription({
        plan: 'free',
        status: 'expired',
        expiresAt: null
      });
    } finally {
      setLoading(false);
    }
  };

  // 刷新订阅信息
  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription(user.id);
    }
  };

  // 登录
  const signIn = async (provider: 'wechat' | 'phone') => {
    try {
      if (provider === 'wechat') {
        // 微信登录 - 重定向到微信授权页面
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'wechat' as any,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'snsapi_userinfo'
          }
        });

        if (error) throw error;
      } else if (provider === 'phone') {
        // 手机号登录 - 这里需要额外实现OTP逻辑
        throw new Error('手机号登录暂未实现');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
