# QA Process and Common Pitfalls

This file is the operational checklist for generated decks. Detailed thresholds live in [visual-gates.md](visual-gates.md); build commands live in [build-config.md](build-config.md); runtime failure diagnosis lives in [troubleshooting.md](troubleshooting.md).

## Mandatory Verification Loop

Do not declare success after `npm run build` alone.

1. Run `npm run build` and stop on the first failed slide.
2. Run `npm run qa`; fix every error and review warnings.
3. Render the complete deck with `scripts/render-slides.py`.
4. Run `scripts/qa-render.py` and create a montage.
5. Inspect every slide for clipping, overlap, broken media, contrast, hierarchy, and narrative continuity.
6. Rebuild and repeat until the checks pass.

Lite mode may simplify STORY planning, but it never skips build, source, or render verification.

## Content Checks

- Slide count matches STORY or the approved Lite plan.
- No placeholder text remains: `TODO`, `TBD`, `XXXX`, `Lorem ipsum`, or template instructions.
- Every slide has one clear takeaway; the title and dominant visual support it.
- Data slides state both the evidence and the conclusion.
- Dates, units, labels, section numbers, and page badges are coherent.
- Every externally sourced claim, chart, image, and quotation is attributable.
- Source identifiers used in slide modules exist in `sources.json` and are written to speaker notes.

## Visual Checks

- Inspect the montage first for rhythm, repeated layouts, hero-page distribution, and section boundaries.
- Inspect individual slide renders for text overflow, unintended overlap, cropped images, and broken glyphs.
- Confirm the minimum type hierarchy defined in [visual-gates.md](visual-gates.md).
- Do not rely on source-code coordinates alone: PowerPoint rendering is the final judge.
- Treat an empty automated report as necessary evidence, not proof that the deck looks good.

## Common Design Failures

- Repeating the same layout on adjacent content slides.
- Center-aligning paragraphs or long lists.
- Using title and body sizes with weak contrast.
- Adding decorative elements that do not support the message.
- Creating text-only slides when a chart, image, diagram, or quantified callout would communicate faster.
- Mixing spacing rules, corner radii, icon styles, or unrelated color accents.
- Placing a generic accent line under every title.
- Using low-resolution images or stretching them without preserving aspect ratio.

## PptxGenJS Guardrails

The starter `qa.js` checks the source rules that are reliably detectable:

1. Use six-digit hex values without a `#` prefix in PptxGenJS options.
2. Express transparency with the supported transparency option instead of eight-digit color strings.
3. Keep `createSlide()` synchronous; the compiler intentionally rejects async slide factories.
4. Create fresh option objects when a library call may mutate them.
5. Use current namespaces such as `pres.ShapeType.rect` and `pres.ChartType.bar`.
6. Record chart and claim sources with `helpers.addSources()` rather than a footer alone.

See [troubleshooting.md](troubleshooting.md#pptxgenjs-errors) for failure diagnosis.

## File Health After Editing

Generated JavaScript, JSON, and Markdown files must be UTF-8 text. After a bulk or Windows-based edit, verify:

- the line count is plausible;
- the first bytes are not `FF FE` or `FE FF`;
- the first few lines render as normal text;
- `node --check` succeeds for changed JavaScript files.

PowerShell diagnosis:

```powershell
$path = "slides\slide-01.js"
$bytes = [System.IO.File]::ReadAllBytes($path)
Write-Host ("0x{0:X2} 0x{1:X2} 0x{2:X2}" -f $bytes[0], $bytes[1], $bytes[2])
Get-Content -Path $path -TotalCount 5
node --check $path
```

| First bytes | Meaning | Action |
|---|---|---|
| Ordinary ASCII/UTF-8 bytes | Healthy | Continue |
| `EF BB BF` | UTF-8 BOM | Strip the BOM if a consumer rejects it |
| `FF FE` | UTF-16 LE | Re-encode as UTF-8 without BOM |
| `FE FF` | UTF-16 BE | Re-encode as UTF-8 without BOM |

Prefer repository editing tools or an explicit UTF-8 writer. Never repair encoding by guessing the original character set after content has already been corrupted; restore from a known-good copy first.

## Completion Gate

A deck is complete only when all of the following are true:

- build exits successfully and leaves no partial output;
- static QA has no errors;
- PPTX package validation succeeds;
- rendered page count equals expected slide count;
- every rendered slide has been visually reviewed;
- the final `.pptx`, source manifest, and any requested previews are delivered.
