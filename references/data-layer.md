# Data Layer Pattern (Data–View Separation)

> **Purpose**: keep paper-specific numbers (chart values, table rows, KPI figures) **out of view code**. When you update a figure from the paper, you change **one file**, not 25.

## The Problem

Without a data layer, chart values get hardcoded inside `slide-22.js`, `slide-23.js`, etc:

```javascript
// slide-22.js — numbers buried in view code
slide.addChart(pres.charts.BAR, [
  { name: 'P50', labels: ['MMIO Doorbell', 'ioctl Syscall'], values: [5.12, 8.56] },
  { name: 'P99', labels: ['MMIO Doorbell', 'ioctl Syscall'], values: [5.28, 8.94] }
], { ... });
```

Problems:

- **Update cost**: if you correct a figure, you grep across all slides and risk missing one
- **Readability**: chart structure (labels, values, palette) is mixed with layout (x, y, w, h)
- **Reuse**: if two slides show the same dataset, you copy-paste the array
- **Verification**: there's no single file that says "this is the master number set for the paper"

## The Solution: `_data/` Folder

```
slides/
├── _data/
│   └── artivm-stats.js     (paper-specific numbers)
├── slide-22.js              (view code, imports stats)
├── slide-23.js
└── ...
```

### Step 1: Create `slides/_data/<topic>.js`

Each data file is a plain CommonJS module exporting constants:

```javascript
// slides/_data/artivm-stats.js
// ARTIVM paper — Tables 2, 4, 5, 6, 7 + Figs 2, 6, 7, 8, 9, 10, 11
// Every number in this file MUST be traceable to a table/figure in the paper.

module.exports = {
  // RQ1 — Interrupt injection latency (Table 4)
  interrupt: {
    p50: { 'MMIO Doorbell (ARTIVM)': 5.12, 'ioctl Syscall (RTISM)': 8.56 },
    p99: { 'MMIO Doorbell (ARTIVM)': 5.28, 'ioctl Syscall (RTISM)': 8.94 },
    unit: '\u03bcs',
    source: 'Fig. 6 / Table 4'
  },

  // RQ2 — End-to-end RTT (Table 5)
  rtt: {
    p50: { 'ARTIVM RT': 8.14, 'ARTIVM BE': 4.46, 'RTISM Q0': 13.34, 'RTISM Q3': 14.00 },
    p99: { 'ARTIVM RT': 9.48, 'ARTIVM BE': 6.76, 'RTISM Q0': 71.58, 'RTISM Q3': 72.16 },
    unit: '\u03bcs',
    source: 'Fig. 7 / Table 5'
  },

  // Mixed-criticality flow table (Table 2)
  flows: [
    { tag: '\u03c4PH', name: '\u98de\u63a7\u6307\u4ee4', crit: 'HI', arrival: '\u4e25\u683c\u5468\u671f', params: '(Ti, Di, Lmax_i)' },
    { tag: '\u03c4SH', name: '\u7d27\u6025\u544a\u8b66', crit: 'HI', arrival: '\u5076\u53d1',     params: '(Tmin_i, Di, Lmax_i)' },
    { tag: '\u03c4PL', name: '\u9065\u6d4b\u6570\u636e', crit: 'LO', arrival: '\u5468\u671f',     params: '(Ti, Dsoft_i, Lmax_i)' },
    { tag: '\u03c4BL', name: '\u89c6\u89c9\u5e27', crit: 'LO', arrival: '(\u03c3,\u03c1)-\u7a81\u53d1', params: '(\u03c3_i, \u03c1_i, Smin_i)' }
  ],

  // Conclusion takeaways
  takeaways: [
    { value: '6.12 \u03bcs', label: '\u9ad8\u5173\u952e\u6d41 P99 \u5c3e\u65f6\u5ef6\u4e0a\u9650', sub: '\u76f8\u8f83 RTISM 71.74 \u03bcs  \u2193 91.5%' },
    { value: '0%',            label: '\u7a81\u53d1\u8d1f\u8f7d\u4e0b\u96f6\u4e22\u5305\u4f20\u8f93',     sub: '+HT+BE \u6d2a\u6c34\u4e0b 2000/2000 \u5168\u90e8\u5230\u8fbe' },
    { value: '1.5 \u03bcs',    label: '\u5355\u8f6e\u53cd\u9988\u94fe\u8def\u5f00\u9500',                  sub: '10 kHz \u8c03\u5ea6\u4e0b\u4ec5\u5360 1.5%' }
  ]
};
```

> **Unicode escape convention**: For Chinese strings, prefer `\uXXXX` escapes over literal Chinese in source files. This avoids encoding pitfalls on Windows tooling (see [pitfalls.md → §Windows-Only Disasters](pitfalls.md#windows-only-disasters-cross-platform-encoding)) and makes files grep-friendly.

### Step 2: Use in slide-XX.js

```javascript
// slide-22.js
const stats = require('./_data/artivm-stats');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  // ... header ...

  // Chart references the data file, NOT a hardcoded array
  slide.addChart(pres.charts.BAR, [
    { name: 'P50', labels: Object.keys(stats.interrupt.p50), values: Object.values(stats.interrupt.p50) },
    { name: 'P99', labels: Object.keys(stats.interrupt.p99), values: Object.values(stats.interrupt.p99) }
  ], { /* layout options */ });

  // Source citation uses the data file's source field
  helpers.sourceFooter(slide, pres, theme, 'Source: ' + stats.interrupt.source);

  // ... rest of body ...
  helpers.pageBadge(slide, pres, theme, 22);
}

module.exports = { createSlide };
```

### Step 3: Update workflow when numbers change

```bash
# 1. Edit ONLY the data file
nano slides/_data/artivm-stats.js

# 2. Rebuild — every slide that uses stats.* picks up the change automatically
npm run build
```

You never need to touch slide files when the paper's numbers change.

---

## When to Use This Pattern

✅ **Use when**:
- Deck is 15+ slides with multiple charts / tables
- Numbers come from a single paper / report / dataset
- You expect to revise numbers after first build (very common in academic work)
- Multiple team members need to verify numbers — data file is the audit point

❌ **Skip when**:
- Deck is ≤ 5 slides with at most 1 chart — overhead not worth it
- Numbers are unique per slide with no reuse
- Working from user-provided JSON / CSV — already have external data files (use [chart-schemas.md](chart-schemas.md) instead)

## File Naming

- One data file per **paper / report / topic**: `artivm-stats.js`, `q3-marketing.js`
- For multi-paper decks, split per paper: `_data/quantum-paper.js`, `_data/economics-paper.js`
- File name should be **topic-noun**, not slide-noun. The data file does not know which slides use it.

## Anti-Patterns

❌ **Don't** import data inside `compile.js`. Keep the import in slide files — only the slide that uses the data pays the parse cost.

❌ **Don't** mix layout coordinates into the data file. `x, y, w, h` belong in slide files.

❌ **Don't** store derived values. If `RTT_speedup = baseline / new`, compute it in the slide, not in data:

```javascript
// Data file
rtt: { baseline: 71.74, new: 6.12 }

// Slide
const speedup = stats.rtt.baseline / stats.rtt.new;  // 11.7x
```

This way the data file is a flat fact sheet, easy to audit.

## Cross-References

- Chart data shapes: see [chart-schemas.md](chart-schemas.md)
- Slide boilerplate (pageBadge, academicHeader): see [build-config.md](build-config.md#slides_helpersjs-shared-reusable-components)
- Academic Header (which uses section numbers that may map to data sections): see [academic-patterns.md → §Section Number Mapping](academic-patterns.md#section-number-mapping-convention)