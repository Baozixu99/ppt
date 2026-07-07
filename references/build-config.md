# Build Configuration (package.json + compile.js + _helpers.js)

Reference templates for `slides/` directory. These centralize scripts so PowerShell users avoid the `&&` chain problem, and so common boilerplate (page badges, academic headers) is reused instead of duplicated.

## Directory Layout

```
slides/
├── package.json          (this file)
├── compile.js            (entry point)
├── _helpers.js           (shared helpers — page badge, academic header, etc.)
├── _data/                (optional — chart data / paper-specific numbers)
│   └── artivm-stats.js
├── slide-01.js
├── slide-02.js
├── ...
├── slide-NN.js
├── imgs/                 (optional — images used by slides)
└── output/
    └── presentation.pptx
```

> **Naming convention**: files starting with `_` are framework-level and skipped by the slide auto-discovery regex (see `compile.js`).

---

## slides/package.json

```json
{
  "name": "pptx-deck",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "node compile.js",
    "preview": "node compile.js && node -e \"require('child_process').execSync('start output\\\\\\\\presentation.pptx', {shell:true})\"",
    "qa": "node compile.js && node qa.js",
    "qa:text": "node compile.js && python qa.py"
  },
  "dependencies": {
    "pptxgenjs": "^3.12.0"
  }
}
```

### Run Commands (all platforms — use npm scripts, NOT `&&` chains)

```bash
cd slides
npm install      # one-time
npm run build    # compile to PPTX
npm run qa       # build + extract text via Node (works without Python)
npm run qa:text  # build + extract text via python-pptx (better Chinese support)
```

### Windows install workaround (npm cache EPERM)

On Windows, the default cache directory (`%AppData%\npm-cache` or `D:\nodejs\node_cache`) sometimes fails with:

```
npm error code EPERM
npm error syscall open
npm error path D:\nodejs\node_cache\_cacache\tmp\xxxxx
npm error errno EPERM
```

This is a permissions issue on the global cache, not your project. Use a **local cache**:

```bash
npm install --cache ./.npm-cache
```

Or set it permanently:

```bash
npm config set cache ./.npm-cache --userconfig ./.npmrc
```

For one-off commands without modifying config:

```bash
# PowerShell:
$env:npm_config_cache = "$PWD\.npm-cache"; npm install

# bash/zsh:
npm install --cache ./.npm-cache
```

> **Note**: add `.npm-cache/` to `.gitignore` — it should not be committed.

---

## slides/compile.js

```javascript
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'Generated Presentation';

const theme = {
  primary: "22223b",    // dark color for backgrounds/text
  secondary: "4a4e69",  // secondary accent
  accent: "9a8c98",     // highlight color
  light: "c9ada7",      // light accent
  bg: "f2e9e4"          // background color
};

// Shared helpers — loaded once, passed to every slide.
// Individual slide files can `require('./_helpers')` directly if they prefer.
const helpers = require('./_helpers.js');

// Auto-discover slides — matches BOTH bare (slide-01.js) and descriptive (slide-01-cover.js) filenames
// Files starting with "_" are framework-level and skipped.
const slidesDir = __dirname;
const slideFiles = fs.readdirSync(slidesDir)
  .filter(f => /^slide-\d+(?:-[a-z0-9-]+)?\.js$/.test(f))
  .sort();

const failures = [];
for (const file of slideFiles) {
  let mod;
  try {
    mod = require(path.join(slidesDir, file));
  } catch (err) {
    console.error(`  ✗ ${file} — LOAD FAILED: ${err.message}`);
    failures.push({ file, error: err.message, stage: 'load' });
    continue;
  }
  // Accept either module.exports = createSlide (function) or { createSlide } (object)
  const fn = typeof mod === "function" ? mod : mod.createSlide;
  if (typeof fn !== "function") {
    console.error(`  ✗ ${file} — does not export createSlide()`);
    failures.push({ file, error: 'missing createSlide export', stage: 'export' });
    continue;
  }
  try {
    fn(pres, theme, helpers);
    console.log(`  ✓ ${file}`);
  } catch (err) {
    console.error(`  ✗ ${file} — RUNTIME FAIL: ${err.message}`);
    failures.push({ file, error: err.message, stage: 'runtime' });
  }
}

const succeeded = slideFiles.length - failures.length;
console.log(`\n${succeeded}/${slideFiles.length} slides compiled${failures.length ? ` (${failures.length} failed)` : ''}.`);
if (failures.length) {
  console.error('\nFailed slides:');
  for (const f of failures) console.error(`  [${f.stage}] ${f.file}: ${f.error}`);
}

// Always write to local path first, then copy (avoids Docker mount issues)
const outPath = path.join(slidesDir, 'output', 'presentation.pptx');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
pres.writeFile({ fileName: outPath }).then(() => {
  console.log(`\n✓ Written: ${outPath}`);
  if (failures.length) process.exit(1);
});
```

---

## slides/_helpers.js (shared reusable components)

> **Why a helpers module**: Without it, every slide file repeats the same 30-line `pageBadge()` and `academicHeader()` functions. With 25 slides that's ~750 lines of duplication. Extract once, import everywhere.

```javascript
// slides/_helpers.js
// Shared layout helpers. All functions take (slide, pres, theme, ...)
// and mutate `slide` in place. No globals, no side effects.

function pageBadge(slide, pres, theme, num, opts = {}) {
  const variant = opts.variant || 'circle';
  if (variant === 'pill') {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 9.1, y: 5.15, w: 0.6, h: 0.35,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
      rectRadius: 0.15
    });
    slide.addText(String(num).padStart(2, '0'), {
      x: 9.1, y: 5.15, w: 0.6, h: 0.35,
      fontSize: 11, fontFace: 'Arial',
      color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
    });
  } else {
    slide.addShape(pres.shapes.OVAL, {
      x: 9.3, y: 5.1, w: 0.4, h: 0.4,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    slide.addText(String(num), {
      x: 9.3, y: 5.1, w: 0.4, h: 0.4,
      fontSize: 12, fontFace: 'Arial',
      color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
    });
  }
}

function academicHeader(slide, pres, theme, opts) {
  // opts: { number, subtitle, mainTitle, topColor }
  const topColor = opts.topColor || theme.primary;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.18,
    fill: { color: topColor }, line: { color: topColor, width: 0 }
  });
  slide.addText(opts.number, {
    x: 0.5, y: 0.32, w: 0.9, h: 0.5,
    fontSize: 24, bold: true, color: theme.accent, fontFace: 'Arial'
  });
  slide.addText(opts.subtitle, {
    x: 1.4, y: 0.36, w: 3.0, h: 0.45,
    fontSize: 14, bold: true, color: theme.primary,
    fontFace: FONT_CN, valign: 'middle'
  });
  slide.addText(opts.mainTitle, {
    x: 0.5, y: 0.8, w: 9, h: 0.45,
    fontSize: 22, bold: true, color: '000000',
    fontFace: FONT_CN, valign: 'middle'
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.3, w: 9.0, h: 0,
    line: { color: theme.primary, width: 1.5 }
  });
}

function topBand(slide, pres, theme, opts) {
  // opts: { color, height }
  const h = opts.height || 0.55;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h,
    fill: { color: opts.color || theme.primary }, line: { width: 0 }
  });
}

function sourceFooter(slide, pres, theme, text) {
  slide.addText(text, {
    x: 0.5, y: 5.05, w: 8.6, h: 0.3,
    fontSize: 10, italic: true, color: theme.secondary,
    fontFace: 'Arial'
  });
}

function kpiCard(slide, pres, theme, opts) {
  // opts: { x, y, w, h, value, label, sub, color }
  const c = opts.color || theme.accent;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    fill: { color: 'FFFFFF' }, line: { color: theme.light, width: 1 },
    rectRadius: 0.06
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: opts.x, y: opts.y, w: 0.06, h: opts.h,
    fill: { color: c }, line: { color: c, width: 0 }
  });
  slide.addText(opts.value, {
    x: opts.x + 0.15, y: opts.y + 0.05, w: opts.w - 0.2, h: opts.h * 0.55,
    fontSize: 22, bold: true, color: theme.primary,
    fontFace: 'Arial', valign: 'middle'
  });
  slide.addText(opts.label, {
    x: opts.x + 0.15, y: opts.y + opts.h * 0.6, w: opts.w - 0.2, h: opts.h * 0.2,
    fontSize: 10, color: theme.secondary, fontFace: FONT_CN, valign: 'middle'
  });
  if (opts.sub) {
    slide.addText(opts.sub, {
      x: opts.x + 0.15, y: opts.y + opts.h * 0.78, w: opts.w - 0.2, h: opts.h * 0.2,
      fontSize: 9, italic: true, color: c, fontFace: FONT_CN, valign: 'middle'
    });
  }
}

// Cross-platform font fallback chain. See design-system.md#font-fallback-chain.
const FONT_CN = 'Microsoft YaHei, PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif';

module.exports = {
  pageBadge,
  academicHeader,
  topBand,
  sourceFooter,
  kpiCard,
  FONT_CN
};
```

### Usage in slide-XX.js

```javascript
// slide-04.js — drops from ~110 lines to ~50
const helpers = require('./_helpers.js');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  helpers.academicHeader(slide, pres, theme, {
    number: '1.1',
    subtitle: '研究背景',
    mainTitle: '端侧异构计算推动“一芯多域”多内核泛在 OS 演进'
  });

  // ... body content here ...

  helpers.pageBadge(slide, pres, theme, 4);
  return slide;
}

module.exports = { createSlide };
```

> **Why `createSlide(pres, theme)` (not `createSlide(pres, theme, helpers)`)**: keep the standard signature for backwards compatibility. Each slide can `require('./_helpers.js')` directly. The third arg in `compile.js` is for slides that prefer dependency injection.

---

## slides/qa.js (Node-based text extraction — no Python required)

```javascript
// slides/qa.js — extract all text from PPTX for QA / grep
// Usage: node qa.js [path/to/presentation.pptx]
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');  // pptxgenjs's transitive dep — usually present

const target = process.argv[2] || path.join(__dirname, 'output', 'presentation.pptx');
if (!fs.existsSync(target)) {
  console.error('PPTX not found:', target);
  process.exit(1);
}

// Simple regex-based XML text extraction (good enough for QA grep)
const data = fs.readFileSync(target);
JSZip.loadAsync(data).then(zip => {
  const slideFiles = Object.keys(zip.files)
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)/)[1], 10);
      return na - nb;
    });

  console.log(`=== ${target} | ${slideFiles.length} slides ===\n`);
  const tasks = slideFiles.map((name, i) => zip.files[name].async('string').then(xml => {
    const texts = [];
    const re = /<a:t[^>]*>([^<]*)<\/a:t>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const t = m[1].trim();
      if (t) texts.push(t);
    }
    console.log(`--- Slide ${i + 1} ---`);
    texts.slice(0, 8).forEach(t => console.log('  ' + t.slice(0, 140)));
    console.log('');
  }));
  return Promise.all(tasks);
}).catch(err => {
  console.error('QA extraction failed:', err.message);
  process.exit(1);
});
```

> **Note**: If `JSZip` is missing, run `npm install jszip` once. (`pptxgenjs` already depends on `jszip` transitively, so it's usually available — but add it explicitly to `package.json` if needed.)

For richer Chinese-aware extraction, use the **python-pptx fallback** in [pitfalls.md](pitfalls.md#qa-tool-fallback-when-markitdown-fails).

---

## Why These Templates

- **npm scripts over `&&` chains**: PowerShell does NOT support `&&`. `npm run build` works in bash, zsh, PowerShell, and cmd uniformly.
- **Auto-discover slides**: filename regex `slide-NN.js` or `slide-NN-name.js` lets you group or rename without changing the compile script.
- **Dual export shape**: supports `module.exports = createSlide` (function) or `module.exports = { createSlide }` (object). Choose either consistently within a deck.
- **Local-then-copy output path**: avoids Docker bind-mount issues with `pres.writeFile`'s internal seek.
- **Helpers module (`_helpers.js`)**: reduces 750 lines of duplicated badge/header code to ~150 lines centralized. See [pitfalls.md → §Common Mistakes](#common-mistakes-to-avoid) for layout variety tips.
- **Optional data layer (`_data/`)**: keeps paper-specific numbers (chart values, table data) out of view code. See [data-layer.md](data-layer.md) for the convention.
- **`_` prefix skip**: the regex filters out `_helpers.js`, `_data/`, etc. — these are framework files, not slides.

## Customization

- **Different palette**: edit the `theme` object — keys must remain `primary / secondary / accent / light / bg`.
- **Different layout**: change `pres.layout` to `'LAYOUT_16x10'`, `'LAYOUT_4x3'`, or `'LAYOUT_WIDE'`. Match this in each `slide-XX.js` coordinate math.
- **Different output filename**: change `outPath` and update `npm run preview` accordingly.
- **Add new helpers**: append to `_helpers.js`. All slides that `require('./_helpers.js')` will see it immediately.