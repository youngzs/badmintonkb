#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create placeholder images for all GENERATE: markers in markdown files
"""

import os
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_ROOT = PROJECT_ROOT / "content"

def create_placeholder_image(output_path: Path, text: str, size=(1024, 1024)):
    """Create a simple placeholder image with text"""
    # Create image with light gray background
    img = Image.new('RGB', size, color='#f0f0f0')
    draw = ImageDraw.Draw(img)

    # Draw text in center
    try:
        # Try to use a font
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        # Fall back to default font
        font = ImageFont.load_default()

    # Draw border
    draw.rectangle([10, 10, size[0]-10, size[1]-10], outline='#cccccc', width=5)

    # Draw text
    text_lines = [
        "AI Image Placeholder",
        "",
        text,
        "",
        "Run: python scripts/batch_generate_images.py",
        "to generate actual images"
    ]

    y_offset = size[1] // 2 - 100
    for line in text_lines:
        # Get text bounding box for centering
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (size[0] - text_width) // 2
        draw.text((x, y_offset), line, fill='#666666', font=font)
        y_offset += 50

    # Save image
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"Created: {output_path.name}")

def find_generate_markers():
    """Find all GENERATE: markers in markdown files"""
    markers = []

    for md_file in CONTENT_ROOT.rglob("*.md"):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all GENERATE: markers
        pattern = r'!\[([^\]]*)\]\(\.\/images\/GENERATE:([^)]+)\)'
        matches = re.findall(pattern, content)

        for alt_text, filename in matches:
            image_dir = md_file.parent / "images"
            image_path = image_dir / filename

            # Check if image already exists
            if not image_path.exists():
                markers.append({
                    'path': image_path,
                    'text': alt_text or filename.replace('.png', ''),
                    'md_file': md_file
                })

    return markers

def main():
    print("="*60)
    print("Creating Placeholder Images")
    print("="*60)

    markers = find_generate_markers()

    if not markers:
        print("No missing images found!")
        return

    print(f"\nFound {len(markers)} missing images\n")

    for idx, marker in enumerate(markers, 1):
        print(f"[{idx}/{len(markers)}] ", end='')
        create_placeholder_image(
            marker['path'],
            marker['text']
        )

    print(f"\n{'='*60}")
    print(f"Created {len(markers)} placeholder images")
    print(f"{'='*60}")
    print("\nThese are temporary placeholders.")
    print("Run 'python scripts/batch_generate_images.py --auto'")
    print("to generate actual AI images.")

if __name__ == "__main__":
    main()
