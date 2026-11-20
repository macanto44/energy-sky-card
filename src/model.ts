// From the config and Home Assistant's states to what the card shows.
// Pure functions: everything here is unit-tested without a DOM.

import type { BuiltinCell, CellConfig, CellKind, CustomCell, EnergySkyCardConfig, HomeAssistant } from './types';
import { energyKWh, numericState, powerW } from './utils';
import { localize, numberLocale, type NumberLocale } from './localize';
import { NO_VALUE, formatEnergy, joinParts, formatKWhValue, formatNumber, formatPercent, formatPower, formatTemperature, formatVoltage, powerParts, type ValueParts } from './format';

export const DEFAULT_POWER_THRESHOLD = 20;
export const DEFAULT_OUTAGE_STATES = ['warning', 'alarm'];

/** A cell's id: its kind for a built-in one, "custom-<n>" for a free one (its place in cells) */
export type MetricKey = string;

export const METRIC_ICONS: Record<CellKind, string> = {
    battery: 'mdi:home-battery-outline',
    grid: 'mdi:transmission-tower',
    voltage: 'mdi:sine-wave',
    tomorrow: 'mdi:solar-power-variant-outline',
    consumption: 'mdi:home-lightning-bolt-outline',
};
export const CUSTOM_CELL_ICON = 'mdi:gauge';
export const CELL_KINDS = Object.keys(METRIC_ICONS) as CellKind[];
export const MAX_CELLS = 4;
/** Appliances in the energy flow, at most */
export const MAX_CONSUMERS = 4;

export interface MetricView {
    key: MetricKey;
    label: string;
    value: string;
    /** The smaller complement, " · SOC atteint" */
    extra: string;
    /** The complement for a cell too narrow for it, " · SOC ✓" */
    extraShort: string;
    /**
     * The last resort for a cell still too wide with the short complement:
     * « 100 % ↓ · -13° ✓ », narrow spaces (a battery with its temperature)
     */
    tight?: { value: string; extra: string };
    /** The side layout's last resort, the value without its complement: « 100 % ↓ » (a battery with its temperature) */
    bare?: string;
    /** The icon, for a free cell (its config's, else its entity's) */
    icon?: string;
}

/**
 * A cell's text at a level of shortening: 0 in full, 1 the short
 * complement (« SOC ✓ »), 2 the tight form where the cell has one
 * (« 100 % ↓ · -13° ✓ »), 3 no complement at all (« 78 % ↑ », side only)
 */
export function metricForm(m: MetricView, level: number): { value: string; extra: string } {
    if (level >= 3) return { value: m.bare ?? m.value, extra: '' };
    if (level >= 2 && m.tight) return m.tight;
    return { value: m.value, extra: level >= 1 ? m.extraShort : m.extra };
}

export interface CardView {
    hero: ValueParts;
    /** "7,2 kWh produits" (at night, with what the hero shows in front), or undefined: no line */
    context?: string;
    /** The same, shorter, for a narrow card: "Conso. · 7,2 kWh produits" */
    contextShort?: string;
    metrics: MetricView[];
}

/** One cell of the grid, resolved from the config */
export interface CellSpec {
    key: MetricKey;
    kind: CellKind | 'custom';
    custom?: CustomCell;
    /** The cell's own tap action, from its config */
    tapAction?: Record<string, unknown>;
}

export const isCustom = (cell: CellConfig): cell is CustomCell =>
    typeof cell === 'object' && cell !== null && typeof (cell as CustomCell).entity === 'string';
export const isBuiltinObject = (cell: CellConfig): cell is BuiltinCell =>
    typeof cell === 'object' && cell !== null && !isCustom(cell) && typeof (cell as BuiltinCell).type === 'string';
/** A cell's kind, written as a string or as { type } */
export const cellKind = (cell: CellConfig): CellKind | undefined =>
    typeof cell === 'string' ? cell : isBuiltinObject(cell) ? cell.type : undefined;

/** The built-in cells whose entities are set, in their usual order */
export function defaultCells(config: EnergySkyCardConfig): CellKind[] {
    const kinds: CellKind[] = [];
    if (batterySocEntities(config).length) kinds.push('battery');
    if (gridPowerEntities(config).length) kinds.push('grid');
    if (config.grid?.voltage_entity || config.grid?.outage_entity) kinds.push('voltage');
    if (config.forecast_tomorrow_entity) kinds.push('tomorrow');
    return kinds;
}

/**
 * The cells this config shows, in grid order: the config's cells (at most
 * four), else the built-in ones whose entities are set (a cell without its
 * entity disappears).
 */
export function configuredCells(config: EnergySkyCardConfig): CellSpec[] {
    if (!config.cells) return defaultCells(config).map(kind => ({ key: kind, kind }));
    const used = new Set<string>();
    return config.cells.slice(0, MAX_CELLS).flatMap((cell, i): CellSpec[] => {
        if (isCustom(cell)) return [{ key: `custom-${i}`, kind: 'custom', custom: cell, ...(cell.tap_action ? { tapAction: cell.tap_action } : {}) }];
        const kind = cellKind(cell);
        if (!kind || used.has(kind)) return [];
        used.add(kind);
        return [{ key: kind, kind, ...(isBuiltinObject(cell) && cell.tap_action ? { tapAction: cell.tap_action } : {}) }];
    });
}

/** The entity a tap on a cell opens: the one its value comes from */
export function cellEntity(config: EnergySkyCardConfig, cell: CellSpec): string | undefined {
    switch (cell.kind) {
        case 'battery': return batterySocEntities(config)[0];
        case 'grid': return gridPowerEntities(config)[0] ?? config.grid?.outage_entity;
        case 'voltage': return config.grid?.voltage_entity ?? config.grid?.outage_entity;
        case 'tomorrow': return config.forecast_tomorrow_entity;
        case 'consumption': return config.consumption_entity;
        case 'custom': return cell.custom?.entity;
    }
}

/** The cells' keys, in grid order */
export function configuredMetrics(config: EnergySkyCardConfig): MetricKey[] {
    return configuredCells(config).map(c => c.key);
}

/** The production entities, one or several */
export function productionEntities(config: Pick<EnergySkyCardConfig, 'production_entity'>): string[] {
    const p = config.production_entity;
    return (Array.isArray(p) ? p : [p]).filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/**
 * The solar power now, in W: the sum of the production entities. An
 * unavailable one is left out; with none available, undefined.
 */
export function productionPower(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    const values = productionEntities(config).map(id => powerW(hass.states[id])).filter((v): v is number => v !== undefined);
    if (!values.length) return undefined;
    const total = values.reduce((a, b) => a + b, 0);
    // Below production_threshold (a charge controller's own draw, say), nothing is produced
    return config.production_threshold && total < config.production_threshold ? 0 : total;
}

const signed = (value: number | undefined, invert: boolean | undefined) =>
    value === undefined || !invert ? value : -value;

/** An entity option written as one id or a list, as a list (empty ids dropped) */
export const entityList = (value: string | string[] | undefined): string[] =>
    (Array.isArray(value) ? value : value ? [value] : []).filter(id => typeof id === 'string' && id.length > 0);

/** The battery's charge sensors (one per battery) */
export const batterySocEntities = (config: EnergySkyCardConfig): string[] => entityList(config.battery?.soc_entity);

/** The battery's power sensors: the signed ones, or the charge and discharge ones */
export const batteryPowerEntities = (config: EnergySkyCardConfig): string[] => [
    ...entityList(config.battery?.power_entity), ...entityList(config.battery?.charge_entity), ...entityList(config.battery?.discharge_entity),
];

/** The grid's power sensors: the signed one, or the import and export ones */
export const gridPowerEntities = (config: EnergySkyCardConfig): string[] => [
    ...entityList(config.grid?.power_entity), ...entityList(config.grid?.import_entity), ...entityList(config.grid?.export_entity),
];

/** The sum of these sensors' powers in W (an unavailable one left out), or undefined when none reads */
function powerSum(ids: string[], hass: HomeAssistant, magnitude = false): number | undefined {
    const values = ids.map(id => powerW(hass.states[id])).filter((v): v is number => v !== undefined);
    return values.length ? values.reduce((a, b) => a + (magnitude ? Math.abs(b) : b), 0) : undefined;
}

/** In - out, each a sum of positive powers; one missing counts 0, both missing is no reading */
function difference(into: string[], out: string[], hass: HomeAssistant): number | undefined {
    const a = powerSum(into, hass, true);
    const b = powerSum(out, hass, true);
    return a === undefined && b === undefined ? undefined : (a ?? 0) - (b ?? 0);
}

/** Minutes without a reading before a value is stale, unless stale_after says otherwise */
export const DEFAULT_STALE_MINUTES = 30;

/**
 * The readings that have gone quiet: no report for stale_after minutes,
 * read from last_reported (Home Assistant 2024.3+), which moves with every
 * reading, even an unchanged one. last_updated only moves on a change, so
 * a battery idling at 0 W would look stale: without last_reported, nothing
 * is flagged. Only measures count (powers, charge, temperature, voltage,
 * free cells), not the tariff, the sun, the forecast or on / off switches.
 * Each with how long ago it last reported, in minutes.
 */
export function staleReadings(config: EnergySkyCardConfig, hass: HomeAssistant, now = Date.now()): Map<string, number> {
    const minutes = config.stale_after ?? DEFAULT_STALE_MINUTES;
    const stale = new Map<string, number>();
    if (!(minutes > 0)) return stale;
    const ids = [
        ...productionEntities(config), config.consumption_entity,
        ...batterySocEntities(config), ...batteryPowerEntities(config), config.battery?.temperature_entity,
        ...gridPowerEntities(config), config.grid?.voltage_entity,
        ...(config.cells ?? []).filter(isCustom).map(c => c.entity),
        ...(config.consumers ?? []).map(c => c.entity),
    ];
    for (const id of ids) {
        const reported = Date.parse(hass.states[id ?? '']?.last_reported ?? '');
        if (!Number.isFinite(reported)) continue;
        const age = (now - reported) / 60000;
        if (age >= minutes) stale.set(id!, Math.floor(age));
    }
    return stale;
}

/** Grid power in W, positive when importing (the sensor's sign flipped with grid.invert) */
export function gridPower(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    const grid = config.grid;
    if (grid?.import_entity || grid?.export_entity) return difference(entityList(grid.import_entity), entityList(grid.export_entity), hass);
    return signed(powerW(hass.states[grid?.power_entity ?? '']), grid?.invert);
}

/** Battery power in W, positive when charging (flipped with battery.invert), every battery summed */
export function batteryPower(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    const battery = config.battery;
    if (battery?.charge_entity || battery?.discharge_entity) return difference(entityList(battery.charge_entity), entityList(battery.discharge_entity), hass);
    return signed(powerSum(entityList(battery?.power_entity), hass), battery?.invert);
}

/** The batteries' charge in %: their average, weighted by capacity when there is one per battery; unavailable ones left out */
export function batterySoc(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    const ids = batterySocEntities(config);
    const capacity = config.battery?.capacity;
    const weights = Array.isArray(capacity) && capacity.length === ids.length ? capacity : undefined;
    let sum = 0;
    let weight = 0;
    ids.forEach((id, i) => {
        const soc = numericState(hass.states[id]);
        if (soc === undefined) return;
        const w = weights ? weights[i] : 1;
        sum += soc * w;
        weight += w;
    });
    return weight > 0 ? sum / weight : undefined;
}

/** Every entity whose change can change what the card shows */
export function trackedEntities(config: EnergySkyCardConfig): string[] {
    const ids = [
        ...productionEntities(config),
        config.consumption_entity,
        ...(config.cells ?? []).filter(isCustom).map(c => c.entity),
        ...(config.consumers ?? []).map(c => c.entity),
        ...(config.daily_production_entities ?? []),
        ...batterySocEntities(config), ...batteryPowerEntities(config), config.battery?.temperature_entity, ...(config.battery?.soc_reached_entities ?? []),
        ...gridPowerEntities(config), config.grid?.voltage_entity, config.grid?.outage_entity,
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

/** True when any « SOC atteint » entity is on; undefined when none is configured */
export function socReached(config: EnergySkyCardConfig, hass: HomeAssistant): boolean | undefined {
    const ids = config.battery?.soc_reached_entities ?? [];
    if (!ids.length) return undefined;
    return ids.some(id => hass.states[id]?.state === 'on');
}

export function gridOutage(config: EnergySkyCardConfig, hass: HomeAssistant): boolean {
    const id = config.grid?.outage_entity;
    if (!id) return false;
    const states = (config.grid?.outage_states ?? DEFAULT_OUTAGE_STATES).map(s => String(s).toLowerCase());
    return states.includes(String(hass.states[id]?.state ?? '').toLowerCase());
}

function batteryMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale, threshold: number): MetricView {
    const soc = batterySoc(config, hass);
    const dir = direction(batteryPower(config, hass), threshold);
    const arrow = soc === undefined ? '' : dir === 'up' ? ' ↑' : dir === 'down' ? ' ↓' : '';
    const reached = socReached(config, hass);
    const tempEntity = hass.states[config.battery?.temperature_entity ?? ''];
    const temp = numericState(tempEntity);
    const charge = formatPercent(soc, loc) + arrow;
    const unit = String(tempEntity?.attributes.unit_of_measurement ?? '');
    return {
        key: 'battery',
        label: localize(loc.lang, 'battery'),
        value: temp === undefined ? charge : `${charge} · ${formatTemperature(temp, unit, loc)}`,
        extra: reached ? ` · ${localize(loc.lang, 'soc_reached')}` : '',
        extraShort: reached ? ` · ${localize(loc.lang, 'soc_reached_short')}` : '',
        ...(temp === undefined ? {} : { tight: { value: `${charge}\u202F·\u202F${formatNumber(Math.round(temp), 0, loc)}°`, extra: reached ? '\u202F✓' : '' }, bare: charge }),
    };
}

/** Always "Réseau"; the sign tells the direction: "748 W" bought, "-1,8 kW" sent back (injection) */
function gridMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    return {
        key: 'grid',
        label: localize(loc.lang, 'grid'),
        value: formatPower(gridPower(config, hass), loc),
        extra: '', extraShort: '',
    };
}

function voltageMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    const volts = config.grid?.voltage_entity ? numericState(hass.states[config.grid.voltage_entity]) : undefined;
    return {
        key: 'voltage',
        label: localize(loc.lang, 'voltage'),
        value: gridOutage(config, hass) ? localize(loc.lang, 'outage') : formatVoltage(volts, loc),
        extra: '', extraShort: '',
    };
}

function tomorrowMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    return {
        key: 'tomorrow',
        label: localize(loc.lang, 'tomorrow'),
        value: formatEnergy(energyKWh(hass.states[config.forecast_tomorrow_entity ?? '']), loc),
        extra: '', extraShort: '',
    };
}

function consumptionMetric(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): MetricView {
    return {
        key: 'consumption',
        label: localize(loc.lang, 'consumption'),
        value: formatPower(powerW(hass.states[config.consumption_entity ?? '']), loc),
        extra: '', extraShort: '',
    };
}

/**
 * A free cell. Powers read like the card's own (W / kW); anything else as
 * Home Assistant formats it (unit, precision, translated states), or the
 * raw state and unit on older versions. Name: the cell's, else the entity's.
 */
export function customMetric(spec: CellSpec, hass: HomeAssistant, loc: NumberLocale): MetricView {
    const cell = spec.custom!;
    const entity = hass.states[cell.entity];
    const unit = String(entity?.attributes.unit_of_measurement ?? '');
    let value: string;
    if (!entity || numericState(entity) === undefined && ['unavailable', 'unknown', ''].includes(entity.state)) value = NO_VALUE;
    else if (/^[mk]?w$/i.test(unit)) value = formatPower(powerW(entity), loc);
    else if (hass.formatEntityState) value = hass.formatEntityState(entity);
    else {
        const n = numericState(entity);
        value = n === undefined ? entity.state : joinParts({ value: formatNumber(n, Number.isInteger(n) ? 0 : 1, loc), unit });
    }
    const icon = cell.icon || (typeof entity?.attributes.icon === 'string' ? entity.attributes.icon : '') || CUSTOM_CELL_ICON;
    return {
        key: spec.key,
        label: cell.name || String(entity?.attributes.friendly_name ?? cell.entity),
        value, extra: '', extraShort: '', icon,
    };
}

/** True when the sun entity says the sun is down */
export function isNight(config: EnergySkyCardConfig, hass: HomeAssistant): boolean {
    return hass.states[config.sun_entity ?? 'sun.sun']?.state === 'below_horizon';
}

/**
 * The hero and the word put before the context line: the solar power, or
 * at night (night_hero) the home's consumption or the battery's charge.
 */
function heroView(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale): { hero: ValueParts; label?: string; labelShort?: string } {
    const mode = isNight(config, hass) ? config.night_hero ?? 'production' : 'production';
    if (mode === 'consumption' && config.consumption_entity) {
        return { hero: powerParts(powerW(hass.states[config.consumption_entity]), loc), label: localize(loc.lang, 'consumption'), labelShort: localize(loc.lang, 'consumption_short') };
    }
    if (mode === 'battery' && batterySocEntities(config).length) {
        const soc = batterySoc(config, hass);
        return {
            hero: soc === undefined ? { value: NO_VALUE, unit: '' } : { value: formatNumber(Math.round(soc), 0, loc), unit: '%' },
            label: localize(loc.lang, 'battery'),
        };
    }
    return { hero: powerParts(productionPower(config, hass), loc) };
}

export function buildView(config: EnergySkyCardConfig, hass: HomeAssistant): CardView {
    const loc = numberLocale(hass);
    const threshold = config.battery?.power_threshold ?? DEFAULT_POWER_THRESHOLD;
    const produced = config.daily_production_entities?.length
        ? localize(loc.lang, 'produced', { value: formatKWhValue(dailyProduction(config, hass), loc) })
        : undefined;
    const metrics = configuredCells(config).map(spec => {
        switch (spec.kind) {
            case 'battery': return batteryMetric(config, hass, loc, threshold);
            case 'grid': return gridMetric(config, hass, loc);
            case 'voltage': return voltageMetric(config, hass, loc);
            case 'tomorrow': return tomorrowMetric(config, hass, loc);
            case 'consumption': return consumptionMetric(config, hass, loc);
            case 'custom': return customMetric(spec, hass, loc);
        }
    });
    const { hero, label, labelShort = label } = heroView(config, hass, loc);
    const withLabel = (word: string | undefined) => word ? [word, produced].filter(Boolean).join(' · ') : produced;
    return { hero, context: withLabel(label), contextShort: withLabel(labelShort), metrics };
}
