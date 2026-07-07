# Academic & Extended Patterns (Reference Library)

This file holds **specialized layout & visual patterns** that don't fit the 5 core page types (Cover / TOC / Section Divider / Content / Summary) but recur across academic / dashboard / corporate-summary decks.

| # | Pattern | Origin | Reuse Trigger |
|:-:|---------|--------|---------------|
| - | [Section Number Mapping Convention](#section-number-mapping-convention) | All academic decks | Map slide headers to paper §N.M |
| 9 | [Academic Header Pattern](#9-academic-header-pattern) | Research deck (课题/答辩) | 编号 + 校徽 + 主标题 + Divider 七元素 |
| 10 | [Top KPI Strip](#10-top-kpi-strip) | Annual report dashboard | 横向 KPI 横条 + 完成度块 |
| 11 | [Multi-Card 9-Grid](#11-multi-card-9-grid-grouped) | Project portfolio 3×3 grouped | 多项目并列 + Banner 分组 |
| 12 | [Comparison + Footer Banner](#12-comparison--footer-banner) | Cross-project 复盘 | 双列对标 + 底部跨页机制总结条 |

Each pattern is **independent, parameterizable, content-agnostic**.

---

## Section Number Mapping Convention

**Mandatory for any academic deck presenting a paper, thesis, or research report.**

### The rule

Every content slide's header must display a **section number that maps 1:1 to the paper**. Reviewers and committee members will cross-check your slides against the paper — any mismatch destroys credibility.

```
Paper §1.1  Background       →  Slide header "1.1"
Paper §1.2  Cross-VM Comms   →  Slide header "1.2"
Paper §4.2  ARMv8 Prototype  →  Slide header "4.2"
```

### Why this matters

- **Reviewer trust**: a slide labeled "1.1" lets the reader flip to paper §1.1 in 2 seconds
- **Audit trail**: if the paper is revised, only the slide whose section number changed needs review
- **Q&A handling**: "对应论文哪一节?" is the first question every committee asks. The header answers it visually.

### Numbering format

| Paper convention | Slide display | Example |
|------------------|---------------|---------|
| `§N.M` | `N.M` (no § prefix, no period at end) | `4.2` |
| `Section N.M` | `N.M` | `4.2` |
| `§N` only (no subsections) | `N` | `3` |

**Don't** add decorations like `Section 4.2`, `Module IV-B`, `Chapter 4`.2`, `4-2`. The simpler the better.

### Visual treatment

The section number sits in the top-left of the academic header (see Pattern §9), rendered in:

- **Font**: Arial Bold (NOT Microsoft YaHei — Arial has tabular numerals)
- **Size**: 24-28pt (larger than the subtitle)
- **Color**: `theme.accent` (high contrast against the top-band)
- **Position**: x=0.5, y=0.3 (top-left of header area)

The number is the **visual anchor** of the slide — readers scan the deck left-to-right, top-to-bottom, and section numbers form a "spine".

### When the paper doesn't have stable section numbers

If the source is a thesis chapter or a blog post without numbered sections, synthesize numbers:

```
Thesis Chapter 3 "Method"        →  Slides 3.1, 3.2, 3.3
Thesis Chapter 4 "Experiments"   →  Slides 4.1, 4.2, 4.3
```

Document the mapping in a small footer on slide 2 (TOC): "本章小节编号对应论文 §3.1-§4.3".

### Divider slides

Section dividers use a **two-digit** format: `01`, `02`, `03`, `04`. These don't map to paper sections — they map to **deck parts** (Background, Model, Design, Evaluation).

| Part | Divider label |
|------|---------------|
| Background & Motivation | `01` |
| System Model / Problem | `02` |
| Design & Implementation | `03` |
| Evaluation & Conclusion | `04` |

### Mapping table (recommended for the deck)

For decks with ≥ 15 content slides, include a "mapping table" slide near the front. Example:

| Slide | Header | Paper section |
|-------|--------|---------------|
| 4 | 1.1 | §1.1 端侧多内核泛在 OS |
| 5 | 1.2 | §1.2 跨 VM 共享内存通信 |
| ... | ... | ... |

This table itself becomes a navigation aid for the committee.

### Anti-patterns

❌ **Don't** number slides arbitrarily (`01`, `02`, ... `25`) — academic decks must mirror paper structure
❌ **Don't** skip a section number even if you merged two subsections — use `1.3a` / `1.3b` if needed
❌ **Don't** show the paper's section *title* in the slide header — show only the number + your own subtitle (the slide title can differ from the paper's exact wording, but the number must match)
❌ **Don't** omit section numbers on "intro" slides — even the first content slide (4) should have `1.1`, not just a generic title

### Cross-reference

- The Academic Header Pattern (§9) uses this numbering in its layout
- See [domain-templates/academic-os-systems.md](domain-templates/academic-os-systems.md) for full paper-to-slide mapping example

---

## 9. Academic Header Pattern (编号 · Logo · Divider)

**Use for**: 高校课题汇报、学术答辩、技术研究报告、科研基金答辩 PPT。

**Why a dedicated type**: Academic Header 是由 7 个独立视觉元素（编号 / 一级标题 / 主标题 / 校徽 / Header 高度 / Divider 颜色 / Divider 粗细）组成的固定模板，**不可被现有 Content slide 的"标题 + body"模式描述**。在已有 5 page types（Cover / TOC / Section Divider / Content / Summary）和 Section 6-8 中均无对应规范——Section Divider 的"大号编号"无 Logo / Divider；Content 的"标题"无编号 / Logo 系统。

### Element Checklist (7 elements, left → right, top → bottom)

| # | Element | Spec |
|:-:|---------|------|
| 1 | **编号系统** | 左对齐大号蓝色文字（"3.2"），字号 ≈ 28pt，bold，与主标题**同行** |
| 2 | **一级标题** | 紧随编号的中文短语（如 "研究内容2"），theme.primary 色，bold |
| 3 | **主标题** | 破折号引导的中英文并列长标题（"——基于 FG-WRR 与闭环反馈的自适应 QoS 调度机制"），黑色加粗，字号 ≈ 24pt |
| 4 | **校徽 Logo** | 右上角，**圆形校徽 + 中文校名 + 英文校名** 三行垂直版式，圆直径 ≈ 0.6" |
| 5 | **Header 总高** | 占整页高度的 1/8（约 0.7"），与正文区分隔 |
| 6 | **Divider** | Header 下方 0.05" 厚的横线（用 `pres.shapes.LINE`，height=0） |
| 7 | **Divider 颜色与粗细** | 与编号同色（`theme.primary`），`width: 2`（pt） |

### Layout Skeleton

```
[TOP HEADER BAND (height = 0.7", 占整页 1/8)]
┌──────────────────────────────────────────────────────────────┐
│  [01]                                                    [校徽] │
│  一级标题 · 主标题 — 副标题                       [中文校名] │
│                                            [ENGLISH NAME]     │
└──────────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════ ← Divider
                                                               │
              [Body content — references research content]       │
                                                               │
```

### Required Elements

| Element | Required | Notes |
|---------|:--------:|-------|
| 编号（"3.2"） | Yes | 视觉锚点；字号必须 > 主标题字号 |
| 一级标题 | Yes | 短中文短语（≤ 8 字），与编号同色 |
| 主标题 | Yes | 破折号引导的长标题，可中英并列 |
| 校徽 Logo | Yes | 右上角，圆形 + 中文 + 英文三行 |
| Divider | Yes | theme.primary 色，width=2 |
| Body content | Yes | Header 之外的科研正文 |
| Page number badge | **MANDATORY** | 与其它 slide 一致 |

### Layout Code Skeleton

```javascript
function createAcademicHeader(slide, pres, theme, opts) {
  const HEADER_Y = 0.3;
  const HEADER_H = 0.55;

  // 1. 编号（"3.2"）
  slide.addText(opts.number, {
    x: 0.5, y: HEADER_Y, w: 0.9, h: HEADER_H,
    fontSize: 28, bold: true, color: theme.primary,
    fontFace: "Microsoft YaHei", align: "left", valign: "middle"
  });

  // 2. 一级标题
  slide.addText(opts.subtitle, {
    x: 1.4, y: HEADER_Y, w: 3.0, h: HEADER_H,
    fontSize: 20, bold: true, color: theme.primary,
    fontFace: "Microsoft YaHei", align: "left", valign: "middle"
  });

  // 3. 主标题（破折号引导）
  slide.addText(opts.mainTitle, {
    x: 0.5, y: HEADER_Y + HEADER_H, w: 8.0, h: HEADER_H,
    fontSize: 24, bold: true, color: "000000",
    fontFace: "Microsoft YaHei", align: "left", valign: "middle"
  });

  // 4. 校徽（圆形 + 中文 + 英文三行）
  slide.addShape(pres.shapes.OVAL, {
    x: 9.0, y: HEADER_Y, w: 0.6, h: 0.6,
    fill: { color: theme.accent },
    line: { color: theme.primary, width: 1 }
  });
  slide.addText([
    { text: opts.orgNameCN, options: { fontSize: 10, bold: true, color: theme.primary, breakLine: true } },
    { text: opts.orgNameEN, options: { fontSize: 8, color: theme.secondary } }
  ], {
    x: 8.0, y: HEADER_Y + 0.1, w: 1.8, h: 0.5,
    fontFace: "Microsoft YaHei", align: "right", valign: "middle"
  });

  // 6-7. Divider
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.05, w: 9.0, h: 0,
    line: { color: theme.primary, width: 2 }
  });
}
```

### Common Pitfalls

- **编号字号 ≤ 主标题**：违反视觉层级——编号必须是 Header 中**最大**的字号
- **省略 Divider**：让 Header 与正文混为一体，丢失学术风的"分隔感"
- **校徽区域过小**：直径 < 0.5" 时远观无法识别，建议固定 0.6"
- **混用中英文字体**：中文行用 `Microsoft YaHei`，英文行可改 Arial；不要全文统一 Arial
- **把此 Header 简化为单一"大标题"**：它由 7 元素组成，不可降级为 Content slide 的 title
- **变更编号格式破坏可复用性**：保持 `3.2` 形式（章节.子节），不要换成 `Module 3-2` 等自创格式

### Reuse Conditions

满足以下全部条件时复用本 Pattern：
- ✓ 汇报主体是科研/学术内容
- ✓ 编号系统稳定（如 "3.1 / 3.2 / 3.3"）
- ✓ Logo 是机构校徽（不是品牌 Logo）
- ✓ 主标题包含破折号引导的中英文并列
- ✓ 整套 PPT 需统一 Header 风格（高度 / Divider / Logo 位置一致）

仅一项满足时不建议使用——退回到 Content slide 的标准 title。

---

## 10. Top KPI Strip

**Use for**: 年度总结、项目仪表盘、阶段性汇报、OKR review 汇报首页。

**Why a dedicated type**: 横向贯穿页顶的 KPI 横条是 dashboard 类 slide 的固定开头——一个 KPI 大标签 + 4-5 等宽数据块 + 完成度块——和 Section 6 Timeline 的横向 step flow 同形但**信息密度更高、每块是"静态数字+标签"而非"步骤"**，不应混用。

### Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ [模块标签大块] │ [KPI-1] │ [KPI-2] │ [KPI-3] │ [KPI-4] │ [完成度]│
│  年度工作成果  │  12项   │  85%    │   3.2x  │  100%   │  92%   │
│  及核心模块    │ ───     │ ───     │  ───    │  ───    │  ▓▓▓░  │
│                │ 累计交付│ 准时率  │  效率提升│  达成率  │ 进度    │
└──────────────────────────────────────────────────────────────────┘
```

### Element Spec

| 区域 | 元素 | Spec |
|------|------|------|
| 大标签块 | 左侧 1.8" 宽 | 模块/单位/年份的描述性文字（2-3 行），用于锚定本行 KPI 的语境 |
| 数据块 ×4-5 | 每块 1.5" 宽 | 上 icon / 中大号数字（color=theme.accent 高亮）/ 下中文标签 |
| 完成度块 | 右侧 1.2" 宽 | 单一大数字 + 横向进度条（用 `RECTANGLE` 或 `LINE` 表示） |

### Constraint

- 数字字号 ≥ 28pt，标签 ≤ 14pt
- 同一卡片内颜色种类 ≤ 3（背景/数字/标签），避免与右侧"完成进度"块混色
- 数据块的 icon 与其数字垂直对齐（中心同 x）
- 不与底部内容图重复——Top KPI Strip 只做总览，详情走下一页

### Reuse Conditions

- ✓ 一页需要 ≥ 4 个并列数字指标
- ✓ 指标具有统一语境（同一项目/同一阶段）
- ✓ Header 之后紧接详情页

---

## 11. Multi-Card 9-Grid (Grouped)

**Use for**: 多项目并列展示、模块化成果汇报、Portfolio 展示、3 个并列主题。

**Why a dedicated type**: 3×3 网格 + 行级 Banner 分组是一个独立的视觉单元——和 Section 4 Content 的"Image Showcase"不同（后者是单张主图），也不同于 Section 8 Mixed 的杂糅——它的强约束是"行级色块分组"，迫使读者按"主题扫描"。

### Structure

```
┌───────────── ROW BANNER 1 (colorA) ─────────────────┐
│  ┌──────┐ ┌──────┐ ┌──────┐                          │
│  │ img  │ │ img  │ │ img  │                          │
│  │ 标题 │ │ 标题 │ │ 标题 │                          │
│  │ 描述 │ │ 描述 │ │ 描述 │                          │
│  └──────┘ └──────┘ └──────┘                          │
├───────────── ROW BANNER 2 (colorB) ─────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐                          │
│  ...                                                  │
└──────────────────────────────────────────────────────┘
┌───────────── ROW BANNER 3 (colorC) ─────────────────┐
│  ...                                                  │
└──────────────────────────────────────────────────────┘
```

### Element Spec

| 元素 | Spec |
|------|------|
| Grid 列数 | 固定 **3 列**（更宽则改为 2 列网格） |
| Grid 行数 | 3 行 = 3 个 Banner 组；Banner 数 ≤ 3 行 |
| 每卡内容 | 图片（占左 1/3，宽高比 16:9）+ 标题 + 描述（图右 2/3） |
| Row Banner | 覆盖该行整宽，高度 ≈ 卡内文字高度的 1.5× |
| Banner 文字 | 居左、fontSize ≥ 14、bold、`FFFFFF` 或 `000000` 视底色 |

### Constraint

- 每卡图片保持 16:9 或 4:3 一致比例，**禁止混合比例**
- Banner 高度固定 ≈ 0.4"，**不可让其高度超过卡片**
- 一页 Banner ≤ 3 个（再多则拆页）
- Banner 颜色在三组间区分明显（用 `theme.primary` / `theme.secondary` / `theme.accent`）

### Reuse Conditions

- ✓ 需要在 1 页展示 6-9 个并列模块
- ✓ 模块可自然分为 2-3 个主题组
- ✓ 每模块有 1 张配图 + 标题 + 短描述

不适用的场景：模块描述超长（>60 字），改用 Timeline；模块数 < 6，改用 Icon + text rows。

---

## 12. Comparison + Footer Banner (Cross-Case Summary)

**Use for**: 双项目/双方案横向对比 + 全局机制总结、项目复盘、Cross-Case KPI 对标。

**Why a dedicated type**: Comparison 已由 Section 7 覆盖（双列对称），但本 Pattern 增加"页底全宽 Banner 单句总结"——这个 Footer Banner 把"两个独立案例"提升为"一个论证"——不在已有 Comparison 的视觉单元内，必须独立记录。

### Structure

```
┌────────────────────────┐ ┌────────────────────────┐
│  PROJECT A  (img)      │ │  PROJECT B  (img)      │
│  ┌────┐ ┌────┐         │ │  ┌────┐ ┌────┐         │
│  │img │ │img │         │ │  │img │ │img │         │
│  └────┘ └────┘         │ │  └────┘ └────┘         │
│  描述文字段             │ │  描述文字段             │
│  Stat Bar ▌▌▌▌▌▌       │ │  Stat Bar ▌▌▌▌▌▌       │
└────────────────────────┘ └────────────────────────┘
═══════════════════════════════════════════════════════════
[深色跨页 Banner：单句机制/价值总结（≤ 30 字）]            │
═══════════════════════════════════════════════════════════
```

### Element Spec

| 元素 | Spec |
|------|------|
| 左/右双列 | 等宽（4.2" / 4.2"），与 Section 7 Comparison 一致 |
| 列内结构 | 项目大图（顶部，4:3）+ 2 小图（中段，1:1）+ 文字段（底部，≤ 80 字） |
| Stat Bar | 3 色递减：浅色=基准 / 中色=计划 / 深色=实际；同色色相不同明度 |
| Footer Banner | 跨页全宽，高度 ≈ 0.4-0.5"，纯色填充，1 行加粗文字 |
| Banner 颜色 | 用 `theme.secondary` 或 `theme.primary`，区别于正文区 |

### Constraint

- Stat Bar 必须出现在两列底部的**同一基线上**（不是列内居中）
- Banner 文字 ≤ 30 字、单行、`FFFFFF` 或与底色高对比
- Footer Banner 与正文之间保留 0.15" 留白
- Banner 是"半成品"——本 slide 的次要元素，主要信息在双列

### Reuse Conditions

- ✓ 同时对比 2 个对象（A vs B）
- ✓ 两者指标可量化（Stat Bar 有意义）
- ✓ 需要在不解释的情况下给出"两者共同价值"

不适用：对比数 ≥ 3（改 Section 7 的 Comparison Table）；只有 1 个对象（改 Multi-Card 9-Grid）。
