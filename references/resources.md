# Resource Acquisition

Every slide that needs visual content MUST source assets through this workflow. Do NOT skip this step — placeholder visuals are the #1 cause of low-quality AI-generated decks.

## Asset Priority Order

For any visual element, follow this priority:

1. **User-provided** — if the user attached files, use them first
2. **Verified online source** — see source whitelist below
3. **Generated on-the-fly** — SVG drawn directly in PptxGenJS using shapes
4. **LAST RESORT**: themed placeholder (text + accent shape only)

## Image Sources

| Source | Best For | License | How to Get |
|--------|----------|---------|------------|
| User-provided files | Exact matches | N/A | Copy to `slides/imgs/` |
| Unsplash Source | Topic photos | Free (Unsplash License) | `curl "https://source.unsplash.com/featured/?keyword" -o img.jpg` |
| Picsum | Placeholder photos | Free (CC0) | `curl "https://picsum.photos/800/600" -o img.jpg` |
| Pexels API | Curated stock photos | Free | Requires API key (free tier) |
| WebSearch | Specific current events | N/A | Use sparingly, verify licensing |

### Unsplash Source Example

```bash
# Cross-platform — works in PowerShell, bash, zsh
mkdir -p slides/imgs
curl -L "https://source.unsplash.com/featured/?technology,800x600" -o slides/imgs/tech-hero.jpg
```

### Picsum (Always-works fallback)

```bash
# Deterministic by seed — same image every time
curl -L "https://picsum.photos/seed/cover-hero/800/600" -o slides/imgs/cover.jpg
```

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
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: size, h: size,
    fill: { color: color || theme.accent }
  });
}

function renderNumberedIcon(slide, pres, theme, x, y, num, size) {
  slide.addShape(pres.shapes.OVAL, {
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
| Pre-defined JSON template | `slides/data/*.json` | Recurring deck structures |

### Data File Convention

Place data files in `slides/data/`:

```
slides/
  data/
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

```javascript
const fs = require("fs");
const path = require("path");

function safeAddImage(slide, pres, theme, relativePath, options) {
  const absPath = path.join(__dirname, relativePath);
  if (!fs.existsSync(absPath)) {
    console.warn("Image missing: " + relativePath + " — using fallback shape");
    slide.addShape(pres.shapes.RECTANGLE, Object.assign({}, options, {
      fill: { color: theme.light },
      line: { color: theme.accent, width: 1, dashType: "dash" }
    }));
    slide.addText("[Image Placeholder]", Object.assign({}, options, {
      fontSize: 10, color: theme.secondary,
      align: "center", valign: "middle", bold: false
    }));
    return false;
  }
  slide.addImage({ path: absPath, x: options.x, y: options.y, w: options.w, h: options.h });
  return true;
}
```

