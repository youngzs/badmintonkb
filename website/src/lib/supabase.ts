/**
 * Supabase客户端配置
 */
import { createClient } from '@supabase/supabase-js';

// 在SSG(静态站点生成)期间使用虚拟值,仅在浏览器环境检查真实值
const isBrowser = typeof window !== 'undefined';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// 仅在浏览器环境中验证真实环境变量
if (isBrowser && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('⚠️ 缺少Supabase环境变量! 会员功能将不可用。请配置.env文件');
}

// 客户端实例(用于前端)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'free' | 'member' | 'vip';
          status: 'active' | 'expired' | 'cancelled';
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      payment_logs: {
        Row: {
          id: string;
          user_id: string;
          order_no: string;
          amount: number;
          plan: string;
          status: 'pending' | 'success' | 'failed';
          transaction_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_logs']['Insert']>;
      };
    };
  };
}

// 用户角色类型
export type UserRole = 'free' | 'member' | 'vip' | 'coach' | 'venue';

// 用户订阅信息
export interface UserSubscription {
  plan: UserRole;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: Date | null;
}

// 获取当前用户
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('获取用户失败:', error);
    return null;
  }

  return user;
}

// 获取用户订阅信息
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return {
      plan: 'free',
      status: 'expired',
      expiresAt: null
    };
  }

  // 检查是否过期
  const isExpired = data.expires_at && new Date(data.expires_at) < new Date();

  return {
    plan: isExpired ? 'free' : data.plan as UserRole,
    status: isExpired ? 'expired' : data.status,
    expiresAt: data.expires_at ? new Date(data.expires_at) : null
  };
}

// 检查用户权限
export function hasPermission(userPlan: UserRole, requiredPlan: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    free: 0,
    member: 1,
    vip: 2,
    coach: 3,
    venue: 3
  };

  return hierarchy[userPlan] >= hierarchy[requiredPlan];
}
