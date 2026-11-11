# Spiele-Merkliste

Standalone backlog and wishlist for PlayStation 4 and PlayStation 5 games, built to sit next to [consolecheat.com](https://consolecheat.com). German is the primary language. English is the other language. The same light and dark theme, self-hosted fonts, footer, Impressum, and Datenschutz as the other consolecheat tools are included. There is no Webmail link.

No account, no tracking, nothing uploaded. The lists stay in this browser under `localStorage` key `consolecheat-ex6-merkliste-v1`. Language and theme use `consolecheat-lang` and `consolecheat-theme`. Fonts are self-hosted, so the page does not call Google or any other third party while it loads. The Impressum fields are placeholders until the operator fills them in. No name or address was invented.

This repository also hosts twelve tools until they have their own repositories. The **Bildschirm-Test** is at `/consolecheat-ex6/bildschirm/`, a temporary home until Lennart creates [Robfreak/consolecheat-ex7](https://github.com/Robfreak/consolecheat-ex7). The **Download-Zeit-Rechner** is at `/consolecheat-ex6/download/`, a temporary home until that calculator has its own repository (ex7 if the screen test has already moved, otherwise ex8). The **Tastenbelegung** is at `/consolecheat-ex6/tasten/`, a temporary home until that reference has its own repository. The **HDR- und Helligkeits-Hilfe** is at `/consolecheat-ex6/hdr/`, a temporary home until that helper has its own repository. The **Audio-Kanal-Test** is at `/consolecheat-ex6/audio/`, a temporary home until that channel check has its own repository. The **USB-Stick-Checkliste** is at `/consolecheat-ex6/usb/`, a temporary home until that checklist has its own repository. The **Reaktions-Duell** is at `/consolecheat-ex6/reaktion/`, a temporary home until that game has its own repository. The **PS-Plus-Quiz** is at `/consolecheat-ex6/quiz/`, a temporary home until that quiz has its own repository. The **Controller-Rhythmus** is at `/consolecheat-ex6/rhythmus/`, a temporary home until that rhythm game has its own repository. The **Speedrun-Timer** is at `/consolecheat-ex6/speedrun/`, a temporary home until that timer has its own repository. The **Pixel-Avatar-Studio** is at `/consolecheat-ex6/avatar/`, a temporary home until that editor has its own repository. The **Couch-Turnier-Planer** is at `/consolecheat-ex6/turnier/`, a temporary home until that planner has its own repository. Move to own repo later. All thirteen footers list the other tools under **Weitere Werkzeuge**. See [Move the screen test to ex7](#move-the-screen-test-to-ex7), [Move the calculator to its own repo](#move-the-calculator-to-its-own-repo), [Move the button layout to its own repo](#move-the-button-layout-to-its-own-repo), [Move the HDR helper to its own repo](#move-the-hdr-helper-to-its-own-repo), [Move the channel test to its own repo](#move-the-channel-test-to-its-own-repo), [Move the USB checklist to its own repo](#move-the-usb-checklist-to-its-own-repo), [Move the reaction duel to its own repo](#move-the-reaction-duel-to-its-own-repo), [Move the quiz to its own repo](#move-the-quiz-to-its-own-repo), [Move the rhythm game to its own repo](#move-the-rhythm-game-to-its-own-repo), [Move the speedrun timer to its own repo](#move-the-speedrun-timer-to-its-own-repo), and [Move the pixel avatar studio to its own repo](#move-the-pixel-avatar-studio-to-its-own-repo), and [Move the couch tournament planner to its own repo](#move-the-couch-tournament-planner-to-its-own-repo).

Expected site: <https://robfreak.github.io/consolecheat-ex6/>

Inoffiziell. Nicht von Sony.

## What it does

- Search with the same Title-ID-Finder index: typos (`god of wr`), partial names, Roman numerals (`gta v`), short aliases (`tlou`), and a title ID (`CUSA07408`).
- Add a game to one of four lists: **Backlog**, **Spiele ich gerade**, **Durch**, **Wunschliste**. An entry stores the title IDs and the name from the catalog, plus a note of at most 280 characters. The same title ID cannot sit twice in one list. Release dates, playtime, and prices are not stored and are rejected on import.
- Move an entry to another list or remove it. With the entry focused: `1` backlog, `2` playing, `3` completed, `4` wishlist, Delete removes it, and the arrow keys move between entries. The same actions are buttons and a select.
- Each entry links to the Title-ID-Finder at `https://robfreak.github.io/consolecheat-ex1/?q=<TITLE_ID>` and to the PS-Plus-Archiv at `https://robfreak.github.io/consolecheat-ex2/?q=<name>`. The archive’s `?q=` filters by name (it also accepts `region`, `platform`, and `year`). A title ID would not match that filter, so the archive link uses the stored name.
- The footer group **Weitere Werkzeuge** (English: **Other tools**) links to the other consolecheat tools: Title-ID-Finder, PS-Plus-Archiv, Controller-Tester, Save-Info-Leser, Fehlercode-Nachschlager, the Bildschirm-Test, the Download-Zeit-Rechner, the Tastenbelegung, HDR/Helligkeit, the Audio-Kanal-Test, the USB-Stick-Checkliste, the Reaktions-Duell, the PS-Plus-Quiz, the Controller-Rhythmus, the Speedrun-Timer, the Pixel-Avatar-Studio, and the Couch-Turnier-Planer. The screen test, the calculator, the button layout, the HDR helper, the channel test, the USB checklist, the reaction duel, the quiz, the rhythm game, the speedrun timer, the pixel avatar studio, and the couch tournament planner include this Merkliste. These are ordinary links. None of the pages requests those sites. Links to pages in this repository use the base path (`/consolecheat-ex6/`, `/consolecheat-ex6/bildschirm/`, `/consolecheat-ex6/download/`, `/consolecheat-ex6/tasten/`, `/consolecheat-ex6/hdr/`, `/consolecheat-ex6/audio/`, `/consolecheat-ex6/usb/`, `/consolecheat-ex6/reaktion/`, `/consolecheat-ex6/quiz/`, `/consolecheat-ex6/rhythmus/`, `/consolecheat-ex6/speedrun/`, `/consolecheat-ex6/avatar/`, `/consolecheat-ex6/turnier/`) so a local preview stays local. On GitHub Pages that is the same place as `https://robfreak.github.io/consolecheat-ex6/`, `https://robfreak.github.io/consolecheat-ex6/bildschirm/`, `https://robfreak.github.io/consolecheat-ex6/download/`, `https://robfreak.github.io/consolecheat-ex6/tasten/`, `https://robfreak.github.io/consolecheat-ex6/hdr/`, `https://robfreak.github.io/consolecheat-ex6/audio/`, `https://robfreak.github.io/consolecheat-ex6/usb/`, `https://robfreak.github.io/consolecheat-ex6/reaktion/`, `https://robfreak.github.io/consolecheat-ex6/quiz/`, `https://robfreak.github.io/consolecheat-ex6/rhythmus/`, `https://robfreak.github.io/consolecheat-ex6/speedrun/`, `https://robfreak.github.io/consolecheat-ex6/avatar/`, and `https://robfreak.github.io/consolecheat-ex6/turnier/`.
- Export writes `spiele-merkliste.json` (`schema` + `version`). Import checks the file strictly. Broken JSON, the wrong schema, the wrong version, a foreign file, a file over 256 KB, and an invalid entry are refused, in German and English, and the current lists stay as they are. A valid file is applied only after **Zusammenführen** or **Ersetzen**. Cancel, Escape, and a click outside the dialog change nothing. Merge keeps a game on its current list and fills a note only when the current note is empty.
- If `localStorage` is full or disabled, the page says so and keeps working until reload. Stored data with a different version, or data that does not parse, is left untouched.

## Run and test

```bash
npm install
npm test        # merkliste, screen test, download calculator, button layout, HDR helper, audio channel test, USB checklist, reaction duel, PS Plus quiz, Controller-Rhythmus, Speedrun-Timer, Pixel-Avatar-Studio, and Couch-Turnier-Planer (draw, bracket, league table, export, storage, i18n, footers)
npm run dev     # merkliste   http://127.0.0.1:5173/consolecheat-ex6/
                # screen test http://127.0.0.1:5173/consolecheat-ex6/bildschirm/
                # download    http://127.0.0.1:5173/consolecheat-ex6/download/
                # buttons     http://127.0.0.1:5173/consolecheat-ex6/tasten/
                # hdr         http://127.0.0.1:5173/consolecheat-ex6/hdr/
                # audio       http://127.0.0.1:5173/consolecheat-ex6/audio/
                # usb         http://127.0.0.1:5173/consolecheat-ex6/usb/
                # reaction    http://127.0.0.1:5173/consolecheat-ex6/reaktion/
                # quiz        http://127.0.0.1:5173/consolecheat-ex6/quiz/
                # rhythm      http://127.0.0.1:5173/consolecheat-ex6/rhythmus/
                # speedrun    http://127.0.0.1:5173/consolecheat-ex6/speedrun/
                # avatar      http://127.0.0.1:5173/consolecheat-ex6/avatar/
                # turnier    http://127.0.0.1:5173/consolecheat-ex6/turnier/
npm run build   # typecheck, Vite build (base /consolecheat-ex6/), offline check of all thirteen pages
npm run preview # http://127.0.0.1:4173/consolecheat-ex6/ , .../bildschirm/ , .../download/ , .../tasten/ , .../hdr/ , .../audio/ , .../usb/ , .../reaktion/ , .../quiz/ , .../rhythmus/ , .../speedrun/ , .../avatar/ , and .../turnier/
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

## Reaktions-Duell

A local reaction game for one or two players. Open it at `/consolecheat-ex6/reaktion/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`. There is no Webmail link.

A PlayStation face symbol (× ○ □ △) appears after a random wait of 1.5 to 4 seconds. Press the matching button as fast as you can. The page shows the time in milliseconds, measured with `performance.now()` from the moment the symbol is shown. Gamepads are polled with `requestAnimationFrame`.

**Fehlstart / false start.** A press before the symbol is visible loses the round for that player. In solo the round is left out of the average and the best time. In a duel the other player gets the point. The first false start decides the round.

**Wrong button.** A press that does not match the symbol is a miss, not a time. In solo the round ends and is left out of the average and the best time. In a duel that player is locked out for the rest of the round, and the other player can still press the right button. If both miss, nobody scores. If nobody answers within 5 seconds, the round is a miss with no time.

**Solo** is 5 rounds, then each time, the average of the valid times, and the best valid time. **Duel** gives the point to the first correct press. First to 3 or first to 5, chosen before the start. The winner screen lists the rounds and the times.

**Einfach / Easy** ignores the symbol. Player 1 is the A key, player 2 is the L key. On a controller any of the four face buttons counts. A press before the signal is still a false start. This is the two-player keyboard option with one key per player. Other keys do not count.

Keyboard, symbol matching: player 1 is W △, A □, S ×, D ○. Player 2 is I △, J □, K ×, L ○, and the arrow keys the same way (up, left, down, right). The mapping is on the page in German and English.

Controllers use the standard mapping: button 0 ×, 1 ○, 2 □, 3 △. The first connected controller is player 1, the second is player 2. Connecting and disconnecting updates the labels. A button that is already held when a controller appears does not count until it is released and pressed again. On a narrow screen the duel also has two tap zones.

Best times stay in this browser under `localStorage` key `consolecheat-reaktion-best-v1` (`version` 1, `solo`, `soloEasy`, `duel`, `duelEasy`, milliseconds, lower is better). Only a correct press is stored. **Bestzeiten zurücksetzen** removes that key and leaves language and theme. The Datenschutz page names the key and Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs. A short Web Audio beep exists, stays off until a click turns it on, and loads no audio file. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`. The Controller-Tester at `https://robfreak.github.io/consolecheat-ex3/` is linked as a related tool. The page does not request it.

### Move the reaction duel to its own repo

Move to own repo later. The game does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, the channel test, or the USB checklist. Copy these paths and drop the cross-links:

- `reaktion/index.html` — its own HTML entry
- `src/reaktion/` — styles, TypeScript, and tests

`src/reaktion/tools.ts` and `src/reaktion/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/reaktion/main.tsx`. If the public URL changes, update the `reaktion` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## PS-Plus-Quiz

A local quiz about the monthly PS Plus games. Open it at `/consolecheat-ex6/quiz/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`. There is no Webmail link.

Questions are a mix. **In welchem Jahr war dieses Spiel bei PS Plus?** offers four years. **In welchem Monat und Jahr?** is the harder form, and the **Schwer** switch makes that the main question. **Welches dieser Spiele war im Monat dabei?** offers four games. Every option is a real title, year, or month from the snapshot. A game that was in more than one year is not asked as a year question, and a game that was in more than one month is not asked as a month question, so the right option is not ambiguous. Distractors are other real rows, never invented.

**Klassisch** is 10 questions. **Endlos** continues until 3 lives are gone. **Zeitdruck** gives each question 15 seconds. A year question or a which-game question is 100 points. A month question is 150. From the second right answer in a row, each further step of the streak adds 25. With the timer on, time left adds up to 50 points. Keys `1`–`4` answer. Enter shows the next question. After an answer, each game in the question is a plain link to the PS-Plus-Archiv at `https://robfreak.github.io/consolecheat-ex2/?q=<title>`. The page does not request that site until the link is clicked.

The result can be drawn to a PNG in this browser (score, streak, mode, consolecheat). **PNG herunterladen** saves the file. **Teilen** uses the Web Share API when the browser can share a file. Nothing is uploaded. Outfit and Source Sans 3 are loaded before the card is drawn.

Best score and best streak stay in this browser under `localStorage` key `consolecheat-quiz-best-v1` (`version` 1, `bestScore`, `bestStreak`). The key is written when a finished run beats one of them. **Bestleistung zurücksetzen** removes that key and leaves language and theme. The Datenschutz page names the key, says the values stay in the browser, and names Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

The monthly rows are a snapshot of [Robfreak/consolecheat-ex2](https://github.com/Robfreak/consolecheat-ex2) `public/archive.json` (the PS-Plus-Archiv), commit `0c58ca5ccf57b1f75116a29f965b13bd69bd700f`. The archive file was generated on 2026-10-22. This copy was taken on 2026-11-11 and is committed at `src/quiz/data/psplus.json`. Games and months are copied from that file. Nothing was invented. The page imports the file locally. It does not fetch another origin for the data. The lists are PlayStation Wiki monthly-game lists, CC BY-SA 4.0. See `THIRD_PARTY_NOTICES.md`.

### Move the quiz to its own repo

Move to own repo later. The quiz does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, the channel test, the USB checklist, or the reaction duel. Copy these paths and drop the cross-links:

- `quiz/index.html` — its own HTML entry
- `src/quiz/` — styles, TypeScript, the data snapshot, and tests

`src/quiz/tools.ts` and `src/quiz/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/quiz/main.tsx`. If the public URL changes, update the `quiz` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## Controller-Rhythmus

A local four-lane rhythm game. Open it at `/consolecheat-ex6/rhythmus/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`. There is no Webmail link.

Lanes run left to right as △ ○ × □. Keyboard: **D F J K** for those four lanes. The arrow keys are the other keyboard mapping and follow the button direction: up △, right ○, down ×, left □. A standard gamepad uses button 0 ×, 1 ○, 2 □, 3 △. D-pad buttons 12 up, 13 down, 14 left, and 15 right hit the same lanes. On a narrow screen, tap a lane. The mapping is on the page.

**Leicht**, **Mittel**, and **Schwer** change the note density and how fast the notes move. Perfect is within ±45 ms and scores 300. Gut is within ±100 ms and scores 100. After that the note is Verpasst. Each note already in the combo adds 10 points on Perfect and 5 on Gut. A miss sets the combo to 0. The page shows the score, the accuracy (the share of notes that were Perfect or Gut), the combo, and the best combo.

Nachtmarkt, Neonbahn, and Hafenlicht last about 69 to 87 seconds. Drums, bass, and a lead are synthesized in the browser. No audio file is loaded. The chart for a song and a difficulty comes from a fixed seed, so the same pair always has the same notes. Timing uses `AudioContext.currentTime`, not `setTimeout`. Sound starts only after a click on **Start** or **Takt antippen**. Esc pauses. Esc again, or Weiter, continues. **Beenden** leaves without storing a result.

The offset slider runs from −200 ms to 200 ms. A positive offset means the taps are late, and the judgement shifts to meet them. **Takt antippen** plays eight clicks. Taps near those clicks set the offset. The offset and the best score for each song and difficulty stay in this browser under `localStorage` key `consolecheat-rhythmus-v1` (`version` 1, `offsetMs`, `scores`). **Bestleistungen zurücksetzen** removes that key and leaves language and theme. The Datenschutz page names the key, says the values stay in the browser, and names Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`. The Controller-Tester at `https://robfreak.github.io/consolecheat-ex3/` is linked as a related tool. The page does not request it.

`prefers-reduced-motion` keeps the notes moving, because that is how you see the timing, and drops the hit flash, the glow, and the combo pop.

To try it: `npm run dev`, open `http://127.0.0.1:5173/consolecheat-ex6/rhythmus/`, and click **Start**. The browser stays silent until that click. Then play with D F J K.

### Move the rhythm game to its own repo

Move to own repo later. The game does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, the channel test, the USB checklist, the reaction duel, or the quiz. Copy these paths and drop the cross-links:

- `rhythmus/index.html` — its own HTML entry
- `src/rhythmus/` — styles, TypeScript, and tests

`src/rhythmus/tools.ts` and `src/rhythmus/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/rhythmus/main.tsx`. If the public URL changes, update the `rhythmus` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## Speedrun-Timer

A local LiveSplit-style timer with splits. Open it at `/consolecheat-ex6/speedrun/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`. There is no Webmail link.

The big clock is monospace. The split table shows the segment, the cumulative time, and the delta against the personal best. Green means ahead, red means behind. A gold badge is a new best segment. The page also shows Sum of Best, the best possible time for this attempt, and the previous segment’s delta.

Time is `performance.now()` minus the start timestamp (`elapsed = now - start`). It is not a sum of intervals, so a background tab stays correct. The digits update with `requestAnimationFrame`. `visibilitychange` only redraws.

**Space** starts or sets a split. **Backspace** or **U** undoes a split. **S** skips a split. **R** resets, and asks first when the run is still going or when resetting would drop an unsaved gold or a faster personal best. **P** pauses. Space is a character while a text field is focused. A standard controller, polled on the animation frame with edge detection: **×** (button 0) starts or splits, **□** (button 2) undoes, **○** (button 1) skips, **Options** (button 9) resets. The same actions are buttons.

Splits and run profiles (game and category) can be created, renamed, reordered, and deleted only while the timer is not running. Reordering, adding, or deleting a split clears the personal best. Gold stays on that split. On a finish, best segments are always updated. If the run is faster, the page offers to save it as the personal best. The attempt counter increases when a run starts.

Profiles, personal bests, gold segments, and attempts stay in this browser under `localStorage` key `consolecheat-speedrun-v1` (`schema` `consolecheat-speedrun`, `version` 1, `activeProfileId`, `profiles`). The live attempt is not stored. **JSON exportieren** downloads `speedrun-timer.json`. **JSON importieren** checks the file. Broken JSON, the wrong schema, the wrong version, a file that does not match the shape, and a file over 256 KB are refused, in German and English, and the current profiles stay as they are. The Datenschutz page names the key, says the values stay in the browser, and names Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs. **Alle Daten in diesem Browser löschen** removes that key together with `consolecheat-lang` and `consolecheat-theme`. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

`prefers-reduced-motion` drops transitions and animation. The clock still updates, because that is the timer. Split results are announced in an `aria-live` region.

To try it: `npm run dev`, open `http://127.0.0.1:5173/consolecheat-ex6/speedrun/`, and press **Space**.

### Move the speedrun timer to its own repo

Move to own repo later. The timer does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, the channel test, the USB checklist, the reaction duel, the quiz, or the rhythm game. Copy these paths and drop the cross-links:

- `speedrun/index.html` — its own HTML entry
- `src/speedrun/` — styles, TypeScript, and tests

`src/speedrun/tools.ts` and `src/speedrun/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/speedrun/main.tsx`. If the public URL changes, update the `speedrun` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

## Pixel-Avatar-Studio

A local 64×64 pixel editor. Open it at `/consolecheat-ex6/avatar/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`. There is no Webmail link. Fonts are the self-hosted Outfit and Source Sans 3 files. The page does not call a third party.

The canvas is 64×64 and scales with `image-rendering: pixelated`, so the pixels stay crisp, including on a 390px-wide screen. **Passend** fits the column. **4×**, **8×**, and **12×** are larger integer zooms that still stay inside the width of the page. **Raster** draws a grid on top of the canvas. The grid is not part of the export. A checkerboard shows transparent pixels.

**B** pencil, **E** eraser (transparent), **G** fill, **I** eyedropper, **X** swaps the current color and the secondary color. The same tools are buttons. Fill is 4-neighbour and iterative. Pencil, eraser, and fill work with mouse, pen, and touch: the canvas uses Pointer Events, captures the pointer, and draws the straight pixels between moves so a fast stroke has no gaps. `touch-action: none` on the canvas keeps the page from scrolling while you draw. **Symmetrie** mirrors the stroke across the vertical center while you draw.

**Horizontal spiegeln** and **Vertikal spiegeln** flip the whole image. **Rückgängig** is Ctrl+Z or Cmd+Z. **Wiederholen** is Ctrl+Y or Ctrl+Shift+Z (Cmd+Shift+Z too). Each stroke, fill, flip, clear, or import is one history entry. The stack keeps 100 entries. **Leeren** asks first.

**PNG 64**, **PNG 256**, **PNG 512**, and **PNG 1024** download `consolecheat-avatar-64.png` and the same name with the other sizes. 64×64 keeps the transparent background. The larger files are the same pixels, nearest-neighbour, with no smoothing. The 64×64 file fits the Avatar Adder. This repository has no Avatar Adder page, so the name is only mentioned. **PNG importieren** reads a local image and scales it to 64×64 with nearest neighbour.

The draft stays in this browser under `localStorage` key `consolecheat-avatar-v1` (`version` 1, `pixels`, `palette`, `color`, `secondary`, `tool`, `grid`, `symmetry`, `zoom`, `recent`). `pixels` is a run-length string: runs separated by commas, each run `COUNT:PAYLOAD`. `PAYLOAD` is `0` for a fully transparent pixel, or 8 hex digits `RRGGBBAA`. The runs cover exactly 4096 pixels. A missing key is not created until you draw or change a setting. A value that does not parse, or a different version, falls back to an empty canvas and does not crash. **Entwurf zurücksetzen** removes only `consolecheat-avatar-v1`. Language (`consolecheat-lang`) and appearance (`consolecheat-theme`) stay. The Datenschutz page names the key, says the pixels stay in the browser, and names Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

`prefers-reduced-motion` drops transitions and animation. Buttons expose their shortcuts, and the canvas has an accessible name.

To try it: `npm run dev`, open `http://127.0.0.1:5173/consolecheat-ex6/avatar/`, and draw with the pencil. **B** **E** **G** **I** **X**, Ctrl+Z, Ctrl+Y.

### Move the pixel avatar studio to its own repo

Move to own repo later. The editor does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, the channel test, the USB checklist, the reaction duel, the quiz, the rhythm game, or the speedrun timer. Copy these paths and drop the cross-links:

- `avatar/index.html` — its own HTML entry
- `src/avatar/` — styles, TypeScript, and tests

`src/avatar/tools.ts` and `src/avatar/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/avatar/main.tsx`. If the public URL changes, update the `avatar` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

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


## Couch-Turnier-Planer

A local knockout or league planner for a couch evening. Open it at `/consolecheat-ex6/turnier/`. German is the default. English is the other language. Light and dark follow `consolecheat-theme`. There is no Webmail link. Fonts are the self-hosted Outfit and Source Sans 3 files. The page does not call a third party.

Enter a tournament name and 2 to 16 player names. Add, remove, and rename them. The same name twice, ignoring case and extra spaces, is refused. Choose **K.-o.** (single elimination) or **Liga** (round robin). A league can add a return leg (**Hin- und Rückrunde**). League points default to 3 for a win, 1 for a draw, and 0 for a loss, and the three numbers can be changed before the draw.

**Auslosen** shuffles with `crypto.getRandomValues` (Fisher–Yates). **Neu auslosen** is there until the first result is saved. Knockout pads the field to the next power of two. Byes (**Freilos**) are spread so a bye never plays a bye, and that player moves on without a score. Tap or click a match to enter the score. A draw is refused in knockout. Changing an earlier result asks before it clears later matches whose players changed, then those matches are recalculated. The bracket scrolls sideways on a narrow screen.

A league is scheduled with the circle method, one matchday at a time. An odd number of players gets one bye each matchday. Scores can be entered or edited at any time, including draws. The table columns are Sp, S, U, N, Tore, Diff, and Pkt. It sorts by points, then goal difference, then goals scored, then the head-to-head among the tied players, then the name.

When the final has a winner, or every league match has a score, the page names the winner. Confetti is drawn on a canvas and stays off when `prefers-reduced-motion` is set. **PNG speichern** draws the bracket or the table in the browser and downloads `consolecheat-turnier.png`.

The current tournament stays in this browser under `localStorage` key `consolecheat-turnier-v1` (`version` 1, `name`, `mode`, `doubleRound`, `points`, `players`, `phase`, `order`, `scores`). A missing key is not created until you change the tournament. A value that does not parse, or a different version, falls back to an empty setup and does not crash. **Neues Turnier** and the button on the Datenschutz page remove only `consolecheat-turnier-v1`. Language (`consolecheat-lang`) and appearance (`consolecheat-theme`) stay. The Datenschutz page names the key, says the tournament stays in the browser, and names Art. 6 Abs. 1 lit. f DSGVO for the host’s connection logs. The page does not read `consolecheat-ex6-merkliste-v1` or `consolecheat-bildschirm-pattern`.

Fields are labelled. Results are announced in an `aria-live` region. Buttons and inputs keep a visible focus ring.

To try it: `npm run dev`, open `http://127.0.0.1:5173/consolecheat-ex6/turnier/`, enter two names, and click **Auslosen**.

### Move the couch tournament planner to its own repo

Move to own repo later. The planner does not import the Merkliste, the screen test, the calculator, the button layout, the HDR helper, the channel test, the USB checklist, the reaction duel, the quiz, the rhythm game, the speedrun timer, or the pixel avatar studio. Copy these paths and drop the cross-links:

- `turnier/index.html` — its own HTML entry
- `src/turnier/` — styles, TypeScript, and tests

`src/turnier/tools.ts` and `src/turnier/tool-links.tsx` are copies of the Merkliste files. Point the new project's Vite `base` at its own project path, and keep the self-hosted `@fontsource` imports in `src/turnier/main.tsx`. If the public URL changes, update the `turnier` href in the shared tool list. Also remove the Datenschutz sentence that names `consolecheat-ex6-merkliste-v1`; that sentence is only true while the page lives here.

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
