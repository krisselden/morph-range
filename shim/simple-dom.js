/* global require */
var SimpleDOM = (function (root){
  if (typeof require === "function") {
    return require('simple-dom');
  } else {
    return root.SimpleDOM;
  }
}(this));

export default SimpleDOM;