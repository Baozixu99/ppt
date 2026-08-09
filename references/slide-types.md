# Slide Page Types

Classify **every slide** as **exactly one** of these 5 types:

## 1. Cover Page

- **Use for**: Opening + tone setting
- **Content**: Big title, subtitle/presenter, date/occasion, strong background/motif

### Layout Options

**Asymmetric Left-Right Layout**
- Text concentrated on one side, image on the opposite
- Best for: Corporate presentations, product launches, professional reports
```
|  Title & Subtitle  |    Visual/Image    |
|  Description       |                    |
```

**Center-Aligned Layout**
- Content centered with background image
- Best for: Inspirational talks, event presentations, creative pitches
```
|                                        |
|           [Background Image]           |
|              MAIN TITLE                |
|              Subtitle                  |
|                                        |
```

### Font Size Hierarchy

| Element | Recommended Size | Ratio to Base |
|---------|-----------------|---------------|
| Main Title | 72-120px | 3x-5x |
| Subtitle | 28-40px | 1.5x-2x |
| Supporting Text | 18-24px | 1x (base) |
| Meta Info (date, name) | 14-18px | 0.7x-1x |

**Key Principles:**
1. **Dramatic Contrast**: Main title should be at least 2-3x larger than subtitle
2. **Visual Anchor**: The largest text becomes the focal point
3. **Readable Hierarchy**: Viewers should instantly understand what's most important
4. **Avoid Similarity**: Never let adjacent text elements be within 20% of each other's size

### Content Elements

1. **Main Title** — Always required, largest font
2. **Subtitle** — When additional context is needed (clearly smaller than title)
3. **Icons** — When they reinforce the theme
4. **Date/Event Info** — When relevant (smallest text)
5. **Company/Brand Logo** — When representing an organization
6. **Presenter Name** — For keynotes (small, subtle)

### Design Decisions

Consider: Purpose (corporate/educational/creative), Audience, Tone, Content Volume, Visual Assets needed.

### Workflow

1. **Analyze**: Understand topic, audience, purpose
2. **Choose Layout**: Select based on content
3. **Write Slide**: Use PptxGenJS. Use shapes and SVG elements for visual interest.
4. **Verify**: Build the deck, run `npm run qa`, then inspect the rendered slide for complete content, placeholders, clipping, and overlap.

---

## 2. Table of Contents

- **Use for**: Navigation + expectation setting (3-5 sections)
- **Content**: Section list (optional icons / page numbers)

### Layout Options

**Numbered Vertical List** — Best for 3-5 sections, straightforward presentations
```
|  TABLE OF CONTENTS            |
|                                |
|  01  Section Title One         |
|  02  Section Title Two         |
|  03  Section Title Three       |
```

**Two-Column Grid** — Best for 4-6 sections, content-rich presentations
```
|  TABLE OF CONTENTS              |
|                                  |
|  01  Section One   02  Section Two  |
|      Description       Description  |
|  03  Section Three 04  Section Four |
```

**Sidebar Navigation** — Best for 3-5 sections, modern/corporate
```
| ▌01 |  Section Title One           |
| ▌02 |  Section Title Two           |
| ▌03 |  Section Title Three         |
```

**Card-Based** — Best for 3-4 sections, creative/modern
```
|  TABLE OF CONTENTS                    |
|  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  |
|  │ 01  │  │ 02  │  │ 03  │  │ 04  │  |
|  │Title│  │Title│  │Title│  │Title│  |
|  └─────┘  └─────┘  └─────┘  └─────┘  |
```

### Font Size Hierarchy

| Element | Recommended Size | Ratio to Base |
|---------|-----------------|---------------|
| Page Title ("Table of Contents" / "Agenda") | 36-44px | 2.5x-3x |
| Section Number | 28-36px | 2x-2.5x |
| Section Title | 20-28px | 1.5x-2x |
| Section Description | 14-16px | 1x (base) |

**Key Principles:**
1. **Clear Numbering**: Section numbers should be visually prominent — bold, accent color, or larger size
2. **Scannable Structure**: Viewer should scan all sections in 2-3 seconds
3. **Consistent Spacing**: Equal vertical spacing between sections
4. **Visual Markers**: Colored dots, lines, numbers, or icons to anchor each section
5. **Avoid Clutter**: Descriptions one line max or omit entirely

### Content Elements

1. **Page Title** — Always required ("Table of Contents", "Agenda", "Overview")
2. **Section Numbers** — Consistent format (01, 02... or I, II...)
3. **Section Titles** — Clear and concise
4. **Section Descriptions** — Optional one-line summaries
5. **Visual Separators** — SVG dividers or spacing
6. **Decorative Elements** — Subtle accent shapes
7. **Page Number Badge** — **MANDATORY**

### Design Decisions

1. **Section Count**: 3 → vertical list; 4-6 → grid or compact; 7+ → multi-column
2. **Description Length**: Long → vertical list; None → compact grid/cards
3. **Tone**: Corporate → numbered list; Creative → card-based; Academic → Roman numerals
4. **Consistency**: Match visual style of cover page

### Workflow

1. **Analyze**: Section list, count, presentation context
2. **Choose Layout**: Based on section count and content
3. **Plan Visual Hierarchy**: Numbering style, font sizes, spacing
4. **Write Slide**: Use PptxGenJS. Use shapes for decorative elements. **MUST include page number badge.**
5. **Verify**: Run static QA, then inspect the rendered slide for complete content and the required page badge.

---

## 3. Section Divider

- **Use for**: Clear transitions between major parts
- **Content**: Section number + title (+ optional 1-2 line intro)

### Layout Options

**Bold Center** — Best for minimal, modern presentations
```
|                  02                    |
|           SECTION TITLE               |
|         Optional intro line           |
```

**Left-Aligned with Accent Block** — Best for corporate, structured presentations
```
| ████ |  02                            |
| ████ |  SECTION TITLE                 |
| ████ |  Optional intro line           |
```

**Split Background** — Best for high-contrast, dramatic transitions
```
| ██████████ |     SECTION TITLE        |
| ██  02  ██ |     Optional intro       |
| ██████████ |                          |
```

**Full-Bleed Background with Overlay** — Best for creative, bold presentations
```
| ████████████████████████████████████  |
| ████       large 02        █████████ |
| ████    SECTION TITLE      █████████ |
| ████████████████████████████████████  |
```

### Font Size Hierarchy

| Element | Recommended Size | Notes |
|---------|-----------------|-------|
| Section Number | 72-120px | Bold, accent color or semi-transparent |
| Section Title | 36-48px | Bold, clear, primary text color |
| Intro Text | 16-20px | Light weight, muted color, optional |

**Key Principles:**
1. **Dramatic Number**: Section number = most prominent visual element
2. **Strong Title**: Large but clearly secondary to the number
3. **Minimal Content**: Just number + title + optional one-liner
4. **Breathing Room**: Leave generous whitespace — dividers are pause moments

### Content Elements

1. **Section Number** — Always required. Format: `01`, `02`... or `I`, `II`... Match TOC style.
2. **Section Title** — Always required. Clear, concise.
3. **Intro Text** — Optional 1-2 line description.
4. **Decorative Elements** — SVG accent shapes (bars, lines, geometric blocks).
5. **Page Number Badge** — **MANDATORY**.

### Design Decisions

1. **Tone**: Corporate → accent block; Creative → full-bleed; Minimal → bold center
2. **Color**: Strong palette color for background/accent; high-contrast text
3. **Consistency**: Same divider style across all dividers in one presentation
4. **Contrast with content slides**: Visually distinct (different background color, more whitespace)

### Workflow

1. **Analyze**: Section number, title, optional intro
2. **Choose Layout**: Based on content and tone
3. **Write Slide**: Use PptxGenJS. Use shapes for decorative elements. **MUST include page number badge.**
4. **Verify**: Generate preview, extract text, verify content and badge.

---

## 4. Content Page

Pick a subtype based on the content. Each content slide belongs to exactly ONE subtype:

### Subtypes

**Text** — Bullets, quotes, or short paragraphs
- Must still include icons or SVG shapes — never plain text only
```
|  SLIDE TITLE                          |
|  * Bullet point one                   |
|  * Bullet point two                   |
|  * Bullet point three                 |
```

**Mixed Media** — Two-column or half-bleed image + text
```
|  SLIDE TITLE                          |
|  Text content     |  [Image/Visual]   |
|  and bullets      |                   |
```

**Data Visualization** — Chart (SVG bar/progress/ring) + takeaways
- Must include data source
```
|  SLIDE TITLE                          |
|  [SVG Chart]      |  Key Takeaway 1   |
|                   |  Key Takeaway 2   |
|                   Source: xxx          |
```

**Comparison** — Side-by-side columns or cards (A vs B, pros/cons)
```
|  SLIDE TITLE                          |
|  ┌─ Option A ─┐  ┌─ Option B ─┐      |
|  │  Detail 1  │  │  Detail 1  │      |
|  └────────────┘  └────────────┘      |
```

**Timeline / Process** — Steps with arrows, journey, phases
```
|  SLIDE TITLE                          |
|  [1] ──→ [2] ──→ [3] ──→ [4]         |
|  Step    Step    Step    Step          |
```

**Image Showcase** — Hero image, gallery, visual-first layout
```
|  SLIDE TITLE                          |
|  ┌────────────────────────────────┐   |
|  │         [Hero Image]           │   |
|  └────────────────────────────────┘   |
|  Caption or supporting text           |
```

### Font Size Hierarchy

| Element | Recommended Size | Notes |
|---------|-----------------|-------|
| Slide Title | 36-44px | Bold, top of slide |
| Section Header | 20-24px | Bold, for sub-sections within slide |
| Body Text | 14-16px | Regular weight, left-aligned |
| Captions / Source | 10-12px | Muted color, smallest text |
| Stat Callout | 60-72px | Large bold numbers for key statistics |

**Key Principles:**
1. **Left-align body text** — never center paragraphs or bullet lists
2. **Size contrast** — title must be 36pt+ to stand out from 14-16pt body
3. **Visual elements required** — every content slide must have at least one non-text element
4. **Breathing room** — 0.5" minimum margins, 0.3-0.5" between content blocks

### Content Elements

1. **Slide Title** — Always required, top of slide
2. **Body Content** — Text, bullets, data, or comparisons based on subtype
3. **Visual Element** — Image, chart, icon, or SVG shape — always required
4. **Source / Caption** — When showing data or external content
5. **Page Number Badge** — **MANDATORY**

### Design Decisions

1. **Subtype**: Determine first — drives the entire layout
2. **Content Volume**: Dense → multi-column or smaller font; Light → larger elements with more whitespace
3. **Data vs Narrative**: Data-heavy → charts + stat callouts; Story-driven → images + quotes
4. **Variety**: Each content slide should use a different layout from the previous one
5. **Consistency**: Typography, colors, and spacing must match the rest of the presentation

### Workflow

1. **Analyze**: Content, determine subtype, plan layout
2. **Choose Layout**: Best fit for subtype and content volume
3. **Write Slide**: Use PptxGenJS. Use shapes for charts, decorative elements, icons. **MUST include page number badge.**
4. **Verify**: Run static QA, then inspect the rendered slide for complete content, no placeholders, and the required page badge.

---

## 5. Summary / Closing Page

- **Use for**: Wrap-up + action
- **Content**: Key takeaways, CTA/next steps, contact/QR, thank-you

### Layout Options

**Key Takeaways** — Best for educational, corporate, data-driven presentations
```
|  KEY TAKEAWAYS                        |
|  ✓  Takeaway one                      |
|  ✓  Takeaway two                      |
|  ✓  Takeaway three                    |
```

**CTA / Next Steps** — Best for sales pitches, proposals, project kick-offs
```
|  NEXT STEPS                           |
|  [1] Action item one                  |
|  [2] Action item two                  |
|  Contact: email@example.com           |
```

**Thank You / Contact** — Best for conference talks, keynotes
```
|            THANK YOU                   |
|         name@company.com              |
|         @handle | website.com         |
```

**Split Recap** — Best for presentations needing both recap and action
```
|  SUMMARY            |  NEXT STEPS      |
|  * Point one        |  Contact us at   |
|  * Point two        |  email@co.com    |
|  * Point three      |  [QR Code]       |
```

### Font Size Hierarchy

| Element | Recommended Size | Notes |
|---------|-----------------|-------|
| Closing Title ("Thank You" / "Summary") | 48-72px | Bold, commanding |
| Takeaway / Action Item | 18-24px | Clear, scannable |
| Supporting Text | 14-16px | Regular weight |
| Contact Info | 14-16px | Muted color |

**Key Principles:**
1. **Strong closing statement**: Main message should be largest, most prominent
2. **Scannable items**: Takeaways/action items concise (one line each)
3. **Contact clarity**: Legible but not dominant
4. **Memorable finish**: Confident, polished ending

### Content Elements

1. **Closing Title** — Always required
2. **Takeaway Points** — 3-5 concise summary points (if applicable)
3. **Call to Action** — Clear next steps (if applicable)
4. **Contact Info** — Email, website, social handles (if provided)
5. **Decorative Elements** — SVG accents for visual consistency
6. **Page Number Badge** — **MANDATORY**

### Design Decisions

1. **Closing Type**: Recap, CTA, thank-you, or combination
2. **Content Volume**: Many takeaways → list; Simple closing → centered thank-you
3. **Audience Action**: Audience needs to do something → CTA; Informational → takeaways
4. **Tone Consistency**: Match energy of cover page
5. **Visual Distinction**: Special but not disconnected from the rest

### Workflow

1. **Analyze**: Closing content — takeaways, CTA, contact, thank-you
2. **Choose Layout**: Based on content type
3. **Write Slide**: Use PptxGenJS. Use shapes for decorative elements. **MUST include page number badge.**
4. **Verify**: Generate preview, extract text, verify content and badge.

---

## Additional Layout Patterns

Use these across content slides for visual variety:

- **Two-column** (text left, illustration right)
- **Icon + text rows** (icon in colored circle, bold header, description below)
- **2x2 or 2x3 grid** (image on one side, grid of content blocks on other)
- **Half-bleed image** (full left or right side) with content overlay
- **Large stat callouts** (big numbers 60-72pt with small labels below)
- **Comparison columns** (before/after, pros/cons)
- **Timeline or process flow** (numbered steps, arrows)
- **Icons in small colored circles** next to section headers
- **Italic accent text** for key stats or taglines

---

## 6. Timeline / Process Page (UPGRADED)

**Use for**: Chronological progression, phased roadmap, step-by-step processes, journey narratives.

**Why a dedicated type**: Timeline slides have a unique visual signature (linear flow + temporal anchors) that doesn't fit the "Content Page" mold. When in doubt, classify a slide as Timeline rather than Content.

### Layout Options

**Horizontal Step Flow** — Best for 3-6 sequential steps
```
SLIDE TITLE
[01] ───→ [02] ───→ [03] ───→ [04]
Step 1    Step 2    Step 3    Step 4
Detail    Detail    Detail    Detail
```

**Vertical Timeline** — Best for milestones, dates, historical narratives
```
SLIDE TITLE
●── 2024 Q1 ─── Initial research phase
│
●── 2024 Q2 ─── Prototype validation
│
●── 2024 Q3 ─── Beta launch
```

**Phase Block** — Best for grouped phases (e.g. "Discover / Design / Deliver")
```
SLIDE TITLE
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Phase 1  │→│ Phase 2  │→│ Phase 3  │
│ Discover │ │ Design   │ │ Deliver  │
└──────────┘ └──────────┘ └──────────┘
```

### Required Elements

| Element | Required | Notes |
|---------|:--------:|-------|
| Slide title | Yes | Top of slide |
| Step/milestone markers | Yes | Numbered circles or dots in `theme.accent` |
| Connector lines/arrows | Yes | Use `theme.secondary` or `theme.light` |
| Step labels | Yes | Short action phrases |
| Date/phase labels (optional) | Recommended | When timeline is chronological |
| Page number badge | **MANDATORY** | Same position as other slides |

### Layout Code Skeleton

```javascript
function createTimeline(slide, pres, theme, steps) {
  const startX = 0.5;
  const stepWidth = 9 / steps.length;
  const yCenter = 2.8;

  steps.forEach((step, i) => {
    const x = startX + stepWidth * i + stepWidth / 2 - 0.3;

    // Connector line (skip first)
    if (i > 0) {
      slide.addShape(pres.ShapeType.line, {
        x: startX + stepWidth * (i - 1) + stepWidth / 2 + 0.3,
        y: yCenter,
        w: stepWidth - 0.6, h: 0,
        line: { color: theme.secondary, width: 1.5 }
      });
    }

    // Numbered circle marker
    slide.addShape(pres.ShapeType.ellipse, {
      x, y: yCenter - 0.3, w: 0.6, h: 0.6,
      fill: { color: theme.accent },
      line: { color: "FFFFFF", width: 2 }
    });
    slide.addText(String(i + 1).padStart(2, "0"), {
      x, y: yCenter - 0.3, w: 0.6, h: 0.6,
      fontSize: 14, bold: true, color: "FFFFFF",
      align: "center", valign: "middle"
    });

    // Step label
    slide.addText(step.label, {
      x: x - 0.5, y: yCenter + 0.5, w: stepWidth, h: 0.4,
      fontSize: 14, bold: true, color: theme.primary,
      align: "center"
    });

    // Step detail
    slide.addText(step.detail, {
      x: x - 0.5, y: yCenter + 0.95, w: stepWidth, h: 0.8,
      fontSize: 11, color: theme.secondary,
      align: "center"
    });
  });
}
```

### Common Pitfalls

- **Too many steps**: >6 steps becomes unreadable — split into multiple slides or use vertical timeline
- **Inconsistent spacing**: each step's text box should align with its circle marker
- **Arrows vs lines**: use `LINE` for subtle flow, use `RIGHT_ARROW` shapes for emphatic progression

---

## 7. Comparison Page (UPGRADED)

**Use for**: Before/after, pros/cons, option A vs option B, current state vs future state.

**Why a dedicated type**: Comparison is one of the most common analytical slide types — it deserves its own visual grammar (mirror symmetry + contrasting fill) rather than getting squeezed into Content Page subtypes.

### Layout Options

**Two-Column Symmetric** — Best for clear A vs B
```
SLIDE TITLE
┌─────────────┐    ┌─────────────┐
│   Option A  │ VS │   Option B  │
│   Header    │    │   Header    │
│   • Point 1 │    │   • Point 1 │
│   • Point 2 │    │   • Point 2 │
│   • Point 3 │    │   • Point 3 │
└─────────────┘    └─────────────┘
```

**Side-by-Side Cards** — Best for product/feature comparison
```
SLIDE TITLE
┌──────────────┐ ┌──────────────┐
│ Feature Name │ │ Feature Name │
│ Subtitle     │ │ Subtitle     │
│ ─────────── │ │ ─────────── │
│ Metric 1: 85 │ │ Metric 1: 70 │
│ Metric 2: 90 │ │ Metric 2: 95 │
└──────────────┘ └──────────────┘
```

**Comparison Table** — Best for 3+ attributes comparison
```
SLIDE TITLE
Attribute    │ Option A │ Option B │ Option C
─────────────┼──────────┼──────────┼──────────
Speed        │   85     │   70     │   60
Cost         │   High   │   Medium │   Low
Quality      │   High   │   High   │   Medium
```

### Required Elements

| Element | Required | Notes |
|---------|:--------:|-------|
| Slide title | Yes | Top of slide |
| Two distinct options/sides | Yes | Use `theme.primary` and `theme.secondary` for contrast |
| Equal visual weight | Yes | Both sides must have same width, padding, font sizes |
| VS separator or clear visual boundary | Recommended | Use `theme.accent` for separator |
| Labels/headers for each option | Yes | Clear identification |
| Page number badge | **MANDATORY** | |

### Layout Code Skeleton

```javascript
function createComparison(slide, pres, theme, left, right) {
  const colWidth = 4.2;
  const leftX = 0.5;
  const rightX = 5.3;
  const colY = 1.5;

  // Left card
  slide.addShape(pres.ShapeType.roundRect, {
    x: leftX, y: colY, w: colWidth, h: 3.2,
    fill: { color: theme.bg },
    line: { color: theme.primary, width: 2 },
    rectRadius: 0.1
  });
  slide.addText(left.title, {
    x: leftX + 0.2, y: colY + 0.2, w: colWidth - 0.4, h: 0.5,
    fontSize: 18, bold: true, color: theme.primary,
    align: "center"
  });
  // ... add left bullets ...

  // Right card
  slide.addShape(pres.ShapeType.roundRect, {
    x: rightX, y: colY, w: colWidth, h: 3.2,
    fill: { color: theme.bg },
    line: { color: theme.secondary, width: 2 },
    rectRadius: 0.1
  });
  // ... mirror structure ...

  // VS separator
  slide.addShape(pres.ShapeType.ellipse, {
    x: 4.85, y: 2.9, w: 0.3, h: 0.3,
    fill: { color: theme.accent }
  });
  slide.addText("VS", {
    x: 4.85, y: 2.9, w: 0.3, h: 0.3,
    fontSize: 10, bold: true, color: "FFFFFF",
    align: "center", valign: "middle"
  });
}
```

### Common Pitfalls

- **Unequal column widths**: must be identical — always measure, never eyeball
- **Mismatched bullet counts**: 5 points on left vs 3 on right looks unprofessional — pad with "—" or remove
- **Wrong color choice**: use `theme.primary` and `theme.secondary` for the two sides, NOT `theme.bg` (no contrast)
- **VS separator floating**: anchor the VS marker at the vertical midpoint of the cards

---

## Updated Type Summary

| Type | Use When | Min/Max Slides per Deck |
|------|----------|------------------------|
| Cover | Opening | 1 |
| TOC | 3+ sections | 0-1 |
| Section Divider | Between major parts | 1 per section |
| Content | General information | Unlimited |
| Timeline | Sequential steps / dates | 0-2 |
| Comparison | A vs B, before/after | 0-3 |
| Summary | Closing | 1 |

A typical 12-slide deck: 1 Cover + 1 TOC + 2 Dividers + 6 Content + 1 Timeline + 1 Comparison + 1 Summary.

---

## 8. Mixed / Hybrid Pages

Some slides don't fit cleanly into one type. When that happens:

**Rule of thumb**: Classify by **primary intent**, not by every element on the slide.

| Slide Content | Primary Intent | Classify As |
|---------------|----------------|-------------|
| 4 cards showing team members with bios | Display team info | Content (Icon + text rows) |
| Same 4 cards but with "before/after" framing | Compare team setup | Comparison |
| 3 milestones with dates | Show progression | Timeline |
| 3 milestones with metric comparisons | Compare metrics across phases | Comparison |

If a slide genuinely blends two types (e.g., timeline WITH comparison), pick the dominant one and add a note in `slideConfig.comment` for the slide developer.

---

## 9. Extended Patterns Reference

For specialized layout patterns that don't fit the 5 core types (e.g., Academic Header with 编号 · Logo · Divider 七元素, Top KPI Strip, Multi-Card 9-Grid, Comparison + Footer Banner), see:

**[references/academic-patterns.md](academic-patterns.md)** — Includes:
- **§9** Academic Header Pattern (编号 · 一级标题 · 主标题 · 校徽 · Header 高度 · Divider 颜色 · Divider 粗细)
- **§10** Top KPI Strip (横向 dashboard 横条)
- **§11** Multi-Card 9-Grid Grouped (行级 Banner 分组的 3×3 网格)
- **§12** Comparison + Footer Banner (双列对标 + 跨页机制总结条)

Each pattern is independent, parameterizable, content-agnostic.

---

> **原位保留（最小增量）**：Section 9 完整内容已迁出至 `references/academic-patterns.md`。原 658 行内容未改动。
