# STORY Contract

Use this contract in full mode. Create `slides/STORY.md` before slide implementation. Lite mode may keep the same structure in memory.

The PptxGenJS starter runs `validate-contracts.js` before build. Full and high-stakes builds must fail when STORY is missing, malformed, outside the slide budget, or references unknown source IDs.

## Required table

```markdown
| # | title | type | role | message | visual | layout | sources |
|---:|---|---|---|---|---|---|---|
| 1 | ... | cover | hero | ... | image | full-bleed | user |
```

## Fields

| Field | Allowed values or rule |
|---|---|
| `title` | Audience-facing slide title |
| `type` | `cover`, `toc`, `divider`, `content`, `timeline`, `comparison`, `summary` |
| `role` | `hero`, `supporting`, `transition` |
| `message` | The one conclusion the audience should retain |
| `visual` | `chart`, `diagram`, `image`, `table`, `icon-row`, `text`, or a specific visual description |
| `layout` | A concrete composition such as `left-text-right-image` or `centered-kpi` |
| `sources` | `user`, `none`, or one or more source IDs |

For quantitative slides, `message` must contain both a fact and the interpretation supported by that fact.

## Story checks

- [ ] Every planned slide has all seven fields.
- [ ] Every slide has one message, not a topic label.
- [ ] Adjacent slides do not repeat the same visual silhouette without a clear reason.
- [ ] Hero slides are not adjacent.
- [ ] Quantitative slides contain a fact, an interpretation, and a source ID.
- [ ] Divider slides map one-to-one to declared chapters when dividers are enabled.
- [ ] No three consecutive content slides rely on text as their primary visual.
- [ ] The slide count fits the agreed budget.

## Hero guidance

- Launch or keynote decks: 20–30%.
- Business reports: 15–25%.
- Academic defenses: at least one emphasis slide per major section.
- Dense reading reports: hero share may be below 15%.

These are routing defaults, not universal hard failures.
