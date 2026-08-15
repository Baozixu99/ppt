# Deck Brief Contract

Create `slides/deck-brief.json` before STORY planning. This file freezes the task assumptions that materially affect narrative, density, or delivery. Keep it short and machine-readable.

## Schema

```json
{
  "version": 1,
  "mode": "high-stakes",
  "renderer": "pptxgenjs",
  "goal": "Win a technical competition defense by proving outcome and engineering depth",
  "audience": "Technical judges",
  "use": "18-minute spoken defense",
  "durationMinutes": 18,
  "slideBudget": { "target": 25, "min": 23, "max": 27 },
  "density": "high",
  "visualDirection": "academic light, restrained palette, strong evidence hierarchy",
  "mustInclude": ["headline results", "architecture", "experiment design", "real-device evidence"],
  "mustAvoid": ["unsupported claims", "decorative density", "more than three accent colors"],
  "sourceInputs": [{ "kind": "pdf", "label": "final report", "path": "../inputs/report.pdf" }],
  "assumptions": [],
  "unresolvedHighImpact": [],
  "checkpoints": {
    "story": "approved",
    "visualPreview": "approved",
    "waiverReason": ""
  }
}
```

## Rules

- `mode` is `lite`, `full`, or `high-stakes`.
- `renderer` identifies the single implementation runtime selected for the deck.
- `slideBudget.min <= target <= max`; lite mode must not exceed 8 slides.
- `unresolvedHighImpact` contains only items whose answer can change the story, timing, template, or deliverable. It must be empty before a high-stakes build.
- `checkpoints.story` and `checkpoints.visualPreview` are `approved`, `waived`, or `pending`.
- A high-stakes build may not contain a `pending` checkpoint. When either checkpoint is waived, record a non-empty `waiverReason`.
- Record assumptions explicitly. Do not hide a material assumption only in chat or implementation code.

## Interaction policy

Ask no more than three questions in one round. Prefer these high-impact questions for a formal defense:

1. What is the speaking time and Q&A format?
2. Is there an organizer template or a required section/order?
3. Must the deck include a live demo, embedded video, or backup slides?

For a high-stakes deck, prefer one combined confirmation containing the story arc and three representative visuals: cover, complex architecture/process, and primary result. User feedback on that combined checkpoint may approve both fields; do not request a second confirmation for an unchanged decision. If the user explicitly requests uninterrupted generation, mark both checkpoints `waived` and record that instruction instead of inventing approval.

## Lite-mode escape hatch

Lite mode may omit STORY only when all lite conditions in `SKILL.md` hold. It still requires `deck-brief.json`, source/privacy handling, a successful build, a complete render, and severe layout inspection.
