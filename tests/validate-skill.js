const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '__pycache__') return [];
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
  for (const byte of buffer) {
    if (byte < 32 && ![9, 10, 13].includes(byte)) {
      failures.push(`${relative} contains control byte 0x${byte.toString(16).padStart(2, '0')}.`);
      break;
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
