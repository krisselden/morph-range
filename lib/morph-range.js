import { clear, insertBefore } from './morph-range/utils';

function Morph(domHelper, contextualElement) {
  this.domHelper = domHelper;
  // context if content if current content is detached
  this.contextualElement = contextualElement;

  // flag to force text to setContent to be treated as html
  this.parseTextAsHTML = false;

  this.firstNode = null;
  this.lastNode  = null;

  // morph list graph
  this.parentMorphList = null;
  this.previousMorph   = null;
  this.nextMorph       = null;

  this.isEmpty         = true;
  this.clear();
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

Morph.prototype.appendNode = function Morph$appendNode(element)  {
  var lastNode = this.lastNode;
  var parentNode = lastNode && lastNode.parentNode;

  if (!lastNode) {
    throw new Error("can't append into an empty morph");
  }

  if (!parentNode) {
    throw new Error("can't append into a morph that is not in the DOM");
  }

  if (this.isEmpty) {
    var emptyNode = this.firstNode;
    emptyNode.parentNode.removeChild(emptyNode);
    this.firstNode = element;
    this.isEmpty = false;
  }

  parentNode.insertBefore(element, lastNode.nextSibling);
  this.lastNode = element;
};

Morph.prototype.clear = function Morph$clear() {
  var node = this.setNode(this.domHelper.createComment(''));
  this.isEmpty = true;
  return node;
};

Morph.prototype.setText = function Morph$setText(text) {
  var firstNode = this.firstNode;
  var lastNode = this.lastNode;

  if (lastNode === firstNode && firstNode.nodeType === 3) {
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
    if (parentNode !== null) {
      insertBefore(parentNode, firstNode, lastNode, previousFirstNode);
      clear(parentNode, previousFirstNode, this.lastNode);
    }

    if (previousFirstNode.previousSibling === null && this.parentMorphList) {
      this.parentMorphList.updateFirstNode(firstNode);
    }
  }

  var previousLastNode = this.lastNode;
  if (previousLastNode !== null) {
    if (previousLastNode.nextSibling === null && this.parentMorphList) {
      this.parentMorphList.updateLastNode(lastNode);
    }
  }

  this.firstNode = firstNode;
  this.lastNode  = lastNode;
  this.isEmpty   = false;

  return newNode;
};

// return morph content to an undifferentiated state
// drops knowledge that the node has content.
// this is for rerender, I need to test, but basically
// the idea is to leave the content, but allow render again
// without appending, so n
Morph.prototype.reset = function Morph$reset() {
  this.firstChildMorph = undefined;
  this.lastChildMorph = undefined;
};

Morph.prototype.destroy = function Morph$destroy() {
  var current = this.firstNode;
  var parent = current.parentNode;

  if (parent === null) { return; }

  var last = this.lastNode;

  while (current) {
    var next = current.nextSibling;
    parent.removeChild(current);

    if (next === last) { break; }
    current = next;
  }

  this.firstNode = null;
  this.lastNode = null;
};

Morph.prototype.setHTML = function(text) {
  var fragment = this.domHelper.parseHTML(text, this.contextualElement);
  return this.setNode(fragment);
};

Morph.prototype.setMorphList = function Morph$appendMorphList(morphList) {
  morphList.mountedMorph = this;
  this.clear();

  var originalFirstNode = this.firstNode;

  if (morphList.firstChildMorph) {
    this.firstNode = morphList.firstChildMorph.firstNode;
    this.lastNode = morphList.lastChildMorph.lastNode;

    var current = morphList.firstChildMorph;

    while (current) {
      var next = current.nextMorph;
      current.insertBeforeNode(originalFirstNode, null);
      current = next;
    }
    originalFirstNode.parentNode.removeChild(originalFirstNode);
  }
};

Morph.prototype.insertBeforeNode = function Morph$insertBeforeNode(parent, reference) {
  var current = this.firstNode;

  while (current) {
    var next = current.nextSibling;
    parent.insertBefore(current, reference);
    current = next;
  }
};



Morph.prototype.appendToNode = function Morph$appendToNode(parent) {
  this.insertBeforeNode(parent, null);
};

export default Morph;
