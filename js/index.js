const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const bodyParser = require("body-parser");
const analysis = require(__dirname + "/js/analysis.js");
const { google } = require("googleapis");

// const app = express();
// app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(__dirname + "/public/"));

const sheetsID = "1UIZWS30v7mi62YkJVHGYOky4ydA6HVYT86t4v7-g5L4";
const authCode = "4/zgFIR1SkkHZVUJx72gweVFNp6NgRYqqhOGzBjFENTubIfcmcujeOKnA08Jm0CYM0qP9kceo4ePkT_bMLTHltcNw";
const refreshToken =
  "1//04XOH-S6TBmKTCgYIARAAGAQSNwF-L9IrDGMFmN9NvToTQwr-GGU7Plb448nyI0DY0HqBczx5LrvLA8-VaO3qdUnwVpXhOxoq680";
const accessToken =
  "ya29.a0Ae4lvC2AUBP85tyt80sPgxG7pfMHFZmdpDhiCzHTrm3F6HGUsynSSGSzat0aOrNiMpzrNYT8ErD54fWYr72gPrOYENx3J_ZmMqLOwYHAO8edyG2GiboJ-CuxyHRKwljY58GKGsxEdQ0LKrBVBaDcRp7s87un2hpvAgo";

// BEFORE RUNNING:
// ---------------
// 1. If not already done, enable the Google Sheets API
//    and check the quota for your project at
//    https://console.developers.google.com/apis/api/sheets
// 2. Install the Node.js client library by running
//    `npm install googleapis --save`

const sheets = google.sheets("v4");

async function main() {
  const authClient = await authorize();
  const request = {
    // The spreadsheet to request.
    spreadsheetId: sheetsID, // TODO: Update placeholder value.

    // The ranges to retrieve from the spreadsheet.
    ranges: ["A1", "F10000"], // TODO: Update placeholder value.

    // True if grid data should be returned.
    // This parameter is ignored if a field mask was set in the request.
    includeGridData: false, // TODO: Update placeholder value.

    auth: authClient,
  };

  try {
    const response = (await sheets.spreadsheets.get(request)).data;
    // TODO: Change code below to process the `response` object:
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(err);
  }
}
main();

async function authorize() {
  // TODO: Change placeholder below to generate authentication credentials. See
  // https://developers.google.com/sheets/quickstart/nodejs#step_3_set_up_the_sample
  //
  // Authorize using one of the following scopes:
  //   'https://www.googleapis.com/auth/drive'
  //   'https://www.googleapis.com/auth/drive.file'
  //   'https://www.googleapis.com/auth/drive.readonly'
  //   'https://www.googleapis.com/auth/spreadsheets'
  //   'https://www.googleapis.com/auth/spreadsheets.readonly'
  let authClient = null;

  if (authClient == null) {
    throw Error("authentication failed");
  }

  return authClient;
}

// // API til ordklasser
// app.get("/api", function (req, res) {
//   res.render("api", { ordKlasse: "test" });
// });

// app.post("/api", function (req, res) {
//   const word = req.body.checkWord;
//   const rfo = "https://dsn.dk/?retskriv=" + word;
//   const ddo = "https://ordnet.dk/ddo/ordbog?query=" + word;

//   axios
//     .get(rfo)
//     .then((response) => {
//       const $ = cheerio.load(response.data);
//       const firstWord = $("#articles div:first-of-type b").text();
//       const firstWordType = $("#articles div:first-of-type abbr").text();
//       console.log(firstWord, firstWordType);

//       res.render("api", { ordKlasse: firstWordType });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

// app.listen(4000, () => {
//   console.log("App listening on port 4000");
// });

// Main app
const defaultText = `<h1>Velkommen til RetMinTekst</h1>
<p>(NB: Du kan redigere i al tekst på denne side. Slet det hele, og indsæt din egen 🚀)</p>
<p>
  "Sproget er demokratisk", siger man, og det er den daglige brug, som dikterer, hvilke ord betyder hvad. Det ved vi fra
  den østrigske filosof Ludwig Wittgenstein. Men han sagde også, at man indimellem bliver nødt til at tage ord ud af
  brug og sende dem til rens.
</p>

<p>RetMinTekst er en online korrekturtjekker, der automatisk gennemlyser din tekst og finder forbedringsområder.</p>

<p>
  🤯 <strong>Generelle, sproglige snubletråde</strong>: Überformelle vendinger, pinlige eufemismer, nervepirrende
  buzzwords. Vi fanger dem alle her.
</p>

<p>
  🐷 <strong>Fyldeord</strong>: Ord som bare, alligevel, måske, virkelig og ting har en uvane med at snige sig ind i
  tekster. Det er langt fra altid, de skal fjernes, men vi markerer dem for dig alligevel.
</p>

<p>
  🥱 <strong>Klichéer</strong> bliver du ikke smidt i fængsel for at bruge, og men du springer over, hvor gærdet er
  lavest.
</p>

<p>
  🇬🇧 <strong>Anglicismer</strong>. Her er en lille reminder om anglicismer AKA lån af ord, vendinger eller udtryksformer
  fra engelsk. Vi markerer alle de anglicismer, vi kan finde, så bliv vænnet til det.
</p>

<p>
  🤦‍♂️ <strong>Stavefejl</strong> klarer Microsoft Word bedst, men vi står klar, hvis det svipser med nogle af de mest
  typiske fejl, som fx. diskution, igår og virusser
</p>

<p>
  🍬 <strong>Pleonasmer</strong> er også kendt som dobbeltkonfekt. Det skaber fyld i din tekst, når du bruger to ord til
  at beskrive, hvad ét af ordene formede på egen hånd, som f.eks. jødisk rabbiner, bakke baglæns, lesbiske kvinder eller
  at "gå til fods"
</p>

<p>
  RetMinTekst er baseret på input fra bogen
  <a href="https://www.saxo.com/dk/kort-cool_susanne-staun_haeftet_9788702199017">Kort & Cool</a>. Værktøjet bliver
  løbende opdateret. Hvis du oplever nogle problemer, eller hvis vi har overset et djævleord, så kontakt os gerne på
</p>
`;

// let data = {
//   generelt: 0,
//   kliche: 0,
//   anglicisme: 0,
//   pleonasme: 0,
//   stavefejl: 0,
//   fyldeord: 0,
//   sentences: 0,
//   words: 0,
//   letters: 0,
//   hard: 0,
//   veryhard: 0,
// };

// let objName = {
//   kliche: objKliche,
//   pleonasme: objPleonasme,
//   stavefejl: objStavefejl,
//   fyldeord: objFyldeord,
//   generelt: objGenerelt,
//   anglicisme: objAnglicisme,
// };

// const inputHtml = req.body.inputText;
const inputHtml = defaultText;
const returnHtml = analysis.highlight(inputHtml);
console.log(returnHtml);

// app.get("/app", function (req, res) {
//   //Serve up the main page with link to main.js, allowing for all required functionality
//   res.render("app", { editorInput: defaultText });
// });

// console.log(returnHTML);
// res.render("app", { editorInput: returnHTML });

// Take editor HTML as input
// cleanHTML
// Run through 'highlight text'
// Send back HTML - simples
// app.post("/app", function (req, res) {});

// // API til ordklasser
// app.get("/api", function (req, res) {
//   res.render("api", { ordKlasse: "test" });
// });

// app.post("/api", function (req, res) {
//   const word = req.body.checkWord;
//   const rfo = "https://dsn.dk/?retskriv=" + word;
//   const ddo = "https://ordnet.dk/ddo/ordbog?query=" + word;

//   axios
//     .get(rfo)
//     .then((response) => {
//       const $ = cheerio.load(response.data);
//       const firstWord = $("#articles div:first-of-type b").text();
//       const firstWordType = $("#articles div:first-of-type abbr").text();
//       console.log(firstWord, firstWordType);

//       res.render("api", { ordKlasse: firstWordType });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

// app.listen(4000, () => {
//   console.log("App listening on port 4000");
// });
