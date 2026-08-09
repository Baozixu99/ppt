const fs = require('fs');
const os = require('os');
const path = require('path');

function platformFonts() {
  const override = process.env.PPTX_FONT_CN;
  if (override) return { cn: override, en: process.env.PPTX_FONT_EN || 'Arial' };
  if (process.platform === 'darwin') return { cn: 'PingFang SC', en: 'Helvetica' };
  if (process.platform === 'win32') return { cn: 'Microsoft YaHei', en: 'Arial' };
  return { cn: 'Noto Sans CJK SC', en: 'DejaVu Sans' };
}

const FONTS = Object.freeze(platformFonts());

function loadSourceIndex() {
  const manifestPath = path.join(__dirname, 'sources.json');
  if (!fs.existsSync(manifestPath)) return new Map();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return new Map((manifest.sources || []).map((record) => [record.id, record]));
}

const SOURCE_INDEX = loadSourceIndex();

function formatSource(item) {
  const key = String(item || '').trim();
  const record = SOURCE_INDEX.get(key);
  if (!record) return key;
  const owner = [record.creator, record.publisher].filter(Boolean).join(', ');
  return [
    `[${record.id}] ${record.title}`,
    owner,
    record.url,
    record.retrievedAt ? `retrieved ${record.retrievedAt}` : '',
    record.license ? `license: ${record.license}` : '',
    record.usage ? `usage: ${record.usage}` : ''
  ].filter(Boolean).join(' — ');
}

function pageBadge(slide, pres, theme, number) {
  slide.addShape(pres.ShapeType.ellipse, {
    x: 9.25, y: 5.05, w: 0.38, h: 0.38,
    fill: { color: theme.accent },
    line: { color: theme.accent, transparency: 100 }
  });
  slide.addText(String(number), {
    x: 9.25, y: 5.05, w: 0.38, h: 0.38,
    fontFace: FONTS.en, fontSize: 11, bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0
  });
}

function sourceFooter(slide, theme, text) {
  slide.addText(text, {
    x: 0.5, y: 5.08, w: 8.4, h: 0.25,
    fontFace: FONTS.en, fontSize: 9, italic: true,
    color: theme.secondary, margin: 0
  });
}

function addSources(slide, sources) {
  const items = Array.isArray(sources) ? sources : [sources];
  const clean = items.map(formatSource).filter(Boolean);
  if (!clean.length) return;
  slide.addNotes(`[Sources]\n${clean.map((item) => `- ${item}`).join('\n')}`);
}

function addTitle(slide, theme, title) {
  slide.addText(title, {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontFace: FONTS.cn, fontSize: 35, bold: true,
    color: theme.primary, margin: 0, breakLine: false
  });
}

module.exports = { FONTS, addSources, addTitle, pageBadge, sourceFooter, host: os.platform() };
