const assert = require('assert');
const path = require('path');

const theme = require(path.join(__dirname, '..', 'assets', 'starter-deck', '_theme.js'));

assert.strictEqual(theme.primary, '22223B');
assert.throws(() => theme.missingToken, /Unknown theme token/);

console.log('Theme contract tests passed.');
