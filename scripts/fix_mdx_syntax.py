#!/usr/bin/env python3
"""
Fix MDX syntax issues in markdown files
- Replace < and > with &lt; and &gt; when they appear with numbers or units
"""

import os
import re
from pathlib import Path

def fix_mdx_syntax(content):
    """Fix MDX syntax issues in content"""

    # Add space before < to prevent MDX parsing
    # Pattern 1: < followed by number in any context
    content = re.sub(r'(<)(\d+)', r' \1\2', content)

    # Pattern 2: > followed by number
    content = re.sub(r'(>)(\d+)', r'\1 \2', content)

    # Also handle &lt; and &gt; HTML entities
    content = re.sub(r'&lt;', r' <', content)
    content = re.sub(r'&gt;', r'> ', content)

    return content

def process_file(file_path):
    """Process a single markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Fix MDX syntax
        fixed_content = fix_mdx_syntax(original_content)

        # Only write if content changed
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False

    except Exception as e:
        print(f"[ERROR] Error processing {file_path}: {e}")
        return False

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
        if process_file(md_file):
            print(f"[OK] Fixed: {md_file.relative_to(docs_dir)}")
            fixed_count += 1

    print(f"\nProcessed {total_count} files, fixed {fixed_count} files")

if __name__ == '__main__':
    main()
