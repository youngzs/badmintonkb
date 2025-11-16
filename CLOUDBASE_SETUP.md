# CloudBase 数据库和支付系统设置指南

## 📌 快速操作指南

### 立即需要做的事：

1. **创建两个数据库集合** (5分钟)
   - 访问: https://console.cloud.tencent.com/tcb
   - 选择 `badminton-kb` 环境
   - 创建 `subscriptions` 集合，权限：**"读取和修改本人数据"**
   - 创建 `payment_logs` 集合，权限：**"读取和修改本人数据"** (测试用)

2. **测试支付流程** (2分钟)
   ```bash
   cd website
   npm start
   ```
   - 打开浏览器按 F12 查看控制台
   - 匿名登录 → 访问会员内容页 → 点击开通 → 查看日志

3. **验证结果**
   - 页面内容立即显示
   - CloudBase 控制台能看到订阅记录

---

## 当前状态

✅ CloudBase 环境已创建: `badminton-kb-0g3ceetq971337db`
✅ 前端认证系统已修复
✅ 调试日志已添加
❌ 数据库集合未创建 ← **你需要手动创建**
❌ 云函数未部署 (测试阶段不需要)

## 需要完成的步骤

### 1. 创建数据库集合

由于 CloudBase Node SDK 需要配置腾讯云密钥，建议通过 **Web 控制台** 手动创建集合。

#### 操作步骤：

1. **访问 CloudBase 控制台**
   https://console.cloud.tencent.com/tcb

2. **选择环境**
   选择 `badminton-kb` 环境

3. **进入数据库管理**
   左侧菜单 → 数据库 → 集合管理

4. **创建 `subscriptions` 集合**
   - 点击"新建集合"
   - 集合名称: `subscriptions`
   - **权限设置**: 选择 **"读取和修改本人数据"**
     - 适用场景：用户只能查看和修改自己的订阅信息
     - CloudBase 会自动添加 `_openid` 字段进行权限控制

   **字段结构**:
   ```json
   {
     "_openid": "string",        // CloudBase自动添加的用户标识
     "user_id": "string",        // 用户ID (与_openid相同)
     "plan": "string",           // 订阅计划: free/member/vip
     "status": "string",         // 状态: active/expired/cancelled
     "expires_at": "string",     // 过期时间 (ISO格式)
     "created_at": "string",     // 创建时间
     "updated_at": "string"      // 更新时间
   }
   ```

   **注意**:
   - `_openid` 字段会被 CloudBase 自动添加，不需要手动创建
   - 权限系统会确保用户只能访问自己的订阅记录

5. **创建 `payment_logs` 集合**
   - 点击"新建集合"
   - 集合名称: `payment_logs`
   - **权限设置**: 选择 **"无权限"**
     - 适用场景：敏感的支付日志，只允许云函数访问
     - 用户无法直接读取或修改支付记录

   **字段结构**:
   ```json
   {
     "_openid": "string",        // CloudBase自动添加的用户标识
     "user_id": "string",        // 用户ID
     "order_no": "string",       // 订单号
     "amount": "number",         // 金额(分)
     "plan": "string",           // 订阅计划
     "status": "string",         // 状态: pending/success/failed
     "transaction_id": "string", // 微信交易号
     "created_at": "string",     // 创建时间
     "updated_at": "string"      // 更新时间
   }
   ```

   **注意**:
   - 此集合设置为"无权限"，确保用户无法直接操作支付日志
   - 实际生产环境中，支付日志应该只由云函数写入

### 权限设置说明

**重要提示**: 由于我们目前在测试阶段，**建议两个集合都暂时设置为"读取和修改本人数据"**，方便浏览器端直接测试。

**测试阶段权限** (推荐):
- ✅ `subscriptions`: **"读取和修改本人数据"**
- ✅ `payment_logs`: **"读取和修改本人数据"** (临时，方便调试)

**生产环境权限** (部署云函数后):
- ✅ `subscriptions`: **"读取和修改本人数据"**
- ✅ `payment_logs`: **"无权限"** (只允许云函数访问)

### 2. 测试支付流程

完成数据库集合创建后，按以下步骤测试：

#### 步骤 1: 启动开发服务器

```bash
cd website
npm start
```

#### 步骤 2: 打开浏览器控制台

- 按 F12 打开开发者工具
- 切换到 Console 标签页
- 观察调试日志输出

#### 步骤 3: 测试登录

1. 点击"登录"按钮
2. 选择"匿名登录"（测试用）
3. 观察控制台日志:
   ```
   🔄 初始化认证系统...
   ✅ 初始用户状态: {...}
   ✅ 认证系统初始化完成
   ```

#### 步骤 4: 测试支付

1. 访问会员内容页面（如 `/example-with-premium`）
2. 点击"升级到普通会员"按钮
3. 在弹窗中点击"确认开通"
4. 观察控制台日志:
   ```
   📝 开始更新订阅: {plan: 'member', duration: 1}
   ✅ 用户信息: {...}
   ✅ 数据库已初始化
   📅 计算过期时间: ...
   🔍 查询现有订阅...
   📊 查询结果: []
   ➕ 创建新订阅记录...
   ✅ 创建结果: {...}
   🎉 订阅更新成功！
   ```

5. 页面应该自动刷新并显示会员内容

#### 步骤 5: 验证数据

1. 返回 CloudBase 控制台
2. 进入数据库 → `subscriptions` 集合
3. 应该能看到新创建的订阅记录

### 3. 常见问题排查

#### 问题 1: 点击"确认开通"后页面内容不显示

**可能原因**:
- 数据库集合未创建
- 数据写入失败（权限问题）
- 状态刷新失败

**排查方法**:
1. 检查控制台日志中的错误信息
2. 确认数据库集合已创建
3. **检查集合权限设置是否为"读取和修改本人数据"**
4. 确认订阅记录已写入数据库
5. 刷新页面查看是否显示内容

#### 问题 1.1: 数据库操作失败 (permission denied)

**错误信息示例**:
```
❌ 更新订阅失败: permission denied
```

**原因**: 数据库集合权限设置不正确

**解决方法**:
1. 进入 CloudBase 控制台 → 数据库 → 集合管理
2. 找到 `subscriptions` 集合
3. 点击"权限设置"
4. 选择 **"读取和修改本人数据"**
5. 保存设置
6. 重新测试

#### 问题 2: 登录失败

**可能原因**:
- CloudBase SDK 初始化失败
- 环境ID配置错误

**排查方法**:
1. 检查 `.env` 文件中的 `NEXT_PUBLIC_CLOUDBASE_ENV_ID`
2. 确认值为: `badminton-kb-0g3ceetq971337db`
3. 重新启动开发服务器

#### 问题 3: 数据库查询失败

**可能原因**:
- 集合名称拼写错误
- 权限设置不正确

**排查方法**:
1. 确认集合名称: `subscriptions` (小写,复数)
2. 检查集合权限设置
3. 查看控制台错误信息

### 4. 云函数部署（可选）

目前使用的是**模拟支付**，不需要部署云函数。如需真实支付，按以下步骤部署：

```bash
# 部署所有云函数
cloudbase functions:deploy payment-create
cloudbase functions:deploy payment-callback
cloudbase functions:deploy check-subscription
cloudbase functions:deploy expire-subscriptions
```

**注意**: 真实支付需要配置微信支付商户号和密钥。

### 5. 生产环境部署

```bash
# 1. 构建网站
cd website
npm run build

# 2. 部署到 CloudBase
cloudbase hosting:deploy ./build -e badminton-kb-0g3ceetq971337db
```

## 调试日志说明

### 认证流程日志

- 🔄 初始化认证系统
- ✅ 用户状态/信息
- ❌ 错误信息

### 订阅流程日志

- 📝 开始更新订阅
- 🔍 查询订阅记录
- 📊 查询结果
- ➕ 创建新订阅
- 🔄 更新现有订阅
- ✅ 操作成功
- ❌ 操作失败

### 支付流程日志

- 💳 支付相关操作
- 📅 日期计算
- 🎉 流程完成

## 下一步建议

1. ✅ 完成数据库集合创建
2. ✅ 测试完整支付流程
3. 🔧 根据调试日志排查问题
4. 📊 验证数据库记录
5. 🚀 部署到生产环境

## 系统架构与流程图

### 1. 整体系统架构

```mermaid
graph TB
    subgraph "前端 Frontend"
        A[Docusaurus 静态站点]
        B[React 组件]
        C[AuthContext 认证上下文]
        D[PremiumGate 权限控制]
        E[PayButton 支付按钮]
    end

    subgraph "CloudBase SDK"
        F[cloudbase-browser.ts]
        G[@cloudbase/js-sdk]
    end

    subgraph "腾讯云 CloudBase"
        H[认证服务 Auth]
        I[数据库 Database]
        J[云函数 Functions]
        K[云存储 Storage]
    end

    subgraph "数据库集合"
        L[(subscriptions)]
        M[(payment_logs)]
    end

    A --> B
    B --> C
    C --> F
    D --> C
    E --> C
    F --> G
    G --> H
    G --> I
    I --> L
    I --> M
    J --> I

    style A fill:#e1f5ff
    style H fill:#fff4e6
    style I fill:#fff4e6
    style J fill:#fff4e6
    style L fill:#e8f5e9
    style M fill:#e8f5e9
```

### 2. 用户认证流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端页面
    participant A as AuthContext
    participant CB as CloudBase SDK
    participant TCB as 腾讯云 Auth

    U->>F: 点击登录按钮
    F->>A: signIn('anonymous')
    A->>CB: cloudbase.auth.signInAnonymously()
    CB->>TCB: 匿名登录请求
    TCB-->>CB: 返回登录凭证
    CB-->>A: 登录成功
    A->>CB: getCurrentUser()
    CB->>TCB: 获取用户信息
    TCB-->>CB: 返回用户信息
    CB-->>A: 用户信息
    A->>A: 更新 user state
    A->>A: loadSubscription()
    A-->>F: 更新 UI (显示已登录)
    F-->>U: 显示用户信息

    Note over A,CB: 🔍 调试日志:<br/>✅ 初始用户状态<br/>✅ 认证系统初始化完成
```

### 3. 订阅查询流程

```mermaid
sequenceDiagram
    participant A as AuthContext
    participant CB as CloudBase SDK
    participant DB as 数据库
    participant SC as subscriptions集合

    A->>CB: getUserSubscription()
    CB->>A: getCurrentUser()
    A-->>CB: user { uid, openid }

    CB->>DB: 查询订阅记录
    DB->>SC: where({ user_id: uid })

    alt 找到订阅记录
        SC-->>DB: 返回订阅数据
        DB-->>CB: subscription data
        CB->>CB: 检查是否过期
        alt 未过期
            CB-->>A: { plan, status: 'active' }
        else 已过期
            CB-->>A: { plan: 'free', status: 'expired' }
        end
    else 未找到记录
        SC-->>DB: 空数组
        DB-->>CB: []
        CB-->>A: 默认订阅 (free)
    end

    A->>A: 更新 subscription state

    Note over CB,DB: 🔍 调试日志:<br/>🔍 查询订阅记录<br/>📊 查询结果<br/>✅ 订阅信息
```

### 4. 支付开通流程 (模拟支付)

```mermaid
sequenceDiagram
    participant U as 用户
    participant PB as PayButton
    participant A as AuthContext
    participant CB as CloudBase SDK
    participant DB as 数据库
    participant SC as subscriptions集合

    U->>PB: 点击"确认开通"
    PB->>A: 检查登录状态
    A-->>PB: user 存在

    PB->>CB: updateSubscription(plan, duration)

    Note over CB: 📝 开始更新订阅<br/>plan: 'member', duration: 1

    CB->>CB: getCurrentUser()
    CB->>CB: 计算过期时间

    Note over CB: 📅 expiresAt = now + 1 month

    CB->>DB: 查询现有订阅
    DB->>SC: where({ user_id })

    alt 已有订阅记录
        SC-->>DB: 返回现有记录
        DB-->>CB: existing subscription

        Note over CB: 🔄 更新现有订阅

        CB->>SC: update({<br/>  plan: 'member',<br/>  status: 'active',<br/>  expires_at,<br/>  updated_at<br/>})
        SC-->>CB: 更新成功

    else 无订阅记录
        SC-->>DB: []
        DB-->>CB: 空数组

        Note over CB: ➕ 创建新订阅记录

        CB->>SC: add({<br/>  user_id,<br/>  plan: 'member',<br/>  status: 'active',<br/>  expires_at,<br/>  created_at,<br/>  updated_at<br/>})
        SC-->>CB: 创建成功
    end

    CB-->>PB: { success: true }

    Note over CB: 🎉 订阅更新成功

    PB->>A: refreshSubscription()
    A->>CB: getUserSubscription()
    CB->>DB: 查询最新订阅
    DB-->>CB: 返回订阅数据
    CB-->>A: 更新后的订阅
    A->>A: 更新 subscription state
    A-->>PB: 刷新完成

    PB->>PB: onSuccess() 回调
    PB-->>U: 显示成功提示

    Note over U: 页面自动刷新<br/>会员内容显示
```

### 5. 权限校验流程

```mermaid
graph TB
    Start([用户访问页面]) --> A{是否包含<br/>PremiumContent?}

    A -->|否| ShowAll[显示全部内容]
    A -->|是| B{用户是否登录?}

    B -->|否| ShowPreview1[显示预览内容<br/>+ 登录按钮]
    B -->|是| C[获取用户订阅信息]

    C --> D{查询数据库<br/>subscriptions}

    D --> E{是否有订阅?}

    E -->|否| F[返回 free 订阅]
    E -->|是| G{订阅是否过期?}

    G -->|是| F
    G -->|否| H[返回实际订阅]

    F --> I{hasAccess 检查}
    H --> I

    I --> J{用户权限 >= 所需权限?}

    J -->|是| ShowContent[✅ 显示完整内容]
    J -->|否| ShowUpgrade[🔒 显示升级提示<br/>+ 支付按钮]

    style Start fill:#e3f2fd
    style ShowAll fill:#c8e6c9
    style ShowContent fill:#c8e6c9
    style ShowPreview1 fill:#fff9c4
    style ShowUpgrade fill:#ffccbc

    Note1[权限等级:<br/>free: 0<br/>member: 1<br/>vip: 2<br/>coach: 3<br/>venue: 3]

    style Note1 fill:#f3e5f5
```

### 6. 配置参数位置与说明

```mermaid
graph LR
    subgraph "环境配置文件"
        ENV[website/.env]
    end

    subgraph "环境变量"
        E1[NEXT_PUBLIC_CLOUDBASE_ENV_ID]
        E2[NEXT_PUBLIC_WECHAT_APPID]
        E3[WECHAT_SUB_MCH_ID]
    end

    subgraph "前端配置"
        F1[cloudbase-browser.ts<br/>ENV_ID]
        F2[docusaurus.config.ts<br/>环境变量注入]
    end

    subgraph "云函数配置"
        C1[cloudbaserc.json<br/>envId: ENV_ID]
        C2[payment-create/index.js<br/>WECHAT_SUB_MCH_ID]
    end

    subgraph "CloudBase 后台"
        B1[环境ID配置]
        B2[数据库集合]
        B3[云函数部署]
        B4[环境变量设置]
    end

    ENV --> E1
    ENV --> E2
    ENV --> E3

    E1 -.读取.-> F1
    E1 -.读取.-> F2
    E1 -.读取.-> C1
    E2 -.读取.-> F1
    E3 -.读取.-> C2

    F1 -.连接.-> B1
    C1 -.部署.-> B3
    C2 -.使用.-> B4

    B1 --> B2
    B3 --> B2

    style ENV fill:#fff3e0
    style E1 fill:#e1f5fe
    style E2 fill:#e1f5fe
    style E3 fill:#e1f5fe
    style F1 fill:#f3e5f5
    style F2 fill:#f3e5f5
    style C1 fill:#e8f5e9
    style C2 fill:#e8f5e9
    style B1 fill:#fff9c4
    style B2 fill:#fff9c4
    style B3 fill:#fff9c4
    style B4 fill:#fff9c4
```

### 7. 配置参数详细说明

| 参数名称 | 位置 | 用途 | 示例值 |
|---------|------|------|--------|
| `NEXT_PUBLIC_CLOUDBASE_ENV_ID` | `.env` | CloudBase 环境ID | `badminton-kb-0g3ceetq971337db` |
| `NEXT_PUBLIC_WECHAT_APPID` | `.env` | 微信公众号/小程序 AppID | `wx1234567890abcdef` |
| `WECHAT_SUB_MCH_ID` | `.env` | 微信支付子商户号 | `1234567890` |

#### 配置文件示例:

**website/.env**
```bash
# CloudBase 环境ID (必须以 NEXT_PUBLIC_ 开头，才能在浏览器端访问)
NEXT_PUBLIC_CLOUDBASE_ENV_ID=badminton-kb-0g3ceetq971337db

# 微信公众号/小程序 AppID
NEXT_PUBLIC_WECHAT_APPID=your_wechat_appid

# 微信支付子商户号 (仅云函数使用，不需要 NEXT_PUBLIC_ 前缀)
WECHAT_SUB_MCH_ID=your_sub_mch_id
```

#### 使用位置:

1. **cloudbase-browser.ts** (第 26 行)
   ```typescript
   const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID || 'badminton-kb-0g3ceetq971337db';
   ```

2. **cloudbaserc.json** (第 4 行)
   ```json
   "envId": "{{env.ENV_ID}}"
   ```

3. **payment-create/index.js** (第 74 行)
   ```javascript
   subMchId: process.env.WECHAT_SUB_MCH_ID
   ```

### 8. 数据库权限校验流程

```mermaid
graph TB
    Start([前端发起数据库操作]) --> A{集合权限设置}

    A -->|所有用户| B[✅ 允许所有读取<br/>✅ 允许修改本人数据]
    A -->|读取和修改本人数据| C{检查 _openid}
    A -->|读取全部数据| D[✅ 允许读取<br/>❌ 禁止修改]
    A -->|无权限| E[❌ 完全禁止]

    C --> F{_openid == 当前用户?}
    F -->|是| G[✅ 允许读写]
    F -->|否| H[❌ 拒绝访问]

    E --> End1([返回 permission denied])
    H --> End1
    D --> End2([返回数据/拒绝修改])
    B --> End3([执行操作])
    G --> End3

    style Start fill:#e3f2fd
    style End1 fill:#ffcdd2
    style End2 fill:#fff9c4
    style End3 fill:#c8e6c9

    Note1["测试环境设置:<br/>subscriptions: 读取和修改本人数据<br/>payment_logs: 读取和修改本人数据"]
    Note2["生产环境设置:<br/>subscriptions: 读取和修改本人数据<br/>payment_logs: 无权限"]

    style Note1 fill:#e1f5fe
    style Note2 fill:#fff3e0
```

### 9. 完整数据流向图

```mermaid
graph TB
    subgraph "用户操作层"
        U1[访问会员页面]
        U2[点击登录]
        U3[点击开通会员]
    end

    subgraph "React 组件层"
        C1[PremiumGate]
        C2[LoginButton]
        C3[PayButton]
    end

    subgraph "上下文管理层"
        CTX[AuthContext<br/>- user<br/>- subscription<br/>- loading]
    end

    subgraph "CloudBase SDK 层"
        SDK1[认证模块<br/>cloudbase.auth]
        SDK2[数据库模块<br/>cloudbase.db]
        SDK3[订阅模块<br/>cloudbase.subscription]
    end

    subgraph "腾讯云服务"
        TCB1[认证服务]
        TCB2[数据库服务]
        TCB3[(subscriptions)]
        TCB4[(payment_logs)]
    end

    U1 --> C1
    U2 --> C2
    U3 --> C3

    C1 --> CTX
    C2 --> CTX
    C3 --> CTX

    CTX --> SDK1
    CTX --> SDK2
    CTX --> SDK3

    SDK1 --> TCB1
    SDK2 --> TCB2
    SDK3 --> TCB2

    TCB2 --> TCB3
    TCB2 --> TCB4

    TCB3 -.返回订阅数据.-> SDK3
    SDK3 -.更新state.-> CTX
    CTX -.重新渲染.-> C1
    C1 -.显示内容.-> U1

    style U1 fill:#e3f2fd
    style U2 fill:#e3f2fd
    style U3 fill:#e3f2fd
    style CTX fill:#fff3e0
    style TCB3 fill:#c8e6c9
    style TCB4 fill:#c8e6c9
```

### 10. 错误处理与重试机制

```mermaid
graph TB
    Start([API 调用]) --> Try{执行操作}

    Try -->|成功| Success[✅ 返回结果<br/>记录日志]
    Try -->|失败| Catch[捕获异常]

    Catch --> Log[📝 console.error<br/>记录错误详情]
    Log --> Check{错误类型?}

    Check -->|网络错误| Retry{重试次数 < 3?}
    Check -->|权限错误| Perm[❌ permission denied<br/>检查集合权限设置]
    Check -->|数据错误| Data[❌ 数据格式错误<br/>检查字段类型]
    Check -->|其他错误| Other[❌ 未知错误<br/>查看详细日志]

    Retry -->|是| Wait[等待 1-3 秒]
    Retry -->|否| Fail[返回失败]

    Wait --> Try

    Perm --> Fail
    Data --> Fail
    Other --> Fail

    Success --> End([完成])
    Fail --> End

    style Start fill:#e3f2fd
    style Success fill:#c8e6c9
    style Fail fill:#ffcdd2
    style Log fill:#fff9c4
    style End fill:#f5f5f5
```

## 帮助资源

- CloudBase 文档: https://docs.cloudbase.net/
- CloudBase 控制台: https://console.cloud.tencent.com/tcb
- 项目文档: `CLOUDBASE_QUICKSTART.md`
