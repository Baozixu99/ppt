# Editing Existing Presentations

Treat the source deck as both content and visual authority. Preserve the original file, master/layout hierarchy, placeholders, relationships, notes, charts, and media wherever possible.

## Required workflow

### 1. Preserve and inspect

- Copy the source to a task workspace. Never edit the user's original in place.
- Extract text for content orientation.
- Render every source slide and inspect it individually.
- Inventory masters, layouts, placeholders, notes, charts, images, embedded objects, and repeated elements.

Text extraction alone cannot reveal layout, cropping, hierarchy, or visual quality.

### 2. Map content to source layouts

For every requested slide, record:

- Source slide or source layout to reuse.
- Placeholders and elements to replace.
- Elements to preserve.
- Content-length and aspect-ratio constraints.

Prefer editing inherited placeholders over flattening the slide or rebuilding it from scratch. Do not mix a user template with an unrelated default visual system.

### 3. Select the safest editing path

1. Use a presentation library or Office automation that preserves the required objects when available.
2. Use OOXML only when the higher-level path cannot perform the edit.
3. For OOXML work, use the bundled unpack, pack, and validation scripts. Do not extract and rezip with ad-hoc commands.

```bash
python scripts/unpack-pptx.py template.pptx workspace/unpacked
python scripts/pack-pptx.py workspace/unpacked output/edited.pptx
python scripts/validate-pptx.py output/edited.pptx
```

### 4. Complete structural changes first

Finish slide duplication, deletion, order, layout assignment, and relationship updates before replacing slide text. A copied slide may depend on:

- Slide relationships.
- Notes and notes-master relationships.
- Charts and embedded workbooks.
- Media files.
- Layout and master parts.
- `[Content_Types].xml` overrides.
- `ppt/presentation.xml` and its relationships.

Never copy only `slideN.xml`.

### 5. Replace complete content groups

- Replace every placeholder in the chosen source composition.
- If the source has fewer items than the template, remove the entire unused group rather than clearing only its text.
- Preserve paragraph structure, bullets, runs, language attributes, and inherited formatting.
- Prefer shorter copy or another source layout when replacement text does not fit.
- Preserve `xml:space="preserve"` for leading or trailing spaces.
- Use proper OOXML bullets instead of Unicode bullet characters.

### 6. Validate structure

Run `validate-pptx.py` after every structural edit batch. It checks ZIP integrity, required package parts, XML parsing, and internal relationship targets.

Structural validation is necessary but not sufficient: a structurally valid deck may still be visually wrong.

### 7. Render and compare

- Render every edited slide.
- Compare edited slides with their source layouts at full size.
- Check wrapping, clipping, alignment, image crops, chart labels, page markers, footers, and orphaned elements.
- Reopen the final file in PowerPoint, Keynote, or LibreOffice when available.

## Output contract

```text
workspace/
├── source.pptx
├── source-rendered/
├── unpacked/
└── source-notes.txt
output/
├── edited.pptx
├── rendered/
└── montage.png
```

Deliver `edited.pptx`; keep the source unchanged. Do not deliver the unpacked OOXML tree unless requested.
