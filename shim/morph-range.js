/* global require */
var Morph = (function (root){
  if (typeof require === "function") {
    return require('./morph-range');
  } else {
    return root.Morph;
  }
}(this));

export default Morph;
