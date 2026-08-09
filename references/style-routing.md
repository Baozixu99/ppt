# Narrative and Visual Routing

Choose narrative and visual routes independently. A domain match does not authorize replacing a user template's visual language.

## Visual route precedence

1. **User PPTX or template**: preserve masters, layouts, spacing, typography, and visual language.
2. **Explicit visual direction**: implement the requested brand, mood, palette, or composition.
3. **Reference slide or image**: extract only high-quality reusable dimensions through `design-analysis.md`.
4. **No direction**: use the default design system and a restrained Soft or Sharp composition.

## Narrative routes

| Scenario | Route | Apply |
|---|---|---|
| OS, virtualization, real-time systems paper or defense | Full domain match | `domain-templates/academic-os-systems.md`, paper-section mapping, and domain checklist |
| Academic but outside systems | Partial academic match | Retain problem–method–evidence–conclusion arc; rewrite terminology, evidence types, and visuals |
| Business, annual report, consulting | General business | Decision-led story, Sharp or Soft density, data/source discipline |
| Training or education | Teaching | Learning objective, concept sequence, examples, recap |
| No stable match | General | Problem, evidence, response, implication, next step |

## Internal route record

Record the selected routes in the build or QA report:

```json
{
  "visualRoute": "user-template",
  "narrativeRoute": "academic-systems",
  "reason": "User supplied a branded defense template and an OS paper."
}
```

Do not place routing commentary on audience-facing slides.
