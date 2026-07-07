---
name: pptx-generator
description: "Generate, edit, and read PowerPoint presentations. Create from scratch with PptxGenJS (cover, TOC, content, section divider, summary slides), edit existing PPTX via XML workflows, or extract text with markitdown. Also: learn from reference slides via multi-dimensional design analysis. Triggers: PPT, PPTX, PowerPoint, presentation, slide, deck, slides, 参考图, 学习风格, 分析布局, 提取配色."
description_zh: "PowerPoint 演示文稿生成与设计学习"
description_en: "Generate and edit PowerPoint presentations, learn from reference slides"
version: 1.1.0
license: MIT
metadata:
  version: "1.1"
  category: productivity
  sources:
    - https://gitbrent.github.io/PptxGenJS/
    - https://github.com/microsoft/markitdown
---

# PPTX Generator & Editor（个人定制版）

## Overview

This skill has **two modes**:

| Mode | When to use | Guide |
|------|-------------|-------|
| 🎨 **学习模式** | 用户发送参考PPT截图/文件，想学习其设计 | [Design Analysis](references/design-analysis.md) |
| 🔧 **创作模式** | 从零生成PPT，或基于模板编辑 | 见下方工作流 |

---

## 模式判断（自动）

收到用户消息时，按以下规则自动判断进入哪个模式：

| 用户意图 | 关键词 | 进入模式 |
|----------|--------|:--------:|
| 发参考图让分析 | "参考这个""学习这个风格""分析这张""看看这张PPT" | 🎨 学习模式 |
| 发参考图只提取某维度 | "只学配色""布局不错配色不好""帮我提取配色方案" | 🎨 学习模式 |
| 多张参考图融合 | "综合这几张""取各自好的部分" | 🎨 学习模式 |
| 创建/生成PPT | "做一个PPT""生成演示文稿""帮我写slides" | 🔧 创作模式 |
| 编辑已有PPT | "修改这个PPT""改一下第3页" | 🔧 创作模式 |
| 模糊地带 | "帮我优化""看看怎么改""做一份和这个差不多的" | **用 AskQuestion tool 澄清后再决定** |

---

## Quick Reference

| Task | Approach |
|------|----------|
| 从参考图学习设计 | See [Design Analysis](references/design-analysis.md) |
| Read/analyze content | `python -m markitdown presentation.pptx` (fallback: `python qa.py` via python-pptx — see [pitfalls.md](references/pitfalls.md#qa-tool-fallback-when-markitdown-fails)) |
| Edit or create from template | See [Editing Presentations](references/editing.md) |
| Create from scratch | See [Creating from Scratch](#creating-from-scratch-workflow) below |
| Use shared boilerplate (page badge, header, KPI) | Define once in `_helpers.js` — see [build-config.md](references/build-config.md#slides_helpersjs-shared-reusable-components) |
| Keep paper numbers out of slide code | Store in `slides/_data/*.js` — see [data-layer.md](references/data-layer.md) |
| Map slide headers to paper sections | See [academic-patterns.md → §Section Number Mapping](references/academic-patterns.md#section-number-mapping-convention) |

| Item | Value |
|------|-------|
| **Dimensions** | 10" x 5.625" (LAYOUT_16x9) |
| **Colors** | 6-char hex without # (e.g., `"FF0000"`) — NEVER `"#FF0000"` |
| **English font** | Arial (default) — chain: `Arial, Helvetica, sans-serif` |
| **Chinese font** | Microsoft YaHei — **chain**: `'Microsoft YaHei, PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif'` |
| **Page badge position** | x: 9.3", y: 5.1" |
| **Theme keys** | `primary`, `secondary`, `accent`, `light`, `bg` (exactly these, no substitutes) |
| **Shapes** | RECTANGLE, OVAL, LINE, ROUNDED_RECTANGLE |
| **Charts** | BAR, LINE, PIE, DOUGHNUT, SCATTER, BUBBLE, RADAR |
| **Node version** | >= 18.0.0 |
| **OS** | Windows / macOS / Linux (all paths cross-platform compatible) |
| **File encoding** | UTF-8 **without BOM** — see [pitfalls.md → §Windows-Only Disasters](references/pitfalls.md#windows-only-disasters-cross-platform-encoding) |

## Reference Files

| File | Contents |
|------|----------|
| [design-analysis.md](references/design-analysis.md) | 🆕 从参考PPT中多维度学习：布局/配色/字体/组件/叙事结构（10维度评分体系 + Design Fusion） |
| [slide-types.md](references/slide-types.md) | 5 slide page types (Cover, TOC, Section Divider, Content, Summary) + Section 6-8 extensions |
| [academic-patterns.md](references/academic-patterns.md) | 🆕 Specialized layouts (Academic Header, Top KPI Strip, Multi-Card 9-Grid, Comparison + Footer Banner) + **Section Number Mapping Convention** |
| [design-system.md](references/design-system.md) | Color palettes, font reference (incl. **cross-platform fallback chain**), style recipes (Sharp/Soft/Rounded/Pill), typography & spacing |
| [editing.md](references/editing.md) | Template-based editing workflow, XML manipulation, formatting rules, common pitfalls |
| [pitfalls.md](references/pitfalls.md) | QA process, mandatory **6-item checklist**, common mistakes, critical PptxGenJS pitfalls, **Windows encoding disasters** |
| [pptxgenjs.md](references/pptxgenjs.md) | Complete PptxGenJS API reference |
| [resources.md](references/resources.md) | 🆕 Image/icon/data source acquisition, asset whitelist |
| [chart-schemas.md](references/chart-schemas.md) | 🆕 Data schema for BAR/LINE/PIE/DOUGHNUT charts |
| [troubleshooting.md](references/troubleshooting.md) | 🆕 PptxGenJS errors + slide quality issues + environment setup (markitdown / npm cache / encoding) |
| [sensitive-info.md](references/sensitive-info.md) | 🆕 PII / HR / Financial detection + anonymization protocol |
| [build-config.md](references/build-config.md) | 🆕 package.json + compile.js templates (avoids PowerShell `&&`) + **shared `_helpers.js`** + **Node-only `qa.js`** + **Windows cache workaround** |
| [data-layer.md](references/data-layer.md) | 🆕 Data–view separation pattern — keep paper numbers in `_data/`, not in slide files |
| [domain-templates/academic-os-systems.md](references/domain-templates/academic-os-systems.md) | 🆕 Standard narrative arc + slide-by-slide template for OS / Virtualization / Real-time Systems papers |

---

## Reading Content

```bash
# Text extraction
python -m markitdown presentation.pptx
```

---

## Creating from Scratch — Workflow

**Use when no template or reference presentation is available.**

### Step 1: Research & Requirements

Search to understand user requirements — topic, audience, purpose, tone, content depth.

### Step 1.5: Resource Acquisition (REQUIRED for content slides)

Before generating any slide that needs an image, **collect assets first**. See [references/resources.md](references/resources.md) for the full source priority table.

**Quick priority** (topic photo / icon / data / formula): user-provided → Unsplash / Picsum / Pexels → react-icons / Heroicons → user CSV/JSON → Unicode text → themed placeholder.

**Do NOT use emoji as primary visual element.**

### Unsupported Input Formats — Decision Tree

When user input contains content the Skill cannot natively render (LaTeX, chemical structures, circuit diagrams, hand-drawn sketches, foreign scripts without installed fonts):

1. **Detect** the format gap explicitly in your response — do not silently proceed
2. **Apply** the fallback strategy from [resources.md](references/resources.md) matching that content type
3. **Declare** the substitution in a small caption at slide bottom (e.g., `"Notation: formulas rendered as Unicode text"`)
4. **Never** invent fake content to fill the gap (e.g., don't fabricate chart data)
5. **Never** silently downgrade without telling the user

### Step 2: Select Color Palette & Fonts

Use the [Color Palette Reference](references/design-system.md#color-palette-reference) to select a palette matching the topic and audience. Use the [Font Reference](references/design-system.md#font-reference) to choose a font pairing.

### Step 3: Select Design Style

Use the [Style Recipes](references/design-system.md#style-recipes) to choose a visual style (Sharp, Soft, Rounded, or Pill) matching the presentation tone.

### Step 4: Plan Slide Outline

Classify **every slide** as exactly one of the [5 page types](references/slide-types.md). Plan the content and layout for each slide. Ensure visual variety — do NOT repeat the same layout across slides.

**Slide budget heuristic** (when user doesn't specify):
| Input Size | Recommended Slides |
|------------|-------------------|
| ≤500 words or 1 topic | 5-8 |
| 500-3000 words / 5-10 page paper | 8-12 |
| 3000-10000 words / 10-30 page paper | 18-25 |
| >10000 words / >30 pages | 25-35 (compress, don't truncate major sections) |
| "1 slide" with >300 words | **Refuse or split** — see Conflict Resolution below |

**Per-slide word budget**: title ≤12 words; body 50-80 words for text slides; ≤150 words for dense data slides. A slide needing >150 words should split.

### Conflict Resolution (when user constraints contradict)

When user requirements are internally inconsistent or contradict Skill constraints (theme contract, font rules, layout dims), in order of preference:

1. **Push back** — state the conflict and ask one clarifying question (preferred for adversarial/contradictory inputs like "all different themes" + "cohesive deck")
2. **Propose defaults** — explain trade-offs, offer a coherent interpretation, proceed with the user's blessing (acceptable for moderate conflicts)
3. **Apply priorities** — without asking, prefer: facts > user-narrative, theme contract > per-slide variation, visual coherence > literal compliance. Document the substitution on a slide-bottom caption.

**Never** silently violate the theme contract to satisfy a per-slide "different theme" request — that destroys Knowledge Architecture Stability.

### Sensitive Information Handling (PII / HR / Financial)

Apply BEFORE Step 5 when input contains PII, HR, or sensitive financial data. Runs **parallel** to Conflict Resolution.

**Quick rules**: detect (real names in HR/medical, financial details, M&A, layoffs) → push back & ask scope → suggest anonymization (roles not names, rounded figures) → add `"Confidential — Internal Use Only"` footer only when user insists on verbatim PII.

Full detection checklist, protocol priority, and worked examples: **[references/sensitive-info.md](references/sensitive-info.md)**.

### Step 5: Generate Slide JS Files

Create one JS file per slide in `slides/` directory. Each file must export a synchronous `createSlide(pres, theme)` function. Follow the [Slide Output Format](#slide-output-format) and the type-specific guidance in [slide-types.md](references/slide-types.md). Generate up to 5 slides concurrently using subagents if available.

**Tell each subagent:**
1. File naming: `slides/slide-01.js`, `slides/slide-02.js`, etc.
2. Images go in: `slides/imgs/`
3. Final PPTX goes in: `slides/output/`
4. Dimensions: 10" x 5.625" (LAYOUT_16x9)
5. Fonts: Chinese = Microsoft YaHei, English = Arial (or approved alternative)
6. Colors: 6-char hex without # (e.g. `"FF0000"`)
7. Must use the theme object contract (see [Theme Object Contract](#theme-object-contract))
8. Must follow the [PptxGenJS API reference](references/pptxgenjs.md)

### Step 6: Compile into Final PPTX

Create `slides/package.json` + `slides/compile.js` using the templates in **[references/build-config.md](references/build-config.md)**. Then run:

```bash
cd slides
npm install      # one-time
npm run build    # compile to PPTX
npm run qa       # build + extract text for QA
```

**Why templates in a separate file**: `package.json` + `compile.js` are 60+ lines of boilerplate. Keeping them in `build-config.md` shrinks the main entry without losing the reference.

### Step 7: QA (Required)

See [QA Process](references/pitfalls.md#qa-process).

### Output Structure

```
slides/
├── slide-01.js          # Slide modules
├── slide-02.js
├── ...
├── imgs/                # Images used in slides
└── output/              # Final artifacts
    └── presentation.pptx
```

---

## Slide Output Format

Each slide is a **complete, runnable JS file**:

```javascript
// slide-01.js
const pptxgen = require("pptxgenjs");

const slideConfig = {
  type: 'cover',
  index: 1,
  title: 'Presentation Title'
};

// MUST be synchronous (not async)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText(slideConfig.title, {
    x: 0.5, y: 2, w: 9, h: 1.2,
    fontSize: 48, fontFace: "Arial",
    color: theme.primary, bold: true, align: "center"
  });

  return slide;
}

// Standalone preview - use slide-specific filename
if (require.main === module) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  const theme = {
    primary: "22223b",
    secondary: "4a4e69",
    accent: "9a8c98",
    light: "c9ada7",
    bg: "f2e9e4"
  };
  createSlide(pres, theme);
  pres.writeFile({ fileName: "slide-01-preview.pptx" });
}

module.exports = { createSlide, slideConfig };
```

---

## Theme Object Contract (MANDATORY)

The compile script passes a theme object with these **exact keys**:

| Key | Purpose | Example |
|-----|---------|---------|
| `theme.primary` | Darkest color, titles | `"22223b"` |
| `theme.secondary` | Dark accent, body text | `"4a4e69"` |
| `theme.accent` | Mid-tone accent | `"9a8c98"` |
| `theme.light` | Light accent | `"c9ada7"` |
| `theme.bg` | Background color | `"f2e9e4"` |

**NEVER use other key names** like `background`, `text`, `muted`, `darkest`, `lightest`.

---

## Page Number Badge (REQUIRED)

All slides **except Cover Page** MUST include a page number badge in the bottom-right corner.

- **Position**: x: 9.3", y: 5.1"
- Show current number only (e.g. `3` or `03`), NOT "3/12"
- Use palette colors, keep subtle

### Circle Badge (Default)

```javascript
slide.addShape(pres.shapes.OVAL, {
  x: 9.3, y: 5.1, w: 0.4, h: 0.4,
  fill: { color: theme.accent }
});
slide.addText("3", {
  x: 9.3, y: 5.1, w: 0.4, h: 0.4,
  fontSize: 12, fontFace: "Arial",
  color: "FFFFFF", bold: true,
  align: "center", valign: "middle"
});
```

### Pill Badge

```javascript
slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 9.1, y: 5.15, w: 0.6, h: 0.35,
  fill: { color: theme.accent },
  rectRadius: 0.15
});
slide.addText("03", {
  x: 9.1, y: 5.15, w: 0.6, h: 0.35,
  fontSize: 11, fontFace: "Arial",
  color: "FFFFFF", bold: true,
  align: "center", valign: "middle"
});
```

---

## Dependencies

| Tool | Install Command | Required For | Cross-Platform |
|------|----------------|--------------|----------------|
| `markitdown` (with pptx) | `pip install "markitdown[pptx]"` | Reading PPTX content | ✅ All OS |
| `pptxgenjs` (>= 3.12) | `npm install pptxgenjs` (in `slides/`) | Creating PPTX | ✅ All OS |
| `react-icons` (optional) | `npm install react-icons react react-dom sharp` | Icon rendering | ⚠️ Sharp needs native build |
| Node.js | >= 18.0.0 (verify with `node --version`) | Runtime | ✅ All OS |

**Windows users**: Install Node.js from [nodejs.org](https://nodejs.org/) (LTS recommended). Verify with `node --version` in PowerShell.

**Why local `npm install` instead of `npm install -g`?**
- Avoids permission prompts on macOS/Linux
- Each project pins its own pptxgenjs version
- No global PATH pollution

### Pre-flight Check (run once before first use)

```bash
node --version              # must be >= 18
npm --version               # must be >= 9
python --version            # must be >= 3.9 (for markitdown)
python -m markitdown --help # smoke test
```

If any command fails, see [Troubleshooting](references/troubleshooting.md).
