# Domain Template: Academic OS / Systems / Virtualization Papers

> **Use when**: presenting a research paper in **Operating Systems, Virtualization, Embedded Systems, Real-time Systems, Distributed Systems, or Architecture**. These domains share a stable narrative arc that academic reviewers and committees expect.

## Standard Narrative Arc (4-part, 20-25 slides)

Every systems paper can be mapped to this skeleton. The mapping to paper sections is **opinionated** but matches the structure used by SOSP / OSDI / EuroSys / RTSS / EMSOFT / DAC / MICRO / USENIX ATC communities.

```
Part 1: 背景与动机     (Background & Motivation)        — 6-8 slides
Part 2: 系统模型       (System Model / Problem)         — 3-4 slides
Part 3: 设计与实现     (Design & Implementation)        — 6-8 slides
Part 4: 评估与结论     (Evaluation & Conclusion)        — 5-7 slides
TOTAL                                                20-27 slides
```

Each part gets a Section Divider slide. Add Cover + TOC + Summary at the ends.

---

## Slide-by-Slide Template

### Cover (1 slide)

| Element | Content |
|---------|---------|
| Title | Paper title (Chinese + English on separate lines) |
| Authors | All authors with affiliation superscripts |
| Affiliation | Institution logo (top-right per academic-patterns.md §9) |
| Venue | Conference/journal + date (e.g., "RTSS 2025 · December 2025") |
| Keywords | 3-5 tag pills |

### TOC (1 slide)

Use a 2x2 or 4x1 grid of 4 part-cards. Each card: part number (01/02/03/04) + Chinese label + English subtitle + 1-line scope description.

### Part 1 — 背景与动机 (6-8 slides)

Map to paper: §1 Introduction + §2 Background/Related Work + §3 Motivation.

| # | Type | Content | Maps to |
|:-:|------|---------|---------|
| 1.1 | Content | Domain context (e.g., "端侧多内核泛在 OS") — why now? | §1 intro paragraph |
| 1.2 | Content | Existing approaches landscape — table comparison | §2 related work summary |
| 1.3 | Content | Motivating scenario with concrete numbers | §3 motivating example |
| 1.4 | Content | Problem statement (problem space + gap) | §3 problem definition |
| 1.5 | Data Viz | Quantitative evidence of the gap (chart from paper Fig) | §3 measurements |
| 1.6 | Content | Our contributions — 4-item card grid | §1 contributions list |
| 1.7 | Optional | "Paper organization" roadmap | §1 last paragraph |

> **Section header notation**: use `1.1`, `1.2`, ... to mirror paper sections. See [academic-patterns.md → §Section Number Mapping](academic-patterns.md#section-number-mapping-convention).

### Part 2 — 系统模型 (3-4 slides)

Map to paper: §4 System Model / Problem Formulation.

| # | Type | Content |
|:-:|------|---------|
| 2.1 | Content | Platform / hardware model — diagram |
| 2.2 | Content | Problem model — formal definitions (M, N, Bi, etc.) |
| 2.3 | Content | Constraints and optimization objective (C1-C4) |
| 2.4 | Optional | Assumptions / threat model |

### Part 3 — 设计与实现 (6-8 slides)

Map to paper: §5-§6 Design + §7 Implementation.

| # | Type | Content |
|:-:|------|---------|
| 3.0 | Content | Overall architecture — 4 component blocks |
| 3.1 | Content | Component 1 (e.g., TA-DLRP) — algorithm + diagram |
| 3.2 | Content | Component 2 (e.g., Predictor) — formula + edge cases |
| 3.3 | Content | Component 3 (e.g., FG-WRR) — pseudo-code + flowchart |
| 3.4 | Content | Component 4 (e.g., Verifier) — theorem + proof sketch |
| 3.5 | Optional | Implementation details (HW params, OS version) |
| 3.6 | Optional | Complexity / overhead analysis |

### Part 4 — 评估与结论 (5-7 slides)

Map to paper: §8 Evaluation + §9 Discussion + §10 Conclusion.

| # | Type | Content |
|:-:|------|---------|
| 4.1 | Content | Prototype setup — hardware / kernel / workload |
| 4.2 | Data Viz | RQ1: micro-benchmark (latency, throughput) |
| 4.3 | Data Viz | RQ2: macro-benchmark (real workload) |
| 4.4 | Data Viz | RQ3: scalability / sensitivity analysis |
| 4.5 | Content | Discussion: when does it work / when does it fail |
| 4.6 | Content | Related work positioning |
| 4.7 | Content | Conclusion + future work + limitations |

### Summary (1 slide)

3 KPI takeaways (large numbers) + 2-3 sentence main claim + future work item list + Thank You band.

---

## Design Choices That Match Systems Papers

### Color Palette

Recommended palettes (from [design-system.md](design-system.md)):

| Palette | Hex | Best for |
|---------|-----|----------|
| **Vintage & Academic** | `#780000 #c1121f #fdf0d5 #003049 #669bbc` | Most systems papers — strong contrast |
| **Education & Charts** | `#264653 #2a9d8f #e9c46a #f4a261 #e76f51` | Chart-heavy evaluation sections |
| **Pure Tech Blue** | `#03045e #0077b6 #00b4d8 #90e0ef #caf0f8` | Hardware / architecture papers |

For data-heavy systems papers (≥ 5 charts), prefer **Education & Charts** because it has 5 distinct hues for series.

### Typography

- Section numbers (e.g., "1.1") in **Arial Bold 24-28pt** with `theme.accent` color
- Subtitles in **Microsoft YaHei Bold 14pt** with `theme.primary`
- Main titles in **Microsoft YaHei Bold 22pt** black
- Body text in **Microsoft YaHei 11-12pt** with `theme.secondary`
- Always include the cross-platform font fallback chain — see [design-system.md → §Font Fallback Chain](design-system.md#font-fallback-chain)

### Style Recipe

Use **Soft & Balanced** (`rectRadius: 0.06-0.12`, page margin 0.4"). Reasons:

- Sharper than Rounded — matches academic seriousness
- More approachable than Sharp — easier for committee to read
- Industry consensus for systems / academic conferences

### Chart Density

Typical evaluation slide budget:

| Slide Type | Chart Count | Notes |
|------------|-------------|-------|
| Latency / throughput | 1-2 BAR charts | Side-by-side comparison (P50 / P99) |
| Over time | 1 LINE chart | Multiple series, sparse data points |
| Scalability | 1 LINE chart | X-axis = workload parameter |
| Comparison table | 1 grouped table | Not a chart — use text + color |
| Multi-RQ | 2 charts side-by-side | RQ1 left, RQ2 right |

> **Rule**: never put 3+ charts on a single content slide. Split.

---

## Mapping Slide → Paper Section (Convention)

Every content slide's header should display a **section number that maps to the paper**. The reviewer can flip between slide and paper without confusion.

```
Slide 4  header "1.1"  →  Paper §1.1  Background
Slide 5  header "1.2"  →  Paper §1.2  Cross-VM Communication
...
Slide 21 header "4.1"  →  Paper §4.1  ARMv8 Prototype
```

| Paper Section | Slide Range | Count |
|---------------|-------------|-------|
| §1 Introduction | Cover + 1.1-1.2 | 3 |
| §2 Background / Related Work | 1.3-1.4 | 2 |
| §3 Motivation | 1.5-1.6 | 2 |
| §4 System Model | 2.1-2.3 | 3 |
| §5 Design | 3.0-3.4 | 5 |
| §6 Implementation | 3.5-3.6 | 2 |
| §7 Evaluation Setup | 4.1 | 1 |
| §8 Evaluation Results | 4.2-4.4 | 3 |
| §9 Related Work Positioning | 4.5-4.6 | 2 |
| §10 Conclusion | Summary | 1 |

Total = ~25 slides. Adjust if paper has 7 or 9 main sections (use §7-Eval as a single divider block).

---

## Recommended Helpers (`_helpers.js` extensions)

For systems papers, add these helpers to `_helpers.js` (extends the base in [build-config.md](build-config.md#slides_helpersjs-shared-reusable-components)):

```javascript
// systems-paper-specific helpers
function systemDiagram(slide, pres, theme, opts) {
  // opts: { layers: [{label, color, y, h}], connections: [[from, to]] }
  opts.layers.forEach(layer => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: layer.y, w: 9.0, h: layer.h,
      fill: { color: layer.color }, line: { color: theme.primary, width: 1 },
      rectRadius: 0.06
    });
    slide.addText(layer.label, {
      x: 0.5, y: layer.y, w: 9.0, h: layer.h,
      fontSize: 12, bold: true, color: 'FFFFFF',
      fontFace: FONT_CN, align: 'center', valign: 'middle'
    });
  });
  opts.connections.forEach(([from, to]) => {
    slide.addShape(pres.shapes.LINE, {
      x: from.x, y: from.y, w: to.x - from.x, h: to.y - from.y,
      line: { color: theme.primary, width: 1.5, endArrowType: 'triangle' }
    });
  });
}

function comparisonTable(slide, pres, theme, opts) {
  // opts: { rows: [{label, pros, cons, color}], x, y, w, h }
  const rowH = (opts.h - 0.3) / opts.rows.length;
  opts.rows.forEach((row, i) => {
    const y = opts.y + 0.3 + i * rowH;
    // Tag (left column)
    slide.addShape(pres.shapes.RECTANGLE, {
      x: opts.x, y, w: 2.6, h: rowH - 0.05,
      fill: { color: row.color }, line: { color: row.color, width: 0 }
    });
    slide.addText(row.label, {
      x: opts.x, y, w: 2.6, h: rowH - 0.05,
      fontSize: 12, bold: true, color: 'FFFFFF',
      fontFace: FONT_CN, align: 'center', valign: 'middle'
    });
    // Pros
    slide.addText('✓ ' + row.pros, {
      x: opts.x + 2.7, y, w: 3.0, h: rowH - 0.05,
      fontSize: 11, color: theme.secondary,
      fontFace: FONT_CN, valign: 'middle'
    });
    // Cons
    slide.addText('✗ ' + row.cons, {
      x: opts.x + 5.8, y, w: 3.2, h: rowH - 0.05,
      fontSize: 11, color: theme.primary,
      fontFace: FONT_CN, valign: 'middle'
    });
  });
}

function algorithmListing(slide, pres, theme, opts) {
  // opts: { title, lines: [{code, comment}], x, y, w, h }
  slide.addShape(pres.shapes.RECTANGLE, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    fill: { color: theme.primary }, line: { color: theme.primary, width: 0 },
    rectRadius: 0.04
  });
  slide.addText(opts.title, {
    x: opts.x + 0.2, y: opts.y + 0.05, w: opts.w - 0.4, h: 0.3,
    fontSize: 12, bold: true, color: theme.accent, fontFace: 'Arial'
  });
  opts.lines.forEach((line, i) => {
    slide.addText([
      { text: line.code, options: { fontSize: 11, color: 'FFFFFF', fontFace: 'Consolas' } },
      { text: '   ' + (line.comment || ''), options: { fontSize: 10, italic: true, color: theme.light, fontFace: FONT_CN } }
    ], {
      x: opts.x + 0.2, y: opts.y + 0.4 + i * 0.25, w: opts.w - 0.4, h: 0.25,
      valign: 'middle'
    });
  });
}
```

---

## Pre-Delivery Checklist (For This Domain)

Beyond the global [QA Checklist](pitfalls.md#qa-checklist-mandatory--use-before-declaring-success), verify:

- [ ] Section numbers (1.1, 1.2, ...) match the paper exactly — committee will cross-check
- [ ] Every chart has a `Source:` citation referencing the paper's Fig./Table number
- [ ] All theorem / formal definition text uses serif (Cambria / Georgia) for mathematical distinction
- [ ] Implementation slides cite the hardware/OS versions explicitly
- [ ] Conclusion slide quotes the paper's claimed contribution verbatim (paraphrasing is fine but facts must match)
- [ ] Future work slide mentions the same open questions as paper §10

---

## Other Domain Templates

Coming soon (add as separate files in this folder):

- `academic-ml.md` — ML / CV / NLP papers (different evaluation narrative)
- `corporate-quarterly.md` — quarterly business review
- `product-launch.md` — product launch deck
- `thesis-defense.md` — full MPhil/PhD thesis defense (45-60 slides)