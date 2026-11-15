import { describe, it, expect, afterEach } from 'vitest';
import '../src/energy-sky-card';
import type { EnergySkyCard } from '../src/energy-sky-card';
import { CARD_NAME } from '../src/constants';
import { ANNEX_B, FULL_CONFIG, makeHass } from './helpers';

/**
 * jsdom has no layout: give the hero line and the content sizes that depend
 * on the hero size the card picked (data-hero), like a narrow phone would.
 */
function fakeLayout(widthNeeded: Record<number, number>, available: number) {
    const sizeOf = (el: Element) => {
        const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
        return Number(host.getAttribute('data-hero') ?? 56);
    };
    const desc = (get: (el: HTMLElement) => number) => ({ configurable: true, get(this: HTMLElement) { return get(this); } });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', desc(el => el.classList.contains('hero') ? widthNeeded[sizeOf(el)] : 0));
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', desc(el => el.classList.contains('hero') ? available : 0));
}

afterEach(() => {
    delete (HTMLElement.prototype as any).scrollWidth;
    delete (HTMLElement.prototype as any).clientWidth;
    document.body.innerHTML = '';
});

function mount(): EnergySkyCard {
    const card = document.createElement(CARD_NAME) as EnergySkyCard;
    card.setConfig(FULL_CONFIG);
    card.hass = makeHass(ANNEX_B);
    document.body.appendChild(card);
    return card;
}

describe('fit', () => {
    it('falls back to the compact spacing when no hero size fits the roomy one', () => {
        // Too tall in the roomy spacing at every size; fits once compact
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get(this: HTMLElement) {
            const host = (this.getRootNode() as ShadowRoot).host as HTMLElement | undefined;
            return this.classList.contains('content') && !host?.hasAttribute('data-compact') ? 260 : 0;
        } });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get(this: HTMLElement) {
            return this.classList.contains('content') ? 184 : 0;
        } });
        try {
            const card = mount();
            card.fit();
            expect(card.hasAttribute('data-compact')).toBe(true);
            expect(card.hasAttribute('data-hero')).toBe(false);
        } finally {
            delete (HTMLElement.prototype as any).scrollHeight;
            delete (HTMLElement.prototype as any).clientHeight;
        }
    });

    it('stays roomy when it fits', () => {
        fakeLayout({ 56: 200, 48: 170, 40: 140 }, 264);
        const card = mount();
        card.fit();
        expect(card.hasAttribute('data-compact')).toBe(false);
    });

    it('keeps 56 px when the hero fits', () => {
        fakeLayout({ 56: 200, 48: 170, 40: 140 }, 264);
        const card = mount();
        card.fit();
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

    it('re-fits when the hero text changes', () => {
        fakeLayout({ 56: 300, 48: 250, 40: 210 }, 264);
        const card = mount();
        card.hass = makeHass({ ...ANNEX_B, 'sensor.production_pv': 12345 });
        expect(card.getAttribute('data-hero')).toBe('48');
    });
});
