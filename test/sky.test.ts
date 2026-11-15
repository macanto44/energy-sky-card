import { describe, it, expect } from 'vitest';
import {
    DEFAULT_PALETTES, HALO_BREATHE_PEAK, HALO_MAX_ALPHA, HALO_RGB, NIGHT_PALETTE, composite, computeBackground, contrastRatio,
    gradientAt, hexToRgb, tariffPalette, type Palette, type Rgb,
} from '../src/sky';
import { generateStars, inTextZone, starsMarkup, FIXED_STARS, TWINKLING_STARS } from '../src/stars';
import { ANNEX_B, FULL_CONFIG, makeHass } from './helpers';

const bg = (overrides: Record<string, string | number> = {}, config = FULL_CONFIG) =>
    computeBackground(config, makeHass({ ...ANNEX_B, ...overrides }));

describe('day or night', () => {
    it('is night below the horizon, whatever the tariff', () => {
        expect(bg({ 'sun.sun': 'below_horizon', 'sensor.edf_tempo_couleur_aujourd_hui': 'Rouge' }).mode).toBe('night');
    });

    it('is day above the horizon, and when the sun is unknown', () => {
        expect(bg({ 'sun.sun': 'above_horizon' }).mode).toBe('day');
        expect(bg({ 'sun.sun': 'unavailable' }).mode).toBe('day');
    });
});

describe('tariff colour', () => {
    it('picks the palette of the day, case-insensitive', () => {
        expect(bg({ 'sensor.edf_tempo_couleur_aujourd_hui': 'Blanc' }).palette).toEqual(DEFAULT_PALETTES.Blanc);
        expect(bg({ 'sensor.edf_tempo_couleur_aujourd_hui': 'ROUGE' }).palette).toEqual(DEFAULT_PALETTES.Rouge);
    });

    it('falls back to Bleu for an unknown state or no entity', () => {
        expect(bg({ 'sensor.edf_tempo_couleur_aujourd_hui': 'Inconnu' }).palette).toEqual(DEFAULT_PALETTES.Bleu);
        expect(bg({}, { ...FULL_CONFIG, tariff_color_entity: undefined }).palette).toEqual(DEFAULT_PALETTES.Bleu);
    });

    it('lets the config replace a palette or add one', () => {
        const mine: Palette = ['#111111', '#222222', '#333333'];
        const config = { ...FULL_CONFIG, tariff_palettes: { Bleu: mine, Vert: mine } };
        expect(tariffPalette(config, 'Bleu')).toEqual(mine);
        expect(tariffPalette(config, 'vert')).toEqual(mine);
        expect(tariffPalette(config, 'Blanc')).toEqual(DEFAULT_PALETTES.Blanc);
        expect(tariffPalette(config, 'Inconnu')).toEqual(mine);
    });
});

describe('halo', () => {
    it('grows with production up to production_max, capped at 0.55', () => {
        expect(bg({ 'sensor.production_pv': 0 }).haloAlpha).toBe(0);
        expect(bg({ 'sensor.production_pv': 3000 }).haloAlpha).toBe(0.275);
        expect(bg({ 'sensor.production_pv': 6000 }).haloAlpha).toBe(0.55);
        expect(bg({ 'sensor.production_pv': 9000 }).haloAlpha).toBe(0.55);
    });

    it('is off for negative or unavailable production, and says when there is production', () => {
        expect(bg({ 'sensor.production_pv': -15 })).toMatchObject({ haloAlpha: 0, producing: false });
        expect(bg({ 'sensor.production_pv': 'unavailable' })).toMatchObject({ haloAlpha: 0, producing: false });
        expect(bg({ 'sensor.production_pv': 2.2 }).producing).toBe(true);
    });

    it('defaults production_max to 6000 W', () => {
        expect(bg({ 'sensor.production_pv': 3000 }, { ...FULL_CONFIG, production_max: undefined }).haloAlpha).toBe(0.275);
    });
});

/*
 * Contrast of white text where it sits on the card, measured in Chrome
 * (demo ?layout) for both spacings: 4 rows (248 px, roomy) and 3 rows
 * (184 px, compact). Across both: the hero over 7.6–37.7 % of the height,
 * the context line 36–50 %, labels 57–64 % and 78–86 %, values 64–76 % and
 * 85–98 %. Thresholds: values and
 * the context line 4.5:1; labels (drawn at 75 % opacity) 3:1; the hero,
 * 56 px large text, 3:1 (WCAG 1.4.3), with the halo at full strength and
 * at the peak of its breath (12 % larger) reaching it at a quarter of its alpha (it is centred at 88 % 12 %, beyond
 * the hero's right end).
 */
const WHITE: Rgb = [1, 1, 1];
const minAt = (ys: number[], f: (y: number) => number) => Math.min(...ys.map(f));

function contrasts(palette: Palette) {
    const at = (y: number) => gradientAt(palette, y);
    return {
        hero: minAt([0.076, 0.2, 0.377], y => contrastRatio(WHITE, composite(at(y), HALO_RGB, HALO_MAX_ALPHA * HALO_BREATHE_PEAK * 0.25))),
        context: minAt([0.36, 0.43, 0.497], y => contrastRatio(WHITE, at(y))),
        label: minAt([0.57, 0.643, 0.78, 0.855], y => contrastRatio(composite(at(y), WHITE, 0.75), at(y))),
        value: minAt([0.643, 0.763, 0.852, 0.975], y => contrastRatio(WHITE, at(y))),
    };
}

describe('contrast of white text', () => {
    for (const [name, palette] of [...Object.entries(DEFAULT_PALETTES), ['Nuit', NIGHT_PALETTE] as const]) {
        it(`passes on ${name}`, () => {
            const c = contrasts(palette as Palette);
            expect(c.value).toBeGreaterThanOrEqual(4.5);
            expect(c.context).toBeGreaterThanOrEqual(4.5);
            expect(c.label).toBeGreaterThanOrEqual(3);
            expect(c.hero).toBeGreaterThanOrEqual(3);
        });
    }

    it('would fail on the brief\'s original Bleu, which is why the defaults are darker', () => {
        expect(contrasts(['#5aa0e6', '#2f75bd', '#1d4f87']).context).toBeLessThan(4.5);
    });

    it('reads colours the way CSS does', () => {
        expect(hexToRgb('#fff')).toEqual([1, 1, 1]);
        expect(contrastRatio(WHITE, [0, 0, 0])).toBeCloseTo(21);
        expect(gradientAt(['#000000', '#ffffff', '#000000'], 0.6)).toEqual([1, 1, 1]);
    });
});

describe('stars', () => {
    it('are the same sky on every load', () => {
        expect(generateStars()).toEqual(generateStars());
        expect(starsMarkup()).toBe(starsMarkup());
    });

    it('count 24 fixed and 14 twinkling, 1.4 to 2.2 px, inside the card', () => {
        const stars = generateStars();
        expect(stars.filter(s => !s.twinkle).length).toBe(FIXED_STARS);
        expect(stars.filter(s => s.twinkle).length).toBe(TWINKLING_STARS);
        for (const s of stars) {
            expect(s.size).toBeGreaterThanOrEqual(1.4);
            expect(s.size).toBeLessThanOrEqual(2.2);
            expect(s.x).toBeGreaterThan(0);
            expect(s.x).toBeLessThan(100);
            expect(s.y).toBeGreaterThan(0);
            expect(s.y).toBeLessThan(100);
            expect(inTextZone(s.x, s.y)).toBe(false);
        }
    });
});
