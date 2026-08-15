# pptx-generator

A lightweight Agent Skill for creating, editing, analyzing, and visually verifying editable PowerPoint presentations with PptxGenJS.

Repository: <https://github.com/Baozixu99/ppt>

## For AI agents

This repository is both the canonical source and the directly installable Skill. The repository contract calls this `repository-is-skill` mode. There is no separate `dist/` package. Route the task by user intent before reading or changing files.

| Intent | Action |
|--------|--------|
| Install and use | Install the repository as `pptx-generator`, validate it, then read `SKILL.md`. Do not load development files during normal deck work. |
| Use an installed copy | Follow `SKILL.md` and load only the references selected by its routing table. |
| Modify or improve | Preserve local changes, edit the installed or cloned repository, and run the relevant regression tests. |
| Update an installation | Inspect Git state first. Never overwrite local improvements silently; merge, commit, or preserve them before updating. |
| Contribute upstream | Read `CONTRIBUTING.md`, run the full test matrix, and submit only source changes—not generated deck artifacts or caches. |

The repository-local [`skill-manifest.json`](skill-manifest.json) describes runtime, development, and generated-file boundaries in a machine-readable form. It is a repository contract, not a platform-standard Skill field.

### Install and use

When the user provides this repository URL or pastes this README:

1. Locate the active client's Skills directory instead of assuming a platform when it can be discovered.
2. Clone or copy the repository into a directory named exactly `pptx-generator`; the GitHub repository name `ppt` is not the required installed directory name.
3. If the destination already exists, inspect it before changing anything. Preserve uncommitted or locally modified files.
4. Validate the installed repository with `node tests/validate-skill.js` when Node.js is available.
5. Do not install starter-deck npm dependencies during Skill installation. Install them only inside a scaffolded deck when a presentation task needs them.
6. Start normal use from `SKILL.md`. Do not read `tests/`, `.github/`, `CONTRIBUTING.md`, or `SECURITY.md` unless the user's intent requires them.

Example clone command:

```bash
git clone https://github.com/Baozixu99/ppt.git <skills-directory>/pptx-generator
```

Supported locations commonly include:

- Codex: `~/.codex/skills/pptx-generator/`
- WorkBuddy: `~/.workbuddy/skills/pptx-generator/`
- Cursor: `~/.cursor/skills/pptx-generator/`
- Other clients: use the client's configured Agent Skills directory.

### Modify an installed copy

Treat the installed repository as editable source. Before modifying or updating it:

1. Inspect repository status and existing user changes.
2. Make the smallest scoped change in the runtime or development surface identified by `skill-manifest.json`.
3. Add or update a regression test for behavioral changes.
4. Run `node tests/validate-skill.js` plus the relevant smoke, JavaScript, or Python tests.
5. Keep local improvements as a commit, branch, or patch before pulling upstream changes.

If the installed copy is not a Git checkout, preserve a backup or diff before replacing files. Reinstallation must not silently discard local improvements.

## What it adds

- Full and lite workflows with explicit escape conditions.
- High-stakes mode with story and representative-slide checkpoints.
- A machine-readable deck brief and prebuild contract validation.
- STORY-based narrative planning for complex decks.
- Single-renderer selection with host-runtime adapter rules.
- Separate narrative and visual routing.
- A reusable starter deck instead of regenerated build boilerplate.
- Static QA plus mandatory render-based visual QA.
- Semantic DrawingML extent validation and normalized connector helpers.
- Selected-slide previews built from the final slide modules.
- An executable 25-slide competition regression fixture.
- Academic systems-paper patterns, data/source separation, and sensitive-information handling.

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
├── .github/
├── skill-manifest.json
└── README.md
```

Runtime files and development files intentionally coexist so an AI agent can install, use, diagnose, modify, test, and contribute from one checkout. Only `SKILL.md` and the references it selects belong in normal task context. The forward cases cover lite briefs, business reviews, PDF-based competition defenses, renderer conflicts, academic decks, existing-deck edits, and sensitive-data handling. They are evaluation fixtures, not golden visual outputs.

## Quick smoke test

```bash
node scripts/scaffold-deck.js tmp-deck
cd tmp-deck
npm ci
npm run build
npm run qa
```

For visual QA, run `scripts/render-slides.py` with installed Microsoft PowerPoint on Windows or LibreOffice on other platforms, then run `scripts/qa-render.py` and inspect the generated montage.

Run the complete workflow with:

```bash
python scripts/verify-deck.py <deck-dir> --engine powerpoint
```

During implementation, `--static-only` skips rendering. To build checkpoint slides without a second preview implementation:

```bash
cd <deck-dir>
npm run preview -- --slides 1,10,20
```

Run `tests/test-render-tools.py` to verify render-manifest generation and native-engine gate behavior without requiring a live PowerPoint COM session.

The CI suite also covers strict DrawingML text parsing, negative extents, connector normalization, theme-token failures, scaffold merge behavior, selected-slide previews, shared-module QA, and an executable 25-slide high-stakes build.

## License

Released under the [MIT License](LICENSE).

## Maintainer

Bao Zixu (Zixu Bao) · Northwestern Polytechnical University
