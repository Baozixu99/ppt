# PPT 演示文稿 Skill

Cursor IDE 的 PPTX 生成与编辑 Skill。覆盖从零生成、模板编辑、参考图风格分析、PptxGenJS 最佳实践。

## Features

- 2 modes: Learn-from-reference / Create-from-scratch
- 12 reference files + 1 domain template
- Academic-paper template (OS / Virtualization / Real-time Systems)
- 6-item QA checklist (Windows encoding traps, PptxGenJS anti-patterns, sensitive-info detection)
- Graceful degradation in compile.js

## Install

Copy this folder to your Cursor skills directory:

- Windows: `C:\Users\<you>\.cursor\skills\PPT 演示文稿\`
- macOS: `~/.cursor/skills/PPT 演示文稿/`
- Linux: `~/.cursor/skills/PPT 演示文稿/`

Restart Cursor or refresh the Skills panel.

## Usage

In Cursor, send:

```
/PPT 演示文稿 帮我做一个关于 X 的 PPT
```

or

```
/PPT 演示文稿 参考这张 PPT 学习它的配色和布局
```

## Structure

```
SKILL.md                       main entry
_skillhub_meta.json            install metadata
references/
  academic-patterns.md         academic layouts
  build-config.md              package.json + compile.js
  chart-schemas.md             chart data schemas
  data-layer.md                data-view separation
  design-analysis.md           10-dim design analysis
  design-system.md             color + font + style recipes
  editing.md                   editing workflow
  pitfalls.md                  6-item QA + Windows disasters
  pptxgenjs.md                 PptxGenJS API
  resources.md                 resource priority
  sensitive-info.md            PII / HR / financial detection
  slide-types.md               5 slide types
  troubleshooting.md           troubleshooting
domain-templates/
  academic-os-systems.md       OS / virtualization template
```

## License

GPL (per source paper).

## Maintainer

Bao Zixu (Zixu Bao) · Northwestern Polytechnical University