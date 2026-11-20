import { describe, it, expect, afterEach, vi } from 'vitest';
import { celestial, eastToWest, moonMarkup, twilightStrength } from '../src/celestial';
import { SUN_CLEARANCE, computeBackground } from '../src/sky';
import { windAcross } from '../src/energy-sky-card';
import { entity, makeHass, mountCard as mount } from './helpers';
import type { EnergySkyCardConfig, HomeAssistant } from '../src/types';

const CONFIG: EnergySkyCardConfig = { type: 'custom:energy-sky-card', production_entity: 'sensor.pv', production_max: 6000 };
const WEATHER: EnergySkyCardConfig = { ...CONFIG, background: 'weather', weather_entity: 'weather.home' };
const PARIS = { latitude: 48.8566, longitude: 2.3522 };
/** The sun at an elevation and azimuth (sun.sun's attributes), production, a weather, Home Assistant's place */
function sky(alt: number, az: number, pv = 3000, weather = 'sunny', place: object | null = PARIS): HomeAssistant {
    const hass = makeHass({
        'sensor.pv': pv, 'weather.home': weather,
        'sun.sun': entity('sun.sun', alt < -0.83 ? 'below_horizon' : 'above_horizon', { elevation: alt, azimuth: az }),
    });
    return place ? { ...hass, config: place } : hass;
}
const view = (config: EnergySkyCardConfig, hass: HomeAssistant, now = Date.parse('2024-01-14T12:00:00Z')) =>
    celestial(config, hass, computeBackground(config, hass), now);

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });

describe('day turning to night', () => {
    it('follows the sun\'s height: day above 5°, night below -4°, the stars out from -1° to -8°', () => {
        expect(view(CONFIG, sky(30, 180))).toMatchObject({ day: 1, stars: 0 });
        expect(view(CONFIG, sky(0.5, 250)).day).toBeCloseTo(0.5);
        expect(view(CONFIG, sky(-4.5, 250, 0, 'sunny', null)).day).toBe(0);
        expect(view(CONFIG, sky(-4.5, 250, 0, 'sunny', null)).stars).toBeCloseTo(0.5);
        expect(view(CONFIG, sky(-20, 330, 0, 'sunny', null)).stars).toBe(1);
    });

    it('falls back to sun.sun\'s state without an elevation or a place', () => {
        const hass = makeHass({ 'sensor.pv': 0, 'sun.sun': 'below_horizon' });
        expect(view(CONFIG, hass)).toEqual({ day: 0, stars: 1, twilight: 0, dawn: false });
    });
});

describe('dawn and dusk', () => {
    it('glow while the sun is low, strongest around the horizon', () => {
        expect(twilightStrength(20)).toBe(0);
        expect(twilightStrength(7)).toBeCloseTo(0.5);
        expect(twilightStrength(0)).toBe(1);
        expect(twilightStrength(-4)).toBeCloseTo(0.5);
        expect(twilightStrength(-8)).toBe(0);
    });

    it('are rose in the morning, amber in the evening, dimmed by clouds, none on a solid sky', () => {
        expect(view(CONFIG, sky(1, 95))).toMatchObject({ twilight: 1, dawn: true });
        expect(view(CONFIG, sky(1, 265))).toMatchObject({ twilight: 1, dawn: false });
        expect(view(WEATHER, sky(1, 265, 0, 'rainy')).twilight).toBeCloseTo(0.25);
        expect(view({ ...CONFIG, background: 'solid' }, sky(1, 265)).twilight).toBe(0);
    });
});

describe('the sun', () => {
    it('crosses from east to west, high at noon, in either hemisphere', () => {
        expect(eastToWest(90, 48)).toBe(0);
        expect(eastToWest(180, 48)).toBe(0.5);
        expect(eastToWest(270, 48)).toBe(1);
        // South of the equator the sun crosses the north
        expect(eastToWest(90, -33)).toBe(0);
        expect(eastToWest(0, -33)).toBe(0.5);
        expect(eastToWest(270, -33)).toBe(1);
        const noon = view(CONFIG, sky(60, 180, 6000))!.sun!;
        expect(noon).toMatchObject({ u: 0.5, v: 1, p: 1, opacity: 1, warmth: 0, rays: 12 });
    });

    it('is warm, flattened and faint by the horizon, gone below it', () => {
        const low = view(CONFIG, sky(1, 260, 500))!.sun!;
        expect(low.warmth).toBeGreaterThan(0.9);
        expect(low.opacity).toBeCloseTo(2 / 3);
        expect(low.rays).toBe(0);
        expect(view(CONFIG, sky(-2, 270, 0)).sun).toBeUndefined();
    });

    it('shows through a clear or partly clear weather only, rays in a clear sky', () => {
        expect(view(WEATHER, sky(40, 180, 3000, 'cloudy')).sun).toBeUndefined();
        expect(view(WEATHER, sky(40, 180, 3000, 'partlycloudy')).sun?.rays).toBe(0);
        expect(view(WEATHER, sky(40, 180, 3000, 'sunny')).sun?.rays).toBe(6);
        expect(view({ ...CONFIG, background: 'solid' }, sky(40, 180)).sun).toBeUndefined();
    });
});

describe('the moon', () => {
    // 2024-01-14, 17:30 UTC in Paris: a thin crescent low in the south-west, after sunset
    const EVENING = Date.parse('2024-01-14T17:30:00Z');

    it('shows its phase, lit side turned down towards the set sun', () => {
        const moon = view(CONFIG, sky(-12, 250, 0), EVENING).moon!;
        expect(moon.lit).toBeLessThan(0.2);
        expect(moon.opacity).toBe(1);
        // The lit side drawn on the right, turned clockwise: down and to the right
        expect(moon.rotate).toBeGreaterThan(0);
        expect(moon.rotate).toBeLessThan(90);
        expect(moon.u).toBeGreaterThan(0.5);
    });

    it('needs Home Assistant\'s place, a clear enough sky, and to be up', () => {
        expect(view(CONFIG, sky(-12, 250, 0, 'sunny', null), EVENING).moon).toBeUndefined();
        expect(view(WEATHER, sky(-12, 250, 0, 'cloudy'), EVENING).moon).toBeUndefined();
        // At noon that day the young moon is close to the sun: not shown by day
        expect(view(CONFIG, sky(20, 180), Date.parse('2024-01-14T12:00:00Z')).moon).toBeUndefined();
    });

    it('dims the stars as it fills', () => {
        const full = view(CONFIG, sky(-30, 0, 0), Date.parse('2024-01-25T23:00:00Z'));
        expect(full.moon!.lit).toBeGreaterThan(0.95);
        expect(full.stars).toBeLessThan(0.5);
    });

    it('is drawn from numbers only, its seas clipped to the lit part', () => {
        const svg = moonMarkup(0.2, 'm');
        expect(svg).toBe(moonMarkup(0.2, 'm'));
        expect(svg).toContain('A0.600,1 0 0 0 0,-1');
        expect(moonMarkup(0.8, 'm')).toContain('A0.600,1 0 0 1 0,-1');
        expect(svg).not.toMatch(/[a-z]+:\/\//);
    });
});

describe('the wind in the rain', () => {
    it('drifts the drops with the wind across the view, from its bearing and unit', () => {
        // From the west at 20 km/h, in the north: towards the east, on the left
        expect(windAcross({ wind_speed: 20, wind_bearing: 270 }, 48)).toBe(-50);
        expect(windAcross({ wind_speed: 20, wind_bearing: 90 }, 48)).toBe(50);
        // Blowing towards you: no drift but the slight slant of falling
        expect(windAcross({ wind_speed: 20, wind_bearing: 0 }, 48)).toBe(-12);
        expect(windAcross({ wind_speed: 10, wind_bearing: 270, wind_speed_unit: 'm/s' }, 48)).toBe(-90);
        expect(windAcross({ wind_speed: 200, wind_bearing: 270 }, 48)).toBe(-170);
        // In the south, east is on the right
        expect(windAcross({ wind_speed: 20, wind_bearing: 270 }, -33)).toBe(50);
        expect(windAcross(undefined, 48)).toBe(-70);
    });
});

describe('in the card', () => {
    /** A 360 × 248 card: the hero, the context line and the cells where Chrome puts them */
    function layout() {
        const rects: Record<string, [number, number, number, number]> = {
            'ha-card': [0, 0, 360, 248], 'hero-value': [20, 20, 120, 80], 'hero-unit': [124, 52, 150, 80],
            'context-text': [20, 92, 170, 112], metric: [20, 140, 340, 236],
        };
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
            const key = this.localName === 'ha-card' ? 'ha-card' : [...this.classList].find(c => rects[c]);
            const [left, top, right, bottom] = key ? rects[key] : [0, 0, 0, 0];
            return { left, top, right, bottom, width: right - left, height: bottom - top, x: left, y: top, toJSON() {} } as DOMRect;
        });
        return rects;
    }
    const px = (card: HTMLElement, name: string) => parseFloat(card.shadowRoot!.querySelector<HTMLElement>('ha-card')!.style.getPropertyValue(name));

    it('places the sun on its arc, clear of the text, and the twilight on the sky', () => {
        layout();
        const card = mount({ ...CONFIG, grid: { power_entity: 'sensor.grid' } }, sky(30, 200, 4000));
        card.fit();
        const x = px(card, '--esc-sun-x'), y = px(card, '--esc-sun-y');
        expect(px(card, '--esc-sun-o')).toBe(1);
        expect(x).toBeGreaterThan(180);
        // Clear of the context line's text (its right end at 170, its top at 92) and of the cells (from 140 down)
        expect(Math.hypot(Math.max(0, x - 170), Math.max(0, 92 - y))).toBeGreaterThanOrEqual(SUN_CLEARANCE.context);
        expect(140 - y).toBeGreaterThanOrEqual(SUN_CLEARANCE.cells);
        expect(px(card, '--esc-day')).toBe(1);
    });

    it('moves the morning sun up and right rather than near the words', () => {
        layout();
        const card = mount({ ...CONFIG, grid: { power_entity: 'sensor.grid' } }, sky(8, 100, 800));
        card.fit();
        const x = px(card, '--esc-sun-x'), y = px(card, '--esc-sun-y');
        expect(Math.hypot(Math.max(0, x - 170), Math.max(0, 92 - y))).toBeGreaterThanOrEqual(SUN_CLEARANCE.context);
        expect(Math.hypot(Math.max(0, x - 150), Math.max(0, y - 80))).toBeGreaterThanOrEqual(SUN_CLEARANCE.hero);
    });

    it('lights a rainbow when the sun comes back after rain', () => {
        const card = mount(WEATHER, sky(20, 230, 2000, 'rainy'));
        expect(card.hasAttribute('data-rainbow')).toBe(false);
        card.hass = sky(20, 230, 2400, 'sunny');
        expect(card.hasAttribute('data-rainbow')).toBe(true);
        // Not with the sun above 42°
        card.hass = sky(45, 190, 2600, 'sunny');
        expect(card.hasAttribute('data-rainbow')).toBe(false);
    });

    it('gives a full, resting battery its sheen', () => {
        const config: EnergySkyCardConfig = { ...CONFIG, flow: 'always', battery: { soc_entity: 'sensor.soc', power_entity: 'sensor.bat' } };
        const card = mount(config, { ...sky(30, 180).states, 'sensor.soc': 100, 'sensor.bat': 5 } as never);
        expect(card.shadowRoot!.querySelector('[data-node="battery"]')!.hasAttribute('data-full')).toBe(true);
        card.hass = makeHass({ 'sensor.pv': 3000, 'sensor.soc': 100, 'sensor.bat': -800 });
        expect(card.shadowRoot!.querySelector('[data-node="battery"]')!.hasAttribute('data-full')).toBe(false);
    });
});
