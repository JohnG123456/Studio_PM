#!/usr/bin/env python3
"""Generate the Studio PM app icon set from the design sheet.

Source: design/app-icon-source.jpg — the icon design sheet. The 1024px master
tile on that sheet is a tall rounded rectangle (mark + gantt + wordmark), so the
square icons are cut from the monogram + blueprint-grid area of that tile and
re-masked with an iOS-style corner radius.

Usage: python3 design/generate-icons.py   (requires pillow and numpy)
Outputs: app/favicon.ico, app/icon.png, app/apple-icon.png, public/icons/*.png
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design" / "app-icon-source.jpg"

# Master tile on the sheet, inset far enough to clear its rounded rim.
TILE_BOX = (60, 63, 660, 864)
# How much blueprint grid to leave around the monogram, as a multiple of its size.
MARK_MARGIN = 1.28
# Tabs render the favicon at 16-32px, where the grid and emboss texture turn to
# noise, so the .ico is cut tighter and sharpened after the downscale.
FAVICON_MARGIN = 1.05
FAVICON_SIZES = (16, 32, 48)
CORNER_RADIUS = 0.2237  # fraction of the icon width, matching the iOS squircle
# Android crops maskable icons to an unknown shape, so that variant pulls back to
# a wider view of the tile. Asking for more margin than the tile holds is fine:
# mark_box clamps to the tile edge, which is as far back as the artwork goes.
MASKABLE_MARGIN = 2.0


def mark_box(tile: Image.Image, margin: float = MARK_MARGIN) -> tuple[int, int, int, int]:
    """Square crop around the monogram, found from the copper in the tile.

    The wordmark and gantt bars below the monogram don't survive being shrunk to
    icon sizes, so the square is centred on the monogram itself plus enough
    blueprint grid to breathe. Deriving it from the pixels rather than hardcoding
    it means a re-rendered design sheet still crops correctly.
    """
    a = np.asarray(tile).astype(np.int16)
    copper = (a[:, :, 0] - a[:, :, 2] > 28) & (a[:, :, 0] > 90)
    # Erode, so the hairline blueprint grid drops out and only the facets remain.
    facets = Image.fromarray((copper * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7))
    body = np.asarray(facets)[: int(tile.height * 0.58)] > 0  # above the gantt bars
    rows, cols = np.nonzero(body)
    cx, cy = (cols.min() + cols.max()) // 2, (rows.min() + rows.max()) // 2
    half = round(max(cols.max() - cols.min(), rows.max() - rows.min()) * margin / 2)
    half = min(half, cx, cy, tile.width - cx, tile.height - cy)
    return (cx - half, cy - half, cx + half, cy + half)


def mark(size: int, margin: float = MARK_MARGIN) -> Image.Image:
    tile = Image.open(SOURCE).convert("RGB").crop(TILE_BOX)
    return tile.crop(mark_box(tile, margin)).resize((size, size), Image.LANCZOS)


def rounded(img: Image.Image) -> Image.Image:
    size = img.width
    radius = round(size * CORNER_RADIUS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(size / 512))
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def favicon(path: Path) -> None:
    """Multi-size .ico, each layer sharpened for the size it will be shown at."""
    layers = []
    for px in FAVICON_SIZES:
        art = mark(px, FAVICON_MARGIN).filter(ImageFilter.UnsharpMask(1, 90, 3))
        layers.append(rounded(art))
    layers[-1].save(path, format="ICO", sizes=[(px, px) for px in FAVICON_SIZES],
                    append_images=layers[:-1])
    print(f"{path.relative_to(ROOT)}  {'/'.join(str(px) for px in FAVICON_SIZES)}")


def maskable(size: int) -> Image.Image:
    """Full-bleed icon sitting the mark well inside the Android safe zone.

    Real pixels the whole way out rather than synthesised padding, so there is no
    seam where the surround meets the tile's texture.
    """
    return mark(size, MASKABLE_MARGIN)


def write(img: Image.Image, path: Path) -> None:
    """Save as a dithered 256-colour PNG — a fifth of the size, no visible loss."""
    path.parent.mkdir(parents=True, exist_ok=True)
    img.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG).save(
        path, optimize=True
    )
    print(f"{path.relative_to(ROOT)}  {img.width}x{img.height}")


if __name__ == "__main__":
    favicon(ROOT / "app" / "favicon.ico")
    write(rounded(mark(512)), ROOT / "app" / "icon.png")
    write(mark(180), ROOT / "app" / "apple-icon.png")  # iOS applies its own mask
    for px in (192, 512, 1024):
        write(rounded(mark(px)), ROOT / "public" / "icons" / f"icon-{px}.png")
    write(maskable(512), ROOT / "public" / "icons" / "icon-maskable-512.png")
