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
  calcHeading: string;
  sizeLabel: string;
  sizeUnitLabel: string;
  speedLabel: string;
  speedUnitLabel: string;
  unitGB: string;
  unitMB: string;
  unitMbps: string;
  unitMBps: string;
  sizePresetsLabel: string;
  speedPresetsLabel: string;
  resultLabel: string;
  resultEmpty: string;
  resultInvalid: string;
  resultZeroSpeed: string;
  underOneSecond: string;
  formulaNote: string;
  estimateNote: string;
  dayOne: string;
  dayMany: string;
  hourOne: string;
  hourMany: string;
  minuteOne: string;
  minuteMany: string;
  secondOne: string;
  secondMany: string;
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
  title: "Download-Zeit-Rechner",
  metaDescription:
    "Rechnet die ungefähre Download-Dauer aus Spielgröße und Leitungsgeschwindigkeit. Läuft lokal im Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "Größe · Leitung",
  lede: "Spielgröße geteilt durch die Leitung. Die Rechnung bleibt in diesem Browser, es wird nichts gesendet.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine personenbezogenen Daten. Größe und Geschwindigkeit werden nicht gespeichert.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  calcHeading: "Rechner",
  sizeLabel: "Spielgröße",
  sizeUnitLabel: "Einheit der Größe",
  speedLabel: "Leitung / Geschwindigkeit",
  speedUnitLabel: "Einheit der Geschwindigkeit",
  unitGB: "GB",
  unitMB: "MB",
  unitMbps: "Mbit/s",
  unitMBps: "MB/s",
  sizePresetsLabel: "Übliche Spielgrößen",
  speedPresetsLabel: "Übliche Leitungen",
  resultLabel: "Ungefähre Dauer",
  resultEmpty: "Größe und Geschwindigkeit eintragen.",
  resultInvalid: "Bitte eine Zahl ab 0 eintragen, zum Beispiel 50 oder 12,5.",
  resultZeroSpeed: "Die Geschwindigkeit ist 0. Eine Dauer lässt sich so nicht rechnen.",
  underOneSecond: "unter 1 Sekunde",
  formulaNote: "1 Byte = 8 Bit. 1 GB = 1 000 MB = 1 000 000 000 Byte. 1 MB/s = 8 Mbit/s.",
  estimateNote: "Schätzung. Overhead und eine ausgelastete Leitung ändern die echte Dauer.",
  dayOne: "Tag",
  dayMany: "Tage",
  hourOne: "Stunde",
  hourMany: "Stunden",
  minuteOne: "Minute",
  minuteMany: "Minuten",
  secondOne: "Sekunde",
  secondMany: "Sekunden",
  deleteAll: "Sprache und Erscheinungsbild löschen",
  deleteAsk: "Wirklich Sprache und Erscheinungsbild löschen? Die Merkliste und das letzte Testbild bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Sprache und Erscheinungsbild sind gelöscht. Die Merkliste und das letzte Testbild bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
});

const en = pack({
  title: "Download time calculator",
  metaDescription:
    "Estimates how long a download takes from the game size and the line speed. Runs locally in the browser. Unofficial, not Sony.",
  eyebrow: "Size · line",
  lede: "Game size divided by the line speed. The math stays in this browser, and nothing is sent.",
  freeClaim: "Completely free. Nothing on this site costs money.",
  privacyClaim: "No personal data. Size and speed are not stored.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid here. This site is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool has its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  calcHeading: "Calculator",
  sizeLabel: "Game size",
  sizeUnitLabel: "Size unit",
  speedLabel: "Line speed",
  speedUnitLabel: "Speed unit",
  unitGB: "GB",
  unitMB: "MB",
  unitMbps: "Mbit/s",
  unitMBps: "MB/s",
  sizePresetsLabel: "Common game sizes",
  speedPresetsLabel: "Common line speeds",
  resultLabel: "Approximate duration",
  resultEmpty: "Enter a size and a speed.",
  resultInvalid: "Enter a number from 0 up, for example 50 or 12.5.",
  resultZeroSpeed: "The speed is 0. A duration cannot be calculated that way.",
  underOneSecond: "under 1 second",
  formulaNote: "1 byte = 8 bits. 1 GB = 1,000 MB = 1,000,000,000 bytes. 1 MB/s = 8 Mbit/s.",
  estimateNote: "An estimate. Overhead and a busy line change the real duration.",
  dayOne: "day",
  dayMany: "days",
  hourOne: "hour",
  hourMany: "hours",
  minuteOne: "minute",
  minuteMany: "minutes",
  secondOne: "second",
  secondMany: "seconds",
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
