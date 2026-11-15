// Small helpers: HTML escaping, reading numeric entity states

import type { HassEntity } from './types';

/** Escape text for use inside HTML (element content or quoted attributes) */
const HTML_ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value: unknown): string {
    return value == null ? '' : String(value).replace(/[&<>"']/g, ch => HTML_ENTITIES[ch]);
}

/** States that mean "no reading" */
const NO_READING = new Set(['unavailable', 'unknown', 'none', '']);

/** An entity's state as a finite number, or undefined (missing, unavailable, not a number) */
export function numericState(entity: HassEntity | undefined): number | undefined {
    if (!entity || NO_READING.has(String(entity.state).toLowerCase())) return undefined;
    const value = Number(entity.state);
    return Number.isFinite(value) ? value : undefined;
}

const POWER_SCALE: Record<string, number> = { mw: 1e6, kw: 1e3, w: 1 };
const ENERGY_SCALE: Record<string, number> = { mwh: 1e3, kwh: 1, wh: 1e-3 };

function unitOf(entity: HassEntity | undefined): string {
    return String(entity?.attributes.unit_of_measurement ?? '').toLowerCase();
}

/** A power entity's reading in W, converting from kW / MW when its unit says so */
export function powerW(entity: HassEntity | undefined): number | undefined {
    const value = numericState(entity);
    return value === undefined ? undefined : value * (POWER_SCALE[unitOf(entity)] ?? 1);
}

/** An energy entity's reading in kWh, converting from Wh / MWh when its unit says so */
export function energyKWh(entity: HassEntity | undefined): number | undefined {
    const value = numericState(entity);
    return value === undefined ? undefined : value * (ENERGY_SCALE[unitOf(entity)] ?? 1);
}
