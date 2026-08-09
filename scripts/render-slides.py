#!/usr/bin/env python3
"""Render every PPTX slide to PNG with PowerPoint or LibreOffice."""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_soffice() -> str | None:
    for name in ("soffice", "libreoffice"):
        found = shutil.which(name)
        if found:
            return found
    if sys.platform == "win32":
        candidates = (
            Path(r"C:\Program Files\LibreOffice\program\soffice.exe"),
            Path(r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"),
        )
        for candidate in candidates:
            if candidate.exists():
                return str(candidate)
    return None


def find_powerpoint() -> Path | None:
    if sys.platform != "win32":
        return None
    candidates = (
        Path(r"C:\Program Files\Microsoft Office\Root\Office16\POWERPNT.EXE"),
        Path(r"C:\Program Files (x86)\Microsoft Office\Root\Office16\POWERPNT.EXE"),
    )
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def numeric_key(path: Path) -> tuple[int, str]:
    match = re.search(r"(\d+)(?=\.[^.]+$)", path.name)
    return (int(match.group(1)) if match else 10**9, path.name.lower())


def render_with_powerpoint(pptx: Path, output: Path, dpi: int, timeout_seconds: int) -> int:
    if not find_powerpoint():
        return 0
    powershell = shutil.which("powershell.exe") or shutil.which("powershell")
    if not powershell:
        return 0
    with tempfile.TemporaryDirectory(prefix="pptx-powerpoint-") as temp_name:
        temp = Path(temp_name)
        export_dir = temp / "slides"
        script = temp / "render.ps1"
        script.write_text(
            """param([string]$InputPptx, [string]$OutputDir, [int]$Dpi)
$ErrorActionPreference = 'Stop'
$app = $null
$deck = $null
try {
  $app = New-Object -ComObject PowerPoint.Application
  $app.DisplayAlerts = 1
  $deck = $app.Presentations.Open($InputPptx, $true, $false, $false)
  $width = [math]::Max(1, [math]::Round($deck.PageSetup.SlideWidth / 72 * $Dpi))
  $height = [math]::Max(1, [math]::Round($deck.PageSetup.SlideHeight / 72 * $Dpi))
  $deck.Export($OutputDir, 'PNG', $width, $height)
} finally {
  if ($deck -ne $null) { $deck.Close() }
  if ($app -ne $null) { $app.Quit() }
  if ($deck -ne $null) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($deck) }
  if ($app -ne $null) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app) }
}
""",
            encoding="utf-8-sig",
        )
        try:
            result = subprocess.run(
                [
                    powershell,
                    "-NoProfile",
                    "-NonInteractive",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(script),
                    str(pptx),
                    str(export_dir),
                    str(dpi),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=timeout_seconds,
            )
        except subprocess.TimeoutExpired as error:
            raise RuntimeError(f"PowerPoint export timed out after {timeout_seconds} seconds.") from error
        if result.returncode != 0:
            raise RuntimeError(f"PowerPoint export failed:\n{result.stderr or result.stdout}")
        generated = sorted(
            (path for path in export_dir.iterdir() if path.suffix.lower() == ".png"),
            key=numeric_key,
        )
        if not generated:
            raise RuntimeError("PowerPoint completed without producing slide images.")
        for index, source in enumerate(generated, 1):
            shutil.copy2(source, output / f"slide-{index}.png")
        return len(generated)


def render_with_fitz(pdf: Path, output: Path, dpi: int) -> int:
    try:
        import fitz  # type: ignore
    except ImportError:
        return 0
    document = fitz.open(pdf)
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)
    for index, page in enumerate(document, 1):
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        pixmap.save(output / f"slide-{index}.png")
    return len(document)


def render_with_pdfium(pdf: Path, output: Path, dpi: int) -> int:
    try:
        import pypdfium2 as pdfium  # type: ignore
    except ImportError:
        return 0
    document = pdfium.PdfDocument(str(pdf))
    scale = dpi / 72
    for index in range(len(document)):
        bitmap = document[index].render(scale=scale)
        bitmap.to_pil().convert("RGB").save(output / f"slide-{index + 1}.png")
    return len(document)


def render_with_pdftoppm(pdf: Path, output: Path, dpi: int) -> int:
    executable = shutil.which("pdftoppm")
    if not executable:
        return 0
    prefix = output / "slide"
    subprocess.run(
        [executable, "-png", "-r", str(dpi), str(pdf), str(prefix)],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    generated = sorted(output.glob("slide-*.png"))
    for index, source in enumerate(generated, 1):
        target = output / f"slide-{index}.png"
        if source != target:
            source.replace(target)
    return len(generated)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--dpi", type=int, default=144)
    parser.add_argument("--engine", choices=("auto", "powerpoint", "libreoffice"), default="auto")
    parser.add_argument("--timeout", type=int, default=120, help="PowerPoint export timeout in seconds")
    args = parser.parse_args()

    pptx = args.pptx.resolve()
    if not pptx.is_file() or pptx.suffix.lower() != ".pptx":
        parser.error(f"PPTX not found: {pptx}")
    output = (args.output_dir or pptx.with_name(f"{pptx.stem}-rendered")).resolve()
    output.mkdir(parents=True, exist_ok=True)
    for stale in output.glob("slide-*.png"):
        stale.unlink()

    if args.engine in ("auto", "powerpoint"):
        try:
            count = render_with_powerpoint(pptx, output, args.dpi, args.timeout)
        except RuntimeError as error:
            if args.engine == "powerpoint":
                raise SystemExit(str(error)) from error
            print(f"PowerPoint renderer unavailable: {error}", file=sys.stderr)
            count = 0
        if count:
            print(f"Rendered {count} slide(s) to {output} with PowerPoint")
            return 0
        if args.engine == "powerpoint":
            raise SystemExit("Microsoft PowerPoint is not available.")

    soffice = find_soffice()
    if not soffice:
        raise SystemExit("No renderer found. Install Microsoft PowerPoint on Windows or LibreOffice/soffice.")

    with tempfile.TemporaryDirectory(prefix="pptx-render-") as temp_name:
        temp = Path(temp_name)
        result = subprocess.run(
            [soffice, "--headless", "--convert-to", "pdf", "--outdir", str(temp), str(pptx)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if result.returncode != 0:
            raise SystemExit(f"LibreOffice conversion failed:\n{result.stderr or result.stdout}")
        pdf = temp / f"{pptx.stem}.pdf"
        if not pdf.exists():
            raise SystemExit(f"LibreOffice did not create the expected PDF: {pdf}")

        count = render_with_fitz(pdf, output, args.dpi)
        if not count:
            count = render_with_pdfium(pdf, output, args.dpi)
        if not count:
            count = render_with_pdftoppm(pdf, output, args.dpi)
        if not count:
            raise SystemExit("Install PyMuPDF, pypdfium2, or Poppler pdftoppm to render PDF pages.")

    print(f"Rendered {count} slide(s) to {output} with LibreOffice")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
