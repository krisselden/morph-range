import { clear, insertBefore } from './morph-range/utils';

function MorphList(domHelper) {
  this.domHelper = domHelper;

  // morph graph
  this.parentMorph     = null;
  this.firstChildMorph = null;
  this.lastChildMorph  = null;

  this.previousMorph = null;
  this.nextMorph = null;

  this.mountedMorph = null;
}

var prototype = MorphList.prototype;

prototype.clear = function MorphList$clear() {
  var current = this.firstChildMorph;

  while (current) {
    var next = current.nextMorph;
    current.previousMorph = null;
    current.nextMorph = null;
    current.parentMorph = null;
    current = next;
  }

  this.firstChildMorph = this.lastChildMorph = null;
};

prototype.destroy = function MorphList$destroy() {
};

prototype.appendMorph = function MorphList$appendMorph(morph) {
  this.insertBeforeMorph(morph, null);
};

prototype.insertBeforeMorph = function MorphList$insertBeforeMorph(morph, referenceMorph) {
  if (morph.parentMorph !== null) {
    morph.parentMorph.removeChildMorph(morph);
  }

  var previousMorph = referenceMorph && referenceMorph.previousMorph;
  var lastChild = this.lastChildMorph;

  if (!referenceMorph) {
    if (lastChild) { lastChild.nextMorph = morph; }
    morph.previousMorph = this.lastChildMorph;
    this.lastChildMorph = morph;
  } else {
    referenceMorph.previousMorph = morph;
    morph.nextMorph = referenceMorph;
  }

  if (previousMorph) {
    previousMorph.nextMorph = morph;
    morph.previousMorph = previousMorph;
  }

  if (this.firstChildMorph === referenceMorph) {
    this.firstChildMorph = morph;
  }

  morph.parentMorph = this;

  updateMountedMorph(this, morph, referenceMorph);
};

function updateMountedMorph(morphList, morph, referenceMorph) {
  var mountedMorph = morphList.mountedMorph;
  if (mountedMorph === null) { return; }

  if (morph.previousMorph === null) {
    morphList.firstNode = morph.firstNode;
  }

  if (morph.nextMorph === null) {
    morphList.lastNode = morph.lastNode;
  }

  var referenceNode;
  if (referenceMorph) {
    referenceNode = referenceMorph.firstNode;
  } else {
    referenceMorph = mountedMorph.lastNode.nextSibling;
  }

  morph.insertBeforeNode(mountedMorph.firstNode.parentNode, referenceNode);

  if (!referenceMorph) {
    mountedMorph.firstNode.parentNode.removeChild(mountedMorph.firstNode);
  }
}

prototype.removeChildMorph = function MorphList$removeChildMorph(morph) {
  if (morph.parentMorph !== this) {
    throw new Error("Cannot remove a morph from a parent it is not inside of");
  }

  var previousMorph = morph.previousMorph;
  var nextMorph = morph.nextMorph;

  morph.parentMorph = null;

  if (previousMorph) {
    previousMorph.nextMorph = nextMorph;
  } else {
    this.firstChildMorph = nextMorph;
  }

  if (nextMorph) {
    nextMorph.previousMorph = previousMorph;
  } else {
    this.lastChildMorph = previousMorph;
  }

  morph.previousMorph = morph.nextMorph = null;
  morph.parentMorph = null;
};

export default MorphList;
