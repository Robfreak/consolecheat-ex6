import type { Direction, FaceButton } from "./types.ts";

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
  storageFailed: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
  listHeading: string;
  builtinGroup: string;
  customGroup: string;
  emptyCustoms: string;
  newCombo: string;
  edit: string;
  remove: string;
  windowLabel: string;
  layoutLabel: string;
  layoutJkli: string;
  layoutUijk: string;
  legendHeading: string;
  legendDirections: string;
  legendJkli: string;
  legendUijk: string;
  legendTyping: string;
  legendPad: string;
  historyHeading: string;
  historyEmpty: string;
  resultIdle: string;
  resultLive: string;
  resultSuccess: string;
  resultLate: string;
  resultWrongDirection: string;
  resultWrongButton: string;
  onTime: string;
  tooLate: string;
  totalFrames: string;
  hitRate: string;
  attempts: string;
  streak: string;
  bestHeading: string;
  bestStreak: string;
  bestHitRate: string;
  bestFrames: string;
  noBest: string;
  padHeading: string;
  faceHeading: string;
  gamepadOn: string;
  gamepadOff: string;
  editorNew: string;
  editorEdit: string;
  nameLabel: string;
  namePlaceholder: string;
  windowOverride: string;
  windowOverrideHint: string;
  stepsHeading: string;
  noSteps: string;
  addStep: string;
  removeStep: string;
  moveUp: string;
  moveDown: string;
  recordStart: string;
  recordStop: string;
  recording: string;
  saveCombo: string;
  cancel: string;
  needName: string;
  needSteps: string;
  badWindow: string;
  full: string;
  savedCombo: string;
  builtinNote: string;
  controls: string;
  stepProgress: string;
  gapFrames: string;
  startGap: string;
  dirDownLeft: string;
  dirDown: string;
  dirDownRight: string;
  dirLeft: string;
  dirRight: string;
  dirUpLeft: string;
  dirUp: string;
  dirUpRight: string;
  clearDirection: string;
  clearButton: string;
  btnSquare: string;
  btnTriangle: string;
  btnCross: string;
  btnCircle: string;
  notationLabel: string;
  confirmRemove: string;
  removeTitle: string;
  names: {
    hadouken: string;
    shoryuken: string;
    tatsu: string;
    halfcircle: string;
    doubleqcf: string;
    spin: string;
    chain: string;
  };
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "Combo-Trainer",
  metaDescription:
    "Combo-Trainer: Hadouken, Shoryuken und eigene Combos im Browser üben. Frames bei 60 Bildern pro Sekunde. Bestwerte bleiben in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "TRAININGS-MODUS",
  lede: "Richtung und Taste im Fenster. Die Lücke steht in Frames bei 60 Bildern pro Sekunde. Nichts wird hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine sensiblen Daten werden gespeichert. Bestwerte und eigene Combos bleiben in diesem Browser.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend hier, bis der Combo-Trainer ein eigenes Projekt ist.",
  themeDark: "Dunkles Erscheinungsbild",
  themeLight: "Helles Erscheinungsbild",
  language: "Sprache",
  footerNav: "Seitenfuß",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  storageNote: "Bestwerte und eigene Combos bleiben in diesem Browser unter dem Schlüssel consolecheat-combo-v1.",
  storageFailed: "Der Browser hat die Werte nicht gespeichert. Die Seite läuft bis zum Neuladen weiter.",
  deleteAll: "Gespeicherte Combos und Bestwerte löschen",
  deleteAsk: "Wirklich löschen? Nur der Schlüssel consolecheat-combo-v1. Sprache und Erscheinungsbild bleiben.",
  deleteYes: "Löschen",
  deleteNo: "Behalten",
  deleted: "Der Schlüssel consolecheat-combo-v1 ist gelöscht.",
  deleteFailed: "Die Daten konnten nicht gelöscht werden.",
  listHeading: "Combos",
  builtinGroup: "Fest",
  customGroup: "Eigene",
  emptyCustoms: "Noch kein eigenes Combo.",
  newCombo: "Eigenes Combo",
  edit: "Bearbeiten",
  remove: "Löschen",
  windowLabel: "Fenster",
  layoutLabel: "Tasten",
  layoutJkli: "J K L I",
  layoutUijk: "U I J K",
  legendHeading: "Belegung",
  legendDirections: "Richtung: W A S D oder die Pfeiltasten. Zwei Tasten zugleich sind die Diagonale.",
  legendJkli: "J Quadrat, K Dreieck, L Kreuz, I Kreis.",
  legendUijk: "U Quadrat, I Dreieck, J Kreuz, K Kreis.",
  legendTyping: "In einem Textfeld gelten die Tasten für den Text.",
  legendPad: "Controller: Steuerkreuz und linker Stick, □ Taste 2, △ Taste 3, ○ Taste 1, × Taste 0.",
  historyHeading: "Eingaben",
  historyEmpty: "Noch keine Eingabe.",
  resultIdle: "Warte auf die erste Eingabe.",
  resultLive: "Schritt {step} von {total}.",
  resultSuccess: "Getroffen. {frames} Frames.",
  resultLate: "Zu spät. {frames} Frames, Fenster {window}.",
  resultWrongDirection: "Falsche Richtung. Combo abgebrochen.",
  resultWrongButton: "Falsche Taste. Combo abgebrochen.",
  onTime: "Rechtzeitig",
  tooLate: "Zu spät",
  totalFrames: "Summe {frames} Frames",
  hitRate: "Trefferquote",
  attempts: "Versuche",
  streak: "Serie",
  bestHeading: "Bestwerte",
  bestStreak: "Beste Serie",
  bestHitRate: "Beste Quote",
  bestFrames: "Schnellste Frames",
  noBest: "Noch keiner",
  padHeading: "Richtung",
  faceHeading: "Tasten",
  gamepadOn: "Controller verbunden: {name}",
  gamepadOff: "Kein Controller. Tastatur oder die Tasten hier.",
  editorNew: "Eigenes Combo",
  editorEdit: "Combo bearbeiten",
  nameLabel: "Name",
  namePlaceholder: "Sofa-Combo",
  windowOverride: "Eigenes Fenster",
  windowOverrideHint: "Leer übernimmt das Fenster oben. 4 bis 30 Frames.",
  stepsHeading: "Schritte",
  noSteps: "Noch kein Schritt.",
  addStep: "Schritt hinzufügen",
  removeStep: "Schritt entfernen",
  moveUp: "Nach oben",
  moveDown: "Nach unten",
  recordStart: "Aufnehmen",
  recordStop: "Aufnahme stoppen",
  recording: "Aufnahme läuft. Eingaben werden Schritte.",
  saveCombo: "Speichern",
  cancel: "Abbrechen",
  needName: "Der Name fehlt.",
  needSteps: "Mindestens ein Schritt.",
  badWindow: "Das Fenster liegt zwischen 4 und 30.",
  full: "Es sind schon 30 eigene Combos gespeichert.",
  savedCombo: "Gespeichert.",
  builtinNote: "Feste Combos bleiben. Löschen und Bearbeiten geht nur bei eigenen.",
  controls:
    "W A S D oder die Pfeiltasten, diagonal mit zwei Tasten. J K L I ist □ △ × ○, umschaltbar auf U I J K. Am Controller zählen Steuerkreuz, linker Stick und die vier Tasten. Ein Textfeld schluckt die Tasten nicht fürs Combo.",
  stepProgress: "Schritt {step} von {total}",
  gapFrames: "{frames}f",
  startGap: "Start",
  dirDownLeft: "Runter-links",
  dirDown: "Runter",
  dirDownRight: "Runter-rechts",
  dirLeft: "Links",
  dirRight: "Rechts",
  dirUpLeft: "Hoch-links",
  dirUp: "Hoch",
  dirUpRight: "Hoch-rechts",
  clearDirection: "Keine Richtung",
  clearButton: "Keine Taste",
  btnSquare: "Quadrat",
  btnTriangle: "Dreieck",
  btnCross: "Kreuz",
  btnCircle: "Kreis",
  notationLabel: "Combo-Anzeige",
  confirmRemove: "Dieses Combo löschen? Seine Bestwerte verschwinden mit. Feste Combos bleiben.",
  removeTitle: "Combo löschen",
  names: {
    hadouken: "Hadouken",
    shoryuken: "Shoryuken",
    tatsu: "Tatsu",
    halfcircle: "Halbkreis",
    doubleqcf: "Doppel-QCF",
    spin: "360",
    chain: "Tastenfolge",
  },
});

const en = pack({
  title: "Combo trainer",
  metaDescription:
    "Combo trainer: practice Hadouken, Shoryuken, and your own combos in the browser. Frames at 60 per second. Best values stay in this browser. Unofficial, not Sony.",
  eyebrow: "TRAINING MODE",
  lede: "Direction and button inside the window. The gap is in frames at 60 per second. Nothing is uploaded.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "No sensitive data is stored. Best values and custom combos stay in this browser.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing here is paid. This page is not Sony.",
  temporary: "Temporarily here, until the combo trainer has its own project.",
  themeDark: "Dark appearance",
  themeLight: "Light appearance",
  language: "Language",
  footerNav: "Footer",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  storageNote: "Best values and custom combos stay in this browser under the key consolecheat-combo-v1.",
  storageFailed: "The browser did not store the values. The page keeps working until reload.",
  deleteAll: "Delete saved combos and best values",
  deleteAsk: "Really delete them? Only the key consolecheat-combo-v1. Language and appearance stay.",
  deleteYes: "Delete",
  deleteNo: "Keep",
  deleted: "The key consolecheat-combo-v1 is deleted.",
  deleteFailed: "The data could not be deleted.",
  listHeading: "Combos",
  builtinGroup: "Built-in",
  customGroup: "Custom",
  emptyCustoms: "No custom combo yet.",
  newCombo: "Custom combo",
  edit: "Edit",
  remove: "Delete",
  windowLabel: "Window",
  layoutLabel: "Buttons",
  layoutJkli: "J K L I",
  layoutUijk: "U I J K",
  legendHeading: "Legend",
  legendDirections: "Direction: W A S D or the arrow keys. Two keys at once are the diagonal.",
  legendJkli: "J square, K triangle, L cross, I circle.",
  legendUijk: "U square, I triangle, J cross, K circle.",
  legendTyping: "While a text field is focused, the keys type.",
  legendPad: "Controller: D-pad and left stick, □ button 2, △ button 3, ○ button 1, × button 0.",
  historyHeading: "Inputs",
  historyEmpty: "No input yet.",
  resultIdle: "Waiting for the first input.",
  resultLive: "Step {step} of {total}.",
  resultSuccess: "Clean. {frames} frames.",
  resultLate: "Late. {frames} frames, window {window}.",
  resultWrongDirection: "Wrong direction. Combo aborted.",
  resultWrongButton: "Wrong button. Combo aborted.",
  onTime: "On time",
  tooLate: "Late",
  totalFrames: "Total {frames} frames",
  hitRate: "Hit rate",
  attempts: "Attempts",
  streak: "Streak",
  bestHeading: "Best values",
  bestStreak: "Best streak",
  bestHitRate: "Best hit rate",
  bestFrames: "Fastest frames",
  noBest: "None yet",
  padHeading: "Direction",
  faceHeading: "Buttons",
  gamepadOn: "Controller connected: {name}",
  gamepadOff: "No controller. Keyboard, or the buttons here.",
  editorNew: "Custom combo",
  editorEdit: "Edit combo",
  nameLabel: "Name",
  namePlaceholder: "Sofa combo",
  windowOverride: "Own window",
  windowOverrideHint: "Empty uses the window above. 4 to 30 frames.",
  stepsHeading: "Steps",
  noSteps: "No step yet.",
  addStep: "Add step",
  removeStep: "Remove step",
  moveUp: "Move up",
  moveDown: "Move down",
  recordStart: "Record",
  recordStop: "Stop recording",
  recording: "Recording. Inputs become steps.",
  saveCombo: "Save",
  cancel: "Cancel",
  needName: "The name is missing.",
  needSteps: "At least one step.",
  badWindow: "The window is from 4 to 30.",
  full: "30 custom combos are already saved.",
  savedCombo: "Saved.",
  builtinNote: "Built-in combos stay. Edit and delete are only for custom ones.",
  controls:
    "W A S D or the arrow keys, diagonals by holding two. J K L I is □ △ × ○, switchable to U I J K. On a controller the D-pad, the left stick, and the four face buttons count. A text field keeps the keys for typing.",
  stepProgress: "Step {step} of {total}",
  gapFrames: "{frames}f",
  startGap: "Start",
  dirDownLeft: "Down-left",
  dirDown: "Down",
  dirDownRight: "Down-right",
  dirLeft: "Left",
  dirRight: "Right",
  dirUpLeft: "Up-left",
  dirUp: "Up",
  dirUpRight: "Up-right",
  clearDirection: "No direction",
  clearButton: "No button",
  btnSquare: "Square",
  btnTriangle: "Triangle",
  btnCross: "Cross",
  btnCircle: "Circle",
  notationLabel: "Combo display",
  confirmRemove: "Delete this combo? Its best values go with it. Built-in combos stay.",
  removeTitle: "Delete combo",
  names: {
    hadouken: "Hadouken",
    shoryuken: "Shoryuken",
    tatsu: "Tatsu",
    halfcircle: "Half-circle",
    doubleqcf: "Double QCF",
    spin: "360",
    chain: "Button chain",
  },
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

const directionKeys = {
  1: "dirDownLeft",
  2: "dirDown",
  3: "dirDownRight",
  4: "dirLeft",
  6: "dirRight",
  7: "dirUpLeft",
  8: "dirUp",
  9: "dirUpRight",
} as const;

export function directionLabel(text: Copy, direction: Direction): string {
  return text[directionKeys[direction]];
}

export function buttonLabel(text: Copy, button: FaceButton): string {
  if (button === "square") return text.btnSquare;
  if (button === "triangle") return text.btnTriangle;
  if (button === "cross") return text.btnCross;
  return text.btnCircle;
}

export function comboTitle(text: Copy, id: string, customName?: string): string {
  if (id in text.names) return text.names[id as keyof Copy["names"]];
  return customName && customName.length > 0 ? customName : id;
}

export function formatRate(rate: number, lang: Lang): string {
  const rounded = Math.round(rate * 10) / 10;
  const digits = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  const shown = lang === "de" ? digits.replace(".", ",") : digits;
  return lang === "de" ? `${shown} %` : `${shown}%`;
}

export function stepPhrase(text: Copy, direction: Direction | null, button: FaceButton | null): string {
  const parts = [direction ? directionLabel(text, direction) : "", button ? buttonLabel(text, button) : ""].filter(Boolean);
  return parts.join(" + ");
}
