import { describe, it, expect, afterEach } from 'vitest';
import { CARD_CSS } from '../src/styles/card';
import { FULL_CONFIG, hostOf, measure, mountCard, unmeasure } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const SIDE: EnergySkyCardConfig = { ...FULL_CONFIG, layout: 'side' };
const mount = (config: EnergySkyCardConfig = SIDE) => mountCard(config);

afterEach(() => {
    unmeasure();
    document.body.innerHTML = '';
});

describe('layout option', () => {
    it('is standard by default, side on request, and nothing else', () => {
        expect(mount(FULL_CONFIG).hasAttribute('data-layout')).toBe(false);
        expect(mount().getAttribute('data-layout')).toBe('side');
        expect(() => mount({ ...FULL_CONFIG, layout: 'right' as any })).toThrow(/layout/);
    });

    it('asks the sections grid for two rows in side, four in standard', () => {
        expect(mount().getGridOptions()).toEqual({ columns: 12, rows: 2, min_columns: 6, min_rows: 2 });
        expect(mount().getCardSize()).toBe(2);
        expect(mount(FULL_CONFIG).getGridOptions().rows).toBe(4);
    });

    it('switches back and forth on a new config', () => {
        const card = mount();
        card.setConfig(FULL_CONFIG);
        expect(card.hasAttribute('data-layout')).toBe(false);
        card.setConfig(SIDE);
        expect(card.getAttribute('data-layout')).toBe('side');
    });

    it('keeps each cell\'s name for screen readers and on hover, its icon in front', () => {
        const card = mount();
        const battery = card.shadowRoot!.querySelector('[data-metric="battery"]') as HTMLElement;
        expect(battery.querySelector('.label-text')?.textContent).toBe('Batterie');
        expect(battery.title).toBe('Batterie');
        expect(battery.querySelector('ha-icon')?.getAttribute('icon')).toBe('mdi:home-battery-outline');
        expect(battery.querySelector('.value-main')?.textContent).toMatch(/%/);
    });

    it('sets no title on the cells in standard', () => {
        const card = mount(FULL_CONFIG);
        expect((card.shadowRoot!.querySelector('[data-metric="battery"]') as HTMLElement).title).toBe('');
    });
});

describe('side fit', () => {
    /**
     * jsdom has no layout. The hero's line needs a width that depends on its
     * size; the cells' column, on how short their text is (data-form, 0 to
     * 3): the narrower it is, the more room the hero has.
     */
    function fakeSide(heroWidth: Record<number, number>, room: number[]) {
        measure('scrollWidth', el => el.classList.contains('hero') ? heroWidth[Number(hostOf(el).getAttribute('data-hero') ?? 44)] : 0);
        measure('clientWidth', el => el.classList.contains('hero') ? room[Number(hostOf(el).getAttribute('data-form') ?? 0)] : 0);
    }

    it('keeps the big hero and the full lines when they fit', () => {
        fakeSide({ 44: 100, 40: 90, 36: 80 }, [120, 130, 140, 160]);
        const card = mount();
        card.fit();
        for (const a of ['data-hero', 'data-form', 'data-compact']) expect(card.hasAttribute(a)).toBe(false);
    });

    it('steps the hero down, then shortens the cells\' lines, down to no complement', () => {
        fakeSide({ 44: 100, 40: 90, 36: 80 }, [60, 70, 75, 95]);
        const card = mount();
        card.fit();
        expect(card.getAttribute('data-hero')).toBe('40');
        expect(card.getAttribute('data-form')).toBe('3');
    });

    it('uses the short complements first', () => {
        fakeSide({ 44: 100, 40: 90, 36: 80 }, [60, 100, 120, 140]);
        const card = mount();
        card.fit();
        expect(card.getAttribute('data-form')).toBe('1');
        expect(card.hasAttribute('data-hero')).toBe(false);
    });

    it('shortens the cells\' lines before the context line gets cut', () => {
        measure('scrollWidth', el => el.classList.contains('context') ? 120 : 0);
        measure('clientWidth', el => el.classList.contains('context') ? (hostOf(el).getAttribute('data-form') === '1' ? 130 : 110) : 0);
        const card = mount();
        card.fit();
        expect(card.getAttribute('data-form')).toBe('1');
        expect(card.hasAttribute('data-short-context')).toBe(false);
    });

    it('hides an empty context line, though it may wrap', () => {
        expect(CARD_CSS).toContain(':host([data-layout="side"]) .context[hidden] { display: none; }');
    });

    it('leaves no side-only attribute behind when going back to standard', () => {
        fakeSide({ 44: 100, 40: 90, 36: 80 }, [60, 70, 75, 85]);
        const card = mount();
        card.fit();
        expect(card.getAttribute('data-form')).toBe('3');
        card.setConfig(FULL_CONFIG);
        card.fit();
        expect(card.hasAttribute('data-form')).toBe(false);
    });
});

describe('side stylesheet', () => {
    it('draws the lower part of the gradient, and a halo off the cells\' column', () => {
        expect(CARD_CSS).toMatch(/:host\(\[data-layout="side"\]\) \.layer\.day \{ background: linear-gradient\(180deg, color-mix\(in srgb, var\(--esc-c0, #4b90d5\) 25%, var\(--esc-c1, #2169b0\)\) 0%, var\(--esc-c1, #2169b0\) 27\.3%/);
        expect(CARD_CSS).toMatch(/circle 100px at 0px -30px/);
    });

    it('declares its hero size before the stepped ones, so they win', () => {
        expect(CARD_CSS.indexOf(':host([data-layout="side"]) { --esc-hero-size: 44px; }')).toBeLessThan(CARD_CSS.indexOf(':host([data-hero="40"])'));
    });
});
