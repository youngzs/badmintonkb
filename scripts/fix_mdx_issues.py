#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复MDX编译错误
"""

import os
import re
from pathlib import Path

def fix_br_tags_in_tables(content):
    """
    修复表格中的<br/>标签，将其替换为换行符或其他格式
    """
    # 在表格单元格中，将 <br/> 替换为 <br /> (添加空格)
    # 或者使用 HTML 实体
    content = re.sub(r'<br/>', r'<br />', content)
    return content

def fix_numbered_lists_with_tags(content):
    """
    修复有序列表中包含HTML标签的问题
    在列表项后换行再添加内容
    """
    lines = content.split('\n')
    fixed_lines = []
    in_list = False

    for i, line in enumerate(lines):
        # 检测有序列表
        if re.match(r'^\d+\.\s+\*\*', line):
            in_list = True
            # 将列表项中的内容处理一下
            # 例如: 1. **准备阶段**（10分钟）
            fixed_lines.append(line)
        elif in_list and line.strip().startswith('- '):
            # 列表项的子项
            fixed_lines.append(line)
        elif in_list and not line.strip():
            # 空行，列表结束
            in_list = False
            fixed_lines.append(line)
        else:
            fixed_lines.append(line)

    return '\n'.join(fixed_lines)

def fix_file(filepath):
    """修复单个文件"""
    print(f"处理文件: {filepath}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 修复<br/>标签
        content = fix_br_tags_in_tables(content)

        # 修复有序列表
        content = fix_numbered_lists_with_tags(content)

        # 只有内容改变时才写入
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
    # 获取docs目录
    docs_dir = Path(__file__).parent.parent / 'website' / 'docs'

    if not docs_dir.exists():
        print(f"错误: 找不到docs目录: {docs_dir}")
        return

    # 找到所有.md文件
    md_files = list(docs_dir.rglob('*.md'))

    print(f"找到 {len(md_files)} 个Markdown文件\n")

    fixed_count = 0
    for md_file in md_files:
        if fix_file(md_file):
            fixed_count += 1

    print(f"\n完成! 共修复 {fixed_count} 个文件")

if __name__ == '__main__':
    main()
