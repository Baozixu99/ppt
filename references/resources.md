# Resource Acquisition

Every slide that needs visual content MUST source assets through this workflow. Do NOT skip this step — placeholder visuals are the #1 cause of low-quality AI-generated decks.

## Contents

- [Asset priority order](#asset-priority-order)
- [Image sources](#image-sources)
- [Icon sources](#icon-sources)
- [Data sources](#data-sources)
- [Scientific notation and formulas](#scientific-notation--formulas)
- [Asset quality rules](#asset-quality-rules)
- [Image insertion pattern](#image-insertion-pattern-pptxgenjs)

## Asset Priority Order

For any visual element, follow this priority:

1. **User-provided** — if the user attached files, use them first
2. **Verified online source** — see source whitelist below
3. **Editable native shapes** — preferred for technical diagrams, processes, architecture, and structural visuals
4. **Generated for the task** — use an image-generation tool only when a bitmap illustration materially improves the slide

Missing required assets are build errors. Do not silently substitute a placeholder in a final deck.

## Image Sources

| Source | Best For | License | How to Get |
|--------|----------|---------|------------|
| User-provided files | Exact matches | N/A | Copy to `slides/imgs/` |
| Unsplash API | Topic photos | Unsplash License and API terms | Requires API access, photographer attribution, and download tracking |
| Pexels API | Curated stock photos | Pexels License and API terms | Requires an API key and attribution review |
| Image search | Specific subjects or current events | Source-specific | Verify the original page, author, license, and permitted use |
| Image generation | Illustrative or abstract visuals | Tool-specific | Preserve the prompt and applicable usage terms |

Do not use the retired `source.unsplash.com` endpoint. Do not label search results as license-free without checking the original asset page.

## Icon Sources

NEVER use emoji as a primary icon. Emoji render inconsistently across PowerPoint versions and break slide consistency.

| Source | Best For | Format | Integration |
|--------|----------|--------|-------------|
| Heroicons | Modern UI icons | SVG | Copy inline SVG, convert to PptxGenJS shapes |
| react-icons | Comprehensive icon sets | React component | Pre-render to SVG, then shapes |
| Lucide | Clean line icons | SVG | Same as Heroicons |
| Inline SVG to shapes | Custom icons | SVG path | Convert paths to PptxGenJS shape calls |

### Icon Rendering Pattern (PptxGenJS)

Since PptxGenJS does not render arbitrary SVG paths cleanly, use this pattern:

```javascript
// Use simple shape compositions as icon substitutes
function renderIconCircle(slide, pres, theme, x, y, size, color) {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: size, h: size,
    fill: { color: color || theme.accent }
  });
}

function renderNumberedIcon(slide, pres, theme, x, y, num, size) {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: size, h: size,
    fill: { color: theme.accent }
  });
  slide.addText(String(num), {
    x, y, w: size, h: size,
    fontSize: 16, bold: true, color: "FFFFFF",
    align: "center", valign: "middle"
  });
}
```

## Data Sources

For charts and statistics:

| Source | Format | Best For |
|--------|--------|----------|
| User-provided CSV/JSON | Direct | Authoritative data |
| WebSearch result | Parse manually | Industry reports, public stats |
| Pre-defined JSON template | `slides/_data/*.json` | Recurring deck structures |

### Data File Convention

Place data files in `slides/_data/`:

```
slides/
  _data/
    chart-01-revenue.json
    chart-02-growth.json
    table-01-team.json
  slide-01.js
  slide-02.js
  compile.js
```

Each chart JSON follows [chart-schemas.md](chart-schemas.md).

## Scientific Notation / Formulas

**PptxGenJS does NOT render LaTeX/MathML.** When the user provides equations, chemical formulas, or scientific notation:

| Priority | Strategy | When to Use |
|:--------:|----------|-------------|
| 1 | **Unicode text** — write formula as Unicode strings (`"σ(z) = 1/(1+e⁻ᶻ)"`) inside `addText` with `fontFace: "Cambria Math"` or `"Arial"` | Default for ≤10 formulas, simple expressions, or inline math |
| 2 | **Multi-line styled text** — break formula into numerator/denominator lines using separate `addText` boxes stacked vertically | When formula has stacked fractions, sums, matrices |
| 3 | **Pre-rendered image (PNG)** — use a local KaTeX/MathJax CLI (out of Skill scope) to render LaTeX → PNG, then `safeAddImage` | Only when formula is large/complex AND user explicitly approves extra tooling |

**Never:**
- Pretend a formula was rendered when it wasn't (no fake "rendered successfully" claims)
- Embed raw LaTeX source like `"$L = -\frac{1}{N}\sum..."` into `addText` — PptxGenJS will display literal `$`, `\frac`, etc.
- Mix LaTeX source with rendered output within the same deck

**Source code blocks** (Python, SQL, pseudocode) use a monospace font: `"Consolas"` or `"Courier New"`, in a rounded-rectangle container with `theme.light` background. NEVER use a serif body font for code.

## Asset Quality Rules

MUST:
- Verify all images exist before generating slide JS
- Use `fs.existsSync(path)` to check before `addImage`
- Match image aspect ratio to the target container (4:3, 16:9, 1:1)
- Optimize large images (>2MB) to <500KB for fast PPTX loading

NEVER:
- Use emoji as visual elements in slides
- Use placeholder.com or similar watermark services
- Embed images via URL — always download to `slides/imgs/` first
- Reference external network paths in the final PPTX (offline-friendly)

## Image Insertion Pattern (PptxGenJS)

For an externally sourced image, prefer the starter helper so the image alt text and speaker notes carry the same source ID:

```javascript
helpers.addSourcedImage(slide, ['image-source-id'], {
  path: absPath, x: 1, y: 1, w: 5, h: 3,
  altText: 'Audience-facing description'
});
```

The corresponding record must exist in `sources.json`.

```javascript
const fs = require("fs");
const path = require("path");

function safeAddImage(slide, pres, theme, relativePath, options) {
  const absPath = path.join(__dirname, relativePath);
  if (!fs.existsSync(absPath)) {
    throw new Error("Required image is missing: " + relativePath);
  }
  slide.addImage({ path: absPath, x: options.x, y: options.y, w: options.w, h: options.h });
  return true;
}
```

