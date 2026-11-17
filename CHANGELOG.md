# Changelog

## [Unreleased]

- **Breaking:** the older option names are no longer read: top-level `power_threshold` (use `battery.power_threshold`), `battery.lock_entities` (use `battery.soc_reached_entities`) and `cell_tap` (give each cell its own `tap_action`). A card that still has one shows an error that says what to use instead.
- Internal: one text per cell instead of stacked forms hidden by CSS, one fit for both layouts, table-driven validation, shared test helpers. Nothing changes on screen.

- The unfolded flow's outer wires now run inside: each joins the edges that face each other (the sun's top to the grid's bottom, the battery's top to the home's bottom…) with an S curve between the rows, leaving the four corners free. The flow is 20 px taller, so the curves have room.
- Editor: no help under Layout, and a shorter one under the unfolding switch.

## [0.3.3] — 2026-11-17

- `expandable: true` (« Déplier en touchant le grand chiffre » in the editor's Cells block): a tap on the big number or its line unfolds the energy flow under the card, in both layouts. The sun on the left, the home on the right, the grid above, the battery below, joined by curved wires, and the grid ↔ battery link down the middle (bridged under the sun → home wire) for an off-peak charge or a battery selling. The flows balance like the meters: sales come from the sun first, then the battery; the battery's charge from the sun first, then the grid; the home gets the rest; a battery within its `power_threshold` idles. Their colour says where the energy comes from, their width and comets how much. Each node shows its power with the card's signs, a ring (production against `production_max`, the battery's charge, the home's sources), and opens its entity on a tap. The home is `consumption_entity`, or worked out. The card then sets its own height (rows "auto"); the comets move on `transform` only and stop when folded, off-screen or without motion.

- A second layout, `layout: side` (« Côté » in the editor's Cells block): the big number and its line on the left, the cells on the right as icon + value, one line each, in 2 rows (120 px) instead of 4. The cell's name stays for screen readers and shows on hover. Its sky is the lower part of the tariff gradient and its halo glows above the big number, away from the values, so white text keeps its contrast. On a narrow card the complements shorten, then go (« 78 % ↑ »), the big number steps 44 → 40 → 36 px, and the line under it may take two lines. `standard` stays the default.

## [0.3.2] — 2026-11-15

- Each cell takes its own tap action (more-info, navigate, url, perform-action, none…), chosen in the editor's Cells block (« Appui sur la case ») or with `tap_action` in YAML: a built-in cell is then written `{ type: grid, tap_action: … }`. Without one, a tap opens the cell's entity unless the card has a `tap_action`, as in 0.3.1. `cell_tap` (0.3.1) leaves the editor and the docs; it is still read.

## [0.3.1] — 2026-11-15

- By day, cloud shadows drift slowly across the card instead of the motes of sunlight, which read as stars. They only darken the sky, so the text keeps its contrast; a cloud passing over the halo dims it.
- Added from the card picker, the card fills itself in from the Energy dashboard: production, battery and grid power, and the sensors on the same devices (charge, temperature, voltage, energy today, tomorrow's forecast), with the battery's sign flipped when the power comes from Home Assistant's own convention; and today's Tempo colour.
- `cell_tap`: a tap on a cell opens its entity (Battery → its charge, Grid → its power…). `auto` (the default) does so unless the card has a `tap_action`, which then applies everywhere, as before; `more-info` always, `card` never. Cells that open their entity are buttons for the keyboard too.
- README: up-to-date pictures, the night as an animation. The browser checks run in CI and before each release.

## [0.3.0] — 2026-11-15

- The sky fills the whole card: stars across all of it at night (thinner and dimmer towards the bottom), where they were held in the top-right quarter; the card hides only the ones that would touch text, measured after each layout.
- Three shooting stars at night instead of one, each on its own path (top right, top left, across the middle) and rhythm (11, 17, 23 s).
- By day, motes of sunlight across the card drift and glow slowly, brighter with production. Like the stars, none sits behind text, so the contrast is unchanged.

## [0.2.1] — 2026-11-15

- `battery.temperature_entity`: the battery's temperature after its charge, « 78 % ↑ · 24 °C » (also in the editor's Battery block). On a cell too narrow, « 100 % ↓ · -13° ✓ ».

## [0.2.0] — 2026-11-15

- `battery.invert` and `grid.invert`, for sensors that are positive when discharging or exporting.
- `production_entity` takes a list: several production sensors summed (hero and halo), an unavailable one left out.
- `night_hero`: at night the big number can show the home's consumption (`consumption_entity`) or the battery's charge, named on the line below (« Consommation · 7,2 kWh produits », « Conso. » on a narrow card).
- `cells`: choose and order up to 4 bottom cells, among the built-in ones (a new `consumption` one included) and free cells for any entity, with a name and icon. In the editor: a « Cases » block with four slots.
- Battery: `power_threshold` (the ↑ / ↓ arrows' threshold) moves into `battery`, and into the editor's Battery block. The top-level option still works.
- Battery: the option `battery.lock_entities` is now `battery.soc_reached_entities` (the old name still works; the visual editor saves the new one), with a help line in the editor and an example in the README.
- Battery: « · SOC atteint » (EN « SOC reached ») when one of those entities is on, instead of « figée »; nothing instead of « libre ». On a card too narrow for it (320 px phone), it shortens to « · SOC ✓ ».
- Livelier animations: the halo breathes deeper and faster (6 s, fading to 55 % and growing 12 %, never brighter than before), stars twinkle wider (opacity and size) and 14 of them instead of 10, and a shooting star crosses the night sky every 11 s.

## [0.1.1] — 2026-11-15

- The prototype's spacing: more air around the hero, the « kWh produits » line and the metrics, which stay anchored to the bottom. The card now takes 4 rows (248 px); at 3 rows it switches to a compact spacing.
- A word space between the value and its unit (« 1,3 kW »).
- Default palettes 1–2 % darker at the top, so the « kWh produits » line keeps 4.5:1 contrast in its new place.

## [0.1.0] — 2026-11-15

First version, replacing the markdown + card-mod prototype.

- Solar production (W / kW), energy produced today (sum of daily sensors), and a 2 × 2 grid: battery (SOC, ↑ / ↓, « figée » / « libre »), grid (signed power: « -1,8 kW » when exporting), voltage (« Coupure » on outage), forecast for tomorrow. Every cell optional; « — » without a reading.
- Background: Tempo tariff colour by day with a sun halo scaled to production, starry night sky after sunset, 3 s cross-fade.
- Animations: breathing halo, twinkling stars. Paused off-screen or in a hidden tab; none with `prefers-reduced-motion` or `animate: false`.
- `tap_action`, `hold_action`, `double_tap_action` (navigate to a Bubble Card `#popup` works).
- Hero steps down 56 → 48 → 40 px when space runs out.
- Visual editor (separate bundle, loaded on demand); palettes stay in YAML.
- French and English.
