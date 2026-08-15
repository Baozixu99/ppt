# Troubleshooting

When something fails, work through this in order. Do NOT retry the same step blindly.

This document covers **PptxGenJS-specific** issues and **slide quality** issues. For general Node.js, npm, or PowerShell problems, consult platform documentation — those are not PPT Skill concerns.

## Contents

- [PptxGenJS errors](#pptxgenjs-errors)
- [Slide quality issues](#slide-quality-issues-after-build-succeeds)
- [When all else fails](#when-all-else-fails)
- [Environment setup issues](#environment-setup-issues)

---

## PptxGenJS Errors

### File generated but wont open / shows "File is corrupt"

Run `scripts/validate-pptx.py` first. In addition to ZIP/XML relationships, it rejects negative DrawingML extents. Negative `w` or `h` values—commonly produced by `to.x - from.x` or `to.y - from.y` for left/up connectors—can create a package that is well-formed XML but cannot be opened by PowerPoint. Use `helpers.addConnector()` or normalize coordinates and arrow direction before calling `addShape`.

Usually one of these:

1. **Hex color with `#`**:
   ```javascript
   color: "#FF0000"  // WRONG — corrupts file
   color: "FF0000"   // CORRECT
   ```

2. **Opacity in hex**:
   ```javascript
   color: "00000020"              // WRONG — corrupts file
   color: "000000", opacity: 0.12 // CORRECT (use opacity property)
   ```

3. **Reused option object**:
   ```javascript
   const shadow = { type: "outer", blur: 6 };
   slide.addShape({ shadow, ... });  // WRONG — PptxGenJS mutates
   slide.addShape({ shadow, ... });  // shadow is now corrupted

   // FIX: factory function
   const makeShadow = () => ({ type: "outer", blur: 6 });
   ```

4. **Async function**:
   ```javascript
   async function createSlide(pres, theme) { ... }  // WRONG
   function createSlide(pres, theme) { ... }         // CORRECT
   ```

If still corrupted, try opening in LibreOffice — it often gives clearer error messages than PowerPoint.

### `addImage` silently fails or shows broken image

- Use absolute path: `path.join(__dirname, "imgs", "hero.jpg")`
- Verify file exists: `fs.existsSync(absPath)` before calling `addImage`
- PptxGenJS can embed SVG data, but SVG compatibility varies across PowerPoint versions. Prefer PNG for maximum compatibility and render-test any SVG before delivery.
- See `safeAddImage` pattern in [resources.md](resources.md)

### Text overflow / wrapping unexpectedly

```javascript
// Option 1: shrink to fit
slide.addText("Long title here", {
  x: 0.5, y: 2, w: 9, h: 1,
  fontSize: 48, fit: "shrink"
});

// Option 2: explicit smaller font
slide.addText("Long title here", {
  x: 0.5, y: 2, w: 9, h: 1,
  fontSize: 32
});

// Option 3: increase text box size
slide.addText("Long title here", {
  x: 0.5, y: 2, w: 9, h: 1.5,
  fontSize: 48
});
```

### PowerShell `cd slides && node compile.js` fails

PowerShell does NOT support `&&`. Either:
- Use `cd slides; node compile.js` (PowerShell uses `;`)
- Or use the `package.json` scripts provided in SKILL.md Step 6: `npm run build`

### Charts render as empty boxes

- Verify chart `type` is one of: BAR, LINE, PIE, DOUGHNUT, SCATTER, BUBBLE, RADAR
- Verify `labels` length == `values` length
- For stacked charts, need >= 2 series
- See [chart-schemas.md](chart-schemas.md)

---

## Slide Quality Issues (After Build Succeeds)

### All slides look identical

**Cause**: Same layout used for every slide.

**Fix**: Apply layout variety per slide type:
- Cover — large centered title
- TOC — vertical list or card grid
- Content — 2-column or icon rows
- Timeline — horizontal step flow (see [slide-types.md](slide-types.md))
- Comparison — symmetric cards
- Summary — centered takeaways

### Title looks too small relative to body

**Cause**: Body font >= 16pt while title is < 36pt.

**Fix**:
- Title: 36-44pt for content, 60-120pt for cover
- Body: 14-16pt
- Caption: 10-12pt
- Always maintain 2x+ size ratio between title and body

### Accent line under every title (AI tell)

**Cause**: Tendency to add decorative lines.

**Fix**: NEVER use accent lines under titles. Use whitespace or background color variation instead.

### Bullet text wraps awkwardly

- Keep bullets to 8-12 words max
- Use 2-column layout for long bullet lists
- Break into multiple slides if > 5 bullets

---

## When All Else Fails

1. Delete `node_modules` and reinstall:
   ```bash
   cd slides
   rm -rf node_modules package-lock.json   # Linux/macOS
   # Windows PowerShell:
   Remove-Item -Recurse node_modules, package-lock.json
   npm install
   ```

2. Run with verbose logging:
   ```bash
   DEBUG=pptxgenjs npm run build
   ```

3. Inspect output XML:
   ```bash
   unzip -o output/presentation.pptx -d debug/
   cat debug/ppt/slides/slide1.xml | head -100
   ```

4. Report bug with: `node --version`, `npm list pptxgenjs`, OS version, minimal reproduction.

---

## Environment Setup Issues

### A text-extraction utility is unavailable

Text extraction is optional and does not replace render QA. Use the Node-only `qa.js` shipped in the [starter deck](build-config.md#starter-deck-assets) for source, STORY, package, placeholder, and density checks. Use `scripts/render-slides.py` plus `scripts/qa-render.py` for the mandatory visual path.

### `npm install` fails with `EPERM` on Windows

The default npm cache directory lacks write permissions. Fix:

```bash
npm install --cache ./.npm-cache
```

Or set permanently:

```bash
npm config set cache ./.npm-cache --userconfig ./.npmrc
```

Add `.npm-cache/` to `.gitignore`. Full details are in [build-config.md → Windows npm cache fallback](build-config.md#windows-npm-cache-fallback).

### `node compile.js` fails with `SyntaxError: Invalid or unexpected token` on first character

UTF-16 LE BOM was injected by some Windows write path. Diagnose:

```powershell
$path = "slides\slide-01.js"
$bytes = [System.IO.File]::ReadAllBytes($path)
Write-Host ("0x{0:X2} 0x{1:X2}" -f $bytes[0], $bytes[1])
```

`0xFF 0xFE` = UTF-16 LE BOM. Fix with the bulk re-encode script in [pitfalls.md → §Windows-Only Disasters](pitfalls.md#windows-only-disasters-cross-platform-encoding).

### Chinese characters render as boxes (□□□) on reviewer's machine

`Microsoft YaHei` is missing from the reviewer's system. Select one real installed font for the build platform; do not pass a comma-separated CSS list. See [design-system.md → §Cross-Platform Font Selection](design-system.md#cross-platform-font-selection).

```javascript
// Platform-selected single font name
fontFace: helpers.FONTS.cn
```

The platform font selector is defined in `_helpers.js`; see [build-config.md](build-config.md#shared-helpers).
