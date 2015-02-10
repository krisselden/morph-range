/* global require */
var MorphList = (function (root){
  if (typeof require === "function") {
    return require('./morph-list');
  } else {
    return root.MorphList;
  }
}(this));

export default MorphList;
