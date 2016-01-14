import SimpleDOM from 'simple-dom';
import HTML5Tokenizer from 'simple-html-tokenizer';
import QUnit from 'qunitjs';

export var isArray = (function () {
  if (Array.isArray) {
    return Array.isArray;
  }
  return function isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}());

export var document = (function (root){
  if (root.document) {
    return root.document;
  }
  return new SimpleDOM.Document();
}(this));

export var parser = new SimpleDOM.HTMLParser(HTML5Tokenizer.tokenize, document, SimpleDOM.voidMap);

export var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

export function element(tagName, attrs) {
  var el = document.createElement(tagName);
  var i = 1;
  if (typeof attrs === 'object' && typeof attrs.nodeType === 'undefined') {
    i = 2;
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  for (; i<arguments.length; i++) {
    var node = arguments[i];
    if (typeof node === 'string') {
      node = text(node);
    }
    el.appendChild(node);
  }
  return el;
}

export function fragment() {
  var frag = document.createDocumentFragment();
  for (var i=0; i<arguments.length; i++) {
    frag.appendChild(arguments[i]);
  }
  return frag;
}

export function text(s) {
  return document.createTextNode(s || '');
}

export function comment(s) {
  return document.createComment(s || '');
}

export function domHelper() {
  return new DOMHelper(document, parser);
}

export function parseHTML(html) {
  return parser.parse(html);
}

export function toHTML(node) {
  if (isArray(node)) {
    var nodes = node;
    var buffer = '';
    for (var i=0; i<nodes.length; i++) {
      buffer += serializer.serialize(nodes[i]);
    }
    return buffer;
  }
  return serializer.serialize(node);
}

QUnit.assert.equalHTML = function ( nodes, expected, message ) {
  var actual = toHTML(nodes);
  var result = actual === expected;
  this.push(result, actual, expected, message);
};

function DOMHelper(document, parser) {
  this.document = document;
  this.parser = parser;
}

DOMHelper.prototype = {
  createComment: function (text) {
    return this.document.createComment(text);
  },
  createTextNode: function (text) {
    return this.document.createTextNode(text);
  },
  parseHTML: function (text, context) {
    return this.parser.parse(text, context);
  }
};
