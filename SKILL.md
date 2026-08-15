---
name: pptx-generator
description: Plan, create, edit, read, and visually verify editable, source-tracked PowerPoint decks from PDFs, reports, datasets, reference slides, or existing PPTX files. Use for academic and competition defenses, conference talks, business reports, document-to-slides conversion, template editing, slide redesign, and PPTX QA. The skill owns requirements, STORY planning, source traceability, rendering, and validation; select exactly one compatible renderer per task, using PptxGenJS by default and a host-required presentation runtime only through an explicit adapter.
---

# PPTX Generator

Create editable PowerPoint files through a lightweight, testable workflow. Keep planning, implementation, sources, and QA separate. Prefer a small deterministic starter over rewriting build boilerplate for every deck.

## Choose the workflow

1. **Read or analyze an existing deck**: extract content, inspect every rendered slide, and answer from the complete slide context.
2. **Edit a user deck or template**: preserve the original, master/layout hierarchy, placeholders, relationships, and visual language. Read [editing.md](references/editing.md).
3. **Learn from reference slides**: analyze reusable dimensions rather than copying a whole slide. Read [design-analysis.md](references/design-analysis.md).
4. **Create from scratch**: follow the workflow below.

User-provided templates and explicit visual directions always override defaults.

## Select one renderer

Apply [renderer-contract.md](references/renderer-contract.md) before scaffolding or writing slide code.

- Use `pptxgenjs` by default and follow the bundled starter-deck contract.
- Use a host-required renderer only when the active environment mandates it and a callable adapter exists before implementation; keep `deck-brief.json`, STORY, sources, checkpoints, rendering, and final validation equivalent.
- Never mix renderer-specific APIs, scaffold rules, or QA assumptions in one deck.
- Record the selected renderer in `deck-brief.json` and derive project paths at runtime. Do not write machine-specific absolute paths into deck source.

## Operating modes

### Full mode

Use by default. Require requirements alignment, STORY planning, routing, source tracking, static QA, full-slide rendering, and visual inspection.

### High-stakes mode

Use for competition defenses, formal academic defenses, investor or executive decisions, external publication, and any deck whose late visual rework would be costly. High-stakes mode inherits full mode and additionally requires resolved high-impact questions, a recorded story checkpoint, a representative visual checkpoint, and native PowerPoint rendering when PowerPoint is available.

### Lite mode

Use only when all conditions hold:

- The deck has at most 8 slides.
- The user explicitly asks for a quick draft or the deck is low risk.
- No user template is being edited.
- At most one complex chart is required.
- No sensitive information or research-heavy external claims are involved.
- No complex architecture or relational diagram is required.

Lite mode may keep the story plan in memory instead of writing `STORY.md`. It may not skip build success, page-count checks, placeholder checks, rendering every slide once, severe overflow/overlap inspection, or source and privacy rules.

## Load references progressively

Do not read the full reference index up front. Start with the smallest route below and load an additional reference only when a concrete decision or failure requires it.

| Task route | Initial references |
|---|---|
| PDF/report competition defense | `requirements-alignment.md`, `brief-contract.md`, `document-ingestion.md`, `story-contract.md`, `source-contract.md`, `style-routing.md`, `visual-gates.md` |
| Paper-section conference talk | The competition set plus the selected domain template; load [academic-patterns.md](references/academic-patterns.md) only if section mapping or its layouts are chosen |
| Existing deck/template edit | `renderer-contract.md`, `editing.md`, `visual-gates.md` |
| Reference-slide style analysis | `design-analysis.md`, then the selected design reference |
| Lite deck | `requirements-alignment.md`, the applicable source rules, and `visual-gates.md` |

`slide-types.md`, `design-system.md`, `pptxgenjs.md`, `data-layer.md`, chart schemas, and troubleshooting are implementation libraries, not default reading. In particular, a systems topic does not by itself select the systems-paper template; competition defenses are evidence-led unless the user asks for paper-section mapping.

## Creation workflow

### Step 1: Align requirements

Apply [requirements-alignment.md](references/requirements-alignment.md) and [brief-contract.md](references/brief-contract.md). Create `slides/deck-brief.json` before STORY planning. Ask at most three questions in one round. Infer stable details from supplied materials, but do not silently infer high-impact items such as speaking time, mandatory organizer sections, required templates, or embedded-demo requirements. Do not expose internal filenames or build commands in user-facing copy.

### Step 2: Acquire content and sources

- For PDF, DOCX, paper, or report inputs, apply [document-ingestion.md](references/document-ingestion.md) and preserve page- or section-level provenance.
- Research only when the task needs it.
- Track every externally sourced non-trivial claim and asset.
- Never fabricate chart data, quotations, citations, or unsupported details.
- Apply [source-contract.md](references/source-contract.md) for source IDs, manifests, and speaker notes.
- Apply [sensitive-info.md](references/sensitive-info.md) only when the input contains plausible sensitive personal, HR, medical, legal, confidential, or non-public financial information.
- Apply [resources.md](references/resources.md) only when acquiring or generating assets beyond user-provided material and editable native diagrams.

### Step 3: Route narrative and visuals

Apply [style-routing.md](references/style-routing.md). Select narrative and visual routes independently.

Visual precedence:

1. User-provided PPTX or template.
2. Explicit visual direction.
3. User-provided reference image or slide.
4. Default design system.

### Step 4: Plan the story

In full mode, create `slides/STORY.md` using [story-contract.md](references/story-contract.md). Give every slide one audience-facing message, a role, a visual carrier, a layout, and source status.

Use the seven page types defined by the STORY contract. Load [slide-types.md](references/slide-types.md) only when an unfamiliar layout needs a detailed recipe. Read a domain template only when the narrative route—not merely the subject area—selects it.

For high-stakes mode, present the chapter arc, core conclusions, and three representative pages—cover, complex architecture/process, and primary quantitative result—in one combined checkpoint when practical. Do not create multiple approval rounds for decisions the user has already resolved. Record the story and visual checkpoint as `approved` or `waived` in `deck-brief.json`. A user instruction such as “直接生成” may waive the checkpoint but must be recorded with a reason.

Build those previews from the final slide modules with `npm run preview -- --slides <numbers>`. Do not maintain a separate preview deck implementation.

### Step 5: Scaffold the deck

Run the bundled scaffold instead of recreating build files:

```bash
node scripts/scaffold-deck.js slides
```

The scaffold aborts before writing when conflicts exist. Use `--merge` to preserve existing files while adding missing starter files, or `--force` only when replacement is intentional.

The starter runs `validate-contracts.js` before every build. Full and high-stakes builds must fail when `deck-brief.json`, `STORY.md`, source records, required checkpoints, or slide-budget constraints are invalid.

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
npm ci
npm run build
npm run qa
```

The compiler must fail fast on load, export, or runtime errors. Never deliver a partially compiled deck.

For a single end-to-end command from the skill directory, run `python scripts/verify-deck.py <deck-dir> --engine powerpoint` for a high-stakes Windows deck, or use `--static-only` during implementation. This command builds, runs static QA, validates the package, renders, checks render integrity, and creates a montage.

### Step 8: Render and inspect

Apply [visual-gates.md](references/visual-gates.md):

1. Render every slide to an image.
2. Inspect every slide individually at full size.
3. Use a montage only for deck-level rhythm and consistency.
4. Fix unintended overlap, clipping, wrapping, broken connectors, bad crops, blurry assets, unresolved placeholders, and chart/data mismatches.
5. Rebuild and rerender affected slides.

For high-stakes decks or decks containing native charts, render with Microsoft PowerPoint when it is available and preserve `render-manifest.json` as QA evidence. If PowerPoint is unavailable, use the best available renderer and disclose the fallback in the QA summary. Opening the PPTX never replaces rendering and inspection.

### Step 9: Deliver

Return only the final PPTX and a concise summary unless the user requests plans, previews, or QA logs. Preserve the original when editing an existing deck.

## Non-skippable quality rules

- Render every final slide at least once.
- Fix every unintended overlap or overflow found.
- Default to deck titles ≥50pt, slide titles ≥35pt, mid-level text ≥24pt, and body text ≥16pt. A declared `high`-density academic route may use 30pt slide titles and 14pt body text when the layout genuinely requires it and native-render inspection confirms readability; user templates may also override the scale.
- Shorten text or change layout before shrinking type.
- Do not allow a one-line title or banner to wrap unexpectedly.
- Cite externally sourced claims and assets in speaker notes.
- Ensure every STORY source ID resolves to `sources.json` and every sourced final slide contains a `[Sources]` speaker-note block.
- Keep diagrams minimal and purposeful; ensure connectors do not cross nodes or labels.
- Do not reuse the same non-background image across multiple slides by default.
- Treat chart percentages as typed data: declare whether values are fractions or percentage points, set number formats accordingly, and explicitly configure data labels, series names, and category names.
- Do not hard-code drive letters, home directories, versioned runtime paths, or task-specific absolute paths in generated source.

## Reference index

| Need | Read |
|---|---|
| Requirement questions and inference | [requirements-alignment.md](references/requirements-alignment.md) |
| Requirements contract and checkpoints | [brief-contract.md](references/brief-contract.md) |
| Renderer choice and portability | [renderer-contract.md](references/renderer-contract.md) |
| PDF/report ingestion and page provenance | [document-ingestion.md](references/document-ingestion.md) |
| Narrative and visual routing | [style-routing.md](references/style-routing.md) |
| STORY schema and checks | [story-contract.md](references/story-contract.md) |
| Visual and static gates | [visual-gates.md](references/visual-gates.md) |
| Page types and layouts | [slide-types.md](references/slide-types.md) |
| Academic section mapping and extended layouts | [academic-patterns.md](references/academic-patterns.md) |
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
