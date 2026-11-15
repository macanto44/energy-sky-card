# Roadmap

Ideas to improve Energy Sky Card, by priority (written after 0.3.0, 2026-11-15). Done items are ticked with the version that shipped them.

## Now: small and safe

1. [x] **README screenshots up to date** (0.4.0). `docs/images/*.png` predate 0.3.0 (night stars still held in the top-right quarter, no day motes). Regenerate them with `demo/shot.sh` (`bare`), and add a short night GIF: the animation is now the card's signature.
2. [x] **`test:browser` in CI** (0.4.0). `ci.yml` and `release.yml` only run `npm test`: overflow at 304 px, animations paused off-screen and particles kept off text are only checked locally. Chrome is on GitHub's Ubuntu runners.

## Easier setup (most value for other users)

3. [x] **Prefill from the Energy dashboard** (0.4.0). Home Assistant's energy preferences already list the solar, battery and grid sensors. `getStubConfig` only picks the first W sensor; reading `energy/get_prefs` (and the sensors on the same devices) would give a nearly ready card when it is added.
4. [x] **One action per cell** (0.4.0, `cell_tap`). Tapping « Réseau » opens the grid sensor's more-info rather than the card's single action: the natural reflex on a dashboard.
5. [ ] **Accessibility.** A summary screen readers can read (« Production 3,2 kW, batterie 78 % en charge, vente 1,8 kW ») instead of fragments.

## A sky that carries more information (the card's identity)

6. [ ] **Tomorrow's Tempo colour.** The useful one, to plan ahead of a Rouge day: a thin band at the bottom, or a tint settling in at dusk. Must pass the contrast test.
7. [ ] **Sunrise and sunset.** Day / night is binary today: a transition palette (dawn, golden hour) from the sun's elevation, and a halo that follows its position (`sun.sun` has elevation and azimuth).
8. [ ] **Weather.** An optional `weather` entity: fewer light motes when overcast, the moon and its phase at night.

## Reach

9. [ ] **HACS default list.** Submit to `hacs/default` so the card can be found without adding a custom repository (the HACS validation already passes). Then a post on the Home Assistant forum (Dashboards & Frontend) with the GIF.
10. [ ] **Beyond France.** Tempo is EDF's: generic palettes for peak / off-peak or a dynamic tariff would open the card to other countries. That would loosen the « French and English only » rule, which today is about strings.
