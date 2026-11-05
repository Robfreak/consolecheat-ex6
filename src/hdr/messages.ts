import type { PatternId } from "./patterns.ts";

export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

export type PatternCopy = { name: string; description: string; hint: string };

export type GuideCopy = {
  heading: string;
  canHeading: string;
  canIntro: string;
  canBlack: string;
  canPluge: string;
  canWhite: string;
  canGray: string;
  cannotHeading: string;
  cannotIntro: string;
  cannotPeak: string;
  cannotPq: string;
  cannotCert: string;
  cannotConsole: string;
  howHeading: string;
  how1: string;
  how2: string;
  how3: string;
  how4: string;
  how5: string;
  screenHeading: string;
  screenBody: string;
  screenLink: string;
};

export type HdrNoteCopy = {
  heading: string;
  body: string;
  probeLabel: string;
  high: string;
  standard: string;
  unknown: string;
  notCertified: string;
};

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
  guide: GuideCopy;
  hdrNote: HdrNoteCopy;
  patternsHeading: string;
  shortcutHint: string;
  controls: string;
  prev: string;
  next: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  closePattern: string;
  patternStatus: string;
  fullscreenUnavailable: string;
  whiteChip: string;
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
  title: "HDR- und Helligkeits-Hilfe",
  metaDescription:
    "Hilfe für Helligkeit, Schwarzwert und HDR-Grenzen im Browser. Testmuster laufen lokal, ohne Upload. Inoffiziell, nicht von Sony.",
  eyebrow: "Helligkeit · HDR",
  lede: "Kurze Hilfe für Helligkeit, Schwarzwert und die Grenzen von HDR im Browser, plus Testmuster. Es wird nichts hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine personenbezogenen Daten. Das letzte Muster bleibt nur in diesem Tab.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  guide: {
    heading: "Kurzanleitung",
    canHeading: "Was diese Seite kann",
    canIntro: "Helligkeit und Schwarzwert grob prüfen. Die Muster entstehen im Browser. Es wird kein Bild geladen.",
    canBlack: "Nahezu Schwarz, 0 % bis 5 % der vollen Stufe. Wenn die ersten Stufen im Schwarz verschwinden, drückt das Bild Schwarz zusammen.",
    canPluge:
      "PLUGE-ähnlich: Code 0 soll im schwarzen Feld verschwinden, du siehst nur den Rahmen. Code 2 soll gerade noch sichtbar sein. Einen Wert unter 0 kann eine Webseite nicht zeichnen.",
    canWhite: "Nahezu Weiß und die Clipping-Stufen. Die letzten Stufen vor Weiß sollen getrennt bleiben. Fallen sie zusammen, clippt Weiß.",
    canGray:
      "Graustufen in 256 Stufen, plus Flächen bei 20 %, 50 % und 80 %. Ein Farbstich (rosa, grün, blau) fällt auf den Flächen eher auf als im Verlauf. Kelvin misst diese Seite nicht.",
    cannotHeading: "Was diese Seite nicht kann",
    cannotIntro: "Eine normale Webseite prüft HDR nur eingeschränkt. Die Muster unten bleiben SDR.",
    cannotPeak:
      "Die Spitzenhelligkeit in Nits lässt sich hier nicht messen. Weiß auf dieser Seite ist das Weiß des Browsers (SDR, sRGB), kein HDR-Highlight.",
    cannotPq:
      "Die PQ-Kurve (PQ EOTF, SMPTE ST 2084) kann eine normale Webseite nicht durchmessen. Tone Mapping des Fernsehers bleibt unsichtbar.",
    cannotCert: "HDR10, Dolby Vision und HLG werden hier nicht zertifiziert.",
    cannotConsole: "Die HDR-Einrichtung der Konsole bleibt am Gerät. Diese Seite ersetzt sie nicht.",
    howHeading: "So prüfen",
    how1: "Raum etwas abdunkeln. Dynamischer Kontrast und eine Schwarz-Anhebung verändern das Bild. Für einen ehrlichen Blick kurz aus, oder so lassen, wie du spielst.",
    how2: "Ein Muster öffnen und auf Vollbild gehen. Esc beendet zuerst das Vollbild, danach die Ansicht.",
    how3: "Nahezu Schwarz: 0 % und die nächsten Stufen sollen getrennt bleiben.",
    how4: "Nahezu Weiß: die letzten Stufen vor 100 % sollen getrennt bleiben.",
    how5: "Für Farben, Pixel, Bewegung und Schärfe den Bildschirm-Test verwenden.",
    screenHeading: "Voller Mustervorrat",
    screenBody:
      "Diese Seite bleibt bei Helligkeit, Schwarzwert und den Grenzen von HDR im Browser. Farben, Pixel, Bewegung und Schärfe liegen im Bildschirm-Test.",
    screenLink: "Zum Bildschirm-Test",
  },
  hdrNote: {
    heading: "HDR-Hinweis",
    body: "matchMedia('(dynamic-range: high)') meldet nur, was der Browser über den Ausgang glaubt. Die Abfrage misst keine Spitzenhelligkeit in Nits und prüft nicht die PQ-Kurve (PQ EOTF).",
    probeLabel: "Meldung des Browsers",
    high: "Dieser Browser meldet einen hohen Dynamikumfang (dynamic-range: high).",
    standard: "Dieser Browser meldet den normalen Dynamikumfang (SDR, dynamic-range: standard).",
    unknown: "Dieser Browser meldet hier keinen Dynamikumfang. Die Abfrage dynamic-range wird nicht unterstützt oder liefert kein Ergebnis.",
    notCertified: "Das ist nur eine Auskunft des Browsers, keine Messung und kein Zertifikat.",
  },
  patternsHeading: "Muster",
  shortcutHint: "Pfeile wechseln das Muster. Ziffern 1 bis 6 springen. Esc beendet zuerst das Vollbild, danach die Ansicht.",
  controls: "Steuerung",
  prev: "Vorheriges Muster",
  next: "Nächstes Muster",
  fullscreenEnter: "Vollbild",
  fullscreenExit: "Vollbild beenden",
  closePattern: "Zur Übersicht",
  patternStatus: "{name}, {n} von {total}",
  fullscreenUnavailable: "Vollbild ist hier nicht verfügbar. Das Muster füllt trotzdem das Fenster.",
  whiteChip: "Weiß",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk: "Wirklich die lokalen Daten dieser Seite löschen? Das letzte Muster, die Sprache und das Erscheinungsbild. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  patterns: {
    "near-black": {
      name: "Nahezu Schwarz",
      description: "Stufen von 0 % bis 5 % der vollen Stufe, für den Schwarzwert.",
      hint: "0 % bis 5 %. Die ersten Stufen sollen getrennt bleiben. Verschwinden sie, drückt das Bild Schwarz zusammen.",
    },
    "near-white": {
      name: "Nahezu Weiß",
      description: "Stufen von 95 % bis 100 %, knapp unter Weiß.",
      hint: "95 % bis 100 %. Die letzten Stufen sollen getrennt bleiben. Fallen sie zusammen, clippt Weiß.",
    },
    pluge: {
      name: "PLUGE-Schwarz",
      description: "Schwarzwert: Code 0 im Feld, Code 2 und 4 knapp darüber, dazu ein weißes Feld.",
      hint: "Code 0 soll im Feld verschwinden, du siehst nur den Rahmen. Code 2 soll gerade noch sichtbar sein. Unter 0 geht nicht.",
    },
    "black-crush": {
      name: "Schwarz-Stufen",
      description: "Codes 0 bis 24. 0 ist PC-Schwarz, 16 ist Video-Schwarz.",
      hint: "0 ist PC-Schwarz, 16 ist Video-Schwarz. Gleiche Stufen bedeuten, dass Schwarz zusammenfällt.",
    },
    "white-clip": {
      name: "Weiß-Clipping",
      description: "Codes 235 bis 255. 235 ist Video-Weiß, 255 ist volles Weiß.",
      hint: "235 ist Video-Weiß, 255 ist volles Weiß. Getrennte Stufen bedeuten, dass Weiß nicht clippt.",
    },
    "gray-ramp": {
      name: "Graustufen",
      description: "Verlauf in 256 Stufen und drei graue Flächen für einen Farbstich.",
      hint: "256 Stufen von links nach rechts. Die Flächen 20 %, 50 % und 80 % zeigen einen Farbstich. Kelvin misst diese Seite nicht.",
    },
  },
});

const en = pack({
  title: "HDR and brightness helper",
  metaDescription:
    "Help for brightness, black level, and HDR limits in the browser. Test patterns run locally, with no upload. Unofficial, not Sony.",
  eyebrow: "Brightness · HDR",
  lede: "A short guide to brightness, black level, and what HDR a browser page can check, plus test patterns. Nothing is uploaded.",
  freeClaim: "Completely free. Nothing on this site costs money.",
  privacyClaim: "No personal data. The last pattern stays in this tab only.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid here. This site is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool has its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  guide: {
    heading: "Short guide",
    canHeading: "What this page can check",
    canIntro: "A rough look at brightness and black level. The patterns are drawn in the browser. No image is loaded.",
    canBlack: "Near-black, 0% to 5% of full range. If the first steps disappear into black, the picture is crushing blacks.",
    canPluge:
      "PLUGE-style: code 0 should disappear into the black field, so you only see the outline. Code 2 should be just visible. A web page cannot draw a value below 0.",
    canWhite: "Near-white and the clipping steps. The last steps before white should stay separate. If they merge, white is clipping.",
    canGray:
      "A 256-step grayscale, plus patches at 20%, 50%, and 80%. A tint (pink, green, blue) shows up on the patches more easily than on the ramp. This page does not measure kelvin.",
    cannotHeading: "What this page cannot check",
    cannotIntro: "An ordinary web page can check HDR only in a limited way. The patterns below stay SDR.",
    cannotPeak:
      "Peak luminance in nits cannot be measured here. White on this page is the browser’s white (SDR, sRGB), not an HDR highlight.",
    cannotPq:
      "An ordinary web page cannot measure the PQ curve (PQ EOTF, SMPTE ST 2084). The TV’s tone mapping stays invisible.",
    cannotCert: "HDR10, Dolby Vision, and HLG are not certified here.",
    cannotConsole: "HDR setup on the console stays on the device. This page does not replace it.",
    howHeading: "How to look",
    how1: "Dim the room a little. Dynamic contrast and black enhancement change the picture. Turn them off for an honest look, or leave them as you play.",
    how2: "Open a pattern and go fullscreen. Esc leaves fullscreen first, then closes the pattern.",
    how3: "Near-black: 0% and the next steps should stay separate.",
    how4: "Near-white: the last steps before 100% should stay separate.",
    how5: "For color, pixels, motion, and sharpness, use the screen test.",
    screenHeading: "Full pattern set",
    screenBody:
      "This page stays with brightness, black level, and the HDR limits of a browser. Color, pixels, motion, and sharpness are on the screen test.",
    screenLink: "Open the screen test",
  },
  hdrNote: {
    heading: "HDR note",
    body: "matchMedia('(dynamic-range: high)') only reports what the browser believes about the output. The query does not measure peak luminance in nits and does not check the PQ curve (PQ EOTF).",
    probeLabel: "What the browser reports",
    high: "This browser reports a high dynamic range (dynamic-range: high).",
    standard: "This browser reports the standard dynamic range (SDR, dynamic-range: standard).",
    unknown: "This browser does not report a dynamic range here. The dynamic-range query is unsupported or returned no result.",
    notCertified: "This is only a report from the browser, not a measurement and not a certification.",
  },
  patternsHeading: "Patterns",
  shortcutHint: "Arrows change the pattern. Digits 1 through 6 jump. Esc leaves fullscreen first, then closes the view.",
  controls: "Controls",
  prev: "Previous pattern",
  next: "Next pattern",
  fullscreenEnter: "Fullscreen",
  fullscreenExit: "Leave fullscreen",
  closePattern: "Back to the list",
  patternStatus: "{name}, {n} of {total}",
  fullscreenUnavailable: "Fullscreen is not available here. The pattern still fills the window.",
  whiteChip: "White",
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete this page’s local data? The last pattern, the language, and the appearance. The backlog and the screen-test pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "This page’s local data has been deleted. The backlog and the screen-test pattern stay.",
  deleteFailed: "Could not delete. The browser blocked storage.",
  patterns: {
    "near-black": {
      name: "Near-black",
      description: "Steps from 0% to 5% of full range, for black level.",
      hint: "0% to 5%. The first steps should stay separate. If they vanish, the picture is crushing blacks.",
    },
    "near-white": {
      name: "Near-white",
      description: "Steps from 95% to 100%, just under white.",
      hint: "95% to 100%. The last steps should stay separate. If they merge, white is clipping.",
    },
    pluge: {
      name: "PLUGE black",
      description: "Black level: code 0 in the field, codes 2 and 4 just above it, plus a white patch.",
      hint: "Code 0 should disappear into the field, so you only see the outline. Code 2 should be just visible. Below 0 is impossible.",
    },
    "black-crush": {
      name: "Black steps",
      description: "Codes 0 through 24. 0 is PC black, 16 is video black.",
      hint: "0 is PC black, 16 is video black. Steps that look the same mean black is crushed.",
    },
    "white-clip": {
      name: "White clipping",
      description: "Codes 235 through 255. 235 is video white, 255 is full white.",
      hint: "235 is video white, 255 is full white. Separate steps mean white is not clipping.",
    },
    "gray-ramp": {
      name: "Grayscale",
      description: "A 256-step ramp and three gray patches for a color tint.",
      hint: "256 steps from left to right. The 20%, 50%, and 80% patches show a tint. This page does not measure kelvin.",
    },
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
