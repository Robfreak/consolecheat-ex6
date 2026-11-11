export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

export type SymbolName = "cross" | "circle" | "square" | "triangle";

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
  related: string;
  controller: string;
  rulesTitle: string;
  ruleDelay: string;
  ruleFalseStart: string;
  ruleWrong: string;
  ruleSolo: string;
  ruleDuel: string;
  ruleEasy: string;
  ruleWindow: string;
  modeLabel: string;
  modeSolo: string;
  modeDuel: string;
  styleLabel: string;
  styleMatch: string;
  styleEasy: string;
  goalLabel: string;
  goal3: string;
  goal5: string;
  soundLabel: string;
  soundOn: string;
  soundOff: string;
  start: string;
  again: string;
  back: string;
  cancel: string;
  ready: string;
  now: string;
  falseStart: string;
  falseStartAward: string;
  wrong: string;
  wrongSolo: string;
  wrongDuel: string;
  miss: string;
  timeout: string;
  average: string;
  best: string;
  bestTitle: string;
  bestEmpty: string;
  bestReset: string;
  bestResetDone: string;
  bestResetFailed: string;
  newBest: string;
  noValid: string;
  roundLabel: string;
  toGoal: string;
  player1: string;
  player2: string;
  wins: string;
  score: string;
  connected: string;
  disconnected: string;
  padsHeading: string;
  mapTitle: string;
  mapP1: string;
  mapP2: string;
  mapEasy: string;
  mapPad: string;
  symbols: Record<SymbolName, string>;
  storageNote: string;
  thisRun: string;
  fastest: string;
  roundsHeading: string;
  tapHint: string;
  playHint: string;
  soloDone: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "Reaktions-Duell",
  metaDescription:
    "Reaktions-Duell für eine oder zwei Personen. Lokal im Browser, mit Controller oder Tastatur. Inoffiziell, nicht von Sony.",
  eyebrow: "Reaktion · lokal",
  lede: "Ein PlayStation-Symbol erscheint nach einer kurzen, zufälligen Wartezeit. Drück die passende Taste so schnell du kannst.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Zeiten bleiben nur in diesem Browser. Es wird nichts hochgeladen.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Spiel ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  related: "Verwandt",
  controller: "Controller-Tester",
  rulesTitle: "Regeln",
  ruleDelay:
    "Das Symbol kommt nach 1,5 bis 4 Sekunden. Die Zeit läuft ab dem Moment, in dem es sichtbar ist, in Millisekunden.",
  ruleFalseStart:
    "Ein Druck, bevor das Symbol da ist, ist ein Fehlstart. Im Solo ist die Runde verloren und zählt nicht in Schnitt und Bestzeit. Im Duell bekommt der andere Spieler den Punkt.",
  ruleWrong:
    "Die falsche Taste zählt als Fehlversuch. Im Solo ist die Runde vorbei und zählt nicht in Schnitt und Bestzeit. Im Duell ist dieser Spieler für die Runde raus, der andere kann noch die richtige Taste drücken. Liegen beide daneben, gibt es keinen Punkt.",
  ruleSolo: "Solo sind 5 Runden. Danach siehst du jede Zeit, den Schnitt der gültigen Zeiten und die beste gültige Zeit.",
  ruleDuel:
    "Im Duell gewinnt den Punkt, wer zuerst richtig drückt. Zuerst auf 3 oder auf 5, das stellst du vorher ein. Am Ende stehen die Runden und die Zeiten.",
  ruleEasy:
    "Einfach schaltet das Zuordnen aus. Es zählt nur die Reaktion auf das Signal. Spieler 1 ist die Taste A, Spieler 2 die Taste L. Am Controller zählt jede der vier Symboltasten. Ein Druck davor bleibt ein Fehlstart.",
  ruleWindow: "Ohne gültigen Druck innerhalb von 5 Sekunden ist die Runde ein Fehlversuch ohne Zeit.",
  modeLabel: "Modus",
  modeSolo: "Solo",
  modeDuel: "Duell",
  styleLabel: "Eingabe",
  styleMatch: "Symbole",
  styleEasy: "Einfach",
  goalLabel: "Ziel",
  goal3: "Zuerst 3",
  goal5: "Zuerst 5",
  soundLabel: "Ton",
  soundOn: "Ton an",
  soundOff: "Ton aus",
  start: "Start",
  again: "Nochmal",
  back: "Zurück",
  cancel: "Abbrechen",
  ready: "Bereit. Noch nicht drücken.",
  now: "Jetzt",
  falseStart: "Fehlstart",
  falseStartAward: "Punkt für {player}.",
  wrong: "Falsch",
  wrongSolo: "Die Runde zählt nicht.",
  wrongDuel: "Daneben. Der andere Spieler kann noch.",
  miss: "Kein Punkt.",
  timeout: "Zeit abgelaufen.",
  average: "Schnitt",
  best: "Beste",
  bestTitle: "Bestzeiten",
  bestEmpty: "Noch keine Bestzeit.",
  bestReset: "Bestzeiten zurücksetzen",
  bestResetDone: "Die Bestzeiten sind gelöscht.",
  bestResetFailed: "Zurücksetzen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  newBest: "Neue Bestzeit.",
  noValid: "Keine gültige Zeit.",
  roundLabel: "Runde {n} von {total}",
  toGoal: "Zuerst {n}",
  player1: "Spieler 1",
  player2: "Spieler 2",
  wins: "{player} gewinnt",
  score: "{a} : {b}",
  connected: "verbunden",
  disconnected: "kein Controller",
  padsHeading: "Controller",
  mapTitle: "Tasten",
  mapP1: "Spieler 1: W Dreieck, A Quadrat, S Kreuz, D Kreis.",
  mapP2:
    "Spieler 2: I Dreieck, J Quadrat, K Kreuz, L Kreis. Pfeiltasten: hoch Dreieck, links Quadrat, runter Kreuz, rechts Kreis.",
  mapEasy: "Einfach: Spieler 1 die Taste A, Spieler 2 die Taste L. Das Symbol zählt nicht.",
  mapPad:
    "Controller: Taste 0 Kreuz, 1 Kreis, 2 Quadrat, 3 Dreieck. Der erste verbundene Controller ist Spieler 1, der zweite Spieler 2.",
  symbols: { cross: "Kreuz", circle: "Kreis", square: "Quadrat", triangle: "Dreieck" },
  storageNote:
    "Bestzeiten bleiben in diesem Browser unter dem Schlüssel consolecheat-reaktion-best-v1. Zurücksetzen löscht nur diesen Schlüssel. Sprache und Erscheinungsbild liegen unter consolecheat-lang und consolecheat-theme.",
  thisRun: "Dieser Durchgang",
  fastest: "Schnellste Zeit",
  roundsHeading: "Runden",
  tapHint: "Auf dem Handy tippen die beiden Felder.",
  playHint: "Drück die passende Taste.",
  soloDone: "Fertig",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk:
    "Wirklich die lokalen Daten dieser Seite löschen? Die Bestzeiten (consolecheat-reaktion-best-v1), die Sprache und das Erscheinungsbild. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
});

const en = pack({
  title: "Reaction duel",
  metaDescription:
    "A reaction duel for one or two players. Local in the browser, with a controller or the keyboard. Unofficial, not Sony.",
  eyebrow: "Reaction · local",
  lede: "A PlayStation symbol appears after a short, random wait. Press the matching button as fast as you can.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "Times stay in this browser only. Nothing is uploaded.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid for here. This page is not Sony.",
  temporary: "Temporarily next to the game backlog, until this game is its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  related: "Related",
  controller: "Controller tester",
  rulesTitle: "Rules",
  ruleDelay: "The symbol appears after 1.5 to 4 seconds. The clock starts when it becomes visible, in milliseconds.",
  ruleFalseStart:
    "A press before the symbol is there is a false start. In solo the round is lost and is left out of the average and the best time. In a duel the other player gets the point.",
  ruleWrong:
    "The wrong button counts as a miss. In solo the round ends and is left out of the average and the best time. In a duel that player is out for the round, and the other player can still press the right button. If both miss, nobody scores.",
  ruleSolo: "Solo is 5 rounds. After that you see each time, the average of the valid times, and the best valid time.",
  ruleDuel:
    "In a duel the point goes to whoever presses correctly first. First to 3 or first to 5, chosen before the start. The end screen lists the rounds and the times.",
  ruleEasy:
    "Easy turns matching off. Only the reaction to the signal counts. Player 1 is the A key, player 2 is the L key. On a controller any of the four symbol buttons counts. A press before the signal is still a false start.",
  ruleWindow: "With no valid press within 5 seconds the round is a miss with no time.",
  modeLabel: "Mode",
  modeSolo: "Solo",
  modeDuel: "Duel",
  styleLabel: "Input",
  styleMatch: "Symbols",
  styleEasy: "Easy",
  goalLabel: "Goal",
  goal3: "First to 3",
  goal5: "First to 5",
  soundLabel: "Sound",
  soundOn: "Sound on",
  soundOff: "Sound off",
  start: "Start",
  again: "Again",
  back: "Back",
  cancel: "Stop",
  ready: "Ready. Do not press yet.",
  now: "Now",
  falseStart: "False start",
  falseStartAward: "Point to {player}.",
  wrong: "Wrong",
  wrongSolo: "This round does not count.",
  wrongDuel: "Miss. The other player can still answer.",
  miss: "No point.",
  timeout: "Time is up.",
  average: "Average",
  best: "Best",
  bestTitle: "Best times",
  bestEmpty: "No best time yet.",
  bestReset: "Reset best times",
  bestResetDone: "Best times cleared.",
  bestResetFailed: "Could not reset. The browser blocked storage.",
  newBest: "New best time.",
  noValid: "No valid time.",
  roundLabel: "Round {n} of {total}",
  toGoal: "First to {n}",
  player1: "Player 1",
  player2: "Player 2",
  wins: "{player} wins",
  score: "{a} : {b}",
  connected: "connected",
  disconnected: "no controller",
  padsHeading: "Controllers",
  mapTitle: "Keys",
  mapP1: "Player 1: W triangle, A square, S cross, D circle.",
  mapP2: "Player 2: I triangle, J square, K cross, L circle. Arrow keys: up triangle, left square, down cross, right circle.",
  mapEasy: "Easy: player 1 is the A key, player 2 is the L key. The symbol does not matter.",
  mapPad:
    "Controllers: button 0 cross, 1 circle, 2 square, 3 triangle. The first connected controller is player 1, the second is player 2.",
  symbols: { cross: "Cross", circle: "Circle", square: "Square", triangle: "Triangle" },
  storageNote:
    "Best times stay in this browser under the key consolecheat-reaktion-best-v1. Reset removes only that key. Language and appearance use consolecheat-lang and consolecheat-theme.",
  thisRun: "This run",
  fastest: "Fastest",
  roundsHeading: "Rounds",
  tapHint: "On a phone, tap the two zones.",
  playHint: "Press the matching button.",
  soloDone: "Done",
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete this page’s local data? The best times (consolecheat-reaktion-best-v1), the language, and the appearance. The backlog and the screen-test pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "This page’s local data has been deleted. The backlog and the screen-test pattern stay.",
  deleteFailed: "Could not delete. The browser blocked storage.",
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
  return template.replace(/\{([A-Za-z0-9]+)\}/g, (all, key) => {
    const value = values[key];
    return value === undefined ? all : String(value);
  });
}
