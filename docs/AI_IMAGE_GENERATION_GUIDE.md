# AI图片生成指南 | AI Image Generation Guide

## 概述 | Overview

本项目使用**即梦AI (Jimeng AI)**自动生成训练插图。所有训练文章中的图片都通过AI生成，确保高质量、一致性和专业性。

This project uses **Jimeng AI** to automatically generate training illustrations. All images in training articles are AI-generated, ensuring high quality, consistency, and professionalism.

---

## 快速开始 | Quick Start

### 前置条件 | Prerequisites

1. **Python 3.8+** 已安装
2. **即梦AI账号** 和 Session ID
3. **image-gen-server MCP** 已配置在 `D:\study\mysite\mcp-servers\image-gen-server`

### 测试单张图片生成 | Test Single Image

```bash
# 测试即梦AI连接和生成功能
python scripts/test_single_image.py
```

**预期输出**:
```
✓ 即梦AI模块加载成功
============================================================
🎨 单图片生成测试
============================================================
输出文件: F:\work\study\sports_training\content\...\test-warmup-demo.png
🚀 正在调用即梦AI生成图片...
✓ API调用成功，返回 4 个URL
📥 正在下载图片...
✅ 成功!
文件大小: 273.8 KB
```

### 批量生成所有图片 | Batch Generate All Images

```bash
# 运行批量生成脚本
python scripts/batch_generate_images.py

# 选择生成方式:
# 1. 全部生成 (推荐) - 自动生成全部17张图片
# 2. 逐个确认生成 - 每张图片前确认
# 3. 仅生成指定范围 - 例如: 1-5 或 1,3,5
```

---

## 图片任务清单 | Image Task List

### 文章1: 4-6岁协调性训练基础 (6张)

| 序号 | 文件名 | 描述 | 状态 |
|------|--------|------|------|
| 1 | `warmup-games-coordination-4-6.png` | 热身游戏(兔跳、螃蟹走、企鹅步、蛙跳) | 待生成 |
| 2 | `hand-eye-coordination-catch-ball-4-6.png` | 手眼协调-接球练习 | 待生成 |
| 3 | `balance-beam-walking-coordination-4-6.png` | 平衡木行走 | 待生成 |
| 4 | `hopscotch-rhythm-coordination-4-6.png` | 跳格子节奏训练 | 待生成 |
| 5 | `cooldown-stretching-relaxation-4-6.png` | 放松拉伸 | 待生成 |
| 6 | `coordination-training-cover.png` | 文章封面 | 待生成 |

### 文章2: 4-6岁平衡能力训练 (6张)

| 序号 | 文件名 | 描述 | 状态 |
|------|--------|------|------|
| 7 | `balance-warmup-activities-4-6.png` | 平衡热身活动 | 待生成 |
| 8 | `single-leg-stand-balance-4-6.png` | 单脚站立平衡 | 待生成 |
| 9 | `balance-beam-walking-series-4-6.png` | 平衡木系列训练 | 待生成 |
| 10 | `balance-bridge-adventure-game-4-6.png` | 独木桥冒险游戏 | 待生成 |
| 11 | `cooldown-proprioception-4-6.png` | 本体感觉放松 | 待生成 |
| 12 | `balance-training-cover.png` | 文章封面 | 待生成 |

### 文章3: 7-9岁速度与敏捷性训练 (7张)

| 序号 | 文件名 | 描述 | 状态 |
|------|--------|------|------|
| 13 | `dynamic-warmup-speed-agility-7-9.png` | 动态热身 | 待生成 |
| 14 | `reaction-speed-drills-7-9.png` | 反应速度训练 | 待生成 |
| 15 | `acceleration-training-drills-7-9.png` | 加速度训练 | 待生成 |
| 16 | `agility-direction-change-7-9.png` | 敏捷性方向转换(T-test) | 待生成 |
| 17 | `four-corner-shuttle-run-7-9.png` | 四角折返跑 | 待生成 |
| 18 | `badminton-footwork-patterns-7-9.png` | 羽毛球专项步法 | 待生成 |
| 19 | `cooldown-stretching-speed-training-7-9.png` | 拉伸放松 | 待生成 |

**总计**: 19张图片

---

## 技术细节 | Technical Details

### 即梦AI配置 | Jimeng AI Configuration

```python
# API配置
JIMENG_API_TOKEN = "f8fa81e1e80f59223e828d5ca2eb6c06"  # Session ID

# 生成参数
model = "jimeng-4.0"           # 模型版本
width = 1024                    # 图片宽度
height = 1024                   # 图片高度
sample_strength = 0.5           # 精细度 (0-1)
```

### 图片规格 | Image Specifications

- **格式**: PNG
- **分辨率**: 1024×1024 像素
- **质量**: 高清，适合网页和打印
- **文件大小**: 约200-400 KB/张
- **风格**: 专业儿童体育训练插图

### 提示词设计原则 | Prompt Design Principles

每个图片提示词包含:

1. **主题** (Subject): 训练内容和年龄组
2. **情境** (Context): 训练场景和目标
3. **视觉内容** (Visual Content): 具体动作和元素
4. **风格指南** (Style Guidelines): 教育性、专业性、色彩
5. **安全要求** (Safety Requirements): 正确姿势、安全设备
6. **技术规格** (Technical Specifications): 格式、构图、清晰度

**示例提示词**:
```
Professional badminton training illustration for 4-6 years old children:

Subject: Dynamic warmup games and coordination activities
Context: Fun warmup exercises for young children

Visual Content:
- Asian children (age 4-6) doing animal imitation exercises
- Rabbit jumps: child jumping with feet together, hands as bunny ears
- Crab walk: child walking sideways with hands and feet
- Penguin walk: child waddling with arms at sides
- Frog squat jumps: child in squat position jumping forward

Style Guidelines:
- Clean, educational diagram suitable for children and parents
- Bright, engaging colors (primary colors preferred)
- Simple white or light background
- Clear demonstration of each movement
- Professional children's sports illustration quality
- Cheerful and encouraging atmosphere

Safety Requirements:
- Show proper form and technique
- Fun and engaging poses
- Safe, age-appropriate movements
- No equipment needed

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- No text labels (support multilingual future)
- Centered composition
- High clarity suitable for web and print
```

---

## 积分管理 | Credit Management

### 免费积分 | Free Credits

即梦AI提供**每日免费积分**:
- 首次领取: 88积分
- 有效期: 约60天
- 每张图片: 约1-2积分

### 积分查询 | Check Credits

脚本自动显示积分信息:
```
当前积分: 88
领取免费积分: ✓ 成功
```

### 积分不足 | Low Credits

当积分不足时,脚本会:
1. 自动尝试领取免费积分
2. 提示用户充值或等待
3. 暂停生成,保护未完成任务

---

## 故障排除 | Troubleshooting

### 问题1: 模块导入失败

**错误**: `ImportError: No module named 'proxy.jimeng'`

**解决**:
1. 检查路径: `D:\study\mysite\mcp-servers\image-gen-server`
2. 确认 `proxy/jimeng.py` 文件存在
3. 更新 `IMAGE_GEN_SERVER_PATH` 变量

### 问题2: 积分不足

**错误**: `积分不足，无法生成图片`

**解决**:
1. 等待每日免费积分重置
2. 访问即梦官网充值
3. 使用备用API密钥

### 问题3: 网络超时

**错误**: `Timeout Error`

**解决**:
1. 检查网络连接
2. 增加超时时间: `timeout=60`
3. 重试生成

### 问题4: 图片下载失败

**错误**: `HTTP 403` 或 `HTTP 404`

**解决**:
1. 验证API密钥有效性
2. 检查URL有效期(通常24小时)
3. 重新生成图片

---

## 最佳实践 | Best Practices

### 批量生成建议

1. **首次测试**: 先运行 `test_single_image.py` 验证配置
2. **小批量测试**: 使用选项3生成1-3张,检查质量
3. **全量生成**: 确认无误后选择选项1全部生成
4. **定期备份**: 生成完成后备份图片文件夹

### 质量控制

1. **检查文件大小**: 正常200-400 KB
2. **视觉检查**: 确认图片内容符合预期
3. **技术检查**: 分辨率1024×1024
4. **一致性检查**: 风格与其他图片协调

### 提示词优化

1. **具体化描述**: 详细描述动作和场景
2. **年龄匹配**: 明确标注年龄组
3. **安全强调**: 突出正确姿势和安全措施
4. **文化适配**: 使用"Asian children"确保形象匹配

---

## 脚本文件说明 | Script Files

### `test_single_image.py`
- **用途**: 单张图片生成测试
- **适用场景**: 首次配置、API验证、故障排除
- **输出**: `test-warmup-demo.png` (测试图片)

### `batch_generate_images.py`
- **用途**: 批量生成所有训练图片
- **特性**: 交互式菜单、进度跟踪、错误处理
- **输出**: 所有17张训练图片 + 生成报告

### `IMAGE_GENERATION_PROMPTS.md`
- **用途**: 完整的图片提示词文档
- **内容**: 19个详细提示词
- **用途**: 参考、调整、优化提示词

---

## 生成报告 | Generation Report

生成完成后,查看报告:

```bash
cat scripts/image_generation_report.json
```

**报告示例**:
```json
{
  "total": 17,
  "success": 17,
  "failed": 0,
  "timestamp": "2025-11-10 10:30:00"
}
```

---

## 下一步 | Next Steps

完成图片生成后:

1. ✅ **验证图片**: 检查所有图片已正确生成
2. ✅ **更新文章**: 确认Markdown文件中图片路径正确
3. ✅ **测试VuePress**: `npm run docs:dev` 预览效果
4. ✅ **提交代码**: 提交图片到Git仓库
5. ✅ **部署测试**: 构建并部署到测试环境

---

## 参考资源 | References

- **即梦AI官网**: https://jimeng.jianying.com/
- **image-gen-server**: `D:\study\mysite\mcp-servers\image-gen-server`
- **提示词文档**: `docs/IMAGE_GENERATION_PROMPTS.md`
- **批量脚本**: `scripts/batch_generate_images.py`

---

**最后更新**: 2025-11-10
**维护者**: Claude Code
**项目**: 青少年羽毛球训练知识库平台
