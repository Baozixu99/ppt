const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(root, '.tmp-smoke-'));
const deck = path.join(temp, 'deck');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd || root, env: options.env || process.env, encoding: 'utf8', shell: false });
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
  const conflict = spawnSync(process.execPath, [path.join(root, 'scripts', 'scaffold-deck.js'), deck], { cwd: root, encoding: 'utf8' });
  if (conflict.status === 0) throw new Error('Scaffold should refuse conflicting files without --force.');
  const helperPath = path.join(deck, '_helpers.js');
  fs.appendFileSync(helperPath, '\n// merge-preservation-test\n', 'utf8');
  const missingStarterPath = path.join(deck, '_qa-core.js');
  fs.rmSync(missingStarterPath, { force: true });
  run(process.execPath, [path.join(root, 'scripts', 'scaffold-deck.js'), deck, '--merge']);
  if (!fs.existsSync(missingStarterPath)) throw new Error('Scaffold --merge should restore missing starter files.');
  if (!fs.readFileSync(helperPath, 'utf8').includes('merge-preservation-test')) {
    throw new Error('Scaffold --merge should preserve existing files.');
  }

  const env = { ...process.env };
  if (process.env.PPTX_TEST_NODE_PATH) {
    env.NODE_PATH = process.env.PPTX_TEST_NODE_PATH;
  } else {
    const isolatedNpmCache = path.join(temp, '.npm-cache');
    runNpm(['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', isolatedNpmCache], { cwd: deck });
  }
  const graphEntry = path.join(deck, '_graph-entry-test.js');
  const graphDependency = path.join(deck, '_graph-dependency-test.js');
  fs.writeFileSync(graphDependency, "module.exports = 'dependency-graph-marker';\n", 'utf8');
  fs.writeFileSync(graphEntry, "require('./_graph-dependency-test');\n", 'utf8');
  run(process.execPath, ['-e', "const q=require('./qa'); if(!q.collectLocalSource('_graph-entry-test.js').includes('dependency-graph-marker')) process.exit(1);"], { cwd: deck, env });
  fs.rmSync(graphEntry, { force: true });
  fs.rmSync(graphDependency, { force: true });
  run(process.execPath, ['compile.js'], { cwd: deck, env });
  run(process.execPath, ['qa.js'], { cwd: deck, env });
  const output = path.join(deck, 'output', 'presentation.pptx');
  if (!fs.existsSync(output)) throw new Error('PPTX output was not created.');
  run(process.execPath, ['compile.js', '--slides', '1', '--output', 'output/preview.pptx'], { cwd: deck, env });
  if (!fs.existsSync(path.join(deck, 'output', 'preview.pptx'))) throw new Error('Selected-slide preview was not created.');
  if (process.env.PPTX_TEST_PYTHON) {
    run(process.env.PPTX_TEST_PYTHON, [path.join(root, 'scripts', 'validate-pptx.py'), output]);
  }
  const beforeFailure = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');

  const briefPath = path.join(deck, 'deck-brief.json');
  const validBrief = fs.readFileSync(briefPath, 'utf8');
  const invalidBrief = JSON.parse(validBrief);
  invalidBrief.mode = 'high-stakes';
  invalidBrief.checkpoints.story = 'pending';
  fs.writeFileSync(briefPath, `${JSON.stringify(invalidBrief, null, 2)}\n`, 'utf8');
  const failedContract = spawnSync(process.execPath, ['validate-contracts.js'], { cwd: deck, env, encoding: 'utf8', shell: false });
  if (failedContract.status === 0) throw new Error('Contract validation should reject pending high-stakes checkpoints.');

  invalidBrief.checkpoints.story = 'approved';
  invalidBrief.checkpoints.visualPreview = 'approved';
  invalidBrief.checkpoints.waiverReason = '';
  fs.writeFileSync(briefPath, `${JSON.stringify(invalidBrief, null, 2)}\n`, 'utf8');
  const validHighStakes = spawnSync(process.execPath, ['validate-contracts.js'], { cwd: deck, env, encoding: 'utf8', shell: false });
  if (validHighStakes.status !== 0) throw new Error(`Contract validation should accept resolved high-stakes checkpoints:\n${validHighStakes.stdout}\n${validHighStakes.stderr}`);
  fs.writeFileSync(briefPath, validBrief, 'utf8');

  const dataDir = path.join(deck, '_data');
  fs.mkdirSync(dataDir, { recursive: true });
  const pathFixture = path.join(dataDir, 'absolute-path-fixture.js');
  fs.writeFileSync(pathFixture, "module.exports = 'H:/machine-specific/deck';\n", 'utf8');
  const failedPath = spawnSync(process.execPath, ['validate-contracts.js'], { cwd: deck, env, encoding: 'utf8', shell: false });
  if (failedPath.status === 0 || !`${failedPath.stdout}\n${failedPath.stderr}`.includes('absolute-path')) {
    throw new Error('Contract validation should reject hard-coded machine paths.');
  }
  fs.rmSync(pathFixture, { force: true });

  const compileFailureBrief = JSON.parse(validBrief);
  compileFailureBrief.slideBudget = { target: 2, min: 2, max: 2 };
  fs.writeFileSync(briefPath, `${JSON.stringify(compileFailureBrief, null, 2)}\n`, 'utf8');
  fs.appendFileSync(path.join(deck, 'STORY.md'), '| 2 | Intentional failure | content | supporting | Verify failed builds preserve the last valid PPTX. | text | centered-title | starter-fixture |\n', 'utf8');
  fs.writeFileSync(path.join(deck, 'slide-02.js'), "throw new Error('intentional smoke failure');\n", 'utf8');
  const failedBuild = spawnSync(process.execPath, ['compile.js'], { cwd: deck, env, encoding: 'utf8', shell: false });
  if (failedBuild.status === 0) throw new Error('Compiler should fail when a slide module throws.');
  const afterFailure = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  if (beforeFailure !== afterFailure) throw new Error('A failed build replaced the last valid PPTX.');
  console.log('Smoke test passed.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
