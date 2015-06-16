import QUnit from 'qunitjs';
import Morph from 'morph-range';

import { document, fragment, element, comment, text, domHelper } from 'support';

QUnit.module('Morph tests');

QUnit.test('can construct a Morph', function (assert) {
  var m = new Morph(domHelper());
  assert.ok(m, "this test is fine" );
});

QUnit.test('can setContent of a morph', function (assert) {
  var morph = new Morph(domHelper());

  var insertion = comment();

  morph.setContent(insertion);

  var frag = fragment(
    element('p', 'before ', insertion, ' after')
  );

  morph.setContent('Hello World');

  assert.equalHTML(frag, '<p>before Hello World after</p>', 'it updated');

  morph.clear();

  assert.equalHTML(frag, '<p>before <!----> after</p>', 'clear');

  frag = fragment(frag);

  morph.setContent('Another test...');

  assert.equalHTML(frag, '<p>before Another test... after</p>', 'works after appending to a fragment');

  var el = element('div', '\n', frag, '\n');

  morph.setContent('Again');

  assert.equalHTML(el, '<div>\n<p>before Again after</p>\n</div>', 'works after appending to an element');

  morph.setContent('');

  assert.equalHTML(el, '<div>\n<p>before  after</p>\n</div>', 'setting to empty');
});

QUnit.test("When destroying a morph, do not explode if a parentMorph does not exist", function(assert) {
  var dom = domHelper();
  var morph = new Morph(dom);
  morph.clear();

  var morphFrag = document.createDocumentFragment();
  morphFrag.appendChild(morph.firstNode);
  assert.strictEqual(morphFrag.firstChild, morph.firstNode);
  assert.strictEqual(morphFrag.lastChild, morph.lastNode);
  morph.destroy();
  assert.strictEqual(morphFrag.firstChild, null);
});

QUnit.test("When destroying a morph, do not explode if a parentNode does not exist", function(assert) {
  var dom = domHelper();
  var morph = new Morph(dom);
  morph.destroy();
  assert.ok(true, "The test did not crash");
});

// Chrome bug https://code.google.com/p/chromium/issues/detail?id=475337
QUnit.test('can setContent options on a morph with whitespace', function (assert) {
  var morph = new Morph(domHelper());
  var select = element('select');
  var placeholder = comment();
  select.appendChild(placeholder);
  morph.setNode(placeholder);

  var frag = fragment(
    element('option'),
    text(''),
    element('option')
  );

  morph.setContent(frag);

  assert.equal(select.selectedIndex, 0, 'selectedIndex is the first item inserted');
});

QUnit.test('can setContent selected option on a morph with whitespace', function (assert) {
  var morph = new Morph(domHelper());
  var select = element('select');
  var placeholder = comment();
  select.appendChild(placeholder);
  morph.setNode(placeholder);

  var selectedOption = element('option');
  selectedOption.selected = true;

  var frag = fragment(
    selectedOption,
    text(''),
    element('option')
  );

  morph.setContent(frag);

  assert.equal(select.selectedIndex, 0, 'selectedIndex is the first item');
});

QUnit.test('can setContent option with a selectedIndex already set', function (assert) {
  var morph = new Morph(domHelper());
  var select = element('select');
  var placeholder = comment();
  select.appendChild(placeholder);

  var selectedOption = element('option');
  selectedOption.selected = true;
  select.appendChild(selectedOption);

  morph.setNode(placeholder);

  var frag = fragment(
    element('option'),
    text(''),
    element('option')
  );

  morph.setContent(frag);

  assert.equal(select.selectedIndex, 2, 'selectedIndex is the first item');
});
