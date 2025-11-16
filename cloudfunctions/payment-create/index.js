/**
 * CloudBase 云函数 - 创建支付订单
 *
 * 功能：
 * 1. 创建微信支付订单
 * 2. 生成支付二维码
 * 3. 记录支付日志
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 定价配置（单位：分）
const PRICING = {
  member: 1990,    // ¥19.9/月
  vip: 19900       // ¥199/年
};

// 订阅时长（月）
const DURATION = {
  member: 1,
  vip: 12
};

exports.main = async (event, context) => {
  const { plan, amount } = event;
  const { OPENID } = cloud.getWXContext();

  // 参数验证
  if (!plan || !PRICING[plan]) {
    return {
      success: false,
      error: '无效的订阅计划'
    };
  }

  if (amount !== PRICING[plan]) {
    return {
      success: false,
      error: '金额不匹配'
    };
  }

  // 生成订单号
  const orderNo = `ORDER_${plan.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // 1. 创建支付日志
    await db.collection('payment_logs').add({
      data: {
        _openid: OPENID,
        user_id: OPENID,
        order_no: orderNo,
        amount,
        plan,
        status: 'pending',
        transaction_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });

    // 2. 调用微信支付统一下单API（个人用户适配）
    const paymentResult = await cloud.cloudPay.unifiedOrder({
      body: `羽毛球训练知识库-${plan === 'member' ? '会员' : 'VIP'}订阅`,
      outTradeNo: orderNo,
      spbillCreateIp: '127.0.0.1',
      totalFee: amount,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'payment-callback', // 支付成功后的回调云函数
      tradeType: 'JSAPI', // 小程序支付，适配个人用户
      notifyUrl: '', // 可选：自定义回调URL
      attach: JSON.stringify({ plan, duration: DURATION[plan] }) // 附加数据
    });

    // 3. 返回支付信息
    return {
      success: true,
      data: {
        orderNo,
        codeUrl: paymentResult.codeUrl, // 二维码链接
        amount,
        plan,
        expiresIn: 300 // 二维码5分钟有效期
      }
    };

  } catch (error) {
    console.error('创建支付订单失败:', error);

    // 更新支付日志为失败
    await db.collection('payment_logs')
      .where({
        order_no: orderNo
      })
      .update({
        data: {
          status: 'failed',
          updated_at: new Date().toISOString()
        }
      });

    return {
      success: false,
      error: error.message || '创建订单失败'
    };
  }
};
