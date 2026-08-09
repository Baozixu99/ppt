const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const helpers = require('./_helpers');

const OUTPUT_DIR = path.join(__dirname, 'output');
const FINAL_PATH = path.join(OUTPUT_DIR, 'presentation.pptx');
const TEMP_PATH = path.join(OUTPUT_DIR, '.presentation.building.pptx');
const BACKUP_PATH = path.join(OUTPUT_DIR, '.presentation.previous.pptx');

const theme = Object.freeze({
  primary: '22223B',
  secondary: '4A4E69',
  accent: '9A8C98',
  light: 'C9ADA7',
  bg: 'F2E9E4'
});

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
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.rmSync(TEMP_PATH, { force: true });
  if (!fs.existsSync(FINAL_PATH) && fs.existsSync(BACKUP_PATH)) fs.renameSync(BACKUP_PATH, FINAL_PATH);
  else fs.rmSync(BACKUP_PATH, { force: true });

  const slideFiles = discoverSlides(__dirname);
  if (!slideFiles.length) throw new Error('No slide-NN.js modules were found.');

  const seenNumbers = new Set();
  for (const item of slideFiles) {
    if (seenNumbers.has(item.number)) {
      throw new Error(`Duplicate slide number ${item.number}: use one module per number.`);
    }
    seenNumbers.add(item.number);
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

  await pres.writeFile({ fileName: TEMP_PATH, compression: true });
  if (fs.existsSync(FINAL_PATH)) fs.renameSync(FINAL_PATH, BACKUP_PATH);
  try {
    fs.renameSync(TEMP_PATH, FINAL_PATH);
    fs.rmSync(BACKUP_PATH, { force: true });
  } catch (error) {
    if (!fs.existsSync(FINAL_PATH) && fs.existsSync(BACKUP_PATH)) fs.renameSync(BACKUP_PATH, FINAL_PATH);
    throw error;
  }
  process.stdout.write(`Built ${slideFiles.length} slides: ${FINAL_PATH}\n`);
}

main().catch((error) => {
  fs.rmSync(TEMP_PATH, { force: true });
  console.error(`Build failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
