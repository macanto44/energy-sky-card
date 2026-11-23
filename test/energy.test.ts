import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/energy-sky-card';
import { validateConfig, type EnergySkyCard } from '../src/energy-sky-card';
import { CARD_CSS } from '../src/styles/card';
import { energyText, energyView, flowView } from '../src/flow';
import { boughtShare, dayTotals, energyMeters, homeUse } from '../src/selfsufficiency';
import { editorHelper, editorLabel, editorSchema, formData, nextConfig, schemaLeaves } from '../src/energy-sky-card-editor';
import { LANGUAGES, localize } from '../src/localize';
import { $ as find, ANNEX_B, FULL_CONFIG, actionsOf, makeHass, measure, mountCard, tap, unmeasure } from './helpers';
import type { EnergyPrefs } from '../src/stub';
import type { EnergySkyCardConfig, HomeAssistant } from '../src/types';

const nn = ' ';
const PREFS: EnergyPrefs = { energy_sources: [
    { type: 'grid', stat_energy_from: 'sensor.bought', stat_energy_to: 'sensor.sold' },
    { type: 'solar', stat_energy_from: 'sensor.solar' },
    { type: 'battery', stat_energy_from: 'sensor.discharged', stat_energy_to: 'sensor.charged' },
] };
/** Today: bought 4.2 + solar 18.6 + discharged 4.9 − sold 6.1 − charged 5.8 = 15.8 kWh used */
const CHANGES: Record<string, number> = {
    'sensor.bought': 4.2, 'sensor.sold': 6.1, 'sensor.solar': 18.6, 'sensor.discharged': 4.9, 'sensor.charged': 5.8, 'sensor.boiler_energy': 3.2,
};
const CONSUMERS = [
    { entity: 'sensor.boiler', name: 'Ballon', energy_entity: 'sensor.boiler_energy' },
    { entity: 'sensor.pool', name: 'Piscine' },
];
const CONFIG: EnergySkyCardConfig = { ...FULL_CONFIG, expandable: undefined, flow: 'always', consumers: CONSUMERS };
const READINGS = { ...ANNEX_B, 'sensor.boiler': 1200, 'sensor.pool': 0 };

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); unmeasure(); });

/** Home Assistant with an Energy dashboard (or none), counting the statistics asked for */
function withEnergy(prefs: EnergyPrefs | null) {
    const asked: string[] = [];
    const hass = { ...makeHass(READINGS), callWS: async (msg: Record<string, unknown>) => {
        if (msg.type === 'energy/get_prefs') {
            if (!prefs) throw new Error('not set up');
            return prefs;
        }
        asked.push(msg.statistic_id as string);
        return { change: CHANGES[msg.statistic_id as string] ?? null };
    } } as unknown as HomeAssistant;
    return { hass, asked };
}

function mount(config: Partial<EnergySkyCardConfig> = {}, prefs?: EnergyPrefs | null) {
    const { hass, asked } = withEnergy(prefs === undefined ? PREFS : prefs);
    const card = mountCard({ ...CONFIG, ...config } as EnergySkyCardConfig, hass);
    const $ = (sel: string) => find(card, sel);
    const value = (node: string) => $(`[data-node="${node}"] .nval`).textContent;
    return { card, $, asked, value, events: actionsOf(card) };
}

describe('today\'s totals', () => {
    const meters = energyMeters(PREFS);

    it('adds up each kind\'s meters, leaving out those not read', () => {
        expect(dayTotals(meters, { 'sensor.bought': 2, 'sensor.solar': 7 })).toEqual({ from_grid: 2, solar: 7 });
    });

    it('takes the home meter as the use, else balances the others', () => {
        const t = dayTotals(meters, CHANGES);
        expect(homeUse(t)).toBeCloseTo(15.8);
        expect(homeUse({ ...t, home: 12 })).toBe(12);
        expect(homeUse({})).toBeUndefined();
        expect(boughtShare(t)).toBeCloseTo(4.2 / 15.8);
        expect(boughtShare({ solar: 3 })).toBeUndefined();
    });
});

describe('energies as text', () => {
    const loc = { lang: 'fr', decimal: ',' } as const;

    it('writes one or two figures in kWh, and a short form without the decimal from 10 on', () => {
        expect(energyText([18.6], loc as any)).toEqual(['18,6 kWh', `19${nn}kWh`]);
        expect(energyText([4.2, 6.1], loc as any)).toEqual(['4,2 · 6,1 kWh', `4,2${nn}·${nn}6,1${nn}kWh`]);
        expect(energyText([9.96, 0.04], loc as any)[1]).toBe(`10${nn}·${nn}0,0${nn}kWh`);
    });

    it('reads « — » for a missing figure, and alone when there are none', () => {
        expect(energyText([4.2, undefined], loc as any)[0]).toBe('4,2 · — kWh');
        expect(energyText([undefined, undefined], loc as any)).toEqual(['—', '—']);
    });
});

describe('the flow in kWh', () => {
    const hass = makeHass(READINGS);
    const day = { totals: dayTotals(energyMeters(PREFS), CHANGES), consumers: [3.2, undefined] };
    const view = () => energyView(flowView(CONFIG, hass), CONFIG, hass, day);

    it('puts today\'s energies in the nodes, bought · sold and charged · discharged named by their small line', () => {
        const v = view();
        expect(v.nodes.solar.value).toBe('18,6 kWh');
        expect(v.nodes.grid).toMatchObject({ value: '4,2 · 6,1 kWh', sub: 'acheté · revendu', subShort: 'achat · vente' });
        expect(v.nodes.battery).toMatchObject({ value: '5,8 · 4,9 kWh', sub: 'chargé · déchargé' });
        expect(v.nodes.home.value).toBe('15,8 kWh');
    });

    it('drops the battery\'s estimate and keeps its charge, and the wires as they are', () => {
        const live = flowView(CONFIG, hass);
        const v = view();
        expect(v.nodes.battery.note).toBeUndefined();
        expect(v.nodes.battery.centre).toBe(live.nodes.battery.centre);
        expect(v.nodes.battery.ring).toEqual(live.nodes.battery.ring);
        expect(v.levels).toEqual(live.levels);
    });

    it('rings the home with the day\'s self-sufficiency, an appliance with its share of the day', () => {
        const v = view();
        const [[own, ownSource], [bought, boughtSource]] = v.nodes.home.ring;
        expect([ownSource, boughtSource]).toEqual(['sun', 'grid']);
        expect(bought).toBeCloseTo(4.2 / 15.8);
        expect(own + bought).toBeCloseTo(1);
        expect(v.consumers[0].share).toBeCloseTo(3.2 / 15.8);
    });

    it('shows every appliance, « — » without an energy_entity', () => {
        const v = view();
        expect(v.consumers.map(c => [c.value, c.shown])).toEqual([['3,2 kWh', true], ['—', true]]);
        expect(v.consumers[1].level).toBe(0);
    });

    it('reads « — » before the meters are read', () => {
        const v = energyView(flowView(CONFIG, hass), CONFIG, hass, undefined);
        expect([v.nodes.solar.value, v.nodes.grid.value, v.nodes.home.value]).toEqual(['—', '—', '—']);
        expect(v.nodes.home.ring).toEqual([]);
    });

    it('has its words in every language', () => {
        for (const lang of LANGUAGES) {
            for (const key of ['bought_sold', 'bought_sold_short', 'charged_discharged', 'charged_discharged_short', 'since_midnight'] as const) {
                expect(localize(lang, key), `${lang} ${key}`).toBeTruthy();
            }
        }
    });
});

describe('the card\'s kW | kWh switch', () => {
    it('shows once the Energy dashboard has meters, kW pressed, and reads no statistics in kW', async () => {
        const { $, asked, card } = mount();
        await vi.waitFor(() => expect($('.unit').hidden).toBe(false));
        expect($('[data-unit="power"]').getAttribute('aria-pressed')).toBe('true');
        expect($('[data-unit="energy"]').getAttribute('aria-pressed')).toBe('false');
        expect(card.hasAttribute('data-flow-unit')).toBe(false);
        expect(asked).toEqual([]);
    });

    it('stays hidden without an Energy dashboard, and flow_unit: energy then shows the powers', async () => {
        const { $, value } = mount({ flow_unit: 'energy' }, null);
        await vi.waitFor(() => expect(value('grid')).not.toBe('—'));
        expect($('.unit').hidden).toBe(true);
        expect(value('grid')).toMatch(/W$/);
    });

    it('switches to today\'s energies on a tap, without folding the flow or running the card\'s tap', async () => {
        // A width for the flow, so the appliances get their places (jsdom has no layout)
        measure('clientWidth', el => el.classList.contains('flow') ? 400 : 0);
        const { $, card, value, asked, events } = mount({ flow: 'tap', tap_action: { action: 'navigate', navigation_path: '/x' } });
        card.expanded = true;
        await vi.waitFor(() => expect($('.unit').hidden).toBe(false));
        tap($('[data-unit="energy"]'));
        expect(card.expanded).toBe(true);
        expect(events).toEqual([]);
        expect(card.getAttribute('data-flow-unit')).toBe('energy');
        await vi.waitFor(() => expect(value('home')).toBe('15,8 kWh'));
        expect(value('grid')).toBe('4,2 · 6,1 kWh');
        expect($('[data-node="grid"] .nsub').textContent).toBe('acheté · revendu');
        expect($('[data-consumer="0"] .nval').textContent).toBe('3,2 kWh');
        expect($('[data-consumer="1"] .nval').textContent).toBe('—');
        expect($('[data-consumer="1"]').hidden).toBe(false);
        expect($('.since').textContent).toBe('depuis 0 h');
        expect(asked).toContain('sensor.boiler_energy');
        // Back to the powers
        tap($('[data-unit="power"]'));
        expect(card.hasAttribute('data-flow-unit')).toBe(false);
        expect(value('grid')).toMatch(/W$/);
        expect($('.since').textContent).toBe('');
    });

    it('opens on kWh with flow_unit: energy, and reads them again every 5 minutes', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const { value, asked } = mount({ flow_unit: 'energy' });
        await vi.waitFor(() => expect(value('solar')).toBe('18,6 kWh'));
        const reads = asked.filter(id => id === 'sensor.solar').length;
        await vi.advanceTimersByTimeAsync(5 * 60_000 + 1000);
        expect(asked.filter(id => id === 'sensor.solar').length).toBeGreaterThan(reads);
    });

    it('reads no statistics while the flow is folded, and reads them on unfolding', async () => {
        const { card, asked, value } = mount({ flow: 'tap', flow_unit: 'energy' });
        await new Promise(r => setTimeout(r, 20));
        expect(asked).toEqual([]);
        card.expanded = true;
        await vi.waitFor(() => expect(value('solar')).toBe('18,6 kWh'));
        expect(asked).toContain('sensor.solar');
    });

    it('answers Enter on the switch', async () => {
        const { $, card } = mount();
        await vi.waitFor(() => expect($('.unit').hidden).toBe(false));
        $('[data-unit="energy"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
        expect(card.getAttribute('data-flow-unit')).toBe('energy');
    });

    it('stops the comets and fades the wires in kWh', () => {
        expect(CARD_CSS).toMatch(/:host\(\[data-motion="on"\]\[data-expanded\]:not\(\[data-flow-unit="energy"\]\)\) \.wire:not\(\[data-level="0"\]\) \.comet/);
        expect(CARD_CSS).toMatch(/:host\(\[data-flow-unit="energy"\]\) \.wires \{ opacity: 0\.4; \}/);
    });
});

describe('the sky\'s sun and the sun\'s wires', () => {
    it('styles the sky\'s sun only, never a wire from the sun (class sun too)', () => {
        // A bare .sun selector also caught the flow's sun wires: their opacity followed the sky's sun, hidden in side, under clouds, a rainbow
        expect(CARD_CSS).not.toMatch(/(?<!\.sky )(?<![\w.-])\.sun[ ,{:[>]/);
        expect(CARD_CSS).toMatch(/\.sky \.sun, \.moon, \.moonlight \{/);
    });
});

describe('the options', () => {
    it('accepts flow_unit power or energy and an appliance\'s energy_entity', () => {
        expect(() => validateConfig({ ...CONFIG, flow_unit: 'energy' })).not.toThrow();
        expect(() => validateConfig({ ...CONFIG, flow_unit: 'kwh' as any })).toThrow(/flow_unit: power or energy/);
        expect(() => validateConfig({ ...CONFIG, consumers: [{ entity: 'sensor.a', energy_entity: 3 as any }] })).toThrow(/energy_entity/);
    });

    it('offers the unit with a flow, and an appliance\'s energy meter', () => {
        const display = (data: Record<string, unknown>) => schemaLeaves(editorSchema('fr', data).find(b => b.title === 'Disposition')!.schema!).map(f => f.name);
        expect(display({ flow: 'none' })).not.toContain('flow_unit');
        expect(display({ flow: 'tap' })).toContain('flow_unit');
        expect(editorLabel('fr', 'flow_unit_energy')).toBe('Énergie du jour (kWh)');
        expect(editorLabel('fr', 'consumer_2_energy_entity')).toBe('Énergie (kWh, facultatif)');
        expect(editorHelper('fr', 'consumer_2_energy_entity')).toMatch(/« — »/);
        for (const lang of LANGUAGES) {
            for (const key of ['flow_unit', 'flow_unit_power', 'flow_unit_energy', 'consumer_1_energy_entity']) expect(editorLabel(lang, key), `${lang} ${key}`).not.toBe(key);
        }
    });

    it('saves flow_unit only when energy, drops it with the flow, and keeps an appliance\'s energy_entity', () => {
        const config: EnergySkyCardConfig = { type: 'custom:energy-sky-card', production_entity: 'sensor.pv', flow: 'tap', consumers: CONSUMERS };
        const data = formData(config);
        expect(data.flow_unit).toBe('power');
        expect(data.consumer_1_energy_entity).toBe('sensor.boiler_energy');
        expect(nextConfig(config, data).flow_unit).toBeUndefined();
        const energy = nextConfig(config, { ...data, flow_unit: 'energy' });
        expect(energy.flow_unit).toBe('energy');
        expect(energy.consumers).toEqual(CONSUMERS);
        expect(nextConfig(energy, { ...formData(energy), flow: 'none' }).flow_unit).toBeUndefined();
        expect(nextConfig(config, { ...data, consumer_2_energy_entity: 'sensor.pool_energy' }).consumers?.[1]).toEqual({ ...CONSUMERS[1], energy_entity: 'sensor.pool_energy' });
    });
});
