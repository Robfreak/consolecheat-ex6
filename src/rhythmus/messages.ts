import type { SongId } from "./songs.ts";

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
  related: string;
  controller: string;
  songsHeading: string;
  nameNachtmarkt: string;
  nameNeonbahn: string;
  nameHafenlicht: string;
  blurbNachtmarkt: string;
  blurbNeonbahn: string;
  blurbHafenlicht: string;
  difficultyLabel: string;
  leicht: string;
  mittel: string;
  schwer: string;
  notesLine: string;
  bpmLine: string;
  bestTitle: string;
  bestEmpty: string;
  bestLine: string;
  resetScores: string;
  resetDone: string;
  resetFailed: string;
  saveFailed: string;
  offsetLabel: string;
  offsetHint: string;
  calibrate: string;
  calibrateHint: string;
  calibrateTap: string;
  calibrateCount: string;
  calibrateDone: string;
  calibrateFailed: string;
  calibrateCancel: string;
  mappingTitle: string;
  mappingHint: string;
  laneFace: string;
  laneKeys: string;
  laneArrows: string;
  lanePad: string;
  start: string;
  pause: string;
  resume: string;
  abort: string;
  back: string;
  scoreLabel: string;
  accuracyLabel: string;
  comboLabel: string;
  maxComboLabel: string;
  perfect: string;
  good: string;
  miss: string;
  resultTitle: string;
  resultSummary: string;
  newBest: string;
  again: string;
  otherSong: string;
  pausedTitle: string;
  resumed: string;
  storageNote: string;
  rulesTitle: string;
  ruleLanes: string;
  ruleTiming: string;
  ruleScore: string;
  ruleAudio: string;
  rulePause: string;
  timeLabel: string;
  audioFailed: string;
  playLabel: string;
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
  title: "Controller-Rhythmus",
  metaDescription:
    "Controller-Rhythmus: vier Spuren, lokale Musik, Perfect, Gut und Verpasst. Bleibt in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "Rhythmus · lokal",
  lede: "Noten fallen auf vier Spuren. Triff sie im Takt. Musik und Chart entstehen in diesem Browser, erst nach einem Klick.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Bestleistungen und der Versatz bleiben nur in diesem Browser. Es wird nichts hochgeladen.",
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
  songsHeading: "Stück",
  nameNachtmarkt: "Nachtmarkt",
  nameNeonbahn: "Neonbahn",
  nameHafenlicht: "Hafenlicht",
  blurbNachtmarkt: "Ruhiger Bass, Marktlicht.",
  blurbNeonbahn: "Schneller, mit einem Kick auf jedem Schlag.",
  blurbHafenlicht: "Langsamer, mit mehr Luft zwischen den Noten.",
  difficultyLabel: "Schwierigkeit",
  leicht: "Leicht",
  mittel: "Mittel",
  schwer: "Schwer",
  notesLine: "{n} Noten",
  bpmLine: "{bpm} BPM · {time}",
  bestTitle: "Bestleistung",
  bestEmpty: "Noch keine Bestleistung für diese Kombination.",
  bestLine: "{score} Punkte · {accuracy} % · Combo {combo}",
  resetScores: "Bestleistungen zurücksetzen",
  resetDone: "Die Bestleistungen und der Versatz sind gelöscht.",
  resetFailed: "Zurücksetzen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  saveFailed: "Speichern ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  offsetLabel: "Versatz",
  offsetHint:
    "Positiv, wenn du zu spät tippst. Der Versatz verschiebt die Wertung, nicht die Musik. Er liegt mit den Bestleistungen unter consolecheat-rhythmus-v1.",
  calibrate: "Takt antippen",
  calibrateHint: "Acht Schläge. Tippe die Fläche oder D, F, J, K, die Pfeiltasten oder die Leertaste im Takt.",
  calibrateTap: "Tippen",
  calibrateCount: "{n} von {total}",
  calibrateDone: "Versatz {offset} ms gespeichert.",
  calibrateFailed: "Zu wenige Treffer im Takt. Der Versatz bleibt, wie er war.",
  calibrateCancel: "Abbrechen",
  mappingTitle: "Belegung",
  mappingHint:
    "Vier Spuren von links nach rechts: △ ○ × □. Die Tasten D F J K treffen die Spuren in dieser Reihenfolge. Die Pfeiltasten und das Steuerkreuz folgen der Richtung der Taste: △ hoch, ○ rechts, × runter, □ links.",
  laneFace: "Taste",
  laneKeys: "Taste",
  laneArrows: "Pfeil",
  lanePad: "Controller",
  start: "Start",
  pause: "Pause",
  resume: "Weiter",
  abort: "Beenden",
  back: "Zurück",
  scoreLabel: "Punkte",
  accuracyLabel: "Genauigkeit",
  comboLabel: "Combo",
  maxComboLabel: "Beste Combo",
  perfect: "Perfect",
  good: "Gut",
  miss: "Verpasst",
  resultTitle: "Ergebnis",
  resultSummary: "{perfect} Perfect · {good} Gut · {miss} Verpasst",
  newBest: "Neue Bestleistung.",
  again: "Nochmal",
  otherSong: "Anderes Stück",
  pausedTitle: "Pause",
  resumed: "Es geht weiter.",
  storageNote:
    "Bestleistungen und Versatz bleiben in diesem Browser unter dem Schlüssel consolecheat-rhythmus-v1. Zurücksetzen löscht nur diesen Schlüssel. Sprache und Erscheinungsbild liegen unter consolecheat-lang und consolecheat-theme.",
  rulesTitle: "So wird gespielt",
  ruleLanes: "Vier Spuren, von links nach rechts △ ○ × □. D F J K, oder die Pfeile hoch, rechts, runter, links. Am Controller dieselben Tasten, oder das Steuerkreuz.",
  ruleTiming: "Perfect bis ±45 ms, Gut bis ±100 ms. Danach ist die Note verpasst. Der Versatz wird vor der Wertung abgezogen.",
  ruleScore:
    "Perfect gibt 300 Punkte, Gut 100. Jede Note, die schon in der Combo liegt, legt bei Perfect 10 und bei Gut 5 Punkte dazu. Verpasst setzt die Combo auf null.",
  ruleAudio: "Schlagzeug, Bass und Melodie kommen aus dem Browser. Es wird keine Audiodatei geladen. Der Ton startet erst nach Start oder Takt antippen.",
  rulePause: "Esc oder Pause hält an. Esc oder Weiter spielt weiter. Beenden speichert kein Ergebnis.",
  timeLabel: "Spielzeit",
  audioFailed: "Der Ton konnte nicht starten. Der Browser hat ihn blockiert.",
  playLabel: "Spurfeld",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk:
    "Wirklich die lokalen Daten dieser Seite löschen? Bestleistungen und Versatz (consolecheat-rhythmus-v1), die Sprache und das Erscheinungsbild. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
});

const en = pack({
  title: "Controller rhythm",
  metaDescription:
    "Controller rhythm: four lanes, local music, Perfect, Good, and Miss. Stays in this browser. Unofficial, not Sony.",
  eyebrow: "Rhythm · local",
  lede: "Notes fall on four lanes. Hit them on the beat. The music and the chart are made in this browser, and only after a click.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "High scores and the offset stay in this browser only. Nothing is uploaded.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing on this page is paid. This page is not Sony.",
  temporary: "Temporarily hosted with the game backlog, until this game is its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  related: "Related",
  controller: "Controller tester",
  songsHeading: "Song",
  nameNachtmarkt: "Night Market",
  nameNeonbahn: "Neon Line",
  nameHafenlicht: "Harbour Light",
  blurbNachtmarkt: "Quiet bass, market lights.",
  blurbNeonbahn: "Faster, with a kick on every beat.",
  blurbHafenlicht: "Slower, with more space between the notes.",
  difficultyLabel: "Difficulty",
  leicht: "Easy",
  mittel: "Medium",
  schwer: "Hard",
  notesLine: "{n} notes",
  bpmLine: "{bpm} BPM · {time}",
  bestTitle: "Best score",
  bestEmpty: "No best score for this pair yet.",
  bestLine: "{score} points · {accuracy} % · combo {combo}",
  resetScores: "Reset best scores",
  resetDone: "The best scores and the offset are deleted.",
  resetFailed: "Reset failed. The browser blocked storage.",
  saveFailed: "Saving failed. The browser blocked storage.",
  offsetLabel: "Offset",
  offsetHint:
    "Positive if you tap late. The offset shifts the judgement, not the music. It is stored with the best scores under consolecheat-rhythmus-v1.",
  calibrate: "Tap the beat",
  calibrateHint: "Eight beats. Tap the pad, or use D, F, J, K, the arrow keys, or the space bar on the beat.",
  calibrateTap: "Tap",
  calibrateCount: "{n} of {total}",
  calibrateDone: "Offset {offset} ms saved.",
  calibrateFailed: "Not enough taps on the beat. The offset stays as it was.",
  calibrateCancel: "Cancel",
  mappingTitle: "Mapping",
  mappingHint:
    "Four lanes from left to right: △ ○ × □. The keys D F J K hit the lanes in that order. The arrow keys and the D-pad follow the button direction: △ up, ○ right, × down, □ left.",
  laneFace: "Button",
  laneKeys: "Key",
  laneArrows: "Arrow",
  lanePad: "Controller",
  start: "Start",
  pause: "Pause",
  resume: "Resume",
  abort: "End",
  back: "Back",
  scoreLabel: "Score",
  accuracyLabel: "Accuracy",
  comboLabel: "Combo",
  maxComboLabel: "Best combo",
  perfect: "Perfect",
  good: "Good",
  miss: "Miss",
  resultTitle: "Result",
  resultSummary: "{perfect} perfect · {good} good · {miss} miss",
  newBest: "New best score.",
  again: "Again",
  otherSong: "Another song",
  pausedTitle: "Paused",
  resumed: "Back in.",
  storageNote:
    "Best scores and the offset stay in this browser under the key consolecheat-rhythmus-v1. Reset removes only that key. Language and appearance use consolecheat-lang and consolecheat-theme.",
  rulesTitle: "How to play",
  ruleLanes:
    "Four lanes, left to right △ ○ × □. D F J K, or the arrows up, right, down, left. On a controller, the same buttons, or the D-pad.",
  ruleTiming: "Perfect within ±45 ms, Good within ±100 ms. After that the note is a miss. The offset is applied before the judgement.",
  ruleScore:
    "Perfect is 300 points, Good is 100. Each note already in the combo adds 10 points on Perfect and 5 on Good. A miss sets the combo back to zero.",
  ruleAudio:
    "Drums, bass, and the lead come from the browser. No audio file is loaded. Sound starts only after Start or Tap the beat.",
  rulePause: "Esc or Pause holds. Esc or Resume continues. End does not store a result.",
  timeLabel: "Song time",
  audioFailed: "Sound could not start. The browser blocked it.",
  playLabel: "Lane field",
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete the local data of this page? Best scores and offset (consolecheat-rhythmus-v1), the language, and the appearance. The backlog and the screen-test pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "The local data of this page is deleted. The backlog and the screen-test pattern stay.",
  deleteFailed: "Deleting failed. The browser blocked storage.",
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

export function songText(text: Copy, id: SongId): { name: string; blurb: string } {
  if (id === "nachtmarkt") return { name: text.nameNachtmarkt, blurb: text.blurbNachtmarkt };
  if (id === "neonbahn") return { name: text.nameNeonbahn, blurb: text.blurbNeonbahn };
  return { name: text.nameHafenlicht, blurb: text.blurbHafenlicht };
}

export function difficultyLabel(text: Copy, id: "leicht" | "mittel" | "schwer"): string {
  return text[id];
}
