'use strict';

const container = document.getElementById('editor');

const editor = new Squire(container, {
  blockTag: 'div',
  tagAttributes: {
    a: {
      target: '_blank'
    }
  }
});

const tagName = {
  bold: 'b',
  italic: 'i',
  strikethrough: 'del',
  underline: 'u',
  link: 'a'
};

var lastFontInfo = {},
  newFontInfo = {};

var lastFormat = {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    link: false
  },
  newFormat = clone(lastFormat);

var lastHeight = 0,
  newHeight = 0;

var isFocused = false;

document.getElementById('outer-container').onclick = function (e) {
  if (e.target !== this) {
    return;
  } else {
    if (isFocused) return;
    editor.focus();
  }
};

editor.addEventListener(
  'focus',
  function () {
    detectEditorHeightChanged();
    isFocused = true;
  },
  false
);

editor.addEventListener(
  'blur',
  function () {
    isFocused = false;
  },
  false
);

//The user inserted, strikethrough or changed the style of some text in other words,
//the result for editor.getHTML() will have changed.
editor.addEventListener(
  'input',
  function () {
    detectEditorHeightChanged();
    detectFontInfoChnaged();
    detectFormatChnaged();
  },
  false
);

//The user selected some text
editor.addEventListener(
  'select',
  function () {
    detectFontInfoChnaged();
    detectFormatChnaged();
  },
  false
);

//The user cleared their selection or moved the cursor to a different position
editor.addEventListener(
  'cursor',
  function () {
    detectFontInfoChnaged();
    detectFormatChnaged();
  },
  false
);

//Detecting changes of editor block height
function detectEditorHeightChanged() {
  newHeight = container.clientHeight;

  if (lastHeight == newHeight) return;

  lastHeight = clone(newHeight);

  postEditorContentHeight(lastHeight);
}

//Detecting changes of font info when user select text or move cursor.
//The object containing the active font family, size, colour
//and background colour for the the current cursor position,
//if any are set. The property names are respectively family, size, color and backgroundColor
function detectFontInfoChnaged() {
  let size = editor.getFontInfo().size;
  if (size != null) size = size.replace('px', '');

  newFontInfo = {
    color: rgbToHex(editor.getFontInfo().color),
    backgroundColor: rgbToHex(editor.getFontInfo().backgroundColor),
    family: editor.getFontInfo().family,
    size: size
  };

  if (isEquivalent(lastFontInfo, newFontInfo)) return;

  lastFontInfo = clone(newFontInfo);

  postFontInfo(lastFontInfo);
}

//Detecting changes of format when user select text or move cursor.
//The object containing bold, italic, strikethrough, underline, link format status.
function detectFormatChnaged() {
  let formatNames = Object.getOwnPropertyNames(lastFormat);

  for (let i = 0; i < formatNames.length; i++) {
    let formatName = formatNames[i];
    let tagValue = tagName[formatName];
    newFormat[formatName] = editor.hasFormat(tagValue);
  }

  if (isEquivalent(lastFormat, newFormat)) return;

  lastFormat = clone(newFormat);

  postFormat(lastFormat);
}

//compare two object are Equivalent or not
function isEquivalent(a, b) {
  // Create arrays of property names
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    var propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}

function clone(obj) {
  if (obj == null || typeof obj != 'object') return obj;

  var temp = new obj.constructor();
  for (var key in obj) temp[key] = clone(obj[key]);

  return temp;
}

function rgbToHex(rgb) {
  function hex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  if (rgb == null) return null;
  let color = rgb.match(/\d+/g).map(function (v) {
    return parseInt(v);
  });
  return hex(color[0], color[1], color[2]);
}

/******************************
 * Call function from iOS
 ******************************/

function focusEditor() {
  editor.focus();
}

function setFormat(tagKey) {
  let tagValue = tagName[tagKey];

  if (tagValue === 'undefined') return;

  editor.changeFormat({
    tag: tagValue
  });
}

function removeFormat(tagKey) {
  let tagValue = tagName[tagKey];

  if (tagValue === 'undefined') return;

  editor.changeFormat(null, {
    tag: tagValue
  });
}

function setFontSize(size) {
  editor.setFontSize(size + 'px');
}

function setTextColor(hex) {
  editor.setTextColour(hex);
}

function insertImage(url) {
  editor.insertImage(url);
}

function insertHTML(html) {
  editor.insertHTML(html);
}

function getHTML() {
  return editor.getHTML();
}

function clear() {
  editor.setHTML('');
}

function makeLink(link) {
  editor.makeLink(link);
}

function removeLink() {
  editor.removeLink();
}

function inserImage(src) {
  editor.insertImage(src);
}

function setTextSelection(startElementId, startIndex, endElementId, endIndex) {
  let startTextNode = Array.prototype.find.call(
    document.getElementById(startElementId).childNodes,
    function (item) {
      return item.nodeType == Node.TEXT_NODE;
    }
  );

  let endTextNode = Array.prototype.find.call(
    document.getElementById(endElementId).childNodes,
    function (item) {
      return item.nodeType == Node.TEXT_NODE;
    }
  );

  let range = editor.createRange(
    startTextNode,
    startIndex,
    endTextNode,
    endIndex
  );
  editor.setSelection(range);
}

function getSelectedText() {
  return editor.getSelectedText();
}

function setTextBackgroundColor(hex) {
  editor.setHighlightColour(hex)
}

/******************************
 * Post message to iOS
 ******************************/

function postEditorContentHeight(height) {
  window.webkit.messageHandlers.contentHeight.postMessage(height);
}

function postFontInfo(info) {
  window.webkit.messageHandlers.fontInfo.postMessage(info);
}

function postFormat(format) {
  window.webkit.messageHandlers.format.postMessage(format);
}