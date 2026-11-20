import { describe, it, expect, afterEach, vi } from 'vitest';
import { batteryEstimate, buildView, viewEstimate } from '../src/model';
import { flowView } from '../src/flow';
import { formatClock, formatDuration } from '../src/format';
import { numberLocale, timeLocale } from '../src/localize';
import { validateConfig } from '../src/energy-sky-card';
import { editorSchema, formData, nextConfig } from '../src/energy-sky-card-editor';
import { entity, makeHass, mountCard as mount, nb } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const CONFIG: EnergySkyCardConfig = {
    type: 'custom:energy-sky-card', production_entity: 'sensor.pv',
    battery: { soc_entity: 'sensor.soc', power_entity: 'sensor.bat', capacity: 10 },
};
const with_ = (battery: Record<string, unknown>): EnergySkyCardConfig => ({ ...CONFIG, battery: { ...CONFIG.battery, ...battery } });
/** Noon, local time: the clock times below don't depend on the time zone */
const NOON = new Date(2026, 10, 20, 12, 0).getTime();
const hass = (soc: number, power: number, extra: Record<string, unknown> = {}) =>
    makeHass({ 'sensor.pv': 0, 'sensor.soc': soc, 'sensor.bat': power, ...extra } as Record<string, string | number>);
const loc = numberLocale(hass(0, 0));

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); });

describe('formats', () => {
    it('writes durations on the step, without a break', () => {
        expect(formatDuration(40)).toBe(`40${nb}min`);
        expect(formatDuration(120)).toBe(`2${nb}h`);
        expect(formatDuration(330)).toBe(`5${nb}h${nb}30`);
        expect(formatDuration(130)).toBe(`2${nb}h${nb}10`);
    });

    it('writes clock times in the profile\'s format', () => {
        const at = new Date(2026, 10, 20, 14, 30);
        expect(formatClock(at, { lang: 'fr', decimal: ',', time: timeLocale({ language: 'fr' }) })).toBe('14:30');
        expect(formatClock(at, { lang: 'en', decimal: '.', time: timeLocale({ locale: { language: 'en', time_format: '12' } }) })).toMatch(/^2:30\s?PM$/u);
        expect(formatClock(at, { lang: 'en', decimal: '.', time: timeLocale({ locale: { language: 'en', time_format: '24' } }) })).toBe('14:30');
    });
});

describe('the estimate', () => {
    it('gives the time the battery will be full, on a 10 minute step', () => {
        // 22 % of 10 kWh at 900 W: 2 h 27 → 14:27 → 14:30
        expect(batteryEstimate(CONFIG, hass(78, 900), loc, undefined, NOON)).toEqual({ text: '14:30', title: 'Pleine à 14:30' });
    });

    it('gives the time left until empty, or until the reserve', () => {
        // 64 % of 10 kWh at 450 W: 14 h 13 → 14 h 10
        expect(batteryEstimate(CONFIG, hass(64, -450), loc, undefined, NOON)).toEqual({ text: `14${nb}h${nb}10`, title: `Vide dans 14${nb}h${nb}10` });
        // 54 %: 12 h
        expect(batteryEstimate(with_({ reserve_soc: 10 }), hass(64, -450), loc, undefined, NOON)?.title).toBe(`Réserve dans 12${nb}h`);
    });

    it('aims for max_soc, takes each direction\'s form, and can be turned off', () => {
        // 12 % of 10 kWh at 900 W: 80 min
        expect(batteryEstimate(with_({ max_soc: 90, estimate: { charge: 'duration' } }), hass(78, 900), loc, undefined, NOON)?.text).toBe(`1${nb}h${nb}20`);
        expect(batteryEstimate(with_({ estimate: { discharge: 'time' } }), hass(64, -4500), loc, undefined, NOON)?.title).toBe('Vide à 13:30');
        expect(batteryEstimate(with_({ estimate: { charge: 'off' } }), hass(78, 900), loc, undefined, NOON)).toBeUndefined();
    });

    it('says nothing when idle, beyond a day, already there, or without what it needs', () => {
        expect(batteryEstimate(CONFIG, hass(78, 15), loc, undefined, NOON)).toBeUndefined();
        expect(batteryEstimate(CONFIG, hass(64, -100), loc, undefined, NOON)).toBeUndefined();
        expect(batteryEstimate(with_({ max_soc: 70 }), hass(78, 900), loc, undefined, NOON)).toBeUndefined();
        expect(batteryEstimate(with_({ reserve_soc: 70 }), hass(64, -450), loc, undefined, NOON)).toBeUndefined();
        expect(batteryEstimate(with_({ capacity: undefined }), hass(78, 900), loc, undefined, NOON)).toBeUndefined();
        expect(batteryEstimate(CONFIG, makeHass({ 'sensor.bat': 900 }), loc, undefined, NOON)).toBeUndefined();
    });

    it('adds up the batteries\' capacity, and keeps quiet once the target is reported reached', () => {
        const two = with_({ soc_entity: ['sensor.soc', 'sensor.soc_b'], capacity: [5, 5] });
        expect(batteryEstimate(two, hass(78, 900, { 'sensor.soc_b': 78 }), loc, undefined, NOON)?.text).toBe('14:30');
        const reached = with_({ soc_reached_entities: ['input_boolean.full'] });
        expect(viewEstimate(reached, hass(78, 900, { 'input_boolean.full': 'on' }), loc, { now: NOON })).toBeUndefined();
    });

    it('uses the power it is given (the card\'s average) over the reading', () => {
        expect(batteryEstimate(with_({ estimate: { charge: 'duration' } }), hass(78, 2000), loc, 900, NOON)?.text).toBe(`2${nb}h${nb}30`);
    });
});

describe('in the battery cell', () => {
    const cell = (config: EnergySkyCardConfig, h = hass(78, 900, { 'sensor.temp': entity('sensor.temp', 24.2, { unit_of_measurement: '°C' }) })) =>
        buildView(config, h, { now: NOON }).metrics.find(m => m.key === 'battery')!;
    const withTemp = (battery: Record<string, unknown> = {}) => with_({ temperature_entity: 'sensor.temp', ...battery });

    it('follows the charge, in place of the temperature by default, with a title', () => {
        const v = cell(withTemp());
        expect(v.value).toBe(`78${nb}%${nb}↑ · 14:30`);
        expect(v.tight?.value).toBe(`78${nb}%${nb}↑ · 14:30`);
        expect(v.bare).toBe(`78${nb}%${nb}↑`);
        expect(v.note).toBe('Pleine à 14:30');
    });

    it('comes after the temperature with with_temperature: both', () => {
        const v = cell(withTemp({ estimate: { with_temperature: 'both' } }));
        expect(v.value).toBe(`78${nb}%${nb}↑ · 24 °C · 14:30`);
        expect(v.tight?.value).toBe(`78${nb}%${nb}↑ · 24° · 14:30`);
    });

    it('leaves the temperature when there is no estimate', () => {
        expect(cell(withTemp(), hass(78, 0, { 'sensor.temp': entity('sensor.temp', 24.2, { unit_of_measurement: '°C' }) })).value).toBe(`78${nb}% · 24 °C`);
        expect(cell(withTemp({ capacity: undefined })).value).toBe(`78${nb}%${nb}↑ · 24 °C`);
    });
});

describe('in the flow', () => {
    it('is a small line under the battery node\'s power, its sentence the title, unless estimate.flow is false', () => {
        expect(flowView(CONFIG, hass(78, 900), { now: NOON }).nodes.battery).toMatchObject({ label: 'Batterie', sub: '14:30', note: 'Pleine à 14:30' });
        const off = flowView(with_({ estimate: { flow: false } }), hass(78, 900), { now: NOON }).nodes.battery;
        expect(off.sub).toBeUndefined();
        expect(off.note).toBeUndefined();
    });
});

describe('in the card', () => {
    it('reads the battery power\'s 5 minute average, and puts the sentence in the cell\'s title', () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOON);
        const config = with_({ estimate: { charge: 'duration' } });
        const card = mount(config, hass(78, 900));
        vi.setSystemTime(NOON + 60_000);
        card.hass = hass(78, 2000);
        const value = () => card.shadowRoot!.querySelector('[data-metric="battery"] .value-main')?.textContent;
        // 2 000 W since a moment, 900 W for the minute before: still about 900 W
        expect(value()).toBe(`78${nb}%${nb}↑ · 2${nb}h${nb}30`);
        expect(card.shadowRoot!.querySelector('[data-metric="battery"]')?.getAttribute('title')).toBe(`Pleine dans 2${nb}h${nb}30`);
    });

    it('shows the line and the title on the battery node', () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOON);
        const card = mount({ ...CONFIG, flow: 'always' }, hass(78, 900));
        const node = card.shadowRoot!.querySelector('[data-node="battery"]')!;
        expect(node.querySelector('.nsub')?.textContent).toBe('14:30');
        expect(node.getAttribute('title')).toBe('Pleine à 14:30');
        expect(card.shadowRoot!.querySelector('[data-node="grid"] .nsub')?.textContent).toBe('');
    });
});

describe('settings', () => {
    it('validates them', () => {
        expect(() => validateConfig(with_({ max_soc: 95, reserve_soc: 10, estimate: { charge: 'duration', discharge: 'off', with_temperature: 'both', flow: false } }))).not.toThrow();
        expect(() => validateConfig(with_({ max_soc: 120 }))).toThrow(/battery.max_soc must be a percentage/);
        expect(() => validateConfig(with_({ estimate: { charge: 'soon' } }))).toThrow(/battery.estimate.charge: time, duration or off/);
        expect(() => validateConfig(with_({ estimate: 'time' }))).toThrow(/battery.estimate must hold/);
        expect(() => validateConfig(with_({ estimate: { flow: 'yes' } }))).toThrow(/battery.estimate.flow must be true or false/);
    });

    it('shows them in the editor once there is a capacity, and writes only what differs from the default', () => {
        const names = (data: Record<string, unknown>) => editorSchema('fr', data).find(b => b.name === 'battery')!.schema!.map(f => f.name);
        expect(names({})).not.toContain('estimate_charge');
        expect(names({ battery: { capacity: 10 } })).toEqual(expect.arrayContaining(['max_soc', 'reserve_soc', 'estimate_charge', 'estimate_discharge', 'estimate_with_temperature', 'estimate_flow']));
        // A capacity per battery stays YAML-only
        expect(names({ battery: { capacity: [5, 5] } })).not.toContain('capacity');
        expect(formData(CONFIG).battery).toMatchObject({ estimate_charge: 'time', estimate_discharge: 'duration', estimate_with_temperature: 'replace', estimate_flow: true });
        const data = formData(CONFIG);
        const next = nextConfig(CONFIG, { ...data, battery: { ...(data.battery as object), estimate_charge: 'duration', estimate_flow: false } });
        expect(next.battery).toEqual({ soc_entity: 'sensor.soc', power_entity: 'sensor.bat', capacity: 10, estimate: { charge: 'duration', flow: false } });
        expect(nextConfig(CONFIG, formData(CONFIG)).battery).toEqual(CONFIG.battery);
    });
});
