import { describe, it, expect } from 'vitest';
import {
    CLOUD_MAX_ALPHA, CLOUD_RGB, DEFAULT_PALETTES, HALO_BREATHE_PEAK, HALO_MAX_ALPHA, HALO_RGB, NIGHT_PALETTE, composite, computeBackground, contrastRatio,
    gradientAt, hexToRgb, tariffPalette, type Palette, type Rgb,
} from '../src/sky';
import { SHOOTING_STARS, coveredBy, generateStars, starReach, starsMarkup } from '../src/stars';
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

    it('cover the whole card, thinning and dimming towards the bottom', () => {
        const stars = generateStars();
        expect(stars.length).toBeGreaterThanOrEqual(40);
        expect(stars.filter(s => s.twinkle).length).toBeGreaterThanOrEqual(12);
        const quarter = (s: { x: number; y: number }) => `${s.x < 50 ? 'l' : 'r'}${s.y < 50 ? 't' : 'b'}`;
        for (const q of ['lt', 'rt', 'lb', 'rb']) expect(stars.filter(s => quarter(s) === q).length).toBeGreaterThanOrEqual(5);
        const top = stars.filter(s => s.y < 50), bottom = stars.filter(s => s.y >= 50);
        expect(top.length).toBeGreaterThan(bottom.length);
        for (const s of stars) {
            expect(s.x).toBeGreaterThan(0);
            expect(s.x).toBeLessThan(100);
            expect(s.y).toBeGreaterThan(0);
            expect(s.y).toBeLessThan(100);
            expect(s.size).toBeGreaterThanOrEqual(0.98);
            expect(s.size).toBeLessThanOrEqual(2.2);
            expect(s.opacity).toBeGreaterThanOrEqual(0.55);
            expect(s.opacity).toBeLessThanOrEqual(1);
        }
    });

    it('come with three shooting stars on their own paths and rhythms', () => {
        expect(new Set(SHOOTING_STARS.map(s => s.period)).size).toBe(3);
        expect(starsMarkup().match(/class="shooting"/g)?.length).toBe(3);
    });
});

describe('cloud shadows', () => {
    const cloudRgb = CLOUD_RGB.map(c => c / 255) as Rgb;
    const shaded = (palette: Palette): Palette => {
        const hex = (rgb: Rgb) => '#' + rgb.map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
        return palette.map(c => hex(composite(hexToRgb(c), cloudRgb, CLOUD_MAX_ALPHA))) as Palette;
    };

    it('only darken: white text keeps its contrast under the thickest cloud', () => {
        for (const palette of Object.values(DEFAULT_PALETTES)) {
            const clear = contrasts(palette), cloudy = contrasts(shaded(palette));
            for (const key of ['hero', 'context', 'label', 'value'] as const) expect(cloudy[key]).toBeGreaterThanOrEqual(clear[key]);
        }
    });
});

describe('keeping particles off the text', () => {
    const box = { left: 100, top: 100, right: 200, bottom: 120 };

    it('counts the reach around the text box', () => {
        expect(coveredBy(150, 110, 3, [box])).toBe(true);
        expect(coveredBy(96, 110, 5, [box])).toBe(true);
        expect(coveredBy(96, 110, 3, [box])).toBe(false);
        expect(coveredBy(150, 125, 3, [box])).toBe(false);
        expect(coveredBy(150, 110, 3, [])).toBe(false);
    });

    it('reaches as far as a star grows, plus a gap', () => {
        expect(starReach({ x: 0, y: 0, size: 2, opacity: 1, twinkle: false, delay: 0 })).toBe(4);
        expect(starReach({ x: 0, y: 0, size: 2, opacity: 1, twinkle: true, delay: 0 })).toBe(4.4);
    });
});
