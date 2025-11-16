/**
 * CloudBase 客户端入口
 * SSR 安全封装 - 完全懒加载版本
 */

// 导出类型
export type {
  UserRole,
  UserSubscription,
  CloudBaseUser
} from './cloudbase-browser';

// 判断是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

// 延迟加载的 cloudbase 实例
let cloudbaseInstance: any = null;

// 获取 cloudbase 实例（懒加载）
async function getCloudbase() {
  if (!isBrowser) {
    // SSR 环境：返回空实现
    const noop = () => Promise.resolve({ success: false, error: 'Not in browser' });
    return {
      auth: {
        signInWithWeChat: noop,
        signInAnonymously: noop,
        signOut: noop,
        getCurrentUser: () => Promise.resolve(null),
        onAuthStateChanged: (callback: any) => () => {}
      },
      subscription: {
        getUserSubscription: () => Promise.resolve({
          plan: 'free' as const,
          status: 'expired' as const,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        updateSubscription: noop,
        checkAccess: () => Promise.resolve(false)
      },
      hasPermission: () => false
    };
  }

  // 浏览器环境：懒加载真实实现
  if (!cloudbaseInstance) {
    const module = await import('./cloudbase-browser');
    cloudbaseInstance = module.cloudbase;
  }

  return cloudbaseInstance;
}

// 导出代理对象，所有方法都通过懒加载调用
export const cloudbase = {
  auth: {
    signInWithWeChat: async () => {
      const cb = await getCloudbase();
      return cb.auth.signInWithWeChat();
    },
    signInAnonymously: async () => {
      const cb = await getCloudbase();
      return cb.auth.signInAnonymously();
    },
    signOut: async () => {
      const cb = await getCloudbase();
      return cb.auth.signOut();
    },
    getCurrentUser: async () => {
      const cb = await getCloudbase();
      return cb.auth.getCurrentUser();
    },
    // onAuthStateChanged 必须同步返回取消订阅函数
    onAuthStateChanged: (callback: any) => {
      let unsubscribe: (() => void) | null = null;

      // 异步设置监听器
      getCloudbase().then(cb => {
        unsubscribe = cb.auth.onAuthStateChanged(callback);
      }).catch(error => {
        console.error('设置认证监听器失败:', error);
      });

      // 立即返回取消订阅函数
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  },
  subscription: {
    getUserSubscription: async () => {
      const cb = await getCloudbase();
      return cb.subscription.getUserSubscription();
    },
    updateSubscription: async (plan: any, duration: number) => {
      const cb = await getCloudbase();
      return cb.subscription.updateSubscription(plan, duration);
    },
    checkAccess: async (requiredPlan: any) => {
      const cb = await getCloudbase();
      return cb.subscription.checkAccess(requiredPlan);
    }
  },
  hasPermission: (userPlan: any, requiredPlan: any) => {
    // 这是同步方法，直接使用已加载的实例或返回 false
    if (cloudbaseInstance) {
      return cloudbaseInstance.hasPermission(userPlan, requiredPlan);
    }
    return false;
  }
};

export default cloudbase;
