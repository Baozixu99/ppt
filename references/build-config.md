# Build Configuration

The executable build system lives in `assets/starter-deck/`. Do not copy build boilerplate from this reference into each task.

## Contents

- [Starter-deck assets](#starter-deck-assets)
- [Commands](#commands)
- [Compiler guarantees](#compiler-guarantees)
- [Theme contract](#theme-contract)
- [Shared helpers](#shared-helpers)
- [Windows npm cache fallback](#windows-npm-cache-fallback)
- [Render workflow](#render-workflow)

## Starter-deck assets

```text
assets/starter-deck/
├── package.json
├── compile.js
├── validate-contracts.js
├── qa.js
├── _helpers.js
├── slide-01.js
├── deck-brief.json
├── STORY.md
├── sources.json
└── .gitignore
```

Create a working deck with:

```bash
node scripts/scaffold-deck.js slides
```

Without flags, the scaffold checks all conflicts before copying and leaves the destination unchanged. Use `--merge` to preserve existing files and add only missing starter files. Use `--force` only when intentionally replacing starter files.

## Commands

```bash
cd slides
npm ci
npm run build
npm run qa
```

`npm run verify` performs build and static QA in sequence.

Build representative or changed slides from the same source modules instead of creating a second preview implementation:

```bash
npm run preview -- --slides 1,10,20
```

The preview is written to `output/preview.pptx`. `--slides` accepts comma-separated numbers and ranges such as `1,5,10-12`. A preview is a checkpoint artifact; the final deck must still be built and verified in full.

`npm run build` and direct `node compile.js` execution run `validate-contracts.js` first. The contract validator checks the deck brief, STORY schema and budget, source IDs, checkpoint state, and hard-coded machine paths before compilation begins.

## Compiler guarantees

The bundled compiler:

- Discovers `slide-NN.js` and `slide-NN-name.js` modules.
- Sorts by numeric slide number rather than lexicographic filename order.
- Rejects duplicate slide numbers.
- Requires synchronous `createSlide(pres, theme, helpers)`.
- Requires each module to add exactly one slide when the runtime exposes a slide count.
- Fails immediately on load, export, or runtime errors.
- Writes to a temporary PPTX and renames it only after successful completion.
- Never writes a partial deck after a slide failure.

## Theme contract

Keep these exact keys unless the build contract is deliberately versioned:

```javascript
const theme = {
  primary: '22223B',
  secondary: '4A4E69',
  accent: '9A8C98',
  light: 'C9ADA7',
  bg: 'F2E9E4'
};
```

Use explicit neutral values such as `FFFFFF` only where the component contract permits them. Do not create undocumented theme keys in individual slides.

## Shared helpers

`_helpers.js` owns page badges, source notes, title defaults, and platform font selection. Extend it for repeated components; keep one-off composition inside the relevant slide module.

Use:

```javascript
function createSlide(pres, theme, helpers) {
  const slide = pres.addSlide();
  helpers.addTitle(slide, theme, 'Audience-facing title');
  helpers.addSources(slide, ['source-id-from-sources-json']);
  helpers.pageBadge(slide, pres, theme, 2);
  return slide;
}
```

Slide modules may export a small `slideConfig` object (`type`, `visual`, and `sources`). Static QA prefers this metadata over guessing intent from source-code syntax; older modules remain supported through fallback checks.

## Windows npm cache fallback

When the global npm cache is not writable, use a task-local cache:

```bash
npm ci --cache ./.npm-cache
```

The starter `.gitignore` excludes `.npm-cache/`.

## Render workflow

Static QA does not validate layout. After build:

```bash
python <skill-dir>/scripts/render-slides.py output/presentation.pptx --output-dir output/rendered
python <skill-dir>/scripts/qa-render.py output/rendered --expected <slide-count>
python <skill-dir>/scripts/create-montage.py output/rendered output/montage.png
```

On Windows, the renderer uses installed Microsoft PowerPoint first. On other platforms, or with `--engine libreoffice`, it uses LibreOffice for PPTX-to-PDF conversion and a PDF renderer for PNG output. Use `--engine powerpoint` or `--engine libreoffice` to make the choice explicit; `auto` is the default.

The renderer writes `render-manifest.json` with the engine, DPI, slide count, and timestamp. For high-stakes work on Windows, make the native requirement explicit:

```bash
python <skill-dir>/scripts/render-slides.py output/presentation.pptx --output-dir output/rendered --engine powerpoint
python <skill-dir>/scripts/qa-render.py output/rendered --expected <slide-count> --require-engine powerpoint
```

PowerPoint automation fails after 120 seconds by default instead of hanging indefinitely. Adjust this only for unusually large decks with `--timeout <seconds>`.

The complete workflow can be orchestrated without repeating commands:

```bash
python <skill-dir>/scripts/verify-deck.py <deck-dir> --engine powerpoint
```

Use `--static-only` for fast implementation loops. The full command remains required before delivery.

Install optional render dependencies from `scripts/requirements-render.txt` for montage creation and the LibreOffice PDF path.
