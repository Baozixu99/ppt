#!/usr/bin/env python3
"""Validate PPTX ZIP/XML integrity and internal relationship targets."""

from __future__ import annotations

import argparse
import posixpath
import zipfile
from pathlib import Path, PurePosixPath
from xml.etree import ElementTree


REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
REQUIRED = {"[Content_Types].xml", "_rels/.rels", "ppt/presentation.xml"}


def source_part_for_rels(name: str) -> str:
    path = PurePosixPath(name)
    if name == "_rels/.rels":
        return ""
    if path.parent.name != "_rels" or not path.name.endswith(".rels"):
        return ""
    source_name = path.name[:-5]
    return str(path.parent.parent / source_name)


def resolve_target(source_part: str, target: str) -> str:
    if target.startswith("/"):
        return target.lstrip("/")
    base = posixpath.dirname(source_part)
    return posixpath.normpath(posixpath.join(base, target)).lstrip("/")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx", type=Path)
    args = parser.parse_args()
    pptx = args.pptx.resolve()
    if not pptx.is_file():
        parser.error(f"PPTX not found: {pptx}")

    errors: list[str] = []
    with zipfile.ZipFile(pptx) as archive:
        names = set(archive.namelist())
        bad = archive.testzip()
        if bad:
            errors.append(f"Corrupt ZIP member: {bad}")
        for required in sorted(REQUIRED - names):
            errors.append(f"Missing required part: {required}")

        for name in sorted(n for n in names if n.endswith((".xml", ".rels"))):
            try:
                root = ElementTree.fromstring(archive.read(name))
            except ElementTree.ParseError as exc:
                errors.append(f"Invalid XML {name}: {exc}")
                continue
            if not name.endswith(".rels"):
                continue
            source_part = source_part_for_rels(name)
            for rel in root.findall(f"{{{REL_NS}}}Relationship"):
                if rel.attrib.get("TargetMode") == "External":
                    continue
                target = rel.attrib.get("Target")
                if not target:
                    errors.append(f"Relationship without Target in {name}")
                    continue
                resolved = resolve_target(source_part, target)
                if resolved not in names:
                    errors.append(f"Missing relationship target: {name} -> {resolved}")

    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1
    print(f"PPTX validation passed: {pptx}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
