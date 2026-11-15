import { describe, it, expect } from 'vitest';
import { EnergySkyCard, validateConfig } from '../src/energy-sky-card';
import { CARD_NAME } from '../src/constants';
import type { EnergySkyCardConfig, HomeAssistant } from '../src/types';
import { ANNEX_B, FULL_CONFIG, entity, makeHass } from './helpers';

const nb = ' ';

function mount(config: EnergySkyCardConfig = FULL_CONFIG, hass: HomeAssistant = makeHass(ANNEX_B)): EnergySkyCard {
    const card = document.createElement(CARD_NAME) as EnergySkyCard;
    card.setConfig(config);
    card.hass = hass;
    document.body.appendChild(card);
    return card;
}
const $ = (card: EnergySkyCard, sel: string) => card.shadowRoot!.querySelector(sel) as HTMLElement;
const metricText = (card: EnergySkyCard, key: string) => $(card, `[data-metric="${key}"]`)?.textContent?.replace(/[ \n\t]+/g, ' ').trim();

describe('registration', () => {
    it('defines the custom element and lists it in the card picker', () => {
        expect(customElements.get(CARD_NAME)).toBe(EnergySkyCard);
        expect(window.customCards?.some(c => c.type === CARD_NAME)).toBe(true);
    });
});

describe('setConfig', () => {
    it('requires production_entity, in French when the page is French', () => {
        document.documentElement.lang = 'fr';
        expect(() => validateConfig({ type: 'x' })).toThrow('production_entity est obligatoire');
        document.documentElement.lang = 'en';
        expect(() => validateConfig({ type: 'x' })).toThrow('production_entity is required');
    });

    it('rejects malformed lists and numbers', () => {
        document.documentElement.lang = 'en';
        expect(() => validateConfig({ type: 'x', production_entity: 'sensor.pv', daily_production_entities: 'sensor.a' })).toThrow('daily_production_entities must be a list');
        expect(() => validateConfig({ type: 'x', production_entity: 'sensor.pv', production_max: -1 })).toThrow('production_max must be a positive number');
    });
});

describe('render', () => {
    it('shows the hero, the context line and the four metrics', () => {
        const card = mount();
        expect($(card, '.hero-value').textContent).toBe('2');
        expect($(card, '.hero-unit').textContent).toBe('W');
        expect($(card, '.context').textContent).toBe('0,0 kWh produits');
        expect(metricText(card, 'battery')).toBe(`Batterie 25${nb}%`);
        expect(metricText(card, 'grid')).toBe(`Réseau 748${nb}W`);
        card.hass = makeHass({ ...ANNEX_B, 'input_boolean.reserve_batterie_nuit': 'on' });
        expect($(card, '[data-metric="battery"] .extra-full')?.textContent).toBe(' · SOC atteint');
        expect($(card, '[data-metric="battery"] .extra-short')?.textContent).toBe(' · SOC ✓');
        card.hass = makeHass(ANNEX_B);
        // The 0.1.0 option name still works
        const { soc_reached_entities, ...battery } = FULL_CONFIG.battery!;
        const old = mount({ ...FULL_CONFIG, battery: { ...battery, lock_entities: soc_reached_entities } }, makeHass({ ...ANNEX_B, 'input_boolean.reserve_batterie_nuit': 'on' }));
        expect($(old, '[data-metric="battery"] .extra-full')?.textContent).toBe(' · SOC atteint');
        expect(metricText(card, 'voltage')).toBe(`Tension 234${nb}V`);
        expect(metricText(card, 'tomorrow')).toBe(`Prévu demain 12,6${nb}kWh`);
        expect(card.shadowRoot!.querySelectorAll('ha-icon').length).toBe(4);
    });

    it('drops the cells, and the context line, that are not configured', () => {
        const card = mount({ type: 'x', production_entity: 'sensor.production_pv', grid: { power_entity: 'sensor.victrongrid_ac_l1_power31' } });
        expect(card.shadowRoot!.querySelectorAll('.metric').length).toBe(1);
        expect($(card, '.context').hidden).toBe(true);
    });

    it('updates text in place, without rebuilding the DOM', () => {
        const card = mount();
        const heroNode = $(card, '.hero-value');
        const gridNode = $(card, '[data-metric="grid"]');
        card.hass = makeHass({ ...ANNEX_B, 'sensor.production_pv': 3249, 'sensor.victrongrid_ac_l1_power31': -1200 });
        expect($(card, '.hero-value')).toBe(heroNode);
        expect($(card, '[data-metric="grid"]')).toBe(gridNode);
        expect(heroNode.textContent).toBe('3,2');
        expect($(card, '.hero-unit').textContent).toBe('kW');
        expect(metricText(card, 'grid')).toBe(`Réseau -1,2${nb}kW`);
    });

    it('skips the render when no tracked entity changed', () => {
        const hass = makeHass(ANNEX_B);
        const card = mount(FULL_CONFIG, hass);
        $(card, '.hero-value').textContent = 'marker';
        // A new hass object where only an untracked entity changed
        card.hass = { ...hass, states: { ...hass.states, 'sensor.other': entity('sensor.other', 1) } };
        expect($(card, '.hero-value').textContent).toBe('marker');
        // A tracked entity changed: rendered again
        card.hass = { ...hass, states: { ...hass.states, 'sensor.production_pv': entity('sensor.production_pv', 5) } };
        expect($(card, '.hero-value').textContent).toBe('5');
    });

    it('never puts entity text into the markup', () => {
        const card = mount(FULL_CONFIG, makeHass({ ...ANNEX_B, 'sensor.victron_system_battery_soc': '<img src=x onerror=alert(1)>' }));
        expect(card.shadowRoot!.querySelector('img')).toBeNull();
    });
});

describe('sizing and stub', () => {
    it('asks the sections view for 12 × 4, never under 6 × 3', () => {
        const card = document.createElement(CARD_NAME) as EnergySkyCard;
        expect(card.getGridOptions()).toEqual({ columns: 12, rows: 4, min_columns: 6, min_rows: 3 });
    });

    it('prefills the first power sensor and sun.sun', () => {
        const hass = makeHass({
            'sensor.temp': entity('sensor.temp', 20, { unit_of_measurement: '°C' }),
            'sensor.pv': entity('sensor.pv', 1200, { device_class: 'power' }),
        });
        expect(EnergySkyCard.getStubConfig(hass)).toEqual({ production_entity: 'sensor.pv', sun_entity: 'sun.sun' });
    });
});

describe('background', () => {
    it('paints the day in the tariff colours, with the halo', () => {
        const card = mount(FULL_CONFIG, makeHass({ ...ANNEX_B, 'sun.sun': 'above_horizon', 'sensor.edf_tempo_couleur_aujourd_hui': 'Rouge', 'sensor.production_pv': 3000 }));
        const haCard = $(card, 'ha-card');
        expect(card.dataset.mode).toBe('day');
        expect(card.hasAttribute('data-producing')).toBe(true);
        expect(haCard.style.getPropertyValue('--esc-c0')).toBe('#d2766a');
        expect(haCard.style.getPropertyValue('--esc-halo-alpha')).toBe('0.275');
    });

    it('turns to night, with 38 stars and a shooting star', () => {
        const card = mount();
        expect(card.dataset.mode).toBe('night');
        expect(card.shadowRoot!.querySelectorAll('.layer.night .star').length).toBe(38);
        expect(card.shadowRoot!.querySelectorAll('.layer.night .shooting').length).toBe(1);
        expect(card.shadowRoot!.querySelectorAll('.star.twinkle').length).toBe(14);
    });

    it('rejects a palette that is not three hex colours', () => {
        document.documentElement.lang = 'en';
        expect(() => validateConfig({ type: 'x', production_entity: 'sensor.pv', tariff_palettes: { Bleu: ['#fff', 'red', '#000'] } }))
            .toThrow('tariff_palettes.Bleu: expected 3 hex colours');
        expect(() => validateConfig({ type: 'x', production_entity: 'sensor.pv', tariff_palettes: { Bleu: ['#fff', '#000'] } }))
            .toThrow('tariff_palettes.Bleu');
    });
});
