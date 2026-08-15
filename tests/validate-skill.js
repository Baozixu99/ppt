const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '__pycache__' || entry.name === 'output' || entry.name === 'rendered' || entry.name === '.npm-cache' || entry.name.startsWith('.tmp-')) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
const skillhubMetaPath = path.join(root, '_skillhub_meta.json');
let expectedSkillName = path.basename(root);
if (fs.existsSync(skillhubMetaPath)) {
  try {
    const skillhubMeta = JSON.parse(fs.readFileSync(skillhubMetaPath, 'utf8'));
    if (typeof skillhubMeta.name === 'string' && skillhubMeta.name.trim()) {
      expectedSkillName = skillhubMeta.name.trim();
    }
  } catch {
    failures.push('Cannot parse _skillhub_meta.json.');
  }
}

function githubSlug(heading) {
  return heading
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}
for (const required of [
  'skill-manifest.json',
  'references/brief-contract.md',
  'references/renderer-contract.md',
  'references/document-ingestion.md',
  'scripts/verify-deck.py',
  'assets/starter-deck/deck-brief.json',
  'assets/starter-deck/validate-contracts.js',
  'assets/starter-deck/_qa-core.js',
  'assets/starter-deck/_theme.js',
  'assets/starter-deck/package-lock.json',
  'tests/test-render-tools.py',
  'tests/test-pptx-validation.py',
  'tests/test-qa.js',
  'tests/test-theme.js',
  'tests/test-helpers.js',
  'tests/competition-smoke-test.js'
]) {
  if (!fs.existsSync(path.join(root, required))) failures.push(`Required workflow resource is missing: ${required}`);
}
const licensePath = path.join(root, 'LICENSE');
if (!fs.existsSync(licensePath) || !/^MIT License\r?$/m.test(fs.readFileSync(licensePath, 'utf8'))) {
  failures.push('Root LICENSE must contain the selected MIT License.');
}
const agentMetadataPath = path.join(root, 'agents', 'openai.yaml');
if (!fs.existsSync(agentMetadataPath)) {
  failures.push('agents/openai.yaml is missing.');
} else {
  const agentMetadata = fs.readFileSync(agentMetadataPath, 'utf8');
  if (!/default_prompt:\s*"[^"]*\$pptx-generator[^"]*"/.test(agentMetadata)) {
    failures.push('agents/openai.yaml default_prompt must mention $pptx-generator.');
  }
}

const manifestPath = path.join(root, 'skill-manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.schemaVersion !== 1) failures.push('skill-manifest.json schemaVersion must be 1.');
    if (manifest.name !== path.basename(root)) failures.push('skill-manifest.json name must match the Skill directory.');
    if (manifest.entry !== 'SKILL.md' || !fs.existsSync(path.join(root, manifest.entry))) {
      failures.push('skill-manifest.json entry must point to SKILL.md.');
    }
    if (manifest.repositoryMode !== 'repository-is-skill') {
      failures.push('skill-manifest.json must declare repository-is-skill mode.');
    }
    if (manifest.installDirectoryName !== 'pptx-generator') {
      failures.push('skill-manifest.json must preserve the installed directory name pptx-generator.');
    }
    const expectedRuntime = ['SKILL.md', 'agents/**', 'assets/**', 'references/**', 'scripts/**'];
    const expectedDevelopment = ['tests/**', '.github/**', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md'];
    const expectedGenerated = ['node_modules/**', 'output/**', '.npm-cache/**', '__pycache__/**', '.tmp-*/**'];
    for (const item of expectedRuntime) {
      if (!manifest.runtime?.includes(item)) failures.push(`skill-manifest.json runtime boundary is missing: ${item}`);
    }
    for (const item of expectedDevelopment) {
      if (!manifest.development?.includes(item)) failures.push(`skill-manifest.json development boundary is missing: ${item}`);
    }
    for (const item of expectedGenerated) {
      if (!manifest.generated?.includes(item)) failures.push(`skill-manifest.json generated boundary is missing: ${item}`);
    }
    for (const route of ['install-use', 'normal-use', 'modify', 'update', 'contribute']) {
      if (!manifest.intentRoutes?.[route]) failures.push(`skill-manifest.json intent route is missing: ${route}`);
    }
  } catch (error) {
    failures.push(`Cannot parse skill-manifest.json: ${error.message}`);
  }
}

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
for (const marker of [
  '## For AI agents',
  '### Install and use',
  '### Modify an installed copy',
  'repository-is-skill',
  'https://github.com/Baozixu99/ppt'
]) {
  if (!readme.includes(marker)) failures.push(`README.md is missing the AI-agent repository contract marker: ${marker}`);
}
if (!/Never overwrite local improvements silently/i.test(readme)) {
  failures.push('README.md must protect local improvements during updates.');
}
const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(skill);
if (!frontmatter) failures.push('SKILL.md has no YAML frontmatter.');
else {
  const name = /^name:\s*(.+)$/m.exec(frontmatter[1]);
  const description = /^description:\s*(.+)$/m.exec(frontmatter[1]);
  if (!name || name[1].trim() !== expectedSkillName) failures.push('Skill name must match _skillhub_meta.json name.');
  if (!description || !description[1].trim()) failures.push('Skill description is missing.');
  const keys = Array.from(frontmatter[1].matchAll(/^([A-Za-z0-9_-]+):/gm), (match) => match[1]);
  const extra = keys.filter((key) => !['name', 'description'].includes(key));
  if (extra.length) failures.push(`Unexpected frontmatter keys: ${extra.join(', ')}`);
}

for (const file of walk(root)) {
  const relative = path.relative(root, file);
  const buffer = fs.readFileSync(file);
  const isText = /\.(?:md|js|json|yaml|yml|py|txt|gitignore)$/i.test(file) || ['LICENSE', 'SECURITY.md', 'CONTRIBUTING.md'].includes(path.basename(file));
  if (isText) {
    for (const byte of buffer) {
      if (byte < 32 && ![9, 10, 13].includes(byte)) {
        failures.push(`${relative} contains control byte 0x${byte.toString(16).padStart(2, '0')}.`);
        break;
      }
    }
  }
  if (!/\.(md|js)$/.test(file)) continue;
  const content = buffer.toString('utf8');
  if (/pres\.shapes\./.test(content)) failures.push(`${relative} uses the legacy shape namespace.`);
  if (/pres\.charts\./.test(content)) failures.push(`${relative} uses the legacy chart namespace.`);
}

const markdownFiles = walk(root).filter((file) => file.endsWith('.md'));
for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const filePart = target.split('#', 1)[0];
    const resolved = path.resolve(path.dirname(file), filePart);
    if (!fs.existsSync(resolved)) failures.push(`${path.relative(root, file)} has missing link target: ${target}`);
  }
}

const referenceRoot = path.join(root, 'references');
const referenceFiles = walk(referenceRoot).filter((file) => file.endsWith('.md'));
for (const file of referenceFiles) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const content = fs.readFileSync(file, 'utf8');
  if (!skill.includes(`](${relative})`)) {
    failures.push(`${relative} is not linked directly from SKILL.md.`);
  }

  const lineCount = content.split(/\r?\n/).length;
  if (lineCount <= 100) continue;
  const contentsHeading = /^## (?:Contents|目录)\s*$/m.exec(content);
  if (!contentsHeading) {
    failures.push(`${relative} has ${lineCount} lines but no top-level contents navigation.`);
    continue;
  }

  const headings = new Set(
    Array.from(content.matchAll(/^## (.+)$/gm), (match) => githubSlug(match[1]))
  );
  for (const match of content.matchAll(/<a id="([^"]+)"><\/a>/g)) headings.add(match[1]);
  const remainder = content.slice(contentsHeading.index + contentsHeading[0].length);
  const nextHeading = remainder.search(/^## /m);
  const contentsBlock = nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
  const links = Array.from(contentsBlock.matchAll(/\]\(#([^)]+)\)/g), (match) => match[1]);
  if (links.length === 0) failures.push(`${relative} contents section has no local links.`);
  for (const anchor of links) {
    if (!headings.has(anchor)) failures.push(`${relative} contents link does not match a section: #${anchor}`);
  }
}

const forwardCasesPath = path.join(root, 'tests', 'forward-test-cases.json');
try {
  const cases = JSON.parse(fs.readFileSync(forwardCasesPath, 'utf8'));
  const ids = new Set();
  if (!Array.isArray(cases) || cases.length < 6) failures.push('At least six forward test cases are required.');
  for (const item of cases) {
    if (!item.id || ids.has(item.id)) failures.push(`Forward test case has a missing or duplicate id: ${item.id || '<missing>'}`);
    ids.add(item.id);
    if (!item.prompt || !item.expectedMode || !item.expectedNarrativeRoute) failures.push(`Forward test case ${item.id || '<missing>'} is incomplete.`);
    if (!Array.isArray(item.requiredChecks) || item.requiredChecks.length === 0) failures.push(`Forward test case ${item.id || '<missing>'} has no required checks.`);
  }
} catch (error) {
  failures.push(`Cannot parse tests/forward-test-cases.json: ${error.message}`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('Skill validation passed.');
