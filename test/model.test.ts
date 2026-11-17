import { describe, it, expect } from 'vitest';
import { buildView, configuredMetrics, dailyProduction, direction, metricForm, staleReadings, trackedEntities } from '../src/model';
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

describe('stale readings', () => {
    const NOW = Date.UTC(2026, 10, 17, 12, 0);
    const reported = (id: string, minutesAgo: number | undefined, state: string | number = 1) =>
        ({ entity_id: id, state: String(state), attributes: {}, last_changed: '', last_updated: '', ...(minutesAgo === undefined ? {} : { last_reported: new Date(NOW - minutesAgo * 60000).toISOString() }) });
    const hass = (states: Record<string, ReturnType<typeof reported>>) => makeHass(states);

    it('flags a measure with no report for 30 minutes, with its age', () => {
        const h = hass({ 'sensor.victrongrid_ac_l1_power31': reported('sensor.victrongrid_ac_l1_power31', 42), 'sensor.production_pv': reported('sensor.production_pv', 5) });
        expect(staleReadings(FULL_CONFIG, h, NOW)).toEqual(new Map([['sensor.victrongrid_ac_l1_power31', 42]]));
    });

    it('never flags without last_reported: last_updated only moves on a change', () => {
        expect(staleReadings(FULL_CONFIG, hass({ 'sensor.production_pv': reported('sensor.production_pv', undefined) }), NOW).size).toBe(0);
    });

    it('follows stale_after, and 0 turns it off', () => {
        const h = hass({ 'sensor.production_pv': reported('sensor.production_pv', 12) });
        expect(staleReadings({ ...FULL_CONFIG, stale_after: 10 }, h, NOW).get('sensor.production_pv')).toBe(12);
        expect(staleReadings({ ...FULL_CONFIG, stale_after: 0 }, hass({ 'sensor.production_pv': reported('sensor.production_pv', 999) }), NOW).size).toBe(0);
    });

    it('looks at measures only, not the tariff, the sun or the forecast', () => {
        const h = hass({ 'sun.sun': reported('sun.sun', 600), 'sensor.edf_tempo_couleur_aujourd_hui': reported('sensor.edf_tempo_couleur_aujourd_hui', 600), 'sensor.energy_production_tomorrow_2': reported('sensor.energy_production_tomorrow_2', 600) });
        expect(staleReadings(FULL_CONFIG, h, NOW).size).toBe(0);
    });
});

describe('shortened text', () => {
    it('steps a cell from full to short, tight, then bare', () => {
        const config = { ...FULL_CONFIG, battery: { ...FULL_CONFIG.battery, temperature_entity: 'sensor.bat_temp' } };
        const battery = metric(view({ 'sensor.bat_temp': 21, 'input_boolean.reserve_batterie_nuit': 'on' }, config), 'battery');
        expect(metricForm(battery, 0)).toEqual({ value: battery.value, extra: ' · SOC atteint' });
        expect(metricForm(battery, 1)).toEqual({ value: battery.value, extra: ' · SOC ✓' });
        expect(metricForm(battery, 2)).toEqual({ value: `25${nb}%\u202F·\u202F21°`, extra: '\u202F✓' });
        expect(metricForm(battery, 3)).toEqual({ value: `25${nb}%`, extra: '' });
        // A cell without a tight or bare form keeps its value
        const grid = metric(view(), 'grid');
        expect(metricForm(grid, 2)).toEqual({ value: grid.value, extra: '' });
        expect(metricForm(grid, 3)).toEqual({ value: grid.value, extra: '' });
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
