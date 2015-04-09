// inclusive of both nodes
export function clear(parentNode, firstNode, lastNode) {
  if (!parentNode) { return; }

  var node = firstNode;
  var nextNode;
  do {
    nextNode = node.nextSibling;
    parentNode.removeChild(node);
    if (node === lastNode) {
      break;
    }
    node = nextNode;
  } while (node);
}

export function insertBefore(parentNode, firstNode, lastNode, _refNode) {
  var node = lastNode;
  var refNode = _refNode;
  var prevNode;

  // Chrome bug https://code.google.com/p/chromium/issues/detail?id=475337
  var shouldFix = parentNode.tagName === 'SELECT' && parentNode.selectedIndex === -1;
  var firstOption;

  do {

    if (shouldFix && node.tagName === 'OPTION') {
      // Track the first option added to the select
      if (!firstOption) {
        firstOption = node;
      }
      // Don't need to fix if an option is selected
      if (node.selected) {
        shouldFix = false;
      }
    }

    prevNode = node.previousSibling;
    parentNode.insertBefore(node, refNode);
    if (node === firstNode) {
      break;
    }
    refNode = node;
    node = prevNode;

  } while (node);

  // Mark the first item added to the select selected
  if (shouldFix && firstOption) {
    firstOption.selected = true;
  }
}
