/**
 * CloudBase 云函数 - 定时任务：过期订阅处理
 *
 * 功能：
 * 1. 每小时检查过期订阅
 * 2. 自动降级为免费用户
 * 3. 记录过期日志
 *
 * 触发器配置：
 * cron: "0 * * * * * *" (每小时)
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log('定时任务启动：检查过期订阅');

  try {
    const now = new Date();

    // 查询所有活跃的、已过期的订阅
    const { data: expiredSubscriptions } = await db.collection('subscriptions')
      .where({
        status: 'active',
        expires_at: _.lt(now.toISOString()).and(_.neq(null))
      })
      .get();

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('没有过期订阅');
      return {
        success: true,
        message: '没有过期订阅',
        count: 0
      };
    }

    console.log(`发现 ${expiredSubscriptions.length} 个过期订阅`);

    // 批量更新过期订阅
    const updatePromises = expiredSubscriptions.map(async (sub) => {
      try {
        await db.collection('subscriptions')
          .doc(sub._id)
          .update({
            data: {
              plan: 'free',
              status: 'expired',
              updated_at: now.toISOString()
            }
          });

        console.log(`订阅已过期: user_id=${sub.user_id}, plan=${sub.plan}`);
        return { success: true, userId: sub.user_id };
      } catch (error) {
        console.error(`更新失败: user_id=${sub.user_id}`, error);
        return { success: false, userId: sub.user_id, error: error.message };
      }
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`过期订阅处理完成: 成功=${successCount}, 失败=${failCount}`);

    return {
      success: true,
      message: `处理完成`,
      total: expiredSubscriptions.length,
      successCount,
      failCount,
      results
    };

  } catch (error) {
    console.error('定时任务执行失败:', error);
    return {
      success: false,
      error: error.message || '执行失败'
    };
  }
};
