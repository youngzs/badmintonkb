#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查并修复Markdown文件中的无效链接
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def extract_links(content, filepath):
    """从内容中提取所有Markdown链接"""
    # 匹配 [text](link) 格式
    pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
    links = []
    for match in re.finditer(pattern, content):
        text = match.group(1)
        link = match.group(2)
        # 只关心相对路径的.md文件链接
        if link.endswith('.md') and not link.startswith('http'):
            links.append((text, link, match.start()))
    return links

def resolve_link(source_file, link):
    """解析相对链接，返回绝对路径"""
    source_dir = source_file.parent
    # 移除锚点
    link_path = link.split('#')[0]
    target = (source_dir / link_path).resolve()
    return target

def check_file(filepath, docs_dir):
    """检查单个文件的链接"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    links = extract_links(content, filepath)
    broken_links = []

    for text, link, pos in links:
        target = resolve_link(filepath, link)
        if not target.exists():
            broken_links.append({
                'text': text,
                'link': link,
                'position': pos,
                'target': str(target)
            })

    return broken_links

def main():
    """主函数"""
    docs_dir = Path(__file__).parent.parent / 'website' / 'docs'

    if not docs_dir.exists():
        print(f"错误: 找不到docs目录: {docs_dir}")
        return

    # 找到所有.md文件
    md_files = list(docs_dir.rglob('*.md'))

    print(f"检查 {len(md_files)} 个Markdown文件的链接...\n")

    all_broken = defaultdict(list)

    for md_file in md_files:
        broken = check_file(md_file, docs_dir)
        if broken:
            rel_path = md_file.relative_to(docs_dir)
            all_broken[str(rel_path)] = broken

    if not all_broken:
        print("✓ 没有发现无效链接!")
        return

    print(f"发现 {len(all_broken)} 个文件包含无效链接:\n")

    for file, links in sorted(all_broken.items()):
        print(f"\n{file}:")
        for link in links:
            print(f"  - [{link['text']}]({link['link']})")
            print(f"    目标文件不存在: {link['target']}")

    print(f"\n总计 {sum(len(links) for links in all_broken.values())} 个无效链接")

if __name__ == '__main__':
    main()
