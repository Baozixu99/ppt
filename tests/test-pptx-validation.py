#!/usr/bin/env python3
"""Regression tests for semantic PPTX extent validation."""

from __future__ import annotations

import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts" / "validate-pptx.py"


def write_fixture(path: Path, cx: str, cy: str) -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>
"""
    root_rels = """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"""
    presentation = """<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>
"""
    slide = f"""<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld><p:spTree><p:sp><p:spPr><a:xfrm><a:ext cx="{cx}" cy="{cy}"/></a:xfrm></p:spPr></p:sp></p:spTree></p:cSld>
</p:sld>
"""
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", root_rels)
        archive.writestr("ppt/presentation.xml", presentation)
        archive.writestr("ppt/slides/slide1.xml", slide)


def run_validator(path: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VALIDATOR), str(path)],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="pptx-validation-") as temp_name:
        temp = Path(temp_name)
        valid = temp / "valid.pptx"
        invalid = temp / "invalid.pptx"
        write_fixture(valid, "100", "0")
        write_fixture(invalid, "-100", "0")

        accepted = run_validator(valid)
        if accepted.returncode != 0:
            raise AssertionError(f"Valid extents should pass:\n{accepted.stdout}")

        rejected = run_validator(invalid)
        if rejected.returncode == 0 or "Negative DrawingML extent" not in rejected.stdout:
            raise AssertionError(f"Negative extents should fail:\n{rejected.stdout}")

    print("PPTX semantic-validation tests passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
