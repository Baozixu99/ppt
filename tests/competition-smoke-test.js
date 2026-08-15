const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(root, '.tmp-competition-'));
const deck = path.join(temp, 'deck');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    env: options.env || process.env,
    encoding: 'utf8',
    shell: false
  });
  if (result.status !== 0) {
    const launchError = result.error ? `\nlaunch error: ${result.error.code || ''} ${result.error.message}` : '';
    throw new Error(`${command} ${args.join(' ')} failed (status ${result.status}):\n${result.stdout || ''}\n${result.stderr || ''}${launchError}`);
  }
  return result;
}

function runNpm(args, options = {}) {
  if (process.platform === 'win32') {
    const commandProcessor = process.env.ComSpec || 'cmd.exe';
    return run(commandProcessor, ['/d', '/s', '/c', 'npm.cmd', ...args], options);
  }
  return run('npm', args, options);
}

try {
  run(process.execPath, [path.join(root, 'scripts', 'scaffold-deck.js'), deck]);
  const env = { ...process.env };
  if (process.env.PPTX_TEST_NODE_PATH) {
    env.NODE_PATH = process.env.PPTX_TEST_NODE_PATH;
  } else {
    const isolatedNpmCache = path.join(temp, '.npm-cache');
    runNpm(['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', isolatedNpmCache], { cwd: deck });
  }

  fs.writeFileSync(path.join(deck, 'deck-brief.json'), `${JSON.stringify({
    version: 1,
    mode: 'high-stakes',
    renderer: 'pptxgenjs',
    goal: 'Executable 25-slide competition regression',
    audience: 'Technical judges',
    use: '20-minute spoken defense',
    durationMinutes: 20,
    slideBudget: { target: 25, min: 25, max: 25 },
    density: 'high',
    visualDirection: 'academic light blue',
    mustInclude: ['results'],
    mustAvoid: ['unsupported claims'],
    sourceInputs: [{ kind: 'pdf', label: 'fixture', path: '../inputs/fixture.pdf' }],
    assumptions: [],
    unresolvedHighImpact: [],
    checkpoints: { story: 'approved', visualPreview: 'approved', waiverReason: '' }
  }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(deck, 'sources.json'), `${JSON.stringify({
    sources: [{ id: 'report', kind: 'user', title: 'Competition report fixture', usage: 'All slides' }]
  }, null, 2)}\n`, 'utf8');

  const rows = ['| # | title | type | role | message | visual | layout | sources |', '|---:|---|---|---|---|---|---|---|'];
  for (let number = 1; number <= 25; number += 1) {
    const type = number === 1 ? 'cover' : number === 25 ? 'summary' : 'content';
    const role = number === 1 || number === 25 ? 'hero' : 'supporting';
    rows.push(`| ${number} | Slide ${number} | ${type} | ${role} | Evidence message ${number} | shape | evidence-grid | report |`);
  }
  fs.writeFileSync(path.join(deck, 'STORY.md'), `${rows.join('\n')}\n`, 'utf8');

  fs.writeFileSync(path.join(deck, '_shared.js'), `
function createShared(number, pres, theme, helpers) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };
  slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.3, w: 9, h: 3.4, fill: { color: theme.surface }, line: { color: theme.border } });
  slide.addText('Evidence message ' + number, { x: 0.7, y: 0.45, w: 8.6, h: 0.6, fontSize: number === 1 ? 50 : 35, bold: true, color: theme.primary, margin: 0 });
  slide.addText('Shared implementation regression fixture', { x: 0.8, y: 2.3, w: 8.4, h: 0.6, fontSize: 18, color: theme.secondary, align: 'center', margin: 0 });
  if (number > 1) helpers.pageBadge(slide, pres, theme, number);
  helpers.addSources(slide, ['report']);
  return slide;
}
module.exports = { createShared };
`, 'utf8');

  fs.rmSync(path.join(deck, 'slide-01.js'), { force: true });
  for (let number = 1; number <= 25; number += 1) {
    const type = number === 1 ? 'cover' : number === 25 ? 'summary' : 'content';
    fs.writeFileSync(path.join(deck, `slide-${String(number).padStart(2, '0')}.js`), `
const { createShared } = require('./_shared');
const slideConfig = Object.freeze({ type: '${type}', visual: 'shape', sources: ['report'] });
function createSlide(pres, theme, helpers) { return createShared(${number}, pres, theme, helpers); }
module.exports = { createSlide, slideConfig };
`, 'utf8');
  }

  run(process.execPath, ['compile.js'], { cwd: deck, env });
  const qa = run(process.execPath, ['qa.js'], { cwd: deck, env });
  if (/visual-carrier|page-badge/.test(`${qa.stdout}\n${qa.stderr}`)) {
    throw new Error(`QA should follow shared local modules:\n${qa.stdout}\n${qa.stderr}`);
  }
  if (!fs.existsSync(path.join(deck, 'output', 'presentation.pptx'))) throw new Error('Competition fixture PPTX was not created.');
  console.log('Competition 25-slide regression passed.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
