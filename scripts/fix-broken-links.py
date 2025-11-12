#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复Markdown文件中的无效链接
"""

import os
import re
from pathlib import Path

# 需要删除的无效链接
LINKS_TO_REMOVE = [
    '../../theory/physical-training-science/vestibular-development.md',
    '../../theory/physical-training-science/proprioception-training.md',
    '../../guidance/parent-handbook/balance-training-support.md',
    '../../theory/injury-prevention/preschool-injury-prevention.md',
    '../../guidance/parent-handbook/cultivating-sports-interest.md',
    '../../guidance/coach-training/communication-with-preschoolers.md',
    '../technical-fundamentals/footwork-basics.md',
    './reaction-training-advanced.md',
    '../../theory/physical-training-science/youth-strength-training.md',
    '../../theory/injury-prevention/lower-body-injury-prevention.md',
    '../../theory/technique-theory/youth-training-syllabus.md',
    '../../theory/psychology/youth-sports-psychology.md',
    '../../theory/injury-prevention/home-injury-care.md',
    '../../theory/physical-training-science/age-specific-training.md',
    '../../theory/psychology/youth-psychology.md',
    '../../theory/psychology/competition-psychology.md',
    '../templates/mental-training-plan.md',
    '../../theory/technique-theory/technique-fundamentals.md',
    '../../guidance/coach-training/goal-setting-guide.md',
]

def fix_file(filepath):
    """修复单个文件"""
    print(f"处理: {filepath.name}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 移除无效链接的整行
        for link in LINKS_TO_REMOVE:
            # 匹配包含该链接的整行（列表项）
            pattern = rf'^- \[[^\]]+\]\({re.escape(link)}[^\)]*\)\s*$'
            content = re.sub(pattern, '', content, flags=re.MULTILINE)

        # 清理多余的空行
        content = re.sub(r'\n{3,}', '\n\n', content)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ 已修复")
            return True
        else:
            print(f"  - 无需修复")
            return False

    except Exception as e:
        print(f"  ✗ 错误: {e}")
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

    fixed_count = 0
    for md_file in md_files:
        if fix_file(md_file):
            fixed_count += 1

    print(f"\n完成! 共修复 {fixed_count} 个文件")

if __name__ == '__main__':
    main()
