#!/usr/bin/env python3
"""Remove English text from markdown headers in documentation files."""

import os
import re
from pathlib import Path

# Define the root directory
DOCS_DIR = Path("website/docs")

# Header translations - remove English part after " | "
def clean_header(line):
    """Remove English text after ' | ' in headers."""
    if re.match(r'^#+\s+.*\|', line):
        # Split by ' | ' and keep only Chinese part
        parts = line.split(' | ')
        if len(parts) >= 2:
            # Keep the Chinese part and the markdown level
            chinese_part = parts[0].strip()
            return chinese_part + '\n'
    return line

def process_file(file_path):
    """Process a single markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Process each line
        modified = False
        new_lines = []
        for line in lines:
            new_line = clean_header(line)
            if new_line != line:
                modified = True
                print(f"  Cleaned: {line.strip()} -> {new_line.strip()}")
            new_lines.append(new_line)

        # Write back if modified
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"[OK] Updated: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"[ERROR] Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all markdown files."""
    print("Removing English text from markdown headers...")
    print(f"Scanning directory: {DOCS_DIR}\n")

    # Find all markdown files
    md_files = list(DOCS_DIR.rglob("*.md"))
    print(f"Found {len(md_files)} markdown files\n")

    updated_count = 0
    for md_file in md_files:
        if process_file(md_file):
            updated_count += 1

    print(f"\n[DONE] Updated {updated_count} files.")

if __name__ == "__main__":
    main()
