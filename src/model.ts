// From the config and Home Assistant's states to what the card shows.
// Pure functions: everything here is unit-tested without a DOM.

import type { EnergySkyCardConfig, HomeAssistant } from './types';
import { energyKWh, numericState, powerW } from './utils';
import { localize, numberLocale, type NumberLocale } from './localize';
import { formatEnergy, formatKWhValue, formatPercent, formatPower, formatVoltage, powerParts, type ValueParts } from './format';

export const DEFAULT_POWER_THRESHOLD = 20;
export const DEFAULT_OUTAGE_STATES = ['warning', 'alarm'];

export type MetricKey = 'battery' | 'grid' | 'voltage' | 'tomorrow';

export const METRIC_ICONS: Record<MetricKey, string> = {
    battery: 'mdi:home-battery-outline',
    grid: 'mdi:transmission-tower',
    voltage: 'mdi:sine-wave',
    tomorrow: 'mdi:solar-power-variant-outline',
};

export interface MetricView {
    key: MetricKey;
    label: string;
    value: string;
    /** The smaller complement, " · figée" */
    extra: string;
}

export interface CardView {
    hero: ValueParts;
    /** "7,2 kWh produits", or undefined when no daily entity is configured */
    context?: string;
    metrics: MetricView[];
}

/** The metrics this config shows, in grid order. A metric without its entity disappears. */
export function configuredMetrics(config: EnergySkyCardConfig): MetricKey[] {
    const keys: MetricKey[] = [];
    if (config.battery?.soc_entity) keys.push('battery');
    if (config.grid?.power_entity) keys.push('grid');
    if (config.grid?.voltage_entity || config.grid?.outage_entity) keys.push('voltage');
    if (config.forecast_tomorrow_entity) keys.push('tomorrow');
    return keys;
}

/** Every entity whose change can change what the card shows */
export function trackedEntities(config: EnergySkyCardConfig): string[] {
    const ids = [
        config.production_entity,
        ...(config.daily_production_entities ?? []),
        config.battery?.soc_entity, config.battery?.power_entity, ...(config.battery?.lock_entities ?? []),
        config.grid?.power_entity, config.grid?.voltage_entity, config.grid?.outage_entity,
        config.forecast_tomorrow_entity, config.tariff_color_entity,
        config.sun_entity ?? 'sun.sun',
    ];
    return [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0))];
}

/**
 * Sum of the daily production entities, in kWh. An unavailable entity is
 * left out of the sum (its share is missing, the rest still shows); with
 * none available, undefined.
 */
export function dailyProduction(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    const values = (config.daily_production_entities ?? [])
        .map(id => energyKWh(hass.states[id]))
        .filter((v): v is number => v !== undefined);
    return values.length ? values.reduce((a, b) => a + b, 0) : undefined;
}

export type Direction = 'up' | 'down' | 'none';

/** Above +threshold up, below −threshold down, else none */
export function direction(power: number | undefined, threshold: number): Direction {
    if (power === undefined) return 'none';
    if (power > threshold) return 'up';
    if (power < -threshold) return 'down';
    return 'none';
}

/** True when any lock entity is on; undefined when none is configured */
export function batteryLocked(config: EnergySkyCardConfig, hass: HomeAssistant): boolean | undefined {
    const locks = config.battery?.lock_entities ?? [];
    if (!locks.length) return undefined;
    return locks.some(id => hass.states[id]?.state === 'on');
}

export function gridOutage(config: EnergySkyCardConfig, hass: HomeAssistant): boolean {
    const id = config.grid?.outage_entity;
    if (!id) return false;
    const states = (config.grid?.outage_states ?? DEFAULT_OUTAGE_STATES).map(s => String(s).toLowerCase());
    return states.includes(String(hass.states[id]?.state ?? '').toLowerCase());
}

function batteryMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale, threshold: number): MetricView {
    const soc = numericState(hass.states[config.battery!.soc_entity!]);
    const dir = config.battery?.power_entity ? direction(powerW(hass.states[config.battery.power_entity]), threshold) : 'none';
    const arrow = soc === undefined ? '' : dir === 'up' ? ' ↑' : dir === 'down' ? ' ↓' : '';
    const locked = batteryLocked(config, hass);
    return {
        key: 'battery',
        label: localize(loc.lang, 'battery'),
        value: formatPercent(soc, loc) + arrow,
        extra: locked === undefined ? '' : ` · ${localize(loc.lang, locked ? 'locked' : 'free')}`,
    };
}

/** Always "Réseau"; the sign tells the direction: "748 W" bought, "-1,8 kW" sent back (injection) */
function gridMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    return {
        key: 'grid',
        label: localize(loc.lang, 'grid'),
        value: formatPower(powerW(hass.states[config.grid!.power_entity!]), loc),
        extra: '',
    };
}

function voltageMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    const volts = config.grid?.voltage_entity ? numericState(hass.states[config.grid.voltage_entity]) : undefined;
    return {
        key: 'voltage',
        label: localize(loc.lang, 'voltage'),
        value: gridOutage(config, hass) ? localize(loc.lang, 'outage') : formatVoltage(volts, loc),
        extra: '',
    };
}

function tomorrowMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    return {
        key: 'tomorrow',
        label: localize(loc.lang, 'tomorrow'),
        value: formatEnergy(energyKWh(hass.states[config.forecast_tomorrow_entity!]), loc),
        extra: '',
    };
}

export function buildView(config: EnergySkyCardConfig, hass: HomeAssistant): CardView {
    const loc = numberLocale(hass);
    const threshold = config.power_threshold ?? DEFAULT_POWER_THRESHOLD;
    const context = config.daily_production_entities?.length
        ? localize(loc.lang, 'produced', { value: formatKWhValue(dailyProduction(config, hass), loc) })
        : undefined;
    const metrics = configuredMetrics(config).map(key => {
        switch (key) {
            case 'battery': return batteryMetric(config, hass, loc, threshold);
            case 'grid': return gridMetric(config, hass, loc);
            case 'voltage': return voltageMetric(config, hass, loc);
            case 'tomorrow': return tomorrowMetric(config, hass, loc);
        }
    });
    return { hero: powerParts(powerW(hass.states[config.production_entity]), loc), context, metrics };
}
