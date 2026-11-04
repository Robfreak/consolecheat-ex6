import type { PatternId } from "./patterns.ts";

export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

export type PatternCopy = { name: string; description: string };

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
  merkliste: string;
  patternsHeading: string;
  shortcutHint: string;
  controls: string;
  prev: string;
  next: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  closePattern: string;
  patternStatus: string;
  motionPlay: string;
  motionPause: string;
  fullscreenUnavailable: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
  patterns: Record<PatternId, PatternCopy>;
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "Bildschirm-Test",
  metaDescription:
    "Testbilder für Fernseher und Monitore. Läuft lokal im Browser, ohne Upload. Inoffiziell, nicht von Sony.",
  eyebrow: "Fernseher · Monitor",
  lede: "Testbilder über den ganzen Schirm: Farben, Verläufe, Pixel, Schwarzwert, Bewegung und Schärfe. Es wird nichts hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine personenbezogenen Daten. Das letzte Testbild bleibt nur in diesem Tab.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  merkliste: "Zur Merkliste",
  patternsHeading: "Testbilder",
  shortcutHint: "Pfeile wechseln das Testbild. Ziffern 1 bis 9 und 0 springen. Esc beendet zuerst das Vollbild, danach die Ansicht.",
  controls: "Steuerung",
  prev: "Vorheriges Testbild",
  next: "Nächstes Testbild",
  fullscreenEnter: "Vollbild",
  fullscreenExit: "Vollbild beenden",
  closePattern: "Zur Übersicht",
  patternStatus: "{name}, {n} von {total}",
  motionPlay: "Bewegung starten",
  motionPause: "Bewegung anhalten",
  fullscreenUnavailable: "Vollbild ist hier nicht verfügbar. Das Testbild füllt trotzdem das Fenster.",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk: "Wirklich die lokalen Daten dieser Seite löschen? Das letzte Testbild, die Sprache und das Erscheinungsbild. Die Merkliste bleibt.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste bleibt.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  patterns: {
    black: { name: "Schwarz", description: "Fläche in reinem Schwarz." },
    white: { name: "Weiß", description: "Fläche in reinem Weiß." },
    red: { name: "Rot", description: "Fläche in reinem Rot." },
    green: { name: "Grün", description: "Fläche in reinem Grün." },
    blue: { name: "Blau", description: "Fläche in reinem Blau." },
    gray: { name: "Grau", description: "Fläche in mittlerem Grau." },
    "near-black": { name: "Nahezu Schwarz", description: "Stufen knapp über Schwarz, für den Schwarzwert." },
    "near-white": { name: "Nahezu Weiß", description: "Stufen knapp unter Weiß." },
    "gradient-h": { name: "Farbverlauf waagerecht", description: "Farbverlauf von links nach rechts." },
    "gradient-v": { name: "Farbverlauf senkrecht", description: "Farbverlauf von oben nach unten." },
    checker: { name: "Schachbrett", description: "Grobes Schachbrett für hängende Pixel." },
    pixels: { name: "Pixelraster", description: "Ein-Pixel-Raster für tote Pixel." },
    motion: { name: "Laufbalken", description: "Ein Balken läuft über den Schirm." },
    scroll: { name: "Laufstreifen", description: "Streifen laufen seitwärts, für Bewegungsunschärfe." },
    sharpness: { name: "Schärfe", description: "Schrift und feine Linien." },
  },
});

const en = pack({
  title: "Screen test",
  metaDescription: "Test patterns for TVs and monitors. Runs locally in the browser, with no upload. Unofficial, not Sony.",
  eyebrow: "TV · monitor",
  lede: "Patterns across the whole screen: color, gradients, pixels, black level, motion, and sharpness. Nothing is uploaded.",
  freeClaim: "Completely free. Nothing on this site costs money.",
  privacyClaim: "No personal data. The last pattern stays in this tab only.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid here. This site is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool has its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  merkliste: "Back to the backlog",
  patternsHeading: "Patterns",
  shortcutHint: "Arrows change the pattern. Digits 1–9 and 0 jump. Esc leaves fullscreen first, then the pattern.",
  controls: "Controls",
  prev: "Previous pattern",
  next: "Next pattern",
  fullscreenEnter: "Fullscreen",
  fullscreenExit: "Exit fullscreen",
  closePattern: "Back to the list",
  patternStatus: "{name}, {n} of {total}",
  motionPlay: "Start motion",
  motionPause: "Pause motion",
  fullscreenUnavailable: "Fullscreen is not available here. The pattern still fills the window.",
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete the local data for this page? The last pattern, the language, and the appearance. The backlog stays.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "Local data for this page has been deleted. The backlog stays.",
  deleteFailed: "Could not delete. The browser blocked storage.",
  patterns: {
    black: { name: "Black", description: "A field of pure black." },
    white: { name: "White", description: "A field of pure white." },
    red: { name: "Red", description: "A field of pure red." },
    green: { name: "Green", description: "A field of pure green." },
    blue: { name: "Blue", description: "A field of pure blue." },
    gray: { name: "Gray", description: "A field of mid gray." },
    "near-black": { name: "Near-black", description: "Steps just above black, for black level." },
    "near-white": { name: "Near-white", description: "Steps just below white." },
    "gradient-h": { name: "Gradient horizontal", description: "Color gradient from left to right." },
    "gradient-v": { name: "Gradient vertical", description: "Color gradient from top to bottom." },
    checker: { name: "Checkerboard", description: "A coarse checkerboard for stuck pixels." },
    pixels: { name: "Pixel grid", description: "A one-pixel grid for dead pixels." },
    motion: { name: "Moving bar", description: "A bar travels across the screen." },
    scroll: { name: "Scrolling stripes", description: "Stripes travel sideways, for motion blur." },
    sharpness: { name: "Sharpness", description: "Type and fine lines." },
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

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
