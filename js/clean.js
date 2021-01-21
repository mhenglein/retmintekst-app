// clean Editor should happen in the browser?
cleanEditor = function cleanEditor() {
  $("#editor *").each(function () {
    let attributes = this.attributes;
    let i = attributes.length;
    while (i--) {
      this.removeAttributeNode(attributes[i]);
    }
  });
  let k;
  for (k = 0; k < 10; k++) {
    removeTag(
      "span",
      "div",
      "a",
      "path",
      "aside",
      "circle",
      "path",
      "svg",
      "button",
      "figcaption",
      "figure",
      "meta",
      "label"
    );
  }
  replaceTag();
};
exports.removeTag = function removeTag(...args) {
  for (let i = 0; i < args.length; i++) {
    $(`#editor ${args[i]}`).each(function () {
      this.outerHTML = this.innerHTML;
    });
  }
};
exports.replaceTag = function replaceTag() {
  let html = editor.innerHTML;
  html = html
    .replace(/\&nbsp\;/g, "")
    .replace(/\<span\>\<\/span\>/g, "")
    .replace(/\<div\>\<\/div\>/g, "")
    .replace(/\<p\>\<\/p\>/g, "")
    .replace(/\<b\>\<\/b\>/g, "")
    .replace(/\<strong\>\<\/strong\>/g, "")
    .replace(/\<br\>\<br\>/g, "")
    .replace(/\<i\>\<\/i\>/g, "")
    .replace(/\<em\>\<\/em\>/g, "");
  editor.innerHTML = html;
};
