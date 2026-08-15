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
- DrawingML extents are negative or non-numeric; normalize connector geometry before rendering.

### Warnings

- Deck title below 50pt, slide title below 35pt, mid-level text below 24pt, or body below 16pt when no template overrides the scale.
- Text-heavy slides exceed the density budget selected in `deck-brief.json`. The starter defaults to 100 units for airy decks, 150 for standard decks, and 220 for explicitly high-density decks; render inspection still decides whether the composition is readable.
- Adjacent STORY rows repeat the same layout and visual.
- Raw hex literals are used outside the theme or an explicit neutral-token allowlist.
- A slide has no meaningful visual carrier declared in STORY.

Regex checks may fail only on high-confidence patterns. Ambiguous matches must be warnings. Prefer exported `slideConfig`, runtime metadata, or compiled-PPTX inspection over source-code syntax guesses; static checks must follow local helper imports when evaluating page numbers and visual carriers.

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

## L3 — Native-application gate

For high-stakes decks and decks containing native charts, render with Microsoft PowerPoint when it is available. Preserve `render-manifest.json` and run:

```bash
python scripts/qa-render.py output/rendered --expected <slide-count> --require-engine powerpoint
```

Pay special attention to percentage formats, automatic data labels, legends, font substitution, connector positions, and text wrapping. These commonly differ between a library preview and PowerPoint's renderer. If PowerPoint is unavailable, record the fallback rather than claiming native verification.

## Required sequence

```text
contracts → build → static QA → render all slides → inspect → fix → rerender → package/notes validation → deliver
```

Opening the `.pptx` in a desktop application is optional and never substitutes for rendering.
