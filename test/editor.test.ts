import { describe, it, expect } from 'vitest';
import { EDITOR_HELPERS, EDITOR_LABELS, EnergySkyCardEditor, blockOfField, editorHelper, editorLabel, editorSchema, formData, nextConfig, schemaLeaves, type SchemaItem } from '../src/energy-sky-card-editor';
import { CARD_EDITOR_NAME } from '../src/constants';
import { CARD_STRINGS, LANGUAGES } from '../src/localize';
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
const fields = (schema: SchemaItem[]) => schema.flatMap(block => schemaLeaves(block.schema ?? []).map(f => `${block.name || '.'}/${f.name}`));

describe('schema', () => {
    it('has the blocks of the brief, in order', () => {
        expect(editorSchema('fr').map(b => b.title)).toEqual(['Production', 'Batterie', 'Réseau', 'Disposition', 'Cases', 'Consommateurs', 'Ciel', 'Actions']);
        expect(editorSchema('en').map(b => b.title)).toEqual(['Production', 'Battery', 'Grid', 'Layout', 'Cells', 'Appliances', 'Sky', 'Actions']);
    });

    it('covers every option except the palettes, with nested battery and grid', () => {
        expect(fields(editorSchema('fr'))).toEqual([
            './production_entity', './daily_production_entities', './forecast_tomorrow_entity',
            './production_threshold', './production_max', './smoothing', './stale_after',
            'battery/soc_entity', 'battery/sensors', 'battery/power_entity', 'battery/capacity', 'battery/temperature_entity', 'battery/invert', 'battery/power_threshold', 'battery/soc_reached_entities',
            'grid/sensors', 'grid/power_entity', 'grid/invert', 'grid/voltage_entity', 'grid/outage_entity', 'grid/outage_states',
            './layout', './flow', './night_hero', './cell_1', './cell_2', './cell_3', './cell_4',
            './consumption_entity',
            './background', './tariff_color_entity', './sun_entity', './animate',
            './tap_action', './hold_action', './double_tap_action',
        ]);
    });

    it('lets several daily sensors and locks be picked, and uses Home Assistant\'s action picker', () => {
        const all = editorSchema('fr').flatMap(b => schemaLeaves(b.schema ?? []));
        const byName = (block: string, name: string) => schemaLeaves(editorSchema('fr').find(b => (b.name || b.title) === block)?.schema ?? []).find(f => f.name === name);
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
        const grid = schemaLeaves(form.schema!.find(b => b.name === 'grid')!.schema!).find(f => f.name === 'invert')!;
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

    it('asks a tap action for each cell, and saves a built-in cell with one as { type, tap_action }', () => {
        const { form, changes, change } = mount(FULL_CONFIG);
        expect(fields(form.schema!)).toEqual(expect.arrayContaining(['./cell_1_tap_action', './cell_4_tap_action']));
        expect(form.computeLabel!({ name: 'cell_2_tap_action' })).toBe('Appui sur la case');
        expect(form.computeHelper!({ name: 'cell_2_tap_action' })).toMatch(/ouvre l'entité de la case/);
        expect(form.schema!.flatMap(b => schemaLeaves(b.schema ?? [])).find(f => f.name === 'cell_2_tap_action')?.selector).toEqual({ ui_action: {} });
        const url = { action: 'url', url_path: 'https://example.org' };
        change({ cell_2_tap_action: url });
        expect(changes.at(-1)?.cells).toEqual(['battery', { type: 'grid', tap_action: url }, 'voltage', 'tomorrow']);
        // And back: the slot shows it
        expect(formData(changes.at(-1)!)).toMatchObject({ cell_2: 'grid', cell_2_tap_action: url });
        expect(fields(editorSchema('fr'))).not.toContain('./cell_tap');
    });

    it('asks entity, name and icon for a free cell, and saves it once the entity is picked', () => {
        const { form, change, changes } = mount(FULL_CONFIG);
        change({ cell_4: 'custom' });
        expect(fields(form.schema!)).toEqual(expect.arrayContaining(['./cell_4_entity', './cell_4_name', './cell_4_icon']));
        expect(form.computeLabel!({ name: 'cell_4_entity' })).toBe('Entité');
        expect(form.computeLabel!({ name: 'cell_4' })).toBe('Contenu');
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

describe('the layout', () => {
    it('offers standard and side in a Layout block of its own, before Cells, standard by default (left out of the YAML)', () => {
        const display = editorSchema('fr').find(b => b.title === 'Disposition')!;
        expect(display.schema?.map(f => f.name)).toEqual(['layout', 'flow', 'night_hero']);
        expect(editorLabel('fr', 'layout')).toBe('Format');
        expect((display.schema?.[0].selector as any).select.options.map((o: { value: string }) => o.value)).toEqual(['standard', 'side']);
        expect(schemaLeaves(editorSchema('fr').find(b => b.title === 'Cases')!.schema!)[0].name).toBe('cell_1');
        const { form, change, changes } = mount();
        expect(form.data?.layout).toBe('standard');
        change({ animate: false });
        expect(changes.at(-1)).not.toHaveProperty('layout');
        change({ layout: 'side' });
        expect(changes.at(-1)?.layout).toBe('side');
    });
});

describe('Languages', () => {
    it('labels every field and block, and offers every help, in every language', () => {
        for (const lang of LANGUAGES) {
            const data = { cell_1: 'custom', cell_2: 'battery', flow: 'tap', consumer_1_entity: 'sensor.boiler' };
            for (const block of editorSchema(lang, data)) {
                expect(block.title).toBeTruthy();
                for (const field of schemaLeaves(block.schema ?? [])) {
                    expect(editorLabel(lang, field.name), `${lang} ${field.name}`).not.toBe(field.name);
                    expect(editorHelper(lang, field.name, block.name) === undefined, `${lang} ${field.name}`).toBe(editorHelper('en', field.name, block.name) === undefined);
                }
            }
        }
        expect(editorLabel('en', 'kind_custom')).toBe('Free (any entity)');
        expect(editorLabel('en', 'loading')).toBe('Loading the editor…');
    });

    it('gives the card and the editor the same strings in every language', () => {
        expect(LANGUAGES).toEqual(['fr', 'en', 'de', 'es', 'it', 'nl']);
        for (const lang of LANGUAGES) {
            expect(Object.keys(CARD_STRINGS[lang]).sort(), lang).toEqual(Object.keys(CARD_STRINGS.en).sort());
            expect(Object.keys(EDITOR_LABELS[lang]).sort(), lang).toEqual(Object.keys(EDITOR_LABELS.en).sort());
            expect(Object.keys(EDITOR_HELPERS[lang]).sort(), lang).toEqual(Object.keys(EDITOR_HELPERS.en).sort());
        }
        expect(editorSchema('de').map(b => b.title)).toEqual(['Produktion', 'Batterie', 'Netz', 'Darstellung', 'Felder', 'Verbraucher', 'Himmel', 'Aktionen']);
        expect(editorLabel('nl', 'consumer_2_entity')).toBe('Vermogen (W)');
        expect(editorLabel('it', 'cell_3')).toBe('Contenuto');
    });
});

describe('help under the layout fields', () => {
    it('puts no help under the layout or the energy flow', () => {
        expect(editorHelper('fr', 'flow')).toBeUndefined();
        expect(editorHelper('en', 'flow')).toBeUndefined();
        expect(editorHelper('fr', 'layout')).toBeUndefined();
        expect(editorHelper('en', 'layout')).toBeUndefined();
    });
});

describe('the energy flow', () => {
    it('offers none, on a tap or always, under the layout; none by default (left out of the YAML)', () => {
        const display = editorSchema('fr').find(b => b.title === 'Disposition')!;
        expect(display.schema?.[1].name).toBe('flow');
        expect((display.schema?.[1].selector as any).select.options.map((o: { label: string }) => o.label)).toEqual(['Aucun', 'Déplier en touchant le grand chiffre', 'Toujours visible']);
        const { form, change, changes } = mount();
        expect(form.data?.flow).toBe('none');
        change({ animate: false });
        expect(changes.at(-1)).not.toHaveProperty('flow');
        change({ flow: 'tap' });
        expect(changes.at(-1)?.flow).toBe('tap');
        change({ flow: 'always' });
        expect(changes.at(-1)?.flow).toBe('always');
        change({ flow: 'none' });
        expect(changes.at(-1)).not.toHaveProperty('flow');
    });

    it('shows 0.3.3\'s expandable: true as on a tap, and saves it as flow: tap', () => {
        const { form, change, changes } = mount({ ...MINIMAL, expandable: true });
        expect(form.data?.flow).toBe('tap');
        change({ animate: false });
        expect(changes.at(-1)?.flow).toBe('tap');
        expect(changes.at(-1)).not.toHaveProperty('expandable');
    });

    it('offers a colour picker per source with a flow, showing the default or the card\'s colour', () => {
        const display = (data: Record<string, unknown>) => schemaLeaves(editorSchema('fr', data).find(b => b.title === 'Disposition')!.schema!).map(f => f.name);
        expect(display({ flow: 'none' })).toEqual(['layout', 'flow', 'night_hero']);
        expect(display({ flow: 'always' })).toEqual(['layout', 'flow', 'night_hero', 'flow_color_solar', 'flow_color_grid', 'flow_color_battery', 'flow_color_consumption']);
        expect(editorLabel('fr', 'flow_color_consumption')).toBe('Couleur des appareils');
        const data = formData({ ...MINIMAL, flow: 'always', flow_colors: { solar: '#ff8800', grid: 'var(--accent-color)' } });
        expect(data.flow_color_solar).toEqual([255, 136, 0]);
        // A colour the picker can't show is left to YAML
        expect(data.flow_color_grid).toBeUndefined();
        expect(data.flow_color_battery).toEqual([158, 240, 200]);
    });

    it('saves a picked colour as flow_colors, drops one set back to its default, and keeps a theme variable', () => {
        const { change, changes } = mount({ ...MINIMAL, flow: 'always', flow_colors: { grid: 'var(--accent-color)' } });
        change({ animate: false });
        expect(changes.at(-1)?.flow_colors).toEqual({ grid: 'var(--accent-color)' });
        change({ flow_color_solar: [255, 136, 0] });
        expect(changes.at(-1)?.flow_colors).toEqual({ grid: 'var(--accent-color)', solar: '#ff8800' });
        change({ flow_color_solar: [255, 214, 140] });
        expect(changes.at(-1)?.flow_colors).toEqual({ grid: 'var(--accent-color)' });
        expect(changes.at(-1)).not.toHaveProperty('flow_color_solar');
    });

    it('turns a fixed number of rows into auto, so the flow isn\'t cut', () => {
        const withRows = { ...MINIMAL, grid_options: { columns: 12, rows: 4 } } as EnergySkyCardConfig;
        expect((nextConfig(withRows, { ...formData(withRows), flow: 'always' }) as any).grid_options).toEqual({ columns: 12, rows: 'auto' });
        expect((nextConfig(withRows, formData(withRows)) as any).grid_options).toEqual({ columns: 12, rows: 4 });
    });
});

describe('the appliances', () => {
    const titles = (data: Record<string, unknown>) => editorSchema('fr', data).map(b => b.title);
    const block = (data: Record<string, unknown>) => schemaLeaves(editorSchema('fr', data).find(b => b.title === 'Consommateurs')?.schema ?? []).map(f => f.name);

    it('have a block of their own, after Cells, with the home\'s consumption; the appliances only with a flow', () => {
        expect(titles({ flow: 'none' })).toEqual(['Production', 'Batterie', 'Réseau', 'Disposition', 'Cases', 'Consommateurs', 'Ciel', 'Actions']);
        expect(block({ flow: 'none' })).toEqual(['consumption_entity']);
    });

    it('open one slot at a time, with a name, an icon and a tap once the entity is set', () => {
        expect(block({ flow: 'tap' })).toEqual(['consumption_entity', 'consumer_threshold', 'consumer_1_entity']);
        expect(block({ flow: 'tap', consumer_1_entity: 'sensor.boiler' })).toEqual(['consumption_entity', 'consumer_threshold', 'consumer_1_entity', 'consumer_1_name', 'consumer_1_icon', 'consumer_1_soc_entity', 'consumer_1_always_show', 'consumer_1_tap_action', 'consumer_2_entity']);
        expect(editorLabel('fr', 'consumer_threshold')).toBe('Seuil d\'affichage');
        expect(editorHelper('en', 'consumer_threshold')).toMatch(/10 W when empty/);
        expect(editorLabel('fr', 'consumer_2_entity')).toBe('Puissance (W)');
        expect(editorLabel('en', 'consumer_2_name')).toBe('Name (optional)');
        expect(editorHelper('fr', 'consumer_1_entity')).toMatch(/quatre au plus/);
    });

    it('save the display threshold, and leave it out while empty', () => {
        const { change, changes } = mount({ ...MINIMAL, flow: 'always' });
        change({ animate: false });
        expect(changes.at(-1)).not.toHaveProperty('consumer_threshold');
        change({ consumer_threshold: 50 });
        expect(changes.at(-1)?.consumer_threshold).toBe(50);
    });

    it('save as a consumers list, and leave it out when emptied', () => {
        const { change, changes } = mount({ ...MINIMAL, flow: 'always' });
        change({ consumer_1_entity: 'sensor.boiler', consumer_1_name: 'Chauffe-eau' });
        expect(changes.at(-1)?.consumers).toEqual([{ entity: 'sensor.boiler', name: 'Chauffe-eau' }]);
        change({ consumer_2_entity: 'sensor.pool', consumer_2_icon: 'mdi:pool' });
        expect(changes.at(-1)?.consumers).toEqual([{ entity: 'sensor.boiler', name: 'Chauffe-eau' }, { entity: 'sensor.pool', icon: 'mdi:pool' }]);
        change({ consumer_1_entity: '', consumer_1_name: '', consumer_2_entity: '', consumer_2_icon: '' });
        expect(changes.at(-1)).not.toHaveProperty('consumers');
    });
});

describe('the sky', () => {
    const sky = (data: Record<string, unknown>) => schemaLeaves(editorSchema('fr', data).find(b => b.title === 'Ciel')!.schema!).map(f => f.name);

    it('offers Tempo, solid or weather, then the field that goes with it', () => {
        expect(sky({ background: 'tempo' })).toEqual(['background', 'tariff_color_entity', 'sun_entity', 'animate']);
        expect(sky({ background: 'solid' })).toEqual(['background', 'background_color', 'sun_entity', 'animate']);
        expect(sky({ background: 'weather' })).toEqual(['background', 'weather_entity', 'sun_entity', 'animate']);
        expect(editorLabel('fr', 'background_weather')).toBe('Météo');
        expect(editorLabel('en', 'background_solid')).toBe('Solid: one colour');
    });

    it('keeps Tempo out of the YAML, and writes a picked solid colour as hex', () => {
        const { form, change, changes } = mount();
        expect(form.data?.background).toBe('tempo');
        change({ animate: false });
        expect(changes.at(-1)).not.toHaveProperty('background');
        expect(changes.at(-1)).not.toHaveProperty('background_color');
        change({ background: 'solid' });
        expect(changes.at(-1)?.background).toBe('solid');
        expect(changes.at(-1)).not.toHaveProperty('background_color');
        change({ background: 'solid', background_color: [106, 76, 147] });
        expect(changes.at(-1)?.background_color).toBe('#6a4c93');
        change({ background: 'weather', weather_entity: 'weather.home' });
        expect(changes.at(-1)).toMatchObject({ background: 'weather', weather_entity: 'weather.home' });
    });
});

describe('pure helpers', () => {
    it('keeps a default the YAML wrote on purpose', () => {
        expect(nextConfig({ ...MINIMAL, animate: true }, formData({ ...MINIMAL, animate: true })).animate).toBe(true);
        expect(nextConfig(MINIMAL, formData(MINIMAL))).toEqual(MINIMAL);
        expect(nextConfig(MINIMAL, { ...formData(MINIMAL), animate: false }).animate).toBe(false);
    });
});

describe('One power sensor or two', () => {
    const names = (data: Record<string, unknown>, block: string) => schemaLeaves(editorSchema('fr', data).find(b => b.name === block)!.schema!).map(f => f.name);

    it('shows the chosen sensors\' fields', () => {
        expect(names({}, 'grid').slice(0, 3)).toEqual(['sensors', 'power_entity', 'invert']);
        expect(names({ grid: { sensors: 'split' } }, 'grid').slice(0, 3)).toEqual(['sensors', 'import_entity', 'export_entity']);
        expect(names({ battery: { sensors: 'split' } }, 'battery')).toEqual(expect.arrayContaining(['charge_entity', 'discharge_entity']));
        expect(names({ battery: { sensors: 'split' } }, 'battery')).not.toContain('invert');
        expect(editorLabel('fr', 'sensors_split_grid')).toBe('Deux capteurs : achat et vente');
    });

    it('reads the config\'s form, and writes only the chosen one', () => {
        expect((formData({ ...MINIMAL, grid: { import_entity: 'sensor.in' } }).grid as Record<string, unknown>).sensors).toBe('split');
        expect((formData(MINIMAL).grid as Record<string, unknown>).sensors).toBe('single');
        const previous = { ...MINIMAL, grid: { power_entity: 'sensor.grid', invert: true } };
        const next = nextConfig(previous, { ...formData(previous), grid: { sensors: 'split', power_entity: 'sensor.grid', invert: true, import_entity: 'sensor.in', export_entity: 'sensor.out' } });
        expect(next.grid).toEqual({ import_entity: 'sensor.in', export_entity: 'sensor.out' });
        const back = nextConfig(next, { ...formData(next), grid: { sensors: 'single', import_entity: 'sensor.in', power_entity: 'sensor.grid' } });
        expect(back.grid).toEqual({ power_entity: 'sensor.grid' });
    });

    it('keeps one battery a plain string, several a list, and no empty blocks', () => {
        const one = nextConfig(MINIMAL, { ...formData(MINIMAL), battery: { sensors: 'single', soc_entity: ['sensor.soc'], power_entity: ['sensor.bat'] } });
        expect(one.battery).toEqual({ soc_entity: 'sensor.soc', power_entity: 'sensor.bat' });
        const two = nextConfig(MINIMAL, { ...formData(MINIMAL), battery: { sensors: 'single', soc_entity: ['sensor.a', 'sensor.b'] } });
        expect(two.battery).toEqual({ soc_entity: ['sensor.a', 'sensor.b'] });
        const none = nextConfig(MINIMAL, formData(MINIMAL));
        expect(none.battery).toBeUndefined();
        expect(none.grid).toBeUndefined();
        expect(formData({ ...MINIMAL, battery: { soc_entity: 'sensor.soc' } }).battery).toMatchObject({ soc_entity: ['sensor.soc'], sensors: 'single' });
    });
});

describe('the sensor choice in the form', () => {
    it('stays on « Two sensors » before they are picked', () => {
        const { form, change, changes } = mount({ ...MINIMAL, grid: { power_entity: 'sensor.grid' } });
        change({ grid: { ...(form.data!.grid as object), sensors: 'split' } });
        expect(changes.at(-1)?.grid).toBeUndefined();
        expect((form.data!.grid as Record<string, unknown>).sensors).toBe('split');
        expect(schemaLeaves(form.schema!.find(b => b.name === 'grid')!.schema!).map(f => f.name)).toContain('import_entity');
    });
});

describe('folded sections', () => {
    const block = (title: string, data: Record<string, unknown> = {}, names = (_: string): string | undefined => undefined) =>
        editorSchema('fr', data, false, names).find(b => b.title === title)!.schema!;
    const sections = (items: SchemaItem[]) => items.filter(i => i.type === 'expandable').map(i => i.title);
    const top = (items: SchemaItem[]) => items.filter(i => i.type !== 'expandable').map(i => i.name);

    it('keep what nearly everyone sets on top, the rest folded, sharing the block\'s values', () => {
        expect(top(block('Production'))).toEqual(['production_entity', 'daily_production_entities', 'forecast_tomorrow_entity']);
        expect(sections(block('Production'))).toEqual(['Réglages fins']);
        expect(top(block('Batterie'))).toEqual(['soc_entity', 'sensors', 'power_entity']);
        expect(sections(block('Batterie'))).toEqual(['Autonomie', 'Réglages fins']);
        expect(top(block('Réseau'))).toEqual(['sensors', 'power_entity', 'invert']);
        expect(sections(block('Réseau'))).toEqual(['Tension et coupures']);
        expect(sections(block('Disposition', { flow: 'tap' }))).toEqual(['Couleurs du flux']);
        // Folded: open only the block they're in; flatten: no level of their own in the values
        const all = editorSchema('fr', { flow: 'tap' }).flatMap(b => b.schema ?? []).filter(i => i.type === 'expandable');
        expect(all.every(i => i.flatten && !i.expanded)).toBe(true);
    });

    it('tell the battery\'s and the grid\'s invert apart, through a section', () => {
        const schema = editorSchema('fr');
        const invert = (name: string) => schemaLeaves(schema.find(b => b.name === name)!.schema!).find(f => f.name === 'invert')!;
        expect(blockOfField(schema, invert('battery'))).toBe('battery');
        expect(blockOfField(schema, invert('grid'))).toBe('grid');
        expect(blockOfField(schema, schemaLeaves(schema[0].schema!).find(f => f.name === 'smoothing')!)).toBeUndefined();
    });

    it('give each cell its own, titled with what it shows', () => {
        const names = (id: string) => id === 'sensor.water' ? 'Eau chaude' : undefined;
        const cells = block('Cases', { cell_1: 'battery', cell_2: 'custom', cell_2_entity: 'sensor.water', cell_3: 'custom', cell_3_name: 'Cumulus' }, names);
        expect(cells.map(c => c.title)).toEqual(['Case 1 · Batterie', 'Case 2 · Eau chaude', 'Case 3 · Cumulus', 'Case 4 · Aucune']);
        expect(cells[0].icon).toBe('mdi:home-battery-outline');
        expect(cells[0].schema!.map(f => f.name)).toEqual(['cell_1', 'cell_1_tap_action']);
    });

    it('give each appliance its own, titled with its name, and an empty one to add the next', () => {
        const names = (id: string) => id === 'sensor.car' ? 'Tesla' : undefined;
        const items = block('Consommateurs', { flow: 'tap', consumer_1_entity: 'sensor.car', consumer_2_entity: 'sensor.boiler', consumer_2_name: 'Ballon' }, names);
        expect(top(items)).toEqual(['consumption_entity', 'consumer_threshold']);
        expect(sections(items)).toEqual(['Tesla', 'Ballon', 'Appareil 3']);
        expect(items.at(-1)!.icon).toBe('mdi:plus-circle-outline');
        expect(items.at(-1)!.schema!.map(f => f.name)).toEqual(['consumer_3_entity']);
    });

    it('take the friendly names from Home Assistant in the editor', () => {
        const { form } = mount({ ...MINIMAL, flow: 'tap', consumers: [{ entity: 'sensor.car' }] });
        form.hass = undefined;
        const editor = form.parentElement as EnergySkyCardEditor;
        editor.hass = makeHass({ 'sensor.car': { entity_id: 'sensor.car', state: '0', attributes: { friendly_name: 'Voiture' }, last_updated: '', last_changed: '' } } as never);
        editor.setConfig({ ...MINIMAL, flow: 'tap', consumers: [{ entity: 'sensor.car' }] });
        const consumers = form.schema!.find(b => b.title === 'Consommateurs')!.schema!;
        expect(consumers.filter(i => i.type === 'expandable').map(i => i.title)).toEqual(['Voiture', 'Appareil 2']);
    });
});

describe('the weather sky in the form', () => {
    it('picks a weather entity when the weather sky is chosen without one, and keeps the one picked', () => {
        const { editor, changes, change } = mount();
        editor.hass = makeHass({ 'sensor.production_pv': 0, 'weather.maison': 'sunny', 'weather.forecast': 'rainy' });
        change({ background: 'weather' });
        expect(changes.at(-1)).toMatchObject({ background: 'weather', weather_entity: 'weather.maison' });
        change({ background: 'weather', weather_entity: 'weather.forecast' });
        expect(changes.at(-1)!.weather_entity).toBe('weather.forecast');
        // The other skies don't need one
        change({ background: 'solid', weather_entity: undefined });
        expect(changes.at(-1)!.weather_entity).toBeUndefined();
    });
});
