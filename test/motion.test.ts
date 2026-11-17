import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { motionState } from '../src/motion';
import { CARD_CSS } from '../src/styles/card';
import { HALO_BREATHE_PEAK } from '../src/sky';
import { ANNEX_B, FULL_CONFIG, mountCard } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

/** A controllable IntersectionObserver */
class FakeObserver {
    static last?: FakeObserver;
    constructor(public callback: (entries: { isIntersecting: boolean }[]) => void, public options?: IntersectionObserverInit) {
        FakeObserver.last = this;
    }
    observe = vi.fn();
    disconnect = vi.fn();
    fire(isIntersecting: boolean) {
        this.callback([{ isIntersecting }]);
    }
}

let reduced = false;
const mediaListeners: ((e: { matches: boolean }) => void)[] = [];
let hidden = false;

beforeEach(() => {
    reduced = false;
    hidden = false;
    mediaListeners.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    window.matchMedia = ((query: string) => ({
        matches: query.includes('reduce') ? reduced : false,
        media: query,
        addEventListener: (_: string, l: (e: { matches: boolean }) => void) => mediaListeners.push(l),
        removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => mediaListeners.splice(mediaListeners.indexOf(l), 1),
    })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
});

const mount = (config: EnergySkyCardConfig = FULL_CONFIG, overrides: Record<string, string | number> = {}) => mountCard(config, { ...ANNEX_B, ...overrides });

describe('the rule', () => {
    const base = { animate: true, reducedMotion: false, tabHidden: false, offscreen: false };
    it('runs when seen, holds when hidden or off-screen, never starts when turned off', () => {
        expect(motionState(base)).toBe('on');
        expect(motionState({ ...base, tabHidden: true })).toBe('paused');
        expect(motionState({ ...base, offscreen: true })).toBe('paused');
        expect(motionState({ ...base, animate: false })).toBe('off');
        expect(motionState({ ...base, reducedMotion: true, offscreen: true })).toBe('off');
    });
});

describe('the card', () => {
    it('animates while on screen', () => {
        const card = mount();
        expect(card.dataset.motion).toBe('on');
        expect(FakeObserver.last?.options?.rootMargin).toBe('100px');
    });

    it('pauses off-screen, and resumes when back', () => {
        const card = mount();
        FakeObserver.last!.fire(false);
        expect(card.dataset.motion).toBe('paused');
        FakeObserver.last!.fire(true);
        expect(card.dataset.motion).toBe('on');
    });

    it('pauses while the tab is hidden', () => {
        const card = mount();
        hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(card.dataset.motion).toBe('paused');
        hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(card.dataset.motion).toBe('on');
    });

    it('never animates under prefers-reduced-motion, and follows the setting live', () => {
        reduced = true;
        const card = mount();
        expect(card.dataset.motion).toBe('off');
        mediaListeners.forEach(l => l({ matches: false }));
        expect(card.dataset.motion).toBe('on');
    });

    it('never animates with animate: false', () => {
        const card = mount({ ...FULL_CONFIG, animate: false });
        expect(card.dataset.motion).toBe('off');
        FakeObserver.last!.fire(true);
        expect(card.dataset.motion).toBe('off');
    });

    it('stops watching once removed', () => {
        const card = mount();
        const observer = FakeObserver.last!;
        card.remove();
        expect(observer.disconnect).toHaveBeenCalled();
        hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(card.dataset.motion).toBe('on');
    });

    it('marks the halo as breathable only by day with production', () => {
        expect(mount(FULL_CONFIG, { 'sun.sun': 'above_horizon', 'sensor.production_pv': 1500 }).hasAttribute('data-producing')).toBe(true);
        expect(mount(FULL_CONFIG, { 'sun.sun': 'above_horizon', 'sensor.production_pv': 0 }).hasAttribute('data-producing')).toBe(false);
    });

    it('enables the day / night cross-fade only after the first paint', async () => {
        const card = mount();
        expect(card.hasAttribute('data-ready')).toBe(false);
        await new Promise(r => requestAnimationFrame(() => r(null)));
        expect(card.hasAttribute('data-ready')).toBe(true);
    });
});

/** Every rule of the stylesheet, flattened: [selector, body] */
function rules(css: string): [string, string][] {
    const out: [string, string][] = [];
    const flat = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(flat))) out.push([m[1].trim(), m[2]]);
    return out;
}

describe('the stylesheet', () => {
    const all = rules(CARD_CSS);

    it('declares animations only when motion is on or paused (never off-screen-and-running, never off)', () => {
        const animated = all.filter(([sel, body]) => /(^|;|\s)animation\s*:\s*esc-/.test(body) && !sel.startsWith('@'));
        // halo, stars, shooting stars, clouds, and the flow's comets
        expect(animated.length).toBe(5);
        for (const [selector] of animated) {
            for (const part of selector.split(',')) {
                expect(part).toMatch(/data-motion="(on|paused)"/);
            }
        }
    });

    it('holds every animation while paused, after the shorthand (which would reset it)', () => {
        expect(all.some(([sel, body]) => sel === ':host([data-motion="paused"])' && /--esc-play:\s*paused/.test(body))).toBe(true);
        for (const [, body] of all.filter(([, b]) => /animation\s*:\s*esc-/.test(b))) {
            expect(body.indexOf('animation-play-state: var(--esc-play)')).toBeGreaterThan(body.indexOf('animation:'));
        }
    });

    it('breathes the halo over 6 s (×0.55 ↔ ×1, up to 12 % larger), twinkles the stars over 4 s, shooting stars on their own periods, clouds drifting by day', () => {
        expect(CARD_CSS).toMatch(/esc-breathe 3s ease-in-out infinite alternate/);
        expect(CARD_CSS).toMatch(/calc\(var\(--esc-halo-alpha, 0\) \* 0\.55\)/);
        expect(CARD_CSS).toContain(`calc(var(--esc-halo-alpha, 0) * ${HALO_BREATHE_PEAK})`);
        expect(CARD_CSS).toMatch(/esc-twinkle 2s ease-in-out infinite alternate/);
        expect(CARD_CSS).toMatch(/from \{ opacity: calc\(var\(--esc-o, 1\) \* 0\.15\);/);
        expect(CARD_CSS).toMatch(/esc-shoot var\(--esc-shoot-period, 11s\) ease-out var\(--esc-shoot-delay, 4s\) infinite/);
        expect(CARD_CSS).toMatch(/:host\(\[data-motion="on"\]\[data-mode="day"\]\) \.drift,[^{]*\{ animation: esc-drift 60s linear infinite;/);
    });

    it('never shows the shooting star without motion', () => {
        expect(all.some(([sel, body]) => sel === '.shooting' && /opacity:\s*0;/.test(body))).toBe(true);
    });

    it('animates only opacity and transform', () => {
        const keyframes = CARD_CSS.match(/@keyframes[^{]+\{([\s\S]*?\}\s*)\}/g) ?? [];
        expect(keyframes.length).toBe(4);
        for (const block of keyframes) {
            const props = [...block.matchAll(/([a-z-]+)\s*:/g)].map(m => m[1]);
            for (const prop of props) expect(['opacity', 'transform']).toContain(prop);
        }
    });

    it('turns everything off under prefers-reduced-motion, as a second guard', () => {
        expect(CARD_CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.halo, \.star, \.shooting, \.drift, \.layer, \.comet \{ animation: none !important; transition: none !important; \}/);
    });

    it('cross-fades day and night over 3 s, except when motion is off', () => {
        expect(all.some(([sel, body]) => sel.includes(':not([data-motion="off"])') && body.includes('transition: opacity 3s'))).toBe(true);
    });
});
