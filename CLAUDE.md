# CLAUDE.md

Map of the code for Claude Code and anyone working here.

## The project

Energy Sky Card is a Home Assistant dashboard card (Marketplace / HACS category "Dashboard", `plugin`) that shows solar production, battery and grid on a background carrying information: the EDF Tempo colour by day, a starry sky by night. Specification: `BRIEF-energy-sky-card.md` (kept local, not committed; the source of truth, in French).

## Commands

```bash
npm install
npm run build        # the two bundles, written to the repository root
npm run dev          # rebuild on change
npm run type-check   # tsc --noEmit, strict
npm test             # Vitest, once (build first: test/build.test.ts checks the bundle)
npm run test:browser # headless Chrome: animations pause off-screen, none under reduced motion, no overflow, sky off text (also in CI)
npm run screenshots  # the README's pictures in docs/images/ (4 stills + nuit-anim.png, an animated PNG)
npm run test:coverage
```

## How it ships

- **Two bundles**, IIFE, minified, es2020 (`esbuild.config.js`):
  - `energy-sky-card.js`: the card, the only dashboard resource. Budget: < 30 KB gzip (tested).
  - `energy-sky-card-editor.js`: the visual editor, loaded the first time the editor opens (`loadEditorBundle` in `src/bundles.ts`, which keeps the `?v=` / `?hacstag=` cache buster).
- **The name** lives in `src/constants.ts` (`CARD_NAME`). `esbuild.config.js` reads it from there to name the bundles. The version comes from `package.json` (`__VERSION__`).
- **No runtime network requests, no GSAP, no `@mdi/js`.** Icons are `<ha-icon>`.
- Bundles are committed (installs from the branch get them).

## Source map

```
src/
├── constants.ts             # Name, version, URLs: the one place to rename the card
├── types.ts                 # Home Assistant types and the card's config
├── bundles.ts               # Loads the editor bundle from beside the main one
├── stub.ts                  # getStubConfig: Energy dashboard prefs (energy/get_prefs) + same-device sensors, Tempo, sun
├── utils.ts                 # escapeHtml, numeric states, W / kWh unit conversion
├── localize.ts              # FR / EN strings, language, decimal separator
├── format.ts                # W / kW, kWh, V, % formatting; "—" for no reading
├── model.ts                 # Pure: config + hass → view (hero, context, metrics), tracked entities
├── sky.ts                   # Background: day / night, tariff palette, halo alpha; contrast utilities
├── actions.ts               # GestureListener: tap / hold / double_tap → hass-action; default tap = more-info
├── motion.ts                # data-motion on / paused / off: tab, IntersectionObserver, reduced motion, animate
├── stars.ts                 # Seeded particles over the whole card: stars (10 × 6 jittered grid, 3 shooting stars), day motes (8 × 5); coveredBy
├── styles/card.ts           # The card's CSS (typography of brief §5.2, sky layers)
├── energy-sky-card.ts       # The card: setConfig, hass, DOM built once, text updated in place
└── energy-sky-card-editor.ts# Editor bundle: ha-form schema in 5 blocks, config cleaning (palettes are YAML-only)
test/
├── setup.ts                 # jsdom stubs (matchMedia)
├── helpers.ts               # makeHass, the real config (brief §7), annex B readings
├── format.test.ts           # Number formats and state reading
├── model.test.ts            # Grid direction, battery arrows / lock, outage, daily sum, optional metrics
├── sky.test.ts              # Background choice, halo, palette contrast where text sits, stars
├── motion.test.ts           # Pausing rules, the card's data-motion, the stylesheet's animation rules
├── actions.test.ts          # Gestures and the events they fire
├── options.test.ts          # 0.2 options: invert, several production sensors, night hero, cells, validation
├── fit.test.ts              # Hero 56 → 48 → 40 px stepping (layout faked)
├── editor.test.ts           # Schema blocks, labels, config-changed, YAML kept short, palettes kept
├── card.test.ts             # Registration, validation, render, in-place updates, background, sizing, stub
├── bundles.test.ts          # Sibling bundle URLs
├── stub.test.ts             # Prefill from the Energy dashboard (both prefs shapes), Tempo, fallback
└── build.test.ts            # Bundle size and no network
```

## Releases

- `CHANGELOG.md`: a line per user-visible change.
- Release: bump `version` in `package.json` (and the `?v=` in the README), `npm run build`, commit, then push a tag `vX.Y.Z`. `.github/workflows/release.yml` checks the tag matches, builds, tests and publishes a release with the two bundles attached, which is what the Marketplace / HACS install (`hacs.json` → `filename: energy-sky-card.js`).
- `.github/workflows/ci.yml` fails if the committed bundles don't match a fresh build: commit the rebuilt files with every source change.
- `.github/workflows/validate.yml` runs HACS's validation (category `plugin`).

## Local demo

`demo/index.html` runs the built card on sample readings (`demo/scenarios.js`, rendered by `demo/main.js`) with stand-ins for `ha-card` and `ha-icon` (real MDI paths from `demo/icons.js`, generated by `npm run demo:icons`), in a 248 px sections cell (4 rows; `h=184` for 3). Query: `s=bleu,nuit`, `widths=360,304`, `lang=en`, `bare` (one card, no chrome: the README screenshots in `docs/images/`), `probe` (motion and overflow report, read by `test:browser`), `seek=ms` (freeze every animation at that time, to screenshot it), `layout` (text positions as fractions of the height, for the contrast test). `demo/shot.sh out.png "s=bleu"` screenshots it; `npm run screenshots` (scripts/screenshots.mjs) makes the README's pictures, the animation assembled as an APNG by the script itself (no ffmpeg). Build first.

## Behaviour notes

- An unavailable daily sensor is left out of the sum; with none available the line reads "— kWh produits".
- The battery complement « · SOC atteint » shows when any `battery.soc_reached_entities` entity is on; nothing otherwise. The 0.1.0 names (`battery.lock_entities`, top-level `power_threshold`, now `battery.power_threshold`) are moved by `normalizeConfig` (model.ts), in the card and in the editor (which saves the new name).
- `battery.temperature_entity`: the temperature follows the charge in the battery value (« 78 % ↑ · 24 °C », the sensor's unit, rounded); left out without a reading.
- Power entities in kW / MW and energy entities in Wh / MWh are converted from their `unit_of_measurement`.
- `production_entity` is a string or a list (summed by `productionPower`, used by the hero and the halo). `grid.invert` / `battery.invert` flip the sensor's sign (`gridPower`, `batteryPower`).
- Cells (`configuredCells` in model.ts): `cells` if set (≤ 4, built-in kinds deduplicated, free cells keyed `custom-<index>`), else the built-in ones whose entities are set. A free cell's name and icon are user text: written with textContent / setAttribute only. The editor shows them as four slots (`cell_1` … `cell_4`, plus `_entity` / `_name` / `_icon` for a free one) and writes `cells` only when they differ from the automatic choice.
- Cell taps (`cell_tap`, `cellTapOpensEntity` / `cellEntity` in model.ts): `auto` opens the cell's entity unless the card has a `tap_action`; a cell that does gets `data-cell-target`, role button, tabindex. The gesture listener passes the event path to `actionsFor`, which answers with the cell's entity and no tap_action (hold / double tap stay the card's).
- `getStubConfig` is async (HA awaits it): `stub.ts` reads `energy/get_prefs` in both shapes (grid `flow_from[]` / `power[]`, or `stat_rate` / `power_config`), takes sensors on the meters' devices from `hass.entities`, and sets `battery.invert` when the power is HA's `stat_rate` (positive discharging).
- `night_hero` (consumption / battery) only applies below the horizon and when its entity is set; the context line then starts with the hero's name, shortened when too wide (`data-short-context`).

## Sizing

`getGridOptions()` → 12 × 4 (248 px), min 6 × 3. Default spacing copies the prototype's (roomy, grid anchored to the bottom); `fit()` (on resize via ResizeObserver, and when the hero text changes) tries the roomy spacing with the hero at 56 / 48 / 40 px (`data-hero`), then the compact spacing (`data-compact`, for 3 rows / 184 px) at the same sizes, keeping the first where the hero line and the content don't overflow. A metric line still too wide switches the complements to their short form (`data-short-extra`: « SOC atteint » → « SOC ✓ »); still too wide, a cell with a tight form (`MetricView.tight`, the battery with a temperature) uses it (`data-tight-extra`: « 100 % ↓ · -13° ✓ », narrow spaces). Other lines end in an ellipsis. `npm run test:browser` checks that nothing overflows at 304 px (a 320 px phone) in French and English, extreme values included.

## Motion

`data-motion` on the host: `on`, `paused` (tab hidden or card off-screen, 100 px margin) or `off` (`animate: false` or `prefers-reduced-motion`). CSS declares animations only under `on` / `paused`; the play state goes through `--esc-play`, because the `animation` shorthand resets a separate `animation-play-state` rule (jsdom can't see that: `npm run test:browser` checks it in Chrome). The halo breathes (3 s alternate = 6 s cycle, opacity ×0.55 ↔ ×1 and 12 % larger at the peak: it breathes down, never above its alpha, to keep the hero's contrast) only by day with production; stars twinkle (2 s alternate = 4 s, opacity ×0.15 ↔ ×1 of the star's own `--esc-o`, scale 0.6 ↔ 1.4) and three shooting stars pass (top right / top left / across the middle, every 11 / 17 / 23 s, each pass the first 8 % of its period) only at night; by day motes of sunlight drift 3 px and glow (`esc-float`, 5 s alternate, a per-mote duration inline, brighter with `--esc-halo-alpha`). Stars and motes cover the whole card: `clearText()` (end of `fit()`, and once fonts load) hides each one whose reach (radius at its peak + drift + 3 px) would touch a word, an icon or the hairline. No particle sits behind text, so the contrast test stays the background's alone; `test:browser` checks none touches text and every quarter has some. The day/night cross-fade (3 s) starts after the first paint (`data-ready`).

## Palettes and contrast

The default tariff palettes are the brief's, with the top two stops darkened in OKLCH lightness (Bleu ×0.928, Blanc ×0.907, Rouge ×0.980): the originals failed white-text contrast (Bleu and Blanc for the context line, all three for the hero). `test/sky.test.ts` samples the gradient where each text sits, measured with the demo's `?layout` at 248 px (roomy) and 184 px (compact): values and the context line ≥ 4.5:1, labels (75 % opacity) ≥ 3:1, the hero (large text) ≥ 3:1 with the halo's edge. If the layout moves text, update those positions.

## Conventions

- TypeScript strict. Raw `HTMLElement` with a shadow root, no Lit.
- Update text in place; never rebuild the DOM on a `hass` update. Only re-render when a tracked entity's `last_updated` changed.
- Never put entity data in `innerHTML` without `escapeHtml`.
- Animations: CSS `@keyframes` on `opacity` / `transform` only, paused when hidden or off-screen, none under `prefers-reduced-motion` or `animate: false`.
- Strings: French and English only (`localize.ts`).
- All code here is the project's own. Don't copy code from other projects; third-party material (demo icons only, for now) is listed in `NOTICE.md`.
- Work in the phases of the brief (§9); stop after each one for the user's validation.
