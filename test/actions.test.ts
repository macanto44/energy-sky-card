import { describe, it, expect, vi, afterEach } from 'vitest';
import '../src/energy-sky-card';
import type { EnergySkyCard } from '../src/energy-sky-card';
import { DOUBLE_TAP_MS, HOLD_MS } from '../src/actions';
import { CARD_NAME } from '../src/constants';
import { ANNEX_B, FULL_CONFIG, makeHass } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const POPUP = { action: 'navigate', navigation_path: '#popup-flux-energie' };

function mount(extra: Partial<EnergySkyCardConfig> = {}) {
    const card = document.createElement(CARD_NAME) as EnergySkyCard;
    card.setConfig({ ...FULL_CONFIG, ...extra });
    card.hass = makeHass(ANNEX_B);
    document.body.appendChild(card);
    const events: { type: string; detail: any }[] = [];
    for (const type of ['hass-action', 'hass-more-info']) {
        card.addEventListener(type, e => events.push({ type, detail: (e as CustomEvent).detail }));
    }
    const target = card.shadowRoot!.querySelector('ha-card') as HTMLElement;
    return { card, target, events };
}

// jsdom has no PointerEvent: a MouseEvent with the pointer's type carries button and coordinates
const press = (el: HTMLElement, type: string, x = 10, y = 10) =>
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y }));
const tap = (el: HTMLElement) => { press(el, 'pointerdown'); press(el, 'pointerup'); };

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

describe('tap', () => {
    it('sends tap_action to Home Assistant: navigate to the Bubble Card pop-up', () => {
        const { target, events } = mount({ tap_action: POPUP });
        tap(target);
        expect(events).toEqual([{ type: 'hass-action', detail: { config: expect.objectContaining({ tap_action: POPUP, entity: 'sensor.production_pv' }), action: 'tap' } }]);
    });

    it('opens the production entity\'s details without a tap_action', () => {
        const { target, events } = mount();
        tap(target);
        expect(events).toEqual([{ type: 'hass-more-info', detail: { entityId: 'sensor.production_pv' } }]);
    });

    it('does nothing with action: none, and is then not a button', () => {
        const { target, events } = mount({ tap_action: { action: 'none' } });
        tap(target);
        expect(events).toEqual([]);
        expect(target.hasAttribute('role')).toBe(false);
    });

    it('is a keyboard-reachable button when a tap does something', () => {
        const { target, events } = mount({ tap_action: POPUP });
        expect(target.getAttribute('role')).toBe('button');
        expect(target.tabIndex).toBe(0);
        target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(events.map(e => e.detail.action)).toEqual(['tap']);
    });

    it('ignores a press that turns into a scroll', () => {
        const { target, events } = mount({ tap_action: POPUP });
        press(target, 'pointerdown', 10, 10);
        press(target, 'pointermove', 10, 60);
        press(target, 'pointerup', 10, 60);
        expect(events).toEqual([]);
    });
});

describe('hold and double tap', () => {
    it('fires hold_action after 500 ms, and no tap after it', () => {
        vi.useFakeTimers();
        const { target, events } = mount({ tap_action: POPUP, hold_action: { action: 'more-info' } });
        press(target, 'pointerdown');
        vi.advanceTimersByTime(HOLD_MS);
        press(target, 'pointerup');
        expect(events.map(e => e.detail.action)).toEqual(['hold']);
    });

    it('fires double_tap_action on two quick taps, and tap_action on one', () => {
        vi.useFakeTimers();
        const { target, events } = mount({ tap_action: POPUP, double_tap_action: { action: 'more-info' } });
        tap(target);
        tap(target);
        expect(events.map(e => e.detail.action)).toEqual(['double_tap']);
        tap(target);
        vi.advanceTimersByTime(DOUBLE_TAP_MS);
        expect(events.map(e => e.detail.action)).toEqual(['double_tap', 'tap']);
    });

    it('fires a plain tap at once when no double tap is set', () => {
        const { target, events } = mount({ tap_action: POPUP });
        tap(target);
        expect(events.length).toBe(1);
    });
});
