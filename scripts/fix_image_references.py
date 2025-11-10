#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove GENERATE: prefix from image references in markdown files
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_ROOT = PROJECT_ROOT / "docs" / "content"

def fix_image_references(file_path: Path):
    """Remove GENERATE: prefix from image references in a markdown file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace GENERATE: prefix in image paths
    pattern = r'!\[([^\]]*)\]\(\.\/images\/GENERATE:([^)]+)\)'
    replacement = r'![\1](./images/\2)'

    new_content = re.sub(pattern, replacement, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    print("="*60)
    print("Fixing Image References")
    print("="*60)

    fixed_count = 0

    for md_file in CONTENT_ROOT.rglob("*.md"):
        if fix_image_references(md_file):
            print(f"Fixed: {md_file.relative_to(PROJECT_ROOT)}")
            fixed_count += 1

    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} markdown files")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
