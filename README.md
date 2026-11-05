# Spiele-Merkliste

Standalone backlog and wishlist for PlayStation 4 and PlayStation 5 games, built to sit next to [consolecheat.com](https://consolecheat.com). German is the primary language. English is the other language. The same light and dark theme, self-hosted fonts, footer, Impressum, and Datenschutz as the other consolecheat tools are included. There is no Webmail link.

No account, no tracking, nothing uploaded. The lists stay in this browser under `localStorage` key `consolecheat-ex6-merkliste-v1`. Language and theme use `consolecheat-lang` and `consolecheat-theme`. Fonts are self-hosted, so the page does not call Google or any other third party while it loads. The Impressum fields are placeholders until the operator fills them in. No name or address was invented.

This repository also hosts six tools until they have their own repositories. The **Bildschirm-Test** is at `/consolecheat-ex6/bildschirm/`, a temporary home until Lennart creates [Robfreak/consolecheat-ex7](https://github.com/Robfreak/consolecheat-ex7). The **Download-Zeit-Rechner** is at `/consolecheat-ex6/download/`, a temporary home until that calculator has its own repository (ex7 if the screen test has already moved, otherwise ex8). The **Tastenbelegung** is at `/consolecheat-ex6/tasten/`, a temporary home until that reference has its own repository. The **HDR- und Helligkeits-Hilfe** is at `/consolecheat-ex6/hdr/`, a temporary home until that helper has its own repository. The **Audio-Kanal-Test** is at `/consolecheat-ex6/audio/`, a temporary home until that channel check has its own repository. The **USB-Stick-Checkliste** is at `/consolecheat-ex6/usb/`, a temporary home until that checklist has its own repository. Move to own repo later. All seven footers list the other tools under **Weitere Werkzeuge**. See [Move the screen test to ex7](#move-the-screen-test-to-ex7), [Move the calculator to its own repo](#move-the-calculator-to-its-own-repo), [Move the button layout to its own repo](#move-the-button-layout-to-its-own-repo), [Move the HDR helper to its own repo](#move-the-hdr-helper-to-its-own-repo), [Move the channel test to its own repo](#move-the-channel-test-to-its-own-repo), and [Move the USB checklist to its own repo](#move-the-usb-checklist-to-its-own-repo).

Expected site: <https://robfreak.github.io/consolecheat-ex6/>

Inoffiziell. Nicht von Sony.

## What it does

- Search with the same Title-ID-Finder index: typos (`god of wr`), partial names, Roman numerals (`gta v`), short aliases (`tlou`), and a title ID (`CUSA07408`).
- Add a game to one of four lists: **Backlog**, **Spiele ich gerade**, **Durch**, **Wunschliste**. An entry stores the title IDs and the name from the catalog, plus a note of at most 280 characters. The same title ID cannot sit twice in one list. Release dates, playtime, and prices are not stored and are rejected on import.
- Move an entry to another list or remove it. With the entry focused: `1` backlog, `2` playing, `3` completed, `4` wishlist, Delete removes it, and the arrow keys move between entries. The same actions are buttons and a select.
- Each entry links to the Title-ID-Finder at `https://robfreak.github.io/consolecheat-ex1/?q=<TITLE_ID>` and to the PS-Plus-Archiv at `https://robfreak.github.io/consolecheat-ex2/?q=<name>`. The archive’s `?q=` filters by name (it also accepts `region`, `platform`, and `year`). A title ID would not match that filter, so the archive link uses the stored name.
- The footer group **Weitere Werkzeuge** (English: **Other tools**) links to the other consolecheat tools: Title-ID-Finder, PS-Plus-Archiv, Controller-Tester, Save-Info-Leser, Fehlercode-Nachschlager, the Bildschirm-Test, the Download-Zeit-Rechner, the Tastenbelegung, HDR/Helligkeit, the Audio-Kanal-Test, and the USB-Stick-Checkliste. The screen test, the calculator, the button layout, the HDR helper, the channel test, and the USB checklist include this Merkliste. These are ordinary links. None of the pages requests those sites. Links to pages in this repository use the base path (`/consolecheat-ex6/`, `/consolecheat-ex6/bildschirm/`, `/consolecheat-ex6/download/`, `/consolecheat-ex6/tasten/`, `/consolecheat-ex6/hdr/`, `/consolecheat-ex6/audio/`, `/consolecheat-ex6/usb/`) so a local preview stays local. On GitHub Pages that is the same place as `https://robfreak.github.io/consolecheat-ex6/`, `https://robfreak.github.io/consolecheat-ex6/bildschirm/`, `https://robfreak.github.io/consolecheat-ex6/download/`, `https://robfreak.github.io/consolecheat-ex6/tasten/`, `https://robfreak.github.io/consolecheat-ex6/hdr/`, `https://robfreak.github.io/consolecheat-ex6/audio/`, and `https://robfreak.github.io/consolecheat-ex6/usb/`.
- Export writes `spiele-merkliste.json` (`schema` + `version`). Import checks the file strictly. Broken JSON, the wrong schema, the wrong version, a foreign file, a file over 256 KB, and an invalid entry are refused, in German and English, and the current lists stay as they are. A valid file is applied only after **Zusammenführen** or **Ersetzen**. Cancel, Escape, and a click outside the dialog change nothing. Merge keeps a game on its current list and fills a note only when the current note is empty.
- If `localStorage` is full or disabled, the page says so and keeps working until reload. Stored data with a different version, or data that does not parse, is left untouched.

## Run and test

```bash
npm install
npm test        # merkliste, screen test, download calculator, button layout, HDR helper, audio channel test, and USB checklist (items, PS4/PS5, export, i18n, footers)
npm run dev     # merkliste   http://127.0.0.1:5173/consolecheat-ex6/
                # screen test http://127.0.0.1:5173/consolecheat-ex6/bildschirm/
                # download    http://127.0.0.1:5173/consolecheat-ex6/download/
                # buttons     http://127.0.0.1:5173/consolecheat-ex6/tasten/
                # hdr         http://127.0.0.1:5173/consolecheat-ex6/hdr/
                # audio       http://127.0.0.1:5173/consolecheat-ex6/audio/
                # usb         http://127.0.0.1:5173/consolecheat-ex6/usb/
npm run build   # typecheck, Vite build (base /consolecheat-ex6/), offline check of all seven pages
npm run preview # http://127.0.0.1:4173/consolecheat-ex6/ , .../bildschirm/ , .../download/ , .../tasten/ , .../hdr/ , .../audio/ , and .../usb/
```

Node `>=22.6` (`package.json` `engines`). The test runner is `node --experimental-strip-types --test`.

## Bildschirm-Test

Local TV and monitor patterns: solid colors (black, white, red, green, blue, gray), horizontal and vertical color gradients, a coarse checkerboard, a one-device-pixel grid, near-black and near-white steps, a moving bar, scrolling stripes, and a text sharpness sample. Nothing is uploaded. The page does not fetch pattern data.

Open a pattern from the list, or with the number keys `1`–`9` and `0` (the first ten). Arrow keys move through every pattern, including on a D-pad that sends arrows. `Esc` leaves fullscreen first; the next `Esc` returns to the list. The on-screen buttons do the same. In fullscreen the controls fade after a few seconds and come back on a key, a pointer move, or focus. If the Fullscreen API is missing or refused, which some TV browsers do, the pattern still fills the window. That is as far as an ordinary web page can go in a PS5 or other TV browser. No console API is required.

The last opened pattern is remembered only in `sessionStorage`, key `consolecheat-bildschirm-pattern` (a pattern id such as `black`, this tab only). The page reads that key once on load. It does not write it until a pattern is opened, and it removes the key when you return to the list. Closing the tab drops it. Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`. No other storage is used. The Merkliste key is not read or changed.

### Move the screen test to ex7

The screen test does not import the Merkliste modules. To give it its own repository later, copy these paths and drop the cross-links:

- `bildschirm/index.html` — its own HTML entry
- `src/bildschirm/` — styles, TypeScript, and tests

`src/bildschirm/tools.ts` is a copy of `src/tools.ts` (the same list also lives in `src/download/tools.ts`, `src/tasten/tools.ts`, `src/hdr/tools.ts`, and `src/audio/tools.ts`). Point that project's Vite `base` at `/consolecheat-ex7/`, and keep the self-hosted `@fontsource` imports in `src/bildschirm/main.tsx`. The Merkliste link to the screen test is the `screenTest` string in `src/messages.ts`, aimed at `bildschirm/` in the footer tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## Download-Zeit-Rechner

A local estimate of how long a download takes: game size (GB or MB) divided by line speed (Mbit/s or MB/s). The page shows the bit/byte step (1 byte = 8 bits, 1 GB = 1 000 MB = 1 000 000 000 bytes, 1 MB/s = 8 Mbit/s). Nothing is uploaded. Size and speed are not stored, not even in `sessionStorage`. Defaults are 50 GB and 100 Mbit/s. Preset buttons are common game sizes (20, 50, 80, 100 GB) and common line speeds (50, 100, 250, 1000 Mbit/s). They are examples, not measurements from a store. 50 GB at 100 Mbit/s is 4 000 seconds (1 hour, 6 minutes, 40 seconds).

Open it at `/consolecheat-ex6/download/`. Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

### Move the calculator to its own repo

The calculator does not import the Merkliste or the screen test. To give it its own repository later, copy these paths:

- `download/index.html` — its own HTML entry
- `src/download/` — styles, TypeScript, and tests

`src/download/tools.ts` and `src/download/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/download/main.tsx`. If the public URL changes, update the `download` href in the shared tool list.

## Tastenbelegung

A static reference for the DualShock 4 and DualSense button layout. Switch the two with the tabs (arrow keys move between them). Every control is labeled in German and English. German face-button names are Kreuz, Kreis, Quadrat, and Dreieck. The printed symbols × ○ □ △ are the same on every controller. English names are Cross (often X), Circle (often O), Square, and Triangle. The drawing is an SVG silhouette with focusable controls. A text list under it names the same controls. Short notes cover the real differences: Create instead of Share, the mute button, adaptive triggers, haptic feedback, and the light bar.

Nothing is uploaded. The page does not use the Gamepad API. That lives on the Controller-Tester, a sibling tool at `https://robfreak.github.io/consolecheat-ex3/`. The chosen controller is not stored, not even in `sessionStorage`. Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

Open it at `/consolecheat-ex6/tasten/`.

### Move the button layout to its own repo

Move to own repo later. The button layout does not import the Merkliste, the screen test, or the calculator. Copy these paths and drop the cross-links:

- `tasten/index.html` — its own HTML entry
- `src/tasten/` — styles, TypeScript, and tests

`src/tasten/tools.ts` and `src/tasten/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/tasten/main.tsx`. If the public URL changes, update the `buttons` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## HDR- und Helligkeits-Hilfe

A local brightness and black-level helper that sits next to the screen test. Open it at `/consolecheat-ex6/hdr/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`.

The short guide says what a browser page can check (near-black steps from 0% to 5%, a PLUGE-style black-crush check, near-white and white-clipping steps, a 256-step grayscale with 20% / 50% / 80% patches for a tint) and what it cannot. True HDR peak luminance in nits and the PQ curve (PQ EOTF, SMPTE ST 2084) cannot be verified from a normal web page. CSS white is the browser’s SDR white. The page does not certify HDR10, Dolby Vision, or HLG.

Patterns are drawn in the browser with CSS and one canvas ramp. No image is fetched. Open a pattern from the list or with the keys `1`–`6`. Arrows move between patterns. `Esc` leaves fullscreen first; the next `Esc` returns to the list. If the Fullscreen API is missing or refused, the pattern still fills the window. A strong link points at `/consolecheat-ex6/bildschirm/` for color, pixels, motion, and sharpness.

`matchMedia('(dynamic-range: high)')` is shown on the page when the browser supports it. The result is informational only, not a measurement and not a certification. `high`, `standard`, and `unknown` are all expected outcomes.

The last opened pattern is remembered only in `sessionStorage`, key `consolecheat-hdr-pattern` (a pattern id such as `near-black`, this tab only). The page reads that key once on load, writes it only after a pattern is opened, and removes it when you return to the list. Closing the tab drops it. Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

### Move the HDR helper to its own repo

Move to own repo later. The helper does not import the Merkliste, the screen test, the calculator, or the button layout. Copy these paths and drop the cross-links:

- `hdr/index.html` — its own HTML entry
- `src/hdr/` — styles, TypeScript, and tests

`src/hdr/tools.ts` and `src/hdr/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/hdr/main.tsx`. If the public URL changes, update the `hdr` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## Audio-Kanal-Test

A local stereo channel check. Open it at `/consolecheat-ex6/audio/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`.

**Links**, **Rechts**, and **Beide** (center: the same full-scale signal on the left and the right). The sound is a sine tone, pink noise, or a short beep, generated with the Web Audio API (`OscillatorNode` and `BufferSource`). No audio file is fetched. Nothing is uploaded. There is no microphone and no recording. You have to click, or press `1` (left), `2` (right), or `3` (both), before any sound starts. `Esc` stops it. If `AudioContext` stays suspended, the page says the browser is holding the sound until the next click. Volume stays in the page and is not stored.

Headphones or speakers. If Left is heard on the right, the cable or the plug is swapped. The browser mixer, the operating-system mixer, and a TV passthrough can remap channels, so the test applies to this output.

Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`. Links on the page point at the screen test and the HDR helper, the other picture checks in this repository.

### Move the channel test to its own repo

Move to own repo later. The channel test does not import the Merkliste, the screen test, the calculator, the button layout, or the HDR helper. Copy these paths and drop the cross-links:

- `audio/index.html` — its own HTML entry
- `src/audio/` — styles, TypeScript, and tests

`src/audio/tools.ts` and `src/audio/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/audio/main.tsx`. If the public URL changes, update the `audio` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## USB-Stick-Checkliste

A local checklist for the folders and files a USB stick typically needs on a PS4 and a PS5. Open it at `/consolecheat-ex6/usb/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`.

Tabs are **PS4**, **PS5**, and **Beide** (English: **Both**). Each row is a checkbox. The progress line counts the visible rows (`2 von 13`). **Text herunterladen** and **Markdown herunterladen** build a file in the browser from the current checks. **Text kopieren** and **Markdown kopieren** use the clipboard when the browser allows it. The plain-text export stays on the page as a preview. **Haken leeren** clears the ticks and writes an empty list.

The page does not read the stick. There is no file dialog, no USB device API, and no scan of the drive. FAT32 and exFAT are named the way Sony support names them for media and for a system update. That is not a certification of the stick. Folder names Sony support publishes (`Music`, `PS4/UPDATE/PS4UPDATE.PUP`, `PS5/UPDATE/PS5UPDATE.PUP`) are marked **Sony-Hilfe**. Anything less certain, including `AV_CONTENTS` (an internal console folder, not a USB media folder) and capture folders the console writes itself, is marked **Prüfen**: verify on your console / official Sony support. Extended storage is a separate section. It is a drive the console formats, not a folder you create on this stick.

Checks and the chosen console stay in this browser under `localStorage` key `consolecheat-usb-checks-v1` (`version` 1, `console`, `checked`). The key is written when you tick a row, switch the console, or clear the checks. A missing key is not created until then. A value that does not parse, or a different version, is left untouched until you change something. Clearing the checks writes an empty list. Removing the key, together with `consolecheat-lang` and `consolecheat-theme`, is the button on the Datenschutz page. Language and appearance reuse those two shared keys. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

### Move the USB checklist to its own repo

Move to own repo later. The checklist does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, or the channel test. Copy these paths and drop the cross-links:

- `usb/index.html` — its own HTML entry
- `src/usb/` — styles, TypeScript, and tests

`src/usb/tools.ts` and `src/usb/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/usb/main.tsx`. If the public URL changes, update the `usb` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

Try a valid import with `samples/valid-merkliste.json`. The other files in `samples/` are expected to be rejected:

| File | Result |
| --- | --- |
| `samples/valid-merkliste.json` | Valid. Still needs Merge or Replace before it changes anything. |
| `samples/broken.json` | Not JSON. |
| `samples/wrong-schema.json` | Schema is not this tool. |
| `samples/wrong-version.json` | Version 2. |
| `samples/foreign.json` | A different tool’s file, no schema. |
| `samples/foreign-extra.json` | Right schema, plus a `prices` field. |
| `samples/invalid-entry.json` | Title ID is not `CUSA`/`PPSA` plus five digits. |
| `samples/invalid-note.json` | Note longer than 280 characters. |
| `samples/invalid-duplicate.json` | Same title ID twice in one list. |
| `samples/invalid-price.json` | Entry carries `price` and `playtime`. |
| `samples/oversized.json` | Larger than 256 KB. |

## Data

Search code and the catalog are vendored from [Robfreak/consolecheat-ex1](https://github.com/Robfreak/consolecheat-ex1). The site loads `public/titles.json` from its own host. It does not fetch ex1, or the upstream dataset, at runtime.

`scripts/sync-from-ex1.mjs` copies a local checkout (it does not download):

```bash
node scripts/sync-from-ex1.mjs --from ../consolecheat-ex1
```

That writes `src/search.ts`, `public/titles.json`, and `vendor/ex1/PROVENANCE.json` (repository, commit, and the catalog’s upstream commit). The catalog itself comes from the MIT-licensed list [andshrew/PlayStation-Titles](https://github.com/andshrew/PlayStation-Titles). See `THIRD_PARTY_NOTICES.md`. Outfit and Source Sans 3 are bundled from `@fontsource` under the SIL Open Font License; see `public/FONT-OFL.txt`.

## GitHub Pages

`.github/workflows/pages.yml` runs install, test, and build on pull requests and on every push. A push to `main` also pushes `dist/` to the orphan branch `gh-pages` (`peaceiris/actions-gh-pages`, Jekyll off). The deploy job does not run for pull requests.

Vite `base` is `/consolecheat-ex6/`, which matches a project site at `https://robfreak.github.io/consolecheat-ex6/`.

The Actions token can update `gh-pages` only when Actions has write permission. It often cannot turn Pages on. Lennart enables both of these once:

1. **Settings → Actions → General → Workflow permissions → Read and write permissions.** Save.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.** Branch: **`gh-pages`**, folder: **`/ (root)`.** Save.

After that, a merge to `main` fills `gh-pages`. The first deploy can take a minute.

Replace the Impressum placeholders with the operator’s real details before treating that page as a legal notice. No name or address was invented.
