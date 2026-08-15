#!/usr/bin/env python3
"""Check render completeness and basic image health; visual inspection remains mandatory."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageStat


def slide_number(path: Path) -> int:
    match = re.search(r"(\d+)", path.stem)
    return int(match.group(1)) if match else 10**9


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("render_dir", type=Path)
    parser.add_argument("--expected", type=int, required=True)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--require-engine", choices=("powerpoint", "libreoffice"))
    args = parser.parse_args()

    render_dir = args.render_dir.resolve()
    files = sorted(render_dir.glob("slide-*.png"), key=slide_number)
    errors: list[dict[str, object]] = []
    warnings: list[dict[str, object]] = []
    slides: list[dict[str, object]] = []
    manifest_path = render_dir / "render-manifest.json"
    manifest: dict[str, object] | None = None
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            errors.append({"code": "render-manifest", "message": f"Cannot parse render-manifest.json: {error}"})
    else:
        warnings.append({"code": "render-manifest-missing", "message": "No render-manifest.json was found; rerender with render-slides.py."})
    if args.require_engine and (not manifest or manifest.get("engine") != args.require_engine):
        errors.append({
            "code": "render-engine",
            "message": f"Required {args.require_engine}; manifest reports {(manifest or {}).get('engine', '<missing>')}.",
        })
    if len(files) != args.expected:
        errors.append({"code": "render-count", "message": f"Found {len(files)} renders; expected {args.expected}."})

    expected_numbers = list(range(1, len(files) + 1))
    actual_numbers = [slide_number(path) for path in files]
    if actual_numbers != expected_numbers:
        errors.append({"code": "render-order", "message": f"Render numbers are not contiguous: {actual_numbers}"})
    if manifest and manifest.get("slideCount") != len(files):
        errors.append({"code": "render-manifest-count", "message": f"Manifest reports {manifest.get('slideCount')} slides; found {len(files)} PNG files."})

    for path in files:
        with Image.open(path) as image:
            rgb = image.convert("RGB")
            stat = ImageStat.Stat(rgb.resize((64, 64)))
            deviation = sum(stat.stddev) / len(stat.stddev)
            width, height = rgb.size
        if width < 1000 or height < 560:
            warnings.append({"code": "low-resolution", "slide": slide_number(path), "size": [width, height]})
        if deviation < 2.0:
            warnings.append({"code": "near-blank", "slide": slide_number(path), "deviation": deviation})
        slides.append({"slide": slide_number(path), "file": path.name, "size": [width, height], "deviation": round(deviation, 2)})

    report = {"summary": {"errors": len(errors), "warnings": len(warnings), "slides": len(files)}, "manifest": manifest, "errors": errors, "warnings": warnings, "slides": slides}
    report_path = (args.report or render_dir / "render-qa-report.json").resolve()
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    for item in errors:
        print(f"ERROR {item.get('code', 'unknown')}: {item.get('message', item)}")
    for item in warnings:
        print(f"WARN  {item.get('code', 'unknown')}: {item.get('message', item)}")
    print(f"Render integrity: {len(errors)} error(s), {len(warnings)} warning(s), {len(files)} slide(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
