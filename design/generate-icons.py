#!/usr/bin/env python3
"""Generate the Studio PM app icon set from the design sheet.

Source: design/app-icon-source.jpg — the icon design sheet. The 1024px master
tile on that sheet is a tall rounded rectangle (mark + gantt + wordmark), so the
square icons are cut from the monogram + blueprint-grid area of that tile and
re-masked with an iOS-style corner radius.

Usage: python3 design/generate-icons.py   (requires pillow and numpy)
Outputs: app/icon.png, app/apple-icon.png, public/icons/*.png
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design" / "app-icon-source.jpg"

# Master tile on the sheet, inset far enough to clear its rounded rim.
TILE_BOX = (62, 63, 668, 870)
# Square region of the tile holding the monogram, grid and floor-plan glyph.
MARK_BOX = (72, 26, 532, 486)
CORNER_RADIUS = 0.2237  # fraction of the icon width, matching the iOS squircle
MASKABLE_SCALE = 0.82  # keeps the mark inside the Android maskable safe zone


def mark(size: int) -> Image.Image:
    tile = Image.open(SOURCE).convert("RGB").crop(TILE_BOX)
    return tile.crop(MARK_BOX).resize((size, size), Image.LANCZOS)


def rounded(img: Image.Image) -> Image.Image:
    size = img.width
    radius = round(size * CORNER_RADIUS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(size / 512))
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def maskable(size: int) -> Image.Image:
    """Full-bleed icon with the mark pulled into the Android safe zone.

    The surround is the tile's own edge reflected outwards and blurred, so the
    padding continues the gradient instead of boxing the mark in a flat fill.
    """
    inner = round(size * MASKABLE_SCALE)
    pad = (size - inner) // 2
    art = np.asarray(mark(inner))
    padded = np.pad(art, ((pad, size - inner - pad), (pad, size - inner - pad), (0, 0)), mode="reflect")
    canvas = Image.fromarray(padded).filter(ImageFilter.GaussianBlur(size / 16))
    feathered = Image.new("L", (inner, inner), 255).filter(ImageFilter.GaussianBlur(inner / 30))
    canvas.paste(mark(inner), (pad, pad), feathered)
    return canvas


def write(img: Image.Image, path: Path) -> None:
    """Save as a dithered 256-colour PNG — a fifth of the size, no visible loss."""
    path.parent.mkdir(parents=True, exist_ok=True)
    img.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG).save(
        path, optimize=True
    )
    print(f"{path.relative_to(ROOT)}  {img.width}x{img.height}")


if __name__ == "__main__":
    write(rounded(mark(512)), ROOT / "app" / "icon.png")
    write(mark(180), ROOT / "app" / "apple-icon.png")  # iOS applies its own mask
    for px in (192, 512, 1024):
        write(rounded(mark(px)), ROOT / "public" / "icons" / f"icon-{px}.png")
    write(maskable(512), ROOT / "public" / "icons" / "icon-maskable-512.png")
