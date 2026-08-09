# Source Contract

Keep one `sources.json` beside the slide modules. STORY rows and `helpers.addSources()` calls refer to records by `id`; the helper expands those records into speaker notes.

## Manifest shape

```json
{
  "sources": [
    {
      "id": "revenue-q4",
      "kind": "dataset",
      "title": "Q4 revenue export",
      "creator": "Finance",
      "publisher": "Example Corp",
      "url": "https://example.com/report",
      "retrievedAt": "2026-08-09",
      "license": "Internal use",
      "usage": "Slides 4–6 revenue chart and conclusion"
    }
  ]
}
```

## Rules

- `id`, `kind`, `title`, and `usage` are required.
- IDs are unique, lowercase, and stable; use letters, digits, and hyphens.
- `kind` is one of `user`, `internal`, `web`, `paper`, `dataset`, `image`, or `generated`.
- `web`, `paper`, `dataset`, and `image` records require `url` and `retrievedAt`.
- `license` records the applicable permission or review status for third-party assets.
- User-provided and internal material may omit a URL but must describe provenance and allowed use.
- A visible footer may contain a short citation, but it does not replace the speaker-note record.

## Slide usage

```javascript
helpers.addSources(slide, ['revenue-q4']);
```

Use `none` in STORY only when the slide makes no externally sourced claim and uses no sourced asset. Use `user` only when the supplied material itself is the source and no more specific manifest record is needed.
