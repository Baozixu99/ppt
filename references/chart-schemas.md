# Chart Data Conventions

PptxGenJS supports 7 chart types. This file defines the **data conventions** for charts embedded in slide JS files.

## Choose Inline or `_data/`

Use inline data for a small one-off chart that appears on only one slide. Use `slides/_data/` when data is user-provided, reused, large, transformed, or expected to change independently of layout.

```javascript
// Inline chart data — most common case
const chartData = [{
  name: "Quarterly Revenue",
  labels: ["Q1", "Q2", "Q3", "Q4"],
  values: [120, 145, 168, 192]
}];

slide.addChart(pres.ChartType.bar, chartData, {
  x: 0.5, y: 1.5, w: 9, h: 3.5,
  showTitle: true,
  title: "Quarterly Revenue",
  titleFontSize: 14,
  showLegend: false,
  chartColors: [theme.accent]
});

slide.addText("Source: Internal finance report", {
  x: 0.5, y: 5.1, w: 6, h: 0.3,
  fontSize: 9, color: theme.secondary, italic: true
});
```

## When to Use External JSON

Only when the user provides structured data files (CSV, JSON) or asks for a recurring chart structure:

```
slides/
  _data/
    chart-01-revenue.json   // user-provided or recurring
  slide-XX.js
```

```javascript
const fs = require("fs");
const path = require("path");

function loadChartData(file) {
  const p = path.join(__dirname, "_data", file);
  if (!fs.existsSync(p)) throw new Error("Chart data not found: " + file);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}
```

## External JSON Schema (when needed)

```json
{
  "type": "bar",
  "title": "Quarterly Revenue",
  "source": "Finance Q4 2025",
  "data": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "values": [120, 145, 168, 192]
  }
}
```

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `type` | string | Yes | `bar` / `line` / `pie` / `doughnut` / `scatter` / `bubble` / `radar` (uppercased internally) |
| `title` | string | Yes | Chart title |
| `source` | string | Recommended | Attribution shown on slide |
| `data.labels` | string[] | Yes | Categories (or labels for pie/doughnut) |
| `data.values` | number[] | Yes | Same length as labels |

For multi-series charts, `values` becomes an array of `{name, values, color}` objects.

## Chart Type Reference

| Type | Use Case | PptxGenJS API |
|------|----------|---------------|
| `BAR` | Compare categories | `pres.ChartType.bar` with `barDir: "col"` or `"bar"` |
| `LINE` | Trend over time | `pres.ChartType.line` with `lineDataSymbol: "circle"` |
| `PIE` | Part-of-whole | `pres.ChartType.pie` with `showPercent: true` |
| `DOUGHNUT` | Part-of-whole (modern) | `pres.ChartType.doughnut` with `holeSize: 60` |
| `SCATTER` | Correlation (x, y) | values as `[{x, y}, ...]` |
| `BUBBLE` | 3-dim (x, y, size) | values as `[{x, y, size}, ...]` |
| `RADAR` | Multi-attribute comparison | Multiple series with shared labels |

## Common Pitfalls

- **Mismatched array lengths**: `labels` length must equal `values` length — PptxGenJS silently drops data otherwise
- **Too many categories**: >10 bars/categories becomes unreadable — group smaller into "Others"
- **No source attribution**: always include source for data charts (see inline pattern above)
- **Stacked chart with 1 series**: appears empty — minimum 2 series for stacking
