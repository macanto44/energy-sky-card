import { describe, it, expect } from 'vitest';
import { formatEnergy, formatPercent, formatPower, formatVoltage, powerParts } from '../src/format';
import { decimalSeparator, numberLocale } from '../src/localize';
import { energyKWh, numericState, powerW } from '../src/utils';
import { entity } from './helpers';

const fr = { lang: 'fr' as const, decimal: ',' };
const en = { lang: 'en' as const, decimal: '.' };
const nb = ' ';

describe('powers', () => {
    it('reads whole watts under 1000 W', () => {
        expect(powerParts(0, fr)).toEqual({ value: '0', unit: 'W' });
        expect(powerParts(2.2, fr)).toEqual({ value: '2', unit: 'W' });
        expect(powerParts(748.5, fr)).toEqual({ value: '749', unit: 'W' });
        expect(powerParts(999.4, fr)).toEqual({ value: '999', unit: 'W' });
    });

    it('switches to kW with one decimal from 1000 W, on the rounded watts', () => {
        expect(powerParts(999.6, fr)).toEqual({ value: '1,0', unit: 'kW' });
        expect(powerParts(1000, fr)).toEqual({ value: '1,0', unit: 'kW' });
        expect(powerParts(3249, fr)).toEqual({ value: '3,2', unit: 'kW' });
        expect(powerParts(3250, fr)).toEqual({ value: '3,3', unit: 'kW' });
        expect(powerParts(3250, en)).toEqual({ value: '3.3', unit: 'kW' });
    });

    it('keeps the sign of negative values, and never shows -0', () => {
        expect(formatPower(-1500, fr)).toBe(`-1,5${nb}kW`);
        expect(formatPower(-12, fr)).toBe(`-12${nb}W`);
        expect(formatPower(-0.3, fr)).toBe(`0${nb}W`);
    });

    it('shows a dash without a reading, never NaN', () => {
        expect(formatPower(undefined, fr)).toBe('—');
        expect(formatPower(NaN, fr)).toBe('—');
    });
});

describe('other units', () => {
    it('formats energy, voltage and percentages', () => {
        expect(formatEnergy(12.56, fr)).toBe(`12,6${nb}kWh`);
        expect(formatEnergy(undefined, fr)).toBe('—');
        expect(formatVoltage(233.98, fr)).toBe(`234${nb}V`);
        expect(formatPercent(25, fr)).toBe(`25${nb}%`);
        expect(formatPercent(25, en)).toBe('25%');
    });
});

describe('reading states', () => {
    it('treats unavailable, unknown and non-numbers as no reading', () => {
        expect(numericState(entity('sensor.x', 'unavailable'))).toBeUndefined();
        expect(numericState(entity('sensor.x', 'unknown'))).toBeUndefined();
        expect(numericState(entity('sensor.x', 'abc'))).toBeUndefined();
        expect(numericState(undefined)).toBeUndefined();
        expect(numericState(entity('sensor.x', '12.5'))).toBe(12.5);
    });

    it('converts kW to W and Wh to kWh from the unit', () => {
        expect(powerW(entity('sensor.x', '3.2', { unit_of_measurement: 'kW' }))).toBe(3200);
        expect(powerW(entity('sensor.x', '320', { unit_of_measurement: 'W' }))).toBe(320);
        expect(energyKWh(entity('sensor.x', '7200', { unit_of_measurement: 'Wh' }))).toBeCloseTo(7.2);
    });
});

describe('locale', () => {
    it('follows the profile number format, else the language', () => {
        expect(decimalSeparator({ locale: { language: 'fr', number_format: 'language' } })).toBe(',');
        expect(decimalSeparator({ locale: { language: 'en', number_format: 'language' } })).toBe('.');
        expect(decimalSeparator({ locale: { language: 'fr', number_format: 'comma_decimal' } })).toBe('.');
        expect(decimalSeparator({ locale: { language: 'en', number_format: 'decimal_comma' } })).toBe(',');
        expect(numberLocale({ language: 'fr-CA' }).lang).toBe('fr');
        expect(numberLocale({ language: 'de' }).lang).toBe('en');
    });
});
