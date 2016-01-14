/* global require */
var HTML5Tokenizer = (function (root){
  if (typeof require === "function") {
    return require('simple-html-tokenizer');
  } else {
    return root.HTML5Tokenizer;
  }
}(this));

export default HTML5Tokenizer;
