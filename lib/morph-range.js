import { clear, insertBefore } from './morph-range/utils';

function Morph(domHelper, contextualElement) {
  this.domHelper = domHelper;
  // context if content if current content is detached
  this.contextualElement = contextualElement;

  // flag to force text to setContent to be treated as html
  this.parseTextAsHTML = false;

  this.firstNode = null;
  this.lastNode  = null;

  // morph graph
  this.parentMorph     = null;
  this.firstChildMorph = null;
  this.lastChildMorph  = null;

  this.previousMorph = null;
  this.nextMorph = null;
}

Morph.prototype.setContent = function Morph$setContent(content) {
  if (content === null || content === undefined) {
    return this.clear();
  }

  var type = typeof content;
  switch (type) {
    case 'string':
      if (this.parseTextAsHTML) {
        return this.setHTML(content);
      }
      return this.setText(content);
    case 'object':
      if (typeof content.nodeType === 'number') {
        return this.setNode(content);
      }
      /* Handlebars.SafeString */
      if (typeof content.string === 'string') {
        return this.setHTML(content.string);
      }
      if (this.parseTextAsHTML) {
        return this.setHTML(content.toString());
      }
      /* falls through */
    case 'boolean':
    case 'number':
      return this.setText(content.toString());
    default:
      throw new TypeError('unsupported content');
  }
};

Morph.prototype.clear = function Morph$clear() {
  return this.setNode(this.domHelper.createComment(''));
};

Morph.prototype.setText = function Morph$setText(text) {
  var firstNode = this.firstNode;
  var lastNode = this.lastNode;

  if (firstNode &&
      lastNode === firstNode &&
      firstNode.nodeType === 3) {
    firstNode.nodeValue = text;
    return firstNode;
  }

  return this.setNode(
    text ? this.domHelper.createTextNode(text) : this.domHelper.createComment('')
  );
};

Morph.prototype.setNode = function Morph$setNode(newNode) {
  var firstNode, lastNode;
  switch (newNode.nodeType) {
    case 3:
      firstNode = newNode;
      lastNode = newNode;
      break;
    case 11:
      firstNode = newNode.firstChild;
      lastNode = newNode.lastChild;
      if (firstNode === null) {
        firstNode = this.domHelper.createComment('');
        newNode.appendChild(firstNode);
        lastNode = firstNode;
      }
      break;
    default:
      firstNode = newNode;
      lastNode = newNode;
      break;
  }

  var previousFirstNode = this.firstNode;
  if (previousFirstNode !== null) {

    var parentNode = previousFirstNode.parentNode;
    insertBefore(parentNode, firstNode, lastNode, previousFirstNode);
    clear(parentNode, previousFirstNode, this.lastNode);
  }

  this.firstNode = firstNode;
  this.lastNode  = lastNode;

  if (this.parentMorph) {
    syncFirstNode(this);
    syncLastNode(this);
  }

  return newNode;
};

function syncFirstNode(_morph) {
  var morph = _morph;
  var parentMorph;
  while (parentMorph = morph.parentMorph) {
    if (morph !== parentMorph.firstChildMorph) {
      break;
    }
    if (morph.firstNode === parentMorph.firstNode) {
      break;
    }

    parentMorph.firstNode = morph.firstNode;

    morph = parentMorph;
  }
}

function syncLastNode(_morph) {
  var morph = _morph;
  var parentMorph;
  while (parentMorph = morph.parentMorph) {
    if (morph !== parentMorph.lastChildMorph) {
      break;
    }
    if (morph.lastNode === parentMorph.lastNode) {
      break;
    }

    parentMorph.lastNode = morph.lastNode;

    morph = parentMorph;
  }
}

// return morph content to an undifferentiated state
// drops knowledge that the node has content.
// this is for rerender, I need to test, but basically
// the idea is to leave the content, but allow render again
// without appending, so n
Morph.prototype.reset = function Morph$reset() {
  this.firstChildMorph = null;
  this.lastChildMorph = null;
};

Morph.prototype.destroy = function Morph$destroy() {
  var parentMorph = this.parentMorph;
  var previousMorph = this.previousMorph;
  var nextMorph = this.nextMorph;
  var firstNode = this.firstNode;
  var lastNode = this.lastNode;
  var parentNode = firstNode && firstNode.parentNode;

  if (previousMorph) {
    if (nextMorph) {
      previousMorph.nextMorph = nextMorph;
      nextMorph.previousMorph = previousMorph;
    } else {
      previousMorph.nextMorph = null;
      if (parentMorph) { parentMorph.lastChildMorph = previousMorph; }
    }
  } else {
    if (nextMorph) {
      nextMorph.previousMorph = null;
      if (parentMorph) { parentMorph.firstChildMorph = nextMorph; }
    } else if (parentMorph) {
      parentMorph.lastChildMorph = parentMorph.firstChildMorph = null;
    }
  }

  this.parentMorph = null;
  this.firstNode = null;
  this.lastNode = null;

  if (parentMorph) {
    if (!parentMorph.firstChildMorph) {
      // list is empty
      parentMorph.clear();
      return;
    } else {
      syncFirstNode(parentMorph.firstChildMorph);
      syncLastNode(parentMorph.lastChildMorph);
    }
  }

  clear(parentNode, firstNode, lastNode);
};

Morph.prototype.setHTML = function(text) {
  var fragment = this.domHelper.parseHTML(text, this.contextualElement);
  return this.setNode(fragment);
};

Morph.prototype.appendContent = function(content) {
  return this.insertContentBeforeMorph(content, null);
};

Morph.prototype.insertContentBeforeMorph = function (content, referenceMorph) {
  var morph = new Morph(this.domHelper, this.contextualElement);
  morph.setContent(content);
  this.insertBeforeMorph(morph, referenceMorph);
  return morph;
};

Morph.prototype.appendMorph = function(morph) {
  this.insertBeforeMorph(morph, null);
};

Morph.prototype.insertBeforeMorph = function(morph, referenceMorph) {
  if (referenceMorph && referenceMorph.parentMorph !== this) {
    throw new Error('The morph before which the new morph is to be inserted is not a child of this morph.');
  }

  morph.parentMorph = this;

  var parentNode = this.firstNode.parentNode;

  insertBefore(
    parentNode,
    morph.firstNode,
    morph.lastNode,
    referenceMorph ? referenceMorph.firstNode : this.lastNode.nextSibling
  );

  // was not in list mode replace current content
  if (!this.firstChildMorph) {
    clear(parentNode, this.firstNode, this.lastNode);
  }

  var previousMorph = referenceMorph ? referenceMorph.previousMorph : this.lastChildMorph;
  if (previousMorph) {
    previousMorph.nextMorph = morph;
    morph.previousMorph = previousMorph;
  } else {
    this.firstChildMorph = morph;
  }

  if (referenceMorph) {
    referenceMorph.previousMorph = morph;
    morph.nextMorph = referenceMorph;
  } else {
    this.lastChildMorph = morph;
  }

  syncFirstNode(this.firstChildMorph);
  syncLastNode(this.lastChildMorph);
};

export default Morph;
