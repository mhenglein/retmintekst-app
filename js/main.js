"use strict";
/* Import functions */
import { sample1, sample2, sample3, sample4, sample5, sample6 } from "./samples.js";
import { dict } from "./array.js";

let data = {
  red: 0,
  yellow: 0,
  blue: 0,
  hard: 0,
  veryhard: 0,
  sentences: 0,
  words: 0,
  letters: 0,
  lix: 0,
  diff: "",
};

// DOM elements
const body = document.body;
const editor = document.getElementById("editor");
const exampleButton = document.getElementById("example-btn");
const highlight = document.getElementById("highlighter");
const clean = document.getElementById("clean");
const newPage = document.getElementById("new");
const startPage = document.getElementById("start");

// Local storage cache
const theme = localStorage.getItem("theme");
const savedText = localStorage.getItem("text_in_editor");

if (theme) {
  body.classList.add(theme);
} else {
  body.classList.add("light");
}

if (savedText !== null) {
  editor.innerHTML = savedText;
}
// On load
window.onload = function () {
  resetBadges();
  highlightText();
  editor.focus();
  placeCaretAtEnd(editor);
};
// Event listeners
highlight.onclick = () => highlightText();
startPage.onclick = () => loadStartPage();
newPage.onclick = () => removeAllText();
clean.onclick = () => cleanEditor();
exampleButton.onclick = () => newExample();
editor.addEventListener("paste", function (e) {
  e.preventDefault();
  let text = e.clipboardData.getData("text/plain");
  text = text.split("\n");
  text = text.map((p) => `<p>${p}</p>`);
  text = text.join("");
  // insert text manually
  document.execCommand("insertHTML", false, text);
  // editor.innerHTML = text; (This overwrites everything in the document)
  cleanEditor();
});
document.addEventListener("keydown", function () {
  localStorage.setItem("text_in_editor", editor.innerHTML);
});

function cleanEditor() {
  $("#editor *").each(function () {
    let attributes = this.attributes;
    let i = attributes.length;
    while (i--) {
      this.removeAttributeNode(attributes[i]);
    }
  });
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
  replaceTag();
  resetBadges();
  updateBadges();
}
function removeTag(...args) {
  for (let i = 0; i < args.length; i++) {
    $(`#editor ${args[i]}`).each(function () {
      this.outerHTML = this.innerHTML;
    });
  }
}
function replaceTag() {
  let html = editor.innerHTML;
  html = html
    .replace(/\&nbsp\;/g, "")
    .replace(/\\n\;/g, "")
    .replace(/\<span\>\<\/span\>/g, "")
    .replace(/\<div\>\<\/div\>/g, "")
    .replace(/\<p\>\<\/p\>/g, "")
    .replace(/\<b\>\<\/b\>/g, "")
    .replace(/\<strong\>\<\/strong\>/g, "")
    .replace(/\<br\>/g, "")
    .replace(/\<i\>\<\/i\>/g, "")
    .replace(/\<em\>\<\/em\>/g, "");
  editor.innerHTML = html;
}

function highlightText() {
  cleanEditor();

  // Loop through editor.tags one by one
  let allTags = document.querySelectorAll(".editor p, .editor h1, .editor li");
  let tagsLength = allTags.length;

  if (tagsLength === 0) {
    let text = editor.innerText;
    let paras = text.split("\n");

    paras = paras.map((p) => `<p>${p}</p>`).filter((p) => p.length > 0);
    text = paras.join(" ");
    editor.innerHTML = text;
    allTags = document.querySelectorAll(".editor p, .editor h1, .editor li");
    tagsLength = allTags.length;
  }

  let sentencesFromNode;

  $(document).ready(function () {
    var is_touch_device = "ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch);

    $('[data-toggle="popover"]').popover({
      trigger: is_touch_device ? "click focus" : "hover focus",
    });
  });

  let i, j;
  let levelOfSentence, wordsInSentence, lettersInSentence, lixOfSentence;

  // Loop through each paragraph;
  for (i = 0; i < tagsLength; i++) {
    // Reset array
    let replacementPairs = [];
    replacementPairs.splice(0, replacementPairs.length);

    // Get sentence data
    sentencesFromNode = getSentencesFromText(allTags[i].textContent);
    data.sentences += sentencesFromNode.length;
    if (sentencesFromNode !== undefined && sentencesFromNode.length > 0)
      // Loop through each sentence
      for (j = 0; j < sentencesFromNode.length; j++) {
        wordsInSentence = wordCounter(sentencesFromNode[j]);
        lettersInSentence = letterCounter(sentencesFromNode[j]);
        levelOfSentence = calculateLevel(lettersInSentence, wordsInSentence, 1);
        lixOfSentence = lixFormula(wordsInSentence, 1, data.longWords);
        sentencesFromNode[j] = evaluateSentence(wordsInSentence, levelOfSentence, sentencesFromNode[j]);
        allTags[i].innerHTML = sentencesFromNode.join(" ");
      }
    // Loop through the dictionary
    let text = allTags[i].innerHTML;
    allTags[i].innerHTML = analyzeText(text, dict, replacementPairs);

    // Replace all the IDs with the SpanTag
    let rex_replacement;
    let rex_test;

    if (replacementPairs !== undefined && replacementPairs.length > 0) {
      let text = allTags[i].innerHTML;

      for (let x = 0; x < replacementPairs.length; x++) {
        rex_replacement = new RegExp(replacementPairs[x][0], "g");

        rex_test = rex_replacement.test(text);
        if (rex_test) {
          text = text.replace(rex_replacement, replacementPairs[x][1]);
        }
      }

      allTags[i].innerHTML = text;
    }
  }

  // Run span tag
  updateBadges();
  resetBadges();
}
function getSentencesFromText(p) {
  // Replace [.!?] with a pipe (|); split by Regex on the pipe, which will also consume it
  let sentences = p
    .replace(/([.?!])\s*(?=[A-Z|Æ|Ø|Å])/g, "$1|")
    .split("|")
    .filter((s) => s.length > 0);

  return sentences;
}
function wordCounter(inputSentence) {
  const clean = cleanText(inputSentence);
  const wordArray = clean.split(" ");
  const numberOfLongWords = wordArray.filter((s) => s.length > 6);
  const numberOfWords = wordArray.length;
  data.words += numberOfWords;
  data.longwords += numberOfLongWords;
  return numberOfWords;
}
function letterCounter(inputSentence) {
  const numberOfLetters = cleanText(inputSentence).split(" ").join("").length;
  data.letters += numberOfLetters;
  return numberOfLetters;
}
function evaluateSentence(words, level, inputSentence) {
  if (words < 15) {
    return inputSentence;
  } else if (level >= 15 && level < 21) {
    data.hard++;
    return `<span class="hrdreadability">${inputSentence}</span>`;
  } else if (level >= 21) {
    data.veryhard++;
    return `<span class="veryhrdreadability">${inputSentence}</span>`;
  } else {
    return inputSentence;
  }
}
function calculateLevel(letters, words, sentences) {
  if (words === 0 || sentences === 0) {
    return 0;
  }
  let level = Math.round(4.71 * (letters / words) + (0.5 * words) / sentences - 21.43);
  return level <= 0 ? 0 : level;
}

function analyzeText(text, dict, replacementPairs) {
  if (!text || !dict) {
    console.log("Error in the first part of the analyzeText function; missing text or dictionary");
  }

  // Mimicking the regex boundary (which doesn't include ÆÆÅ)
  const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
  const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

  for (let k = 0; k < dict.length; k++) {
    let regex = dict[k][1];
    let type = dict[k][2];
    let popover = dict[k][3];
    let i_case = dict[k][4];
    let b_left = dict[k][5];
    let b_right = dict[k][6];

    let searchString = regex;
    if (b_left === 1) {
      searchString = b1 + searchString;
    }

    if (popover === null) {
      popover = "";
    }

    if (b_right === 1) {
      searchString = searchString + b2;
    }

    searchString = "(" + searchString + ")";

    let rex;
    if (i_case === 0) {
      rex = new RegExp(searchString);
    } else {
      rex = new RegExp(searchString, "i");
    }

    let rexMatch = rex.test(text);

    // Only proceed if there is a match
    if (rexMatch) {
      replaceRex();
    }

    function replaceRex() {
      let matchedRex = RegExp["$&"];
      matchedRex = matchedRex.trim();

      let cssClass;
      switch (type.toLowerCase()) {
        case "kliche":
          cssClass = "yellow";
          break;
        case "anglicisme":
          cssClass = "yellow";
          break;
        case "stavefejl":
          cssClass = "red";
          break;
        case "dobbeltkonfekt":
          cssClass = "red";
          break;
        // typisk should be blue
        case "typisk anvendt forkert":
          cssClass = "yellow";
          break;
        case "grammatik":
          cssClass = "red";
          break;
        case "formelt":
          cssClass = "yellow";
          break;
        case "buzzword":
          cssClass = "yellow";
          break;
        case "fyldeord":
          cssClass = "blue";
          break;
        case "generelt":
          cssClass = "red";
          break;
        default:
          cssClass = "grey";
          console.log("Switch statement in replaceRex went all the way to the default statement for the cssClass");
      }

      let spanString = ` <span class="${cssClass}" data-toggle="popover" data-original-title="${type}" data-content="${popover}">${matchedRex}</span> `;
      // Create array with unique IDs and replacement HTML strings
      let id = String(randomIdGenerator());
      id = " " + id + " ";
      replacementPairs.push([id, spanString]);
      text = text.replace(rex, id);
      updateBadgeCounter(type);

      // Run a new search; re-run function if yes
      rex = new RegExp(searchString, "i");
      rexMatch = rex.test(text);
      if (rexMatch) {
        replaceRex();
      }
    }
  }

  return text;
}

function updateBadgeCounter(type) {
  switch (type) {
    case "Kliche":
      data.yellow += 1;
      break;
    case "Anglicisme":
      data.yellow += 1;
      break;
    case "Formelt":
      data.yellow += 1;
      break;
    case "Buzzword":
      data.yellow += 1;
      break;
    case "Stavefejl":
      data.red += 1;
      break;
    case "Grammatik":
      data.red += 1;
      break;
    case "Typisk anvendt forkert":
      data.blue += 1;
      break;
    case "Dobbeltkonfekt":
      data.red += 1;
      break;
    case "Fyldeord":
      data.blue += 1;
      break;
    case "Generelt":
      data.red += 1;
      break;
    default:
      console.log("Switch statement in updateBadgeCounter went all the way to the default statement");
  }
}
function randomIdGenerator() {
  let a = "";
  for (let i = 0; i < 6; i++) {
    a = a + String(Math.floor(Math.random() * 9) + 1);
  }
  return Number(a);
}
function updateBadges() {
  calculateLix();

  const red = document.getElementById("badge-red");
  const yellow = document.getElementById("badge-yellow");
  const blue = document.getElementById("badge-blue");
  const sent = document.getElementById("span-sent");
  const words = document.getElementById("span-words");
  const lix = document.getElementById("span-lix");
  const diff = document.getElementById("span-diff");
  const time = document.getElementById("span-time");
  const easy = document.getElementById("badge-easy");
  const hard = document.getElementById("badge-hard");
  const veryhard = document.getElementById("badge-vhard");

  const easySentences = data.sentences - data.hard - data.veryhard;

  red.innerHTML = String(data.red);
  yellow.innerHTML = String(data.yellow);
  blue.innerHTML = String(data.blue);
  sent.innerHTML = String(data.sentences);
  words.innerHTML = String(data.words);
  time.innerHTML = calcReadingTime(data.words);
  lix.innerHTML = String(data.lix);
  diff.innerHTML = String(data.diff);
  easy.innerHTML = String(easySentences);
  hard.innerHTML = String(data.hard);
  veryhard.innerHTML = String(data.veryhard);
}

function resetBadges() {
  data.red = 0;
  data.yellow = 0;
  data.blue = 0;
  data.sentences = 0;
  data.letters = 0;
  data.words = 0;
  data.time = 0;
  data.diff = "";
  data.hard = 0;
  data.veryhard = 0;
}

function removeAllText() {
  editor.innerText = "";
  resetBadges();
  updateBadges();
}

function loadStartPage() {
  editor.innerHTML = sample1;
  placeCaretAtEnd(editor);
  highlightText();
}

function newExample() {
  const exampleNo = Number(exampleButton.innerText.trim().substring(13, 14));
  let nextSample = exampleNo + 1;
  nextSample = nextSample > 6 ? 1 : nextSample;
  exampleButton.innerHTML = `🔄 Eksempel (${nextSample})</span>`;
  const exampleText = randText(nextSample);
  editor.innerHTML = exampleText;
  editor.focus();
  placeCaretAtEnd(editor);
  highlightText();
}
function randText(randInt) {
  switch (randInt) {
    case 1:
      return sample1;

    case 2:
      return sample2;

    case 3:
      return sample3;

    case 4:
      return sample4;

    case 5:
      return sample5;

    case 6:
      return sample6;

    default:
      console.log("Switch statement for selecting the next sample text went all the way to the default statement");
      return sample1;
  }
}

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    let range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    let textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}
function cleanText(dirtyText) {
  return dirtyText.replace(/[\?!;:]/g, ".").replace(/[\,()"'!;\n\r]/g, " ");
}
function calculateLix() {
  let cleanText = editor.innerText;
  cleanText = cleanText.replace(/[\?!;:]/g, "."); // Replace all punctuation with full stops
  const arrSentences = cleanText.split(".");
  const punct = arrSentences.length - 1;
  const arrWords = cleanText.split(" ");
  let allWords = arrWords.length;
  let longWords = 0;
  let spaces = 0;
  for (let i = 0; i < allWords; i++) {
    if (arrWords[i].length < 1) {
      spaces++;
    }
    if (arrWords[i].length > 6) {
      longWords++;
    }
  }
  allWords = allWords - spaces; // Minor adjustment in the event of multiple (>=2 spaces)
  let lix = lixFormula(allWords, punct, longWords);

  let difficulty;
  if (allWords < 10 || punct < 3) {
    lix = 0;
    difficulty = "n/a";
  } else {
    difficulty = lixDifficulty(lix);
  }
  const lixLi = document.getElementById("li-lix");
  const diffLi = document.getElementById("li-difficulty");
  lixLi.textContent = `LIX: ${lix}`;
  diffLi.textContent = `Sværhedsgrad: ${difficulty}`;

  data.lix = lix;
  data.diff = difficulty;
}

function lixFormula(allWords, punct, longWords) {
  if (allWords === 0) {
    return 0;
  } else {
    let lix = Math.round(allWords / punct + (longWords * 100) / allWords);
    return lix <= 0 ? 0 : lix;
  }
}

function lixDifficulty(lix) {
  if (lix >= 55) return "Meget svær";
  else if (lix >= 45 && lix < 55) return "Svær";
  else if (lix >= 35 && lix < 45) return "Middel";
  else if (lix >= 25 && lix < 35) return "Let";
  else return "Let for alle";
}

function calcReadingTime(wordCount) {
  // Assume 200-250 words in one minute; adj. for DK figures
  const wordsPerMinute = 225;
  const timeToRead_decimal = wordCount / wordsPerMinute;
  const timeToRead = minTommss(timeToRead_decimal);

  function minTommss(minutes) {
    var sign = minutes < 0 ? "-" : "";
    var min = Math.floor(Math.abs(minutes));
    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
  }

  return timeToRead;
}
