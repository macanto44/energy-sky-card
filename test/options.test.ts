import { describe, it, expect, afterEach } from 'vitest';
import { buildView, configuredMetrics, trackedEntities } from '../src/model';
import { computeBackground } from '../src/sky';
import { validateConfig } from '../src/energy-sky-card';
import { ANNEX_B, FULL_CONFIG, entity, makeHass, mountCard as mount, nb } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const DAY = { ...ANNEX_B, 'sun.sun': 'above_horizon' };
const metric = (config: EnergySkyCardConfig, states: Record<string, any>, key: string) =>
    buildView(config, makeHass(states)).metrics.find(m => m.key === key);

afterEach(() => { document.body.innerHTML = ''; });


describe('battery temperature', () => {
    const withTemp = { ...FULL_CONFIG, battery: { ...FULL_CONFIG.battery, temperature_entity: 'sensor.bat_temp' } };
    const bat = (state: string | number, unit = '°C', extra: Record<string, any> = {}) =>
        metric(withTemp, { ...ANNEX_B, ...extra, 'sensor.bat_temp': entity('sensor.bat_temp', state, { unit_of_measurement: unit }) }, 'battery');

    it('follows the charge and arrow, after a dot, rounded to the degree', () => {
        expect(bat(23.6)?.value).toBe(`25${nb}% · 24 °C`);
        expect(bat(-3.4, '°C', { 'sensor.victron_system_battery_power': 900 })?.value).toMatch(/^25.%.↑ · -3 °C$/);
        expect(bat(75.2, '°F')?.value).toBe(`25${nb}% · 75 °F`);
    });

    it('keeps the SOC complement after it', () => {
        const v = bat(20, '°C', { 'input_boolean.ve_verrou_soc_actif': 'on' });
        expect(v?.value).toBe(`25${nb}% · 20 °C`);
        expect(v?.extra).toBe(' · SOC atteint');
        expect(v?.tight).toEqual({ value: `25${nb}%\u202F·\u202F20°`, extra: '\u202F✓' });
    });

    it('is left out without a reading or without the option', () => {
        expect(bat('unavailable')?.value).toBe(`25${nb}%`);
        expect(bat('unavailable')?.tight).toBeUndefined();
        expect(metric(FULL_CONFIG, ANNEX_B, 'battery')?.value).toBe(`25${nb}%`);
    });

    it('is tracked', () => {
        expect(trackedEntities(withTemp)).toContain('sensor.bat_temp');
    });
});

describe('sign of the battery and grid sensors', () => {
    it('reads the grid as positive when importing, or flipped with grid.invert', () => {
        expect(metric(FULL_CONFIG, ANNEX_B, 'grid')?.value).toBe(`748${nb}W`);
        const inverted = { ...FULL_CONFIG, grid: { ...FULL_CONFIG.grid, invert: true } };
        expect(metric(inverted, ANNEX_B, 'grid')?.value).toBe(`-748${nb}W`);
    });

    it('reads the battery as positive when charging, or flipped with battery.invert', () => {
        const charging = { ...ANNEX_B, 'sensor.victron_system_battery_power': 500 };
        expect(metric(FULL_CONFIG, charging, 'battery')?.value).toBe(`25${nb}%${nb}↑`);
        const inverted = { ...FULL_CONFIG, battery: { ...FULL_CONFIG.battery, invert: true } };
        expect(metric(inverted, charging, 'battery')?.value).toBe(`25${nb}%${nb}↓`);
    });
});

describe('several production sensors', () => {
    const config = { ...FULL_CONFIG, production_entity: ['sensor.roof', 'sensor.shed'] };

    it('sums them in the hero and the halo, leaving out an unavailable one', () => {
        const hass = makeHass({ ...DAY, 'sensor.roof': 2400, 'sensor.shed': entity('sensor.shed', 0.6, { unit_of_measurement: 'kW' }) });
        expect(buildView(config, hass).hero).toEqual({ value: '3,0', unit: 'kW' });
        expect(computeBackground(config, hass).haloAlpha).toBe(0.275);
        expect(buildView(config, makeHass({ ...DAY, 'sensor.roof': 2400, 'sensor.shed': 'unavailable' })).hero).toEqual({ value: '2,4', unit: 'kW' });
        expect(buildView(config, makeHass({ ...DAY, 'sensor.roof': 'unavailable', 'sensor.shed': 'unknown' })).hero.value).toBe('—');
    });

    it('tracks every one of them, and opens the first one on tap', () => {
        expect(trackedEntities(config)).toEqual(expect.arrayContaining(['sensor.roof', 'sensor.shed']));
        const card = mount(config);
        const events: any[] = [];
        card.addEventListener('hass-more-info', e => events.push((e as CustomEvent).detail));
        const target = card.shadowRoot!.querySelector('ha-card')!;
        target.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
        target.dispatchEvent(new PointerEvent('pointerup', { button: 0 }));
        expect(events).toEqual([{ entityId: 'sensor.roof' }]);
    });
});

describe('the hero at night', () => {
    const config = { ...FULL_CONFIG, consumption_entity: 'sensor.home' };
    const night = { ...ANNEX_B, 'sensor.home': 1234, 'sensor.production_solaire_sofar_jour': 5.1 };

    it('shows the production by default', () => {
        const view = buildView(config, makeHass(night));
        expect(view.hero).toEqual({ value: '2', unit: 'W' });
        expect(view.context).toBe('5,1 kWh produits');
    });

    it('shows the home consumption, named on the context line', () => {
        const view = buildView({ ...config, night_hero: 'consumption' }, makeHass(night));
        expect(view.hero).toEqual({ value: '1,2', unit: 'kW' });
        expect(view.context).toBe('Consommation · 5,1 kWh produits');
        expect(view.contextShort).toBe('Conso. · 5,1 kWh produits');
    });

    it('shows the battery charge', () => {
        const view = buildView({ ...config, night_hero: 'battery' }, makeHass(night));
        expect(view.hero).toEqual({ value: '25', unit: '%' });
        expect(view.context).toBe('Batterie · 5,1 kWh produits');
    });

    it('goes back to production by day, and when the chosen entity is not set', () => {
        expect(buildView({ ...config, night_hero: 'consumption' }, makeHass({ ...night, 'sun.sun': 'above_horizon' })).hero.unit).toBe('W');
        expect(buildView({ ...FULL_CONFIG, night_hero: 'consumption' }, makeHass(night)).hero).toEqual({ value: '2', unit: 'W' });
    });

    it('shows the context line for the label alone when there are no daily sensors', () => {
        const { daily_production_entities, ...noDaily } = config;
        const card = mount({ ...noDaily, night_hero: 'consumption' }, night);
        const context = card.shadowRoot!.querySelector('.context') as HTMLElement;
        expect(context.hidden).toBe(false);
        expect(context.textContent).toBe('Consommation');
        expect(buildView({ ...noDaily, night_hero: 'consumption' }, makeHass(night)).contextShort).toBe('Conso.');
        card.hass = makeHass({ ...night, 'sun.sun': 'above_horizon' });
        expect(context.hidden).toBe(true);
    });
});

describe('cells', () => {
    it('follows the config\'s order, keeps a cell without its entity, and drops duplicates', () => {
        const config: EnergySkyCardConfig = { ...FULL_CONFIG, consumption_entity: 'sensor.home', cells: ['consumption', 'battery', 'battery', 'grid'] };
        expect(configuredMetrics(config)).toEqual(['consumption', 'battery', 'grid']);
        expect(metric(config, { ...ANNEX_B, 'sensor.home': 980 }, 'consumption')).toMatchObject({ label: 'Consommation', value: `980${nb}W` });
        expect(metric({ ...config, consumption_entity: undefined }, ANNEX_B, 'consumption')?.value).toBe('—');
    });

    it('shows no cell with an empty list', () => {
        expect(configuredMetrics({ ...FULL_CONFIG, cells: [] })).toEqual([]);
    });

    describe('a free cell', () => {
        const cell = (c: object, state: any) => metric({ ...FULL_CONFIG, cells: [c as any] }, { ...ANNEX_B, 'sensor.x': state }, 'custom-0');

        it('reads a power like the card does', () => {
            expect(cell({ entity: 'sensor.x' }, entity('sensor.x', 2.35, { unit_of_measurement: 'kW', friendly_name: 'Pompe à chaleur' })))
                .toMatchObject({ label: 'Pompe à chaleur', value: `2,4${nb}kW` });
        });

        it('lets Home Assistant format anything else', () => {
            const hass = makeHass({ ...ANNEX_B, 'sensor.x': entity('sensor.x', 'heat') });
            hass.formatEntityState = e => `formatted ${e.state}`;
            const view = buildView({ ...FULL_CONFIG, cells: [{ entity: 'sensor.x', name: 'Mode' }] }, hass);
            expect(view.metrics[0]).toMatchObject({ label: 'Mode', value: 'formatted heat' });
        });

        it('falls back to the number and its unit, then to the raw state', () => {
            expect(cell({ entity: 'sensor.x' }, entity('sensor.x', 21.46, { unit_of_measurement: '°C' }))?.value).toBe(`21,5${nb}°C`);
            expect(cell({ entity: 'sensor.x' }, entity('sensor.x', 80, { unit_of_measurement: '%' }))?.value).toBe(`80${nb}%`);
            expect(cell({ entity: 'sensor.x' }, 'heat')?.value).toBe('heat');
            expect(cell({ entity: 'sensor.x' }, 'unavailable')?.value).toBe('—');
            expect(cell({ entity: 'sensor.y' }, 1)).toMatchObject({ label: 'sensor.y', value: '—' });
        });

        it('takes its icon from the config, else the entity, else a gauge', () => {
            expect(cell({ entity: 'sensor.x', icon: 'mdi:car' }, entity('sensor.x', 1, { icon: 'mdi:fire' }))?.icon).toBe('mdi:car');
            expect(cell({ entity: 'sensor.x' }, entity('sensor.x', 1, { icon: 'mdi:fire' }))?.icon).toBe('mdi:fire');
            expect(cell({ entity: 'sensor.x' }, 1)?.icon).toBe('mdi:gauge');
        });

        it('renders its name and icon as text and attribute, never as markup', () => {
            const card = mount({ ...FULL_CONFIG, cells: [{ entity: 'sensor.x', name: '<img src=x onerror=alert(1)>', icon: '"><b>x' }] },
                { ...ANNEX_B, 'sensor.x': 5 });
            const el = card.shadowRoot!.querySelector('[data-metric="custom-0"]')!;
            expect(el.querySelector('img, b')).toBeNull();
            expect(el.querySelector('.label-text')!.textContent).toBe('<img src=x onerror=alert(1)>');
            expect(el.querySelector('ha-icon')!.getAttribute('icon')).toBe('"><b>x');
        });
    });
});

describe('validation of the new options', () => {
    const bad: [string, object, RegExp][] = [
        ['an empty production list', { production_entity: [] }, /production_entity/],
        ['an unknown night hero', { night_hero: 'moon' }, /night_hero/],
        ['five cells', { cells: ['battery', 'grid', 'voltage', 'tomorrow', 'consumption'] }, /at most 4|4 cases/],
        ['an unknown cell', { cells: ['weather'] }, /weather/],
        ['a free cell without entity', { cells: [{ name: 'x' }] }, /cells/],
        ['a non-boolean invert', { grid: { invert: 'yes' } }, /grid\.invert/],
    ];
    for (const [what, extra, message] of bad) {
        it(`rejects ${what}`, () => {
            expect(() => validateConfig({ ...FULL_CONFIG, ...extra } as EnergySkyCardConfig)).toThrow(message);
        });
    }

    it('accepts them all together', () => {
        expect(() => validateConfig({
            ...FULL_CONFIG, production_entity: ['sensor.a', 'sensor.b'], consumption_entity: 'sensor.home', night_hero: 'consumption',
            battery: { ...FULL_CONFIG.battery, invert: true }, grid: { ...FULL_CONFIG.grid, invert: false },
            cells: ['battery', { entity: 'sensor.ev', name: 'VE', icon: 'mdi:car' }],
        })).not.toThrow();
    });
});
