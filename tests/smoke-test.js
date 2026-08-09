const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pptx-generator-smoke-'));
const deck = path.join(temp, 'deck');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd || root, env: options.env || process.env, encoding: 'utf8', shell: false });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  return result;
}

try {
  run(process.execPath, [path.join(root, 'scripts', 'scaffold-deck.js'), deck]);
  const conflict = spawnSync(process.execPath, [path.join(root, 'scripts', 'scaffold-deck.js'), deck], { cwd: root, encoding: 'utf8' });
  if (conflict.status === 0) throw new Error('Scaffold should refuse conflicting files without --force.');

  const env = { ...process.env };
  if (process.env.PPTX_TEST_NODE_PATH) {
    env.NODE_PATH = process.env.PPTX_TEST_NODE_PATH;
  } else {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    run(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: deck });
  }
  run(process.execPath, ['compile.js'], { cwd: deck, env });
  run(process.execPath, ['qa.js'], { cwd: deck, env });
  const output = path.join(deck, 'output', 'presentation.pptx');
  if (!fs.existsSync(output)) throw new Error('PPTX output was not created.');
  if (process.env.PPTX_TEST_PYTHON) {
    run(process.env.PPTX_TEST_PYTHON, [path.join(root, 'scripts', 'validate-pptx.py'), output]);
  }
  const beforeFailure = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  fs.writeFileSync(path.join(deck, 'slide-02.js'), "throw new Error('intentional smoke failure');\n", 'utf8');
  const failedBuild = spawnSync(process.execPath, ['compile.js'], { cwd: deck, env, encoding: 'utf8', shell: false });
  if (failedBuild.status === 0) throw new Error('Compiler should fail when a slide module throws.');
  const afterFailure = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  if (beforeFailure !== afterFailure) throw new Error('A failed build replaced the last valid PPTX.');
  console.log('Smoke test passed.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
