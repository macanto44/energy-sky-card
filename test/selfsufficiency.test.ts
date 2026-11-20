import { describe, it, expect, afterEach, vi } from 'vitest';
import { canComputeSelfSufficiency, energyMeters, meterIds, nextRefreshIn, selfSufficiency, todaysChanges, SELF_SUFFICIENCY_REFRESH_MS } from '../src/selfsufficiency';
import { buildView, configuredCells } from '../src/model';
import { validateConfig } from '../src/energy-sky-card';
import { editorSchema, editorLabel, schemaLeaves } from '../src/energy-sky-card-editor';
import { actionsOf, makeHass, mountCard as mount, nb, tap } from './helpers';
import type { EnergyPrefs } from '../src/stub';
import type { EnergySkyCardConfig, HomeAssistant } from '../src/types';

const PREFS: EnergyPrefs = { energy_sources: [
    { type: 'grid', stat_energy_from: 'sensor.bought', stat_energy_to: 'sensor.sold' },
    { type: 'solar', stat_energy_from: 'sensor.solar' },
    { type: 'battery', stat_energy_from: 'sensor.discharged', stat_energy_to: 'sensor.charged' },
] };
const CONFIG: EnergySkyCardConfig = { type: 'custom:energy-sky-card', production_entity: 'sensor.pv', cells: ['self_sufficiency'] };

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); });

describe('the meters', () => {
    it('reads both prefs shapes, each meter once', () => {
        expect(energyMeters(PREFS)).toEqual({ from_grid: ['sensor.bought'], to_grid: ['sensor.sold'], solar: ['sensor.solar'], from_battery: ['sensor.discharged'], to_battery: ['sensor.charged'], home: [] });
        const old: EnergyPrefs = { energy_sources: [{ type: 'grid', flow_from: [{ stat_energy_from: 'sensor.hp' }, { stat_energy_from: 'sensor.hc' }], flow_to: [{ stat_energy_to: 'sensor.out' }] }] };
        expect(energyMeters(old)).toMatchObject({ from_grid: ['sensor.hp', 'sensor.hc'], to_grid: ['sensor.out'] });
        expect(meterIds(energyMeters(PREFS))).toHaveLength(5);
        expect(canComputeSelfSufficiency(energyMeters(undefined))).toBe(false);
        expect(canComputeSelfSufficiency(energyMeters({ energy_sources: [{ type: 'solar', stat_energy_from: 'sensor.solar' }] }))).toBe(false);
    });
});

describe('the sum, as the Energy dashboard\'s gauge', () => {
    const meters = energyMeters(PREFS);

    it('is the share of the use not bought', () => {
        // Used: 2 + 10 + 3 - 4 - 1 = 10 kWh, 2 bought: 80 %
        expect(selfSufficiency(meters, { 'sensor.bought': 2, 'sensor.sold': 4, 'sensor.solar': 10, 'sensor.discharged': 3, 'sensor.charged': 1 })).toBeCloseTo(80);
    });

    it('takes the home meter as the use when there is one', () => {
        const withHome = energyMeters({ energy_sources: [...PREFS.energy_sources!, { type: 'home', stat_energy_from: 'sensor.home' }] });
        expect(selfSufficiency(withHome, { 'sensor.bought': 2, 'sensor.home': 8, 'sensor.solar': 10 })).toBeCloseTo(75);
    });

    it('stops at 0 % and 100 %, and says nothing without a grid reading or any use', () => {
        expect(selfSufficiency(meters, { 'sensor.bought': 5, 'sensor.solar': 0 })).toBe(0);
        expect(selfSufficiency(meters, { 'sensor.bought': 0, 'sensor.solar': 6 })).toBe(100);
        expect(selfSufficiency(meters, { 'sensor.solar': 6 })).toBeUndefined();
        expect(selfSufficiency(meters, { 'sensor.bought': 0 })).toBeUndefined();
        // Sold more than made: no use
        expect(selfSufficiency(meters, { 'sensor.bought': 0, 'sensor.solar': 1, 'sensor.sold': 3 })).toBeUndefined();
    });

    it('adds up several grid meters (peak, off-peak)', () => {
        const old = energyMeters({ energy_sources: [{ type: 'grid', flow_from: [{ stat_energy_from: 'sensor.hp' }, { stat_energy_from: 'sensor.hc' }] }, { type: 'solar', stat_energy_from: 'sensor.solar' }] });
        expect(selfSufficiency(old, { 'sensor.hp': 1, 'sensor.hc': 1, 'sensor.solar': 8 })).toBeCloseTo(80);
    });
});

describe('reading Home Assistant', () => {
    it('asks for each meter\'s change since midnight, an error as no reading', async () => {
        const calls: Record<string, unknown>[] = [];
        const hass = { ...makeHass({}), callWS: async (msg: Record<string, unknown>) => {
            calls.push(msg);
            if (msg.statistic_id === 'sensor.bad') throw new Error('no');
            return { change: 4.2 };
        } } as unknown as HomeAssistant;
        expect(await todaysChanges(hass, ['sensor.bought', 'sensor.bad'])).toEqual({ 'sensor.bought': 4.2, 'sensor.bad': undefined });
        expect(calls[0]).toEqual({ type: 'recorder/statistic_during_period', statistic_id: 'sensor.bought', calendar: { period: 'day' }, types: ['change'], units: { energy: 'kWh' } });
    });

    it('comes back every 5 minutes, or just after midnight', () => {
        expect(nextRefreshIn(new Date(2026, 10, 20, 12, 0))).toBe(SELF_SUFFICIENCY_REFRESH_MS);
        expect(nextRefreshIn(new Date(2026, 10, 20, 23, 58))).toBe(2 * 60_000 + 5000);
    });
});

describe('the cell', () => {
    it('is a built-in kind, shown only when asked for, with its title', () => {
        expect(() => validateConfig(CONFIG)).not.toThrow();
        expect(configuredCells({ ...CONFIG, cells: undefined }).map(c => c.kind)).not.toContain('self_sufficiency');
        const view = buildView(CONFIG, makeHass({}), { selfSufficiency: 82.4 });
        expect(view.metrics[0]).toMatchObject({ key: 'self_sufficiency', label: 'Autosuff.', value: `82${nb}%`, note: 'Autosuffisance du jour' });
        expect(buildView(CONFIG, makeHass({})).metrics[0].value).toBe('—');
        expect(buildView(CONFIG, makeHass({}, 'de'), { selfSufficiency: 82 }).metrics[0].label).toBe('Autarkie');
    });

    it('is read by the card, and opens the Energy dashboard', async () => {
        const hass = { ...makeHass({ 'sensor.pv': 0 }), callWS: async (msg: Record<string, unknown>) => {
            if (msg.type === 'energy/get_prefs') return PREFS;
            const changes: Record<string, number> = { 'sensor.bought': 2, 'sensor.sold': 4, 'sensor.solar': 10, 'sensor.discharged': 3, 'sensor.charged': 1 };
            return { change: changes[msg.statistic_id as string] };
        } } as unknown as HomeAssistant;
        const card = mount(CONFIG, hass);
        const value = () => card.shadowRoot!.querySelector('[data-metric="self_sufficiency"] .value-main')?.textContent;
        await vi.waitFor(() => expect(value()).toBe(`80${nb}%`));
        expect(card.shadowRoot!.querySelector('[data-metric="self_sufficiency"]')?.getAttribute('title')).toBe('Autosuffisance du jour');
        const fired = actionsOf(card);
        tap(card.shadowRoot!.querySelector('[data-metric="self_sufficiency"]')!);
        expect(fired.at(-1)?.detail).toMatchObject({ action: 'tap', config: { tap_action: { action: 'navigate', navigation_path: '/energy' } } });
    });

    it('reads « — » without the Energy dashboard', async () => {
        let asked = 0;
        const hass = { ...makeHass({ 'sensor.pv': 0 }), callWS: async () => { asked++; throw new Error('not set up'); } } as unknown as HomeAssistant;
        const card = mount(CONFIG, hass);
        await vi.waitFor(() => expect(asked).toBeGreaterThan(0));
        expect(card.shadowRoot!.querySelector('[data-metric="self_sufficiency"] .value-main')?.textContent).toBe('—');
    });
});

describe('the editor', () => {
    const kinds = (energy: boolean, data: Record<string, unknown> = {}) => {
        const cells = schemaLeaves(editorSchema('fr', data, energy).find(b => b.title === 'Cases')!.schema!);
        return ((cells[0].selector as { select: { options: { value: string }[] } }).select.options).map(o => o.value);
    };

    it('offers the cell with the Energy dashboard, or when a cell already shows it', () => {
        expect(kinds(true)).toContain('self_sufficiency');
        expect(kinds(false)).not.toContain('self_sufficiency');
        expect(kinds(false, { cell_2: 'self_sufficiency' })).toContain('self_sufficiency');
        expect(editorLabel('fr', 'kind_self_sufficiency')).toBe('Autosuffisance du jour');
    });
});
