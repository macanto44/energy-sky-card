// Sample readings for the local demo (brief §7 config, annex B values)
export const CONFIG = {
  type: 'custom:energy-sky-card',
  production_entity: 'sensor.production_pv',
  production_max: 6000,
  daily_production_entities: ['sensor.sofar_jour', 'sensor.cabanon_jour'],
  battery: { soc_entity: 'sensor.soc', power_entity: 'sensor.bat_power', temperature_entity: 'sensor.bat_temp', soc_reached_entities: ['input_boolean.soc_reached'], capacity: 10 },
  grid: { power_entity: 'sensor.grid', voltage_entity: 'sensor.voltage', outage_entity: 'sensor.gridlost' },
  forecast_tomorrow_entity: 'sensor.tomorrow',
  tariff_color_entity: 'sensor.tempo',
  sun_entity: 'sun.sun',
};

const base = {
  'sensor.production_pv': 2.2, 'sensor.sofar_jour': 0, 'sensor.cabanon_jour': 0,
  'sensor.soc': 25, 'sensor.bat_power': 0, 'sensor.bat_temp': 18.4, 'input_boolean.soc_reached': 'off',
  'sensor.grid': 748, 'sensor.voltage': 233.98, 'sensor.gridlost': 'no_alarm',
  'sensor.tomorrow': 12.56, 'sensor.tempo': 'Bleu', 'sun.sun': 'below_horizon',
  // Appliances (?consumers=n)
  'sensor.boiler': 1600, 'sensor.pool': 500, 'sensor.car': 0, 'sensor.heat_pump': 300,
};

/** The appliances ?consumers=n adds, the first n */
export const CONSUMERS = [
  { entity: 'sensor.boiler', name: 'Boiler', icon: 'mdi:water-boiler' },
  { entity: 'sensor.pool', name: 'Pool', icon: 'mdi:pool' },
  { entity: 'sensor.car', name: 'Car', icon: 'mdi:car-electric' },
  { entity: 'sensor.heat_pump', name: 'Heat pump', icon: 'mdi:heat-pump-outline' },
];

/** Entity attributes, where a reading needs its unit */
export const ATTRIBUTES = { 'sensor.heat_pump_temp': { unit_of_measurement: '°C' }, 'sensor.bat_temp': { unit_of_measurement: '°C' } };

/** Config changes per scenario, over CONFIG */
export const SCENARIO_CONFIGS = {
  options: {
    production_entity: ['sensor.production_pv', 'sensor.cabanon_pv'],
    consumption_entity: 'sensor.home',
    night_hero: 'consumption',
    grid: { power_entity: 'sensor.grid', invert: true },
    cells: ['consumption', 'battery', 'grid', { entity: 'sensor.heat_pump_temp', name: 'Pompe à chaleur — ballon', icon: 'mdi:water-boiler' }],
  },
};

export const SCENARIOS = {
  nuit: base,
  bleu: { ...base, 'sun.sun': 'above_horizon', 'sensor.production_pv': 3249, 'sensor.sofar_jour': 5.1, 'sensor.cabanon_jour': 2.14, 'sensor.soc': 78, 'sensor.bat_power': 900, 'sensor.grid': -1830 },
  blanc: { ...base, 'sun.sun': 'above_horizon', 'sensor.tempo': 'Blanc', 'sensor.production_pv': 860, 'sensor.sofar_jour': 1.4, 'sensor.cabanon_jour': 0.3, 'sensor.soc': 100, 'input_boolean.soc_reached': 'on', 'sensor.grid': 5, 'sensor.bat_temp': 'unavailable' },
  rouge: { ...base, 'sun.sun': 'above_horizon', 'sensor.tempo': 'Rouge', 'sensor.production_pv': 5980, 'sensor.sofar_jour': 18.7, 'sensor.cabanon_jour': 3.2, 'sensor.soc': 64, 'sensor.bat_power': -2300, 'sensor.grid': -3450 },
  extremes: { ...base, 'sun.sun': 'above_horizon', 'sensor.tempo': 'Rouge', 'sensor.production_pv': 12345, 'sensor.sofar_jour': 98.7, 'sensor.cabanon_jour': 24.6, 'sensor.soc': 100, 'sensor.bat_power': -4321, 'sensor.bat_temp': -12.6, 'input_boolean.soc_reached': 'on', 'sensor.grid': -12345, 'sensor.voltage': 252.4, 'sensor.tomorrow': 123.45, 'sensor.heat_pump': 12345 },
  // 0.2 options (config below): night, consumption as the hero, a free cell with a long name
  options: { ...base, 'sensor.home': 1870, 'sensor.sofar_jour': 18.7, 'sensor.cabanon_jour': 3.2, 'sensor.heat_pump_temp': 48.6 },
  // Off-peak, at night: the grid charges the battery and feeds the home
  charge: { ...base, 'sensor.grid': 2600, 'sensor.bat_power': 2000, 'sensor.soc': 40 },
  coupure: { ...base, 'sensor.gridlost': 'alarm', 'sensor.voltage': 'unavailable', 'sensor.grid': 'unavailable', 'sensor.tomorrow': 'unknown' },
};
