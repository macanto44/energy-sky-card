// Sample readings for the local demo (brief §7 config, annex B values)
export const CONFIG = {
  type: 'custom:energy-sky-card',
  production_entity: 'sensor.production_pv',
  production_max: 6000,
  daily_production_entities: ['sensor.sofar_jour', 'sensor.cabanon_jour'],
  battery: { soc_entity: 'sensor.soc', power_entity: 'sensor.bat_power', lock_entities: ['input_boolean.lock'] },
  grid: { power_entity: 'sensor.grid', voltage_entity: 'sensor.voltage', outage_entity: 'sensor.gridlost' },
  forecast_tomorrow_entity: 'sensor.tomorrow',
  tariff_color_entity: 'sensor.tempo',
  sun_entity: 'sun.sun',
};

const base = {
  'sensor.production_pv': 2.2, 'sensor.sofar_jour': 0, 'sensor.cabanon_jour': 0,
  'sensor.soc': 25, 'sensor.bat_power': 0, 'input_boolean.lock': 'off',
  'sensor.grid': 748, 'sensor.voltage': 233.98, 'sensor.gridlost': 'no_alarm',
  'sensor.tomorrow': 12.56, 'sensor.tempo': 'Bleu', 'sun.sun': 'below_horizon',
};

export const SCENARIOS = {
  nuit: base,
  bleu: { ...base, 'sun.sun': 'above_horizon', 'sensor.production_pv': 3249, 'sensor.sofar_jour': 5.1, 'sensor.cabanon_jour': 2.14, 'sensor.soc': 78, 'sensor.bat_power': 1450, 'sensor.grid': -1830 },
  blanc: { ...base, 'sun.sun': 'above_horizon', 'sensor.tempo': 'Blanc', 'sensor.production_pv': 860, 'sensor.sofar_jour': 1.4, 'sensor.cabanon_jour': 0.3, 'sensor.soc': 100, 'input_boolean.lock': 'on', 'sensor.grid': 5 },
  rouge: { ...base, 'sun.sun': 'above_horizon', 'sensor.tempo': 'Rouge', 'sensor.production_pv': 5980, 'sensor.sofar_jour': 18.7, 'sensor.cabanon_jour': 3.2, 'sensor.soc': 64, 'sensor.bat_power': -2300, 'sensor.grid': -3450 },
  extremes: { ...base, 'sun.sun': 'above_horizon', 'sensor.tempo': 'Rouge', 'sensor.production_pv': 12345, 'sensor.sofar_jour': 98.7, 'sensor.cabanon_jour': 24.6, 'sensor.soc': 100, 'sensor.bat_power': -4321, 'input_boolean.lock': 'on', 'sensor.grid': -12345, 'sensor.voltage': 252.4, 'sensor.tomorrow': 123.45 },
  coupure: { ...base, 'sensor.gridlost': 'alarm', 'sensor.voltage': 'unavailable', 'sensor.grid': 'unavailable', 'sensor.tomorrow': 'unknown' },
};
