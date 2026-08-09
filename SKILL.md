---
name: pptx-generator
description: Generate, edit, read, and visually verify PowerPoint presentations with PptxGenJS. Use for PPT, PPTX, PowerPoint, slide, deck, presentation, template editing, reference-slide style analysis, academic defenses, business reports, and slide QA.
---

# PPTX Generator

Create editable PowerPoint files through a lightweight, testable workflow. Keep planning, implementation, sources, and QA separate. Prefer a small deterministic starter over rewriting build boilerplate for every deck.

## Choose the workflow

1. **Read or analyze an existing deck**: extract content, inspect every rendered slide, and answer from the complete slide context.
2. **Edit a user deck or template**: preserve the original, master/layout hierarchy, placeholders, relationships, and visual language. Read [editing.md](references/editing.md).
3. **Learn from reference slides**: analyze reusable dimensions rather than copying a whole slide. Read [design-analysis.md](references/design-analysis.md).
4. **Create from scratch**: follow the workflow below.

User-provided templates and explicit visual directions always override defaults.

## Operating modes

### Full mode

Use by default. Require requirements alignment, STORY planning, routing, source tracking, static QA, full-slide rendering, and visual inspection.

### Lite mode

Use only when all conditions hold:

- The deck has at most 8 slides.
- The user explicitly asks for a quick draft or the deck is low risk.
- No user template is being edited.
- At most one complex chart is required.
- No sensitive information or research-heavy external claims are involved.
- No complex architecture or relational diagram is required.

Lite mode may keep the story plan in memory instead of writing `STORY.md`. It may not skip build success, page-count checks, placeholder checks, rendering every slide once, severe overflow/overlap inspection, or source and privacy rules.

## Creation workflow

### Step 1: Align requirements

Apply [requirements-alignment.md](references/requirements-alignment.md). Ask at most three questions in one round. Infer stable details from supplied materials. Do not expose internal filenames or build commands in user-facing copy.

### Step 2: Acquire content and sources

- Research only when the task needs it.
- Track every externally sourced non-trivial claim and asset.
- Never fabricate chart data, quotations, citations, or unsupported details.
- Apply [source-contract.md](references/source-contract.md) for source IDs, manifests, and speaker notes.
- Apply [sensitive-info.md](references/sensitive-info.md) before implementation.
- Apply [resources.md](references/resources.md) for asset acquisition and licensing.

### Step 3: Route narrative and visuals

Apply [style-routing.md](references/style-routing.md). Select narrative and visual routes independently.

Visual precedence:

1. User-provided PPTX or template.
2. Explicit visual direction.
3. User-provided reference image or slide.
4. Default design system.

### Step 4: Plan the story

In full mode, create `slides/STORY.md` using [story-contract.md](references/story-contract.md). Give every slide one audience-facing message, a role, a visual carrier, a layout, and source status.

Use the page taxonomy in [slide-types.md](references/slide-types.md). Read domain templates only when the narrative route selects them.

### Step 5: Scaffold the deck

Run the bundled scaffold instead of recreating build files:

```bash
node scripts/scaffold-deck.js slides
```

The scaffold copies `assets/starter-deck/` without overwriting existing files unless `--force` is supplied.

### Step 6: Implement slides

- Create `slides/slide-01.js`, `slide-02.js`, and so on.
- Export a synchronous `createSlide(pres, theme, helpers)` function.
- Use `pres.ShapeType` and `pres.ChartType`; do not use deprecated `pres.shapes` or `pres.charts`.
- Use actual `roundRect` shapes when a rounded container is required. `rectRadius` does not round a plain rectangle.
- Use real installed font names. A comma-separated CSS font list is not a PowerPoint fallback chain.
- Keep external facts in `_data/` or source records instead of duplicating them across slide code.
- Add `[Sources]` blocks through speaker notes for external claims and assets.
- Keep visible slide copy written for the audience, not for the slide author or agent.

Read [design-system.md](references/design-system.md), [pptxgenjs.md](references/pptxgenjs.md), and [data-layer.md](references/data-layer.md) only as needed.

### Step 7: Build and run static QA

From the generated `slides/` directory:

```bash
npm install
npm run build
npm run qa
```

The compiler must fail fast on load, export, or runtime errors. Never deliver a partially compiled deck.

### Step 8: Render and inspect

Apply [visual-gates.md](references/visual-gates.md):

1. Render every slide to an image.
2. Inspect every slide individually at full size.
3. Use a montage only for deck-level rhythm and consistency.
4. Fix unintended overlap, clipping, wrapping, broken connectors, bad crops, blurry assets, unresolved placeholders, and chart/data mismatches.
5. Rebuild and rerender affected slides.

Opening the PPTX is optional and environment-specific. It never replaces rendering and inspection.

### Step 9: Deliver

Return only the final PPTX and a concise summary unless the user requests plans, previews, or QA logs. Preserve the original when editing an existing deck.

## Non-skippable quality rules

- Render every final slide at least once.
- Fix every unintended overlap or overflow found.
- Keep deck titles at least 50pt, slide titles at least 35pt, mid-level text at least 24pt, and body text at least 16pt unless a user template requires otherwise.
- Shorten text or change layout before shrinking type.
- Do not allow a one-line title or banner to wrap unexpectedly.
- Cite externally sourced claims and assets in speaker notes.
- Keep diagrams minimal and purposeful; ensure connectors do not cross nodes or labels.
- Do not reuse the same non-background image across multiple slides by default.

## Reference index

| Need | Read |
|---|---|
| Requirement questions and inference | [requirements-alignment.md](references/requirements-alignment.md) |
| Narrative and visual routing | [style-routing.md](references/style-routing.md) |
| STORY schema and checks | [story-contract.md](references/story-contract.md) |
| Visual and static gates | [visual-gates.md](references/visual-gates.md) |
| Page types and layouts | [slide-types.md](references/slide-types.md) |
| Design tokens and typography | [design-system.md](references/design-system.md) |
| Reference-slide analysis | [design-analysis.md](references/design-analysis.md) |
| Existing PPTX editing | [editing.md](references/editing.md) |
| PptxGenJS API | [pptxgenjs.md](references/pptxgenjs.md) |
| Build details | [build-config.md](references/build-config.md) |
| Data separation and chart schemas | [data-layer.md](references/data-layer.md), [chart-schemas.md](references/chart-schemas.md) |
| Assets and source rules | [resources.md](references/resources.md) |
| Source manifest and speaker notes | [source-contract.md](references/source-contract.md) |
| Sensitive information | [sensitive-info.md](references/sensitive-info.md) |
| Failures and recovery | [troubleshooting.md](references/troubleshooting.md), [pitfalls.md](references/pitfalls.md) |
| Systems-paper narrative | [academic-os-systems.md](references/domain-templates/academic-os-systems.md) |
