#!/usr/bin/env python3
"""Create a labeled contact sheet from rendered slide PNGs."""

from __future__ import annotations

import argparse
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def slide_number(path: Path) -> int:
    match = re.search(r"(\d+)", path.stem)
    return int(match.group(1)) if match else 10**9


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--columns", type=int, default=3)
    parser.add_argument("--thumb-width", type=int, default=480)
    args = parser.parse_args()

    images = sorted(args.input_dir.resolve().glob("slide-*.png"), key=slide_number)
    if not images:
        parser.error(f"No slide-*.png files found in {args.input_dir}")
    columns = max(1, args.columns)
    gap, label_height = 24, 28

    with Image.open(images[0]) as first:
        ratio = first.height / first.width
    thumb_height = round(args.thumb_width * ratio)
    rows = math.ceil(len(images) / columns)
    canvas = Image.new(
        "RGB",
        (columns * args.thumb_width + (columns + 1) * gap,
         rows * (thumb_height + label_height) + (rows + 1) * gap),
        "#E5E7EB",
    )
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()

    for index, image_path in enumerate(images):
        row, column = divmod(index, columns)
        x = gap + column * (args.thumb_width + gap)
        y = gap + row * (thumb_height + label_height + gap)
        with Image.open(image_path) as source:
            thumb = source.convert("RGB").resize((args.thumb_width, thumb_height), Image.Resampling.LANCZOS)
        canvas.paste(thumb, (x, y))
        draw.rectangle((x, y, x + args.thumb_width - 1, y + thumb_height - 1), outline="#9CA3AF")
        draw.text((x, y + thumb_height + 7), f"Slide {slide_number(image_path)}", fill="#111827", font=font)

    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=92)
    print(f"Created montage: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
