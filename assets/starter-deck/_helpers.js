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

function finiteCoordinate(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be a finite number; received ${value}.`);
  return value;
}

function connectorGeometry(from, to) {
  const x1 = finiteCoordinate(from && from.x, 'from.x');
  const y1 = finiteCoordinate(from && from.y, 'from.y');
  const x2 = finiteCoordinate(to && to.x, 'to.x');
  const y2 = finiteCoordinate(to && to.y, 'to.y');
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
    flipH: x2 < x1,
    flipV: y2 < y1
  };
}

function addConnector(slide, pres, from, to, line = {}) {
  if (!slide || typeof slide.addShape !== 'function') throw new TypeError('addConnector requires a slide.');
  const geometry = connectorGeometry(from, to);
  slide.addShape(pres.ShapeType.line, {
    ...geometry,
    line: { width: 1.5, endArrowType: 'triangle', ...line }
  });
}

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

function addSourcedImage(slide, sources, imageOptions) {
  const ids = (Array.isArray(sources) ? sources : [sources]).map((item) => String(item || '').trim()).filter(Boolean);
  if (!ids.length) throw new Error('addSourcedImage requires at least one source id.');
  for (const id of ids) {
    if (!SOURCE_INDEX.has(id)) throw new Error(`Unknown image source id: ${id}`);
  }
  const altText = [imageOptions.altText, `[sources:${ids.join(',')}]`].filter(Boolean).join(' ');
  slide.addImage({ ...imageOptions, altText });
  addSources(slide, ids);
}

function addTitle(slide, theme, title) {
  slide.addText(title, {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontFace: FONTS.cn, fontSize: 35, bold: true,
    color: theme.primary, margin: 0, breakLine: false
  });
}

module.exports = {
  FONTS,
  addConnector,
  addSourcedImage,
  addSources,
  addTitle,
  connectorGeometry,
  pageBadge,
  sourceFooter,
  host: os.platform()
};
