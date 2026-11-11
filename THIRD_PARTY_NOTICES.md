# Third-party notices

## PlayStation 4 & 5 title data

`public/titles.json` and `src/search.ts` are copied from
[Robfreak/consolecheat-ex1](https://github.com/Robfreak/consolecheat-ex1)
(the Title-ID-Finder). The commit is recorded in `vendor/ex1/PROVENANCE.json`.
`scripts/sync-from-ex1.mjs` refreshes that copy from a local checkout. The
running site does not request that repository.

The title index itself is generated from
[andshrew/PlayStation-Titles](https://github.com/andshrew/PlayStation-Titles).
The upstream commit, license, and generation date are fields in `titles.json`.

Copyright (c) 2022 andshrew

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Disc master versions inside that same file (when present) were collected by
the Title-ID-Finder from public SerialStation title pages. This tool does not
display them. SerialStation is not affiliated with this project.

## PS Plus monthly games

`src/quiz/data/psplus.json` is a snapshot of `public/archive.json` from
[Robfreak/consolecheat-ex2](https://github.com/Robfreak/consolecheat-ex2)
(the PS-Plus-Archiv), commit `0c58ca5ccf57b1f75116a29f965b13bd69bd700f`.
That archive file was generated on 2026-10-22. This snapshot was taken on
2026-11-11. The running site imports the file locally and does not request
that repository.

The monthly lists are PlayStation Wiki monthly-game lists, licensed
CC BY-SA 4.0: <https://playstation.fandom.com/wiki/PlayStation_Plus>.
Those lists cite PlayStation Blog announcements when a row has a reference.
This project did not invent games or months.

## Fonts

Outfit (copyright 2021 The Outfit Project Authors) and Source Sans 3 (copyright Google Inc.) are bundled from the `@fontsource` packages. Both are under the SIL Open Font License 1.1. The license text shipped with the site is `public/FONT-OFL.txt`.
