import { describe, it, expect } from 'vitest';
import { EnergySkyCard } from '../src/energy-sky-card';
import { configFromEnergy, stubConfig, type EnergyPrefs } from '../src/stub';
import type { HomeAssistant } from '../src/types';
import { entity, makeHass } from './helpers';

/** A house: an inverter, a battery and a grid meter, each a device with its sensors */
function house(): HomeAssistant {
    const sensors: [string, string | number, Record<string, unknown>, string][] = [
        ['sensor.inverter_energy_total', 12345, { device_class: 'energy' }, 'inverter'],
        ['sensor.inverter_energy_today', 7.2, { device_class: 'energy' }, 'inverter'],
        ['sensor.inverter_energy_yesterday', 9.1, { device_class: 'energy' }, 'inverter'],
        ['sensor.inverter_power', 3200, { device_class: 'power' }, 'inverter'],
        ['sensor.battery_charged', 800, { device_class: 'energy' }, 'battery'],
        ['sensor.battery_discharged', 700, { device_class: 'energy' }, 'battery'],
        ['sensor.battery_soc', 78, { device_class: 'battery' }, 'battery'],
        ['sensor.battery_power', 1450, { device_class: 'power' }, 'battery'],
        ['sensor.battery_temperature', 24, { device_class: 'temperature' }, 'battery'],
        ['sensor.grid_imported', 5000, { device_class: 'energy' }, 'meter'],
        ['sensor.grid_exported', 3000, { device_class: 'energy' }, 'meter'],
        ['sensor.grid_power', -1830, { device_class: 'power' }, 'meter'],
        ['sensor.grid_voltage', 234, { device_class: 'voltage' }, 'meter'],
        ['sensor.energy_production_tomorrow', 12.6, { device_class: 'energy' }, 'forecast'],
        ['sensor.edf_tempo_couleur_aujourd_hui', 'Bleu', {}, 'tempo'],
        ['sensor.edf_tempo_couleur_demain', 'Blanc', {}, 'tempo'],
    ];
    const hass = makeHass(Object.fromEntries(sensors.map(([id, state, attrs]) => [id, entity(id, state, attrs)])));
    hass.entities = Object.fromEntries(sensors.map(([id, , , device]) =>
        [id, { entity_id: id, device_id: device, platform: device === 'forecast' ? 'forecast_solar' : 'demo' }]));
    return hass;
}

/** 2024–2025 preferences: grid flows as lists */
const OLD_PREFS: EnergyPrefs = {
    energy_sources: [
        { type: 'solar', stat_energy_from: 'sensor.inverter_energy_total', config_entry_solar_forecast: ['abc'] },
        { type: 'battery', stat_energy_from: 'sensor.battery_discharged', stat_energy_to: 'sensor.battery_charged' },
        { type: 'grid', flow_from: [{ stat_energy_from: 'sensor.grid_imported' }], flow_to: [{ stat_energy_to: 'sensor.grid_exported' }] },
    ],
};

describe('prefill from the Energy dashboard', () => {
    it("finds each sensor on the devices of the dashboard's meters", () => {
        expect(configFromEnergy(OLD_PREFS, house())).toEqual({
            production_entity: 'sensor.inverter_power',
            daily_production_entities: ['sensor.inverter_energy_today'],
            forecast_tomorrow_entity: 'sensor.energy_production_tomorrow',
            battery: { soc_entity: 'sensor.battery_soc', power_entity: 'sensor.battery_power', temperature_entity: 'sensor.battery_temperature' },
            grid: { power_entity: 'sensor.grid_power', voltage_entity: 'sensor.grid_voltage' },
        });
    });

    it("takes the power sensors the dashboard names, and flips Home Assistant's battery sign", () => {
        const hass = house();
        hass.states['sensor.bat_rate'] = entity('sensor.bat_rate', -1450, { device_class: 'power' });
        hass.states['sensor.home_power'] = entity('sensor.home_power', 900, { device_class: 'power' });
        const prefs: EnergyPrefs = {
            energy_sources: [
                { type: 'solar', stat_energy_from: 'sensor.inverter_energy_total', stat_rate: 'sensor.inverter_power' },
                { type: 'battery', stat_energy_from: 'sensor.battery_discharged', stat_energy_to: 'sensor.battery_charged', stat_rate: 'sensor.bat_rate', stat_soc: 'sensor.battery_soc' },
                { type: 'grid', stat_energy_from: 'sensor.grid_imported', power_config: { stat_rate_inverted: 'sensor.grid_power' } },
                { type: 'home', stat_rate: 'sensor.home_power' },
            ],
        };
        const config = configFromEnergy(prefs, hass);
        expect(config.battery).toMatchObject({ power_entity: 'sensor.bat_rate', invert: true, soc_entity: 'sensor.battery_soc' });
        expect(config.grid).toMatchObject({ power_entity: 'sensor.grid_power', invert: true });
        expect(config.consumption_entity).toBe('sensor.home_power');
    });

    it('sums several solar sources', () => {
        const hass = house();
        hass.states['sensor.shed_power'] = entity('sensor.shed_power', 500, { device_class: 'power' });
        const prefs: EnergyPrefs = { energy_sources: [
            { type: 'solar', stat_energy_from: 'sensor.inverter_energy_total' },
            { type: 'solar', stat_energy_from: 'sensor.shed_total', stat_rate: 'sensor.shed_power' },
        ] };
        expect(configFromEnergy(prefs, hass).production_entity).toEqual(['sensor.inverter_power', 'sensor.shed_power']);
    });

    it("adds today's Tempo colour and the sun, and falls back to the first power sensor without a dashboard", () => {
        expect(stubConfig(house(), undefined)).toEqual({
            production_entity: 'sensor.inverter_power', tariff_color_entity: 'sensor.edf_tempo_couleur_aujourd_hui', sun_entity: 'sun.sun',
        });
        expect(stubConfig(undefined, undefined)).toEqual({ production_entity: 'sensor.production_pv', sun_entity: 'sun.sun' });
    });

    it('starts on the weather sky when Home Assistant has a weather entity, rather than the tariff', () => {
        const hass = house();
        hass.states['weather.broken'] = entity('weather.broken', 'unavailable');
        expect(stubConfig(hass, undefined).background).toBeUndefined();
        hass.states['weather.home'] = entity('weather.home', 'partlycloudy');
        expect(stubConfig(hass, undefined)).toEqual({
            production_entity: 'sensor.inverter_power', background: 'weather', weather_entity: 'weather.home', sun_entity: 'sun.sun',
        });
    });

    it('asks Home Assistant for the preferences, and copes with a refusal', async () => {
        const hass = house();
        hass.callWS = (async (msg: { type: string }) => {
            expect(msg.type).toBe('energy/get_prefs');
            return OLD_PREFS;
        }) as HomeAssistant['callWS'];
        expect(await EnergySkyCard.getStubConfig(hass)).toMatchObject({ battery: { soc_entity: 'sensor.battery_soc' }, grid: { voltage_entity: 'sensor.grid_voltage' } });
        hass.callWS = (async () => { throw new Error('not_found'); }) as HomeAssistant['callWS'];
        expect(await EnergySkyCard.getStubConfig(hass)).toEqual(stubConfig(hass, undefined));
    });
});
