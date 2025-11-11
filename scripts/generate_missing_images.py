#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Missing Images Script

批量生成所有 placeholder 图片
"""

import os
import sys
import json
import time
from pathlib import Path

# 设置Windows控制台编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
DOCS_ROOT = PROJECT_ROOT / "website" / "docs"

# Placeholder 判断阈值（字节）
PLACEHOLDER_THRESHOLD = 100 * 1024  # 100KB

def extract_image_context(md_file_path, image_filename):
    """从 Markdown 文件中提取图片的上下文信息"""
    try:
        with open(md_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找图片引用
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if image_filename in line:
                # 获取前后文本作为上下文
                context_start = max(0, i - 5)
                context_end = min(len(lines), i + 5)
                context = '\n'.join(lines[context_start:context_end])
                return context
    except:
        pass
    return ""

def generate_prompt_for_image(image_path):
    """为图片生成 prompt"""
    image_name = image_path.stem
    age_group = ""
    category = ""

    # 解析路径获取年龄组和类别
    parts = image_path.parts
    if "01-enlightenment-4-6" in parts:
        age_group = "4-6 years old"
    elif "02-foundation-7-9" in parts:
        age_group = "7-9 years old"
    elif "03-development-10-12" in parts:
        age_group = "10-12 years old"
    elif "04-specialization-13-15" in parts:
        age_group = "13-15 years old"

    if "physical-training" in parts:
        category = "physical training"
    elif "technical-training" in parts:
        category = "technical training"
    elif "tactical-training" in parts:
        category = "tactical training"
    elif "mental-training" in parts:
        category = "mental training"
    elif "nutrition" in parts:
        category = "nutrition"
    elif "technical-mechanics" in parts:
        category = "technical mechanics"

    # 基础 prompt 模板
    prompt = f"""Professional badminton training illustration for {age_group} children:

Subject: {image_name.replace('-', ' ').replace('_', ' ')}
Context: {category}

Visual Content:
- Asian child (age {age_group}) demonstrating {category} exercise
- Clear, educational demonstration
- Safe, age-appropriate activity
- Professional sports illustration

Style Guidelines:
- Clean, educational diagram
- Bright, engaging colors
- Simple background
- Professional quality
- Child-friendly atmosphere

Safety Requirements:
- Proper technique emphasized
- Age-appropriate movements
- Safe environment visible
- No dangerous elements

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- High clarity suitable for web
- Centered composition"""

    return prompt

def find_and_generate_placeholders():
    """查找所有 placeholder 并生成图片"""
    print("="*60)
    print("🎨 批量生成 Placeholder 图片")
    print("="*60)

    placeholder_images = []

    # 查找所有 placeholder 图片
    for image_file in DOCS_ROOT.rglob("*.png"):
        file_size = image_file.stat().st_size
        if file_size < PLACEHOLDER_THRESHOLD:
            placeholder_images.append(image_file)

    print(f"发现 {len(placeholder_images)} 个 placeholder 图片")
    print()

    # 生成任务列表
    tasks = []
    for img_path in placeholder_images:
        prompt = generate_prompt_for_image(img_path)
        task = {
            "name": img_path.stem,
            "output_path": str(img_path),
            "prompt": prompt
        }
        tasks.append(task)
        print(f"✓ {img_path.relative_to(DOCS_ROOT)}")

    # 保存任务列表
    tasks_file = PROJECT_ROOT / "scripts" / "image_generation_tasks.json"
    with open(tasks_file, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)

    print(f"\n📝 任务列表已保存到: {tasks_file}")
    print(f"\n⚠️  请使用 image-gen-server MCP 或手动生成这些图片")
    print(f"   任务文件: {tasks_file}")

    return tasks

if __name__ == "__main__":
    try:
        tasks = find_and_generate_placeholders()
        print(f"\n✅ 已生成 {len(tasks)} 个图片生成任务")
    except Exception as e:
        print(f"\n❌ 错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
