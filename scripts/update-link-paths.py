#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新文档中的链接路径，将引用映射到实际存在的文件
"""

import re
from pathlib import Path

# 链接映射表：旧路径 -> 新路径
LINK_MAPPINGS = {
    # 心理学相关
    '../../theory/psychology/youth-sports-psychology.md': '../../theory/psychology/sports-psychology-basics.md',
    '../../theory/psychology/youth-psychology.md': '../../theory/psychology/sports-psychology-basics.md',
    '../../theory/psychology/competition-psychology.md': '../../theory/psychology/mental-training-methods.md',

    # 技术理论相关
    '../../theory/technique-theory/technique-fundamentals.md': '../../theory/technical-mechanics/badminton-technique-principles.md',

    # 体能训练相关
    '../../theory/physical-training-science/age-specific-training.md': '../../theory/physical-training-science/youth-fitness-fundamentals.md',
}

def update_file_links(filepath):
    """更新单个文件中的链接"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        updated_count = 0

        # 替换所有映射的链接
        for old_link, new_link in LINK_MAPPINGS.items():
            if old_link in content:
                content = content.replace(old_link, new_link)
                updated_count += 1
                print(f"  更新: {old_link}")
                print(f"  -> {new_link}")

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ 已更新 {updated_count} 个链接")
            return True
        else:
            return False

    except Exception as e:
        print(f"✗ 错误: {e}")
        return False

def main():
    """主函数"""
    docs_dir = Path(__file__).parent.parent / 'website' / 'docs'

    if not docs_dir.exists():
        print(f"错误: 找不到docs目录: {docs_dir}")
        return

    # 找到所有.md文件
    md_files = list(docs_dir.rglob('*.md'))

    print(f"检查 {len(md_files)} 个Markdown文件...\n")

    updated_count = 0
    for md_file in md_files:
        rel_path = md_file.relative_to(docs_dir)
        print(f"\n处理: {rel_path}")
        if update_file_links(md_file):
            updated_count += 1

    print(f"\n完成! 共更新 {updated_count} 个文件")

if __name__ == '__main__':
    main()
