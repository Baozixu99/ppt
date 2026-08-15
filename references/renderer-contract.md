# Renderer Contract

Select one renderer before implementation. The workflow contracts are renderer-neutral; implementation APIs are not.

## Selection

| Condition | Renderer | Rule |
|---|---|---|
| Normal local generation | `pptxgenjs` | Use `scripts/scaffold-deck.js` and the starter deck. |
| Host environment mandates a presentation runtime | Host adapter, such as `artifact-tool` | Keep the same brief, STORY, source, checkpoint, render, and delivery contracts. Do not apply PptxGenJS-only module rules. |
| Existing template requires preservation | Renderer capable of preserving the original package | Follow `editing.md`; never rebuild the template from screenshots. |

Do not load two renderer implementations into one deck. Record the choice in `deck-brief.json` and use only the selected renderer's APIs.

This repository currently ships an executable PptxGenJS adapter only. A host adapter is an extension point, not an implied second implementation: select it only when a callable adapter already exists before slide implementation begins. Never prototype the deck in one renderer and rebuild it in another merely to satisfy a checkpoint.

## Adapter requirements

A non-PptxGenJS adapter must provide equivalents for:

- deterministic deck creation;
- editable text, shapes, images, and charts;
- speaker notes containing `[Sources]` blocks;
- per-slide rendering;
- slide-count and package-integrity validation;
- a portable project root without machine-specific literals.

If an equivalent is unavailable, disclose the limitation before implementation or use PptxGenJS.

## Path and runtime portability

- Resolve the project root from the current module, script location, or explicit CLI argument.
- Build asset paths with the platform path library.
- Do not commit literal paths such as `C:/Users/...`, `H:/...`, `/Users/...`, or `/home/...` in generated slide code.
- Discover Node, Python, and document runtimes from the active workspace or `PATH`. Do not copy a versioned cache path from a prior session.
- Treat an absolute path calculated at runtime as valid; the prohibition applies to hard-coded machine paths in source.

## Native rendering policy

- High-stakes decks and decks with native charts: render with Microsoft PowerPoint when available.
- Other decks: PowerPoint or LibreOffice is acceptable.
- Preserve the renderer name, timestamp, DPI, and slide count in `render-manifest.json`.
- If native PowerPoint rendering is required but unavailable, record the fallback and include it in the delivery summary.
