const fs = require('fs');
const path = require('path');

function listFiles(root, current = root) {
  const files = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(root, absolute));
    else files.push(path.relative(root, absolute));
  }
  return files;
}

function main() {
  const args = process.argv.slice(2);
  const forceIndex = args.indexOf('--force');
  const force = forceIndex >= 0;
  if (force) args.splice(forceIndex, 1);
  if (args.length !== 1) {
    console.error('Usage: node scripts/scaffold-deck.js <destination> [--force]');
    process.exit(2);
  }

  const source = path.resolve(__dirname, '..', 'assets', 'starter-deck');
  const destination = path.resolve(process.cwd(), args[0]);
  if (destination === source || destination.startsWith(source + path.sep)) {
    throw new Error('Destination cannot be inside the starter-deck source.');
  }

  const files = listFiles(source);
  const conflicts = files.filter((relative) => fs.existsSync(path.join(destination, relative)));
  if (conflicts.length && !force) {
    throw new Error(`Destination contains ${conflicts.length} conflicting file(s):\n${conflicts.join('\n')}\nUse --force to overwrite them.`);
  }

  for (const relative of files) {
    const from = path.join(source, relative);
    const to = path.join(destination, relative);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  console.log(`Scaffolded ${files.length} files in ${destination}`);
}

try {
  main();
} catch (error) {
  console.error(`Scaffold failed: ${error.message}`);
  process.exitCode = 1;
}
