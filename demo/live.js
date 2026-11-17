// The live demo (GitHub Pages): one card on the demo's sample readings, set from the controls,
// with the YAML that makes it.
import { ATTRIBUTES, CONFIG, CONSUMERS, SCENARIOS } from './scenarios.js';

const form = document.getElementById('controls');
const cell = document.getElementById('cell');
const yaml = document.getElementById('yaml');
const hint = document.getElementById('hint');
const widthOut = document.getElementById('widthout');

/** The demo's entity ids, written as a reader's own would look */
const RENAME = {
  'sensor.production_pv': 'sensor.solar_power', 'sensor.sofar_jour': 'sensor.solar_energy_today_roof', 'sensor.cabanon_jour': 'sensor.solar_energy_today_shed',
  'sensor.soc': 'sensor.battery_soc', 'sensor.bat_power': 'sensor.battery_power', 'sensor.bat_temp': 'sensor.battery_temperature',
  'input_boolean.soc_reached': 'input_boolean.battery_target_reached', 'sensor.grid': 'sensor.grid_power', 'sensor.voltage': 'sensor.grid_voltage',
  'sensor.gridlost': 'sensor.grid_lost_alarm', 'sensor.tomorrow': 'sensor.energy_production_tomorrow', 'sensor.tempo': 'sensor.edf_tempo_couleur_aujourd_hui',
  'sensor.boiler': 'sensor.boiler_power', 'sensor.pool': 'sensor.pool_pump_power', 'sensor.car': 'sensor.ev_charger_power', 'sensor.heat_pump': 'sensor.heat_pump_power',
};

/** A small YAML writer for the card's config: strings, numbers, booleans, lists and maps */
function toYaml(value, indent = '') {
  const scalar = v => typeof v === 'string' ? (/^[\w.:/-]+$/.test(v) ? v : `'${v.replace(/'/g, "''")}'`) : String(v);
  if (Array.isArray(value)) {
    return value.map(item => item && typeof item === 'object'
      ? `${indent}- ${toYaml(item, indent + '  ').trimStart()}`
      : `${indent}- ${scalar(item)}`).join('\n');
  }
  return Object.entries(value).map(([key, v]) => v && typeof v === 'object'
    ? `${indent}${key}:\n${toYaml(v, indent + '  ')}`
    : `${indent}${key}: ${scalar(v)}`).join('\n');
}

function settings() {
  const data = new FormData(form);
  return {
    scenario: data.get('s'), layout: data.get('layout'), flow: data.get('flow'),
    consumers: Number(data.get('consumers')), lang: data.get('lang'), width: Number(data.get('width')),
  };
}

let card;
function render() {
  const o = settings();
  widthOut.textContent = `${o.width} px`;
  // Appliances need a flow
  for (const input of form.querySelectorAll('input[name="consumers"]')) input.disabled = o.flow === 'none';
  const config = {
    ...CONFIG,
    ...(o.layout === 'side' ? { layout: 'side' } : {}),
    ...(o.flow !== 'none' ? { flow: o.flow } : {}),
    ...(o.flow !== 'none' && o.consumers ? { consumers: CONSUMERS.slice(0, o.consumers) } : {}),
  };
  const states = {};
  let t = 0;
  for (const [id, state] of Object.entries(SCENARIOS[o.scenario])) {
    const stamp = new Date(Date.UTC(2026, 10, 15, 12, 0, t++)).toISOString();
    states[id] = { entity_id: id, state: String(state), attributes: ATTRIBUTES[id] ?? {}, last_changed: stamp, last_updated: stamp };
  }
  // A new card for a new config, as Home Assistant does
  if (card) card.remove();
  card = document.createElement('energy-sky-card');
  card.setConfig(config);
  card.hass = { states, language: o.lang, locale: { language: o.lang, number_format: 'language' } };
  // In a dashboard the grid sets the height; with a flow, the card sets its own
  cell.style.width = `${o.width}px`;
  cell.style.height = config.flow ? 'auto' : o.layout === 'side' ? '120px' : '248px';
  cell.appendChild(card);
  hint.textContent = o.flow === 'tap' ? 'Tap the big number to unfold the energy flow, and again to fold it.'
    : o.flow === 'always' ? 'Tap a node of the flow: in Home Assistant it opens that entity.' : 'Choose an energy flow to see where the power goes.';
  // The YAML, with entity ids that read like real ones
  const text = toYaml(config).replace(/(sensor|input_boolean|sun)\.[\w]+/g, id => RENAME[id] ?? id);
  yaml.textContent = text;
}

form.addEventListener('input', render);
document.getElementById('copy').addEventListener('click', async e => {
  try {
    await navigator.clipboard.writeText(yaml.textContent);
    e.target.textContent = 'Copied';
  } catch {
    getSelection().selectAllChildren(yaml);
    e.target.textContent = 'Selected';
  }
  setTimeout(() => { e.target.textContent = 'Copy'; }, 1500);
});
render();
