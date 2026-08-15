# Contributing

This is a repository-as-Skill project: the same checkout is directly installable and is the canonical development source. Keep runtime and development responsibilities explicit; do not create a second generated source tree.

## Repository boundaries

- Runtime: `SKILL.md`, `agents/`, `assets/`, `references/`, and `scripts/`.
- Development: `tests/`, `.github/`, `README.md`, `CONTRIBUTING.md`, and `SECURITY.md`.
- Generated: `node_modules/`, `output/`, `.npm-cache/`, `__pycache__/`, and `.tmp-*/`.

`skill-manifest.json` is the machine-readable source of these boundaries. Development files may remain in an installed checkout, but normal Skill use must not load them unless the user's intent requires development or maintenance.

## Workflow

1. Open an issue or describe the failure mode the change addresses.
2. Put repeated or fragile operations in tested scripts, not copied Markdown snippets.
3. Keep detailed variants in `references/`; keep `SKILL.md` focused on routing and workflow.
4. Preserve local changes when working from an installed checkout; never replace the directory blindly during an update.
5. Add or update a regression test for behavioral changes.
6. Run `node tests/validate-skill.js` and the relevant smoke, JavaScript, and Python tests.
7. For visual changes, attach rendered before/after slides and document the QA performed.
8. Do not add copied templates, fonts, or images without documented redistribution rights.

By contributing, you agree that your contribution is licensed under the repository's MIT License. Do not submit third-party material unless its license permits inclusion and its attribution requirements are preserved.
