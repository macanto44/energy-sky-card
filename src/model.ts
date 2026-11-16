// From the config and Home Assistant's states to what the card shows.
// Pure functions: everything here is unit-tested without a DOM.

import type { BuiltinCell, CellConfig, CellKind, CustomCell, EnergySkyCardConfig, HomeAssistant } from './types';
import { energyKWh, numericState, powerW } from './utils';
import { localize, numberLocale, type NumberLocale } from './localize';
import { NO_VALUE, formatEnergy, joinParts, formatKWhValue, formatNumber, formatPercent, formatPower, formatTemperature, formatVoltage, powerParts, type ValueParts } from './format';

export const DEFAULT_POWER_THRESHOLD = 20;
export const DEFAULT_OUTAGE_STATES = ['warning', 'alarm'];

/**
 * The config under today's option names (0.1.0–0.1.1 names still work):
 * battery.lock_entities becomes battery.soc_reached_entities, and the
 * top-level power_threshold becomes battery.power_threshold. Where both
 * names are set, the new one wins and the old one is dropped.
 */
export function normalizeConfig<T extends Partial<EnergySkyCardConfig>>(config: T): T {
    const hasOldThreshold = 'power_threshold' in config;
    const hasOldLocks = !!config.battery && 'lock_entities' in config.battery;
    if (!hasOldThreshold && !hasOldLocks) return config;
    const { power_threshold, ...top } = config as T & { power_threshold?: number };
    const { lock_entities, ...battery } = (config.battery ?? {}) as NonNullable<EnergySkyCardConfig['battery']> & { lock_entities?: string[] };
    if (hasOldLocks) battery.soc_reached_entities ??= lock_entities;
    if (hasOldThreshold) battery.power_threshold ??= power_threshold;
    return { ...top, battery } as T;
}

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
    if (config.battery?.soc_entity) kinds.push('battery');
    if (config.grid?.power_entity) kinds.push('grid');
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
        case 'battery': return config.battery?.soc_entity;
        case 'grid': return config.grid?.power_entity ?? config.grid?.outage_entity;
        case 'voltage': return config.grid?.voltage_entity ?? config.grid?.outage_entity;
        case 'tomorrow': return config.forecast_tomorrow_entity;
        case 'consumption': return config.consumption_entity;
        case 'custom': return cell.custom?.entity;
    }
}

/**
 * For a cell without a tap action of its own: whether a tap opens its
 * entity's dialog (yes, unless the card has a tap_action) rather than the
 * card's action. cell_tap (0.3.1) still decides when set.
 */
export function cellTapOpensEntity(config: Pick<EnergySkyCardConfig, 'cell_tap' | 'tap_action'>): boolean {
    if (config.cell_tap === 'card') return false;
    return config.cell_tap === 'more-info' || config.tap_action === undefined;
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
    return values.length ? values.reduce((a, b) => a + b, 0) : undefined;
}

const signed = (value: number | undefined, invert: boolean | undefined) =>
    value === undefined || !invert ? value : -value;

/** Grid power in W, positive when importing (the sensor's sign flipped with grid.invert) */
export function gridPower(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    return signed(powerW(hass.states[config.grid?.power_entity ?? '']), config.grid?.invert);
}

/** Battery power in W, positive when charging (flipped with battery.invert) */
export function batteryPower(config: EnergySkyCardConfig, hass: HomeAssistant): number | undefined {
    return signed(powerW(hass.states[config.battery?.power_entity ?? '']), config.battery?.invert);
}

/** Every entity whose change can change what the card shows */
export function trackedEntities(config: EnergySkyCardConfig): string[] {
    const ids = [
        ...productionEntities(config),
        config.consumption_entity,
        ...(config.cells ?? []).filter(isCustom).map(c => c.entity),
        ...(config.daily_production_entities ?? []),
        config.battery?.soc_entity, config.battery?.power_entity, config.battery?.temperature_entity, ...(config.battery?.soc_reached_entities ?? []),
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
    const soc = numericState(hass.states[config.battery?.soc_entity ?? '']);
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
    if (mode === 'battery' && config.battery?.soc_entity) {
        const soc = numericState(hass.states[config.battery.soc_entity]);
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
