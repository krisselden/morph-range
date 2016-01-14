import QUnit from 'qunitjs';
import Morph from 'morph-range';

import { document, fragment, element, comment, domHelper } from 'support';

QUnit.module('Morph tests');

QUnit.test('can construct a Morph', function (assert) {
  var m = new Morph(domHelper());
  assert.ok(m, "this test is fine" );
});

QUnit.test('throws on invalid content', function (assert) {
  var morph = new Morph(domHelper());


  assert.throws(function() {
    morph.setContent(function() { });
  }, 'Unsupported Content: Cannot bind to function');

  function foo() { }

  if (foo.name === 'foo') {
    assert.throws(function() {
      morph.setContent(function functionName() { });
    }, 'Unsupported Content: Cannot bind to function `functionName`');
  } else {
    assert.throws(function() {
      morph.setContent(function functionName() { });
    }, 'Unsupported Content: Cannot bind to function');
  }
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

QUnit.test('uses toHTML for SafeString support', function (assert) {
  var morph = new Morph(domHelper());

  var insertion = comment();

  morph.setContent(insertion);

  var frag = fragment(
    element('p', 'before ', insertion, ' after')
  );

  morph.setContent({
    toHTML: function() {
      return '<b>Hello World!</b>';
    }
  });

  assert.equalHTML(frag, '<p>before <b>Hello World!</b> after</p>', 'it updated');
});

QUnit.test('an object with a .string property does not assume SafeString', function (assert) {
  var morph = new Morph(domHelper());

  var insertion = comment();

  morph.setContent(insertion);

  var frag = fragment(
    element('p', 'before ', insertion, ' after')
  );

  morph.setContent({
    string: '<b>Hellow World!</b>',

    toString: function() {
      return '<b>Hellow World!</b>';
    }
  });

  assert.equalHTML(frag, '<p>before &lt;b&gt;Hellow World!&lt;/b&gt; after</p>', 'it updated');
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

QUnit.test("When inserting a range into a morph, range is inserted in the correct order", function(assert) {
  var dom = domHelper();
  var morph = new Morph(dom);
  var insertion = comment();
  var el = element('div', insertion);
  morph.setContent(insertion);
  var frag = fragment(
    element('p', 'a'),
    element('p', 'b'),
    element('p', 'c'),
    element('p', 'd')
  );
  morph.setContent(frag);
  assert.equalHTML(el, '<div><p>a</p><p>b</p><p>c</p><p>d</p></div>', 'updates range in correct order');
});
