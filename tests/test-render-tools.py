#!/usr/bin/env python3
"""Isolated regression tests for render evidence and engine gates."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
RENDER_SCRIPT = ROOT / "scripts" / "render-slides.py"
QA_SCRIPT = ROOT / "scripts" / "qa-render.py"


def load_render_module():
    spec = importlib.util.spec_from_file_location("pptx_render_slides", RENDER_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Cannot load render-slides.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_qa(render_dir: Path, required_engine: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(QA_SCRIPT),
            str(render_dir),
            "--expected",
            "1",
            "--require-engine",
            required_engine,
        ],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )


def main() -> int:
    render_module = load_render_module()
    with tempfile.TemporaryDirectory(prefix="pptx-render-tools-") as temp_name:
        render_dir = Path(temp_name)
        Image.new("RGB", (1280, 720), "white").save(render_dir / "slide-1.png")
        fake_pptx = render_dir / "fixture.pptx"

        render_module.write_manifest(render_dir, fake_pptx, "powerpoint", 144, 1)
        manifest = json.loads((render_dir / "render-manifest.json").read_text(encoding="utf-8"))
        assert manifest["engine"] == "powerpoint"
        assert manifest["slideCount"] == 1
        accepted = run_qa(render_dir, "powerpoint")
        if accepted.returncode != 0:
            raise AssertionError(f"PowerPoint evidence should pass:\n{accepted.stdout}")

        render_module.write_manifest(render_dir, fake_pptx, "libreoffice", 144, 1)
        rejected = run_qa(render_dir, "powerpoint")
        if rejected.returncode == 0 or "render-engine" not in rejected.stdout:
            raise AssertionError(f"LibreOffice evidence should fail a PowerPoint gate:\n{rejected.stdout}")

    print("Render-tools regression passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
