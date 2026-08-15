#!/usr/bin/env python3
"""Run the complete build, package, render, and render-integrity workflow."""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run(command: list[str], cwd: Path) -> None:
    print(f"+ {' '.join(command)}", flush=True)
    environment = os.environ.copy()
    environment.setdefault("NO_UPDATE_NOTIFIER", "1")
    environment.setdefault("npm_config_update_notifier", "false")
    completed = subprocess.run(command, cwd=cwd, check=False, env=environment)
    if completed.returncode != 0:
        raise SystemExit(completed.returncode)


def npm_command(npm: str, *args: str) -> list[str]:
    if sys.platform == "win32" and Path(npm).suffix.lower() in {".cmd", ".bat"}:
        command_processor = os.environ.get("ComSpec", "cmd.exe")
        return [command_processor, "/d", "/s", "/c", npm, *args]
    return [npm, *args]


def discover_slide_count(deck_dir: Path) -> int:
    numbers: list[int] = []
    for path in deck_dir.glob("slide-*.js"):
        match = re.fullmatch(r"slide-(\d+)(?:-[a-z0-9-]+)?\.js", path.name, re.IGNORECASE)
        if match:
            numbers.append(int(match.group(1)))
    if not numbers:
        raise SystemExit(f"No slide-NN.js modules found in {deck_dir}")
    if len(numbers) != len(set(numbers)):
        raise SystemExit("Duplicate slide numbers found.")
    return len(numbers)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("deck_dir", type=Path, help="Scaffolded deck directory containing compile.js")
    parser.add_argument("--engine", choices=("auto", "powerpoint", "libreoffice"), default="auto")
    parser.add_argument("--dpi", type=int, default=144)
    parser.add_argument("--static-only", action="store_true", help="Stop after build, static QA, and package validation")
    args = parser.parse_args()

    deck_dir = args.deck_dir.resolve()
    if not (deck_dir / "compile.js").is_file():
        parser.error(f"Not a scaffolded deck directory: {deck_dir}")
    npm = shutil.which("npm.cmd" if sys.platform == "win32" else "npm") or shutil.which("npm")
    if not npm:
        raise SystemExit("npm was not found on PATH.")

    expected = discover_slide_count(deck_dir)
    pptx = deck_dir / "output" / "presentation.pptx"
    rendered = deck_dir / "output" / "rendered"

    run(npm_command(npm, "run", "verify"), deck_dir)
    run([sys.executable, str(ROOT / "scripts" / "validate-pptx.py"), str(pptx)], deck_dir)
    if args.static_only:
        print(f"Static and package verification passed for {expected} slide(s).")
        return 0

    run([
        sys.executable,
        str(ROOT / "scripts" / "render-slides.py"),
        str(pptx),
        "--output-dir",
        str(rendered),
        "--engine",
        args.engine,
        "--dpi",
        str(args.dpi),
    ], deck_dir)
    qa_command = [
        sys.executable,
        str(ROOT / "scripts" / "qa-render.py"),
        str(rendered),
        "--expected",
        str(expected),
    ]
    if args.engine in {"powerpoint", "libreoffice"}:
        qa_command.extend(["--require-engine", args.engine])
    run(qa_command, deck_dir)
    run([
        sys.executable,
        str(ROOT / "scripts" / "create-montage.py"),
        str(rendered),
        str(deck_dir / "output" / "montage.png"),
    ], deck_dir)
    print(f"Full verification passed for {expected} slide(s): {pptx}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
