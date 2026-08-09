#!/usr/bin/env python3
"""Pack an OOXML directory into a PPTX through an atomic temporary file."""

from __future__ import annotations

import argparse
import os
import tempfile
import zipfile
from pathlib import Path


REQUIRED = ("[Content_Types].xml", "_rels/.rels", "ppt/presentation.xml")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source = args.source_dir.resolve()
    output = args.output.resolve()
    if not source.is_dir():
        parser.error(f"Source directory not found: {source}")
    missing = [name for name in REQUIRED if not (source / Path(name)).is_file()]
    if missing:
        parser.error(f"Missing required package parts: {', '.join(missing)}")

    output.parent.mkdir(parents=True, exist_ok=True)
    handle, temp_name = tempfile.mkstemp(prefix=f".{output.stem}-", suffix=".pptx", dir=output.parent)
    os.close(handle)
    temp = Path(temp_name)
    try:
        with zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for file in sorted(source.rglob("*")):
                if file.is_file():
                    archive.write(file, file.relative_to(source).as_posix())
        with zipfile.ZipFile(temp) as archive:
            bad = archive.testzip()
            if bad:
                raise RuntimeError(f"Packed ZIP contains a corrupt member: {bad}")
        os.replace(temp, output)
    finally:
        temp.unlink(missing_ok=True)
    print(f"Packed {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
