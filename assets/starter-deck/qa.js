const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const JSZip = require('jszip');
const { extractTextRuns, geometryIssues, wordBudgetForDensity, wordUnits } = require('./_qa-core');

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

function collectLocalSource(entryFile) {
  const visited = new Set();
  const chunks = [];
  function visit(absolute) {
    const resolved = path.resolve(absolute);
    if (visited.has(resolved) || !resolved.startsWith(`${ROOT}${path.sep}`) && resolved !== ROOT) return;
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return;
    visited.add(resolved);
    const source = fs.readFileSync(resolved, 'utf8');
    chunks.push(source);
    for (const match of source.matchAll(/\brequire\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
      const base = path.resolve(path.dirname(resolved), match[1]);
      const candidates = [base, `${base}.js`, path.join(base, 'index.js')];
      const target = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (target) visit(target);
    }
  }
  visit(path.join(ROOT, entryFile));
  return chunks.join('\n');
}

function checkSource(item, sourceIndex, density) {
  const source = fs.readFileSync(path.join(ROOT, item.file), 'utf8');
  const reachableSource = collectLocalSource(item.file);
  const declaredSourceIds = [];
  let slideConfig = {};
  try {
    const mod = require(path.join(ROOT, item.file));
    slideConfig = mod && (mod.slideConfig || mod.meta) || {};
  } catch {
    // The compiler reports module-load failures with a more useful stack trace.
  }
  if (/pres\.shapes\b/.test(source)) add(errors, 'deprecated-shapes', item.file, 'Use pres.ShapeType.');
  if (/pres\.charts\b/.test(source)) add(errors, 'deprecated-charts', item.file, 'Use pres.ChartType.');
  if (/async\s+function\s+createSlide|createSlide\s*=\s*async/.test(source)) add(errors, 'async-slide', item.file, 'createSlide must be synchronous.');
  if (/\b(?:color|fill|line)\s*:\s*['"]#[0-9a-f]{6,8}['"]/i.test(source)) add(errors, 'hash-color', item.file, 'PptxGenJS colors must not start with #.');
  if (/\b(?:lorem|ipsum|placeholder|todo|fixme|tbd|xxxx)\b/i.test(source)) add(errors, 'placeholder', item.file, 'Placeholder token remains in slide source.');

  const isCover = slideConfig.type === 'cover' || /\btype\s*:\s*['"]cover['"]/i.test(source);
  if (!isCover && !/\bpageBadge\s*\(|\.slideNumber\s*=/.test(reachableSource)) {
    add(errors, 'page-badge', item.file, 'Non-cover slide has no page badge or slideNumber.');
  }
  const declaredVisual = String(slideConfig.visual || '').toLowerCase();
  if (!isCover && !declaredVisual.match(/chart|diagram|image|table|icon|shape|timeline|comparison/) && !/\.add(?:Shape|Image|Chart|Media)\s*\(/.test(reachableSource)) {
    add(warnings, 'visual-carrier', item.file, 'Non-cover slide has no non-text visual call.');
  }
  const fontMatches = Array.from(source.matchAll(/\bfontSize\s*:\s*(\d+(?:\.\d+)?)/g));
  const fontSizes = fontMatches.map((match) => Number(match[1]));
  if (fontSizes.length) {
    const largest = Math.max(...fontSizes);
    const dense = ['high', 'dense', 'compact'].includes(String(density || '').toLowerCase());
    const expectedTitle = isCover ? 50 : dense ? 30 : 35;
    if (largest < expectedTitle) add(warnings, 'title-size', item.file, `Largest explicit font is ${largest}pt; expected at least ${expectedTitle}pt.`);
    for (const match of fontMatches) {
      const value = Number(match[1]);
      const context = source.slice(Math.max(0, match.index - 120), match.index + 40).toLowerCase();
      const bodyMinimum = dense ? 14 : 16;
      if (value < bodyMinimum && !/(?:source|footer|badge|caption|footnote)/.test(context)) {
        add(warnings, 'small-type', item.file, `Explicit ${value}pt text may be below the configured ${bodyMinimum}pt body minimum.`);
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
  for (const call of source.matchAll(/\badd(?:Sources|SourcedImage)\s*\(\s*[^,]+,\s*(\[[^\]]*\]|['"][^'"]+['"])/g)) {
    for (const literal of call[1].matchAll(/['"]([^'"]+)['"]/g)) {
      declaredSourceIds.push(literal[1]);
      if (!sourceIndex.has(literal[1])) add(errors, 'source-reference', item.file, `Unknown source id: ${literal[1]}`);
    }
  }
  for (const id of Array.isArray(slideConfig.sources) ? slideConfig.sources : []) {
    if (!declaredSourceIds.includes(id)) declaredSourceIds.push(id);
    if (!sourceIndex.has(id)) add(errors, 'source-reference', item.file, `Unknown source id: ${id}`);
  }
  return declaredSourceIds;
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

function notesTarget(zipNames, slideNumber) {
  const relsName = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
  const rels = zipNames.get(relsName);
  if (!rels) return null;
  for (const tag of rels.match(/<Relationship\b[^>]*>/g) || []) {
    const type = /\bType="([^"]+)"/.exec(tag);
    const target = /\bTarget="([^"]+)"/.exec(tag);
    if (type && /\/notesSlide$/.test(type[1]) && target) {
      return path.posix.normalize(path.posix.join('ppt/slides', target[1]));
    }
  }
  return null;
}

async function inspectPptx(expectedCount, slideSources, wordBudget) {
  if (!fs.existsSync(PPTX)) {
    add(errors, 'pptx-missing', PPTX, 'Build the presentation before QA.');
    return;
  }
  const zip = await JSZip.loadAsync(fs.readFileSync(PPTX));
  const zipText = new Map();
  for (const name of Object.keys(zip.files).filter((name) => name.endsWith('.rels'))) {
    zipText.set(name, await zip.file(name).async('string'));
  }
  const slideNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  if (slideNames.length !== expectedCount) {
    add(errors, 'page-count', PPTX, `PPTX has ${slideNames.length} slides; expected ${expectedCount}.`);
  }
  slideNames.sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));
  for (let index = 0; index < slideNames.length; index += 1) {
    const xml = await zip.file(slideNames[index]).async('string');
    const texts = extractTextRuns(xml);
    const combined = texts.join(' ');
    if (/\b(?:lorem|ipsum|placeholder|todo|fixme|tbd|xxxx)\b/i.test(combined)) {
      add(errors, 'pptx-placeholder', slideNames[index], `Slide ${index + 1} contains placeholder text.`);
    }
    const units = wordUnits(combined);
    if (units > wordBudget) add(warnings, 'word-budget', slideNames[index], `Slide ${index + 1} contains about ${units} word units; configured limit is ${wordBudget}.`);
    const geometry = geometryIssues(xml);
    if (geometry.length) {
      add(errors, 'pptx-invalid-extent', slideNames[index], `Slide ${index + 1} contains invalid DrawingML extents: ${geometry.join(', ')}.`);
    }
    info.push({ slide: index + 1, wordUnits: units, textItems: texts.length });
  }
  for (let index = 0; index < slideSources.length; index += 1) {
    if (!slideSources[index].length) continue;
    const target = notesTarget(zipText, index + 1);
    if (!target || !zip.file(target)) {
      add(errors, 'source-notes-missing', PPTX, `Slide ${index + 1} declares sources but has no speaker-notes part.`);
      continue;
    }
    const xml = await zip.file(target).async('string');
    if (!xml.includes('[Sources]')) {
      add(errors, 'source-notes-block', target, `Slide ${index + 1} speaker notes omit the [Sources] block.`);
    }
  }
}

async function main() {
  const contracts = spawnSync(process.execPath, [path.join(ROOT, 'validate-contracts.js')], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: false
  });
  if (contracts.stdout) process.stdout.write(contracts.stdout);
  if (contracts.stderr) process.stderr.write(contracts.stderr);
  if (contracts.status !== 0) {
    add(errors, 'contracts', 'validate-contracts.js', 'Contract validation failed.');
  }
  const slides = discoverSlides();
  if (!slides.length) add(errors, 'slides-missing', ROOT, 'No slide modules found.');
  const sourceIndex = loadSourceManifest();
  let density = 'standard';
  try {
    density = JSON.parse(fs.readFileSync(path.join(ROOT, 'deck-brief.json'), 'utf8')).density || density;
  } catch {
    // Contract validation reports missing or malformed brief files.
  }
  const wordBudget = wordBudgetForDensity(density);
  const slideSources = slides.map((item) => checkSource(item, sourceIndex, density));
  const story = parseStory(sourceIndex);
  if (story.length && story.length !== slides.length) {
    add(errors, 'story-count', 'STORY.md', `STORY has ${story.length} rows; source has ${slides.length} slides.`);
  }
  story.forEach((row, index) => {
    const expected = row[7].split(/\s*[,;]\s*/).filter((id) => id && !['none', 'user'].includes(id));
    const actual = new Set(slideSources[index] || []);
    for (const id of expected) {
      if (!actual.has(id)) add(errors, 'story-slide-source', slides[index] ? slides[index].file : 'STORY.md', `STORY expects source ${id}, but the slide module does not call addSources() with it.`);
    }
  });
  await inspectPptx(slides.length, slideSources, wordBudget);

  const report = {
    generatedAt: new Date().toISOString(),
    configuration: { density, wordBudget },
    summary: { errors: errors.length, warnings: warnings.length, slides: slides.length },
    errors, warnings, slides: info
  };
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  for (const item of errors) console.error(`ERROR ${item.code}: ${item.file} — ${item.message}`);
  for (const item of warnings) console.warn(`WARN  ${item.code}: ${item.file} — ${item.message}`);
  console.log(`QA: ${errors.length} error(s), ${warnings.length} warning(s), ${slides.length} slide(s).`);
  if (errors.length) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`QA failed: ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { collectLocalSource, extractTextRuns, geometryIssues, wordBudgetForDensity, wordUnits };
