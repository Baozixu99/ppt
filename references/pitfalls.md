# QA Process & Common Pitfalls

## Modification Health Check (Mandatory After Every Edit)

> **Why this exists**: Some agentic editing tools (including `StrReplace` on Windows) can silently corrupt markdown files by collapsing all lines into one giant single-line buffer with invisible separators. The first 3 bytes may still look like UTF-8, so a byte-level check alone will miss it. **Always verify after every edit.**

### The 30-second post-edit check

Run this **immediately after any edit** to a `.md` file. If any check fails, **restore from the last known-good backup** (or re-apply the edit using a different method).

```bash
# 1. Line count must be in the expected range
wc -l path/to/file.md
#   Expected: roughly 1 line per visible content line
#   Warning:  1 line + large file size = CORRUPTED (single-line collapse)

# 2. First 4 bytes must NOT be a BOM (unless explicitly wanted)
xxd path/to/file.md | head -1
#   Good:  23 20 (or similar ASCII/UTF-8 text)
#   Bad:   ef bb bf (UTF-8 BOM) | ff fe (UTF-16 LE BOM) | fe ff (UTF-16 BE BOM)

# 3. Cat the first 5 lines - humans should see proper markdown structure
head -n 5 path/to/file.md
```

PowerShell equivalents (when bash is unavailable):

```powershell
# Line count
(Get-Content path	oile.md -Encoding UTF8).Count

# First 4 bytes as hex
$bytes = [System.IO.File]::ReadAllBytes('path	oile.md')
'0x{0:X2} 0x{1:X2} 0x{2:X2} 0x{3:X2}' -f $bytes[0], $bytes[1], $bytes[2], $bytes[3]

# First 5 lines
Get-Content path	oile.md -Encoding UTF8 -TotalCount 5
```

### Corruption symptoms and root causes

| Symptom | Root cause | Fix |
|---------|------------|-----|
| **Single-line file (e.g., 30 KB / 1 line)** | `StrReplace` or similar tool collapsed all newlines | Re-create the file from a clean source using `Write` + Python, or restore from backup |
| **`ef bb bf` BOM at file start** | PowerShell `Set-Content -Encoding UTF8` (PS 5.1) writes BOM | Re-encode: `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))` |
| **`ff fe` UTF-16 LE BOM** | Some Windows write paths inject UTF-16 | Bulk re-encode script — see "Windows-Only Disasters" further down |
| **Garbled CJK characters** | File written as UTF-16 but read as UTF-8 (or vice versa) | Re-encode via `WriteAllText` with explicit encoding |
| **`## Heading` repeated on adjacent lines** | Placeholder substitution appended a duplicate header | Run a dedup script (see example below) |

### Quick post-edit diagnostic one-liner

```bash
# Single command that flags the three most common corruption modes
f=path/to/file.md
size=$(stat -c%s "$f" 2>/dev/null || wc -c < "$f")
lines=$(wc -l < "$f")
head4=$(head -c 4 "$f" | xxd -p)
echo "Size: $size bytes, Lines: $lines, First 4 bytes: $head4"
[ "$lines" -le 2 ] && [ "$size" -gt 1000 ] && echo "CORRUPTED: single-line collapse"
[ "$head4" = "efbbbf" ] && echo "WARNING: UTF-8 BOM present"
```

PowerShell version:

```powershell
$f = 'path	oile.md'
$b = [System.IO.File]::ReadAllBytes($f)
$lines = (Get-Content $f -Encoding UTF8).Count
Write-Host ("Size: {0} bytes, Lines: {1}, First 4 bytes: {1:X2}{2:X2}{3:X2}{4:X2}" -f $b.Length, $lines, $b[0], $b[1], $b[2], $b[3])
if ($lines -le 2 -and $b.Length -gt 1000) { Write-Host 'CORRUPTED: single-line collapse' -ForegroundColor Red }
if ($b[0] -eq 0xEF -and $b[1] -eq 0xBB) { Write-Host 'WARNING: UTF-8 BOM present' -ForegroundColor Yellow }
```

### Dedupe adjacent duplicate headings (recovery script)

If a `placeholder + replace` workflow created duplicate headers, run this Python one-liner to clean them up:

```python
import sys
path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
out, i = [], 0
while i < len(lines):
    j = i + 1
    while j < len(lines) and lines[j].strip() == '':
        j += 1
    if j < len(lines) and lines[j].strip() == lines[i].strip():
        i = j  # skip duplicate and intervening blanks
        continue
    out.append(lines[i])
    i += 1
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(out)
print(f'Before: {len(lines)} lines, After: {len(out)} lines')
```

Save as `dedupe.py` and run:

```bash
python dedupe.py path/to/file.md
```

### Prevention rules

1. **Always verify after `StrReplace`** — never trust a "successful" edit without re-reading the file.
2. **For large rewrites (multi-section changes), prefer full `Write` over incremental `StrReplace`** — `StrReplace` is safer for small surgical edits, dangerous for large ones.
3. **Use Python for any file with `|` characters** — PowerShell treats `|` as a pipe operator, breaking heredocs.
4. **Use `[System.IO.File]::WriteAllText` with explicit `UTF8Encoding($false)`** when writing via PowerShell — avoids both BOM and UTF-16 surprises.
5. **Keep a backup before any multi-file edit pass** — `Copy-Item` the skill folder first if you are about to rewrite 5+ files.

---

## QA Process

**Assume there are problems. Your job is to find them.**

Your first render is almost never correct. Approach QA as a bug hunt, not a confirmation step. If you found zero issues on first inspection, you weren't looking hard enough.

### QA Checklist (Mandatory — use before declaring success)

Work through this **in order**. Each item has a concrete command you can run.

#### 1. Page count matches plan

```bash
# Should equal the slide budget you planned in Step 4
python -c "from pptx import Presentation; p=Presentation('output/presentation.pptx'); print(len(p.slides))"
```

If `actual != planned`, you dropped or duplicated a slide. Inspect `compile.js` output logs.

#### 2. No blank or near-empty slides

```bash
# Each slide should have at least 1 text frame with > 20 chars
python -c "
from pptx import Presentation
p = Presentation('output/presentation.pptx')
for i, sl in enumerate(p.slides, 1):
    chars = sum(len(sh.text_frame.text) for sh in sl.shapes if sh.has_text_frame)
    flag = ' !' if chars < 20 else ''
    print(f'Slide {i:>2}: {chars:>4} chars{flag}')
"
```

Any slide flagged with `!` is suspiciously empty — investigate.

#### 3. No leftover placeholder text

```bash
python -m markitdown output/presentation.pptx > /tmp/qa-text.md 2>/dev/null
# Fallback (when markitdown unavailable — see "QA Tool Fallback" below):
python -c "from pptx import Presentation; p=Presentation('output/presentation.pptx'); print(chr(10).join(sh.text_frame.text for sl in p.slides for sh in sl.shapes if sh.has_text_frame))" > /tmp/qa-text.md

grep -iE "xxxx|lorem|ipsum|placeholder|todo|fixme|tbd|this.*(page|slide).*layout" /tmp/qa-text.md
```

If grep returns anything, fix before declaring success.

#### 4. Section numbers are coherent

For academic decks, section numbers in headers should be unique and monotonic (1.1, 1.2, 1.3, ... 4.4).

```bash
grep -oE "^[0-9]+\.[0-9]+" /tmp/qa-text.md | sort -u
```

Manually verify the sequence matches your planned outline.

#### 5. Page badges present on every non-cover slide

```python
# Spot-check: slide 2 (after cover) should have a small shape at (9.3, 5.1) area
# Skip this check if you used helpers.addPageBadge() uniformly — that helper enforces it.
```

If you did NOT use the helpers module (see [build-config.md](build-config.md)), verify each slide visually or via PptxGenJS preview.

#### 6. Data sources cited on data-heavy slides

```bash
grep -iE "source:|来源|表\s*\d+|图\s*\d+|fig\.?\s*\d+|table\s*\d+|figura\s*\d+|tabela\s*\d+" /tmp/qa-text.md
```

Slides with charts or quantitative claims must cite their source. Missing citations = academic integrity risk.

---

### QA Tool Fallback (when markitdown fails)

`markitdown` is convenient but fragile on Windows / some Python environments. If you see:

```
No module named markitdown
markitdown.__main__ not found
```

fall back to **python-pptx** (ships with most Anaconda installations):

```bash
pip install python-pptx  # one-time if missing
```

```python
# qa.py — drop in slides/ folder
from pptx import Presentation
import sys

path = sys.argv[1] if len(sys.argv) > 1 else 'output/presentation.pptx'
p = Presentation(path)
print(f"=== {path} | {len(p.slides)} slides ===")
for i, sl in enumerate(p.slides, 1):
    texts = [sh.text_frame.text for sh in sl.shapes if sh.has_text_frame and sh.text_frame.text.strip()]
    print(f"\n--- Slide {i} ---")
    for t in texts[:8]:
        s = t.replace("\n", " | ")[:140]
        print(f"  {s}")
```

Run with:

```bash
python qa.py output/presentation.pptx
```

Or to redirect into a file for grep (cross-platform):

```bash
python qa.py output/presentation.pptx > qa.txt
grep -iE "xxxx|lorem|placeholder" qa.txt
```

> **Tip**: `python-pptx` reads the file directly — it never hangs, never needs extra converters, and works identically on Windows / macOS / Linux.

---

### Content QA (when markitdown works)

```bash
python -m markitdown output/presentation.pptx
```

Check for missing content, typos, wrong order.

**Quick leftover-text grep**:

```bash
python -m markitdown output/presentation.pptx | grep -iE "xxxx|lorem|ipsum|placeholder|this.*(page|slide).*layout"
```

---

### Verification Loop

1. Run the 6-item QA Checklist above
2. **List issues found** (if none found, look again more critically)
3. Fix issues
4. **Re-verify affected slides** — one fix often creates another problem
5. Repeat until a full pass reveals no new issues

**Do not declare success until you've completed at least one fix-and-verify cycle.**

### Per-Slide QA (for from-scratch creation)

```bash
# Render single-slide preview by running slide-XX.js directly (see Slide Output Format)
node slide-XX.js   # produces slide-XX-preview.pptx
python -m markitdown slide-XX-preview.pptx
```

Check for missing content, placeholder text, missing page number badge.

---

## Common Mistakes to Avoid

- **Don't repeat the same layout** — vary columns, cards, and callouts across slides
- **Don't center body text** — left-align paragraphs and lists; center only titles
- **Don't skimp on size contrast** — titles need 36pt+ to stand out from 14-16pt body
- **Don't default to blue** — pick colors that reflect the specific topic
- **Don't mix spacing randomly** — choose 0.3" or 0.5" gaps and use consistently
- **Don't style one slide and leave the rest plain** — commit fully or keep it simple throughout
- **Don't create text-only slides** — add images, icons, charts, or visual elements; avoid plain title + bullets
- **Don't forget text box padding** — when aligning lines or shapes with text edges, set `margin: 0` on the text box or offset the shape to account for padding
- **Don't use low-contrast elements** — icons AND text need strong contrast against the background
- **NEVER use accent lines under titles** — these are a hallmark of AI-generated slides; use whitespace or background color instead

---

## Windows-Only Disasters (Cross-Platform Encoding)

> **STOP**: If your PowerShell / Windows tooling writes files that Node refuses to parse, this section is for you.

### Symptom: `node compile.js` fails with `SyntaxError: Invalid or unexpected token` on the very first character

```
H:\...\slides\compile.js:1
c

SyntaxError: Invalid or unexpected token
```

### Symptom: PowerShell `Read` tool reports the file as "binary"

The file shows up as `binary` even though it's plain JS. This is because the file is encoded as **UTF-16 LE with BOM** instead of UTF-8.

### Root cause

Several Windows writing paths inject a UTF-16 LE BOM (`FF FE`) or write the entire file as UTF-16:

- Cursor's `Write` tool on PowerShell can inject UTF-16 BOM in some locales
- `Set-Content -Encoding UTF8` in older PowerShell (≤ 5.1) writes **UTF-8 with BOM**
- Some `npm install` package.json parsing fails on BOM

### Quick diagnosis

```powershell
# Check first 3 bytes of any JS / JSON file
$path = "slides\slide-01.js"
$bytes = [System.IO.File]::ReadAllBytes($path)
Write-Host ("0x{0:X2} 0x{1:X2} 0x{2:X2}" -f $bytes[0], $bytes[1], $bytes[2])
```

| First bytes | Encoding | Action |
|-------------|----------|--------|
| `63 6F 6E` (`con`) | UTF-8 no BOM | ✅ Healthy |
| `EF BB BF` then content | UTF-8 with BOM | ⚠️ Strip BOM |
| `FF FE` then `63 00 6F 00` | UTF-16 LE BOM | 🔧 Re-encode to UTF-8 |
| `FE FF` then `00 63` | UTF-16 BE BOM | 🔧 Re-encode to UTF-8 |

### Fix: bulk re-encode UTF-16 → UTF-8 (no BOM)

```powershell
$dir = "slides"
Get-ChildItem -Path $dir -Filter "*.js" | ForEach-Object {
  try {
    $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::Unicode)
    [System.IO.File]::WriteAllText($_.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
  } catch { Write-Host ("Failed: " + $_.Name) }
}
# Repeat for *.json if needed
Get-ChildItem -Path $dir -Filter "*.json" | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::Unicode)
  [System.IO.File]::WriteAllText($_.FullName, $c, (New-Object System.Text.UTF8Encoding($false)))
}
```

### Fix: strip only the BOM (keep content)

```powershell
$path = "slides\package.json"
$content = Get-Content $path -Raw
if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
  $content = $content.Substring(1)
  Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
}
```

### Prevention

- Always end PowerShell file writes with `-Encoding UTF8 -NoNewline`
- For Node package.json files, prefer `Out-File -Encoding ascii` to avoid BOM entirely (ASCII is fine for `package.json` since it should not contain non-ASCII)
- Verify with the first-bytes diagnostic above before running `node compile.js`

---

## Critical Pitfalls — PptxGenJS

> **Single source of truth**: All PptxGenJS runtime errors (hex `#` / opacity-in-hex / async / reused option objects / corrupted-file debugging) are documented in **[troubleshooting.md](troubleshooting.md) → PptxGenJS Errors** with full code examples and fixes. This file intentionally does not duplicate them — when a build fails, jump straight there.

The four "NEVER" rules to internalize:

1. **Never `#` prefix in hex colors** — `"FF0000"` ✓, `"#FF0000"` ✗ (corrupts file)
2. **Never encode opacity in hex strings** — use `opacity` property, not 8-char hex
3. **Never `async` on `createSlide()`** — compile.js does not await
4. **Never reuse option objects** — PptxGenJS mutates in-place; use factory functions

For full context, debugging steps, and the "all slides look identical" quality issues, see [troubleshooting.md](troubleshooting.md).