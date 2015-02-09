import QUnit from 'qunitjs';
import Morph from 'morph-range';

import { document, fragment, element, comment, domHelper } from 'support';

QUnit.module('Morph tests');

QUnit.test('can construct a Morph', function (assert) {
  var m = new Morph(domHelper(), document.body);
  assert.ok(m, "this test is fine" );
});

QUnit.test('can setContent of a morph', function (assert) {
  var contextElement = document.body;
  var morph = new Morph(domHelper(), contextElement);

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

QUnit.test("When a single-element morph is replaced with a new node, the firstNode and lastNode of parents are updated recursively", function(assert) {
  var dom = domHelper();

  var parentMorph = new Morph(dom);
  parentMorph.clear();

  var childMorph = new Morph(dom);
  childMorph.clear();

  var grandchildMorph = new Morph(dom);
  grandchildMorph.clear();

  var morphFrag = document.createDocumentFragment();
  morphFrag.appendChild(parentMorph.firstNode);

  parentMorph.appendMorph(childMorph);
  childMorph.appendMorph(grandchildMorph);

  var frag = document.createDocumentFragment();
  var text = document.createTextNode('hello');
  frag.appendChild(text);
  grandchildMorph.setNode(frag);

  assert.strictEqual(parentMorph.firstNode, childMorph.firstNode, '1');
  assert.strictEqual(parentMorph.lastNode, childMorph.lastNode, '2');
  assert.strictEqual(childMorph.firstNode, grandchildMorph.firstNode, '3');
  assert.strictEqual(childMorph.lastNode, grandchildMorph.lastNode, '4');

  assert.strictEqual(parentMorph.firstNode, text, '5');
  assert.strictEqual(parentMorph.lastNode, text, '6');
  assert.strictEqual(childMorph.firstNode, text, '7');
  assert.strictEqual(childMorph.firstNode, text, '8');
  assert.strictEqual(grandchildMorph.lastNode, text, '9');
  assert.strictEqual(grandchildMorph.lastNode, text, '10');
});

QUnit.test("when destroying a morph, set the parent's first and last nodes to null if needed", function(assert) {
  var dom = domHelper();

  var parentMorph = new Morph(dom);
  parentMorph.clear();

  var childMorph = new Morph(dom);
  childMorph.clear();

  var morphFrag = document.createDocumentFragment();
  morphFrag.appendChild(parentMorph.firstNode);

  parentMorph.appendMorph(childMorph);

  var frag = document.createDocumentFragment();
  frag.appendChild(document.createTextNode('hello'));
  childMorph.setNode(frag);

  childMorph.destroy();

  assert.equal(parentMorph.firstNode, null);
  assert.equal(parentMorph.lastNode, null);
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
