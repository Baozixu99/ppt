const assert = require('assert');
const path = require('path');

const qa = require(path.join(__dirname, '..', 'assets', 'starter-deck', '_qa-core.js'));

const arrowXml = [
  '<a:ln>',
  '<a:tailEnd type="triangle"/>',
  '</a:ln>',
  '<a:r><a:t>Only visible text</a:t></a:r>'
].join('');

assert.deepStrictEqual(
  qa.extractTextRuns(arrowXml),
  ['Only visible text'],
  'Text extraction must not treat a:tailEnd as an a:t element.'
);
assert.strictEqual(qa.wordUnits(qa.extractTextRuns(arrowXml).join(' ')), 3);
assert.strictEqual(qa.wordBudgetForDensity('high'), 220);
assert.strictEqual(qa.wordBudgetForDensity('standard'), 150);
assert.strictEqual(qa.wordBudgetForDensity('airy'), 100);

assert.deepStrictEqual(
  qa.geometryIssues('<a:xfrm><a:ext cx="100" cy="0"/></a:xfrm>'),
  []
);
assert.deepStrictEqual(
  qa.geometryIssues('<a:xfrm><a:ext cx="-100" cy="NaN"/></a:xfrm>'),
  ['cx=-100', 'cy=NaN']
);

console.log('QA regression tests passed.');
