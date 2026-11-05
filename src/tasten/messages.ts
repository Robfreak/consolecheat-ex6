import type { ControlId, LayoutId } from "./layout.ts";

export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

export type ControlCopy = { name: string; detail: string };

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
  testerHeading: string;
  testerBody: string;
  testerLink: string;
  section: string;
  layoutLabel: string;
  diagramLabel: string;
  diagramHint: string;
  symbolNote: string;
  listHeading: string;
  differencesHeading: string;
  layouts: Record<LayoutId, { name: string; platform: string }>;
  controls: Record<ControlId, ControlCopy>;
  differences: { title: string; body: string }[];
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
  title: "Tastenbelegung",
  metaDescription:
    "Tastenbelegung für DualShock 4 und DualSense. Läuft lokal im Browser, ohne einen Controller auszulesen. Inoffiziell, nicht von Sony.",
  eyebrow: "DualShock 4 · DualSense",
  lede: "Wo die Tasten am DualShock 4 und am DualSense sitzen, auf Deutsch und Englisch. Die Symbole auf den Tasten sind überall gleich. Diese Seite liest keinen Controller aus.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine personenbezogenen Daten. Die gewählte Belegung wird nicht gespeichert.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  testerHeading: "Controller prüfen",
  testerBody:
    "Der Controller-Tester ist ein Geschwister-Werkzeug (consolecheat-ex3). Er liest die Tasten live über die Gamepad-API. Diese Seite zeigt nur die Belegung und liest keinen Controller.",
  testerLink: "Zum Controller-Tester",
  section: "Belegung",
  layoutLabel: "Controller",
  diagramLabel: "Tasten auf dem Controller",
  diagramHint: "Die Zeichnung folgt der Lage der Tasten. Ein Eintrag springt zur Beschreibung in der Liste.",
  symbolNote:
    "Die aufgedruckten Symbole sind überall gleich: × ○ □ △. Deutsch: Kreuz, Kreis, Quadrat, Dreieck. Englisch: Cross (oft X), Circle (oft O), Square, Triangle. Die Symbole ändern sich nicht mit der Region. Welche Taste bestätigt, legen das Spiel oder die Konsoleneinstellung fest: oft Kreuz in Europa und Kreis in Japan.",
  listHeading: "Alle Tasten",
  differencesHeading: "Unterschiede",
  layouts: {
    ds4: { name: "DualShock 4", platform: "PS4" },
    dualsense: { name: "DualSense", platform: "PS5" },
  },
  controls: {
    l2: { name: "L2", detail: "Linker Trigger. Analog, der Weg der Taste wird ausgelesen." },
    r2: { name: "R2", detail: "Rechter Trigger. Analog, der Weg der Taste wird ausgelesen." },
    l1: { name: "L1", detail: "Linke Schultertaste." },
    r1: { name: "R1", detail: "Rechte Schultertaste." },
    share: { name: "Share", detail: "Nur DualShock 4, links neben dem Touchpad. Bildschirmfoto, Video und Teilen." },
    create: {
      name: "Create",
      detail: "Nur DualSense, links neben dem Touchpad, an der Stelle der Share-Taste. Öffnet das Menü für Aufnahmen.",
    },
    touchpad: { name: "Touchpad", detail: "Berührungsfläche in der Mitte. Drücken zählt als eigene Taste." },
    options: { name: "Options", detail: "Öffnet das Menü des Spiels oder der Konsole, je nach Software." },
    dpad: { name: "Steuerkreuz", detail: "Richtungstasten: oben, rechts, unten, links." },
    triangle: { name: "Dreieck", detail: "Aktionstaste. Das aufgedruckte Symbol ist △." },
    square: { name: "Quadrat", detail: "Aktionstaste. Das aufgedruckte Symbol ist □." },
    circle: { name: "Kreis", detail: "Aktionstaste. Das aufgedruckte Symbol ist ○. Auf Englisch oft O genannt." },
    cross: { name: "Kreuz", detail: "Aktionstaste. Das aufgedruckte Symbol ist ×. Auf Englisch Cross, oft X genannt." },
    lstick: { name: "Linker Stick", detail: "Analogstick links. Drücken ist L3." },
    ps: { name: "PS-Taste", detail: "Öffnet das Schnellmenü der Konsole." },
    mute: { name: "Stummschalten", detail: "Nur DualSense, neben der PS-Taste. Schaltet das eingebaute Mikrofon stumm." },
    rstick: { name: "Rechter Stick", detail: "Analogstick rechts. Drücken ist R3." },
  },
  differences: [
    {
      title: "Create und Share",
      body: "DualShock 4 hat links neben dem Touchpad die Share-Taste. DualSense hat dort die Create-Taste. Share nimmt auf und teilt. Create öffnet das Aufnahmemenü.",
    },
    {
      title: "Mikrofon stumm",
      body: "DualSense hat ein eingebautes Mikrofon und eine Stummschalttaste neben der PS-Taste. DualShock 4 hat diese Taste nicht und kein eingebautes Mikrofon. Ein Headset-Mikrofon wird dort im Schnellmenü stummgeschaltet.",
    },
    {
      title: "Adaptive Trigger",
      body: "L2 und R2 am DualSense können den Widerstand ändern. Am DualShock 4 bleibt der Widerstand gleich. Beide Controller lesen den Weg der Trigger analog aus.",
    },
    {
      title: "Haptisches Feedback",
      body: "DualSense hat in den Griffen Schwingspulen. DualShock 4 hat zwei Vibrationsmotoren.",
    },
    {
      title: "Lichtleiste",
      body: "Keine Taste. Am DualShock 4 liegt sie an der Kante des Touchpads, die zum Bildschirm zeigt. Am DualSense liegt sie links und rechts am Touchpad.",
    },
  ],
  deleteAll: "Sprache und Erscheinungsbild löschen",
  deleteAsk: "Wirklich Sprache und Erscheinungsbild löschen? Die Merkliste und das letzte Testbild bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Sprache und Erscheinungsbild sind gelöscht. Die Merkliste und das letzte Testbild bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
});

const en = pack({
  title: "Button layout",
  metaDescription:
    "Button layout for DualShock 4 and DualSense. Runs locally in the browser and does not read a controller. Unofficial, not Sony.",
  eyebrow: "DualShock 4 · DualSense",
  lede: "Where the controls sit on DualShock 4 and DualSense, in German and English. The symbols on the buttons are the same everywhere. This page does not read a controller.",
  freeClaim: "Completely free. Nothing on this site costs money.",
  privacyClaim: "No personal data. The layout you pick is not stored.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid here. This site is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool has its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  testerHeading: "Check a controller",
  testerBody:
    "The controller tester is a sibling tool (consolecheat-ex3). It reads the buttons live through the Gamepad API. This page only shows the layout and does not read a controller.",
  testerLink: "Open the controller tester",
  section: "Layout",
  layoutLabel: "Controller",
  diagramLabel: "Controls on the controller",
  diagramHint: "The drawing follows where the controls sit. An entry jumps to its description in the list.",
  symbolNote:
    "The printed symbols are the same everywhere: × ○ □ △. German: Kreuz, Kreis, Quadrat, Dreieck. English: Cross (often X), Circle (often O), Square, Triangle. The symbols do not change with the region. Which button confirms depends on the game or the console setting: often Cross in Europe and Circle in Japan.",
  listHeading: "All controls",
  differencesHeading: "Differences",
  layouts: {
    ds4: { name: "DualShock 4", platform: "PS4" },
    dualsense: { name: "DualSense", platform: "PS5" },
  },
  controls: {
    l2: { name: "L2", detail: "Left trigger. Analog: the press depth is read." },
    r2: { name: "R2", detail: "Right trigger. Analog: the press depth is read." },
    l1: { name: "L1", detail: "Left shoulder button." },
    r1: { name: "R1", detail: "Right shoulder button." },
    share: { name: "Share", detail: "DualShock 4 only, left of the touchpad. Screenshot, video, and sharing." },
    create: {
      name: "Create",
      detail: "DualSense only, left of the touchpad, where Share sits on DualShock 4. Opens the capture menu.",
    },
    touchpad: { name: "Touchpad", detail: "Touch surface in the center. Pressing it is its own button." },
    options: { name: "Options", detail: "Opens the game or console menu, depending on the software." },
    dpad: { name: "D-pad", detail: "Directional buttons: up, right, down, and left." },
    triangle: { name: "Triangle", detail: "Action button. The printed symbol is △." },
    square: { name: "Square", detail: "Action button. The printed symbol is □." },
    circle: { name: "Circle", detail: "Action button. The printed symbol is ○. Often called O." },
    cross: { name: "Cross", detail: "Action button. The printed symbol is ×. Often called X." },
    lstick: { name: "Left stick", detail: "Analog stick on the left. Pressing it is L3." },
    ps: { name: "PS button", detail: "Opens the console quick menu." },
    mute: { name: "Mute", detail: "DualSense only, beside the PS button. Mutes the built-in microphone." },
    rstick: { name: "Right stick", detail: "Analog stick on the right. Pressing it is R3." },
  },
  differences: [
    {
      title: "Create and Share",
      body: "DualShock 4 has the Share button to the left of the touchpad. DualSense has the Create button there. Share captures and shares. Create opens the capture menu.",
    },
    {
      title: "Mute microphone",
      body: "DualSense has a built-in microphone and a mute button beside the PS button. DualShock 4 has no mute button and no built-in microphone. A headset microphone is muted from the quick menu.",
    },
    {
      title: "Adaptive triggers",
      body: "L2 and R2 on DualSense can change resistance. On DualShock 4 the resistance stays the same. Both controllers read how far the trigger is pressed.",
    },
    {
      title: "Haptic feedback",
      body: "DualSense has voice-coil actuators in the grips. DualShock 4 has two rumble motors.",
    },
    {
      title: "Light bar",
      body: "Not a button. On DualShock 4 it sits on the touchpad edge that faces the screen. On DualSense it sits on the left and right of the touchpad.",
    },
  ],
  deleteAll: "Delete language and appearance",
  deleteAsk: "Really delete language and appearance? The backlog and the last pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "Language and appearance have been deleted. The backlog and the last pattern stay.",
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
