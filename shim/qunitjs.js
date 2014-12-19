/* global require */
var QUnit = (function (root){
  if (typeof require === "function") {
    return require('qunitjs');
  } else {
    return root.QUnit;
  }
}(this));

export default QUnit;
