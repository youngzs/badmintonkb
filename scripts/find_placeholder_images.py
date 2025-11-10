#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Find Placeholder Images Script

检查文档中的图片文件，识别 placeholder 图片（文件大小 < 100KB）
"""

import os
import sys
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

def find_placeholder_images():
    """查找所有 placeholder 图片"""
    print("="*60)
    print("🔍 查找 Placeholder 图片")
    print("="*60)
    print(f"文档根目录: {DOCS_ROOT}")
    print(f"Placeholder 判断阈值: {PLACEHOLDER_THRESHOLD / 1024}KB")
    print("="*60)

    placeholder_images = []
    normal_images = []
    missing_images = []

    # 扫描所有图片文件
    for image_file in DOCS_ROOT.rglob("*.png"):
        file_size = image_file.stat().st_size
        file_size_kb = file_size / 1024

        if file_size < PLACEHOLDER_THRESHOLD:
            placeholder_images.append((image_file, file_size_kb))
            print(f"📋 Placeholder: {image_file.relative_to(DOCS_ROOT)} ({file_size_kb:.1f}KB)")
        else:
            normal_images.append((image_file, file_size_kb))

    print("\n" + "="*60)
    print("📊 统计结果")
    print("="*60)
    print(f"✅ 正常图片: {len(normal_images)}")
    print(f"📋 Placeholder 图片: {len(placeholder_images)}")
    print(f"📁 总计: {len(normal_images) + len(placeholder_images)}")
    print("="*60)

    # 保存 placeholder 列表
    if placeholder_images:
        output_file = PROJECT_ROOT / "scripts" / "placeholder_images_list.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("Placeholder 图片列表\n")
            f.write("="*60 + "\n\n")
            for img, size in placeholder_images:
                rel_path = img.relative_to(DOCS_ROOT)
                f.write(f"{rel_path} ({size:.1f}KB)\n")

        print(f"\n📝 Placeholder 列表已保存到: {output_file}")

    return placeholder_images, normal_images

if __name__ == "__main__":
    try:
        placeholder_images, normal_images = find_placeholder_images()

        if placeholder_images:
            print(f"\n⚠️  发现 {len(placeholder_images)} 个 placeholder 图片需要生成！")
        else:
            print("\n✅ 所有图片都已生成，无需处理")

    except Exception as e:
        print(f"\n❌ 错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
