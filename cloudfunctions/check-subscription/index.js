/**
 * CloudBase 云函数 - 检查订阅状态
 *
 * 功能：
 * 1. 查询用户订阅信息
 * 2. 检查订阅是否过期
 * 3. 返回权限信息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  try {
    // 查询用户订阅
    const { data: subscriptions } = await db.collection('subscriptions')
      .where({
        user_id: OPENID
      })
      .get();

    if (!subscriptions || subscriptions.length === 0) {
      // 没有订阅记录，返回免费用户
      return {
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          expiresAt: null,
          hasAccess: {
            free: true,
            member: false,
            vip: false
          }
        }
      };
    }

    const subscription = subscriptions[0];
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
    const isExpired = expiresAt && expiresAt < new Date();

    // 如果过期，自动降级为免费用户
    if (isExpired && subscription.status === 'active') {
      await db.collection('subscriptions')
        .doc(subscription._id)
        .update({
          data: {
            plan: 'free',
            status: 'expired',
            updated_at: new Date().toISOString()
          }
        });
    }

    const currentPlan = isExpired ? 'free' : subscription.plan;

    // 权限层级
    const hierarchy = {
      free: 0,
      member: 1,
      vip: 2,
      coach: 3,
      venue: 3
    };

    const userLevel = hierarchy[currentPlan] || 0;

    return {
      success: true,
      data: {
        plan: currentPlan,
        status: isExpired ? 'expired' : subscription.status,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        hasAccess: {
          free: userLevel >= hierarchy.free,
          member: userLevel >= hierarchy.member,
          vip: userLevel >= hierarchy.vip,
          coach: userLevel >= hierarchy.coach,
          venue: userLevel >= hierarchy.venue
        }
      }
    };

  } catch (error) {
    console.error('检查订阅失败:', error);
    return {
      success: false,
      error: error.message || '查询失败'
    };
  }
};
