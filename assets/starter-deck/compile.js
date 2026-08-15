const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const PptxGenJS = require('pptxgenjs');
const helpers = require('./_helpers');
const theme = require('./_theme');

const OUTPUT_DIR = path.join(__dirname, 'output');
let activeTempPath = path.join(OUTPUT_DIR, '.presentation.building.pptx');

function parseSlideSelection(value) {
  if (!value) return null;
  const numbers = new Set();
  for (const token of value.split(',').map((item) => item.trim()).filter(Boolean)) {
    const range = /^(\d+)-(\d+)$/.exec(token);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end < start) throw new Error(`Invalid slide range: ${token}`);
      for (let number = start; number <= end; number += 1) numbers.add(number);
      continue;
    }
    if (!/^\d+$/.test(token) || Number(token) < 1) throw new Error(`Invalid slide number: ${token}`);
    numbers.add(Number(token));
  }
  if (!numbers.size) throw new Error('--slides requires at least one slide number.');
  return numbers;
}

function parseArgs(argv) {
  let output = path.join(OUTPUT_DIR, 'presentation.pptx');
  let selection = null;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      if (!argv[index + 1]) throw new Error('--output requires a path.');
      output = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === '--slides') {
      if (!argv[index + 1]) throw new Error('--slides requires a comma-separated list or range.');
      selection = parseSlideSelection(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (path.extname(output).toLowerCase() !== '.pptx') throw new Error('--output must end in .pptx.');
  return { output, selection };
}

function discoverSlides(dir) {
  return fs.readdirSync(dir)
    .map((file) => {
      const match = /^slide-(\d+)(?:-[a-z0-9-]+)?\.js$/i.exec(file);
      return match ? { file, number: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number || a.file.localeCompare(b.file));
}

function slideCount(pres) {
  return Array.isArray(pres._slides) ? pres._slides.length : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const finalPath = args.output;
  const outputDir = path.dirname(finalPath);
  const stem = path.basename(finalPath, '.pptx');
  const tempPath = path.join(outputDir, `.${stem}.building.pptx`);
  const backupPath = path.join(outputDir, `.${stem}.previous.pptx`);
  activeTempPath = tempPath;
  const contracts = spawnSync(process.execPath, [path.join(__dirname, 'validate-contracts.js')], {
    cwd: __dirname,
    encoding: 'utf8',
    shell: false
  });
  if (contracts.stdout) process.stdout.write(contracts.stdout);
  if (contracts.stderr) process.stderr.write(contracts.stderr);
  if (contracts.status !== 0) throw new Error('Contract validation failed; build was not started.');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.rmSync(tempPath, { force: true });
  if (!fs.existsSync(finalPath) && fs.existsSync(backupPath)) fs.renameSync(backupPath, finalPath);
  else fs.rmSync(backupPath, { force: true });

  const allSlideFiles = discoverSlides(__dirname);
  if (!allSlideFiles.length) throw new Error('No slide-NN.js modules were found.');

  const seenNumbers = new Set();
  for (const item of allSlideFiles) {
    if (seenNumbers.has(item.number)) {
      throw new Error(`Duplicate slide number ${item.number}: use one module per number.`);
    }
    seenNumbers.add(item.number);
  }

  const slideFiles = args.selection
    ? allSlideFiles.filter((item) => args.selection.has(item.number))
    : allSlideFiles;
  if (args.selection) {
    const found = new Set(slideFiles.map((item) => item.number));
    const missing = [...args.selection].filter((number) => !found.has(number));
    if (missing.length) throw new Error(`Selected slide module(s) not found: ${missing.join(', ')}`);
  }

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'pptx-generator';
  pres.subject = 'Generated and verified PowerPoint presentation';
  pres.title = 'Generated Presentation';
  pres.company = '';
  pres.lang = 'zh-CN';

  for (const { file, number } of slideFiles) {
    const modulePath = path.join(__dirname, file);
    delete require.cache[require.resolve(modulePath)];
    const mod = require(modulePath);
    const createSlide = typeof mod === 'function' ? mod : mod.createSlide;
    if (typeof createSlide !== 'function') {
      throw new Error(`${file} does not export createSlide().`);
    }
    if (createSlide.constructor.name === 'AsyncFunction') {
      throw new Error(`${file} exports async createSlide(); slide creation must be synchronous.`);
    }

    const before = slideCount(pres);
    const result = createSlide(pres, theme, helpers);
    if (result && typeof result.then === 'function') {
      throw new Error(`${file} returned a Promise; slide creation must be synchronous.`);
    }
    const after = slideCount(pres);
    if (before !== null && after - before !== 1) {
      throw new Error(`${file} created ${after - before} slides; each module must create exactly one.`);
    }
    process.stdout.write(`✓ ${String(number).padStart(2, '0')} ${file}\n`);
  }

  await pres.writeFile({ fileName: tempPath, compression: true });
  if (fs.existsSync(finalPath)) fs.renameSync(finalPath, backupPath);
  try {
    fs.renameSync(tempPath, finalPath);
    fs.rmSync(backupPath, { force: true });
  } catch (error) {
    if (!fs.existsSync(finalPath) && fs.existsSync(backupPath)) fs.renameSync(backupPath, finalPath);
    throw error;
  }
  process.stdout.write(`Built ${slideFiles.length} slides: ${finalPath}\n`);
}

main().catch((error) => {
  fs.rmSync(activeTempPath, { force: true });
  console.error(`Build failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
