/**
 * Supabase Edge Function: 创建支付订单
 * 部署: supabase functions deploy create-payment
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 创建Supabase客户端
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 获取请求参数
    const { userId, plan, amount } = await req.json();

    if (!userId || !plan || !amount) {
      throw new Error('缺少必要参数');
    }

    // 生成订单号
    const orderNo = `BDM${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // 创建支付记录
    const { error: insertError } = await supabase
      .from('payment_logs')
      .insert({
        user_id: userId,
        order_no: orderNo,
        amount: amount,
        plan: plan,
        status: 'pending'
      });

    if (insertError) {
      throw new Error('创建订单失败: ' + insertError.message);
    }

    // 调用微信支付API
    const wechatResponse = await fetch('https://api.mch.weixin.qq.com/v3/pay/transactions/native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `WECHATPAY2-SHA256-RSA2048 ${generateWechatAuth()}` // 需要实现签名
      },
      body: JSON.stringify({
        appid: Deno.env.get('WECHAT_APPID'),
        mchid: Deno.env.get('WECHAT_MCHID'),
        description: `羽毛球知识库-${plan === 'vip' ? 'VIP会员' : '普通会员'}`,
        out_trade_no: orderNo,
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
        amount: {
          total: amount,
          currency: 'CNY'
        }
      })
    });

    const wechatData = await wechatResponse.json();

    // 返回二维码URL
    return new Response(
      JSON.stringify({
        orderId: orderNo,
        qrCodeUrl: wechatData.code_url,
        amount: amount,
        plan: plan
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// 生成微信支付签名(简化版,生产环境需完整实现)
function generateWechatAuth(): string {
  // TODO: 实现完整的微信支付签名逻辑
  return 'placeholder';
}
