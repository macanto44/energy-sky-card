import '../src/energy-sky-card';
import type { EnergySkyCard } from '../src/energy-sky-card';
import { CARD_NAME } from '../src/constants';
import type { EnergySkyCardConfig, HassEntity, HomeAssistant } from '../src/types';

/** The no-break space the card puts between a number and its unit */
export const nb = '\u00a0';

let tick = 0;

/** An entity with a fresh last_updated, so the card sees it as changed */
export function entity(entity_id: string, state: string | number, attributes: Record<string, unknown> = {}): HassEntity {
    const stamp = new Date(Date.UTC(2026, 10, 15, 12, 0, tick++)).toISOString();
    return { entity_id, state: String(state), attributes, last_changed: stamp, last_updated: stamp };
}

/** A hass from { entity_id: state } (or full entities), in French by default */
export function makeHass(states: Record<string, string | number | HassEntity>, language = 'fr'): HomeAssistant {
    const all: Record<string, HassEntity> = {};
    for (const [id, s] of Object.entries(states)) all[id] = typeof s === 'object' ? s : entity(id, s);
    return { states: all, language, locale: { language, number_format: 'language' } };
}

/** The user's real config (brief §7) */
export const FULL_CONFIG: EnergySkyCardConfig = {
    type: 'custom:energy-sky-card',
    production_entity: 'sensor.production_pv',
    production_max: 6000,
    daily_production_entities: ['sensor.production_solaire_sofar_jour', 'sensor.production_solaire_cabanon_jour'],
    battery: {
        soc_entity: 'sensor.victron_system_battery_soc',
        power_entity: 'sensor.victron_system_battery_power',
        power_threshold: 20,
        soc_reached_entities: ['input_boolean.verrou_batterie_manuel', 'input_boolean.ve_verrou_soc_actif', 'input_boolean.reserve_batterie_nuit', 'input_boolean.verrou_batterie_four'],
    },
    grid: {
        power_entity: 'sensor.victrongrid_ac_l1_power31',
        voltage_entity: 'sensor.grid_voltage',
        outage_entity: 'sensor.victron_vebus_alarm_gridlost_227',
        outage_states: ['warning', 'alarm'],
    },
    forecast_tomorrow_entity: 'sensor.energy_production_tomorrow_2',
    tariff_color_entity: 'sensor.edf_tempo_couleur_aujourd_hui',
    sun_entity: 'sun.sun',
};

/** The readings of brief annex B (14/11/2026) */
export const ANNEX_B: Record<string, string | number> = {
    'sensor.production_pv': 2.2,
    'sensor.production_solaire_sofar_jour': 0.0,
    'sensor.production_solaire_cabanon_jour': 0.0,
    'sensor.victron_system_battery_soc': 25.0,
    'sensor.victron_system_battery_power': 0.0,
    'sensor.victrongrid_ac_l1_power31': 748,
    'sensor.grid_voltage': 233.98,
    'sensor.victron_vebus_alarm_gridlost_227': 'no_alarm',
    'sensor.energy_production_tomorrow_2': 12.56,
    'sensor.edf_tempo_couleur_aujourd_hui': 'Bleu',
    'sun.sun': 'below_horizon',
    'input_boolean.verrou_batterie_manuel': 'off',
    'input_boolean.ve_verrou_soc_actif': 'off',
    'input_boolean.reserve_batterie_nuit': 'off',
    'input_boolean.verrou_batterie_four': 'off',
};

/** A card on the page, set up with a config and readings (states, or a whole hass) */
export function mountCard(config: EnergySkyCardConfig = FULL_CONFIG, readings: Record<string, string | number | HassEntity> | HomeAssistant = ANNEX_B): EnergySkyCard {
    const card = document.createElement(CARD_NAME) as EnergySkyCard;
    card.setConfig(config);
    card.hass = 'states' in readings && typeof readings.states === 'object' ? readings as HomeAssistant : makeHass(readings as Record<string, string | number>);
    document.body.appendChild(card);
    return card;
}

/** An element in the card's shadow root */
export const $ = (card: EnergySkyCard, selector: string) => card.shadowRoot!.querySelector(selector) as HTMLElement;

/** What the card asks Home Assistant to do: hass-action and hass-more-info events, in order */
export function actionsOf(card: HTMLElement): { type: string; detail: any }[] {
    const events: { type: string; detail: any }[] = [];
    for (const type of ['hass-action', 'hass-more-info']) card.addEventListener(type, e => events.push({ type, detail: (e as CustomEvent).detail }));
    return events;
}

/** jsdom has no PointerEvent: a MouseEvent with the pointer's type carries button and coordinates */
export const press = (el: HTMLElement, type: string, x = 10, y = 10) =>
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y }));
export const tap = (el: HTMLElement) => { press(el, 'pointerdown'); press(el, 'pointerup'); };

const MEASURES = ['scrollWidth', 'clientWidth', 'scrollHeight', 'clientHeight'] as const;

/** jsdom has no layout: give every element a measure (undo with unmeasure) */
export function measure(prop: typeof MEASURES[number], get: (el: HTMLElement) => number): void {
    Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get(this: HTMLElement) { return get(this); } });
}

/** Back to jsdom's measures (all zero) */
export function unmeasure(): void {
    for (const prop of MEASURES) delete (HTMLElement.prototype as any)[prop];
}

/** The card an element sits in */
export const hostOf = (el: Element) => (el.getRootNode() as ShadowRoot).host as HTMLElement;
