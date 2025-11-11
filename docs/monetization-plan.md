# 羽毛球知识库商业化技术方案

## 一、技术架构升级

### 1.1 当前架构
```
Docusaurus静态站点 → CDN → 用户访问
```

### 1.2 升级架构
```
前端(Docusaurus) → 后端API → 数据库
                    ↓
            微信小程序 → 后端API
                    ↓
            管理后台 → 后端API
```

## 二、核心功能模块

### 2.1 用户认证与授权系统

#### 技术栈选择
```javascript
// 推荐方案: Supabase (开源Firebase替代)
// 优势: 自托管、低成本、功能完整

技术组件:
- 认证: Supabase Auth (支持微信登录、手机号)
- 数据库: PostgreSQL + Row Level Security
- 实时功能: WebSocket订阅
- 存储: Object Storage (图片、视频)
```

#### 权限分级
```typescript
// types/user.ts
enum UserRole {
  FREE = 'free',        // 免费用户
  MEMBER = 'member',    // 会员
  VIP = 'vip',          // VIP
  COACH = 'coach',      // 教练
  VENUE = 'venue'       // 球场老板
}

interface User {
  id: string;
  role: UserRole;
  subscription: {
    plan: string;
    expiresAt: Date;
  };
  permissions: string[]; // ['read:basic', 'read:premium', 'write:notes']
}
```

### 2.2 内容访问控制

#### Docusaurus集成
```javascript
// docusaurus.config.js
module.exports = {
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        // 自定义插件实现访问控制
        beforeDefaultRemarkPlugins: [
          require('./plugins/content-access-control')
        ]
      }
    ]
  ]
};

// plugins/content-access-control.js
module.exports = function contentAccessControl() {
  return async (tree, file) => {
    const frontmatter = file.data.frontMatter;

    // 标记需要权限的内容
    if (frontmatter.premium) {
      tree.children.unshift({
        type: 'jsx',
        value: '<PremiumGate requiredRole="member" />'
      });
    }
  };
};
```

#### 前端权限组件
```tsx
// components/PremiumGate.tsx
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/router';

export function PremiumGate({
  children,
  requiredRole = 'member'
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) return <Skeleton />;

  if (!user || !hasPermission(user.role, requiredRole)) {
    return (
      <div className="premium-wall">
        <Lock size={48} />
        <h3>此内容仅限{roleNames[requiredRole]}查看</h3>
        <Button onClick={() => router.push('/pricing')}>
          立即升级
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 2.3 教练/球场管理后台

#### 后台功能模块
```typescript
// 学员管理
interface Student {
  id: string;
  name: string;
  age: number;
  level: string;
  trainingRecords: TrainingRecord[];
  assessments: Assessment[];
}

// 课程管理
interface Course {
  id: string;
  title: string;
  ageGroup: string;
  curriculum: Lesson[];
  students: string[];
}

// 获客工具
interface MarketingTool {
  landingPage: {
    customDomain: string;
    template: string;
    seoConfig: SEOConfig;
  };
  forms: {
    trial: TrialForm;
    enrollment: EnrollmentForm;
  };
  promotions: Coupon[];
}
```

#### 管理后台实现
```bash
# 推荐使用 Refine.dev (开源后台框架)
npm create refine-app@latest coach-admin

选择:
✓ UI Framework: Ant Design
✓ Auth Provider: Supabase
✓ Data Provider: Supabase
✓ i18n: 中文
```

```tsx
// pages/students/list.tsx
import { List, Table, useTable } from '@refinedev/antd';

export const StudentList = () => {
  const { tableProps } = useTable<Student>({
    resource: 'students',
    filters: {
      permanent: [
        { field: 'coachId', operator: 'eq', value: currentUser.id }
      ]
    }
  });

  return (
    <List>
      <Table {...tableProps}>
        <Table.Column dataIndex="name" title="姓名" />
        <Table.Column dataIndex="age" title="年龄" />
        <Table.Column dataIndex="level" title="水平" />
        <Table.Column
          dataIndex="lastTraining"
          title="最近训练"
          render={(date) => formatDate(date)}
        />
      </Table>
    </List>
  );
};
```

### 2.4 支付系统集成

#### 推荐方案
```javascript
// 国内: 微信支付 + 支付宝
// 国际: Stripe

// utils/payment.ts
import WxPay from 'wechatpay-node-v3';

export async function createSubscription(userId: string, plan: string) {
  const payment = new WxPay({
    appid: process.env.WECHAT_APPID,
    mchid: process.env.WECHAT_MCHID,
    private_key: process.env.WECHAT_PRIVATE_KEY
  });

  const order = await payment.transactions_jsapi({
    description: `羽毛球知识库-${plan}`,
    out_trade_no: generateOrderNo(),
    amount: { total: getPlanPrice(plan) },
    payer: { openid: user.openid }
  });

  return order;
}

// Webhook处理
export async function handlePaymentSuccess(event) {
  const { userId, plan, orderId } = event.data;

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: plan,
      status: 'active',
      expires_at: addMonths(new Date(), 1)
    });

  // 发送确认邮件/微信通知
  await sendConfirmation(userId);
}
```

## 三、分阶段实施计划

### Phase 1: MVP (2-3周)
```yaml
目标: 基础会员系统上线

技术任务:
  - ✅ Supabase项目搭建
  - ✅ 用户认证(微信登录)
  - ✅ 内容分级标记(frontmatter)
  - ✅ PremiumGate组件
  - ✅ 支付集成(微信支付)
  - ✅ 订阅管理

产品任务:
  - 划分20%内容为高级内容
  - 定价页面设计
  - 支付流程测试
```

### Phase 2: B端系统 (4-6周)
```yaml
目标: 教练管理后台上线

技术任务:
  - 后台框架搭建(Refine)
  - 学员管理CRUD
  - 训练记录系统
  - 品牌页面生成器
  - 表单工具

产品任务:
  - 招募种子教练(5-10位)
  - 收集反馈迭代
  - 定价策略验证
```

### Phase 3: 增长引擎 (持续)
```yaml
营销工具:
  - SEO优化(教练个人页)
  - 转介绍系统
  - 优惠券引擎
  - 数据看板

运营策略:
  - 内容营销(公众号、抖音)
  - 教练培训计划
  - 线下沙龙活动
```

## 四、成本与收益预估

### 技术成本(月度)
```yaml
基础设施:
  Supabase Free → Pro: ¥0 → ¥150
  CDN (Cloudflare): ¥0
  域名+SSL: ¥10
  短信服务: ¥100
  支付手续费: 0.6% 交易额

总计: ~¥260 + 0.6%交易费
```

### 收益预测(保守估算)
```yaml
C端会员:
  月活5000人 × 2%转化 × ¥19.9 = ¥1,990

B端教练:
  10个教练 × ¥299 = ¥2,990

总计第一个月: ¥4,980
3个月目标: ¥15,000+
```

## 五、快速启动代码

### 1. Supabase Schema
```sql
-- users表(Supabase Auth自动创建)

-- subscriptions表
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  plan text not null,
  status text not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- students表
create table students (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid references auth.users not null,
  name text not null,
  age int,
  level text,
  created_at timestamp with time zone default now()
);

alter table students enable row level security;

create policy "Coaches can manage own students"
  on students for all
  using (auth.uid() = coach_id);
```

### 2. 环境变量配置
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

WECHAT_APPID=wx123456
WECHAT_SECRET=abc123
WECHAT_MCHID=1234567890
WECHAT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...

NEXT_PUBLIC_SITE_URL=https://badminton.yourdomain.com
```

### 3. 快速部署脚本
```bash
# deploy.sh
#!/bin/bash

# 1. 构建静态站点
npm run build

# 2. 部署到Cloudflare Pages
npx wrangler pages deploy build --project-name=badminton-kb

# 3. 部署Supabase Functions (支付webhook)
supabase functions deploy payment-webhook

# 4. 部署管理后台
cd admin && npm run build && vercel --prod

echo "✅ 部署完成!"
```

## 六、关键注意事项

### 安全性
```typescript
// 1. API路由保护
// app/api/admin/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.role !== 'coach') {
    return new Response('Unauthorized', { status: 401 });
  }

  // ... 业务逻辑
}

// 2. 内容加密(高级内容)
// 防止F12查看源码
import CryptoJS from 'crypto-js';

export function encryptContent(content: string) {
  return CryptoJS.AES.encrypt(content, process.env.CONTENT_KEY).toString();
}

// 前端解密
const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
```

### 性能优化
```javascript
// 1. 边缘缓存
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/docs/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }
      ]
    }
  ]
};

// 2. 数据库索引
create index idx_subscriptions_user_status on subscriptions(user_id, status);
create index idx_students_coach on students(coach_id);
```

---

## 下一步行动

1. **本周**:
   - [ ] 注册Supabase账号
   - [ ] 设置微信支付商户号
   - [ ] 标记20%高级内容

2. **下周**:
   - [ ] 实现登录功能
   - [ ] 部署支付流程
   - [ ] 邀请3位教练内测

3. **本月**:
   - [ ] 上线会员系统
   - [ ] 验证定价策略
   - [ ] 收集用户反馈

需要我帮你实现哪个模块的详细代码?
