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
npm run screenshots  # the README's pictures in docs/images/ (3 day stills, cote.png for the side layout, deplie.png unfolded, nuit-anim.png, the night as an animated PNG)
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
├── sky.ts                   # Background: day / night, tariff palette, halo alpha, cloud shadows (CLOUDS); contrast utilities
├── actions.ts               # GestureListener: tap / hold / double_tap → hass-action; default tap = more-info
├── motion.ts                # data-motion on / paused / off: tab, IntersectionObserver, reduced motion, animate
├── flow.ts                  # Pure: the unfolded energy flow: energyFlows (powers → wires), flowView (nodes, rings, levels), flowGeometry (paths, comet keyframes for a width)
├── stars.ts                 # Seeded night sky over the whole card: stars (10 × 6 jittered grid), 3 shooting stars; coveredBy
├── styles/card.ts           # The card's CSS (typography of brief §5.2, sky layers)
├── energy-sky-card.ts       # The card: setConfig, hass, DOM built once, text updated in place
└── energy-sky-card-editor.ts# Editor bundle: ha-form schema in 7 blocks (Production, Battery, Grid, Layout, Cells, Tariff and sky, Actions), config cleaning (palettes are YAML-only)
test/
├── setup.ts                 # jsdom stubs (matchMedia)
├── helpers.ts               # makeHass, the real config (brief §7), annex B readings; mountCard, $, press / tap, actionsOf, measure / unmeasure (fake layout)
├── format.test.ts           # Number formats and state reading
├── model.test.ts            # Grid direction, battery arrows / lock, outage, daily sum, optional metrics
├── sky.test.ts              # Background choice, halo, palette contrast where text sits, stars
├── motion.test.ts           # Pausing rules, the card's data-motion, the stylesheet's animation rules
├── actions.test.ts          # Gestures and the events they fire
├── options.test.ts          # 0.2 options: invert, several production sensors, night hero, cells, validation
├── fit.test.ts              # Hero 56 → 48 → 40 px stepping (layout faked)
├── flow.test.ts             # Flows, levels, node view, geometry, the card with a flow (tap: toggle; always), node taps, in-place updates, its CSS and contrast
├── layout.test.ts           # layout: side: validation, grid size, labels kept, side fit order, its CSS
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

`demo/index.html` runs the built card on sample readings (`demo/scenarios.js`, rendered by `demo/main.js`) with stand-ins for `ha-card` and `ha-icon` (real MDI paths from `demo/icons.js`, generated by `npm run demo:icons`), in a 248 px sections cell (4 rows; `h=184` for 3). Query: `s=bleu,nuit`, `widths=360,304`, `lang=en`, `side` (the side layout, in a 120 px cell), `expand` (flow: tap, unfolded) or `expand=always` (flow: always), `consumers=n` (the first n of the demo's 4 appliances, with expand), `bare` (one card, no chrome: the README screenshots in `docs/images/`), `probe` (motion and overflow report, read by `test:browser`), `seek=ms` (freeze every animation at that time, to screenshot it), `layout` (text positions as fractions of the height, for the contrast test). `demo/shot.sh out.png "s=bleu"` screenshots it (`WINW=1000` for a wider window); `npm run screenshots` (scripts/screenshots.mjs) makes the README's pictures, the animation assembled as an APNG by the script itself (no ffmpeg). Build first.

## Behaviour notes

- An unavailable daily sensor is left out of the sum; with none available the line reads "— kWh produits".
- The battery complement « · SOC atteint » shows when any `battery.soc_reached_entities` entity is on; nothing otherwise. The older names (`battery.lock_entities`, top-level `power_threshold`, `cell_tap`) are gone: `validateConfig` rejects them with the name that replaces them (`RENAMED`).
- `battery.temperature_entity`: the temperature follows the charge in the battery value (« 78 % ↑ · 24 °C », the sensor's unit, rounded); left out without a reading.
- Power entities in kW / MW and energy entities in Wh / MWh are converted from their `unit_of_measurement`.
- `production_entity` is a string or a list (summed by `productionPower`, used by the hero and the halo). `grid.invert` / `battery.invert` flip the sensor's sign (`gridPower`, `batteryPower`).
- Cells (`configuredCells` in model.ts): `cells` if set (≤ 4, built-in kinds deduplicated, free cells keyed `custom-<index>`), else the built-in ones whose entities are set. A free cell's name and icon are user text: written with textContent / setAttribute only. The editor shows them as four slots (`cell_1` … `cell_4`, plus `_entity` / `_name` / `_icon` for a free one) and writes `cells` only when they differ from the automatic choice.
- Cell taps: a cell's own `tap_action` (`{ type, tap_action }` for a built-in cell, `tap_action` on a free one; `CellSpec.tapAction`), else its entity's more-info unless the card has a `tap_action`. Such cells get `data-cell-target` (role button and tabindex unless their action is `none`). The gesture listener passes the event path to `actionsFor`, which answers with the cell's entity and its tap (hold / double tap stay the card's). Editor: `cell_n_tap_action` slots (ui_action), a built-in cell saved as an object only when it has one.
- `getStubConfig` is async (HA awaits it): `stub.ts` reads `energy/get_prefs` in both shapes (grid `flow_from[]` / `power[]`, or `stat_rate` / `power_config`), takes sensors on the meters' devices from `hass.entities`, and sets `battery.invert` when the power is HA's `stat_rate` (positive discharging).
- `night_hero` (consumption / battery) only applies below the horizon and when its entity is set; the context line then starts with the hero's name, shortened when too wide (`data-short-context`).

## Sizing

`getGridOptions()` → 12 × 4 (248 px), min 6 × 3. Default spacing copies the prototype's (roomy, grid anchored to the bottom). One `fitLayout()` serves both layouts (on resize via ResizeObserver, and when the text that decides the layout changes): for the roomy then the compact spacing (`data-compact`, 3 rows / 184 px), for each level of the cells' text, for each hero size (`data-hero`), the first where the hero line and the content don't overflow, the cells' lines too in standard. The text levels (`metricForm` in model.ts, `data-form` on the host when above 0): 0 in full, 1 the short complement (« SOC atteint » → « SOC ✓ »), 2 the tight form where a cell has one (`MetricView.tight`, the battery with a temperature: « 100 % ↓ · -13° ✓ », narrow spaces), 3 no complement (`MetricView.bare`, « 78 % ↑ », side only). The card writes one text per cell (`writeForms`); nothing is stacked and hidden in CSS. In standard, lines still too wide take level 2 and end in an ellipsis; a context line too wide takes its short form (`writeContext`, `data-short-context`). `npm run test:browser` checks that nothing overflows at 304 px (a 320 px phone) in French and English, extreme values included.

### Side layout

`layout: side` (`data-layout="side"` on the host; `getGridOptions()` → 12 × 2, min 6 × 2; `getCardSize()` 2): the same DOM, laid out by CSS as a two-column grid (hero and context on the left, the cells' `.grid` on the right, `max-content` wide, a hairline on its left). Each cell is icon + value; `.label-text` is visually hidden (screen readers), the cell's `title` is its label. The day sky is the gradient from `SIDE_SKY_FROM` (0.45) down (`sideGradientAt`; a `color-mix` first stop), and the halo is `SIDE_HALO`, a 100 px circle centred 30 px above the top left corner: the values reach the card's top, where the full gradient or the usual halo would fail 4.5:1. `fitLayout()` here goes through levels 0–3 and hero sizes 44 / 40 / 36, and the context line shares the left column with the hero: in full on one line, else short on one line, else in full on two lines (line-clamp 2), short if two are too few. `npm run test:browser` checks side cards at 304 / 360 px (`demo ?side`, a 120 px cell).

### Expandable

`flow: tap | always` (0.3.3's `expandable: true` is read as `flow: tap` by `validateConfig`, and saved as `flow` by the editor). `data-flow` on the host, `data-expanded` while the flow shows; `card.expanded` gets / sets it (always true with `always`, set in `setConfig`). With `tap` only: the grabber, and the hero, the context line and the `.panel` carry `data-cell-target` + `data-target-key="toggle"`; `actionsFor` answers them with `toggle` (actions.ts: a tap runs it instead of an action; hold and double tap stay the card's). The hero is the keyboard button (`aria-expanded`). Nodes with an entity (`flowNodeEntity`) open it (key `node:<name>` in `cellTargets`). The card sets its own height: `getGridOptions()` → rows `'auto'`, `.content` is `--esc-top-h` (248 / side 120 px), `.sky` stays that tall (so the gradient, halo, clouds and stars and their contrast tests are unchanged) and the panel sits on `--esc-c2` (night: the night's last colour). The panel (`FLOW_HEIGHT` 220 px): an SVG of wires (paths drawn for the panel's width by `layoutFlow` in `fit()`: `sh` and `gb` straight, the four others S curves between facing edges, `WIRE_INSET` in from a node's end, so the corners stay free, with one `@keyframes esc-flow-<wire>` each in a `<style class="flow-keyframes">`, transform + opacity only) under four HTML nodes. Appliances (`consumers`, ≤ `MAX_CONSUMERS` 4): one below `consumer_threshold` (`DEFAULT_CONSUMER_THRESHOLD` 10 W; 0 shows all) or without a reading is out of the flow (`shown`): `updateFlow` hides it at once, and when the set of shown ones changes the corners are laid out again for those only (`shownConsumers`, each wire's `--esc-flow` set to its place's keyframes). `flowView` gives each its label (name, else friendly_name, else the entity), icon (else the entity's, else `CONSUMER_ICON`), power, `share` of the home and level; `flowGeometry(width, n)` places them in the right corners (i even above the home, odd below): whole nodes when there are ≤ 2 and the corner is ≥ 110 px, else compact (`data-compact` on `.flow`, `COMPACT_WIDTH` 46, name hidden, `title` and `aria-label` carry it), one per corner under 100 px (a phone: the first two). Their wires (`c0`…`c3`, class `use`, keyframes `esc-flow-c<n>`) run from the home; nodes `data-consumer`, `data-idle` under 20 W (the disc dims, the text doesn't), taps via `cellTargets` `consumer:<i>`. Editor: an « Appliances » block shown with a flow, slots `consumer_<n>_entity` / `_name` / `_icon` / `_tap_action`, each slot after a filled one. `energyFlows` balances like the meters (sales: sun, then battery; charge: sun, then grid; the home the rest; each source hands out exactly its power, tested); `flowView` zeroes a battery within `battery.power_threshold`. The grid ↔ battery link (`gb`, dotted while idle; `bg` drawn only while selling, same line) runs down the middle under `sh`, whose `.gap` path in the panel's colour (`--esc-panel`) bridges it. Wire levels 0–4 (`flowLevel`) set width, comet count (1 / 2 / 3) and speed in CSS; comets animate only under motion on / paused, unfolded, on a non-idle wire. The editor turns a numeric `grid_options.rows` into `auto` when `expandable` is set. `npm run test:browser` checks unfolded cards in both layouts (`demo ?expand`).

## Motion

`data-motion` on the host: `on`, `paused` (tab hidden or card off-screen, 100 px margin) or `off` (`animate: false` or `prefers-reduced-motion`). CSS declares animations only under `on` / `paused`; the play state goes through `--esc-play`, because the `animation` shorthand resets a separate `animation-play-state` rule (jsdom can't see that: `npm run test:browser` checks it in Chrome). The halo breathes (3 s alternate = 6 s cycle, opacity ×0.55 ↔ ×1 and 12 % larger at the peak: it breathes down, never above its alpha, to keep the hero's contrast) only by day with production; stars twinkle (2 s alternate = 4 s, opacity ×0.15 ↔ ×1 of the star's own `--esc-o`, scale 0.6 ↔ 1.4) and three shooting stars pass (top right / top left / across the middle, every 11 / 17 / 23 s, each pass the first 8 % of its period) only at night; by day three cloud shadows (dark navy, at most `CLOUD_MAX_ALPHA` 0.2) cross the card (`esc-drift`, a card-wide `.drift` from -110 % to 110 %, 47 / 61 / 73 s): they only darken, so the contrast can only rise (`sky.test.ts` checks it). Stars cover the whole card: `clearText()` (end of `fit()`, and once fonts load) hides each one whose reach (radius at its peak + 3 px) would touch a word, an icon or the hairline; `test:browser` checks none touches text and every quarter has some. Day dots were tried in 0.3.0 and dropped: small bright dots read as stars. The day/night cross-fade (3 s) starts after the first paint (`data-ready`).

## Palettes and contrast

The side layout has its own contrast test (`sky.test.ts`, positions from `?layout&side` at 120 px). The default tariff palettes are the brief's, with the top two stops darkened in OKLCH lightness (Bleu ×0.928, Blanc ×0.907, Rouge ×0.980): the originals failed white-text contrast (Bleu and Blanc for the context line, all three for the hero). `test/sky.test.ts` samples the gradient where each text sits, measured with the demo's `?layout` at 248 px (roomy) and 184 px (compact): values and the context line ≥ 4.5:1, labels (75 % opacity) ≥ 3:1, the hero (large text) ≥ 3:1 with the halo's edge. If the layout moves text, update those positions.

## Conventions

- TypeScript strict. Raw `HTMLElement` with a shadow root, no Lit.
- Update text in place; never rebuild the DOM on a `hass` update. Only re-render when a tracked entity's `last_updated` changed.
- Never put entity data in `innerHTML` without `escapeHtml`.
- Animations: CSS `@keyframes` on `opacity` / `transform` only, paused when hidden or off-screen, none under `prefers-reduced-motion` or `animate: false`.
- Strings: French and English only (`localize.ts`).
- All code here is the project's own. Don't copy code from other projects; third-party material (demo icons only, for now) is listed in `NOTICE.md`.
- Work in the phases of the brief (§9); stop after each one for the user's validation.
