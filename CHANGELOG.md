# Changelog

## Unreleased

- The card is in the Marketplace / HACS default list: search for « Energy Sky Card », no custom repository to add.

## [0.3.9] — 2026-11-18

No breaking change.

- `smoothing`: the averages shown are worked out every 5 s (or every window, if shorter) and hold in between. They were redone on every Home Assistant update, several times a second, so the numbers crept towards each new reading as if they lagged.

## [0.3.8] — 2026-11-18

No breaking change.

- `smoothing` (seconds, « Lissage des puissances » in the editor's Production section): the powers shown (the big number, the cells, the flow, the halo) are each sensor's time-weighted average over that long, so passing clouds don't make the numbers jump; the card moves the average on every second between readings. Off (`0`) by default.
- `production_threshold`: below this power (W), the production reads 0, in the big number, the halo and the flow (a charge controller's standby draw on the solar line, say). No threshold by default; in the editor's Production section.
- Editor: « Grand chiffre la nuit » moves to Disposition / Layout, « Consommation de la maison » to Consommateurs / Appliances (now always shown; the appliances themselves still need a flow). Two helper lines are gone (under the solar power and the big number at night).

## [0.3.7] — 2026-11-17

No breaking change: the Tempo sky stays the default.

- Three skies to choose from: `background: tempo` (the default, today's tariff colour), `solid` (one colour, `background_color`, darkened if need be so white text reads at 4.5:1) or `weather` (a `weather_entity`'s condition: drifting cumulus clouds, rain, snow, fog, lightning, the wind hurrying the clouds; stars only through a clear night). Every weather sky keeps white text at 4.5:1 with its clouds or fog behind it (tested). In the editor, the « Tarif et ciel » section is now « Ciel » / "Sky": the background, then its own field (tariff sensor, colour picker or weather entity), the sun and animations.
- A grid outage shows in the energy flow: the Grid node turns red and reads « Coupure » / "Outage", and nothing flows through the grid.
- Readings gone quiet are flagged: a measure with no report for `stale_after` minutes (30 by default, 0 turns it off; « Valeur figée après » in the editor's Production section) gets a clock instead of its cell's icon, and a dashed border on its flow node, with how long it's been in the title. Read from `last_reported` (Home Assistant 2024.3+): a value that doesn't change isn't flagged, and nothing is without it. Checked again every minute.
- The energy flow keeps its shape on a wide card: its height follows its width (65 % of it, from 220 to 360 px) instead of a fixed 220 px.
- The flow's colours can be picked in the editor's Layout section (one colour picker per source, shown with a flow); a colour set back to its default leaves the YAML, and a theme variable set in YAML is kept.
- Editor: no help under the energy flow choice.

## [0.3.6] — 2026-11-17

No breaking change.

- The flow's colours follow your theme: `--energy-sky-card-solar`, `-grid`, `-battery` and `-consumption` in a Home Assistant theme set them for every card, and `flow_colors` (YAML) for one.
- README: pictures in English, the energy flow animated, the side layout with its flow and appliances; a live demo on GitHub Pages.
- The energy flow's moving dots are single beads (the size of the old comets' head), without their trail.
- An appliance below 10 W stays out of the energy flow, and the others take its place. `consumer_threshold` (« Seuil d'affichage » in the editor's Appliances block) sets the power; `0` always shows them.

## [0.3.5] — 2026-11-17

No breaking change: `expandable: true` (0.3.3) still works, read as `flow: tap`.

- Appliances in the energy flow: `consumers`, up to four (a water heater, a pool, a car…), around the home, the first above it, the second below, then in turn. Each shows its power, a ring with its share of the home's use, and a lilac wire from the home with comets that follow its power; it opens its entity on a tap, or runs its own `tap_action`. One or two get a whole node with their name on a wide card; more, or on a phone, they turn compact (icon and power, the name on hover and for screen readers), and a phone shows the first two. In the editor, an « Appliances » block with four slots, shown with a flow.
- The energy flow can be always shown: `flow: always`, in either layout. The editor has a « Layout » block of its own, before Cells: the format (standard or side) and the energy flow (none, unfold on a tap on the big number with `flow: tap`, or always shown). 0.3.3's `expandable: true` still works, as `flow: tap`, and the editor saves it under the new name.

## [0.3.4] — 2026-11-17

### ⚠️ Breaking changes

Three older option names are no longer read. **If your card still uses one, it shows an error after the update** until you rename it:

| Removed | Use instead |
| --- | --- |
| `power_threshold` (top level) | `battery.power_threshold` |
| `battery.lock_entities` | `battery.soc_reached_entities` |
| `cell_tap` | a `tap_action` on each cell (`{ type: grid, tap_action: … }`) |

The error names the option to use, in French or English. To update, edit the card in YAML:

```yaml
# Before
power_threshold: 20
battery:
  soc_entity: sensor.battery_soc
  lock_entities:
    - input_boolean.battery_target_reached

# After
battery:
  soc_entity: sensor.battery_soc
  power_threshold: 20
  soc_reached_entities:
    - input_boolean.battery_target_reached
```

If you last saved the card from the visual editor, it may already use the new names: nothing to do then.

### Changes

- The unfolded flow's outer wires now run inside: each joins the edges that face each other (the sun's top to the grid's bottom, the battery's top to the home's bottom…) with an S curve between the rows, leaving the four corners free. The flow is 20 px taller, so the curves have room.
- Editor: no help under Layout, and a shorter one under the unfolding switch.
- Internal: one text per cell instead of stacked forms hidden by CSS, one fit for both layouts, table-driven validation, shared test helpers. Nothing changes on screen.

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
