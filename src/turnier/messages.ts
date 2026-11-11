export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

export type Copy = {
  brand: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  lede: string;
  freeClaim: string;
  privacyClaim: string;
  unofficial: string;
  footerNote: string;
  temporary: string;
  themeDark: string;
  themeLight: string;
  language: string;
  footerNav: string;
  toolsHeading: string;
  merkliste: string;
  storageNote: string;
  nameLabel: string;
  namePlaceholder: string;
  modeLabel: string;
  modeKo: string;
  modeKoHelp: string;
  modeLiga: string;
  modeLigaHelp: string;
  doubleRound: string;
  pointsLegend: string;
  pointsWin: string;
  pointsDraw: string;
  pointsLoss: string;
  playersLabel: string;
  playerLabel: string;
  playerPlaceholder: string;
  addPlayer: string;
  removePlayer: string;
  duplicate: string;
  needPlayers: string;
  drawAction: string;
  drawHint: string;
  redraw: string;
  newTournament: string;
  newAsk: string;
  newYes: string;
  newNo: string;
  exportPng: string;
  exportNote: string;
  storageFailed: string;
  setupHeading: string;
  planHeading: string;
  tableHeading: string;
  roundFinal: string;
  roundSemi: string;
  roundQuarter: string;
  roundEighth: string;
  roundN: string;
  bye: string;
  waiting: string;
  scoreAction: string;
  homeScore: string;
  awayScore: string;
  saveScore: string;
  cancel: string;
  drawNotAllowed: string;
  scoreInvalid: string;
  confirmTitle: string;
  confirmBody: string;
  confirmYes: string;
  confirmNo: string;
  saved: string;
  winnerEyebrow: string;
  winnerTitle: string;
  played: string;
  colPlayed: string;
  colWon: string;
  colDrawn: string;
  colLost: string;
  colGoals: string;
  colDiff: string;
  colPoints: string;
  tableLabel: string;
  matchday: string;
  scrollHint: string;
  liveDraw: string;
  liveRedraw: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
  defaultTitle: string;
  controls: string;
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "Couch-Turnier-Planer",
  metaDescription:
    "Couch-Turnier-Planer: K.-o. oder Liga für 2 bis 16 Namen, Auslosung und Tabelle im Browser. Das Turnier bleibt in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "COUCH · ABEND",
  lede: "Namen auf die Liste, auslosen, Ergebnisse tippen. K.-o. oder Liga, für den Abend auf dem Sofa. Nichts wird hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine sensiblen Daten werden gespeichert. Das Turnier bleibt in diesem Browser und wird nicht hochgeladen.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend hier, bis der Planer ein eigenes Projekt ist.",
  themeDark: "Dunkles Erscheinungsbild",
  themeLight: "Helles Erscheinungsbild",
  language: "Sprache",
  footerNav: "Seitenfuß",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  storageNote: "Das Turnier bleibt in diesem Browser unter dem Schlüssel consolecheat-turnier-v1.",
  nameLabel: "Turniername",
  namePlaceholder: "Sofa-Cup",
  modeLabel: "Modus",
  modeKo: "K.-o.",
  modeKoHelp: "Einmal verlieren und raus. Freilose rücken von allein weiter. Unentschieden gibt es nicht.",
  modeLiga: "Liga",
  modeLigaHelp: "Jeder gegen jeden, nach Spieltag. Bei ungerader Zahl ein Freilos pro Runde.",
  doubleRound: "Hin- und Rückrunde",
  pointsLegend: "Punkte",
  pointsWin: "Sieg",
  pointsDraw: "Unentschieden",
  pointsLoss: "Niederlage",
  playersLabel: "Spieler",
  playerLabel: "Spieler {n}",
  playerPlaceholder: "Name",
  addPlayer: "Spieler hinzufügen",
  removePlayer: "{name} entfernen",
  duplicate: "Diesen Namen gibt es schon.",
  needPlayers: "Trag 2 bis 16 verschiedene Namen ein.",
  drawAction: "Auslosen",
  drawHint: "Die Auslosung mischt mit dem Zufall dieses Browsers. Neu auslosen geht, bis das erste Ergebnis steht.",
  redraw: "Neu auslosen",
  newTournament: "Neues Turnier",
  newAsk: "Wirklich neu anfangen? Nur der Schlüssel consolecheat-turnier-v1 wird gelöscht. Sprache und Erscheinungsbild bleiben.",
  newYes: "Nur dieses Turnier löschen",
  newNo: "Abbrechen",
  exportPng: "PNG speichern",
  exportNote: "Die Datei heißt consolecheat-turnier.png und bleibt auf diesem Gerät.",
  storageFailed: "Der Browser hat das Turnier nicht gespeichert. Bis zum Neuladen bleibt es auf der Seite.",
  setupHeading: "Aufstellung",
  planHeading: "Spielplan",
  tableHeading: "Tabelle",
  roundFinal: "Finale",
  roundSemi: "Halbfinale",
  roundQuarter: "Viertelfinale",
  roundEighth: "Achtelfinale",
  roundN: "Runde {n}",
  bye: "Freilos",
  waiting: "wartet",
  scoreAction: "Ergebnis: {home} gegen {away}",
  homeScore: "Tore {name}",
  awayScore: "Tore {name}",
  saveScore: "Ergebnis speichern",
  cancel: "Abbrechen",
  drawNotAllowed: "Im K.-o. braucht es einen Sieger.",
  scoreInvalid: "Zwei ganze Zahlen von 0 bis 99.",
  confirmTitle: "Spätere Spiele zurücksetzen?",
  confirmBody: "Dieses Ergebnis ändert, wer weiterspielt. Abhängige Ergebnisse werden gelöscht: {count}.",
  confirmYes: "Zurücksetzen und speichern",
  confirmNo: "Abbrechen",
  saved: "Ergebnis gespeichert.",
  winnerEyebrow: "Der Pokal bleibt hier",
  winnerTitle: "Sieger: {name}",
  played: "gespielt",
  colPlayed: "Sp",
  colWon: "S",
  colDrawn: "U",
  colLost: "N",
  colGoals: "Tore",
  colDiff: "Diff",
  colPoints: "Pkt",
  tableLabel: "Tabelle",
  matchday: "Spieltag {n}",
  scrollHint: "Der Spielplan lässt sich seitwärts schieben.",
  liveDraw: "Auslosung fertig.",
  liveRedraw: "Neu ausgelost.",
  deleteAll: "Turnier zurücksetzen",
  deleteAsk: "Wirklich das Turnier in diesem Browser löschen? Nur der Schlüssel consolecheat-turnier-v1. Sprache und Erscheinungsbild bleiben.",
  deleteYes: "Nur das Turnier löschen",
  deleteNo: "Abbrechen",
  deleted: "Das Turnier ist aus diesem Browser gelöscht.",
  deleteFailed: "Das Turnier konnte nicht gelöscht werden.",
  defaultTitle: "Couch-Turnier",
  controls: "Tab geht durch die Felder. Enter speichert ein Ergebnis. Escape schließt ein Fenster.",
});

const en = pack({
  title: "Couch tournament planner",
  metaDescription:
    "Couch tournament planner: knockout or league for 2 to 16 names, draw and table in the browser. The tournament stays in this browser. Unofficial, not from Sony.",
  eyebrow: "COUCH · NIGHT",
  lede: "Put the names in, draw them, type the scores. Knockout or league, for a night on the sofa. Nothing is uploaded.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "No sensitive data is stored. The tournament stays in this browser and is not uploaded.",
  unofficial: "Unofficial. Not from Sony.",
  footerNote: "Nothing is charged. This page is not Sony.",
  temporary: "Temporarily here, until the planner has its own project.",
  themeDark: "Dark appearance",
  themeLight: "Light appearance",
  language: "Language",
  footerNav: "Footer",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  storageNote: "The tournament stays in this browser under the key consolecheat-turnier-v1.",
  nameLabel: "Tournament name",
  namePlaceholder: "Sofa cup",
  modeLabel: "Mode",
  modeKo: "Knockout",
  modeKoHelp: "One loss and you are out. Byes move on by themselves. Draws are not allowed.",
  modeLiga: "League",
  modeLigaHelp: "Everyone plays everyone, by matchday. An odd count gets a bye each round.",
  doubleRound: "Home and away",
  pointsLegend: "Points",
  pointsWin: "Win",
  pointsDraw: "Draw",
  pointsLoss: "Loss",
  playersLabel: "Players",
  playerLabel: "Player {n}",
  playerPlaceholder: "Name",
  addPlayer: "Add player",
  removePlayer: "Remove {name}",
  duplicate: "That name is already in.",
  needPlayers: "Enter 2 to 16 different names.",
  drawAction: "Draw",
  drawHint: "The draw shuffles with this browser’s randomness. You can redraw until the first result is in.",
  redraw: "Redraw",
  newTournament: "New tournament",
  newAsk: "Really start over? Only the key consolecheat-turnier-v1 is removed. Language and appearance stay.",
  newYes: "Delete only this tournament",
  newNo: "Cancel",
  exportPng: "Save PNG",
  exportNote: "The file is named consolecheat-turnier.png and stays on this device.",
  storageFailed: "The browser did not store the tournament. It stays on the page until reload.",
  setupHeading: "Setup",
  planHeading: "Bracket",
  tableHeading: "Table",
  roundFinal: "Final",
  roundSemi: "Semifinal",
  roundQuarter: "Quarterfinal",
  roundEighth: "Round of 16",
  roundN: "Round {n}",
  bye: "Bye",
  waiting: "waiting",
  scoreAction: "Score: {home} versus {away}",
  homeScore: "Goals {name}",
  awayScore: "Goals {name}",
  saveScore: "Save score",
  cancel: "Cancel",
  drawNotAllowed: "Knockout needs a winner.",
  scoreInvalid: "Two whole numbers from 0 to 99.",
  confirmTitle: "Clear later matches?",
  confirmBody: "This result changes who goes through. Dependent results that will be cleared: {count}.",
  confirmYes: "Clear and save",
  confirmNo: "Cancel",
  saved: "Score saved.",
  winnerEyebrow: "The cup stays here",
  winnerTitle: "Winner: {name}",
  played: "played",
  colPlayed: "Pld",
  colWon: "W",
  colDrawn: "D",
  colLost: "L",
  colGoals: "Goals",
  colDiff: "Diff",
  colPoints: "Pts",
  tableLabel: "Table",
  matchday: "Matchday {n}",
  scrollHint: "The bracket scrolls sideways.",
  liveDraw: "Draw complete.",
  liveRedraw: "Redrawn.",
  deleteAll: "Reset tournament",
  deleteAsk: "Really delete the tournament in this browser? Only the key consolecheat-turnier-v1. Language and appearance stay.",
  deleteYes: "Delete only the tournament",
  deleteNo: "Cancel",
  deleted: "The tournament is deleted from this browser.",
  deleteFailed: "The tournament could not be deleted.",
  defaultTitle: "Couch tournament",
  controls: "Tab moves through the fields. Enter saves a score. Escape closes a dialog.",
});

export const copy: Record<Lang, Copy> = { de, en };

const ids = new Set<string>(languageOptions.map((item) => item.id));

export function isLang(value: string | null): value is Lang {
  return value !== null && ids.has(value);
}

export function initialLang(stored: string | null): Lang {
  return isLang(stored) ? stored : "de";
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([A-Za-z0-9]+)\}/g, (all, key: string) => {
    const value = values[key];
    return value === undefined ? all : String(value);
  });
}

export function roundName(text: Copy, round: number, total: number): string {
  const fromEnd = total - 1 - round;
  if (fromEnd === 0) return text.roundFinal;
  if (fromEnd === 1) return text.roundSemi;
  if (fromEnd === 2) return text.roundQuarter;
  if (fromEnd === 3) return text.roundEighth;
  return fill(text.roundN, { n: round + 1 });
}

export function formatDiff(diff: number): string {
  if (diff > 0) return `+${diff}`;
  return String(diff);
}
