// The weather sky's moving parts (background: weather): cumulus clouds,
// raindrops, snowflakes, fog and lightning, drawn for a condition from
// WEATHER (sky.ts). Seeded, so a condition looks the same on every load.
// Only constants and numbers go into the markup.

import { WEATHER } from './sky';

/** The same pseudo-random sequence every time */
function seeded(seed: number): () => number {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const n1 = (v: number) => v.toFixed(1);

/** Two cumulus silhouettes: puffs [cx, cy, r] on a flat base, in a 100 × 50 box */
const CUMULUS = [
    [[24, 34, 13], [40, 25, 17], [58, 21, 15], [72, 29, 13], [84, 36, 9]],
    [[20, 36, 10], [34, 28, 14], [52, 24, 18], [70, 31, 12]],
];

/** One cumulus in a card-wide band that drifts across, at its own pace (faster in the wind) */
function cloud(rnd: () => number, i: number, windy: boolean): string {
    const puffs = CUMULUS[i % 2];
    const width = 26 + rnd() * 22, top = rnd() * 62 - 6, left = (i * 37) % 60 + 10;
    const period = windy ? 35 + rnd() * 15 : 55 + rnd() * 25;
    const first = puffs[0][0], last = puffs[puffs.length - 1][0];
    const shape = puffs.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`).join('')
        + `<rect x="${first}" y="30" width="${last - first}" height="14" rx="7"></rect>`;
    return `<div class="cloudband" style="animation-duration:${n1(period)}s;animation-delay:-${n1(rnd() * period)}s">`
        + `<svg class="cumulus" viewBox="0 0 100 50" style="left:${left}%;top:${n1(top)}%;width:${n1(width)}%"><g>${shape}</g></svg></div>`;
}

/** The weather layer's markup for a condition (WEATHER key) */
export function weatherMarkup(key: string): string {
    const look = WEATHER[key];
    if (!look) return '';
    const rnd = seeded(7);
    let out = '';
    for (let i = 0; i < look.clouds; i++) out += cloud(rnd, i, !!look.windy);
    if (look.fog) {
        for (let i = 0; i < 4; i++) {
            const period = 14 + rnd() * 10;
            out += `<div class="fogband" style="top:${-10 + i * 28}%;height:${n1(45 + rnd() * 20)}%;animation-duration:${n1(period)}s;animation-delay:-${n1(rnd() * 10)}s"></div>`;
        }
    }
    for (let i = 0; i < look.rain; i++) {
        const period = 0.55 + rnd() * 0.35;
        out += `<i class="drop" style="left:${n1(rnd() * 115)}%;opacity:${(0.35 + rnd() * 0.5).toFixed(2)};animation-duration:${period.toFixed(2)}s;animation-delay:-${(rnd() * period).toFixed(2)}s"></i>`;
    }
    for (let i = 0; i < look.snow; i++) {
        const size = 2 + rnd() * 2.6, period = 6 + rnd() * 6;
        out += `<i class="flake" style="left:${n1(rnd() * 100)}%;width:${n1(size)}px;height:${n1(size)}px;opacity:${(0.5 + rnd() * 0.45).toFixed(2)};animation-duration:${n1(period)}s;animation-delay:-${n1(rnd() * period)}s"></i>`;
    }
    if (look.flash) out += '<div class="flash"></div>';
    return out;
}
