import { describe, it, expect } from 'vitest';
import { EnergySkyCardEditor, editorSchema, formData, nextConfig, type SchemaItem } from '../src/energy-sky-card-editor';
import { CARD_EDITOR_NAME } from '../src/constants';
import { FULL_CONFIG, makeHass } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

/** A stand-in for Home Assistant's ha-form: keeps what it's given */
class FakeForm extends HTMLElement {
    hass?: unknown;
    data?: Record<string, unknown>;
    schema?: SchemaItem[];
    computeLabel?: (item: SchemaItem) => string;
}
customElements.define('ha-form', FakeForm);

const MINIMAL: EnergySkyCardConfig = { type: 'custom:energy-sky-card', production_entity: 'sensor.production_pv' };

function mount(config: EnergySkyCardConfig = MINIMAL, language = 'fr') {
    const editor = document.createElement(CARD_EDITOR_NAME) as EnergySkyCardEditor;
    editor.hass = makeHass({}, language);
    editor.setConfig(config);
    document.body.appendChild(editor);
    const form = editor.querySelector('ha-form') as FakeForm;
    const changes: EnergySkyCardConfig[] = [];
    editor.addEventListener('config-changed', e => changes.push((e as CustomEvent).detail.config));
    const change = (value: Record<string, unknown>) =>
        form.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...form.data, ...value } }, bubbles: true }));
    return { editor, form, changes, change };
}

/** Every field name in the schema, with its block */
const fields = (schema: SchemaItem[]) => schema.flatMap(block => (block.schema ?? []).map(f => `${block.name || '.'}/${f.name}`));

describe('schema', () => {
    it('has the blocks of the brief, in order', () => {
        expect(editorSchema('fr').map(b => b.title)).toEqual(['Production', 'Batterie', 'Réseau', 'Tarif et ciel', 'Actions']);
        expect(editorSchema('en').map(b => b.title)).toEqual(['Production', 'Battery', 'Grid', 'Tariff and sky', 'Actions']);
    });

    it('covers every option except the palettes, with nested battery and grid', () => {
        expect(fields(editorSchema('fr'))).toEqual([
            './production_entity', './production_max', './daily_production_entities', './forecast_tomorrow_entity',
            'battery/soc_entity', 'battery/power_entity', 'battery/lock_entities',
            'grid/power_entity', 'grid/voltage_entity', 'grid/outage_entity', 'grid/outage_states',
            './tariff_color_entity', './sun_entity', './power_threshold', './animate',
            './tap_action', './hold_action', './double_tap_action',
        ]);
    });

    it('lets several daily sensors and locks be picked, and uses Home Assistant\'s action picker', () => {
        const all = editorSchema('fr').flatMap(b => b.schema ?? []);
        const byName = (block: string, name: string) => editorSchema('fr').find(b => (b.name || b.title) === block)?.schema?.find(f => f.name === name);
        expect(all.find(f => f.name === 'daily_production_entities')?.selector).toEqual({ entity: { domain: 'sensor', multiple: true } });
        expect((byName('battery', 'lock_entities')?.selector as any).entity.multiple).toBe(true);
        expect(all.find(f => f.name === 'tap_action')?.selector).toEqual({ ui_action: {} });
        expect(all.find(f => f.name === 'production_entity')?.required).toBe(true);
    });
});

describe('the editor', () => {
    it('fills Home Assistant\'s form, with French labels', () => {
        const { form } = mount();
        expect(form).toBeInstanceOf(FakeForm);
        expect(form.computeLabel!({ name: 'production_entity' })).toBe('Puissance solaire (W)');
        expect(form.data).toMatchObject({ production_entity: 'sensor.production_pv', production_max: 6000, sun_entity: 'sun.sun', animate: true });
    });

    it('sends config-changed with the new value', () => {
        const { change, changes } = mount();
        change({ battery: { soc_entity: 'sensor.soc' }, tap_action: { action: 'navigate', navigation_path: '#popup-flux-energie' } });
        expect(changes.at(-1)).toEqual({
            ...MINIMAL,
            battery: { soc_entity: 'sensor.soc' },
            tap_action: { action: 'navigate', navigation_path: '#popup-flux-energie' },
        });
    });

    it('keeps the YAML short: no defaults, no empty fields or blocks', () => {
        const { change, changes } = mount();
        change({ daily_production_entities: [], battery: { soc_entity: undefined }, forecast_tomorrow_entity: '' });
        expect(changes.at(-1)).toEqual(MINIMAL);
    });

    it('keeps the palettes, which only YAML sets', () => {
        const config = { ...FULL_CONFIG, tariff_palettes: { Bleu: ['#111111', '#222222', '#333333'] as [string, string, string] } };
        const { change, changes } = mount(config);
        change({ power_threshold: 50 });
        expect(changes.at(-1)?.tariff_palettes).toEqual(config.tariff_palettes);
        expect(changes.at(-1)?.power_threshold).toBe(50);
    });

    it('removes a cleared entity', () => {
        const { change, changes } = mount(FULL_CONFIG);
        change({ grid: { ...FULL_CONFIG.grid, voltage_entity: undefined } });
        expect(changes.at(-1)?.grid?.voltage_entity).toBeUndefined();
        expect(changes.at(-1)?.grid?.power_entity).toBe(FULL_CONFIG.grid!.power_entity);
    });
});

describe('pure helpers', () => {
    it('keeps a default the YAML wrote on purpose', () => {
        expect(nextConfig({ ...MINIMAL, animate: true }, formData({ ...MINIMAL, animate: true })).animate).toBe(true);
        expect(nextConfig(MINIMAL, formData(MINIMAL))).toEqual(MINIMAL);
        expect(nextConfig(MINIMAL, { ...formData(MINIMAL), animate: false }).animate).toBe(false);
    });
});
