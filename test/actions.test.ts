import { describe, it, expect, vi, afterEach } from 'vitest';
import type { EnergySkyCard } from '../src/energy-sky-card';
import { DOUBLE_TAP_MS, HOLD_MS } from '../src/actions';
import { $, FULL_CONFIG, actionsOf, mountCard, press, tap } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const POPUP = { action: 'navigate', navigation_path: '#popup-flux-energie' };

function mount(extra: Partial<EnergySkyCardConfig> = {}) {
    const card = mountCard({ ...FULL_CONFIG, ...extra });
    return { card, target: $(card, 'ha-card'), events: actionsOf(card) };
}

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

describe('a tap on a cell', () => {
    const cell = (card: EnergySkyCard, key: string) => card.shadowRoot!.querySelector(`[data-metric="${key}"]`) as HTMLElement;

    it('opens the cell\'s entity by default, and the production\'s elsewhere', () => {
        const { card, target, events } = mount();
        tap(cell(card, 'battery'));
        tap(cell(card, 'grid'));
        tap(cell(card, 'voltage'));
        tap(target);
        expect(events.map(e => e.detail.entityId)).toEqual([
            'sensor.victron_system_battery_soc', 'sensor.victrongrid_ac_l1_power31', 'sensor.grid_voltage', 'sensor.production_pv',
        ]);
    });

    it('keeps the card\'s own tap_action everywhere in auto, as before', () => {
        const { card, events } = mount({ tap_action: POPUP });
        tap(cell(card, 'battery'));
        expect(events).toEqual([{ type: 'hass-action', detail: expect.objectContaining({ action: 'tap' }) }]);
        expect(cell(card, 'battery').hasAttribute('role')).toBe(false);
    });

    it('opens the cell\'s entity over the card\'s tap_action with more-info, and never with card', () => {
        const forced = mount({ tap_action: POPUP, cell_tap: 'more-info' });
        tap(cell(forced.card, 'tomorrow'));
        tap(forced.target);
        expect(forced.events.map(e => e.type)).toEqual(['hass-more-info', 'hass-action']);
        expect(forced.events[0].detail.entityId).toBe('sensor.energy_production_tomorrow_2');
        document.body.innerHTML = '';
        const off = mount({ cell_tap: 'card' });
        tap(cell(off.card, 'battery'));
        expect(off.events.map(e => e.detail.entityId)).toEqual(['sensor.production_pv']);
    });

    it('makes such a cell a keyboard button, and a free cell opens its own entity', () => {
        const { card, events } = mount({ cells: ['grid', { entity: 'sensor.boiler', name: 'Eau' }] });
        const free = cell(card, 'custom-1');
        expect(free.getAttribute('role')).toBe('button');
        expect(free.tabIndex).toBe(0);
        free.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(events.map(e => e.detail.entityId)).toEqual(['sensor.boiler']);
    });

    it('keeps the card\'s hold on a cell, for that cell\'s entity', () => {
        vi.useFakeTimers();
        const { card, events } = mount({ hold_action: { action: 'more-info' } });
        press(cell(card, 'grid'), 'pointerdown');
        vi.advanceTimersByTime(HOLD_MS);
        press(cell(card, 'grid'), 'pointerup');
        expect(events).toEqual([{ type: 'hass-action', detail: { config: expect.objectContaining({ entity: 'sensor.victrongrid_ac_l1_power31' }), action: 'hold' } }]);
    });

    it('runs a cell\'s own tap action: a URL, a page, the entity\'s dialog, or nothing', () => {
        const url = { action: 'url', url_path: 'https://example.org' };
        const { card, target, events } = mount({
            tap_action: POPUP,
            cells: [{ type: 'battery', tap_action: url }, { type: 'grid', tap_action: { action: 'more-info' } }, { type: 'voltage', tap_action: { action: 'none' } }, 'tomorrow'],
        });
        tap(cell(card, 'battery'));
        tap(cell(card, 'grid'));
        tap(cell(card, 'voltage'));
        tap(cell(card, 'tomorrow'));
        tap(target);
        expect(events.map(e => [e.detail.action, e.detail.config.tap_action, e.detail.config.entity])).toEqual([
            ['tap', url, 'sensor.victron_system_battery_soc'],
            ['tap', { action: 'more-info' }, 'sensor.victrongrid_ac_l1_power31'],
            // voltage: none, nothing; tomorrow has no action of its own: the card's pop-up
            ['tap', POPUP, 'sensor.production_pv'],
            ['tap', POPUP, 'sensor.production_pv'],
        ]);
        expect(cell(card, 'battery').getAttribute('role')).toBe('button');
        expect(cell(card, 'voltage').hasAttribute('role')).toBe(false);
    });

    it('takes a tap action on a free cell too', () => {
        const nav = { action: 'navigate', navigation_path: '/energy' };
        const { card, events } = mount({ cells: [{ entity: 'sensor.boiler', tap_action: nav }] });
        tap(cell(card, 'custom-0'));
        expect(events).toEqual([{ type: 'hass-action', detail: { config: expect.objectContaining({ tap_action: nav, entity: 'sensor.boiler' }), action: 'tap' } }]);
    });

    it('rejects a cell tap_action without an action, and an unknown cell type', () => {
        document.documentElement.lang = 'en';
        expect(() => mount({ cells: [{ type: 'grid', tap_action: { url_path: 'x' } } as never] })).toThrow(/tap_action needs an action/);
        expect(() => mount({ cells: [{ type: 'solar' } as never] })).toThrow(/is neither/);
    });

    it('rejects an unknown cell_tap', () => {
        expect(() => mount({ cell_tap: 'maybe' as never })).toThrow(/cell_tap/);
    });
});
