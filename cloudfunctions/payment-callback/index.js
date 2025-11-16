/**
 * CloudBase 云函数 - 支付回调
 *
 * 功能：
 * 1. 处理微信支付成功回调
 * 2. 更新用户订阅状态
 * 3. 记录支付成功日志
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log('支付回调触发:', event);

  const {
    returnCode,
    resultCode,
    outTradeNo,
    transactionId,
    attach
  } = event;

  // 验证支付结果
  if (returnCode !== 'SUCCESS' || resultCode !== 'SUCCESS') {
    console.error('支付失败:', event);
    return {
      errcode: -1,
      errmsg: '支付失败'
    };
  }

  try {
    // 解析附加数据
    const attachData = JSON.parse(attach || '{}');
    const { plan, duration } = attachData;

    // 1. 查询支付日志
    const { data: logs } = await db.collection('payment_logs')
      .where({
        order_no: outTradeNo
      })
      .get();

    if (!logs || logs.length === 0) {
      console.error('订单不存在:', outTradeNo);
      return {
        errcode: -2,
        errmsg: '订单不存在'
      };
    }

    const log = logs[0];
    const userId = log.user_id;

    // 2. 检查订单是否已处理
    if (log.status === 'success') {
      console.log('订单已处理:', outTradeNo);
      return {
        errcode: 0,
        errmsg: 'OK'
      };
    }

    // 3. 计算订阅到期时间
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (duration || 1));

    // 4. 更新用户订阅（使用事务确保原子性）
    const transaction = await db.startTransaction();

    try {
      // 查询用户现有订阅
      const { data: subscriptions } = await transaction.collection('subscriptions')
        .where({
          user_id: userId
        })
        .get();

      if (subscriptions && subscriptions.length > 0) {
        // 更新现有订阅
        const sub = subscriptions[0];
        const currentExpiresAt = sub.expires_at ? new Date(sub.expires_at) : new Date();
        const newExpiresAt = currentExpiresAt > new Date()
          ? new Date(currentExpiresAt.setMonth(currentExpiresAt.getMonth() + duration))
          : expiresAt;

        await transaction.collection('subscriptions')
          .doc(sub._id)
          .update({
            data: {
              plan,
              status: 'active',
              expires_at: newExpiresAt.toISOString(),
              updated_at: new Date().toISOString()
            }
          });
      } else {
        // 创建新订阅
        await transaction.collection('subscriptions').add({
          data: {
            user_id: userId,
            plan,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      }

      // 更新支付日志
      await transaction.collection('payment_logs')
        .doc(log._id)
        .update({
          data: {
            status: 'success',
            transaction_id: transactionId,
            updated_at: new Date().toISOString()
          }
        });

      // 提交事务
      await transaction.commit();

      console.log('订阅更新成功:', userId, plan, expiresAt);

      return {
        errcode: 0,
        errmsg: 'OK'
      };

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('处理支付回调失败:', error);
    return {
      errcode: -3,
      errmsg: error.message || '处理失败'
    };
  }
};
