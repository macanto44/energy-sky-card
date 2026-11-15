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
    computeHelper?: (item: SchemaItem) => string | undefined;
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
        expect(editorSchema('fr').map(b => b.title)).toEqual(['Production', 'Batterie', 'Réseau', 'Cases', 'Tarif et ciel', 'Actions']);
        expect(editorSchema('en').map(b => b.title)).toEqual(['Production', 'Battery', 'Grid', 'Cells', 'Tariff and sky', 'Actions']);
    });

    it('covers every option except the palettes, with nested battery and grid', () => {
        expect(fields(editorSchema('fr'))).toEqual([
            './production_entity', './production_max', './daily_production_entities', './forecast_tomorrow_entity',
            './consumption_entity', './night_hero',
            'battery/soc_entity', 'battery/power_entity', 'battery/temperature_entity', 'battery/invert', 'battery/power_threshold', 'battery/soc_reached_entities',
            'grid/power_entity', 'grid/invert', 'grid/voltage_entity', 'grid/outage_entity', 'grid/outage_states',
            './cell_1', './cell_2', './cell_3', './cell_4',
            './tariff_color_entity', './sun_entity', './animate',
            './tap_action', './hold_action', './double_tap_action',
        ]);
    });

    it('lets several daily sensors and locks be picked, and uses Home Assistant\'s action picker', () => {
        const all = editorSchema('fr').flatMap(b => b.schema ?? []);
        const byName = (block: string, name: string) => editorSchema('fr').find(b => (b.name || b.title) === block)?.schema?.find(f => f.name === name);
        expect(all.find(f => f.name === 'daily_production_entities')?.selector).toEqual({ entity: { domain: 'sensor', multiple: true } });
        expect((byName('battery', 'soc_reached_entities')?.selector as any).entity.multiple).toBe(true);
        expect(all.find(f => f.name === 'tap_action')?.selector).toEqual({ ui_action: {} });
        expect(all.find(f => f.name === 'production_entity')?.required).toBe(true);
    });
});

describe('the editor', () => {
    it('fills Home Assistant\'s form, with French labels', () => {
        const { form } = mount();
        expect(form).toBeInstanceOf(FakeForm);
        expect(form.computeLabel!({ name: 'production_entity' })).toBe('Puissance solaire (W, additionnées)');
        expect(form.data).toMatchObject({ production_entity: ['sensor.production_pv'], production_max: 6000, sun_entity: 'sun.sun', animate: true });
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
        change({ battery: { ...FULL_CONFIG.battery, power_threshold: 50 } });
        expect(changes.at(-1)?.tariff_palettes).toEqual(config.tariff_palettes);
        expect(changes.at(-1)?.battery?.power_threshold).toBe(50);
    });

    it('removes a cleared entity', () => {
        const { change, changes } = mount(FULL_CONFIG);
        change({ grid: { ...FULL_CONFIG.grid, voltage_entity: undefined } });
        expect(changes.at(-1)?.grid?.voltage_entity).toBeUndefined();
        expect(changes.at(-1)?.grid?.power_entity).toBe(FULL_CONFIG.grid!.power_entity);
    });
});

describe('the « SOC atteint » option', () => {
    it('is labelled and explained', () => {
        const { form } = mount();
        expect(form.computeLabel!({ name: 'soc_reached_entities' })).toBe('SOC atteint');
        expect(form.computeHelper!({ name: 'soc_reached_entities' })).toMatch(/affiche « · SOC atteint »/);
        expect(form.computeHelper!({ name: 'production_max' })).toBeUndefined();
    });

    it('moves the old top-level power_threshold into battery on the next save', () => {
        const old = { ...MINIMAL, power_threshold: 50, battery: { soc_entity: 'sensor.soc' } } as EnergySkyCardConfig;
        const { form, change, changes } = mount(old);
        expect(form.data?.battery).toEqual({ soc_entity: 'sensor.soc', power_threshold: 50 });
        expect(form.data).not.toHaveProperty('power_threshold');
        change({ animate: false });
        expect(changes.at(-1)).toMatchObject({ battery: { soc_entity: 'sensor.soc', power_threshold: 50 } });
        expect(changes.at(-1)).not.toHaveProperty('power_threshold');
    });

    it('moves the old battery.lock_entities to soc_reached_entities on the next save', () => {
        const old = { ...MINIMAL, battery: { soc_entity: 'sensor.soc', lock_entities: ['input_boolean.x'] } } as EnergySkyCardConfig;
        const { form, change, changes } = mount(old);
        expect(form.data?.battery).toEqual({ soc_entity: 'sensor.soc', soc_reached_entities: ['input_boolean.x'] });
        change({ animate: false });
        expect(changes.at(-1)?.battery).toEqual({ soc_entity: 'sensor.soc', soc_reached_entities: ['input_boolean.x'] });
    });
});

describe('the 0.2 options', () => {
    it('sums several production sensors, and keeps one as a plain string', () => {
        const { change, changes } = mount();
        change({ production_entity: ['sensor.a', 'sensor.b'] });
        expect(changes.at(-1)?.production_entity).toEqual(['sensor.a', 'sensor.b']);
        change({ production_entity: ['sensor.a'] });
        expect(changes.at(-1)?.production_entity).toBe('sensor.a');
    });

    it('flips the battery or grid sign, and leaves invert out of the YAML while it is off', () => {
        const { change, changes, form } = mount(FULL_CONFIG);
        change({ grid: { ...FULL_CONFIG.grid, invert: true } });
        expect(changes.at(-1)?.grid?.invert).toBe(true);
        change({ grid: { ...FULL_CONFIG.grid, invert: false }, battery: { ...FULL_CONFIG.battery, invert: false } });
        expect(changes.at(-1)?.grid).not.toHaveProperty('invert');
        expect(changes.at(-1)?.battery).not.toHaveProperty('invert');
        const grid = form.schema!.find(b => b.name === 'grid')!.schema!.find(f => f.name === 'invert')!;
        expect(form.computeHelper!(grid)).toMatch(/positive à l'achat/);
    });

    it('shows the cells the card picks by itself, and writes cells only once they differ', () => {
        const { form, change, changes } = mount(FULL_CONFIG);
        expect(form.data).toMatchObject({ cell_1: 'battery', cell_2: 'grid', cell_3: 'voltage', cell_4: 'tomorrow' });
        change({ animate: false });
        expect(changes.at(-1)).not.toHaveProperty('cells');
        change({ cell_3: 'consumption' });
        expect(changes.at(-1)?.cells).toEqual(['battery', 'grid', 'consumption', 'tomorrow']);
    });

    it('asks entity, name and icon for a free cell, and saves it once the entity is picked', () => {
        const { form, change, changes } = mount(FULL_CONFIG);
        change({ cell_4: 'custom' });
        expect(fields(form.schema!)).toEqual(expect.arrayContaining(['./cell_4_entity', './cell_4_name', './cell_4_icon']));
        expect(form.computeLabel!({ name: 'cell_4_entity' })).toBe('Entité');
        expect(form.computeLabel!({ name: 'cell_4' })).toBe('Case 4');
        change({ cell_4: 'custom', cell_4_entity: 'sensor.ev_soc', cell_4_name: 'Voiture', cell_4_icon: '' });
        expect(changes.at(-1)?.cells).toEqual(['battery', 'grid', 'voltage', { entity: 'sensor.ev_soc', name: 'Voiture' }]);
        expect(Object.keys(changes.at(-1)!).some(k => k.startsWith('cell_'))).toBe(false);
    });

    it('offers the night hero, production by default (left out of the YAML)', () => {
        const { form, change, changes } = mount();
        expect(form.data?.night_hero).toBe('production');
        change({ animate: false });
        expect(changes.at(-1)).not.toHaveProperty('night_hero');
        change({ night_hero: 'consumption', consumption_entity: 'sensor.home' });
        expect(changes.at(-1)).toMatchObject({ night_hero: 'consumption', consumption_entity: 'sensor.home' });
    });
});

describe('pure helpers', () => {
    it('keeps a default the YAML wrote on purpose', () => {
        expect(nextConfig({ ...MINIMAL, animate: true }, formData({ ...MINIMAL, animate: true })).animate).toBe(true);
        expect(nextConfig(MINIMAL, formData(MINIMAL))).toEqual(MINIMAL);
        expect(nextConfig(MINIMAL, { ...formData(MINIMAL), animate: false }).animate).toBe(false);
    });
});
