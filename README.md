# Spiele-Merkliste

Standalone backlog and wishlist for PlayStation 4 and PlayStation 5 games, built to sit next to [consolecheat.com](https://consolecheat.com). German is the primary language. English is the other language. The same light and dark theme, self-hosted fonts, footer, Impressum, and Datenschutz as the other consolecheat tools are included. There is no Webmail link.

No account, no tracking, nothing uploaded. The lists stay in this browser under `localStorage` key `consolecheat-ex6-merkliste-v1`. Language and theme use `consolecheat-lang` and `consolecheat-theme`. Fonts are self-hosted, so the page does not call Google or any other third party while it loads. The Impressum fields are placeholders until the operator fills them in. No name or address was invented.

Expected site: <https://robfreak.github.io/consolecheat-ex6/>

Inoffiziell. Nicht von Sony.

## What it does

- Search with the same Title-ID-Finder index: typos (`god of wr`), partial names, Roman numerals (`gta v`), short aliases (`tlou`), and a title ID (`CUSA07408`).
- Add a game to one of four lists: **Backlog**, **Spiele ich gerade**, **Durch**, **Wunschliste**. An entry stores the title IDs and the name from the catalog, plus a note of at most 280 characters. The same title ID cannot sit twice in one list. Release dates, playtime, and prices are not stored and are rejected on import.
- Move an entry to another list or remove it. With the entry focused: `1` backlog, `2` playing, `3` completed, `4` wishlist, Delete removes it, and the arrow keys move between entries. The same actions are buttons and a select.
- Each entry links to the Title-ID-Finder at `https://robfreak.github.io/consolecheat-ex1/?q=<TITLE_ID>` and to the PS-Plus-Archiv at `https://robfreak.github.io/consolecheat-ex2/?q=<name>`. The archive’s `?q=` filters by name (it also accepts `region`, `platform`, and `year`). A title ID would not match that filter, so the archive link uses the stored name.
- Export writes `spiele-merkliste.json` (`schema` + `version`). Import checks the file strictly. Broken JSON, the wrong schema, the wrong version, a foreign file, a file over 256 KB, and an invalid entry are refused, in German and English, and the current lists stay as they are. A valid file is applied only after **Zusammenführen** or **Ersetzen**. Cancel, Escape, and a click outside the dialog change nothing. Merge keeps a game on its current list and fills a note only when the current note is empty.
- If `localStorage` is full or disabled, the page says so and keeps working until reload. Stored data with a different version, or data that does not parse, is left untouched.

## Run and test

```bash
npm install
npm test        # lists, storage, import/export, search
npm run dev     # http://127.0.0.1:5173/consolecheat-ex6/
npm run build   # typecheck, Vite build (base /consolecheat-ex6/), offline check
npm run preview # http://127.0.0.1:4173/consolecheat-ex6/
```

Node `>=22.6` (`package.json` `engines`). The test runner is `node --experimental-strip-types --test`.

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
