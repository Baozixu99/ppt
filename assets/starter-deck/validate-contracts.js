const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const errors = [];
const warnings = [];

function add(list, code, file, message) {
  list.push({ code, file, message });
}

function readJson(file) {
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) {
    add(errors, 'missing', file, 'Required contract file is missing.');
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    add(errors, 'json', file, error.message);
    return null;
  }
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

function parseStory(sourceIds, required) {
  const file = 'STORY.md';
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) {
    if (required) add(errors, 'story-missing', file, 'Full and high-stakes modes require STORY.md.');
    return [];
  }
  const tableLines = fs.readFileSync(absolute, 'utf8').split(/\r?\n/).filter((line) => /^\s*\|/.test(line));
  if (tableLines.length < 3) {
    add(errors, 'story-empty', file, 'STORY table has no slide rows.');
    return [];
  }
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
  const expected = ['#', 'title', 'type', 'role', 'message', 'visual', 'layout', 'sources'];
  const header = cells(tableLines[0]);
  if (expected.some((name, index) => header[index] !== name)) {
    add(errors, 'story-schema', file, `Expected columns: ${expected.join(', ')}`);
    return [];
  }
  const rows = tableLines.slice(2).map(cells).filter((row) => row.some(Boolean));
  rows.forEach((row, index) => {
    const label = `Row ${index + 1}`;
    if (row.length !== expected.length || row.some((cell) => !cell)) {
      add(errors, 'story-row', file, `${label} does not contain all required fields.`);
      return;
    }
    if (Number(row[0]) !== index + 1) add(errors, 'story-number', file, `${label} must be numbered ${index + 1}.`);
    if (/chart|table/i.test(row[5]) && /^(none|-)$/i.test(row[7])) {
      add(errors, 'story-source', file, `${label} declares a quantitative visual without a source.`);
    }
    for (const id of row[7].split(/\s*[,;]\s*/).filter(Boolean)) {
      if (!['none', 'user'].includes(id) && !sourceIds.has(id)) {
        add(errors, 'story-source-id', file, `${label} references unknown source id: ${id}`);
      }
    }
  });
  return rows;
}

function validateBrief(brief) {
  if (!brief) return;
  const required = ['version', 'mode', 'renderer', 'goal', 'audience', 'use', 'slideBudget', 'density', 'visualDirection', 'mustInclude', 'mustAvoid', 'assumptions', 'unresolvedHighImpact', 'checkpoints'];
  for (const key of required) {
    if (brief[key] === undefined || brief[key] === null && key !== 'durationMinutes') {
      add(errors, 'brief-required', 'deck-brief.json', `Missing required field: ${key}`);
    }
  }
  if (!['lite', 'full', 'high-stakes'].includes(brief.mode)) add(errors, 'brief-mode', 'deck-brief.json', `Unsupported mode: ${brief.mode}`);
  if (brief.renderer !== 'pptxgenjs') add(errors, 'brief-renderer', 'deck-brief.json', 'The PptxGenJS starter requires renderer="pptxgenjs". Use a separate host adapter project for another renderer.');
  const budget = brief.slideBudget || {};
  if (![budget.min, budget.target, budget.max].every(Number.isInteger) || !(budget.min <= budget.target && budget.target <= budget.max)) {
    add(errors, 'brief-budget', 'deck-brief.json', 'slideBudget must contain integer min <= target <= max.');
  }
  if (brief.mode === 'lite' && budget.max > 8) add(errors, 'brief-lite-budget', 'deck-brief.json', 'Lite mode cannot exceed 8 slides.');
  for (const key of ['mustInclude', 'mustAvoid', 'assumptions', 'unresolvedHighImpact']) {
    if (!Array.isArray(brief[key])) add(errors, 'brief-array', 'deck-brief.json', `${key} must be an array.`);
  }
  const checkpoints = brief.checkpoints || {};
  const allowed = new Set(['approved', 'waived', 'pending']);
  for (const key of ['story', 'visualPreview']) {
    if (!allowed.has(checkpoints[key])) add(errors, 'brief-checkpoint', 'deck-brief.json', `${key} checkpoint must be approved, waived, or pending.`);
  }
  if (brief.mode === 'high-stakes') {
    if (Array.isArray(brief.unresolvedHighImpact) && brief.unresolvedHighImpact.length) {
      add(errors, 'brief-unresolved', 'deck-brief.json', 'Resolve all high-impact questions before a high-stakes build.');
    }
    if (['story', 'visualPreview'].some((key) => checkpoints[key] === 'pending')) {
      add(errors, 'brief-checkpoint-pending', 'deck-brief.json', 'High-stakes checkpoints cannot remain pending.');
    }
  }
  if (['story', 'visualPreview'].some((key) => checkpoints[key] === 'waived') && !String(checkpoints.waiverReason || '').trim()) {
    add(errors, 'brief-waiver', 'deck-brief.json', 'A checkpoint waiver requires waiverReason.');
  }
}

function validateSources(manifest) {
  const ids = new Set();
  if (!manifest || !Array.isArray(manifest.sources)) {
    add(errors, 'sources-schema', 'sources.json', 'Expected a sources array.');
    return ids;
  }
  const allowedKinds = new Set(['user', 'internal', 'web', 'paper', 'dataset', 'image', 'generated']);
  const externalKinds = new Set(['web', 'paper', 'dataset', 'image']);
  for (const record of manifest.sources) {
    const id = record && record.id;
    if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      add(errors, 'source-id', 'sources.json', `Invalid source id: ${id || '<missing>'}`);
      continue;
    }
    if (ids.has(id)) add(errors, 'source-duplicate', 'sources.json', `Duplicate source id: ${id}`);
    ids.add(id);
    if (!allowedKinds.has(record.kind)) add(errors, 'source-kind', 'sources.json', `Invalid kind for ${id}: ${record.kind || '<missing>'}`);
    if (!record.title || !record.usage) add(errors, 'source-required', 'sources.json', `${id} requires title and usage.`);
    if (externalKinds.has(record.kind) && (!record.url || !record.retrievedAt)) {
      add(errors, 'source-provenance', 'sources.json', `${id} requires url and retrievedAt.`);
    }
  }
  return ids;
}

function validatePortablePaths() {
  const candidates = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', 'output', '.npm-cache'].includes(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(?:js|json)$/i.test(entry.name)) candidates.push(absolute);
    }
  }
  walk(ROOT);
  const literal = /['"`]([A-Za-z]:[\\/][^'"`\r\n]+|\/(?:Users|home)\/[^'"`\r\n]+)['"`]/g;
  for (const absolute of candidates) {
    const content = fs.readFileSync(absolute, 'utf8');
    for (const match of content.matchAll(literal)) {
      add(errors, 'absolute-path', path.relative(ROOT, absolute), `Hard-coded machine path: ${match[1]}`);
    }
  }
}

function main() {
  const brief = readJson('deck-brief.json');
  const manifest = readJson('sources.json');
  validateBrief(brief);
  const sourceIds = validateSources(manifest);
  const rows = parseStory(sourceIds, brief && brief.mode !== 'lite');
  const slides = discoverSlides();
  if (!slides.length) add(errors, 'slides-missing', ROOT, 'No slide modules found.');
  if (rows.length && rows.length !== slides.length) add(errors, 'story-count', 'STORY.md', `STORY has ${rows.length} rows; source has ${slides.length} slides.`);
  const budget = brief && brief.slideBudget;
  if (budget && Number.isInteger(budget.min) && (slides.length < budget.min || slides.length > budget.max)) {
    add(errors, 'slide-budget', 'deck-brief.json', `Found ${slides.length} slide modules; expected ${budget.min}-${budget.max}.`);
  }
  if (budget && rows.length && (rows.length < budget.min || rows.length > budget.max)) {
    add(errors, 'story-budget', 'STORY.md', `Found ${rows.length} STORY rows; expected ${budget.min}-${budget.max}.`);
  }
  validatePortablePaths();
  for (const item of errors) console.error(`ERROR ${item.code}: ${item.file} — ${item.message}`);
  for (const item of warnings) console.warn(`WARN  ${item.code}: ${item.file} — ${item.message}`);
  console.log(`Contracts: ${errors.length} error(s), ${warnings.length} warning(s), ${slides.length} slide module(s).`);
  if (errors.length) process.exitCode = 1;
}

main();
