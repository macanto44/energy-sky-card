import { describe, it, expect, afterEach } from 'vitest';
import { $, ANNEX_B, FULL_CONFIG, hostOf, makeHass, measure, mountCard as mount, unmeasure } from './helpers';

/**
 * jsdom has no layout: give the hero line a width that depends on the hero
 * size the card picked (data-hero), like a narrow phone would.
 */
function fakeLayout(widthNeeded: Record<number, number>, available: number) {
    measure('scrollWidth', el => el.classList.contains('hero') ? widthNeeded[Number(hostOf(el).getAttribute('data-hero') ?? 56)] : 0);
    measure('clientWidth', el => el.classList.contains('hero') ? available : 0);
}

afterEach(() => {
    unmeasure();
    document.body.innerHTML = '';
});

describe('fit', () => {
    it('falls back to the compact spacing when no hero size fits the roomy one', () => {
        // Too tall in the roomy spacing at every size; fits once compact
        measure('scrollHeight', el => el.classList.contains('content') && !hostOf(el).hasAttribute('data-compact') ? 260 : 0);
        measure('clientHeight', el => el.classList.contains('content') ? 184 : 0);
        const card = mount();
        card.fit();
        expect(card.hasAttribute('data-compact')).toBe(true);
        expect(card.hasAttribute('data-hero')).toBe(false);
    });

    it('stays roomy, at 56 px, when it fits', () => {
        fakeLayout({ 56: 200, 48: 170, 40: 140 }, 264);
        const card = mount();
        card.fit();
        expect(card.hasAttribute('data-compact')).toBe(false);
        expect(card.hasAttribute('data-hero')).toBe(false);
    });

    it('steps down to 48 px, then 40 px, until nothing overflows', () => {
        fakeLayout({ 56: 300, 48: 250, 40: 210 }, 264);
        const card = mount();
        card.fit();
        expect(card.getAttribute('data-hero')).toBe('48');
        fakeLayout({ 56: 300, 48: 280, 40: 210 }, 264);
        card.fit();
        expect(card.getAttribute('data-hero')).toBe('40');
    });

    it('grows back when there is room again', () => {
        fakeLayout({ 56: 300, 48: 280, 40: 210 }, 264);
        const card = mount();
        card.fit();
        expect(card.getAttribute('data-hero')).toBe('40');
        fakeLayout({ 56: 200, 48: 170, 40: 140 }, 264);
        card.fit();
        expect(card.hasAttribute('data-hero')).toBe(false);
    });

    it('shortens « SOC atteint » only when a metric line is too wide', () => {
        // A line wider than 15 characters doesn't fit: « 25 % · SOC atteint » doesn't, « 25 % · SOC ✓ » does
        measure('scrollWidth', el => el.classList.contains('value') ? ((el.textContent ?? '').length > 15 ? 144 : 60) : 0);
        measure('clientWidth', el => el.classList.contains('value') ? 124 : 0);
        const card = mount();
        card.fit();
        expect(card.hasAttribute('data-form')).toBe(false);
        card.hass = makeHass({ ...ANNEX_B, 'input_boolean.reserve_batterie_nuit': 'on' });
        expect(card.getAttribute('data-form')).toBe('1');
        expect($(card, '[data-metric="battery"] .extra').textContent).toBe(' · SOC ✓');
        card.hass = makeHass(ANNEX_B);
        expect(card.hasAttribute('data-form')).toBe(false);
    });

    it('goes to the tight battery form only when the short one is still too wide', () => {
        measure('scrollWidth', el => el.classList.contains('value') ? (hostOf(el).getAttribute('data-form') === '2' ? 120 : 160) : 0);
        measure('clientWidth', el => el.classList.contains('value') ? 124 : 0);
        const config = { ...FULL_CONFIG, battery: { ...FULL_CONFIG.battery, temperature_entity: 'sensor.bat_temp' } };
        const card = mount(config, { ...ANNEX_B, 'sensor.bat_temp': 21, 'input_boolean.reserve_batterie_nuit': 'on' });
        card.fit();
        expect(card.getAttribute('data-form')).toBe('2');
        expect($(card, '[data-metric="battery"] .value-main').textContent).toMatch(/^25.% · 21°$/);
        expect($(card, '[data-metric="battery"] .extra').textContent).toBe(' ✓');
        // A cell without a tight form keeps its short one
        expect($(card, '[data-metric="grid"] .value-main').textContent).toMatch(/^748.W$/);
    });

    it('re-fits when the hero text changes', () => {
        fakeLayout({ 56: 300, 48: 250, 40: 210 }, 264);
        const card = mount();
        card.hass = makeHass({ ...ANNEX_B, 'sensor.production_pv': 12345 });
        expect(card.getAttribute('data-hero')).toBe('48');
    });
});
