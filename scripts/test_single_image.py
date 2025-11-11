#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Single Image Generation Test

测试即梦AI图片生成功能
"""

import os
import sys
from pathlib import Path

# 设置Windows控制台编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# 添加 image-gen-server 路径
IMAGE_GEN_SERVER_PATH = r"D:\study\mysite\mcp-servers\image-gen-server"
sys.path.insert(0, IMAGE_GEN_SERVER_PATH)

try:
    from proxy.jimeng import generate_images
    import requests
    print("✓ 即梦AI模块加载成功")
except ImportError as e:
    print(f"❌ 无法导入即梦AI模块: {e}")
    sys.exit(1)

# 配置
JIMENG_API_TOKEN = "f8fa81e1e80f59223e828d5ca2eb6c06"
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "content" / "age-groups" / "01-enlightenment-4-6" / "physical-training" / "images"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 测试提示词 - 简单版本
TEST_PROMPT = """Professional sports training illustration for young children:

A 4-6 year old Asian child doing warmup exercises.
The child is jumping like a rabbit with both feet together and hands positioned like bunny ears.
Bright, cheerful atmosphere with simple white background.
Educational sports illustration style."""

OUTPUT_FILE = OUTPUT_DIR / "test-warmup-demo.png"

def main():
    print("="*60)
    print("🎨 单图片生成测试")
    print("="*60)
    print(f"输出文件: {OUTPUT_FILE}")
    print(f"提示词: {TEST_PROMPT[:100]}...")
    print("="*60)

    try:
        print("\n🚀 正在调用即梦AI生成图片...")

        # 调用即梦API
        image_urls = generate_images(
            model="jimeng-4.0",
            prompt=TEST_PROMPT,
            width=1024,
            height=1024,
            sample_strength=0.5,
            negative_prompt="",
            refresh_token=JIMENG_API_TOKEN
        )

        if not image_urls:
            print("❌ 未能生成图片URL")
            return False

        print(f"✓ API调用成功，返回 {len(image_urls)} 个URL")

        # 下载第一张图片
        url = image_urls[0]
        print(f"\n📥 正在下载图片...")
        print(f"URL: {url[:80]}...")

        response = requests.get(url, timeout=30)

        if response.status_code == 200:
            with open(OUTPUT_FILE, 'wb') as f:
                f.write(response.content)

            file_size = os.path.getsize(OUTPUT_FILE)
            print(f"\n✅ 成功!")
            print(f"文件保存至: {OUTPUT_FILE}")
            print(f"文件大小: {file_size:,} 字节 ({file_size/1024:.1f} KB)")
            return True
        else:
            print(f"❌ 下载失败: HTTP {response.status_code}")
            return False

    except Exception as e:
        print(f"\n❌ 错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
