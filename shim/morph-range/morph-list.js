/* global require */
var MorphList = (function (root){
  if (typeof require === "function") {
    return require('./morph-range/morph-list');
  } else {
    return root.MorphList;
  }
}(this));

export default MorphList;
