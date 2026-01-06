#!/usr/bin/env python3
"""
Generate maskable PNG icons from SVG template.
This is a fallback script for environments where Node.js is not available.
"""

import subprocess
import sys
import os

def check_tool(tool_name, command):
    """Check if a command-line tool is available."""
    try:
        subprocess.run(command, shell=True, check=True,
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except:
        return False

def convert_svg_to_png(svg_path, png_path, size):
    """Convert SVG to PNG using available tools."""

    # Try rsvg-convert (librsvg)
    if check_tool('rsvg-convert', 'which rsvg-convert'):
        cmd = f'rsvg-convert -w {size} -h {size} "{svg_path}" > "{png_path}"'
        print(f"Using rsvg-convert: {cmd}")
        subprocess.run(cmd, shell=True, check=True)
        return True

    # Try inkscape
    if check_tool('inkscape', 'which inkscape'):
        cmd = f'inkscape -w {size} -h {size} "{svg_path}" -o "{png_path}"'
        print(f"Using inkscape: {cmd}")
        subprocess.run(cmd, shell=True, check=True)
        return True

    # Try ImageMagick convert
    if check_tool('convert', 'which convert'):
        cmd = f'convert -background none -resize {size}x{size} "{svg_path}" "{png_path}"'
        print(f"Using ImageMagick: {cmd}")
        subprocess.run(cmd, shell=True, check=True)
        return True

    # Try sips (macOS built-in)
    if check_tool('sips', 'which sips'):
        # sips doesn't handle SVG well, but we can try
        cmd = f'sips -s format png -Z {size} "{svg_path}" --out "{png_path}"'
        print(f"Using sips: {cmd}")
        try:
            subprocess.run(cmd, shell=True, check=True)
            return True
        except:
            pass

    return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, 'public')
    svg_path = os.path.join(public_dir, 'maskable-icon-template.svg')

    if not os.path.exists(svg_path):
        print(f"Error: SVG template not found at {svg_path}")
        sys.exit(1)

    icons = [
        ('maskable-192.png', 192),
        ('maskable-512.png', 512)
    ]

    print("Generating maskable icons from SVG template...\n")

    success = True
    for filename, size in icons:
        png_path = os.path.join(public_dir, filename)
        print(f"Generating {filename} ({size}x{size})...")

        if convert_svg_to_png(svg_path, png_path, size):
            print(f"✓ {filename} created successfully\n")
        else:
            print(f"✗ Failed to generate {filename}")
            print("Error: No suitable SVG-to-PNG conversion tool found.")
            print("Please install one of: rsvg-convert, inkscape, or ImageMagick")
            print("Or use the Node.js script: npm run generate:icons")
            success = False
            break

    if success:
        print("✓ All maskable icons generated successfully!")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
