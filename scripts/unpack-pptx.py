#!/usr/bin/env python3
"""Safely extract a PPTX package without rewriting its XML."""

from __future__ import annotations

import argparse
import shutil
import zipfile
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    source = args.pptx.resolve()
    destination = args.destination.resolve()
    if not source.is_file() or source.suffix.lower() != ".pptx":
        parser.error(f"PPTX not found: {source}")
    if destination.exists() and any(destination.iterdir()):
        if not args.force:
            parser.error(f"Destination is not empty: {destination}")
        shutil.rmtree(destination)
    destination.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(source) as archive:
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"Corrupt ZIP member: {bad}")
        for member in archive.infolist():
            target = (destination / member.filename).resolve()
            if destination != target and destination not in target.parents:
                raise SystemExit(f"Unsafe ZIP path: {member.filename}")
        archive.extractall(destination)
    print(f"Extracted {source} to {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
