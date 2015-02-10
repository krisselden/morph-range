import QUnit from 'qunitjs';
import MorphList from 'morph-list';
import Morph from 'morph-range';

//import { document, fragment, element, comment, domHelper } from 'support';

import { domHelper, document, fragment, element, text } from 'support';

QUnit.module('MorphList tests', {
  setup: commonSetup
});

var dom, list;

function commonSetup() {
  dom = domHelper();
  list = new MorphList(dom);
}

function assertChildMorphs(assert, list, expectedMorphs) {
  var actual = [];
  var current = list.firstChildMorph;
  var last = null;

  while (current) {
    actual.push(current.label);

    if (last) {
      assert.strictEqual(current.previousMorph.label, last.label,
                         "expected " + current.label + "'s previous to be " + last.label);
    }

    assert.ok(current.parentMorphList === list, "the morphs have the list as the parent");

    last = current;
    current = current.nextMorph;
  }

  expectedMorphs = expectedMorphs.map(function(m) {
    return m.label;
  });

  assert.deepEqual(actual, expectedMorphs);
}

function assertOrphanedMorphs(assert, expectedMorphs) {
  for (var i=0, l=expectedMorphs.length; i<l; i++) {
    var current = expectedMorphs[i];

    assert.ok(current.parentMorphList === null, current.label + " should not have a parent");
    assert.ok(current.nextMorph === null, current.label + " should not have a nextMorph");
    assert.ok(current.previousMorph === null, current.label + " should not have a previousMorph");
  }
}

function morph(label) {
  var m = new Morph(dom);
  m.label = label;
  return m;
}

QUnit.test("can create a MorphList", function(assert) {
  assert.strictEqual(list.parentMorphList, null);
  assert.strictEqual(list.firstChildMorph, null);
  assert.strictEqual(list.lastChildMorph, null);
});

QUnit.test("can append a Morph into a MorphList", function(assert) {
  var morph = new Morph(dom);

  list.appendMorph(morph);

  // TODO Deal with DOM

  assertChildMorphs(assert, list, [ morph ]);
});

QUnit.test("can append a Morph into a MorphList using insertBefore", function(assert) {
  var morph1 = morph("morph1");

  list.insertBeforeMorph(morph1, null);

  // TODO Deal with DOM

  assertChildMorphs(assert, list, [ morph1 ]);
});

QUnit.test("can prepend a Morph into a MorphList", function(assert) {
  var morph2 = morph("morph2");
  var morph1 = morph("morph1");

  list.appendMorph(morph2);
  list.insertBeforeMorph(morph1, morph2);

  // TODO Deal with DOM

  assertChildMorphs(assert, list, [ morph1, morph2 ]);
});

QUnit.test("can insert a Morph into the middle of a MorphList", function(assert) {
  var morph3 = morph("morph3");
  var morph2 = morph("morph2");
  var morph1 = morph("morph1");

  list.appendMorph(morph1);
  list.appendMorph(morph3);
  list.insertBeforeMorph(morph2, morph3);

  // TODO Deal with DOM

  assertChildMorphs(assert, list, [ morph1, morph2, morph3 ]);
});

//QUnit.test("can move a morph from one list to another", function(assert) {
  //var list2 = new MorphList(dom);

  //var morph1 = morph("morph1");

  //list.appendMorph(morph1);
  //list2.appendMorph(morph1);

  //assertChildMorphs(assert, list, [ ]);
  //assertChildMorphs(assert, list2, [ morph1 ]);
//});

QUnit.test("can remove the only morph in a MorphList", function(assert) {
  var morph1 = morph("morph1");

  list.appendMorph(morph1);
  list.removeChildMorph(morph1);

  assertChildMorphs(assert, list, [ ]);
  assertOrphanedMorphs(assert, [ morph1 ]);
});

QUnit.test("can remove the first morph in a MorphList", function(assert) {
  var morph1 = morph("morph1");
  var morph2 = morph("morph2");

  list.appendMorph(morph1);
  list.appendMorph(morph2);
  list.removeChildMorph(morph1);

  assertChildMorphs(assert, list, [ morph2 ]);
  assertOrphanedMorphs(assert, [ morph1 ]);
});

QUnit.test("can remove the last morph in a MorphList", function(assert) {
  var morph1 = morph("morph1");
  var morph2 = morph("morph2");

  list.appendMorph(morph1);
  list.appendMorph(morph2);
  list.removeChildMorph(morph2);

  assertChildMorphs(assert, list, [ morph1 ]);
  assert.ok(morph2.parentMorphList === null, "A removed morph doesn't still have its old parent");
});

QUnit.test("can remove a middle morph in a MorphList", function(assert) {
  var morph1 = morph("morph1");
  var morph2 = morph("morph2");
  var morph3 = morph("morph3");

  list.appendMorph(morph1);
  list.appendMorph(morph2);
  list.appendMorph(morph3);
  list.removeChildMorph(morph2);

  assertChildMorphs(assert, list, [ morph1, morph3 ]);
  assertOrphanedMorphs(assert, [ morph2 ]);
});

QUnit.test("can clear the only morph in a MorphList", function(assert) {
  var morph1 = morph("morph1");

  list.appendMorph(morph1);
  list.clear();

  assertChildMorphs(assert, list, [ ]);
  assertOrphanedMorphs(assert, [ morph1 ]);
});

QUnit.test("can clear two morphs in a MorphList", function(assert) {
  var morph1 = morph("morph1");
  var morph2 = morph("morph2");

  list.appendMorph(morph1);
  list.appendMorph(morph2);
  list.clear();

  assertChildMorphs(assert, list, [ ]);
  assertOrphanedMorphs(assert, [ morph1, morph2 ]);
});

QUnit.test("can remove three morphs in a MorphList", function(assert) {
  var morph1 = morph("morph1");
  var morph2 = morph("morph2");
  var morph3 = morph("morph3");

  list.appendMorph(morph1);
  list.appendMorph(morph2);
  list.appendMorph(morph3);
  list.clear();

  assertChildMorphs(assert, list, [ ]);
  assertOrphanedMorphs(assert, [ morph1, morph2, morph3 ]);
});

QUnit.test("can append a MorphList into a MorphList", function(assert) {
  var list2 = new MorphList(dom);
  list2.label = "list2";

  list.appendMorph(list2);

  assertChildMorphs(assert, list, [ list2 ]);
});

var frag, root;

QUnit.module("MorphList DOM Manipulation tests", {
  setup: function() {
    commonSetup();
    domSetup();
  }
});

function domSetup() {
  frag = document.createDocumentFragment();
  root = morph("root");
  root.appendToNode(frag);
  root.setMorphList(list);
}

function assertInvariants(assert) {
  assert.strictEqual(frag.firstChild, root.firstNode, "invariant: the fragment's first child is the list's first node");
  assert.strictEqual(frag.lastChild, root.lastNode, "invariant: the fragment's last child is the list's last node");
}

QUnit.test("appending a morph updates the DOM representation", function(assert) {
  var morph1 = morph("morph1");
  morph1.setNode(text("hello"));

  list.appendMorph(morph1);
  assertInvariants(assert);

  assert.equalHTML(frag, "hello");

  var morph2 = morph("morph2");
  morph2.setNode(text(" world"));
  list.appendMorph(morph2);
  assertInvariants(assert);

  assert.equalHTML(frag, "hello world");
});

QUnit.test("prepending a morph updates the DOM representation", function(assert) {
  var morph1 = morph("morph1");
  morph1.setNode(text("world"));

  list.appendMorph(morph1);
  assertInvariants(assert);

  assert.equalHTML(frag, "world");

  var morph2 = morph("morph2");
  morph2.setNode(text("hello "));
  list.insertBeforeMorph(morph2, morph1);
  assertInvariants(assert);

  assert.equalHTML(frag, "hello world");
});

QUnit.test("removing the last morph makes the mount point empty again", function(assert) {
  var morph1 = morph("morph1");
  morph1.setNode(text("hello world"));
  assert.equalHTML(frag, "<!---->");

  list.appendMorph(morph1);
  assertInvariants(assert);
  assert.equalHTML(frag, "hello world");

  list.removeChildMorph(morph1);
  assertInvariants(assert);
  assert.equalHTML(frag, "<!---->");
});

// V removeChildMorph
// V clear
// V sanity checks for inserting already-inserted nodes
// * nested morphList
// * appending morphList to morph
// * changing a morphList in DOM updates its DOM
