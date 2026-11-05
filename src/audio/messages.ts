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
  howHeading: string;
  instructionHeadphones: string;
  instructionSwap: string;
  instructionCaveat: string;
  channelsLabel: string;
  channelLeft: string;
  channelRight: string;
  channelBoth: string;
  channelCenter: string;
  soundsLabel: string;
  soundTone: string;
  soundPink: string;
  soundBeep: string;
  soundHint: string;
  stop: string;
  volume: string;
  statusIdle: string;
  statusLeft: string;
  statusRight: string;
  statusBoth: string;
  statusSuspended: string;
  statusUnavailable: string;
  keyboardHint: string;
  indicatorLeft: string;
  indicatorCenter: string;
  indicatorRight: string;
  relatedHeading: string;
  relatedBody: string;
  screenLink: string;
  hdrLink: string;
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
  title: "Audio-Kanal-Test",
  metaDescription:
    "Prüft den linken und den rechten Kanal im Browser. Der Ton entsteht lokal, ohne Mikrofon und ohne Upload. Inoffiziell, nicht von Sony.",
  eyebrow: "Links · Rechts · Mitte",
  lede: "Hören Sie, ob links, rechts oder beide Seiten ankommen. Der Ton entsteht in diesem Browser und wird nicht gesendet.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Kein Mikrofon, keine Aufnahme, kein Upload. Der Ton bleibt auf dem Gerät.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  howHeading: "So prüfen Sie die Kanäle",
  instructionHeadphones:
    "Kopfhörer oder Lautsprecher benutzen. Der Ton startet erst nach einem Klick oder der Taste 1, 2 oder 3.",
  instructionSwap: "Liegt „Links“ auf der rechten Seite, sind Kabel oder Stecker vertauscht.",
  instructionCaveat:
    "Browser, System-Mixer und eine TV-Durchleitung können die Kanäle umlegen. Der Test gilt für diesen Ausgang.",
  channelsLabel: "Kanal",
  channelLeft: "Links",
  channelRight: "Rechts",
  channelBoth: "Beide",
  channelCenter: "Mitte",
  soundsLabel: "Signal",
  soundTone: "Ton",
  soundPink: "Rosa Rauschen",
  soundBeep: "Piep",
  soundHint: "Ton und Rauschen laufen bis Stopp. Der Piep ist ein kurzer Ton.",
  stop: "Stopp",
  volume: "Lautstärke",
  statusIdle: "Gestoppt. Ein Klick auf einen Kanal startet den Ton.",
  statusLeft: "Links spielt.",
  statusRight: "Rechts spielt.",
  statusBoth: "Beide Kanäle spielen, gleicher Pegel links und rechts.",
  statusSuspended: "Der Browser hält den Ton an, bis Sie klicken. Drücken Sie erneut auf einen Kanal.",
  statusUnavailable: "Dieser Browser stellt die Web Audio API nicht bereit.",
  keyboardHint: "Tastatur: 1 links, 2 rechts, 3 beide, Esc stoppt.",
  indicatorLeft: "Links",
  indicatorCenter: "Mitte",
  indicatorRight: "Rechts",
  relatedHeading: "Bild und Ton",
  relatedBody: "Farben, Pixel und Helligkeit prüfen die benachbarten Werkzeuge.",
  screenLink: "Zum Bildschirm-Test",
  hdrLink: "Zur HDR-Hilfe",
  deleteAll: "Sprache und Erscheinungsbild löschen",
  deleteAsk: "Wirklich Sprache und Erscheinungsbild löschen? Die Merkliste und das letzte Testbild bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Sprache und Erscheinungsbild sind gelöscht. Die Merkliste und das letzte Testbild bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
});

const en = pack({
  title: "Audio channel test",
  metaDescription:
    "Checks the left and right channels in the browser. The sound is generated locally, with no microphone and no upload. Unofficial, not Sony.",
  eyebrow: "Left · Right · Center",
  lede: "Hear whether the left side, the right side, or both sides arrive. The sound is made in this browser and is not sent anywhere.",
  freeClaim: "Completely free. Nothing on this site costs money.",
  privacyClaim: "No microphone, no recording, no upload. The sound stays on the device.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid here. This site is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool has its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  howHeading: "How to check the channels",
  instructionHeadphones: "Use headphones or speakers. Sound starts only after a click, or the keys 1, 2, or 3.",
  instructionSwap: "If Left is heard on the right, the cable or the plug is swapped.",
  instructionCaveat:
    "The browser, the system mixer, and a TV passthrough can remap the channels. The test applies to this output.",
  channelsLabel: "Channel",
  channelLeft: "Left",
  channelRight: "Right",
  channelBoth: "Both",
  channelCenter: "Center",
  soundsLabel: "Signal",
  soundTone: "Tone",
  soundPink: "Pink noise",
  soundBeep: "Beep",
  soundHint: "The tone and the noise run until Stop. The beep is a short tone.",
  stop: "Stop",
  volume: "Volume",
  statusIdle: "Stopped. A click on a channel starts the sound.",
  statusLeft: "Left is playing.",
  statusRight: "Right is playing.",
  statusBoth: "Both channels are playing, equal level on the left and the right.",
  statusSuspended: "The browser is holding the sound until you click. Press a channel again.",
  statusUnavailable: "This browser does not provide the Web Audio API.",
  keyboardHint: "Keyboard: 1 left, 2 right, 3 both, Esc stops.",
  indicatorLeft: "Left",
  indicatorCenter: "Center",
  indicatorRight: "Right",
  relatedHeading: "Picture and sound",
  relatedBody: "The neighboring tools check color, pixels, and brightness.",
  screenLink: "Open the screen test",
  hdrLink: "Open the HDR helper",
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
