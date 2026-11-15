import type { EnergySkyCardConfig, HassEntity, HomeAssistant } from '../src/types';

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
    power_threshold: 20,
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
