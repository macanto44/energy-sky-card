import { describe, it, expect } from 'vitest';
import { buildView, configuredMetrics, dailyProduction, direction, normalizeConfig, trackedEntities } from '../src/model';
import { ANNEX_B, FULL_CONFIG, makeHass } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const nb = ' ';
const view = (overrides: Record<string, string | number> = {}, config: EnergySkyCardConfig = FULL_CONFIG, lang = 'fr') =>
    buildView(config, makeHass({ ...ANNEX_B, ...overrides }, lang));
const metric = (v: ReturnType<typeof buildView>, key: string) => v.metrics.find(m => m.key === key)!;

describe('the prototype readings (annex B)', () => {
    it('reads like the markdown card', () => {
        const v = view();
        expect(v.hero).toEqual({ value: '2', unit: 'W' });
        expect(v.context).toBe('0,0 kWh produits');
        expect(metric(v, 'battery')).toMatchObject({ label: 'Batterie', value: `25${nb}%`, extra: '' });
        expect(metric(v, 'grid')).toMatchObject({ label: 'Réseau', value: `748${nb}W` });
        expect(metric(v, 'voltage')).toMatchObject({ label: 'Tension', value: `234${nb}V` });
        expect(metric(v, 'tomorrow')).toMatchObject({ label: 'Prévu demain', value: `12,6${nb}kWh` });
    });

    it('speaks English', () => {
        const v = view({}, FULL_CONFIG, 'en');
        expect(v.context).toBe('0.0 kWh produced');
        expect(metric(v, 'grid').label).toBe('Grid');
        expect(metric(v, 'voltage').label).toBe('Voltage');
        expect(metric(v, 'battery').extra).toBe('');
    });
});

describe('grid', () => {
    it('is always « Réseau », with a « - » in front of an injection', () => {
        expect(metric(view({ 'sensor.victrongrid_ac_l1_power31': 748 }), 'grid')).toMatchObject({ label: 'Réseau', value: `748${nb}W` });
        expect(metric(view({ 'sensor.victrongrid_ac_l1_power31': -1830 }), 'grid')).toMatchObject({ label: 'Réseau', value: `-1,8${nb}kW` });
        expect(metric(view({ 'sensor.victrongrid_ac_l1_power31': -12 }), 'grid')).toMatchObject({ label: 'Réseau', value: `-12${nb}W` });
        expect(metric(view({ 'sensor.victrongrid_ac_l1_power31': 0 }), 'grid').value).toBe(`0${nb}W`);
        expect(metric(view({ 'sensor.victrongrid_ac_l1_power31': 'unavailable' }), 'grid')).toMatchObject({ label: 'Réseau', value: '—' });
    });

    it('follows a configured threshold', () => {
        expect(direction(40, 50)).toBe('none');
        expect(direction(60, 50)).toBe('up');
        expect(direction(-60, 50)).toBe('down');
        expect(direction(undefined, 20)).toBe('none');
    });
});

describe('battery', () => {
    it('shows ↑ when charging and ↓ when discharging past the threshold', () => {
        expect(metric(view({ 'sensor.victron_system_battery_power': 500 }), 'battery').value).toBe(`25${nb}%${nb}↑`);
        expect(metric(view({ 'sensor.victron_system_battery_power': -500 }), 'battery').value).toBe(`25${nb}%${nb}↓`);
        expect(metric(view({ 'sensor.victron_system_battery_power': 15 }), 'battery').value).toBe(`25${nb}%`);
    });

    it('reads « SOC atteint » when any of its entities is on, nothing otherwise', () => {
        expect(metric(view({ 'input_boolean.reserve_batterie_nuit': 'on' }), 'battery')).toMatchObject({ extra: ' · SOC atteint', extraShort: ' · SOC ✓' });
        expect(metric(view(), 'battery')).toMatchObject({ extra: '', extraShort: '' });
    });

    it('still reads the 0.1.0 top-level power_threshold', () => {
        const { power_threshold, ...battery } = FULL_CONFIG.battery!;
        const config = normalizeConfig({ ...FULL_CONFIG, battery, power_threshold: 1000 });
        expect(metric(view({ 'sensor.victron_system_battery_power': 500 }, config), 'battery').value).toBe(`25${nb}%`);
        expect(metric(view({ 'sensor.victron_system_battery_power': 1500 }, config), 'battery').value).toBe(`25${nb}%${nb}↑`);
    });

    it('still reads the 0.1.0 name, battery.lock_entities', () => {
        const { soc_reached_entities, ...battery } = FULL_CONFIG.battery!;
        const config = normalizeConfig({ ...FULL_CONFIG, battery: { ...battery, lock_entities: soc_reached_entities } });
        expect(metric(view({ 'input_boolean.reserve_batterie_nuit': 'on' }, config), 'battery').extra).toBe(' · SOC atteint');
    });

    it('has no complement without « SOC atteint » entities', () => {
        const config = { ...FULL_CONFIG, battery: { soc_entity: 'sensor.victron_system_battery_soc' } };
        expect(metric(view({}, config), 'battery').extra).toBe('');
    });

    it('shows a dash, without an arrow, when the SOC is unavailable', () => {
        expect(metric(view({ 'sensor.victron_system_battery_soc': 'unavailable', 'sensor.victron_system_battery_power': 900 }), 'battery').value).toBe('—');
    });
});

describe('voltage', () => {
    it('reads « Coupure » in an outage state, whatever the voltage', () => {
        expect(metric(view({ 'sensor.victron_vebus_alarm_gridlost_227': 'alarm' }), 'voltage').value).toBe('Coupure');
        expect(metric(view({ 'sensor.victron_vebus_alarm_gridlost_227': 'warning', 'sensor.grid_voltage': 'unavailable' }), 'voltage').value).toBe('Coupure');
        expect(metric(view({ 'sensor.victron_vebus_alarm_gridlost_227': 'no_alarm' }), 'voltage').value).toBe(`234${nb}V`);
    });

    it('takes the outage states from the config', () => {
        const config = { ...FULL_CONFIG, grid: { ...FULL_CONFIG.grid, outage_states: ['on'] } };
        expect(metric(view({ 'sensor.victron_vebus_alarm_gridlost_227': 'alarm' }, config), 'voltage').value).toBe(`234${nb}V`);
        expect(metric(view({ 'sensor.victron_vebus_alarm_gridlost_227': 'on' }, config), 'voltage').value).toBe('Coupure');
    });
});

describe('daily production', () => {
    it('sums the daily sensors', () => {
        const v = view({ 'sensor.production_solaire_sofar_jour': 5.1, 'sensor.production_solaire_cabanon_jour': 2.14 });
        expect(v.context).toBe('7,2 kWh produits');
    });

    it('leaves an unavailable sensor out of the sum', () => {
        const hass = makeHass({ ...ANNEX_B, 'sensor.production_solaire_sofar_jour': 5.1, 'sensor.production_solaire_cabanon_jour': 'unavailable' });
        expect(dailyProduction(FULL_CONFIG, hass)).toBeCloseTo(5.1);
    });

    it('shows a dash when none is available', () => {
        const v = view({ 'sensor.production_solaire_sofar_jour': 'unknown', 'sensor.production_solaire_cabanon_jour': 'unavailable' });
        expect(v.context).toBe('— kWh produits');
    });

    it('has no context line without daily sensors', () => {
        expect(view({}, { ...FULL_CONFIG, daily_production_entities: [] }).context).toBeUndefined();
    });
});

describe('optional metrics', () => {
    it('drops a metric whose entity is not configured', () => {
        expect(configuredMetrics(FULL_CONFIG)).toEqual(['battery', 'grid', 'voltage', 'tomorrow']);
        expect(configuredMetrics({ ...FULL_CONFIG, battery: undefined, forecast_tomorrow_entity: undefined })).toEqual(['grid', 'voltage']);
        expect(configuredMetrics({ type: 'x', production_entity: 'sensor.pv' })).toEqual([]);
    });

    it('keeps the voltage case for an outage entity alone', () => {
        expect(configuredMetrics({ type: 'x', production_entity: 'sensor.pv', grid: { outage_entity: 'sensor.alarm' } })).toEqual(['voltage']);
    });

    it('tracks every configured entity once, sun.sun by default', () => {
        const ids = trackedEntities({ type: 'x', production_entity: 'sensor.pv', daily_production_entities: ['sensor.a', 'sensor.a'] });
        expect(ids).toEqual(['sensor.pv', 'sensor.a', 'sun.sun']);
    });
});
