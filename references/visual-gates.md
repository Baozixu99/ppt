# Quality Gates

Static checks reduce preventable source defects. Render checks determine whether the deck actually looks correct. Do not call static source checks visual QA.

## L1 — Static and structural gates

### Errors

- Slide module fails to load or does not export synchronous `createSlide`.
- A slide compilation error occurs.
- Output page count differs from the discovered slide-module count.
- A non-cover slide omits `pageBadge` or an equivalent explicit slide number.
- Color strings use a leading `#` in PptxGenJS options.
- Deprecated `pres.shapes` or `pres.charts` APIs are used.
- External quantitative claims have no source record.
- Placeholder tokens remain.

### Warnings

- Deck title below 50pt, slide title below 35pt, mid-level text below 24pt, or body below 16pt when no template overrides the scale.
- Text slide exceeds 80 words or a dense slide exceeds 150 words.
- Adjacent STORY rows repeat the same layout and visual.
- Raw hex literals are used outside the theme or an explicit neutral-token allowlist.
- A slide has no meaningful visual carrier declared in STORY.

Regex checks may fail only on high-confidence patterns. Ambiguous matches must be warnings.

## L2 — Render gates

Render every slide and inspect it at full size for:

- Overflow, clipping, unintended overlap, and unexpected wrapping.
- One-line titles or banners wrapping to two lines.
- Misaligned margins, baselines, grids, footers, and page markers.
- Blurry, distorted, stretched, or poorly cropped assets.
- Broken connectors or connectors crossing nodes and labels.
- Chart labels, legends, axes, totals, and annotations matching the underlying data.
- Unresolved placeholders, empty groups, and orphaned template elements.
- Inconsistent hierarchy, density, typography, or adjacent slide silhouettes.

Use a montage only to inspect overall rhythm. It does not replace full-size inspection.

## Required sequence

```text
build → static QA → render all slides → inspect → fix → rerender → deliver
```

Opening the `.pptx` in a desktop application is optional and never substitutes for rendering.
