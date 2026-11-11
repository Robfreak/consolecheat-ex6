import type { StoreIssue } from "./transfer.ts";

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
  backgroundNote: string;
  controlsHeading: string;
  controls: string;
  profileLabel: string;
  gameLabel: string;
  categoryLabel: string;
  newProfile: string;
  deleteProfile: string;
  attemptsLabel: string;
  sobLabel: string;
  bptLabel: string;
  pbLabel: string;
  previousLabel: string;
  timerLabel: string;
  start: string;
  split: string;
  undo: string;
  skip: string;
  pause: string;
  resume: string;
  reset: string;
  phaseIdle: string;
  phaseRunning: string;
  phasePaused: string;
  phaseFinished: string;
  editorTitle: string;
  editorLocked: string;
  editorHint: string;
  addSplit: string;
  splitName: string;
  moveUp: string;
  moveDown: string;
  deleteSplit: string;
  newSplitName: string;
  newGame: string;
  newCategory: string;
  exportJson: string;
  importJson: string;
  importOk: string;
  colSplit: string;
  colSegment: string;
  colTime: string;
  colDelta: string;
  gold: string;
  ahead: string;
  behind: string;
  even: string;
  skipped: string;
  noComparison: string;
  emptyTime: string;
  liveLabel: string;
  confirmGold: string;
  confirmMid: string;
  confirmPb: string;
  confirmYes: string;
  confirmNo: string;
  savePbTitle: string;
  savePbBody: string;
  savePbYes: string;
  savePbNo: string;
  noSplits: string;
  storageFailed: string;
  tableCaption: string;
  importIssues: Record<Exclude<StoreIssue, "blocked">, string>;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
  announceStart: string;
  announceSplit: string;
  announceSkip: string;
  announceUndo: string;
  announceFinish: string;
  announceFinishPb: string;
  announcePause: string;
  announceResume: string;
  announceReset: string;
  announceSave: string;
  segmentLive: string;
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "Speedrun-Timer",
  metaDescription:
    "Speedrun-Timer mit Splits, Bestzeit und goldenen Abschnitten. Die Zeit bleibt in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "Timer · Splits · Lokal",
  lede: "Ein Timer mit Splits, wie bei einem Speedrun. Die Zeit hängt an einem Startzeitpunkt, Gold markiert den besten Abschnitt, und die Bestzeit bleibt in diesem Browser.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine sensiblen Daten werden gespeichert. Profile und Zeiten bleiben in diesem Browser.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird hier nichts. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend neben der Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  storageNote:
    "Profile, Bestzeiten, goldene Abschnitte und Versuche bleiben in diesem Browser unter dem Schlüssel consolecheat-speedrun-v1. Der laufende Versuch wird nicht gespeichert.",
  backgroundNote:
    "Die Zeit ist der Abstand zum Start, nicht eine Summe von Takten. Ein Tab im Hintergrund zählt weiter. Beim Zurückkommen wird nur neu gezeichnet.",
  controlsHeading: "Steuerung",
  controls:
    "Leertaste startet oder setzt einen Split. Rücktaste oder U macht den Split rückgängig. S überspringt. R setzt zurück, mit Nachfrage mitten im Lauf oder wenn Gold verloren ginge. P pausiert. Am Controller: × Start/Split, □ rückgängig, ○ überspringen, Options zurücksetzen. In einem Feld gilt die Leertaste als Zeichen.",
  profileLabel: "Lauf",
  gameLabel: "Spiel",
  categoryLabel: "Kategorie",
  newProfile: "Neuer Lauf",
  deleteProfile: "Lauf löschen",
  attemptsLabel: "Versuche",
  sobLabel: "Sum of Best",
  bptLabel: "Bestmögliche Zeit",
  pbLabel: "Bestzeit",
  previousLabel: "Letzter Abschnitt",
  timerLabel: "Zeit",
  start: "Start",
  split: "Split",
  undo: "Rückgängig",
  skip: "Überspringen",
  pause: "Pause",
  resume: "Weiter",
  reset: "Zurücksetzen",
  phaseIdle: "Bereit",
  phaseRunning: "Läuft",
  phasePaused: "Pause",
  phaseFinished: "Fertig",
  editorTitle: "Splits",
  editorLocked: "Gerade gesperrt. Der Timer muss stehen, und eine offene Bestzeit muss zuerst gespeichert oder verworfen werden.",
  editorHint: "Reihenfolge, neue oder gelöschte Splits setzen die Bestzeit zurück. Gold bleibt am Split.",
  addSplit: "Split hinzufügen",
  splitName: "Name des Splits",
  moveUp: "Nach oben",
  moveDown: "Nach unten",
  deleteSplit: "Split löschen",
  newSplitName: "Neuer Split",
  newGame: "Neues Spiel",
  newCategory: "Any%",
  exportJson: "JSON exportieren",
  importJson: "JSON importieren",
  importOk: "Die Datei ist geladen.",
  colSplit: "Split",
  colSegment: "Abschnitt",
  colTime: "Zeit",
  colDelta: "Delta",
  gold: "Gold",
  ahead: "voraus",
  behind: "zurück",
  even: "gleich",
  skipped: "Übersprungen",
  noComparison: "Keine Bestzeit",
  emptyTime: "—",
  liveLabel: "Letztes Ergebnis",
  confirmGold:
    "Diesen Lauf zurücksetzen? Er läuft noch, und mindestens ein Abschnitt wäre Gold. Gold wird erst am Ende gespeichert.",
  confirmMid: "Diesen Lauf zurücksetzen? Er ist noch nicht zu Ende.",
  confirmPb: "Zurücksetzen, ohne die schnellere Zeit als Bestzeit zu speichern?",
  confirmYes: "Zurücksetzen",
  confirmNo: "Weiterlaufen",
  savePbTitle: "Neue Bestzeit",
  savePbBody: "Dieser Lauf ist schneller als die Bestzeit. Als neue Bestzeit speichern?",
  savePbYes: "Bestzeit speichern",
  savePbNo: "Nicht speichern",
  noSplits: "Mindestens ein Split, dann kann der Lauf starten.",
  storageFailed: "Speichern ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  tableCaption: "Splits dieses Laufs",
  importIssues: {
    "broken-json": "Die Datei ist kein gültiges JSON. Die gespeicherten Läufe bleiben.",
    "wrong-schema": "Das ist keine Datei des Speedrun-Timers. Die gespeicherten Läufe bleiben.",
    "wrong-version": "Die Datei hat eine andere Version. Die gespeicherten Läufe bleiben.",
    invalid: "Die Datei passt nicht zum Schema. Die gespeicherten Läufe bleiben.",
    oversized: "Die Datei ist größer als 256 KB. Die gespeicherten Läufe bleiben.",
  },
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk:
    "Wirklich die lokalen Daten dieser Seite löschen? Profile und Zeiten (consolecheat-speedrun-v1), die Sprache und das Erscheinungsbild. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  announceStart: "Lauf gestartet.",
  announceSplit: "{name}, {time}, {delta}.",
  announceSkip: "{name} übersprungen.",
  announceUndo: "Letzter Split rückgängig.",
  announceFinish: "Lauf beendet, {time}.",
  announceFinishPb: "Lauf beendet, {time}. Schneller als die Bestzeit.",
  announcePause: "Pause.",
  announceResume: "Weiter.",
  announceReset: "Zurückgesetzt.",
  announceSave: "Bestzeit gespeichert.",
  segmentLive: "läuft",
});

const en = pack({
  title: "Speedrun timer",
  metaDescription:
    "Speedrun timer with splits, a personal best, and gold segments. Times stay in this browser. Unofficial, not Sony.",
  eyebrow: "Timer · Splits · Local",
  lede: "A timer with splits, the way a speedrun uses one. Time is anchored to a start timestamp, gold marks a best segment, and the personal best stays in this browser.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "No sensitive data is stored. Profiles and times stay in this browser.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid for here. This page is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool is its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  storageNote:
    "Profiles, personal bests, gold segments, and attempts stay in this browser under the key consolecheat-speedrun-v1. The live attempt is not stored.",
  backgroundNote:
    "Time is the distance from the start, not a sum of ticks. A background tab keeps counting. Coming back only redraws.",
  controlsHeading: "Controls",
  controls:
    "Space starts or splits. Backspace or U undoes a split. S skips. R resets, and asks first mid-run or when a gold would be lost. P pauses. On a controller: × start/split, □ undo, ○ skip, Options reset. Space types a character while a field is focused.",
  profileLabel: "Run",
  gameLabel: "Game",
  categoryLabel: "Category",
  newProfile: "New run",
  deleteProfile: "Delete run",
  attemptsLabel: "Attempts",
  sobLabel: "Sum of Best",
  bptLabel: "Best possible time",
  pbLabel: "Personal best",
  previousLabel: "Previous segment",
  timerLabel: "Time",
  start: "Start",
  split: "Split",
  undo: "Undo",
  skip: "Skip",
  pause: "Pause",
  resume: "Resume",
  reset: "Reset",
  phaseIdle: "Ready",
  phaseRunning: "Running",
  phasePaused: "Paused",
  phaseFinished: "Finished",
  editorTitle: "Splits",
  editorLocked: "Locked for now. The timer has to be stopped, and an open personal best has to be saved or dismissed first.",
  editorHint: "Reordering, adding, or deleting splits clears the personal best. Gold stays on the split.",
  addSplit: "Add split",
  splitName: "Split name",
  moveUp: "Move up",
  moveDown: "Move down",
  deleteSplit: "Delete split",
  newSplitName: "New split",
  newGame: "New game",
  newCategory: "Any%",
  exportJson: "Export JSON",
  importJson: "Import JSON",
  importOk: "The file is loaded.",
  colSplit: "Split",
  colSegment: "Segment",
  colTime: "Time",
  colDelta: "Delta",
  gold: "Gold",
  ahead: "ahead",
  behind: "behind",
  even: "even",
  skipped: "Skipped",
  noComparison: "No personal best",
  emptyTime: "—",
  liveLabel: "Latest result",
  confirmGold: "Reset this run? It is still going, and at least one segment would be gold. Gold is saved when the run finishes.",
  confirmMid: "Reset this run? It has not finished.",
  confirmPb: "Reset without saving the faster time as the personal best?",
  confirmYes: "Reset",
  confirmNo: "Keep going",
  savePbTitle: "New personal best",
  savePbBody: "This run is faster than the personal best. Save it as the new personal best?",
  savePbYes: "Save personal best",
  savePbNo: "Don't save",
  noSplits: "Add at least one split before the run can start.",
  storageFailed: "Could not save. The browser blocked storage.",
  tableCaption: "Splits in this run",
  importIssues: {
    "broken-json": "That file is not valid JSON. The saved runs stay as they are.",
    "wrong-schema": "That is not a speedrun timer file. The saved runs stay as they are.",
    "wrong-version": "That file uses a different version. The saved runs stay as they are.",
    invalid: "That file does not match the schema. The saved runs stay as they are.",
    oversized: "That file is larger than 256 KB. The saved runs stay as they are.",
  },
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete this page’s local data? Profiles and times (consolecheat-speedrun-v1), the language, and the appearance. The backlog and the screen-test pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "This page’s local data has been deleted. The backlog and the screen-test pattern stay.",
  deleteFailed: "Could not delete. The browser blocked storage.",
  announceStart: "Run started.",
  announceSplit: "{name}, {time}, {delta}.",
  announceSkip: "{name} skipped.",
  announceUndo: "Last split undone.",
  announceFinish: "Run finished, {time}.",
  announceFinishPb: "Run finished, {time}. Faster than the personal best.",
  announcePause: "Paused.",
  announceResume: "Resumed.",
  announceReset: "Reset.",
  announceSave: "Personal best saved.",
  segmentLive: "live",
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
