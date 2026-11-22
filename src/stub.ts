// The config a new card starts with (card picker): read from Home Assistant's
// Energy dashboard when it is set up, and from the sensors sitting on the same
// devices; the first power sensor found otherwise. Pure: hass and the energy
// preferences in, a config out.

import type { EnergySkyCardConfig, HomeAssistant } from './types';

/**
 * The slice of energy/get_prefs the card reads. Two shapes exist: grids with
 * flow_from / flow_to lists and a power list (2024–2025), and grids with
 * stat_energy_from / stat_energy_to and stat_rate / power_config (newer).
 */
export interface EnergyPrefs {
    energy_sources?: EnergySource[];
}

interface PowerConfig {
    stat_rate?: string;
    stat_rate_inverted?: string;
    /** Two positive sensors: from the source (grid import, battery discharge) and to it (export, charge) */
    stat_rate_from?: string;
    stat_rate_to?: string;
}

/** The two positive sensors of a power config, when Home Assistant has them both */
function powerPair(hass: HomeAssistant, config: PowerConfig | undefined): [string, string] | undefined {
    const from = config?.stat_rate_from;
    const to = config?.stat_rate_to;
    return from && to && hass.states[from] && hass.states[to] ? [from, to] : undefined;
}

export interface EnergySource {
    type: string;
    stat_energy_from?: string | null;
    stat_energy_to?: string | null;
    stat_rate?: string;
    stat_soc?: string;
    power_config?: PowerConfig;
    config_entry_solar_forecast?: string[] | null;
    flow_from?: { stat_energy_from?: string | null }[];
    flow_to?: { stat_energy_to?: string | null }[];
    power?: { stat_rate?: string }[];
}

const TEMPO_COLOURS = ['bleu', 'blanc', 'rouge'];
const TOMORROW = /tomorrow|demain/i;
const TODAY = /today|daily|jour|_day(_|$)/i;
const YESTERDAY = /yesterday|hier|week|month|year|semaine|mois|annee|total|lifetime/i;

/** The first power sensor, as before the Energy dashboard was read */
function anyPowerSensor(hass?: HomeAssistant): string | undefined {
    return Object.values(hass?.states ?? {}).find(s =>
        s.entity_id.startsWith('sensor.') &&
        (s.attributes.device_class === 'power' || s.attributes.unit_of_measurement === 'W'))?.entity_id;
}

/** Today's Tempo colour: a sensor named tempo, reading Bleu / Blanc / Rouge, not tomorrow's */
function tempoSensor(hass?: HomeAssistant): string | undefined {
    return Object.values(hass?.states ?? {}).find(s =>
        s.entity_id.startsWith('sensor.') && /tempo/i.test(s.entity_id) && !TOMORROW.test(s.entity_id) &&
        TEMPO_COLOURS.includes(String(s.state).toLowerCase()))?.entity_id;
}

/** A weather entity with a reading, for the weather sky */
function weatherEntity(hass?: HomeAssistant): string | undefined {
    return Object.values(hass?.states ?? {}).find(s =>
        s.entity_id.startsWith('weather.') && !['unavailable', 'unknown'].includes(String(s.state)))?.entity_id;
}

/** The sensors on the same device as `entity` (from the entity registry), matching `test` */
function siblings(hass: HomeAssistant, entity: string | null | undefined, test: (id: string, dc: unknown) => boolean): string[] {
    const device = entity ? hass.entities?.[entity]?.device_id : undefined;
    if (!device) return [];
    return Object.values(hass.entities ?? {})
        .filter(e => e.device_id === device && e.entity_id.startsWith('sensor.') && hass.states[e.entity_id])
        .map(e => e.entity_id)
        .filter(id => test(id, hass.states[id].attributes.device_class));
}

const deviceClass = (wanted: string) => (_: string, dc: unknown) => dc === wanted;
const first = <T>(list: T[]): T | undefined => list[0];

/** A power sensor from an energy source: its own stat_rate, else one on the meter's device */
function powerOf(hass: HomeAssistant, rate: string | undefined, meter: string | null | undefined): string | undefined {
    return (rate && hass.states[rate] ? rate : undefined) ?? first(siblings(hass, meter, deviceClass('power')));
}

/** The config read from the Energy dashboard's sources; empty when there are none */
export function configFromEnergy(prefs: EnergyPrefs | undefined, hass: HomeAssistant): Partial<EnergySkyCardConfig> {
    const sources = prefs?.energy_sources ?? [];
    const config: Partial<EnergySkyCardConfig> = {};

    const solar = sources.filter(s => s.type === 'solar');
    const production = [...new Set(solar.map(s => powerOf(hass, s.stat_rate, s.stat_energy_from)).filter((id): id is string => !!id))];
    if (production.length) config.production_entity = production.length === 1 ? production[0] : production;
    // Daily meters: the energy sensors on the inverters' devices whose names say "today"
    const daily = [...new Set(solar.flatMap(s => siblings(hass, s.stat_energy_from,
        (id, dc) => dc === 'energy' && TODAY.test(id) && !YESTERDAY.test(id) && !TOMORROW.test(id))))];
    if (daily.length) config.daily_production_entities = daily;
    // Forecast.Solar (or any forecast) for tomorrow, when the dashboard has a forecast
    if (solar.some(s => s.config_entry_solar_forecast?.length)) {
        const forecast = Object.values(hass.entities ?? {}).find(e =>
            e.entity_id.startsWith('sensor.') && TOMORROW.test(e.entity_id) && /forecast|solcast|production/i.test(`${e.platform} ${e.entity_id}`) &&
            hass.states[e.entity_id]?.attributes.device_class === 'energy')?.entity_id;
        if (forecast) config.forecast_tomorrow_entity = forecast;
    }

    const battery = sources.find(s => s.type === 'battery');
    if (battery) {
        const meter = battery.stat_energy_from ?? battery.stat_energy_to;
        const soc = (battery.stat_soc && hass.states[battery.stat_soc] ? battery.stat_soc : undefined) ?? first(siblings(hass, meter, deviceClass('battery')));
        const rate = battery.power_config?.stat_rate ?? battery.stat_rate;
        const pair = powerPair(hass, battery.power_config);
        const power = pair ? undefined : powerOf(hass, rate, meter);
        const temperature = first(siblings(hass, meter, deviceClass('temperature')));
        const b: NonNullable<EnergySkyCardConfig['battery']> = {};
        if (soc) b.soc_entity = soc;
        if (power) b.power_entity = power;
        // Two sensors: energy comes from the battery when it discharges, goes to it when it charges
        if (pair) Object.assign(b, { charge_entity: pair[1], discharge_entity: pair[0] });
        // Home Assistant's battery power is positive when discharging; the card's, when charging
        if (power && rate && power === rate) b.invert = true;
        if (temperature) b.temperature_entity = temperature;
        if (Object.keys(b).length) config.battery = b;
    }

    const grid = sources.find(s => s.type === 'grid');
    if (grid) {
        const meter = grid.stat_energy_from ?? grid.flow_from?.[0]?.stat_energy_from ?? grid.stat_energy_to ?? grid.flow_to?.[0]?.stat_energy_to;
        const inverted = grid.power_config?.stat_rate_inverted;
        const rate = grid.power_config?.stat_rate ?? grid.stat_rate ?? grid.power?.[0]?.stat_rate;
        const g: NonNullable<EnergySkyCardConfig['grid']> = {};
        const pair = powerPair(hass, grid.power_config);
        if (pair) Object.assign(g, { import_entity: pair[0], export_entity: pair[1] });
        else if (inverted && hass.states[inverted]) Object.assign(g, { power_entity: inverted, invert: true });
        else {
            // Home Assistant's grid power is positive when importing, like the card's
            const power = powerOf(hass, rate, meter);
            if (power) g.power_entity = power;
        }
        const voltage = first(siblings(hass, meter, deviceClass('voltage')));
        if (voltage) g.voltage_entity = voltage;
        if (Object.keys(g).length) config.grid = g;
    }

    const home = sources.find(s => s.type === 'home');
    if (home?.stat_rate && hass.states[home.stat_rate]) config.consumption_entity = home.stat_rate;
    return config;
}

/**
 * The new card's config: the Energy dashboard's sensors when it has some, the sun, and the sky: the weather
 * when Home Assistant has a weather entity, else today's tariff colour (Tempo) when a sensor gives it.
 */
export function stubConfig(hass?: HomeAssistant, prefs?: EnergyPrefs): Partial<EnergySkyCardConfig> {
    const fromEnergy = hass ? configFromEnergy(prefs, hass) : {};
    const weather = weatherEntity(hass);
    const tariff = weather ? undefined : tempoSensor(hass);
    return {
        production_entity: anyPowerSensor(hass) ?? 'sensor.production_pv',
        ...fromEnergy,
        ...(weather ? { background: 'weather' as const, weather_entity: weather } : {}),
        ...(tariff ? { tariff_color_entity: tariff } : {}),
        sun_entity: 'sun.sun',
    };
}

/** The Energy dashboard's preferences, or nothing (not set up, no permission, an older Home Assistant) */
export async function energyPrefs(hass?: HomeAssistant): Promise<EnergyPrefs | undefined> {
    try {
        return await hass?.callWS?.<EnergyPrefs>({ type: 'energy/get_prefs' });
    } catch {
        return undefined;
    }
}
