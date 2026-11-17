// Entry point of the editor bundle, loaded on demand by getConfigElement().
// The visual editor: Home Assistant's own ha-form with selectors, in blocks
// (Production, Battery, Grid, Tariff and sky, Actions). Tariff palettes stay
// YAML-only and pass through untouched.

import { CARD_EDITOR_NAME } from './constants';
import { cardLanguage, type Lang } from './localize';
import { CELL_KINDS, DEFAULT_OUTAGE_STATES, MAX_CELLS, MAX_CONSUMERS, cellKind, defaultCells, isBuiltinObject, isCustom } from './model';
import { isAction } from './actions';
import { DEFAULT_PRODUCTION_MAX } from './sky';
import type { CellConfig, CellKind, ConsumerConfig, CustomCell, EnergySkyCardConfig, HomeAssistant } from './types';

/** The parts of ha-form's schema the editor uses */
export interface SchemaItem {
    name: string;
    type?: 'expandable';
    flatten?: boolean;
    expanded?: boolean;
    title?: string;
    icon?: string;
    required?: boolean;
    selector?: Record<string, unknown>;
    schema?: SchemaItem[];
}

const LABELS: Record<Lang, Record<string, string>> = {
    fr: {
        production: 'Production', battery: 'Batterie', grid: 'Réseau', tariff: 'Tarif et ciel', actions: 'Actions', cells: 'Cases', display: 'Disposition', consumers: 'Consommateurs', consumer: 'Appareil {n}',
        production_entity: 'Puissance solaire (W, additionnées)',
        consumption_entity: 'Consommation de la maison (W)', night_hero: 'Grand chiffre la nuit',
        invert: 'Inverser le signe du capteur',
        flow: 'Flux d\'énergie', flow_none: 'Aucun', flow_tap: 'Déplier en touchant le grand chiffre', flow_always: 'Toujours visible',
        layout: 'Format', layout_standard: 'Standard : les cases sous le chiffre (4 rangées)', layout_side: 'Côté : icône + valeur à droite (2 rangées)',
        cell: 'Case {n}', cell_entity: 'Entité', cell_name: 'Nom (facultatif)', cell_icon: 'Icône (facultative)', cell_tap_action: 'Appui sur la case',
        kind_none: 'Aucune', kind_battery: 'Batterie', kind_grid: 'Réseau', kind_voltage: 'Tension', kind_tomorrow: 'Prévu demain',
        kind_consumption: 'Consommation', kind_custom: 'Libre (une entité au choix)',
        hero_production: 'Production solaire', hero_consumption: 'Consommation de la maison', hero_battery: 'Charge de la batterie', production_max: 'Puissance maximale (halo)',
        daily_production_entities: 'Production du jour (kWh, additionnés)', forecast_tomorrow_entity: 'Prévision pour demain (kWh)',
        soc_entity: 'Charge (%)', power_entity: 'Puissance (W)', temperature_entity: 'Température', soc_reached_entities: 'SOC atteint',
        voltage_entity: 'Tension (V)', outage_entity: 'Alarme de coupure', outage_states: 'États de coupure',
        tariff_color_entity: 'Couleur tarifaire (Bleu / Blanc / Rouge)', sun_entity: 'Soleil',
        power_threshold: 'Seuil des flèches ↑ / ↓', animate: 'Animations',
        tap_action: 'Appui', hold_action: 'Appui long', double_tap_action: 'Double appui',
        loading: 'Chargement de l\'éditeur…',
    },
    en: {
        production: 'Production', battery: 'Battery', grid: 'Grid', tariff: 'Tariff and sky', actions: 'Actions', cells: 'Cells', display: 'Layout', consumers: 'Appliances', consumer: 'Appliance {n}',
        production_entity: 'Solar power (W, summed)',
        consumption_entity: 'Home consumption (W)', night_hero: 'Big number at night',
        invert: 'Flip the sensor\'s sign',
        flow: 'Energy flow', flow_none: 'None', flow_tap: 'Unfold on a tap on the big number', flow_always: 'Always shown',
        layout: 'Format', layout_standard: 'Standard: the cells under the number (4 rows)', layout_side: 'Side: icon + value on the right (2 rows)',
        cell: 'Cell {n}', cell_entity: 'Entity', cell_name: 'Name (optional)', cell_icon: 'Icon (optional)', cell_tap_action: 'Tap on the cell',
        kind_none: 'None', kind_battery: 'Battery', kind_grid: 'Grid', kind_voltage: 'Voltage', kind_tomorrow: 'Tomorrow',
        kind_consumption: 'Consumption', kind_custom: 'Free (any entity)',
        hero_production: 'Solar production', hero_consumption: 'Home consumption', hero_battery: 'Battery charge', production_max: 'Maximum power (halo)',
        daily_production_entities: 'Energy today (kWh, summed)', forecast_tomorrow_entity: 'Forecast for tomorrow (kWh)',
        soc_entity: 'Charge (%)', power_entity: 'Power (W)', temperature_entity: 'Temperature', soc_reached_entities: 'SOC reached',
        voltage_entity: 'Voltage (V)', outage_entity: 'Outage alarm', outage_states: 'Outage states',
        tariff_color_entity: 'Tariff colour (Bleu / Blanc / Rouge)', sun_entity: 'Sun',
        power_threshold: 'Threshold for the ↑ / ↓ arrows', animate: 'Animations',
        tap_action: 'Tap', hold_action: 'Hold', double_tap_action: 'Double tap',
        loading: 'Loading the editor…',
    },
};

export function editorLabel(lang: Lang, key: string): string {
    // An appliance's slot: its entity is labelled with its number, the rest like a cell's
    const consumer = /^consumer_(\d)_(entity|name|icon|tap_action)$/.exec(key);
    if (consumer) return consumer[2] === 'entity' ? LABELS[lang].consumer.replace('{n}', consumer[1]) : LABELS[lang][`cell_${consumer[2]}`];
    const slot = /^cell_(\d)(?:_(entity|name|icon|tap_action))?$/.exec(key);
    if (slot) return slot[2] ? LABELS[lang][`cell_${slot[2]}`] : LABELS[lang].cell.replace('{n}', slot[1]);
    return LABELS[lang][key] ?? key;
}

/** The line under a field, where its label can't say it all */
const HELPERS: Record<Lang, Record<string, string>> = {
    fr: {
        soc_reached_entities: 'Entités on / off (input_boolean, binary_sensor, switch) qui passent à « on » quand la batterie a atteint la charge que vous visez, par exemple un input_boolean activé par une automatisation. Si l\'une est à « on », la case Batterie affiche « · SOC atteint » ; sinon rien.',
        power_threshold: 'En dessous de cette puissance, la batterie est considérée au repos : pas de flèche ↑ / ↓. 20 W si vide.',
        production_entity: 'Plusieurs capteurs (micro-onduleurs, onduleur de chaîne…) sont additionnés.',
        night_hero: 'Après le coucher du soleil, la production est nulle : le grand chiffre peut montrer autre chose. Il faut la consommation de la maison ou la charge de la batterie renseignée.',
        temperature_entity: 'Facultatif : affichée après la charge, « 78 % ↑ · 24 °C ».',
        battery_invert: 'À cocher si votre capteur est positif en décharge : la carte attend une valeur positive en charge.',
        grid_invert: 'À cocher si votre capteur est positif quand vous vendez : la carte attend une valeur positive à l\'achat.',
        flow: 'Le flux entre solaire, réseau, batterie et maison, sous la carte ; toucher un élément ouvre son entité. « Déplier en touchant » : toucher le grand chiffre ou sa ligne le montre ou le cache, le reste de la carte garde son « Appui ».',
        consumers: 'Un capteur de puissance (W) par appareil, quatre au plus : le premier au-dessus de « Maison », le deuxième en dessous, puis on alterne.',
        consumer_tap_action: 'Par défaut : ouvre l\'entité de l\'appareil.',
        cell_tap_action: 'Par défaut : ouvre l\'entité de la case, ou fait l\'« Appui » de la carte s\'il est choisi (bloc Actions).',
    },
    en: {
        soc_reached_entities: 'On / off entities (input_boolean, binary_sensor, switch) that turn on when the battery has reached the charge you aim for, e.g. an input_boolean set by an automation. When any is on, the Battery cell reads "· SOC reached"; otherwise nothing.',
        power_threshold: 'Below this power the battery counts as idle: no ↑ / ↓ arrow. 20 W when empty.',
        production_entity: 'Several sensors (micro-inverters, string inverter…) are summed.',
        night_hero: 'After sunset production is zero: the big number can show something else. Needs the home consumption or the battery charge set.',
        temperature_entity: 'Optional: shown after the charge, "78% ↑ · 24 °C".',
        battery_invert: 'Tick if your sensor is positive when discharging: the card expects positive when charging.',
        grid_invert: 'Tick if your sensor is positive when exporting: the card expects positive when importing.',
        flow: 'The flow between solar, grid, battery and home, under the card; a tap on a node opens its entity. "Unfold on a tap": a tap on the big number or its line shows or hides it, the rest of the card keeps its Tap.',
        consumers: 'One power sensor (W) per appliance, four at most: the first above the home, the second below, then in turn.',
        consumer_tap_action: 'By default: opens the appliance\'s entity.',
        cell_tap_action: 'By default: opens the cell\'s entity, or runs the card\'s Tap action if one is set (Actions block).',
    },
};

/** The helper under a field; in a block, the block's name tells the two invert fields apart */
export function editorHelper(lang: Lang, key: string, block?: string): string | undefined {
    if (/^cell_\d_tap_action$/.test(key)) return HELPERS[lang].cell_tap_action;
    if (/^consumer_\d_tap_action$/.test(key)) return HELPERS[lang].consumer_tap_action;
    if (key === 'consumer_1_entity') return HELPERS[lang].consumers;
    return HELPERS[lang][block && key === 'invert' ? `${block}_invert` : key];
}

const sensor = (extra: Record<string, unknown> = {}) => ({ entity: { domain: 'sensor', ...extra } });

const CELL_CHOICES = ['none', ...CELL_KINDS, 'custom'] as const;

/** The slots' fields: a choice per cell, and entity, name and icon under a free one */
function cellFields(lang: Lang, data: Record<string, unknown>): SchemaItem[] {
    const options = CELL_CHOICES.map(value => ({ value, label: editorLabel(lang, `kind_${value}`) }));
    return Array.from({ length: MAX_CELLS }, (_, i) => i + 1).flatMap(n => [
        { name: `cell_${n}`, selector: { select: { mode: 'dropdown', options } } },
        ...(data[`cell_${n}`] === 'custom' ? [
            { name: `cell_${n}_entity`, selector: { entity: {} } },
            { name: `cell_${n}_name`, selector: { text: {} } },
            { name: `cell_${n}_icon`, selector: { icon: {} } },
        ] : []),
        // Home Assistant's action picker: more-info, navigate, url, perform-action, none…
        ...(data[`cell_${n}`] && data[`cell_${n}`] !== 'none' ? [{ name: `cell_${n}_tap_action`, selector: { ui_action: {} } }] : []),
    ]);
}

/** The form; data (the form's current values) decides which free-cell fields show */
export function editorSchema(lang: Lang, data: Record<string, unknown> = {}): SchemaItem[] {
    const t = (key: string) => editorLabel(lang, key);
    const heroOptions = (['production', 'consumption', 'battery'] as const).map(value => ({ value, label: t(`hero_${value}`) }));
    return [
        {
            name: '', type: 'expandable', flatten: true, expanded: true, title: t('production'), icon: 'mdi:solar-power-variant-outline',
            schema: [
                { name: 'production_entity', required: true, selector: sensor({ device_class: 'power', multiple: true }) },
                { name: 'production_max', selector: { number: { min: 100, max: 100000, step: 100, mode: 'box', unit_of_measurement: 'W' } } },
                { name: 'daily_production_entities', selector: sensor({ multiple: true }) },
                { name: 'forecast_tomorrow_entity', selector: sensor() },
                { name: 'consumption_entity', selector: sensor({ device_class: 'power' }) },
                { name: 'night_hero', selector: { select: { mode: 'dropdown', options: heroOptions } } },
            ],
        },
        {
            name: 'battery', type: 'expandable', title: t('battery'), icon: 'mdi:home-battery-outline',
            schema: [
                { name: 'soc_entity', selector: sensor() },
                { name: 'power_entity', selector: sensor() },
                { name: 'temperature_entity', selector: sensor({ device_class: 'temperature' }) },
                { name: 'invert', selector: { boolean: {} } },
                { name: 'power_threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'W' } } },
                { name: 'soc_reached_entities', selector: { entity: { multiple: true, domain: ['input_boolean', 'binary_sensor', 'switch'] } } },
            ],
        },
        {
            name: 'grid', type: 'expandable', title: t('grid'), icon: 'mdi:transmission-tower',
            schema: [
                { name: 'power_entity', selector: sensor() },
                { name: 'invert', selector: { boolean: {} } },
                { name: 'voltage_entity', selector: sensor() },
                { name: 'outage_entity', selector: { entity: {} } },
                { name: 'outage_states', selector: { select: { multiple: true, custom_value: true, options: DEFAULT_OUTAGE_STATES } } },
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('display'), icon: 'mdi:page-layout-body',
            schema: [
                { name: 'layout', selector: { select: { mode: 'list', options: (['standard', 'side'] as const).map(value => ({ value, label: t(`layout_${value}`) })) } } },
                { name: 'flow', selector: { select: { mode: 'list', options: (['none', 'tap', 'always'] as const).map(value => ({ value, label: t(`flow_${value}`) })) } } },
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('cells'), icon: 'mdi:view-grid-outline',
            schema: cellFields(lang, data),
        },
        // The appliances, with a flow only
        ...(data.flow === 'tap' || data.flow === 'always' ? [{
            name: '', type: 'expandable' as const, flatten: true, title: t('consumers'), icon: 'mdi:power-plug-outline',
            schema: consumerFields(data),
        }] : []),
        {
            name: '', type: 'expandable', flatten: true, title: t('tariff'), icon: 'mdi:palette-outline',
            schema: [
                { name: 'tariff_color_entity', selector: sensor() },
                { name: 'sun_entity', selector: { entity: { domain: 'sun' } } },
                { name: 'animate', selector: { boolean: {} } },
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('actions'), icon: 'mdi:gesture-tap',
            schema: [
                { name: 'tap_action', selector: { ui_action: {} } },
                { name: 'hold_action', selector: { ui_action: {} } },
                { name: 'double_tap_action', selector: { ui_action: {} } },
            ],
        },
    ];
}


/** The appliances' slots: an entity each, its name, icon and tap once it has one; a slot shows once the previous one is filled */
function consumerFields(data: Record<string, unknown>): SchemaItem[] {
    const fields: SchemaItem[] = [];
    for (let n = 1; n <= MAX_CONSUMERS; n++) {
        if (n > 1 && !data[`consumer_${n - 1}_entity`]) break;
        fields.push({ name: `consumer_${n}_entity`, selector: sensor({ device_class: 'power' }) });
        if (data[`consumer_${n}_entity`]) {
            fields.push(
                { name: `consumer_${n}_name`, selector: { text: {} } },
                { name: `consumer_${n}_icon`, selector: { icon: {} } },
                { name: `consumer_${n}_tap_action`, selector: { ui_action: {} } },
            );
        }
    }
    return fields;
}

/** The appliances as the form's slots */
function consumerSlots(config: EnergySkyCardConfig): Record<string, unknown> {
    return Object.fromEntries((config.consumers ?? []).flatMap((c, i) => [
        [`consumer_${i + 1}_entity`, c.entity], [`consumer_${i + 1}_name`, c.name], [`consumer_${i + 1}_icon`, c.icon], [`consumer_${i + 1}_tap_action`, c.tap_action],
    ]));
}

/** Back from the slots to a consumers list (an appliance needs its entity) */
function consumersFromSlots(value: Record<string, unknown>): ConsumerConfig[] {
    const consumers: ConsumerConfig[] = [];
    for (let n = 1; n <= MAX_CONSUMERS; n++) {
        const entity = value[`consumer_${n}_entity`];
        if (typeof entity !== 'string' || !entity) continue;
        const consumer: ConsumerConfig = { entity };
        for (const field of ['name', 'icon'] as const) {
            const v = value[`consumer_${n}_${field}`];
            if (typeof v === 'string' && v) consumer[field] = v;
        }
        const tap = value[`consumer_${n}_tap_action`];
        if (isAction(tap)) consumer.tap_action = tap;
        consumers.push(consumer);
    }
    return consumers;
}

/** The cells as the form's slots: cell_1 … cell_4, and the free cells' entity, name and icon */
function cellSlots(config: EnergySkyCardConfig): Record<string, unknown> {
    const cells: CellConfig[] = config.cells ?? defaultCells(config);
    const slots: Record<string, unknown> = {};
    for (let i = 0; i < MAX_CELLS; i++) {
        const cell = cells[i];
        const n = i + 1;
        if (cell === undefined) slots[`cell_${n}`] = 'none';
        else if (isCustom(cell)) {
            Object.assign(slots, { [`cell_${n}`]: 'custom', [`cell_${n}_entity`]: cell.entity, [`cell_${n}_name`]: cell.name, [`cell_${n}_icon`]: cell.icon, [`cell_${n}_tap_action`]: cell.tap_action });
        } else {
            slots[`cell_${n}`] = cellKind(cell);
            if (isBuiltinObject(cell)) slots[`cell_${n}_tap_action`] = cell.tap_action;
        }
    }
    return slots;
}

/** Back from the slots to a cells list (a free cell needs its entity) */
function cellsFromSlots(value: Record<string, unknown>): CellConfig[] {
    const cells: CellConfig[] = [];
    for (let n = 1; n <= MAX_CELLS; n++) {
        const kind = value[`cell_${n}`];
        const tap = value[`cell_${n}_tap_action`];
        const tapAction = isAction(tap) ? { tap_action: tap } : {};
        if (kind === 'custom') {
            const entity = value[`cell_${n}_entity`];
            if (typeof entity !== 'string' || !entity) continue;
            const cell: CustomCell = { entity };
            for (const field of ['name', 'icon'] as const) {
                const v = value[`cell_${n}_${field}`];
                if (typeof v === 'string' && v) cell[field] = v;
            }
            cells.push({ ...cell, ...tapAction });
        } else if ((CELL_KINDS as unknown[]).includes(kind)) {
            // A built-in cell stays a plain name, unless it has a tap action of its own
            cells.push(isAction(tap) ? { type: kind as CellKind, tap_action: tap } : kind as CellKind);
        }
    }
    return cells;
}

/** The form's slot fields, cells' and appliances', which the config writes as lists */
const SLOT_KEY = /^(cell|consumer)_\d(_|$)/;
const CELL_SLOT = /^cell_\d(_|$)/;
const CONSUMER_SLOT = /^consumer_\d_/;

/** What the form shows for the config: defaults filled in where YAML left them out, the cells as slots */
export function formData(config: EnergySkyCardConfig): Record<string, unknown> {
    const production = config.production_entity;
    return {
        production_max: DEFAULT_PRODUCTION_MAX,
        sun_entity: 'sun.sun',
        animate: true,
        night_hero: 'production',
        layout: 'standard',
        ...config,
        // 0.3.3's expandable: true is flow: tap
        flow: config.flow ?? (config.expandable ? 'tap' : 'none'),
        production_entity: production === undefined ? [] : Array.isArray(production) ? production : [production],
        ...cellSlots(config),
        ...consumerSlots(config),
    };
}

const isEmpty = (v: unknown): boolean =>
    v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);

/** Drop empty values (and empty blocks) so the YAML stays as short as the user wrote it */
function prune(obj: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const v = value && typeof value === 'object' && !Array.isArray(value) && !key.endsWith('_action') && key !== 'tariff_palettes'
            ? prune(value as Record<string, unknown>) : value;
        if (!isEmpty(v)) out[key] = v;
    }
    return out;
}

/**
 * The config after a form change: the form's values over the old config
 * (keys the form doesn't show, like tariff_palettes, are kept), empty
 * values dropped, and values equal to their default left out unless YAML
 * had them.
 */
export function nextConfig(previous: EnergySkyCardConfig, value: Record<string, unknown>): EnergySkyCardConfig {
    const fields = Object.fromEntries(Object.entries(value).filter(([key]) => !SLOT_KEY.test(key)));
    const merged = prune({ ...previous, ...fields }) as Record<string, unknown>;
    // One production sensor stays a plain string in YAML
    if (Array.isArray(merged.production_entity) && merged.production_entity.length === 1) merged.production_entity = merged.production_entity[0];
    // Cells: written only when they differ from what the card would pick by itself
    if (Object.keys(value).some(key => CONSUMER_SLOT.test(key))) {
        const consumers = consumersFromSlots(value);
        if (consumers.length) merged.consumers = consumers;
        else delete merged.consumers;
    }
    if (Object.keys(value).some(key => CELL_SLOT.test(key))) {
        const cells = cellsFromSlots(value);
        const auto = previous.cells === undefined && JSON.stringify(cells) === JSON.stringify(defaultCells(previous));
        if (auto) delete merged.cells;
        else merged.cells = cells;
    }
    for (const block of ['battery', 'grid'] as const) {
        const b = merged[block] as Record<string, unknown> | undefined;
        // false is the default: no need to write it
        if (b?.invert === false) delete b.invert;
        if (b && !Object.keys(b).length) delete merged[block];
    }
    const defaults: Record<string, unknown> = { production_max: DEFAULT_PRODUCTION_MAX, sun_entity: 'sun.sun', animate: true, night_hero: 'production', layout: 'standard' };
    for (const [key, def] of Object.entries(defaults)) {
        if (merged[key] === def && !(key in previous)) delete merged[key];
    }
    // No flow is written as no flow option; expandable (0.3.3) is saved as flow
    if (merged.flow === 'none') delete merged.flow;
    delete merged.expandable;
    // The flow changes the height: a fixed number of rows in the sections view would cut it
    const grid = merged.grid_options as { rows?: unknown } | undefined;
    if (merged.flow && grid && typeof grid.rows === 'number') merged.grid_options = { ...grid, rows: 'auto' };
    return { ...merged, type: previous.type } as EnergySkyCardConfig;
}

interface HaForm extends HTMLElement {
    hass?: HomeAssistant;
    data?: Record<string, unknown>;
    schema?: SchemaItem[];
    computeLabel?: (item: SchemaItem) => string;
    computeHelper?: (item: SchemaItem) => string | undefined;
}

declare global {
    interface Window {
        loadCardHelpers?: () => Promise<{ createCardElement: (config: Record<string, unknown>) => HTMLElement }>;
    }
}

/**
 * ha-form is Home Assistant's, and only defined once one of its own card
 * editors has been loaded: ask for a built-in card's editor to get it.
 */
async function loadHaForm(): Promise<void> {
    try {
        const helpers = await window.loadCardHelpers?.();
        const tile = await helpers?.createCardElement({ type: 'tile', entity: 'sun.sun' });
        await (tile?.constructor as { getConfigElement?: () => Promise<HTMLElement> | HTMLElement } | undefined)?.getConfigElement?.();
    } catch {
        // The loading line stays; YAML still works
    }
}

export class EnergySkyCardEditor extends HTMLElement {
    private config?: EnergySkyCardConfig;
    private _hass?: HomeAssistant;
    private form?: HaForm;

    setConfig(config: EnergySkyCardConfig): void {
        this.config = config;
        this.render();
    }

    set hass(hass: HomeAssistant) {
        const langChanged = cardLanguage(hass) !== cardLanguage(this._hass);
        this._hass = hass;
        if (this.form && !langChanged) this.form.hass = hass;
        else this.render();
    }

    private render(): void {
        if (!this.config) return;
        const lang = cardLanguage(this._hass);
        if (!customElements.get('ha-form')) {
            this.textContent = editorLabel(lang, 'loading');
            customElements.whenDefined('ha-form').then(() => this.render());
            void loadHaForm();
            return;
        }
        if (!this.form) {
            this.form = document.createElement('ha-form') as HaForm;
            this.form.addEventListener('value-changed', e => this.onValue(e as CustomEvent));
            this.replaceChildren(this.form);
        }
        this.form.hass = this._hass;
        const data = formData(this.config);
        this.form.schema = editorSchema(lang, data);
        this.form.computeLabel = item => editorLabel(lang, item.name);
        this.form.computeHelper = item => editorHelper(lang, item.name, this.blockOf(item));
        this.form.data = data;
    }

    /** The nested block (battery, grid) a field belongs to, from the schema */
    private blockOf(item: SchemaItem): string | undefined {
        return this.form?.schema?.find(block => block.name && block.schema?.includes(item))?.name;
    }

    private onValue(e: CustomEvent): void {
        e.stopPropagation();
        if (!this.config) return;
        const value = (e.detail?.value ?? {}) as Record<string, unknown>;
        this.config = nextConfig(this.config, value);
        if (this.form) {
            // The free-cell fields follow the slots' choices, even before an entity is picked
            const data = { ...formData(this.config), ...Object.fromEntries(Object.entries(value).filter(([key]) => SLOT_KEY.test(key))) };
            this.form.schema = editorSchema(cardLanguage(this._hass), data);
            this.form.data = data;
        }
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    }
}

if (!customElements.get(CARD_EDITOR_NAME)) customElements.define(CARD_EDITOR_NAME, EnergySkyCardEditor);
