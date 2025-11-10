#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch Image Generation Script

使用 image-gen-server MCP 批量生成训练图片
Batch generate training illustrations using image-gen-server MCP
"""

import os
import sys
import json
import time
from pathlib import Path
import asyncio

# 设置Windows控制台编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# 添加 image-gen-server 路径到 Python path
IMAGE_GEN_SERVER_PATH = r"D:\study\mysite\mcp-servers\image-gen-server"
sys.path.insert(0, IMAGE_GEN_SERVER_PATH)

try:
    # 导入即梦图像生成模块
    from proxy.jimeng import generate_images
    import requests
    JIMENG_AVAILABLE = True
    print("✓ 即梦AI模块加载成功")
except ImportError as e:
    print(f"⚠️  无法导入即梦AI模块: {e}")
    print(f"请确保 {IMAGE_GEN_SERVER_PATH} 路径正确")
    print("将使用手动模式")
    JIMENG_AVAILABLE = False

# 即梦API配置 (从server.py复制)
JIMENG_API_TOKEN = "f8fa81e1e80f59223e828d5ca2eb6c06"  # 您的session_id

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_ROOT = PROJECT_ROOT / "content"

# 图片生成任务列表
IMAGE_TASKS = [
    # ========================================
    # 文章1: 4-6岁协调性训练基础
    # ========================================
    {
        "name": "热身游戏",
        "filename": "warmup-games-coordination-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/warmup-games-coordination-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

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
- High clarity suitable for web and print""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "手眼协调-接球",
        "filename": "hand-eye-coordination-catch-ball-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/hand-eye-coordination-catch-ball-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Hand-eye coordination - ball catching exercise
Context: Teaching children to track and catch moving objects

Visual Content:
- Asian child (age 4-6) in ready position
- Soft ball in mid-air above child
- Child's hands positioned to catch the ball at chest level
- Focus on eyes tracking the ball
- Proper stance: feet shoulder-width apart, knees slightly bent

Movement sequence:
1. Toss ball upward
2. Track ball with eyes
3. Position hands to catch
4. Secure ball at chest

Style Guidelines:
- Clean, educational sports diagram
- Bright colors (colorful soft ball, child in sporty clothing)
- Simple background
- Clear motion lines showing ball trajectory
- Professional illustration quality

Safety Requirements:
- Soft ball clearly visible
- Safe catching technique
- Balanced posture
- Appropriate equipment for age group

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Motion arrows/lines to show ball path
- Centered composition
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "平衡木行走",
        "filename": "balance-beam-walking-coordination-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/balance-beam-walking-coordination-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Balance beam walking exercise for coordination
Context: Child walking on low balance beam to develop balance and coordination

Visual Content:
- Asian child (age 4-6) walking on a low balance beam (10-15cm high)
- Arms extended to sides for balance
- One foot in front of the other on the beam
- Focused expression, looking ahead
- Safe environment with mats visible

Balance Beam Details:
- Low height (10-15cm from ground)
- Width: 10-15cm
- Natural wood or bright color
- Safety mats on sides

Style Guidelines:
- Educational sports illustration
- Encouraging, safe atmosphere
- Clear demonstration of proper technique
- Professional quality
- Bright, child-friendly colors

Safety Requirements:
- Low beam height emphasized
- Protective mats visible
- Proper balance posture
- No dangerous elements

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Side view perspective
- Clear focal point on child
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "跳格子节奏",
        "filename": "hopscotch-rhythm-coordination-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/hopscotch-rhythm-coordination-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Hopscotch rhythm and coordination game
Context: Traditional hopscotch game for developing rhythm, balance, and coordination

Visual Content:
- Asian child (age 4-6) hopping on hopscotch grid
- Colorful hopscotch pattern on ground (numbered 1-10)
- Child on one foot, other leg raised
- Arms out for balance
- Cheerful expression

Hopscotch Grid:
- Traditional layout with single and double squares
- Bright colors (different color for each square)
- Numbers 1-10 visible
- Grid size: approximately 30cm x 30cm per square

Movement Demonstration:
- Single-foot squares: one foot
- Double squares: both feet
- Clear hopping motion

Style Guidelines:
- Fun, energetic illustration
- Bright, rainbow colors for grid
- Educational sports diagram
- Child-friendly and engaging
- Professional quality

Safety Requirements:
- Flat, safe surface
- Clear grid boundaries
- Age-appropriate activity
- Proper hopping technique

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Top-down or 3/4 view
- Vibrant colors
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "放松拉伸",
        "filename": "cooldown-stretching-relaxation-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/cooldown-stretching-relaxation-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Cool-down stretching and relaxation exercises
Context: Gentle stretches after training to prevent muscle soreness

Visual Content:
- Asian child (age 4-6) performing gentle stretches
- Multiple stretch positions shown:
  1. Standing quad stretch (holding foot behind)
  2. Calf stretch (lunge position)
  3. Shoulder rolls
  4. Deep breathing pose

Atmosphere:
- Calm, peaceful setting
- Child with relaxed, content expression
- Gentle movements emphasized
- Cool-down mat or soft surface

Style Guidelines:
- Soothing, educational illustration
- Softer colors (pastels preferred for relaxation mood)
- Clear demonstration of each stretch
- Professional quality
- Calm and peaceful atmosphere

Safety Requirements:
- Gentle stretching positions
- Age-appropriate flexibility
- No over-stretching
- Safe, controlled movements

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Multi-panel layout OR single representative pose
- Calming color palette
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },

    # ========================================
    # 文章2: 4-6岁平衡能力训练
    # ========================================
    {
        "name": "平衡热身",
        "filename": "balance-warmup-activities-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/balance-warmup-activities-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Balance warmup activities
Context: Preparatory exercises to activate balance and body awareness

Visual Content:
- Asian child (age 4-6) doing balance warmup exercises
- "Small tree swaying" exercise: child swaying side to side, feet planted
- Standing rotation exercise: arms extended, body rotating
- Simple, clear movements

Key Elements:
- Stable stance with feet together
- Gentle swaying motion indicated by motion lines
- Focused, calm expression
- Safe indoor or outdoor environment

Style Guidelines:
- Clean, educational sports diagram
- Calm, focused atmosphere
- Soft, encouraging colors
- Professional illustration quality

Safety Requirements:
- Stable base position
- Controlled movements
- Age-appropriate exercises
- Safe environment

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Clear movement indicators (arrows/lines)
- Centered composition
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "单脚站立",
        "filename": "single-leg-stand-balance-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/single-leg-stand-balance-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Single-leg standing balance exercise
Context: Progressive static balance training for young children

Visual Content:
- Asian child (age 4-6) performing single-leg stand
- Progression shown:
  Level 1: Both feet together
  Level 2: Single leg stand, eyes open
  Level 3: Single leg stand, eyes closed

Technique Details:
- Supporting leg slightly bent
- Raised leg knee bent, foot off ground
- Arms extended to sides for balance
- Focused expression
- Stable, balanced posture

Style Guidelines:
- Educational, progressive demonstration
- Clear, step-by-step visual
- Encouraging atmosphere
- Professional sports training quality

Safety Requirements:
- Proper balance technique
- Safe environment
- Age-appropriate challenge levels
- Stable surface visible

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Progressive levels clearly shown
- Clean background
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "平衡木系列",
        "filename": "balance-beam-walking-series-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/balance-beam-walking-series-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Balance beam walking progression series
Context: Progressive dynamic balance training on balance beam

Visual Content - Progression Sequence:
1. Ground line walking (floor tape)
2. Low balance beam forward walking
3. Sideways sliding steps on beam
4. Backward walking on beam

Each Stage Shows:
- Asian child (age 4-6) on appropriate difficulty level
- Proper technique for that stage
- Safety elements (mats, low height)
- Clear progression difficulty

Balance Beam Specifications:
- Width: 10-15cm
- Height: 10-20cm for elevated stages
- Soft mats on sides
- Bright, visible color

Style Guidelines:
- Educational training sequence
- Clear progression from easy to hard
- Professional sports illustration
- Encouraging, achievable challenges

Safety Requirements:
- Progressive difficulty clearly shown
- Safety mats always visible
- Proper technique emphasized
- Age-appropriate heights

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Multiple stages shown
- Clear visual flow
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "独木桥冒险",
        "filename": "balance-bridge-adventure-game-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/balance-bridge-adventure-game-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Balance bridge adventure game
Context: Fun, story-based balance training activity

Visual Content:
- Imaginative "adventure" scene with balance beam as "magic bridge"
- Asian child (age 4-6) crossing the "bridge"
- Playful elements: soft toys as "rescued animals"
- Safe obstacles on beam (soft cushions, colorful markers)
- Adventure theme: forest or magical setting (simplified)

Game Elements:
- Start point with "brave warrior" pose
- Balance beam as adventurous path
- Soft obstacles to cross ("magic stones")
- End point with reward (toy or badge)

Style Guidelines:
- Fun, imaginative illustration
- Story-based training concept
- Engaging for young children
- Professional quality with playful elements
- Bright, adventure-themed colors

Safety Requirements:
- All safety elements still visible
- Soft materials emphasized
- Low, safe beam height
- Protected environment

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Engaging, story-rich composition
- Child-friendly adventure theme
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "本体感觉放松",
        "filename": "cooldown-proprioception-4-6.png",
        "output_path": CONTENT_ROOT / "age-groups/01-enlightenment-4-6/physical-training/images/cooldown-proprioception-4-6.png",
        "prompt": """Professional badminton training illustration for 4-6 years old children:

Subject: Cool-down with proprioception training
Context: Body awareness and relaxation exercises after balance training

Visual Content:
- Asian child (age 4-6) doing gentle cool-down exercises
- Stretching with balance elements:
  - Single-leg stretch while standing
  - Calf stretch in lunge position
  - Body awareness (touching body parts)
- Deep breathing in balanced pose

Atmosphere:
- Calm, relaxed environment
- Peaceful expression
- Gentle movements
- Cool-down mat or soft surface

Style Guidelines:
- Soothing, calming illustration
- Soft, relaxing colors
- Educational and gentle
- Professional quality
- Peaceful atmosphere

Safety Requirements:
- Gentle, safe stretches
- Age-appropriate poses
- Calm, controlled movements
- Safe environment

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Calming color palette
- Clear demonstration
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },

    # ========================================
    # 文章3: 7-9岁速度与敏捷性训练
    # ========================================
    {
        "name": "动态热身",
        "filename": "dynamic-warmup-speed-agility-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/dynamic-warmup-speed-agility-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Dynamic warmup for speed and agility training
Context: Active preparation exercises for high-intensity speed work

Visual Content:
- Asian child (age 7-9) performing dynamic warmup movements
- Exercises shown:
  - High knees march/run
  - Butt kicks (heel to glutes)
  - Side shuffle/crossover steps
  - A-skip running drill

Movement Quality:
- Energetic, dynamic movements
- Proper technique emphasized
- Athletic posture
- Warm-up intensity (controlled, not max effort)

Style Guidelines:
- Action-oriented sports illustration
- Dynamic energy
- Clear technique demonstration
- Professional training quality
- Bright, energetic colors

Safety Requirements:
- Proper warmup technique
- Controlled movements
- Athletic readiness
- Safe training environment

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Motion lines showing movement
- Action-packed composition
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "反应速度训练",
        "filename": "reaction-speed-drills-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/reaction-speed-drills-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Reaction speed training drills
Context: Signal-based sprint starts to develop quick reactions

Visual Content:
- Asian child (age 7-9) in ready position, explosive start
- Coach/instructor with whistle or visual signal (colored card)
- Child reacting and sprinting
- Sprint markers showing 10-meter distance

Training Elements:
- Starting positions: standing, crouching
- Signal sources: whistle, hand gesture, colored cards
- Explosive first step
- Acceleration phase shown

Style Guidelines:
- High-energy sports training illustration
- Emphasis on speed and reaction
- Clear cause-and-effect (signal → action)
- Professional athletic training quality

Safety Requirements:
- Proper sprint technique
- Safe starting positions
- Clear training space
- Appropriate intensity for age

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Dynamic action sequence
- Speed emphasized
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "加速度训练",
        "filename": "acceleration-training-drills-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/acceleration-training-drills-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Acceleration training for explosive speed development
Context: Sprint training focusing on 0-15 meter acceleration zone

Visual Content:
- Asian child (age 7-9) in acceleration phase of sprint
- Body position: forward lean (45 degrees)
- Powerful leg drive, arms pumping
- Sprint zones marked: 0-5m, 5-10m, 10-15m

Technique Details:
- Forward body lean
- Powerful ground contact
- Arm drive (90° front, 120° back)
- Small steps high frequency (first 5m)
- Progressive to longer strides

Style Guidelines:
- Dynamic, explosive illustration
- Speed and power emphasized
- Technical demonstration
- Professional sprint training quality

Safety Requirements:
- Proper sprint mechanics
- Safe acceleration technique
- Adequate deceleration zone
- Training surface quality

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Side view showing technique
- Speed lines indicating motion
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "敏捷性方向转换",
        "filename": "agility-direction-change-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/agility-direction-change-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Agility and direction change drills - T-test
Context: T-test drill for developing quick direction changes

Visual Content:
- Asian child (age 7-9) performing T-test agility drill
- Course layout visible with central point and left/right points
- Multiple positions showing movement sequence
- Low center of gravity during direction changes

Technique Elements:
- Low center of gravity during direction changes
- Lateral shuffle technique
- Quick pivot movements
- Athletic ready position

Style Guidelines:
- Action sequence illustration
- Clear movement path
- Professional agility training
- Dynamic and technical

Safety Requirements:
- Proper change of direction technique
- Low stance for stability
- Controlled movements
- Safe training surface

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Top-down or 3/4 view showing course
- Movement arrows
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "四角折返跑",
        "filename": "four-corner-shuttle-run-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/four-corner-shuttle-run-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Four-corner shuttle run drill
Context: Multi-directional agility training in square pattern

Visual Content:
- 5m x 5m square marked on ground
- Asian child (age 7-9) running between corners
- Movement pattern shown with arrows
- Child touching ground/markers at each corner
- Multiple positions showing sequence

Course Layout:
- Four cones marking corners
- 5-meter sides
- Clear markers at each point
- Visible touch points

Style Guidelines:
- Clear course diagram
- Action sequence
- Professional agility training
- Technical and dynamic

Safety Requirements:
- Proper turning technique
- Safe ground contact
- Controlled speed
- Adequate space

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Aerial/top view with 3D elements
- Movement path clearly marked
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "羽毛球专项步法",
        "filename": "badminton-footwork-patterns-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/badminton-footwork-patterns-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Badminton-specific footwork patterns
Context: Six-point movement drill for court coverage

Visual Content:
- Badminton court outline (simplified)
- Asian child (age 7-9) in athletic stance
- Six movement points marked around center
- Movement patterns shown with footprints/arrows
- Center recovery position emphasized

Footwork Details:
- Proper step patterns for each direction
- Athletic ready position at center
- Quick movement to positions
- Efficient recovery

Style Guidelines:
- Sport-specific technical illustration
- Clear movement patterns
- Professional badminton training
- Action-oriented

Safety Requirements:
- Proper footwork technique
- Balanced movements
- Court awareness
- Safe training intensity

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Court view (aerial or 3/4)
- Movement arrows/footprints
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
    {
        "name": "拉伸放松",
        "filename": "cooldown-stretching-speed-training-7-9.png",
        "output_path": CONTENT_ROOT / "age-groups/02-foundation-7-9/physical-training/images/cooldown-stretching-speed-training-7-9.png",
        "prompt": """Professional badminton training illustration for 7-9 years old children:

Subject: Cool-down stretching after speed training
Context: Static stretching to prevent muscle soreness and promote recovery

Visual Content:
- Asian child (age 7-9) performing post-speed training stretches
- Key stretches:
  1. Hamstring stretch (seated forward fold)
  2. Quadriceps stretch (standing, holding foot)
  3. Calf stretch (lunge position)
  4. Hip stretch (butterfly position)
- Calm, focused expression
- Proper stretch form

Stretching Details:
- Hold times indicated (20-30 seconds)
- Proper alignment
- Relaxed breathing
- Gentle, controlled stretches

Style Guidelines:
- Calm, educational illustration
- Soothing colors
- Clear technique demonstration
- Professional recovery training

Safety Requirements:
- Gentle stretching (no bouncing)
- Age-appropriate flexibility
- Proper stretch technique
- Relaxed muscles

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- Clear demonstration of each stretch
- Peaceful atmosphere
- High clarity""",
        "model": "dall-e-3",
        "size": "1024x1024"
    },
]


def ensure_directory(filepath):
    """确保目录存在"""
    directory = os.path.dirname(filepath)
    os.makedirs(directory, exist_ok=True)
    print(f"✓ 目录已确保: {directory}")


def generate_single_image(task, index, total, auto_mode=False):
    """生成单张图片

    Args:
        task: 图片生成任务字典
        index: 当前任务索引
        total: 总任务数
        auto_mode: 是否自动模式 (不需要手动确认)
    """
    print(f"\n{'='*60}")
    print(f"[{index}/{total}] 生成图片: {task['name']}")
    print(f"{'='*60}")
    print(f"文件名: {task['filename']}")
    print(f"输出路径: {task['output_path']}")
    print(f"提示词长度: {len(task['prompt'])} 字符")

    # 确保输出目录存在
    ensure_directory(str(task['output_path']))

    # 检查文件是否已存在
    if os.path.exists(task['output_path']):
        if not auto_mode:
            response = input(f"⚠️  文件已存在，是否覆盖? (y/n): ")
            if response.lower() != 'y':
                print("⏭️  跳过此图片")
                return False
        else:
            print("⚠️  文件已存在，跳过...")
            return False

    try:
        if JIMENG_AVAILABLE:
            # 使用即梦AI生成图片
            print("🎨 正在使用即梦AI生成图片...")
            print(f"提示词预览: {task['prompt'][:100]}...")

            # 调用即梦API生成图片
            image_urls = generate_images(
                model="jimeng-4.0",
                prompt=task['prompt'],
                width=1024,
                height=1024,
                sample_strength=0.5,
                negative_prompt="",
                refresh_token=JIMENG_API_TOKEN
            )

            if not image_urls:
                print("❌ 未能生成图片URL")
                return False

            print(f"✓ 生成成功，共 {len(image_urls)} 张图片")

            # 下载第一张图片
            url = image_urls[0]
            print(f"📥 正在下载: {url[:50]}...")

            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                with open(task['output_path'], 'wb') as f:
                    f.write(response.content)
                print(f"✅ 图片已保存: {task['output_path']}")
                return True
            else:
                print(f"❌ 下载失败: HTTP {response.status_code}")
                return False

        else:
            # 手动模式
            print("\n⚠️  即梦AI模块未加载，请手动生成图片")
            print("提示词:")
            print("-" * 60)
            print(task['prompt'])
            print("-" * 60)
            print(f"\n保存到: {task['output_path']}")

            response = input("\n生成完成后按 Enter 继续，或输入 's' 跳过: ")
            if response.lower() == 's':
                return False

            return True

    except Exception as e:
        print(f"❌ 生成失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主函数"""
    print("="*60)
    print("🎨 批量图片生成工具")
    print("="*60)
    print(f"项目根目录: {PROJECT_ROOT}")
    print(f"内容根目录: {CONTENT_ROOT}")
    print(f"总计任务数: {len(IMAGE_TASKS)}")
    print("="*60)

    # 询问生成方式
    print("\n选择生成方式:")
    print("1. 全部生成 (推荐)")
    print("2. 逐个确认生成")
    print("3. 仅生成指定范围 (如: 1-5)")

    choice = input("\n请选择 (1/2/3): ").strip()

    tasks_to_process = []

    if choice == '1':
        tasks_to_process = IMAGE_TASKS
    elif choice == '2':
        tasks_to_process = IMAGE_TASKS
    elif choice == '3':
        range_input = input("请输入范围 (如: 1-5 或 1,3,5): ").strip()
        if '-' in range_input:
            start, end = map(int, range_input.split('-'))
            tasks_to_process = IMAGE_TASKS[start-1:end]
        else:
            indices = [int(x.strip())-1 for x in range_input.split(',')]
            tasks_to_process = [IMAGE_TASKS[i] for i in indices]
    else:
        print("无效选择，退出")
        return

    print(f"\n将生成 {len(tasks_to_process)} 张图片")
    input("按 Enter 开始...")

    # 生成图片
    success_count = 0
    failed_count = 0

    for i, task in enumerate(tasks_to_process, 1):
        auto_mode = (choice == '1')
        result = generate_single_image(task, i, len(tasks_to_process), auto_mode=auto_mode)

        if result:
            success_count += 1
        else:
            failed_count += 1

        # 添加延迟避免API限流
        if i < len(tasks_to_process) and result:
            if choice == '1':
                print(f"⏱️  等待3秒后继续...")
                time.sleep(3)  # 全自动模式延迟3秒避免API限流

    # 总结
    print("\n" + "="*60)
    print("📊 生成完成！")
    print("="*60)
    print(f"✓ 成功: {success_count}")
    print(f"✗ 失败/跳过: {failed_count}")
    print(f"总计: {len(tasks_to_process)}")
    print("="*60)

    # 生成报告
    report_path = PROJECT_ROOT / "scripts" / "image_generation_report.json"
    report = {
        "total": len(tasks_to_process),
        "success": success_count,
        "failed": failed_count,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n报告已保存: {report_path}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断，退出程序")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ 程序错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
