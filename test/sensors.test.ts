import { describe, it, expect, afterEach } from 'vitest';
import { batteryPower, batterySoc, buildView, cellEntity, configuredCells, gridPower, staleReadings, trackedEntities } from '../src/model';
import { flowNodeEntity, flowView } from '../src/flow';
import { smoothedEntities } from '../src/smoothing';
import { configFromEnergy } from '../src/stub';
import { validateConfig } from '../src/energy-sky-card';
import { entity, makeHass, mountCard as mount, nb } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const BASE: EnergySkyCardConfig = { type: 'custom:energy-sky-card', production_entity: 'sensor.pv' };
const SPLIT_GRID: EnergySkyCardConfig = { ...BASE, grid: { import_entity: 'sensor.grid_in', export_entity: 'sensor.grid_out' } };
const SPLIT_BATTERY: EnergySkyCardConfig = { ...BASE, battery: { soc_entity: 'sensor.soc', charge_entity: 'sensor.bat_in', discharge_entity: 'sensor.bat_out' } };
const TWO_BATTERIES: EnergySkyCardConfig = { ...BASE, battery: { soc_entity: ['sensor.soc_a', 'sensor.soc_b'], power_entity: ['sensor.bat_a', 'sensor.bat_b'] } };

afterEach(() => { document.body.innerHTML = ''; });

describe('grid: import and export sensors', () => {
    it('reads import minus export, a missing one as 0, both missing as no reading', () => {
        expect(gridPower(SPLIT_GRID, makeHass({ 'sensor.grid_in': 750, 'sensor.grid_out': 0 }))).toBe(750);
        expect(gridPower(SPLIT_GRID, makeHass({ 'sensor.grid_in': 0, 'sensor.grid_out': 1830 }))).toBe(-1830);
        expect(gridPower(SPLIT_GRID, makeHass({ 'sensor.grid_in': 'unavailable', 'sensor.grid_out': 400 }))).toBe(-400);
        expect(gridPower({ ...BASE, grid: { import_entity: 'sensor.grid_in' } }, makeHass({ 'sensor.grid_in': 300 }))).toBe(300);
        expect(gridPower(SPLIT_GRID, makeHass({ 'sensor.grid_in': 'unavailable', 'sensor.grid_out': 'unknown' }))).toBeUndefined();
    });

    it('takes both as magnitudes and converts kW', () => {
        const hass = makeHass({ 'sensor.grid_in': entity('sensor.grid_in', 1.2, { unit_of_measurement: 'kW' }), 'sensor.grid_out': -200 });
        expect(gridPower(SPLIT_GRID, hass)).toBe(1000);
    });

    it('shows the grid cell, the flow node and its tap', () => {
        const view = buildView(SPLIT_GRID, makeHass({ 'sensor.pv': 0, 'sensor.grid_in': 0, 'sensor.grid_out': 1830 }));
        expect(view.metrics.find(m => m.key === 'grid')?.value).toBe('-1,8 kW'.replace(' ', nb));
        expect(configuredCells(SPLIT_GRID).map(c => c.kind)).toEqual(['grid']);
        expect(cellEntity(SPLIT_GRID, { key: 'grid', kind: 'grid' })).toBe('sensor.grid_in');
        expect(flowNodeEntity(SPLIT_GRID, 'grid')).toBe('sensor.grid_in');
    });

    it('tracks, smooths and checks both for staleness', () => {
        expect(trackedEntities(SPLIT_GRID)).toEqual(expect.arrayContaining(['sensor.grid_in', 'sensor.grid_out']));
        expect(smoothedEntities(SPLIT_GRID)).toEqual(expect.arrayContaining(['sensor.grid_in', 'sensor.grid_out']));
        const old = { ...entity('sensor.grid_out', 0), last_reported: new Date(Date.now() - 45 * 60000).toISOString() };
        expect(staleReadings(SPLIT_GRID, makeHass({ 'sensor.grid_out': old })).has('sensor.grid_out')).toBe(true);
    });
});

describe('battery: charge and discharge sensors', () => {
    it('reads charge minus discharge', () => {
        expect(batteryPower(SPLIT_BATTERY, makeHass({ 'sensor.bat_in': 900, 'sensor.bat_out': 0 }))).toBe(900);
        expect(batteryPower(SPLIT_BATTERY, makeHass({ 'sensor.bat_in': 0, 'sensor.bat_out': 2300 }))).toBe(-2300);
        expect(batteryPower(SPLIT_BATTERY, makeHass({ 'sensor.bat_out': 450 }))).toBe(-450);
        expect(batteryPower(SPLIT_BATTERY, makeHass({}))).toBeUndefined();
    });

    it('gives the cell its arrow and the flow node its power', () => {
        const hass = makeHass({ 'sensor.pv': 0, 'sensor.soc': 64, 'sensor.bat_in': 0, 'sensor.bat_out': 450 });
        expect(buildView(SPLIT_BATTERY, hass).metrics.find(m => m.key === 'battery')?.value).toBe(`64${nb}%${nb}↓`);
        expect(flowView(SPLIT_BATTERY, hass).nodes.battery.value).toBe(`-450${nb}W`);
        expect(flowNodeEntity(SPLIT_BATTERY, 'battery')).toBe('sensor.bat_in');
    });
});

describe('several batteries', () => {
    it('adds up their powers, leaving an unavailable one out', () => {
        expect(batteryPower(TWO_BATTERIES, makeHass({ 'sensor.bat_a': 600, 'sensor.bat_b': -200 }))).toBe(400);
        expect(batteryPower(TWO_BATTERIES, makeHass({ 'sensor.bat_a': 600, 'sensor.bat_b': 'unavailable' }))).toBe(600);
        expect(batteryPower({ ...TWO_BATTERIES, battery: { ...TWO_BATTERIES.battery, invert: true } }, makeHass({ 'sensor.bat_a': 600, 'sensor.bat_b': 100 }))).toBe(-700);
    });

    it('averages their charge, weighted by capacity when there is one per battery', () => {
        const hass = makeHass({ 'sensor.soc_a': 80, 'sensor.soc_b': 40 });
        expect(batterySoc(TWO_BATTERIES, hass)).toBe(60);
        expect(batterySoc({ ...TWO_BATTERIES, battery: { ...TWO_BATTERIES.battery, capacity: [10, 5] } }, hass)).toBeCloseTo(66.67, 1);
        // A capacity that isn't one per battery doesn't weigh
        expect(batterySoc({ ...TWO_BATTERIES, battery: { ...TWO_BATTERIES.battery, capacity: 15 } }, hass)).toBe(60);
        expect(batterySoc(TWO_BATTERIES, makeHass({ 'sensor.soc_a': 80, 'sensor.soc_b': 'unavailable' }))).toBe(80);
        expect(batterySoc(TWO_BATTERIES, makeHass({}))).toBeUndefined();
    });

    it('shows one cell, one node, and the night hero from the average', () => {
        const hass = makeHass({ 'sensor.pv': 0, 'sensor.soc_a': 80, 'sensor.soc_b': 40, 'sensor.bat_a': 600, 'sensor.bat_b': 300, 'sun.sun': 'below_horizon' });
        const view = buildView({ ...TWO_BATTERIES, night_hero: 'battery' }, hass);
        expect(view.metrics.find(m => m.key === 'battery')?.value).toBe(`60${nb}%${nb}↑`);
        expect(view.hero.value).toBe('60');
        const flow = flowView(TWO_BATTERIES, hass);
        expect(flow.nodes.battery.centre).toBe('60');
        expect(flow.nodes.battery.value).toBe(`900${nb}W`);
        expect(cellEntity(TWO_BATTERIES, { key: 'battery', kind: 'battery' })).toBe('sensor.soc_a');
        expect(trackedEntities(TWO_BATTERIES)).toEqual(expect.arrayContaining(['sensor.soc_b', 'sensor.bat_b']));
        expect(smoothedEntities(TWO_BATTERIES)).toEqual(expect.arrayContaining(['sensor.bat_a', 'sensor.bat_b']));
    });

    it('renders in the card', () => {
        const card = mount(TWO_BATTERIES, { 'sensor.pv': 0, 'sensor.soc_a': 80, 'sensor.soc_b': 40, 'sensor.bat_a': 600, 'sensor.bat_b': 300 });
        expect(card.shadowRoot!.querySelector('[data-metric="battery"] .value-main')?.textContent).toBe(`60${nb}%${nb}↑`);
    });
});

describe('validation', () => {
    const fails = (config: Record<string, unknown>, message: RegExp) => expect(() => validateConfig({ ...BASE, ...config })).toThrow(message);

    it('accepts the new forms', () => {
        expect(() => validateConfig(SPLIT_GRID)).not.toThrow();
        expect(() => validateConfig(SPLIT_BATTERY)).not.toThrow();
        expect(() => validateConfig({ ...TWO_BATTERIES, battery: { ...TWO_BATTERIES.battery, capacity: [10, 5] } })).not.toThrow();
    });

    it('refuses one sensor and two at once', () => {
        fails({ grid: { power_entity: 'sensor.g', import_entity: 'sensor.i' } }, /grid: power_entity or import_entity \/ export_entity, not both/);
        fails({ battery: { power_entity: 'sensor.b', discharge_entity: 'sensor.d' } }, /battery: power_entity or charge_entity \/ discharge_entity/);
    });

    it('refuses an empty list, a number for an entity, a bad capacity', () => {
        fails({ battery: { soc_entity: [] } }, /battery.soc_entity must be an entity or a list/);
        fails({ grid: { import_entity: 5 } }, /grid.import_entity/);
        fails({ battery: { capacity: -2 } }, /battery.capacity/);
        fails({ battery: { capacity: [10, 'x'] } }, /battery.capacity/);
    });
});

describe('pre-fill from the Energy dashboard', () => {
    it('takes Home Assistant\'s two power sensors when it has them', () => {
        const hass = makeHass({
            'sensor.g_from': entity('sensor.g_from', 0, { device_class: 'power' }), 'sensor.g_to': entity('sensor.g_to', 0, { device_class: 'power' }),
            'sensor.b_from': entity('sensor.b_from', 0, { device_class: 'power' }), 'sensor.b_to': entity('sensor.b_to', 0, { device_class: 'power' }),
        });
        const config = configFromEnergy({ energy_sources: [
            { type: 'grid', stat_energy_from: 'sensor.gi', power_config: { stat_rate_from: 'sensor.g_from', stat_rate_to: 'sensor.g_to' } },
            { type: 'battery', stat_energy_from: 'sensor.bd', power_config: { stat_rate_from: 'sensor.b_from', stat_rate_to: 'sensor.b_to' } },
        ] }, hass);
        expect(config.grid).toEqual({ import_entity: 'sensor.g_from', export_entity: 'sensor.g_to' });
        expect(config.battery).toEqual({ charge_entity: 'sensor.b_to', discharge_entity: 'sensor.b_from' });
        expect(() => validateConfig({ ...BASE, ...config })).not.toThrow();
    });
});
