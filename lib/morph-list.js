import { clear, insertBefore } from './morph-range/utils';

function MorphList(domHelper) {
  this.domHelper = domHelper;

  // morph graph
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
    current.parentMorphList = null;
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
  if (morph.parentMorphList !== null) {
    throw new Error("Moving a morph from one list to another is not yet supported");
  }

  var previouslyEmpty = this.firstChildMorph === null;

  var previousMorph = referenceMorph && referenceMorph.previousMorph;
  var lastChild = this.lastChildMorph;

  if (!referenceMorph) {
    if (lastChild) { lastChild.nextMorph = morph; }
    morph.previousMorph = this.lastChildMorph;
    this.lastChildMorph = morph;
    this.lastNode = morph.lastNode;
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
    this.firstNode = morph.firstNode;
  }

  morph.parentMorphList = this;

  updateMountedMorph(this, morph, referenceMorph);
};

prototype.updateFirstNode = function MorphList$updateFirstNode(firstNode) {
  this.firstNode = firstNode;

  if (this.mountedMorph) {
    this.mountedMorph.updateFirstNode(firstNode);
  }
}

prototype.updateLastNode = function MorphList$updateLastNode(lastNode) {
  this.lastNode = lastNode;

  if (this.mountedMorph) {
    this.mountedMorph.updateLastNode(lastNode);
  }
}

function updateMountedMorph(morphList, morph, referenceMorph) {
  var mountedMorph = morphList.mountedMorph;
  if (mountedMorph === null) { return; }

  var referenceNode;
  if (referenceMorph) {
    referenceNode = referenceMorph.firstNode;
  } else {
    referenceNode = mountedMorph.lastNode.nextSibling;
  }

  morph.insertBeforeNode(mountedMorph.firstNode.parentNode, referenceNode);

  if (mountedMorph.isEmpty) {
    var comment = mountedMorph.firstNode;
    comment.parentNode.removeChild(comment);
    mountedMorph.isEmpty = false;
  }

  if (morph.previousMorph === null) {
    mountedMorph.updateFirstNode(morph.firstNode);
  }

  if (morph.nextMorph === null) {
    mountedMorph.updateLastNode(morph.lastNode);
  }
}

prototype.removeChildMorph = function MorphList$removeChildMorph(morph) {
  if (morph.parentMorphList !== this) {
    throw new Error("Cannot remove a morph from a parent it is not inside of");
  }

  var previousMorph = morph.previousMorph;
  var nextMorph = morph.nextMorph;
  var mountedMorph = this.mountedMorph;

  morph.parentMorphList = null;

  if (!previousMorph && !nextMorph && mountedMorph) {
    mountedMorph.clear();
    return;
  }

  if (previousMorph) {
    previousMorph.nextMorph = nextMorph;
  } else {
    this.firstChildMorph = nextMorph;
    this.updateFirstNode(nextMorph && nextMorph.firstNode);
  }

  if (nextMorph) {
    nextMorph.previousMorph = previousMorph;
  } else {
    this.lastChildMorph = previousMorph;
    this.updateLastNode(previousMorph && previousMorph.lastNode);
  }

  morph.previousMorph = morph.nextMorph = null;
  morph.parentMorphList = null;
  morph.destroy();
};

export default MorphList;
