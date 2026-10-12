# Contributing to DryRun

Thanks for helping. This is a plain static site on purpose: HTML + CSS +
vanilla JS, no build step for development, no backend, no dependencies at
runtime. Please keep it that way. Small, focused pull requests are easier to
review than big ones.

## Setup

```bash
git clone https://github.com/1mystic/DryRun.git
cd DryRun
python3 -m http.server 8000      # open http://localhost:8000
```

No install step. If a check needs `jsdom`, install it locally with
`npm i jsdom` (it is only used by `tools/smoke.js`, never shipped).

## Ways to contribute

* **New problems**: add a record to `js/data/pN.js` and its slug to a track
  in `js/data/tracks.js`. Both code variants must pass the embedded tests.
* **Better traces**: improve a weak `viz` (hand-written `flow` or a sim in
  `js/sims.js`). Every frame must render without errors.
* **UI and copy**: the theme is dark first, cream ink, volt lime accent, hard
  offset shadows. Match it. Avoid em dashes in user facing copy, use commas,
  colons or hyphens. Icons are inline Lucide style SVG, no icon fonts or CDN.
* **Docs**: README, guides (`#/anki`, `#/data`), this file.

## Rules that matter

1. **Offline first.** No runtime CDN, no fonts that break without network,
   no fetch on page load. The Google Fonts link must keep its offline fallback.
2. **No frameworks.** Vanilla JS only, same IIFE + `window.*` namespace style
   as the existing files (`DR`, `DRAPP`, `HL`, `SIMS`, `Viz`, `Anki`, `AI`,
   `DRUI`).
3. **Data files use `String.raw`.** Problem code must not contain backticks or
   `${`. Python annotations use trailing `#?` (slow line, red) and `#!`
   (key line, green); JS uses `//?` and `//!`.
4. **Accessibility.** Buttons need labels, dialogs need a close path and
   backdrop/Esc dismissal, custom controls need keyboard support like the
   existing dropdown does. Respect `prefers-reduced-motion`.
5. **External links** open in a new tab with `rel="noopener"`.

## Before you push

Run everything and keep it green:

```bash
for f in js/*.js js/data/*.js tools/*.js; do node --check "$f" || break; done
node tools/dump.js > /tmp/opencode/dr.json && python3 tools/check.py /tmp/opencode/dr.json
node tools/checkjs.js
node tools/frames.js
npm i jsdom --no-save && node tools/smoke.js
python3 tools/bundle.py
```

What they cover: syntax, both variants of every Python problem (206 runs),
both variants of every JS problem (28 runs), all 117 frame sets, every route
plus dropdowns/tabs/morph/race/AI retry/Anki in a headless browser, and the
single file build. Then commit `dist/dryrun.html` alongside source changes:

```bash
git add -A && git commit -m "Short summary of the change" && git push
```

## Pull requests

* One feature or fix per PR, with the checks above passing.
* Describe what you changed, which pages it touches, and what you clicked to
  verify. Screenshots help for visual changes (desktop and one phone width).
* Bug reports: include the route (for example `#/p/lru-cache`), browser,
  and what you expected. The issue templates ask for the same.

## Project map

`index.html` shell and views, `css/style.css` theme, `js/app.js` router and
pages, `js/viz.js` player, `js/sims.js` simulators, `js/hl.js` highlighting
plus the `DRUI` dropdown, `js/anki.js`, `js/ai.js`, `js/data/` the library,
`assets/` README art, `tools/` checks, `dist/` the generated single file.
