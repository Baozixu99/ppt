const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ROOT = __dirname;
const PPTX = path.join(ROOT, 'output', 'presentation.pptx');
const REPORT = path.join(ROOT, 'qa-report.json');
const errors = [];
const warnings = [];
const info = [];

function add(list, code, file, message) {
  list.push({ code, file, message });
}

function loadSourceManifest() {
  const manifestPath = path.join(ROOT, 'sources.json');
  if (!fs.existsSync(manifestPath)) {
    add(errors, 'sources-missing', 'sources.json', 'Source manifest is missing.');
    return new Map();
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    add(errors, 'sources-json', 'sources.json', error.message);
    return new Map();
  }
  if (!Array.isArray(manifest.sources)) {
    add(errors, 'sources-schema', 'sources.json', 'Expected a sources array.');
    return new Map();
  }
  const index = new Map();
  const allowedKinds = new Set(['user', 'internal', 'web', 'paper', 'dataset', 'image', 'generated']);
  const externalKinds = new Set(['web', 'paper', 'dataset', 'image']);
  for (const record of manifest.sources) {
    const id = record && record.id;
    if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      add(errors, 'source-id', 'sources.json', `Invalid source id: ${id || '<missing>'}`);
      continue;
    }
    if (index.has(id)) add(errors, 'source-duplicate', 'sources.json', `Duplicate source id: ${id}`);
    if (!allowedKinds.has(record.kind)) add(errors, 'source-kind', 'sources.json', `Invalid kind for ${id}: ${record.kind || '<missing>'}`);
    if (!record.title || !record.usage) add(errors, 'source-required', 'sources.json', `${id} requires title and usage.`);
    if (externalKinds.has(record.kind) && (!record.url || !record.retrievedAt)) {
      add(errors, 'source-provenance', 'sources.json', `${id} requires url and retrievedAt.`);
    }
    index.set(id, record);
  }
  return index;
}

function discoverSlides() {
  return fs.readdirSync(ROOT)
    .map((file) => {
      const match = /^slide-(\d+)(?:-[a-z0-9-]+)?\.js$/i.exec(file);
      return match ? { file, number: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number || a.file.localeCompare(b.file));
}

function checkSource(item, sourceIndex) {
  const source = fs.readFileSync(path.join(ROOT, item.file), 'utf8');
  if (/pres\.shapes\b/.test(source)) add(errors, 'deprecated-shapes', item.file, 'Use pres.ShapeType.');
  if (/pres\.charts\b/.test(source)) add(errors, 'deprecated-charts', item.file, 'Use pres.ChartType.');
  if (/async\s+function\s+createSlide|createSlide\s*=\s*async/.test(source)) add(errors, 'async-slide', item.file, 'createSlide must be synchronous.');
  if (/\b(?:color|fill|line)\s*:\s*['"]#[0-9a-f]{6,8}['"]/i.test(source)) add(errors, 'hash-color', item.file, 'PptxGenJS colors must not start with #.');
  if (/\b(?:lorem|ipsum|placeholder|todo|fixme|tbd|xxxx)\b/i.test(source)) add(errors, 'placeholder', item.file, 'Placeholder token remains in slide source.');

  const allowedTheme = new Set(['primary', 'secondary', 'accent', 'light', 'bg']);
  for (const match of source.matchAll(/theme\.([A-Za-z_$][\w$]*)/g)) {
    if (!allowedTheme.has(match[1])) add(errors, 'theme-key', item.file, `Unsupported theme key: ${match[1]}`);
  }

  const isCover = /\btype\s*:\s*['"]cover['"]/i.test(source);
  if (!isCover && !/\bpageBadge\s*\(|\.slideNumber\s*=/.test(source)) {
    add(errors, 'page-badge', item.file, 'Non-cover slide has no page badge or slideNumber.');
  }
  if (!isCover && !/\.add(?:Shape|Image|Chart|Media)\s*\(/.test(source)) {
    add(warnings, 'visual-carrier', item.file, 'Non-cover slide has no non-text visual call.');
  }
  const fontMatches = Array.from(source.matchAll(/\bfontSize\s*:\s*(\d+(?:\.\d+)?)/g));
  const fontSizes = fontMatches.map((match) => Number(match[1]));
  if (fontSizes.length) {
    const largest = Math.max(...fontSizes);
    const expectedTitle = isCover ? 50 : 35;
    if (largest < expectedTitle) add(warnings, 'title-size', item.file, `Largest explicit font is ${largest}pt; expected at least ${expectedTitle}pt.`);
    for (const match of fontMatches) {
      const value = Number(match[1]);
      const context = source.slice(Math.max(0, match.index - 120), match.index + 40).toLowerCase();
      if (value < 16 && !/(?:source|footer|badge|caption|footnote)/.test(context)) {
        add(warnings, 'small-type', item.file, `Explicit ${value}pt text may be below the body minimum.`);
      }
    }
  }
  const neutralColors = new Set(['000000', 'FFFFFF']);
  for (const match of source.matchAll(/\bcolor\s*:\s*['"]([0-9a-f]{6})['"]/gi)) {
    if (!neutralColors.has(match[1].toUpperCase())) {
      add(warnings, 'raw-color', item.file, `Raw color ${match[1]} should normally come from theme tokens.`);
    }
  }
  if (/\.addChart\s*\(/.test(source) && !/\baddSources\s*\(|\.addNotes\s*\(/.test(source)) {
    add(errors, 'chart-source', item.file, 'Chart slide has no speaker-note source record.');
  }
  for (const call of source.matchAll(/\baddSources\s*\(\s*[^,]+,\s*(\[[^\]]*\]|['"][^'"]+['"])/g)) {
    for (const literal of call[1].matchAll(/['"]([^'"]+)['"]/g)) {
      if (!sourceIndex.has(literal[1])) add(errors, 'source-reference', item.file, `Unknown source id: ${literal[1]}`);
    }
  }
  return /\baddSources\s*\(/.test(source);
}

function parseStory(sourceIndex) {
  const storyPath = path.join(ROOT, 'STORY.md');
  if (!fs.existsSync(storyPath)) {
    add(warnings, 'story-missing', 'STORY.md', 'No STORY contract found; acceptable only in lite mode.');
    return [];
  }
  const lines = fs.readFileSync(storyPath, 'utf8').split(/\r?\n/).filter((line) => /^\s*\|/.test(line));
  if (lines.length < 3) {
    add(errors, 'story-empty', 'STORY.md', 'STORY table has no slide rows.');
    return [];
  }
  const expected = ['#', 'title', 'type', 'role', 'message', 'visual', 'layout', 'sources'];
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
  const header = cells(lines[0]);
  if (expected.some((name, index) => header[index] !== name)) {
    add(errors, 'story-schema', 'STORY.md', `Expected columns: ${expected.join(', ')}`);
    return [];
  }
  const rows = lines.slice(2).map(cells).filter((row) => row.some(Boolean));
  rows.forEach((row, index) => {
    if (row.length !== expected.length || row.some((cell) => !cell)) {
      add(errors, 'story-row', 'STORY.md', `Row ${index + 1} does not contain all required fields.`);
    }
    if (index > 0 && row[5] === rows[index - 1][5] && row[6] === rows[index - 1][6]) {
      add(warnings, 'story-repeat', 'STORY.md', `Rows ${index} and ${index + 1} repeat visual and layout.`);
    }
    if (index > 0 && row[3] === 'hero' && rows[index - 1][3] === 'hero') {
      add(warnings, 'hero-adjacent', 'STORY.md', `Rows ${index} and ${index + 1} are adjacent hero slides.`);
    }
    if (/chart|table/.test(row[5]) && /^(none|-)$/.test(row[7])) {
      add(errors, 'story-source', 'STORY.md', `Row ${index + 1} declares data visual without a source.`);
    }
    const declaredSources = row[7].split(/\s*[,;]\s*/).filter(Boolean);
    for (const sourceId of declaredSources) {
      if (!['none', 'user'].includes(sourceId) && !sourceIndex.has(sourceId)) {
        add(errors, 'story-source-id', 'STORY.md', `Row ${index + 1} references unknown source id: ${sourceId}`);
      }
    }
  });
  return rows;
}

function wordUnits(text) {
  const latin = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || [];
  const cjk = text.match(/[\u3400-\u9FFF]/g) || [];
  return latin.length + cjk.length;
}

async function inspectPptx(expectedCount, sourceNotesExpected) {
  if (!fs.existsSync(PPTX)) {
    add(errors, 'pptx-missing', PPTX, 'Build the presentation before QA.');
    return;
  }
  const zip = await JSZip.loadAsync(fs.readFileSync(PPTX));
  const slideNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  if (slideNames.length !== expectedCount) {
    add(errors, 'page-count', PPTX, `PPTX has ${slideNames.length} slides; expected ${expectedCount}.`);
  }
  slideNames.sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));
  for (let index = 0; index < slideNames.length; index += 1) {
    const xml = await zip.file(slideNames[index]).async('string');
    const texts = Array.from(xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g), (match) => match[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    const combined = texts.join(' ');
    if (/\b(?:lorem|ipsum|placeholder|todo|fixme|tbd|xxxx)\b/i.test(combined)) {
      add(errors, 'pptx-placeholder', slideNames[index], `Slide ${index + 1} contains placeholder text.`);
    }
    const units = wordUnits(combined);
    if (units > 150) add(warnings, 'word-budget', slideNames[index], `Slide ${index + 1} contains about ${units} word units.`);
    info.push({ slide: index + 1, wordUnits: units, textItems: texts.length });
  }
  if (sourceNotesExpected) {
    const noteNames = Object.keys(zip.files).filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name));
    const notes = await Promise.all(noteNames.map((name) => zip.file(name).async('string')));
    if (!notes.some((xml) => xml.includes('[Sources]'))) {
      add(errors, 'source-notes', PPTX, 'Slide source calls did not produce a [Sources] block in speaker notes.');
    }
  }
}

async function main() {
  const slides = discoverSlides();
  if (!slides.length) add(errors, 'slides-missing', ROOT, 'No slide modules found.');
  const sourceIndex = loadSourceManifest();
  const sourceNotesExpected = slides.map((item) => checkSource(item, sourceIndex)).some(Boolean);
  const story = parseStory(sourceIndex);
  if (story.length && story.length !== slides.length) {
    add(errors, 'story-count', 'STORY.md', `STORY has ${story.length} rows; source has ${slides.length} slides.`);
  }
  await inspectPptx(slides.length, sourceNotesExpected);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: { errors: errors.length, warnings: warnings.length, slides: slides.length },
    errors, warnings, slides: info
  };
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  for (const item of errors) console.error(`ERROR ${item.code}: ${item.file} — ${item.message}`);
  for (const item of warnings) console.warn(`WARN  ${item.code}: ${item.file} — ${item.message}`);
  console.log(`QA: ${errors.length} error(s), ${warnings.length} warning(s), ${slides.length} slide(s).`);
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`QA failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
