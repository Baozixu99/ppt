# Document Ingestion

Use this route when the source material is a PDF, DOCX, paper, final report, or other long-form document.

## Required outputs

Create task-local intermediate artifacts outside the skill directory:

1. extracted text preserving page or section boundaries;
2. rendered page images for visual inspection;
3. extracted reusable figures, screenshots, and tables when licensing permits;
4. a concise evidence inventory mapping claims to source pages;
5. source records in `sources.json`.

Do not treat text extraction as sufficient. Inspect rendered pages to recover diagrams, captions, table structure, and visual evidence omitted or reordered by extraction.

## Progressive pass for long documents

For documents longer than roughly 30 pages, avoid loading the entire extracted text and every page image into model context at once:

1. Extract the table of contents, executive summary, contribution/results sections, headings, figure captions, tables, and metric-bearing lines.
2. Build the evidence inventory and provisional story from that structural pass.
3. Inspect the rendered pages selected by the inventory, plus adjacent pages needed to understand conditions and limitations.
4. Run a final document-wide search for every headline claim, unit, baseline, and limitation before implementation is considered complete.

Render and extract once per source hash. Reuse task-local artifacts when the input file is unchanged; do not create a second full page-image set for another renderer or preview workflow.

## Page-level provenance

Use stable source IDs such as:

```json
{
  "id": "final-report-p34-48",
  "kind": "user",
  "title": "Final report, pages 34–48",
  "usage": "Level-1 mechanism, experiment setup, and P99 result"
}
```

Prefer the document's printed page labels when they differ from physical PDF page numbers; otherwise use physical page numbers. Record the convention once in the evidence inventory.

## Extraction rules

- Preserve exact units, baselines, sample counts, confidence intervals, and whether a percentage is relative or absolute.
- Keep negative results, limitations, and trade-offs when they affect the conclusion.
- Do not infer missing numbers from chart geometry when the document does not state them.
- Use report screenshots as evidence only when they remain legible at presentation scale.
- Store reusable quantitative facts in `_data/`, not inside layout code, for decks with repeated metrics or at least 15 slides.

## Document-to-defense routing

For competition or academic defenses, organize evidence around the audience decision rather than mirroring the report chapter order. A reliable default arc is:

```text
claim → problem pressure → design → implementation depth → experiment validity → headline results → limitations → contribution
```

Every headline result must link to implementation evidence and experiment conditions, not only a KPI card.
