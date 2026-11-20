// Formatting readings for display: powers, energies, voltages, percentages

import type { NumberLocale } from './localize';

/** Shown in place of any value without a reading */
export const NO_VALUE = '—';

/** A number with fixed decimals and the locale's separator; -0 becomes 0 */
export function formatNumber(value: number, decimals: number, locale: NumberLocale): string {
    const fixed = value.toFixed(decimals);
    const clean = /^-0(\.0+)?$/.test(fixed) ? fixed.slice(1) : fixed;
    return clean.replace('.', locale.decimal);
}

export interface ValueParts {
    value: string;
    unit: string;
}

/**
 * A power: under 1000 W as whole watts ("748 W"), from 1000 W with one
 * decimal in kW ("3,2 kW"). The switch is made on the rounded watts, so
 * 999.6 W reads "1,0 kW", never "1000 W". Negative values keep their sign.
 */
export function powerParts(watts: number | undefined, locale: NumberLocale): ValueParts {
    if (watts === undefined || !Number.isFinite(watts)) return { value: NO_VALUE, unit: '' };
    if (Math.abs(Math.round(watts)) < 1000) return { value: formatNumber(Math.round(watts), 0, locale), unit: 'W' };
    return { value: formatNumber(watts / 1000, 1, locale), unit: 'kW' };
}

/** Value and unit as one string, "3,2 kW", or "—" */
export function joinParts({ value, unit }: ValueParts): string {
    return unit ? `${value} ${unit}` : value;
}

export function formatPower(watts: number | undefined, locale: NumberLocale): string {
    return joinParts(powerParts(watts, locale));
}

/** An energy in kWh with one decimal, "7,2" (the unit is added by the caller's sentence) */
export function formatKWhValue(kwh: number | undefined, locale: NumberLocale): string {
    return kwh === undefined || !Number.isFinite(kwh) ? NO_VALUE : formatNumber(kwh, 1, locale);
}

export function formatEnergy(kwh: number | undefined, locale: NumberLocale): string {
    const value = formatKWhValue(kwh, locale);
    return value === NO_VALUE ? value : `${value} kWh`;
}

/** A voltage rounded to the volt, "233 V" */
export function formatVoltage(volts: number | undefined, locale: NumberLocale): string {
    return volts === undefined || !Number.isFinite(volts) ? NO_VALUE : `${formatNumber(Math.round(volts), 0, locale)} V`;
}

/** Languages that put a space before the percent sign */
const SPACED_PERCENT = ['fr', 'de', 'es'];

/** A percentage rounded to the unit: "25 %" in French, German and Spanish, "25%" in English, Italian and Dutch */
export function formatPercent(value: number | undefined, locale: NumberLocale): string {
    if (value === undefined || !Number.isFinite(value)) return NO_VALUE;
    return `${formatNumber(Math.round(value), 0, locale)}${SPACED_PERCENT.includes(locale.lang) ? ' ' : ''}%`;
}

/** A temperature rounded to the degree, with its sensor's unit: "24 °C" */
export function formatTemperature(degrees: number | undefined, unit: string, locale: NumberLocale): string {
    if (degrees === undefined || !Number.isFinite(degrees)) return NO_VALUE;
    return `${formatNumber(Math.round(degrees), 0, locale)} ${unit || '°C'}`;
}
