/**
 * CloudBase Browser-only Client
 * 仅在浏览器环境使用，避免 SSR 问题
 */

// 类型定义
export type UserRole = 'free' | 'member' | 'vip' | 'coach' | 'venue';

export interface UserSubscription {
  plan: UserRole;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloudBaseUser {
  uid: string;
  loginType: string;
  nickName?: string;
  avatarUrl?: string;
  openid?: string;
}

// 环境 ID
const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID || 'badminton-kb-0g3ceetq971337db';

// CloudBase 实例（懒加载）
let app: any = null;
let auth: any = null;
let db: any = null;
let tcbModule: any = null;
let initPromise: Promise<any> | null = null;

/**
 * 初始化 CloudBase（仅浏览器环境）
 * 使用动态 import 避免阻塞
 */
async function getApp() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!app) {
    // 如果正在初始化，等待初始化完成
    if (initPromise) {
      await initPromise;
      return app;
    }

    // 开始初始化
    initPromise = (async () => {
      try {
        // 使用动态 import 而不是 require
        if (!tcbModule) {
          tcbModule = await import('@cloudbase/js-sdk');
        }
        const tcb = tcbModule.default || tcbModule;
        app = tcb.init({ env: ENV_ID });
        return app;
      } catch (error) {
        console.error('CloudBase 初始化失败:', error);
        initPromise = null; // 重置，允许重试
        throw error;
      }
    })();

    await initPromise;
  }

  return app;
}

/**
 * 获取认证服务（单例模式）
 */
async function getAuth() {
  const instance = await getApp();
  if (!instance) return null;

  if (!auth) {
    auth = instance.auth({ persistence: 'local' });
  }

  return auth;
}

/**
 * 获取数据库服务（单例模式）
 */
async function getDB() {
  const instance = await getApp();
  if (!instance) return null;

  if (!db) {
    db = instance.database();
  }

  return db;
}

// ============================================
// 用户认证
// ============================================

export async function signInWithWeChat() {
  try {
    const auth = await getAuth();
    if (!auth) return { success: false, error: 'Not in browser' };

    await auth.weixinAuthProvider({
      appid: process.env.NEXT_PUBLIC_WECHAT_APPID || '',
      scope: 'snsapi_userinfo'
    }).signIn();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

export async function signInAnonymously() {
  try {
    const auth = await getAuth();
    if (!auth) return { success: false, error: 'Not in browser' };

    await auth.signInAnonymously();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

export async function signOut() {
  try {
    const auth = await getAuth();
    if (!auth) return { success: false, error: 'Not in browser' };

    await auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

export async function getCurrentUser(): Promise<CloudBaseUser | null> {
  try {
    const auth = await getAuth();
    if (!auth) return null;

    const loginState = await auth.getLoginState();
    if (!loginState) return null;

    return {
      uid: loginState.user?.uid || '',
      loginType: loginState.loginType || 'ANONYMOUS',
      nickName: loginState.user?.nickName,
      avatarUrl: loginState.user?.avatarUrl,
      openid: loginState.user?.openid
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

export function onAuthStateChanged(callback: (user: CloudBaseUser | null) => void) {
  // 异步初始化，但不阻塞
  getAuth().then(auth => {
    if (!auth) return () => {};
    
    return auth.onLoginStateChanged((loginState: any) => {
      if (loginState) {
        const user: CloudBaseUser = {
          uid: loginState.user?.uid || '',
          loginType: loginState.loginType || 'ANONYMOUS',
          nickName: loginState.user?.nickName,
          avatarUrl: loginState.user?.avatarUrl,
          openid: loginState.user?.openid
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }).catch(error => {
    console.error('初始化认证监听失败:', error);
    return () => {};
  });
  
  // 返回一个清理函数
  return () => {};
}

// ============================================
// 订阅管理
// ============================================

export async function getUserSubscription(): Promise<UserSubscription> {
  const defaultSub: UserSubscription = {
    plan: 'free',
    status: 'expired',
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    console.log('🔍 开始获取用户订阅信息...');

    const user = await getCurrentUser();
    if (!user) {
      console.log('ℹ️  用户未登录，返回默认订阅');
      return defaultSub;
    }
    console.log('✅ 用户ID:', user.uid);

    const db = await getDB();
    if (!db) {
      console.warn('⚠️  数据库未初始化，返回默认订阅');
      return defaultSub;
    }

    console.log('🔍 查询订阅记录...');
    const { data } = await db
      .collection('subscriptions')
      .where({ user_id: user.uid })
      .limit(1)
      .get();

    console.log('📊 查询结果:', data);

    if (!data || data.length === 0) {
      console.log('ℹ️  未找到订阅记录，返回默认订阅');
      return defaultSub;
    }

    const subscription = data[0];
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
    const isExpired = expiresAt && expiresAt < new Date();

    const result = {
      plan: isExpired ? 'free' : subscription.plan,
      status: isExpired ? 'expired' : subscription.status,
      expiresAt,
      createdAt: new Date(subscription.created_at),
      updatedAt: new Date(subscription.updated_at)
    };

    console.log('✅ 订阅信息:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取订阅失败:', error);
    return defaultSub;
  }
}

export async function updateSubscription(plan: UserRole, duration: number) {
  try {
    console.log('📝 开始更新订阅:', { plan, duration });

    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ 用户未登录');
      throw new Error('用户未登录');
    }
    console.log('✅ 用户信息:', user);

    const db = await getDB();
    if (!db) {
      console.error('❌ 数据库未初始化');
      throw new Error('数据库未初始化');
    }
    console.log('✅ 数据库已初始化');

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + duration);
    console.log('📅 计算过期时间:', expiresAt.toISOString());

    // 查询现有订阅
    console.log('🔍 查询现有订阅...');
    const { data } = await db
      .collection('subscriptions')
      .where({ user_id: user.uid })
      .get();

    console.log('📊 查询结果:', data);

    if (data && data.length > 0) {
      // 更新现有订阅
      console.log('🔄 更新现有订阅:', data[0]._id);
      const updateResult = await db
        .collection('subscriptions')
        .doc(data[0]._id)
        .update({
          plan,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        });
      console.log('✅ 更新结果:', updateResult);
    } else {
      // 创建新订阅
      console.log('➕ 创建新订阅记录...');
      const addResult = await db.collection('subscriptions').add({
        user_id: user.uid,
        plan,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('✅ 创建结果:', addResult);
    }

    console.log('🎉 订阅更新成功！');
    return { success: true };
  } catch (error: any) {
    console.error('❌ 更新订阅失败:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ============================================
// 权限检查
// ============================================

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

export async function checkAccess(requiredPlan: UserRole): Promise<boolean> {
  const subscription = await getUserSubscription();
  return hasPermission(subscription.plan, requiredPlan);
}

// ============================================
// 导出便捷接口
// ============================================

export const cloudbase = {
  auth: {
    signInWithWeChat,
    signInAnonymously,
    signOut,
    getCurrentUser,
    onAuthStateChanged
  },
  subscription: {
    getUserSubscription,
    updateSubscription,
    checkAccess
  },
  hasPermission
};

export default cloudbase;
