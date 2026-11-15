# Changelog

## [0.1.2] — 2026-11-15

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
