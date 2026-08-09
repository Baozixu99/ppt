# pptx-generator

A lightweight Agent Skill for creating, editing, analyzing, and visually verifying editable PowerPoint presentations with PptxGenJS.

## What it adds

- Full and lite workflows with explicit escape conditions.
- STORY-based narrative planning for complex decks.
- Separate narrative and visual routing.
- A reusable starter deck instead of regenerated build boilerplate.
- Static QA plus mandatory render-based visual QA.
- Academic systems-paper patterns, data/source separation, and sensitive-information handling.

## Install

Copy the `pptx-generator` folder to a supported Agent Skills location:

- WorkBuddy: `~/.workbuddy/skills/pptx-generator/`
- Cursor: `~/.cursor/skills/pptx-generator/`
- Other clients: use the client's Agent Skills directory.

The installed directory name must remain `pptx-generator` so it matches the `name` field in `SKILL.md`.

## Repository structure

```text
pptx-generator/
├── SKILL.md
├── assets/
│   └── starter-deck/
├── scripts/
├── references/
│   └── domain-templates/
├── tests/
│   └── forward-test-cases.json
└── README.md
```

The forward cases cover lite briefs, business reviews, academic decks, existing-deck edits, and sensitive-data handling. They are evaluation fixtures, not golden visual outputs.

## Quick smoke test

```bash
node scripts/scaffold-deck.js tmp-deck
cd tmp-deck
npm install
npm run build
npm run qa
```

For visual QA, run `scripts/render-slides.py` with installed Microsoft PowerPoint on Windows or LibreOffice on other platforms, then run `scripts/qa-render.py` and inspect the generated montage.

## License

Released under the [MIT License](LICENSE).

## Maintainer

Bao Zixu (Zixu Bao) · Northwestern Polytechnical University
