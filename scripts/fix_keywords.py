#!/usr/bin/env python3
"""
Fix keywords field in markdown frontmatter from string to array format for Docusaurus
"""

import os
import re
from pathlib import Path

def fix_keywords_in_file(file_path):
    """Fix keywords field in a single markdown file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has frontmatter
    if not content.startswith('---'):
        return False

    # Split frontmatter and content
    parts = content.split('---', 2)
    if len(parts) < 3:
        return False

    frontmatter = parts[1]
    markdown_content = parts[2]

    # Check if keywords field exists and is a string
    keywords_match = re.search(r'^keywords:\s*(.+)$', frontmatter, re.MULTILINE)
    if not keywords_match:
        return False

    keywords_value = keywords_match.group(1).strip()

    # Check if already an array (starts with [)
    if keywords_value.startswith('['):
        return False

    # Convert comma-separated string to array
    keywords_list = [k.strip() for k in keywords_value.split(',')]
    keywords_array = '[' + ', '.join(f'"{k}"' for k in keywords_list) + ']'

    # Replace in frontmatter
    new_frontmatter = re.sub(
        r'^keywords:\s*.+$',
        f'keywords: {keywords_array}',
        frontmatter,
        flags=re.MULTILINE
    )

    # Write back to file
    new_content = f'---{new_frontmatter}---{markdown_content}'
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    """Process all markdown files in website/docs"""
    docs_dir = Path(__file__).parent.parent / 'website' / 'docs'

    if not docs_dir.exists():
        print(f"Directory not found: {docs_dir}")
        return

    fixed_count = 0
    total_count = 0

    for md_file in docs_dir.rglob('*.md'):
        total_count += 1
        try:
            if fix_keywords_in_file(md_file):
                print(f"[OK] Fixed: {md_file.relative_to(docs_dir)}")
                fixed_count += 1
        except Exception as e:
            print(f"[ERROR] Error processing {md_file.relative_to(docs_dir)}: {e}")

    print(f"\nProcessed {total_count} files, fixed {fixed_count} files")

if __name__ == '__main__':
    main()
