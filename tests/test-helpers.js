const assert = require('assert');
const path = require('path');

const helpers = require(path.join(__dirname, '..', 'assets', 'starter-deck', '_helpers.js'));

assert.deepStrictEqual(
  helpers.connectorGeometry({ x: 5, y: 4 }, { x: 2, y: 1 }),
  { x: 2, y: 1, w: 3, h: 3, flipH: true, flipV: true }
);
assert.deepStrictEqual(
  helpers.connectorGeometry({ x: 2, y: 4 }, { x: 5, y: 1 }),
  { x: 2, y: 1, w: 3, h: 3, flipH: false, flipV: true }
);
assert.throws(
  () => helpers.connectorGeometry({ x: Number.NaN, y: 0 }, { x: 1, y: 1 }),
  /finite number/
);

const calls = [];
const slide = {
  addImage(options) { calls.push(['image', options]); },
  addNotes(notes) { calls.push(['notes', notes]); }
};
helpers.addSourcedImage(slide, ['starter-fixture'], { path: 'fixture.png', x: 0, y: 0, w: 1, h: 1, altText: 'Fixture' });
assert.match(calls[0][1].altText, /\[sources:starter-fixture\]/);
assert.match(calls[1][1], /\[Sources\]/);
assert.throws(() => helpers.addSourcedImage(slide, ['missing-source'], { path: 'fixture.png' }), /Unknown image source id/);

console.log('Helper regression tests passed.');
