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
  sourceLink: string;
  sourceLine: string;
  storageNote: string;
  rulesTitle: string;
  ruleClassic: string;
  ruleEndless: string;
  ruleTimer: string;
  ruleHard: string;
  ruleKeys: string;
  rulePoints: string;
  modeLabel: string;
  modeClassic: string;
  modeEndless: string;
  timerLabel: string;
  hardLabel: string;
  start: string;
  again: string;
  back: string;
  next: string;
  seeResult: string;
  questionProgress: string;
  questionEndless: string;
  scoreLabel: string;
  streakLabel: string;
  livesLabel: string;
  yearPrompt: string;
  monthPrompt: string;
  whichPrompt: string;
  hardBadge: string;
  correct: string;
  wrong: string;
  timeout: string;
  pointsGain: string;
  correctWas: string;
  archiveLink: string;
  keyboardHint: string;
  bestTitle: string;
  bestEmpty: string;
  bestLine: string;
  bestReset: string;
  bestResetDone: string;
  bestResetFailed: string;
  saveFailed: string;
  newScore: string;
  newStreak: string;
  summaryClassic: string;
  summaryEndless: string;
  shareHeading: string;
  shareDownload: string;
  shareNative: string;
  shareWorking: string;
  shareFailed: string;
  shareAlt: string;
  shareNote: string;
  dataNote: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
  months: readonly string[];
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "PS-Plus-Quiz",
  metaDescription:
    "PS-Plus-Quiz zu den monatlichen Spielen. Lokal im Browser, mit Punkten, Serie und einer teilbaren Karte. Inoffiziell, nicht von Sony.",
  eyebrow: "PS Plus · lokal",
  lede: "Zehn Fragen, oder so lange, bis drei Leben weg sind. Die Monate stammen aus dem PS-Plus-Archiv. Nichts wird hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Punkte und Serien bleiben nur in diesem Browser. Es wird nichts hochgeladen.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Quiz ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  sourceLink: "PS-Plus-Archiv",
  sourceLine: "Monatsdaten aus dem PS-Plus-Archiv, erzeugt am 22. Oktober 2026, abgezogen am 11. November 2026.",
  storageNote:
    "Bestleistung und beste Serie bleiben in diesem Browser unter dem Schlüssel consolecheat-quiz-best-v1. Zurücksetzen löscht nur diesen Schlüssel. Sprache und Erscheinungsbild liegen unter consolecheat-lang und consolecheat-theme.",
  rulesTitle: "So wird gespielt",
  ruleClassic: "Klassisch sind 10 Fragen. Danach siehst du Punkte, Serie und die richtigen Antworten.",
  ruleEndless: "Endlos läuft, bis drei Leben weg sind. Jede falsche Antwort kostet ein Leben.",
  ruleTimer: "Zeitdruck gibt jeder Frage 15 Sekunden. Was übrig bleibt, gibt ein paar Punkte extra. Ohne Antwort zählt die Frage als falsch.",
  ruleHard:
    "Schwer tauscht die Jahresfrage gegen Monat und Jahr. Die Mischung bleibt: welche Spiele in einem Monat dabei waren, und wann ein Spiel im Archiv steht.",
  ruleKeys: "Die Tasten 1 bis 4 antworten. Enter zeigt die nächste Frage.",
  rulePoints:
    "Eine richtige Antwort gibt 100 Punkte, eine Monatsfrage 150. Ab der zweiten richtigen Antwort in Folge kommen 25 Punkte je weiterer Stelle in der Serie dazu.",
  modeLabel: "Modus",
  modeClassic: "Klassisch",
  modeEndless: "Endlos",
  timerLabel: "Zeitdruck",
  hardLabel: "Schwer",
  start: "Start",
  again: "Nochmal",
  back: "Zurück",
  next: "Weiter",
  seeResult: "Ergebnis",
  questionProgress: "Frage {n} von {total}",
  questionEndless: "Frage {n}",
  scoreLabel: "Punkte",
  streakLabel: "Serie",
  livesLabel: "Leben {n} von {total}",
  yearPrompt: "In welchem Jahr war {title} bei PS Plus?",
  monthPrompt: "In welchem Monat und Jahr war {title} bei PS Plus?",
  whichPrompt: "Welches dieser Spiele war im {month} dabei?",
  hardBadge: "Schwer",
  correct: "Richtig.",
  wrong: "Falsch.",
  timeout: "Zeit abgelaufen.",
  pointsGain: "+{points}",
  correctWas: "Richtig ist {answer}.",
  archiveLink: "Im PS-Plus-Archiv",
  keyboardHint: "1–4 antworten, Enter weiter.",
  bestTitle: "Bestleistung",
  bestEmpty: "Noch keine Bestleistung.",
  bestLine: "{score} Punkte · Serie {streak}",
  bestReset: "Bestleistung zurücksetzen",
  bestResetDone: "Die Bestleistung ist gelöscht.",
  bestResetFailed: "Zurücksetzen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  saveFailed: "Speichern ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  newScore: "Neue Bestleistung.",
  newStreak: "Neue beste Serie.",
  summaryClassic: "{correct} von {total} richtig.",
  summaryEndless: "{correct} richtige Antworten.",
  shareHeading: "Ergebnis teilen",
  shareDownload: "PNG herunterladen",
  shareNative: "Teilen",
  shareWorking: "Die Karte wird gezeichnet.",
  shareFailed: "Die Karte konnte nicht erzeugt werden.",
  shareAlt: "Ergebniskarte mit Punkten, Serie und Modus.",
  shareNote: "Die Karte bleibt auf diesem Gerät. Sie wird nicht hochgeladen.",
  dataNote: "Die Fragen nutzen nur den lokalen Abzug. Ein anderes Archiv wird nicht abgerufen.",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk:
    "Wirklich die lokalen Daten dieser Seite löschen? Die Bestleistung (consolecheat-quiz-best-v1), die Sprache und das Erscheinungsbild. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  months: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
});

const en = pack({
  title: "PS Plus quiz",
  metaDescription:
    "A PS Plus quiz about the monthly games. Local in the browser, with points, a streak, and a shareable card. Unofficial, not Sony.",
  eyebrow: "PS Plus · local",
  lede: "Ten questions, or until three lives are gone. The months come from the PS Plus archive. Nothing is uploaded.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "Points and streaks stay in this browser only. Nothing is uploaded.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid for here. This page is not Sony.",
  temporary: "Temporarily next to the game backlog, until this quiz is its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  sourceLink: "PS Plus archive",
  sourceLine: "Monthly data from the PS Plus archive, generated on 22 October 2026, snapshotted on 11 November 2026.",
  storageNote:
    "The best score and best streak stay in this browser under the key consolecheat-quiz-best-v1. Reset removes only that key. Language and appearance use consolecheat-lang and consolecheat-theme.",
  rulesTitle: "How to play",
  ruleClassic: "Classic is 10 questions. After that you see the points, the streak, and how many were right.",
  ruleEndless: "Endless runs until three lives are gone. Each wrong answer costs one life.",
  ruleTimer: "Time pressure gives each question 15 seconds. Time left adds a few points. No answer counts as wrong.",
  ruleHard:
    "Hard swaps the year question for month and year. The mix stays: which games were in a month, and when a game was in the archive.",
  ruleKeys: "Keys 1 to 4 answer. Enter shows the next question.",
  rulePoints:
    "A right answer is 100 points, a month question is 150. From the second right answer in a row, each further step of the streak adds 25 points.",
  modeLabel: "Mode",
  modeClassic: "Classic",
  modeEndless: "Endless",
  timerLabel: "Time pressure",
  hardLabel: "Hard",
  start: "Start",
  again: "Again",
  back: "Back",
  next: "Next",
  seeResult: "Result",
  questionProgress: "Question {n} of {total}",
  questionEndless: "Question {n}",
  scoreLabel: "Points",
  streakLabel: "Streak",
  livesLabel: "Lives {n} of {total}",
  yearPrompt: "In which year was {title} on PS Plus?",
  monthPrompt: "In which month and year was {title} on PS Plus?",
  whichPrompt: "Which of these games was part of {month}?",
  hardBadge: "Hard",
  correct: "Right.",
  wrong: "Wrong.",
  timeout: "Time is up.",
  pointsGain: "+{points}",
  correctWas: "The answer is {answer}.",
  archiveLink: "In the PS Plus archive",
  keyboardHint: "1–4 answer, Enter continues.",
  bestTitle: "Best",
  bestEmpty: "No best score yet.",
  bestLine: "{score} points · streak {streak}",
  bestReset: "Reset best",
  bestResetDone: "Best score cleared.",
  bestResetFailed: "Could not reset. The browser blocked storage.",
  saveFailed: "Could not save. The browser blocked storage.",
  newScore: "New best score.",
  newStreak: "New best streak.",
  summaryClassic: "{correct} of {total} right.",
  summaryEndless: "{correct} right answers.",
  shareHeading: "Share result",
  shareDownload: "Download PNG",
  shareNative: "Share",
  shareWorking: "Drawing the card.",
  shareFailed: "Could not draw the card.",
  shareAlt: "Result card with points, streak, and mode.",
  shareNote: "The card stays on this device. It is not uploaded.",
  dataNote: "Questions use only the local snapshot. No other archive is requested.",
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete this page’s local data? The best score (consolecheat-quiz-best-v1), the language, and the appearance. The backlog and the screen-test pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "This page’s local data has been deleted. The backlog and the screen-test pattern stay.",
  deleteFailed: "Could not delete. The browser blocked storage.",
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
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

export function modeLine(text: Copy, mode: "classic" | "endless", timer: boolean, harder: boolean): string {
  const parts = [mode === "classic" ? text.modeClassic : text.modeEndless];
  if (timer) parts.push(text.timerLabel);
  if (harder) parts.push(text.hardLabel);
  return parts.join(" · ");
}
