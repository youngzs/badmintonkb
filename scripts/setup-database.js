/**
 * CloudBase 数据库初始化脚本
 * 创建必要的集合和索引
 */

import tcb from '@cloudbase/node-sdk';

// 初始化 CloudBase
const app = tcb.init({
  env: process.env.CLOUDBASE_ENV_ID || 'badminton-kb-0g3ceetq971337db'
});

const db = app.database();

async function setupDatabase() {
  console.log('🚀 开始初始化数据库...\n');

  try {
    // 1. 创建 subscriptions 集合
    console.log('📦 创建 subscriptions 集合...');
    try {
      await db.createCollection('subscriptions');
      console.log('✅ subscriptions 集合创建成功');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  subscriptions 集合已存在');
      } else {
        throw error;
      }
    }

    // 2. 创建 payment_logs 集合
    console.log('\n📦 创建 payment_logs 集合...');
    try {
      await db.createCollection('payment_logs');
      console.log('✅ payment_logs 集合创建成功');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  payment_logs 集合已存在');
      } else {
        throw error;
      }
    }

    // 3. 创建索引（可选，提升查询性能）
    console.log('\n🔍 创建索引...');

    // subscriptions 集合索引
    const subsCollection = db.collection('subscriptions');
    try {
      await subsCollection.createIndex({
        keys: [{ name: 'user_id', direction: '1' }],
        indexName: 'idx_user_id',
        unique: true
      });
      console.log('✅ subscriptions.user_id 索引创建成功');
    } catch (error) {
      console.log('ℹ️  subscriptions 索引已存在或创建失败:', error.message);
    }

    // payment_logs 集合索引
    const logsCollection = db.collection('payment_logs');
    try {
      await logsCollection.createIndex({
        keys: [
          { name: 'user_id', direction: '1' },
          { name: 'created_at', direction: '-1' }
        ],
        indexName: 'idx_user_created'
      });
      console.log('✅ payment_logs 复合索引创建成功');
    } catch (error) {
      console.log('ℹ️  payment_logs 索引已存在或创建失败:', error.message);
    }

    console.log('\n✅ 数据库初始化完成！');
    console.log('\n📊 集合列表:');
    console.log('  - subscriptions (用户订阅信息)');
    console.log('  - payment_logs (支付日志)');

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
setupDatabase()
  .then(() => {
    console.log('\n🎉 所有操作完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 发生错误:', error);
    process.exit(1);
  });
