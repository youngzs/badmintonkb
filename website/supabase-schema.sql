-- Supabase数据库初始化脚本
-- 羽毛球知识库会员系统 (Docusaurus版)

-- ============================================
-- 1. 订阅表
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'member', 'vip', 'coach', 'venue')),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 确保每个用户只有一条订阅记录
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- 行级安全策略
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的订阅
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- 🚨 开发测试模式: 允许用户修改自己的订阅
-- 生产环境应该注释掉这条策略!
CREATE POLICY "Users can modify own subscription (DEV ONLY)"
    ON public.subscriptions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. 支付记录表 (可选,预留)
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_no TEXT UNIQUE,
    amount INTEGER,
    plan TEXT,
    status TEXT CHECK (status IN ('pending', 'success', 'failed')),
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_no ON public.payment_logs(order_no);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON public.payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at DESC);

-- 行级安全策略
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payment logs"
    ON public.payment_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 3. 自动更新updated_at触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 订阅表触发器
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 支付记录表触发器
DROP TRIGGER IF EXISTS update_payment_logs_updated_at ON public.payment_logs;
CREATE TRIGGER update_payment_logs_updated_at
    BEFORE UPDATE ON public.payment_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. 检查订阅过期的函数
-- ============================================
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS VOID AS $$
BEGIN
    UPDATE public.subscriptions
    SET
        status = 'expired',
        plan = 'free',
        updated_at = NOW()
    WHERE
        status = 'active'
        AND expires_at IS NOT NULL
        AND expires_at < NOW();

    RAISE NOTICE 'Expired % subscriptions', ROW_COUNT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. 用户注册时自动创建免费订阅
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan, status, expires_at)
    VALUES (NEW.id, 'free', 'active', NULL)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 监听auth.users表的插入
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. 测试数据(可选)
-- ============================================
-- 取消注释以创建测试数据
/*
-- 获取当前用户ID
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;

    IF current_user_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (user_id, plan, status, expires_at)
        VALUES (current_user_id, 'free', 'active', NULL)
        ON CONFLICT (user_id) DO NOTHING;

        RAISE NOTICE 'Created test subscription for user %', current_user_id;
    END IF;
END $$;
*/

-- ============================================
-- 完成
-- ============================================
COMMENT ON TABLE public.subscriptions IS '用户订阅信息表';
COMMENT ON TABLE public.payment_logs IS '支付记录日志表(预留)';
COMMENT ON FUNCTION expire_subscriptions IS '检查并过期订阅(定时任务)';
COMMENT ON FUNCTION handle_new_user IS '新用户注册时自动创建免费订阅';

-- 显示创建结果
SELECT '✅ Database schema initialized successfully!' AS status;
