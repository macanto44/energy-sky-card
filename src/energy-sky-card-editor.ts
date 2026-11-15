// Entry point of the editor bundle, loaded on demand by getConfigElement().
// The visual editor: Home Assistant's own ha-form with selectors, in blocks
// (Production, Battery, Grid, Tariff and sky, Actions). Tariff palettes stay
// YAML-only and pass through untouched.

import { CARD_EDITOR_NAME } from './constants';
import { cardLanguage, type Lang } from './localize';
import { DEFAULT_OUTAGE_STATES, DEFAULT_POWER_THRESHOLD, normalizeConfig } from './model';
import { DEFAULT_PRODUCTION_MAX } from './sky';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

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
        production: 'Production', battery: 'Batterie', grid: 'Réseau', tariff: 'Tarif et ciel', actions: 'Actions',
        production_entity: 'Puissance solaire (W)', production_max: 'Puissance maximale (halo)',
        daily_production_entities: 'Production du jour (kWh, additionnés)', forecast_tomorrow_entity: 'Prévision pour demain (kWh)',
        soc_entity: 'Charge (%)', power_entity: 'Puissance (W)', soc_reached_entities: 'SOC atteint',
        voltage_entity: 'Tension (V)', outage_entity: 'Alarme de coupure', outage_states: 'États de coupure',
        tariff_color_entity: 'Couleur tarifaire (Bleu / Blanc / Rouge)', sun_entity: 'Soleil',
        power_threshold: 'Seuil des flèches de la batterie', animate: 'Animations',
        tap_action: 'Appui', hold_action: 'Appui long', double_tap_action: 'Double appui',
        loading: 'Chargement de l\'éditeur…',
    },
    en: {
        production: 'Production', battery: 'Battery', grid: 'Grid', tariff: 'Tariff and sky', actions: 'Actions',
        production_entity: 'Solar power (W)', production_max: 'Maximum power (halo)',
        daily_production_entities: 'Energy today (kWh, summed)', forecast_tomorrow_entity: 'Forecast for tomorrow (kWh)',
        soc_entity: 'Charge (%)', power_entity: 'Power (W)', soc_reached_entities: 'SOC reached',
        voltage_entity: 'Voltage (V)', outage_entity: 'Outage alarm', outage_states: 'Outage states',
        tariff_color_entity: 'Tariff colour (Bleu / Blanc / Rouge)', sun_entity: 'Sun',
        power_threshold: 'Threshold for the battery arrows', animate: 'Animations',
        tap_action: 'Tap', hold_action: 'Hold', double_tap_action: 'Double tap',
        loading: 'Loading the editor…',
    },
};

export function editorLabel(lang: Lang, key: string): string {
    return LABELS[lang][key] ?? key;
}

/** The line under a field, where its label can't say it all */
const HELPERS: Record<Lang, Record<string, string>> = {
    fr: {
        soc_reached_entities: 'Entités on / off (input_boolean, binary_sensor, switch) qui passent à « on » quand la batterie a atteint la charge que vous visez, par exemple un input_boolean activé par une automatisation. Si l\'une est à « on », la case Batterie affiche « · SOC atteint » ; sinon rien.',
        power_threshold: 'En dessous de cette puissance, la batterie est considérée au repos : pas de flèche ↑ / ↓.',
    },
    en: {
        soc_reached_entities: 'On / off entities (input_boolean, binary_sensor, switch) that turn on when the battery has reached the charge you aim for, e.g. an input_boolean set by an automation. When any is on, the Battery cell reads "· SOC reached"; otherwise nothing.',
        power_threshold: 'Below this power the battery counts as idle: no ↑ / ↓ arrow.',
    },
};

export function editorHelper(lang: Lang, key: string): string | undefined {
    return HELPERS[lang][key];
}

const sensor = (extra: Record<string, unknown> = {}) => ({ entity: { domain: 'sensor', ...extra } });

export function editorSchema(lang: Lang): SchemaItem[] {
    const t = (key: string) => editorLabel(lang, key);
    return [
        {
            name: '', type: 'expandable', flatten: true, expanded: true, title: t('production'), icon: 'mdi:solar-power-variant-outline',
            schema: [
                { name: 'production_entity', required: true, selector: sensor({ device_class: 'power' }) },
                { name: 'production_max', selector: { number: { min: 100, max: 100000, step: 100, mode: 'box', unit_of_measurement: 'W' } } },
                { name: 'daily_production_entities', selector: sensor({ multiple: true }) },
                { name: 'forecast_tomorrow_entity', selector: sensor() },
            ],
        },
        {
            name: 'battery', type: 'expandable', title: t('battery'), icon: 'mdi:home-battery-outline',
            schema: [
                { name: 'soc_entity', selector: sensor() },
                { name: 'power_entity', selector: sensor() },
                { name: 'soc_reached_entities', selector: { entity: { multiple: true, domain: ['input_boolean', 'binary_sensor', 'switch'] } } },
            ],
        },
        {
            name: 'grid', type: 'expandable', title: t('grid'), icon: 'mdi:transmission-tower',
            schema: [
                { name: 'power_entity', selector: sensor() },
                { name: 'voltage_entity', selector: sensor() },
                { name: 'outage_entity', selector: { entity: {} } },
                { name: 'outage_states', selector: { select: { multiple: true, custom_value: true, options: DEFAULT_OUTAGE_STATES } } },
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('tariff'), icon: 'mdi:palette-outline',
            schema: [
                { name: 'tariff_color_entity', selector: sensor() },
                { name: 'sun_entity', selector: { entity: { domain: 'sun' } } },
                { name: 'power_threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'W' } } },
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

/** What the form shows for the config: defaults filled in where YAML left them out */
export function formData(config: EnergySkyCardConfig): Record<string, unknown> {
    return {
        production_max: DEFAULT_PRODUCTION_MAX,
        power_threshold: DEFAULT_POWER_THRESHOLD,
        sun_entity: 'sun.sun',
        animate: true,
        ...config,
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
    const merged = prune({ ...previous, ...value }) as Record<string, unknown>;
    const defaults: Record<string, unknown> = { production_max: DEFAULT_PRODUCTION_MAX, power_threshold: DEFAULT_POWER_THRESHOLD, sun_entity: 'sun.sun', animate: true };
    for (const [key, def] of Object.entries(defaults)) {
        if (merged[key] === def && !(key in previous)) delete merged[key];
    }
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
        // An old option name (battery.lock_entities) is shown, and saved, under today's
        this.config = normalizeConfig(config);
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
        this.form.schema = editorSchema(lang);
        this.form.computeLabel = item => editorLabel(lang, item.name);
        this.form.computeHelper = item => editorHelper(lang, item.name);
        this.form.data = formData(this.config);
    }

    private onValue(e: CustomEvent): void {
        e.stopPropagation();
        if (!this.config) return;
        this.config = nextConfig(this.config, (e.detail?.value ?? {}) as Record<string, unknown>);
        if (this.form) this.form.data = formData(this.config);
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    }
}

if (!customElements.get(CARD_EDITOR_NAME)) customElements.define(CARD_EDITOR_NAME, EnergySkyCardEditor);
