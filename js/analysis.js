const cheerio = require("cheerio");
const dict = require(__dirname + "/dict.js");

/* To-do

// data.sentences += sentencesFromNode.length; don't know what to do with this one; return data object as well? multiple return values

//   data.letters += numberOfLetters;
//   data.words += numberOfWords;

*/

exports.highlight = highlightText;

function highlightText(inputHtml) {
  const $ = cheerio.load(inputHtml);

  // Get list of all paragraphs and headings in an array (Text); To-do: Deal with HTML mark-up
  let allTags = [];

  $("h1, p, li").each(function (i, elem) {
    allTags.push([$(elem).text(), $(elem)[0].name]);
  });

  const tagsLength = allTags.length;

  let sentencesFromNode;
  let levelOfSentence;
  let wordsInSentence;
  let lettersInSentence;

  // Loop throuch each of the paragraphs
  let replacementPairs = [];
  for (let i = 0; i < tagsLength; i++) {
    // Reset the 'replacementPairs' array
    replacementPairs.splice(0, replacementPairs.length);

    // Split paragraph in sentences (ignore the tag)
    sentencesFromNode = getSentencesFromText(allTags[i][0]);

    if (sentencesFromNode !== undefined && sentencesFromNode.length > 0)
      // Loop through each sentence
      for (let j = 0; j < sentencesFromNode.length; j++) {
        // Get all words in the sentence
        wordsInSentence = wordCounter(sentencesFromNode[j]);

        // Get all letters in the sentence
        lettersInSentence = letterCounter(sentencesFromNode[j]);

        // Calculate the difficulty of the sentence
        levelOfSentence = calculateLevel(lettersInSentence, wordsInSentence, 1);

        // Evaluate sentence difficulty based on # of words and the difficulty; return an HTML string
        sentencesFromNode[j] = evaluateSentence(wordsInSentence, levelOfSentence, sentencesFromNode[j]);

        // Join all the sentences together and add back to the paragraphs array
        allTags[i][0] = sentencesFromNode.join(" ");

        // Repeat for next paragraph
      }
  }

  // Loop through the 6 objects (replace with something better in the future
  //   allTags[i] = tagHTML(dict.generelt, allTags[i], "Generelt");
  //     allTags[i] = tagHTML(dict.kliche, allTags[i], "Kliche");
  //     allTags[i] = tagHTML(dict.pleonasme, allTags[i], "Pleonasme");
  //     allTags[i] = tagHTML(dict.anglicisme, allTags[i], "Anglicisme");
  //     allTags[i] = tagHTML(dict.fyldeord, allTags[i], "Fyldeord");
  //     allTags[i] = tagHTML(dict.stavefejl, allTags[i], "Stavefejl");

  //     // allTags[i] = analyzeText(dict.main, allTags[i]); (Goals)
  //     // Replace all the IDs with the SpanTag
  //     let rex_replacement;
  //     let rex_test;

  //     if (replacementPairs !== undefined && replacementPairs.length > 0) {
  //       // Create variable that holds the text of the paragraph/heading
  //       let text = allTags[i];

  //       // Loop through replacementPairs array, replacing the ID in the text with the actual HTML
  //       for (let x = 0; x < replacementPairs.length; x++) {
  //         // Create new regex based on the ID
  //         rex_replacement = new RegExp(replacementPairs[x][0], "g");

  //         // Test if the ID is in the text (it should be)
  //         rex_test = rex_replacement.test(text);
  //         if (rex_test) {
  //           // Replace the ID tag with the actual HTML
  //           text = text.replace(rex_replacement, replacementPairs[x][1]);
  //         }
  //       }

  //       // Add the final result back into the array
  //       allTags[i] = text;
  //     }
  //   }
  //   return allTags;
}

// allTags[i] = analyzeText(dict.main, allTags[i]); (Goals)
function analyzeText(dictionary, inputText) {
  //   Dictionary input is an array of arrays with: tekst, Regex, Type, and Tooltip
  // Regex constants
  const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
  const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

  // Loop through all keys in object word list
  let tekst, regex, type, tooltip;
  let rex, rexMatch, searchString, popover;
  for (let i = 0; i < dictionary.length; i++) {
    tekst = dictionary[i][0];
    regex = dictionary[i][1];
    type = dictionary[i][2];
    tooltip = dictionary[i][3];

    if (!regex || !type) {
      console.log("Error in the first part of analyzeText due to missing text or tag");
      return;
    }

    // Create search string, mimicking the regex boundary meta-character, \b, which doesn't include ÆÆÅ
    searchString = "(" + b1 + key + b2 + ")";

    // Create new regex that is case-insensitive, but not global
    rex = new RegExp(searchString, "i");

    // Test if the regex can be found in the text
    rexMatch = rex.test(text);
    if (rexMatch) {
      // Run the replace fn (local variables are passed over)
      replaceRex();
    }
    // Repeat for next dictionary entry
  }

  function replaceRex(type, tooltip) {
    // Tie the 'last match' of the regular expression to a variable; remove extra whitespace via trim()
    let matchedRex = RegExp["$&"];
    matchedRex = matchedRex.trim();

    // The applied CSS class is the lower-case version of the title
    let cssClass = type.toLowerCase();

    // Define the span class and popover attributes; trigger (hover, click) is defined in the <script> that instantiates it
    let spanString = ` <span class="${cssClass}" data-toggle="popover" data-original-title="${type}" data-content="${tooltip}">${matchedRex}</span> `;

    /* Create array with unique IDs and replacement HTML strings */

    // Get a random 8-digit ID
    let id = String(randomIdGenerator());

    // Push the ID and the span tag into the array
    replacementPairs.push([id, spanString]);

    // Replace the offending string in the main text with the ID (not the span)
    text = text.replace(rex, id);

    // Run a new search (any more offenders of this type?); re-run function if yes
    rex = new RegExp(searchString, "i");
    rexMatch = rex.test(text);
    if (rexMatch) {
      replaceRex();
    }
  }

  return text;
}

// function tagHTML(obj, text, tag) {
//   // Regex constants
//   const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
//   const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

//   // Loop through all keys in object word list
//   let rex, rexMatch, searchString, popover;
//   for (let key in obj) {
//     if (!text || !tag) {
//       console.log("Error in the first part of tagHTML due to missing text or tag");
//       return;
//     }

//     // Create search string, mimicking the regex boundary meta-character, \b, which doesn't include ÆÆÅ
//     searchString = "(" + b1 + key + b2 + ")";

//     // Create new regex that is case-insensitive, but not global
//     rex = new RegExp(searchString, "i");

//     // Test if the regex can be found in the text
//     rexMatch = rex.test(text);
//     if (rexMatch) {
//       // Get the popover 'help text' from the object
//       popover = obj[key];

//       // Run the replace fn (local variables are passed over)
//       replaceRex();
//     }
//   }

//   function replaceRex() {
//     // Tie the 'last match' of the regular expression to a variable; remove extra whitespace via trim()
//     let matchedRex = RegExp["$&"];
//     matchedRex = matchedRex.trim();

//     // The applied CSS class is the lower-case version of the tag (title)
//     let cssClass = tag.toLowerCase();

//     // Define the span class and popover attributes; trigger (hover, click) is defined in the <script> that instantiates it
//     let spanString = ` <span class="${cssClass}" data-toggle="popover" data-original-title="${tag}" data-content="${popover}">${matchedRex}</span> `;

//     /* Create array with unique IDs and replacement HTML strings */

//     // Get a random 8-digit ID
//     let id = String(randomIdGenerator());

//     // Push the ID and the span tag into the array
//     replacementPairs.push([id, spanString]);

//     // Replace the offending string in the main text with the ID (not the span)
//     text = text.replace(rex, id);

//     // Run a new search (any more offenders of this type?); re-run function if yes
//     rex = new RegExp(searchString, "i");
//     rexMatch = rex.test(text);
//     if (rexMatch) {
//       replaceRex();
//     }
//   }

//   return text;
// }

function getSentencesFromText(p) {
  // Takes an input string and splits it by sentence

  /* How it works: Use regex to replace [.!?:] with a pipe (|); split by the pipe, which will also consume it.
     In the event of issues, replace pipe with more obscure separator */

  let sentences = p
    .replace(/([.?!:])\s*(?=[A-Z|Æ|Ø|Å])/g, "$1|")
    .split("|")
    .filter((s) => s.length > 0);

  return sentences;
}

cleanText = function cleanText(dirtyText) {
  return dirtyText.replace(/[\?!;:]/g, ".").replace(/[\,()"'!;\n\r]/g, " ");
};

function wordCounter(inputSentence) {
  // Counts the number of words in a given sentence; uses cleanText fn to remove non-alphanumberic characters
  const numberOfWords = cleanText(inputSentence).split(" ").length;
  return numberOfWords;
}
function letterCounter(inputSentence) {
  // Counts the number of letters in a given sentence; uses cleanText fn to remove non-alphanumberic characters
  const numberOfLetters = cleanText(inputSentence).split(" ").join("").length;
  return numberOfLetters;
}

function calculateLevel(letters, words, sentences) {
  // Calculate the difficulty of a given sentence; up for revision

  if (words === 0 || sentences === 0) {
    return 0;
  }
  let level = Math.round(4.71 * (letters / words) + (0.5 * words) / sentences - 21.43);
  return level <= 0 ? 0 : level;
}

function evaluateSentence(words, level, inputSentence) {
  // Returns the formatted sentence, depending on its difficulty

  if (words < 14) {
    return inputSentence;
  } else if (level >= 11 && level < 15) {
    return `<span class="hrdreadability">${inputSentence}</span>`;
  } else if (level >= 15) {
    return `<span class="veryhrdreadability">${inputSentence}</span>`;
  } else {
    return inputSentence;
  }
}

function randomIdGenerator() {
  // Return a random 8-digit number
  let a = "";
  for (let i = 0; i < 6; i++) {
    a = a + String(Math.floor(Math.random() * 9) + 1);
  }
  return Number(a);
}
