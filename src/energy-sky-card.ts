// Energy Sky Card — the card element: a plain HTMLElement with a shadow root.

import { CARD_NAME, CARD_EDITOR_NAME, CARD_DISPLAY_NAME, CARD_DESCRIPTION, CARD_DOC_URL, CARD_VERSION } from './constants';
import { loadEditorBundle } from './bundles';
import { CARD_CSS, FLOW_COLOUR_VARS } from './styles/card';
import { CELL_KINDS, CUSTOM_CELL_ICON, MAX_CELLS, METRIC_ICONS, batteryCapacity, estimateAverageMs, batteryPower, batteryPowerEntities, buildView, cellEntity, configuredCells, metricForm, productionEntities, staleReadings, trackedEntities, type CardView, type MetricKey, type ViewOptions } from './model';
import { cardLanguage, localize, numberLocale } from './localize';
import { formatPercent } from './format';
import { CLOUDS, SUN_CLEARANCE, WEATHER, computeBackground, floorRgb, isHexColor, type Background } from './sky';
import { celestial, moonMarkup, type Celestial } from './celestial';
import { weatherMarkup } from './weather';
import { coveredBy, starsMarkup, type Box } from './stars';
import { MotionController } from './motion';
import { Smoother, pastReadings, smoothedEntities } from './smoothing';
import { energyPrefs, stubConfig } from './stub';
import { canComputeSelfSufficiency, dayTotals, energyMeters, meterIds, nextRefreshIn, selfSufficiency, todaysChanges, type EnergyMeters } from './selfsufficiency';
import { isAction, listenForGestures, readActions, updateTargetSemantics, type ActionConfig, type ActionsConfig } from './actions';
import { FLOW_HEIGHT, MAX_CONSUMERS, WIRES, WIRE_KEYS, energyView, flowGeometry, flowNodeEntity, flowView, type DayEnergy, type NodeKey, type WireKey } from './flow';
import type { EnergySkyCardConfig, FlowUnit, HomeAssistant } from './types';

/** The hero's sizes, largest first: it steps down until the card's lines fit */
export const HERO_SIZES = [56, 48, 40] as const;
/** The side layout's hero sizes (2 rows: a smaller hero beside the cells) */
export const SIDE_HERO_SIZES = [44, 40, 36] as const;
/** How far the cells' text may shorten (metricForm): to the tight form in standard; side may drop the complements */
const FORM_LEVELS = [0, 1, 2];
const SIDE_FORM_LEVELS = [0, 1, 2, 3];
/** The flow's nodes and their icons (the battery shows its charge instead, when known) */
const NODES: [NodeKey, string][] = [['solar', METRIC_ICONS.tomorrow], ['grid', METRIC_ICONS.grid], ['battery', METRIC_ICONS.battery], ['home', METRIC_ICONS.consumption]];
/** A ring's circumference: r = 17 in a 40 × 40 box */
const RING = 2 * Math.PI * 17;

/** Where a tap on the self-sufficiency cell goes by default */
const ENERGY_DASHBOARD_TAP: ActionConfig = { action: 'navigate', navigation_path: '/energy' };

/** A config error, in the page's language (French or English) */
function configError(fr: string, en: string): Error {
    const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
    return new Error(lang.startsWith('fr') ? fr : en);
}

const isStringList = (v: unknown): boolean => v === undefined || (Array.isArray(v) && v.every(x => typeof x === 'string'));

/** An option's value by its dotted name, "battery.invert" */
const optionAt = (c: object, name: string): unknown => name.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], c);
/** "a, b ou c" */
const oneOf = (values: string[], or: string) => `${values.slice(0, -1).join(', ')} ${or} ${values[values.length - 1]}`;

/** The options checked by kind: one of a few values, true / false, a list of strings, a positive number */
const CHOICES: [string, string[]][] = [
    ['night_hero', ['production', 'consumption', 'battery']],
    ['layout', ['standard', 'side']],
    ['flow', ['tap', 'always']],
    ['flow_unit', ['power', 'energy']],
    ['background', ['tempo', 'solid', 'weather']],
    ['battery.estimate.charge', ['time', 'duration', 'off']],
    ['battery.estimate.discharge', ['duration', 'time', 'off']],
    ['battery.estimate.with_temperature', ['replace', 'both']],
];
/** Older option names, no longer read, and what replaces them */
const RENAMED: [string, { fr: string; en: string }][] = [
    ['power_threshold', { fr: 'utilisez battery.power_threshold', en: 'use battery.power_threshold' }],
    ['battery.lock_entities', { fr: 'utilisez battery.soc_reached_entities', en: 'use battery.soc_reached_entities' }],
    ['cell_tap', { fr: 'chaque case prend son propre tap_action', en: 'each cell takes its own tap_action' }],
];
/** flow_colors' keys, and the CSS variable each sets */
const FLOW_COLOR_KEYS: Record<string, string> = {
    solar: FLOW_COLOUR_VARS.sun, grid: FLOW_COLOUR_VARS.grid, battery: FLOW_COLOUR_VARS.batt, consumption: FLOW_COLOUR_VARS.use,
};
/** One entity id, or a list of them */
const isEntityOption = (v: unknown): boolean => v === undefined || (typeof v === 'string' && v.length > 0)
    || (Array.isArray(v) && v.length > 0 && v.every(x => typeof x === 'string' && x.length > 0));
const isPositive = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v) && v > 0;
/** One power sensor, or the two that replace it: never both */
const SPLIT: [string, string, string[]][] = [
    ['grid', 'power_entity', ['import_entity', 'export_entity']],
    ['battery', 'power_entity', ['charge_entity', 'discharge_entity']],
];
const KINDS: [string[], (v: unknown) => boolean, string, string][] = [
    [['battery.soc_entity', 'battery.power_entity', 'battery.charge_entity', 'battery.discharge_entity', 'grid.import_entity', 'grid.export_entity'], isEntityOption, 'doit être une entité ou une liste d\'entités', 'must be an entity or a list of entities'],
    [['battery.capacity'], v => v === undefined || isPositive(v) || (Array.isArray(v) && v.length > 0 && v.every(isPositive)), 'doit être un nombre positif (kWh) ou une liste', 'must be a positive number (kWh) or a list of them'],
    [['battery.estimate.average'], v => v === undefined || (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1440), 'doit être un nombre de minutes (0 à 1440)', 'must be a number of minutes (0 to 1440)'],
    [['battery.max_soc', 'battery.reserve_soc'], v => v === undefined || (typeof v === 'number' && v >= 0 && v <= 100), 'doit être un pourcentage (0 à 100)', 'must be a percentage (0 to 100)'],
    [['battery.estimate'], v => v === undefined || (!!v && typeof v === 'object' && !Array.isArray(v)), 'doit regrouper charge, discharge, with_temperature, flow, average', 'must hold charge, discharge, with_temperature, flow, average'],
    [['battery.invert', 'grid.invert', 'expandable', 'animate', 'battery.estimate.flow'], v => v === undefined || typeof v === 'boolean', 'doit valoir true ou false', 'must be true or false'],
    [['daily_production_entities', 'battery.soc_reached_entities', 'grid.outage_states'], isStringList, 'doit être une liste', 'must be a list'],
    [['production_max', 'production_threshold', 'smoothing', 'battery.power_threshold', 'consumer_threshold', 'stale_after'], v => v === undefined || (typeof v === 'number' && Number.isFinite(v) && v >= 0), 'doit être un nombre positif', 'must be a positive number'],
];

export function validateConfig(config: unknown): EnergySkyCardConfig {
    if (!config || typeof config !== 'object') {
        throw configError('Configuration invalide', 'Invalid configuration');
    }
    const c = config as Partial<EnergySkyCardConfig>;
    for (const [old, now] of RENAMED) {
        if (optionAt(c, old) !== undefined) throw configError(`${old} n'existe plus : ${now.fr}`, `${old} is gone: ${now.en}`);
    }
    const production = c.production_entity;
    const productionOk = typeof production === 'string'
        ? production.length > 0
        : Array.isArray(production) && production.length > 0 && production.every(id => typeof id === 'string' && id.length > 0);
    if (!productionOk) {
        throw configError('production_entity est obligatoire (une entité ou une liste)', 'production_entity is required (one entity or a list)');
    }
    for (const [name, values] of CHOICES) {
        const v = optionAt(c, name);
        if (v !== undefined && !values.includes(v as string)) throw configError(`${name} : ${oneOf(values, 'ou')}`, `${name}: ${oneOf(values, 'or')}`);
    }
    for (const [names, ok, fr, en] of KINDS) {
        for (const name of names) if (!ok(optionAt(c, name))) throw configError(`${name} ${fr}`, `${name} ${en}`);
    }
    for (const [block, single, pair] of SPLIT) {
        if (optionAt(c, `${block}.${single}`) !== undefined && pair.some(name => optionAt(c, `${block}.${name}`) !== undefined)) {
            throw configError(`${block} : ${single} ou ${pair.join(' / ')}, pas les deux`, `${block}: ${single} or ${pair.join(' / ')}, not both`);
        }
    }
    if (c.cells !== undefined) {
        if (!Array.isArray(c.cells) || c.cells.length > MAX_CELLS) {
            throw configError(`cells : une liste de ${MAX_CELLS} cases au plus`, `cells: a list of at most ${MAX_CELLS} cells`);
        }
        for (const cell of c.cells as unknown[]) {
            const o = (cell && typeof cell === 'object' ? cell : {}) as { entity?: unknown; type?: unknown; tap_action?: unknown };
            const ok = typeof cell === 'string'
                ? (CELL_KINDS as string[]).includes(cell)
                : (typeof o.entity === 'string' && !!o.entity) || (CELL_KINDS as unknown[]).includes(o.type);
            if (!ok) {
                const shown = String(typeof cell === 'object' ? JSON.stringify(cell) : cell);
                throw configError(`cells : « ${shown} » n'est ni ${CELL_KINDS.join(', ')}, ni { type: … }, ni { entity: … }`,
                    `cells: "${shown}" is neither ${CELL_KINDS.join(', ')}, { type: … } nor { entity: … }`);
            }
            if (o.tap_action !== undefined && !isAction(o.tap_action)) {
                throw configError('cells : tap_action doit avoir une action (more-info, navigate, url…)', 'cells: tap_action needs an action (more-info, navigate, url…)');
            }
        }
    }
    if (c.consumers !== undefined) {
        if (!Array.isArray(c.consumers) || c.consumers.length > MAX_CONSUMERS) {
            throw configError(`consumers : une liste de ${MAX_CONSUMERS} appareils au plus`, `consumers: a list of at most ${MAX_CONSUMERS} appliances`);
        }
        for (const consumer of c.consumers as unknown[]) {
            const o = (consumer && typeof consumer === 'object' ? consumer : {}) as { entity?: unknown; tap_action?: unknown; soc_entity?: unknown; energy_entity?: unknown; always_show?: unknown };
            if (typeof o.entity !== 'string' || !o.entity) throw configError('consumers : chaque appareil a une entity', 'consumers: each appliance needs an entity');
            if (o.tap_action !== undefined && !isAction(o.tap_action)) {
                throw configError('consumers : tap_action doit avoir une action (more-info, navigate, url…)', 'consumers: tap_action needs an action (more-info, navigate, url…)');
            }
            if (o.soc_entity !== undefined && (typeof o.soc_entity !== 'string' || !o.soc_entity)) throw configError('consumers : soc_entity doit être une entité', 'consumers: soc_entity must be an entity');
            if (o.energy_entity !== undefined && (typeof o.energy_entity !== 'string' || !o.energy_entity)) throw configError('consumers : energy_entity doit être une entité', 'consumers: energy_entity must be an entity');
            if (o.always_show !== undefined && typeof o.always_show !== 'boolean') throw configError('consumers : always_show doit valoir true ou false', 'consumers: always_show must be true or false');
        }
    }
    if (c.background === 'weather' && (typeof c.weather_entity !== 'string' || !c.weather_entity)) {
        throw configError('background: weather demande une weather_entity', 'background: weather needs a weather_entity');
    }
    if (c.background_color !== undefined && !isHexColor(c.background_color)) {
        throw configError('background_color : une couleur hexadécimale (#rrggbb)', 'background_color: a hex colour (#rrggbb)');
    }
    if (c.flow_colors !== undefined) {
        const colours = c.flow_colors as unknown;
        if (!colours || typeof colours !== 'object' || Array.isArray(colours)) {
            throw configError('flow_colors : solar, grid, battery et consumption, chacun une couleur', 'flow_colors: solar, grid, battery and consumption, each a colour');
        }
        for (const [name, colour] of Object.entries(colours)) {
            if (!(name in FLOW_COLOR_KEYS) || typeof colour !== 'string' || !colour) {
                throw configError(`flow_colors.${name} : solar, grid, battery ou consumption, une couleur CSS`, `flow_colors.${name}: solar, grid, battery or consumption, a CSS colour`);
            }
        }
    }
    if (c.tariff_palettes !== undefined) {
        const palettes = c.tariff_palettes as unknown;
        if (!palettes || typeof palettes !== 'object' || Array.isArray(palettes)) {
            throw configError('tariff_palettes doit associer chaque couleur tarifaire à 3 couleurs', 'tariff_palettes must map each tariff to 3 colours');
        }
        for (const [name, colours] of Object.entries(palettes)) {
            if (!Array.isArray(colours) || colours.length !== 3 || !colours.every(isHexColor)) {
                throw configError(`tariff_palettes.${name} : 3 couleurs hexadécimales attendues (#rrggbb)`, `tariff_palettes.${name}: expected 3 hex colours (#rrggbb)`);
            }
        }
    }
    // 0.3.3's expandable: true is flow: tap
    return (c.expandable === true && c.flow === undefined ? { ...c, flow: 'tap' } : c) as EnergySkyCardConfig;
}

/** A node of the flow: its pill, texts and ring segments */
interface FlowNodeRefs { el: HTMLElement; label: HTMLElement; value: HTMLElement; sub: HTMLElement; centre: HTMLElement; segs: SVGCircleElement[]; subTexts?: [string, string]; valueTexts?: [string, string] }

/** The sun's twelve rays (shown: six, or all twelve at high production): their angle, length (every other one shorter), shimmer */
const RAYS = Array.from({ length: 12 }, (_, i) => {
    const angle = i < 6 ? i * 30 : (i - 6) * 30 + 15;
    return `<b style="--a:${angle}deg;--l:${i % 2 ? 0.62 : 1};--s:${(2.6 + (i * 0.7) % 2.3).toFixed(1)}s;--d:-${(i * 0.9).toFixed(1)}s"></b>`;
}).join('');
/** The weathers a rainbow can follow */
const RAINY = new Set(['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy']);
/** m/s per unit of the weather entity's wind_speed_unit */
const WIND_UNITS: Record<string, number> = { 'km/h': 1 / 3.6, 'm/s': 1, mph: 0.447, kn: 0.514, 'ft/s': 0.305 };

/**
 * How far (px) a raindrop drifts sideways on its way down: the wind's speed
 * across the view (east on the left in the north, on the right in the
 * south; wind_bearing is where it comes from), a slight slant in still air
 */
export function windAcross(attributes: Record<string, unknown> | undefined, latitude: number | undefined): number {
    const speed = Number(attributes?.wind_speed), bearing = Number(attributes?.wind_bearing);
    if (!Number.isFinite(speed) || !Number.isFinite(bearing)) return -70;
    const ms = speed * (WIND_UNITS[String(attributes?.wind_speed_unit ?? 'km/h')] ?? 1 / 3.6);
    const across = Math.sin(bearing * Math.PI / 180) * ms * 9 * ((latitude ?? 45) >= 0 ? 1 : -1);
    const dx = Math.round(Math.max(-170, Math.min(170, across)));
    return Math.abs(dx) < 12 ? -12 : dx;
}

/** The elements updated in place on every change */
interface Refs {
    card: HTMLElement;
    heroValue: HTMLElement;
    heroUnit: HTMLElement;
    context: HTMLElement;
    contextText: HTMLElement;
    /** The energy flow (flow: tap or always) */
    flow?: {
        panel: HTMLElement;
        box: HTMLElement;
        svg: SVGSVGElement;
        keyframes: HTMLStyleElement;
        wires: Map<WireKey, { g: SVGGElement; paths: SVGPathElement[] }>;
        nodes: Map<NodeKey, FlowNodeRefs>;
        /** The appliances, in the config's order, with their wire */
        consumers: (FlowNodeRefs & { icon: HTMLElement; wire: SVGGElement; paths: SVGPathElement[] })[];
        /** The kW | kWh switch */
        unit: HTMLElement;
        unitButtons: HTMLButtonElement[];
    };
    metrics: Map<MetricKey, { el: HTMLElement; icon: HTMLElement; label: HTMLElement; value: HTMLElement; extra: HTMLElement; entity?: string }>;
}

export class EnergySkyCard extends HTMLElement {
    private config?: EnergySkyCardConfig;
    private _hass?: HomeAssistant;
    private root: ShadowRoot;
    private refs?: Refs;
    /** last_updated of every tracked entity at the last render, plus the language */
    private renderedKey = '';
    private motion = new MotionController(this);
    private actions: ActionsConfig = {};
    /** The cells a tap answers on their own: their entity, and their own tap action if they have one */
    private cellTargets = new Map<string, { entity?: string; tap?: ActionConfig }>();
    private resizeObserver?: ResizeObserver;
    private readyFrame?: number;
    /** Checks every minute for readings gone quiet (time passes without a hass update) */
    private staleTimer?: ReturnType<typeof setInterval>;
    /** smoothing: the powers' averages, the entities averaged, and a tick while connected so the average moves on between readings */
    private smoother?: Smoother;
    /** The battery estimate's moving average of the battery power (estimate.average, 5 min by default), with a capacity; none for the instant reading */
    private estimateSmoother?: Smoother;
    private estimateIds: string[] = [];
    /** Its window filled from Home Assistant's history: the read on its way (a newer config or a disconnect drops its answer), and whether it came */
    private historyRead?: object;
    private historyDone = false;
    /** What the last view was worked out with beside hass: the estimate's battery power and the time */
    private viewOptions: ViewOptions = {};
    /** Today's self-sufficiency (%), read every 5 minutes while a cell shows it */
    private selfSufficiency?: number;
    /** What the flow shows: the powers, or today's energies (flow_unit, then the switch) */
    private unit: FlowUnit = 'power';
    /** Today's energies for the flow in kWh, read every 5 minutes while it shows them */
    private day?: DayEnergy;
    /** The Energy dashboard's meters, once read (the kWh switch shows when there are some) */
    private meters?: EnergyMeters;
    private dayTimer?: ReturnType<typeof setTimeout>;
    /** The read on its way, if any: a newer config or a disconnect drops its answer */
    private dayRead?: object;
    private smoothIds: string[] = [];
    private smoothTimer?: ReturnType<typeof setInterval>;
    /** The hass the card shows: smoothed powers with smoothing, else hass itself */
    private shown?: HomeAssistant;
    /** Unfolded: the flow shows under the card (always with flow: always) */
    private open = false;
    /** The width the flow's geometry was last drawn for */
    private flowWidth = 0;
    /** The weather drawn in the sky (its WEATHER key), redrawn only when the condition changes */
    private weatherDrawn = '';
    /** The sky at the last paint (the sun, the moon, the twilight), the moon's phase drawn, the rainbow's end (ms) and the weather seen before */
    private heavens?: Celestial;
    private moonDrawn = '';
    private rainbowUntil = 0;
    private lastWeather = '';
    /** The appliances in the flow (above their threshold), by index: the corners hold these only */
    private shownConsumers: number[] = [];
    /** The last view, its text in full (the fit writes a shorter form when needed) */
    private view?: CardView;
    /** The text that decides the layout, at the last fit */
    private fitted = '';
    /** How short the cells' text is (metricForm), and whether the context line is in its short form */
    private form = 0;
    private shortContext = false;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }

    setConfig(config: EnergySkyCardConfig): void {
        this.config = validateConfig(config);
        this.build();
        this.open = false;
        this.removeAttribute('data-expanded');
        if (this.config.flow === 'always') this.expanded = true;
        this.renderedKey = '';
        this.removeAttribute('data-ready');
        this.motion.setAnimate(this.config.animate !== false);
        const smoothing = this.config.smoothing ?? 0;
        this.smoother = smoothing > 0 ? new Smoother(smoothing * 1000) : undefined;
        this.smoothIds = this.smoother ? smoothedEntities(this.config) : [];
        // The estimate reads the battery power's moving average over estimate.average minutes (0: the instant reading)
        const estimating = !!batteryCapacity(this.config);
        const averageMs = estimateAverageMs(this.config);
        this.estimateSmoother = estimating && averageMs > 0 ? new Smoother(averageMs) : undefined;
        this.estimateIds = estimating ? batteryPowerEntities(this.config) : [];
        this.historyRead = undefined;
        this.historyDone = false;
        this.viewOptions = {};
        // Today's self-sufficiency and energies: read again for this config
        this.selfSufficiency = undefined;
        this.unit = this.config.flow_unit ?? 'power';
        this.day = undefined;
        this.meters = undefined;
        clearTimeout(this.dayTimer);
        this.dayTimer = undefined;
        this.dayRead = undefined;
        this.syncSmoothTimer();
        if (this._hass) this.update();
        this.startDay();
        this.startEstimateHistory();
    }

    /** One tick a second while connected and smoothing */
    private syncSmoothTimer(): void {
        const want = !!this.smoother && this.isConnected;
        if (want && !this.smoothTimer) this.smoothTimer = setInterval(() => this.update(), 1000);
        if (!want && this.smoothTimer) {
            clearInterval(this.smoothTimer);
            this.smoothTimer = undefined;
        }
    }

    connectedCallback(): void {
        this.motion.start();
        // Every minute: readings gone quiet, and the sun and the moon moving on
        this.staleTimer ??= setInterval(() => {
            this.markStale();
            if (this.refs && this._hass) this.paintSky();
        }, 60_000);
        this.syncSmoothTimer();
        this.startDay();
        this.startEstimateHistory();
        if (this.refs && this.resizeObserver) this.resizeObserver.observe(this.refs.card);
        this.fit();
        // Text measured before the fonts load is narrower or wider than it will be
        document.fonts?.ready?.then(() => this.fit());
    }

    disconnectedCallback(): void {
        this.motion.stop();
        clearInterval(this.staleTimer);
        this.staleTimer = undefined;
        this.syncSmoothTimer();
        clearTimeout(this.dayTimer);
        this.dayTimer = undefined;
        this.dayRead = undefined;
        // Back on the page, the readings missed meanwhile come from the history again
        this.historyRead = undefined;
        this.historyDone = false;
        this.resizeObserver?.disconnect();
        if (this.readyFrame !== undefined) cancelAnimationFrame(this.readyFrame);
        this.readyFrame = undefined;
    }

    /** Whether the energy flow shows: unfolded with flow: tap, always with flow: always */
    get expanded(): boolean {
        return this.open;
    }

    set expanded(open: boolean) {
        const flow = this.config?.flow;
        const next = flow === 'always' || (open && flow === 'tap');
        if (next === this.open && this.hasAttribute('data-expanded') === next) return;
        this.open = next;
        this.toggleAttribute('data-expanded', next);
        if (this.refs?.flow) this.refs.flow.panel.hidden = !next;
        if (flow === 'tap') this.refs?.heroValue.parentElement?.setAttribute('aria-expanded', String(next));
        this.fit();
        // Unfolded on kWh: today's energies, unless a read is planned
        this.startDay();
    }

    /** The side layout: the cells listed on the hero's right */
    private get side(): boolean {
        return this.config?.layout === 'side';
    }

    /** Animations: "on", "paused" (hidden or off-screen) or "off" */
    get motionState() {
        return this.motion.state;
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.update();
        this.startDay();
        this.startEstimateHistory();
    }

    /** Fills the estimate's average with the battery power's past readings, once per config and connection */
    private startEstimateHistory(): void {
        if (!this.estimateSmoother || !this._hass || !this.isConnected || this.historyRead || this.historyDone) return;
        void this.readEstimateHistory();
    }

    private async readEstimateHistory(): Promise<void> {
        const hass = this._hass!;
        const smoother = this.estimateSmoother!;
        const read = {};
        this.historyRead = read;
        const past = await pastReadings(hass, this.estimateIds, estimateAverageMs(this.config!), Date.now());
        if (this.historyRead !== read) return;
        this.historyRead = undefined;
        this.historyDone = true;
        const now = Date.now();
        for (const id of this.estimateIds) {
            const readings = past[id];
            if (readings?.length) smoother.seed(id, readings, this._hass?.states[id]?.attributes.unit_of_measurement, now);
        }
        this.renderedKey = '';
        this.update();
    }

    /** Whether a cell shows today's self-sufficiency */
    private get showsSelfSufficiency(): boolean {
        return !!this.config && configuredCells(this.config).some(cell => cell.kind === 'self_sufficiency');
    }

    /** The flow shows today's energies: kWh chosen, and the Energy dashboard has meters (or isn't read yet) */
    private get showsEnergy(): boolean {
        return !!this.config?.flow && this.unit === 'energy' && (this.meters === undefined || meterIds(this.meters).length > 0);
    }

    /** The day's figures are needed: a cell shows the self-sufficiency, or the unfolded flow its energies */
    private get needsDay(): boolean {
        return this.showsSelfSufficiency || (this.showsEnergy && this.open);
    }

    /** Reads the day's figures now (or, with a flow, the meters once, for its switch), unless a read is on its way or planned */
    private startDay(): void {
        const wanted = this.needsDay || (!!this.config?.flow && this.meters === undefined);
        if (!wanted || !this.isConnected || !this._hass || this.dayRead || this.dayTimer) return;
        void this.readDay();
    }

    /**
     * The Energy dashboard's meters and their changes since midnight (and
     * the appliances' energy_entity), from Home Assistant (never the
     * internet): today's self-sufficiency and the flow's energies. Again in
     * 5 minutes, or just after midnight when that comes first, while needed.
     */
    private async readDay(): Promise<void> {
        const hass = this._hass;
        const config = this.config;
        if (!hass || !config) return;
        const read = {};
        this.dayRead = read;
        let meters: EnergyMeters | undefined;
        let value: number | undefined;
        let day: DayEnergy | undefined;
        const needed = this.needsDay;
        try {
            meters = energyMeters(await energyPrefs(hass));
            if (needed) {
                const own = (config.consumers ?? []).map(c => c.energy_entity);
                const ids = [...new Set([...meterIds(meters), ...own.filter((id): id is string => !!id)])];
                const changes = await todaysChanges(hass, ids);
                if (this.showsSelfSufficiency) value = canComputeSelfSufficiency(meters) ? selfSufficiency(meters, changes) : undefined;
                day = { totals: dayTotals(meters, changes), consumers: own.map(id => id ? changes[id] : undefined) };
            }
        } catch {
            value = undefined;
        }
        // A new config or a disconnect since: this answer is no one's
        if (this.dayRead !== read) return;
        this.dayRead = undefined;
        this.meters = meters ?? this.meters ?? energyMeters(undefined);
        if (needed) {
            this.selfSufficiency = value;
            this.day = day;
        }
        this.renderedKey = '';
        this.update();
        if (this.isConnected && this.needsDay) this.dayTimer = setTimeout(() => {
            this.dayTimer = undefined;
            this.startDay();
        }, needed ? nextRefreshIn(new Date()) : 0);
    }

    /** The kW | kWh switch: the flow shows the powers, or today's energies (read now if need be) */
    setFlowUnit(unit: FlowUnit): void {
        if (unit === this.unit) return;
        this.unit = unit;
        this.renderedKey = '';
        this.update();
        // Today's energies: read now, unless a read is planned (they came in less than 5 minutes ago)
        this.startDay();
    }

    get hass(): HomeAssistant | undefined {
        return this._hass;
    }

    /**
     * The DOM, built once per config. Only static strings go into the
     * markup (the metric keys and icons are constants); entity data is
     * written later with textContent.
     */
    private build(): void {
        const config = this.config!;
        const cells = configuredCells(config);
        if (this.side) this.setAttribute('data-layout', 'side');
        else this.removeAttribute('data-layout');
        setAttr(this, 'data-flow', config.flow ?? null);
        // flow_colors: this card's, over the theme's and the defaults
        for (const [key, variable] of Object.entries(FLOW_COLOR_KEYS)) {
            const colour = config.flow_colors?.[key as keyof NonNullable<EnergySkyCardConfig['flow_colors']>];
            if (colour) this.style.setProperty(variable, colour);
            else this.style.removeProperty(variable);
        }
        this.flowWidth = 0;
        this.weatherDrawn = '';
        this.shownConsumers = [];
        this.fitted = '';
        this.root.innerHTML = `
            <style>${CARD_CSS}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer night">${starsMarkup()}</div>
                    <div class="layer day"><div class="halo"></div>${cloudsMarkup()}</div>
                    <div class="tint"></div>
                    <div class="moonlight"></div><div class="moon"></div>
                    <div class="sun"><i class="glow"></i><i class="bloom"></i><i class="rays">${RAYS}</i><i class="core"></i></div>
                    ${config.background === 'weather' ? '<div class="rainbow"></div><div class="wx"></div>' : ''}
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-text"></span></div>
                    <div class="grid">${cells.map(cell => `
                        <div class="metric" data-metric="${cell.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join('')}</div>
                </div>
                ${config.flow ? `<div class="floor" aria-hidden="true"></div>${flowMarkup(config.consumers?.length ?? 0)}` : ''}
            </ha-card>`;
        const q = (sel: string, parent: ParentNode = this.root) => find(parent, sel);
        this.refs = {
            card: q('ha-card'),
            flow: config.flow ? this.flowRefs() : undefined,
            heroValue: q('.hero-value'),
            heroUnit: q('.hero-unit'),
            context: q('.context'),
            contextText: q('.context-text'),
            metrics: new Map(cells.map(cell => {
                const el = q(`[data-metric="${cell.key}"]`);
                const icon = q('ha-icon', el);
                // Set as an attribute, never in markup: a free cell's icon comes from the config
                icon.setAttribute('icon', cell.kind === 'custom' ? cell.custom!.icon || CUSTOM_CELL_ICON : METRIC_ICONS[cell.kind]);
                return [cell.key, { el, icon, label: q('.label-text', el), value: q('.value-main', el), extra: q('.extra', el), entity: cellEntity(config, cell) }];
            })),
        };
        this.actions = readActions(config, productionEntities(config)[0]);
        // A cell without a tap action of its own opens its entity, unless the card has a tap action
        const opensEntity = config.tap_action === undefined;
        this.cellTargets = new Map(cells.flatMap((cell): [string, { entity?: string; tap?: ActionConfig }][] => {
            const entity = cellEntity(config, cell);
            // Today's self-sufficiency has no entity: it opens the Energy dashboard
            const tap = isAction(cell.tapAction) ? cell.tapAction
                : cell.kind === 'self_sufficiency' && opensEntity ? ENERGY_DASHBOARD_TAP : undefined;
            if (tap) return [[cell.key, { entity, tap }]];
            return opensEntity && entity ? [[cell.key, { entity }]] : [];
        }));
        // flow: tap: the big number, its line and the unfolded panel fold and unfold
        if (config.flow === 'tap') {
            const hero = this.refs.heroValue.parentElement as HTMLElement;
            for (const el of [hero, this.refs.context, this.refs.flow!.panel]) {
                el.dataset.cellTarget = '';
                el.dataset.targetKey = 'toggle';
            }
            hero.setAttribute('role', 'button');
            hero.tabIndex = 0;
            hero.setAttribute('aria-controls', 'esc-flow');
            hero.setAttribute('aria-expanded', 'false');
        }
        if (config.flow) {
            for (const [key] of NODES) {
                const entity = flowNodeEntity(config, key);
                if (!entity) continue;
                this.cellTargets.set(`node:${key}`, { entity });
                const el = this.refs.flow!.nodes.get(key)!.el;
                el.dataset.cellTarget = '';
                el.setAttribute('role', 'button');
                el.tabIndex = 0;
            }
            // An appliance opens its entity, or runs its own tap action
            (config.consumers ?? []).forEach((consumer, i) => {
                const tap = isAction(consumer.tap_action) ? consumer.tap_action : undefined;
                this.cellTargets.set(`consumer:${i}`, { entity: consumer.entity, tap });
                const el = this.refs!.flow!.consumers[i].el;
                el.dataset.cellTarget = '';
                if (tap?.action === 'none') return;
                el.setAttribute('role', 'button');
                el.tabIndex = 0;
            });
        }
        for (const [key, target] of this.cellTargets) {
            if (key.includes(':')) continue;
            const el = q(`[data-metric="${key}"]`);
            el.dataset.cellTarget = '';
            if (target.tap?.action === 'none') continue;
            el.setAttribute('role', 'button');
            el.tabIndex = 0;
            el.style.cursor = 'pointer';
        }
        listenForGestures(this.refs.card, this, path => this.actionsFor(path));
        updateTargetSemantics(this.refs.card, this.actions);
        this.resizeObserver?.disconnect();
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => this.fit());
            this.resizeObserver.observe(this.refs.card);
        }
    }

    /**
     * The card's actions, or, pressed on a cell, that cell's: its own tap
     * action, else its entity's dialog. Hold and double tap stay the card's,
     * on the cell's entity.
     */
    private actionsFor(path: EventTarget[]): ActionsConfig {
        const cell = path.find((t): t is HTMLElement => t instanceof HTMLElement && t.dataset.cellTarget !== undefined);
        // The big number, its line and the unfolded panel fold and unfold; hold and double tap stay the card's
        if (cell?.dataset.targetKey === 'toggle') return { ...this.actions, toggle: () => { this.expanded = !this.open; } };
        // The kW | kWh switch: its own tap, no hold or double tap
        if (cell?.dataset.targetKey === 'unit') {
            const unit = cell.dataset.unit as FlowUnit;
            return { toggle: () => this.setFlowUnit(unit) };
        }
        const key = cell?.dataset.node ? `node:${cell.dataset.node}` : cell?.dataset.consumer ? `consumer:${cell.dataset.consumer}` : cell?.dataset.metric ?? '';
        const target = cell ? this.cellTargets.get(key) : undefined;
        if (!target) return this.actions;
        const { tap_action: _cardTap, ...rest } = this.actions;
        return { ...rest, entity: target.entity ?? this.actions.entity, ...(target.tap ? { tap_action: target.tap } : {}) };
    }

    /** Lay the card out for its size and text, then the flow, then clear the stars off the text */
    fit(): void {
        this.fitLayout();
        this.layoutFlow();
        this.placeSky();
        for (const node of this.refs?.flow?.nodes.values() ?? []) {
            this.fitValue(node);
            this.fitSub(node);
        }
        for (const node of this.refs?.flow?.consumers ?? []) this.fitValue(node);
        this.clearText();
    }

    /**
     * A node's small line: its sentence where it fits, else its short form
     * (« Vide dans 2 h 50 », « → 0 % 2 h 50 »), then both a size smaller
     * (data-tight); failing all, the narrower one, small, with an ellipsis.
     */
    private fitSub(node: FlowNodeRefs): void {
        const [full, short] = node.subTexts ?? ['', ''];
        // Strict: one pixel over already draws the ellipsis
        const overflows = () => node.sub.scrollWidth > node.sub.clientWidth;
        let narrowest: [number, string] | undefined;
        for (const tight of [false, true]) {
            node.sub.toggleAttribute('data-tight', tight);
            for (const text of full === short ? [full] : [full, short]) {
                setText(node.sub, text);
                if (!overflows()) return;
                if (!narrowest || node.sub.scrollWidth < narrowest[0]) narrowest = [node.sub.scrollWidth, text];
            }
        }
        setText(node.sub, narrowest?.[1] ?? full);
    }

    /**
     * A node's value: in full where it fits, else its short form (« 19 kWh »,
     * narrow spaces), then that a size smaller (data-tight); in kWh, as a
     * last resort, the figures alone (the switch says kWh).
     */
    private fitValue(node: FlowNodeRefs): void {
        const [full, short] = node.valueTexts ?? ['', ''];
        const bare = short.replace(/\u202FkWh$/, '');
        const overflows = () => node.value.scrollWidth > node.value.clientWidth;
        node.value.toggleAttribute('data-tight', false);
        setText(node.value, full);
        if (full === short || !overflows()) return;
        setText(node.value, short);
        if (!overflows()) return;
        node.value.toggleAttribute('data-tight', true);
        if (!overflows() || bare === short) return;
        setText(node.value, bare);
    }

    /** The kW | kWh switch: shown when the Energy dashboard has meters; the pressed button */
    private paintUnit(): void {
        const flow = this.refs?.flow;
        if (!flow) return;
        const available = !!this.meters && meterIds(this.meters).length > 0;
        if (flow.unit.hidden === available) flow.unit.hidden = !available;
        const shown = this.showsEnergy ? 'energy' : 'power';
        for (const button of flow.unitButtons) setAttr(button, 'aria-pressed', String(button.dataset.unit === shown));
    }

    /** The flow's wires and comets, for the panel's width (redrawn only when it changes) */
    private layoutFlow(): void {
        const flow = this.refs?.flow;
        if (!flow || flow.panel.hidden) return;
        const width = Math.round(flow.box.clientWidth);
        if (!width || width === this.flowWidth) return;
        this.flowWidth = width;
        const shown = this.shownConsumers;
        const geometry = flowGeometry(width, shown.length);
        flow.svg.setAttribute('viewBox', `0 0 ${width} ${geometry.height}`);
        flow.box.style.setProperty('--esc-flow-h', `${geometry.height}px`);
        flow.box.style.setProperty('--esc-node-w', `${geometry.nodeWidth}px`);
        flow.box.style.setProperty('--esc-centre-w', `${geometry.centreWidth}px`);
        flow.box.toggleAttribute('data-narrow', geometry.nodeWidth < 112);
        for (const [key, wire] of flow.wires) for (const path of wire.paths) path.setAttribute('d', geometry.paths[key]);
        flow.box.toggleAttribute('data-compact', geometry.consumers.some(c => c.compact));
        // The appliances in the flow take the places in order; the others leave it
        flow.consumers.forEach(({ el, wire, paths }, i) => {
            const at = shown.indexOf(i);
            const place = geometry.consumers[at];
            el.hidden = !place?.visible;
            setAttr(wire, 'data-off', place?.visible ? null : '');
            if (!place?.visible) return;
            el.dataset.side = place.below ? 'below' : 'above';
            Object.assign(el.style, { left: `${place.left}px`, top: `${place.top}px`, width: `${place.width}px` });
            // Its comet runs along its place's keyframes
            wire.style.setProperty('--esc-flow', `esc-flow-c${at}`);
            for (const path of paths) path.setAttribute('d', place.path);
        });
        flow.keyframes.textContent = geometry.keyframes;
    }

    /** The flow panel's elements, once built */
    private flowRefs(): NonNullable<Refs['flow']> {
        const q = <T extends Element = HTMLElement>(sel: string, parent: ParentNode = this.root) => find<T>(parent, sel);
        return {
            panel: q('.panel'),
            box: q('.flow'),
            svg: q<SVGSVGElement>('.wires'),
            keyframes: q<HTMLStyleElement>('style.flow-keyframes'),
            wires: new Map(WIRE_KEYS.map(key => {
                const g = q<SVGGElement>(`[data-wire="${key}"]`);
                return [key, { g, paths: [...g.querySelectorAll('path')] }];
            })),
            nodes: new Map(NODES.map(([key]) => [key, nodeRefs(q(`[data-node="${key}"]`))])),
            consumers: [...this.root.querySelectorAll<HTMLElement>('[data-consumer]')].map((el, i) => {
                const wire = q<SVGGElement>(`[data-wire="c${i}"]`);
                return { ...nodeRefs(el), icon: q('ha-icon', el), wire, paths: [...wire.querySelectorAll('path')] };
            }),
            unit: q('.unit'),
            unitButtons: [...this.root.querySelectorAll<HTMLButtonElement>('.unit button')],
        };
    }

    /** The flow's numbers, rings and wires, in place */
    private updateFlow(): void {
        const flow = this.refs?.flow;
        if (!flow) return;
        const hass = this.shown ?? this._hass!;
        const live = flowView(this.config!, hass, this.viewOptions);
        // kWh: today's energies in the nodes; the wires stay as they are, still and faded (CSS)
        const energy = this.showsEnergy;
        const view = energy ? energyView(live, this.config!, hass, this.day) : live;
        setAttr(this, 'data-flow-unit', energy ? 'energy' : null);
        this.paintUnit();
        for (const [key, node] of flow.nodes) {
            const v = view.nodes[key];
            if (node.el.hidden === v.present) node.el.hidden = !v.present;
            setText(node.label, v.label);
            node.valueTexts = [v.value, v.valueShort ?? v.value];
            this.fitValue(node);
            node.subTexts = [v.sub ?? '', v.subShort ?? v.sub ?? ''];
            this.fitSub(node);
            node.el.dataset.note = v.note ?? '';
            setText(node.centre, v.centre ?? '');
            node.centre.toggleAttribute('data-long', (v.centre ?? '').length > 2);
            node.el.toggleAttribute('data-centre', v.centre !== undefined);
            node.el.toggleAttribute('data-alert', !!v.alert);
            node.el.toggleAttribute('data-full', !!v.full);
            drawRing(node.segs, v.ring);
        }
        view.consumers.forEach((v, i) => {
            const node = flow.consumers[i];
            if (!node) return;
            // The name is the user's: text and attributes only
            setText(node.label, v.label);
            // With a charge (a car): « Voiture · 7,2 kW · 64 % », the charge in the ring and the disc, in the battery's colour
            const charge = v.soc === undefined ? '' : formatPercent(v.soc, numberLocale(this._hass));
            node.el.dataset.title = [v.label, charge && v.value, charge].filter(Boolean).join(' · ');
            setAttr(node.el, 'title', node.el.dataset.title);
            setAttr(node.el, 'aria-label', [v.label, v.value, charge].filter(Boolean).join(' '));
            node.valueTexts = [v.value, v.valueShort ?? v.value];
            this.fitValue(node);
            setAttr(node.icon, 'icon', v.icon);
            node.el.toggleAttribute('data-idle', v.level === 0);
            setText(node.centre, v.soc === undefined ? '' : String(Math.round(v.soc)));
            node.centre.toggleAttribute('data-long', v.soc !== undefined && Math.round(v.soc) >= 100);
            node.el.toggleAttribute('data-centre', v.soc !== undefined);
            drawRing(node.segs, v.soc === undefined ? [[v.share, 'use']] : [[v.soc / 100, 'batt']]);
            setAttr(node.wire, 'data-level', String(v.level));
            // Out of the flow at once; back in when the corners are laid out again (below)
            if (!v.shown) {
                node.el.hidden = true;
                setAttr(node.wire, 'data-off', '');
            }
        });
        // An appliance came into or left the flow: lay the corners out again
        const shown = view.consumers.flatMap((v, i) => v.shown ? [i] : []);
        if (shown.join() !== this.shownConsumers.join()) {
            this.shownConsumers = shown;
            this.flowWidth = 0;
            this.layoutFlow();
        }
        for (const [key, wire] of flow.wires) {
            setAttr(wire.g, 'data-level', String(view.levels[key]));
            setAttr(wire.g, 'data-off', view.off.includes(key) ? '' : null);
        }
    }

    /** Where text sits: the visible words and icons, and the hairline above the grid */
    private textBoxes(): Box[] {
        const root = this.root;
        const boxes: Box[] = [...root.querySelectorAll('.hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra')]
            .map(el => el.getBoundingClientRect());
        const grid = root.querySelector('.grid')?.getBoundingClientRect();
        if (grid && this.side) boxes.push({ left: grid.left - 1, right: grid.left + 1, top: grid.top, bottom: grid.bottom });
        else if (grid) boxes.push({ left: grid.left, right: grid.right, top: grid.top - 1, bottom: grid.top + 1 });
        return boxes.filter(b => b.right > b.left && b.bottom > b.top);
    }

    /**
     * Hide the stars that would touch text (with their twinkle and a gap):
     * the night sky covers the whole card, but never sits behind a letter.
     * Measured, so it holds for any size, value or language.
     */
    private clearText(): void {
        const card = this.refs?.card;
        if (!card) return;
        const box = card.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const boxes = this.textBoxes();
        for (const el of card.querySelectorAll<HTMLElement>('.star')) {
            const x = box.left + parseFloat(el.style.left) / 100 * box.width;
            const y = box.top + parseFloat(el.style.top) / 100 * box.height;
            const hide = coveredBy(x, y, Number(el.dataset.reach), boxes);
            if (el.hidden !== hide) el.hidden = hide;
        }
    }

    /** The cells' text at a level of shortening (data-form when shortened) */
    private writeForms(level: number): void {
        this.form = level;
        setAttr(this, 'data-form', level ? String(level) : null);
        for (const metric of this.view?.metrics ?? []) {
            const el = this.refs?.metrics.get(metric.key);
            if (!el) continue;
            const { value, extra } = metricForm(metric, level);
            setText(el.value, value);
            setText(el.extra, extra);
        }
    }

    /** The context line in full, or in its short form (« Conso. · … », data-short-context) */
    private writeContext(short: boolean): void {
        this.shortContext = short;
        this.toggleAttribute('data-short-context', short);
        if (this.refs) setText(this.refs.contextText, (short ? this.view?.contextShort : undefined) ?? this.view?.context ?? '');
    }

    /**
     * The roomiest layout at which nothing overflows, measured, so it holds
     * for any size, value or language: the prototype's spacing, then the
     * compact one (data-compact, three rows); within each, the cells' text
     * from full to short (writeForms), and within each, the hero from its
     * largest size down (data-hero). In standard the cells' lines must fit
     * too, failing which they take their tightest form and end in an
     * ellipsis; a context line too wide takes its short form. In side the
     * context line shares the left column with the hero: in full on one
     * line, else short on one line, else in full on two lines (short if
     * even two are too few).
     */
    private fitLayout(): void {
        const refs = this.refs;
        if (!refs) return;
        const side = this.side;
        const content = refs.card.querySelector('.content') as HTMLElement;
        const hero = refs.heroValue.parentElement as HTMLElement;
        const context = refs.context;
        const lines = [...refs.metrics.values()].map(m => m.value.parentElement as HTMLElement);
        const tooWide = (el: HTMLElement) => el.scrollWidth > el.clientWidth + 1;
        const lineHeight = () => parseFloat(getComputedStyle(context).lineHeight) || 20;
        const contextCut = () => !context.hidden && (tooWide(context) || context.scrollHeight > lineHeight() + 1);
        const fits = (strict: boolean) => !tooWide(hero) && !tooWide(content) && content.scrollHeight <= content.clientHeight + 1
            && (!strict || (side ? !contextCut() : !lines.some(tooWide)));
        const sizes = side ? SIDE_HERO_SIZES : HERO_SIZES;
        const attempt = (strict: boolean, levels: number[]): boolean => {
            for (const compact of [false, true]) {
                this.toggleAttribute('data-compact', compact);
                for (const level of levels) {
                    this.writeForms(level);
                    for (const size of sizes) {
                        setAttr(this, 'data-hero', size === sizes[0] ? null : String(size));
                        if (fits(strict)) return true;
                    }
                }
            }
            return false;
        };
        this.writeContext(false);
        if (!side) {
            // Still too wide in its tight form (a 12 h clock after the charge): without the complement, then with an ellipsis
            if (!attempt(true, FORM_LEVELS) && !attempt(true, [3])) attempt(false, FORM_LEVELS.slice(-1));
            this.writeContext(!context.hidden && tooWide(context));
            return;
        }
        if (attempt(true, SIDE_FORM_LEVELS)) return;
        this.writeContext(true);
        if (attempt(true, SIDE_FORM_LEVELS)) return;
        this.writeContext(false);
        attempt(false, SIDE_FORM_LEVELS);
        this.writeContext(!context.hidden && context.scrollHeight > context.clientHeight + 1);
    }

    /** What the render depends on: each tracked entity's last_updated, and the locale */
    private stateKey(hass: HomeAssistant): string {
        const ids = trackedEntities(this.config!);
        return [cardLanguage(hass), hass.locale?.number_format ?? '', ...ids.map(id => hass.states[id]?.last_updated ?? '-')].join('|');
    }

    /** Re-render only when a tracked entity changed; update the text in place */
    private update(): void {
        if (!this.config || !this.refs || !this._hass) return;
        let shown = this._hass;
        let key = this.stateKey(this._hass);
        if (this.smoother) {
            const now = Date.now();
            this.smoother.record(this._hass, this.smoothIds, now);
            shown = this.smoother.smoothed(this._hass, this.smoothIds, now);
            // The averages move between readings: render when what they show changes
            key += '|' + this.smoothIds.map(id => Number(shown.states[id]?.state).toPrecision(3)).join('|');
        }
        // The estimate: its average power, and the minute (a clock time moves on with it); today's self-sufficiency
        const options: ViewOptions = this.selfSufficiency === undefined ? {} : { selfSufficiency: this.selfSufficiency };
        if (this.estimateIds.length) {
            const now = Date.now();
            options.now = now;
            // Its moving average, or the instant reading (never the smoothed one: estimate.average decides)
            if (this.estimateSmoother) {
                this.estimateSmoother.record(this._hass, this.estimateIds, now);
                options.estimatePower = batteryPower(this.config, this.estimateSmoother.smoothed(this._hass, this.estimateIds, now));
            } else options.estimatePower = batteryPower(this.config, this._hass);
            key += `|${options.estimatePower?.toPrecision(2) ?? ''}|${Math.floor(now / 60000)}`;
        }
        key += `|${this.selfSufficiency ?? ''}|${this.showsEnergy ? JSON.stringify(this.day ?? null) : ''}`;
        if (key === this.renderedKey) return;
        this.renderedKey = key;
        this.shown = shown;
        this.viewOptions = options;

        const view = this.view = buildView(this.config, shown, options);
        const refs = this.refs;
        this.paintSky();
        setText(refs.heroValue, view.hero.value);
        setText(refs.heroUnit, view.hero.unit);
        refs.context.hidden = view.context === undefined;
        for (const metric of view.metrics) {
            const el = refs.metrics.get(metric.key);
            if (!el) continue;
            setText(el.label, metric.label);
            // Side: the icon stands for the label, which shows on hover
            if (this.side && el.el.title !== metric.label) el.el.title = metric.label;
            if (metric.icon && el.icon.getAttribute('icon') !== metric.icon) el.icon.setAttribute('icon', metric.icon);
        }
        this.writeForms(this.form);
        this.writeContext(this.shortContext);
        this.updateFlow();
        this.markStale();
        // A longer hero ("12,3 kW" after "8 W") or line may not fit any more
        const fitted = JSON.stringify([view.hero, view.context, view.metrics.map(m => [m.value, m.extra, m.tight, m.bare])]);
        if (fitted !== this.fitted) {
            this.fitted = fitted;
            this.fit();
        }
    }

    /**
     * Readings gone quiet (staleReadings): a cell's icon turns to a clock and
     * a flow node's border to dashes, each saying how long ago in its title.
     * Run on each update and every minute.
     */
    private markStale(): void {
        if (!this.config || !this.refs || !this._hass) return;
        const stale = staleReadings(this.config, this._hass);
        const lang = cardLanguage(this._hass);
        const age = (minutes: number) => minutes < 120 ? `${minutes} min` : `${Math.floor(minutes / 60)} h`;
        const note = (id: string | undefined) => {
            const minutes = id === undefined ? undefined : stale.get(id);
            return minutes === undefined ? undefined : localize(lang, 'stale', { age: age(minutes) });
        };
        for (const metric of this.view?.metrics ?? []) {
            const el = this.refs.metrics.get(metric.key);
            if (!el) continue;
            const text = note(el.entity);
            el.el.toggleAttribute('data-stale', !!text);
            // The icon tells, the title says how long; in side the title is the cell's name
            const icon = text ? 'mdi:clock-alert-outline' : metric.icon ?? el.icon.dataset.icon;
            if (!el.icon.dataset.icon) el.icon.dataset.icon = el.icon.getAttribute('icon') ?? '';
            if (icon && el.icon.getAttribute('icon') !== icon) el.icon.setAttribute('icon', icon);
            const title = [this.side ? metric.label : '', metric.note ?? '', text ?? ''].filter(Boolean).join(' · ');
            setAttr(el.el, 'title', title || null);
        }
        const flow = this.refs.flow;
        if (!flow) return;
        for (const [key, node] of flow.nodes) {
            const text = note(flowNodeEntity(this.config, key));
            node.el.toggleAttribute('data-stale', !!text);
            // The battery's estimate sentence (updateFlow), then the age of a quiet reading
            const title = [node.el.dataset.note ?? '', text ?? ''].filter(Boolean).join(' · ');
            setAttr(node.el, 'title', title || null);
        }
        (this.config.consumers ?? []).forEach((consumer, i) => {
            const node = flow.consumers[i];
            if (!node) return;
            const text = note(consumer.entity) ?? (consumer.soc_entity ? note(consumer.soc_entity) : undefined);
            node.el.toggleAttribute('data-stale', !!text);
            // The title updateFlow wrote (name, power and charge), then how long a reading has been quiet
            const own = node.el.dataset.title ?? node.label.textContent ?? '';
            setAttr(node.el, 'title', text ? `${own} · ${text}` : own);
        });
    }

    /** The background: day or night, the tariff colours, the halo's strength */
    private paintSky(): void {
        const bg = computeBackground(this.config!, this.shown ?? this._hass!);
        const card = this.refs!.card;
        this.dataset.mode = bg.mode;
        this.toggleAttribute('data-producing', bg.producing);
        bg.palette.forEach((colour, i) => card.style.setProperty(`--esc-c${i}`, colour));
        bg.nightPalette.forEach((colour, i) => card.style.setProperty(`--esc-n${i}`, colour));
        card.style.setProperty('--esc-halo-alpha', String(bg.haloAlpha));
        this.dataset.sky = bg.sky;
        // The weather: its clouds, rain, snow, fog or lightning, and how many stars get through at night
        const look = bg.weather ? WEATHER[bg.weather] : undefined;
        setAttr(this, 'data-stars', look ? look.stars : null);
        card.style.setProperty('--esc-cloud-a', String(look ? (bg.mode === 'night' ? look.nightCloudAlpha : look.cloudAlpha) : 0));
        const wx = this.root.querySelector('.wx');
        if (wx && bg.weather && bg.weather !== this.weatherDrawn) {
            this.weatherDrawn = bg.weather;
            wx.innerHTML = weatherMarkup(bg.weather);
        }
        this.paintHeavens(bg);
        // The day / night cross-fade is for changes, not for the first paint
        if (!this.hasAttribute('data-ready') && this.readyFrame === undefined) {
            this.readyFrame = requestAnimationFrame(() => {
                this.readyFrame = undefined;
                this.setAttribute('data-ready', '');
            });
        }
    }

    /**
     * The day fading into night with the sun's height, the dawn or dusk glow,
     * the sun and the moon (placed by placeSky), the wind in the rain, the
     * rainbow after a shower, the golden shooting star
     */
    private paintHeavens(bg: Background): void {
        const hass = this.shown ?? this._hass!;
        const now = Date.now();
        const sky = this.heavens = celestial(this.config!, hass, bg, now);
        const card = this.refs!.card;
        const set = (name: string, value: string | number) => card.style.setProperty(name, String(value));
        const r2 = (v: number) => Math.round(v * 100) / 100;
        set('--esc-day', r2(sky.day));
        set('--esc-stars', r2(sky.stars));
        set('--esc-twilight', r2(sky.twilight));
        // The flow's floor: the sky's last colour as the sky shows it now, day over night
        set('--esc-floor', `rgb(${floorRgb(bg.palette, bg.nightPalette, r2(sky.day)).map(c => Math.round(c * 255)).join(', ')})`);
        this.toggleAttribute('data-dawn', sky.dawn);
        const sun = this.root.querySelector<HTMLElement>('.sky .sun');
        if (sun && sky.sun) {
            const w = sky.sun.warmth;
            const tone = (hi: number[], lo: number[]) => hi.map((c, i) => Math.round(c + (lo[i] - c) * w));
            set('--esc-p', r2(sky.sun.p));
            set('--esc-warm', tone([255, 246, 226], [255, 170, 100]).join(', '));
            set('--esc-bloom', tone([255, 252, 240], [255, 206, 150]).join(', '));
            set('--esc-core', `rgb(${tone([255, 255, 255], [255, 222, 176]).join(', ')})`);
            set('--esc-rim', `rgb(${tone([255, 244, 214], [255, 207, 154]).join(', ')})`);
            set('--esc-edge', `rgb(${tone([255, 230, 168], [255, 146, 72]).join(', ')})`);
            set('--esc-flat', r2(1 - 0.14 * w));
            set('--esc-sun-scale', r2(1 + 0.15 * w));
            setAttr(sun, 'data-rays', sky.sun.rays ? String(sky.sun.rays) : null);
        }
        const moon = this.root.querySelector<HTMLElement>('.moon');
        if (moon && sky.moon) {
            // The phase, redrawn when it shows a change (about every 7 hours)
            const key = sky.moon.lit.toFixed(2);
            if (key !== this.moonDrawn) {
                this.moonDrawn = key;
                moon.innerHTML = moonMarkup(sky.moon.lit, 'esc-moon');
            }
            set('--esc-moon-r', `${sky.moon.rotate}deg`);
            set('--esc-moon-lit', r2(sky.moon.lit));
        }
        // The wind in the rain and the clouds: its speed across the view, from the weather entity
        const weather = this.config!.weather_entity ? hass.states[this.config!.weather_entity] : undefined;
        const wind = windAcross(weather?.attributes, hass.config?.latitude);
        set('--esc-rain-dx', `${wind}px`);
        set('--esc-rain-rot', `${r2(Math.atan2(-wind, 330) * 180 / Math.PI)}deg`);
        set('--esc-wind-dir', wind > 0 ? 'normal' : 'reverse');
        // A rainbow when the sun comes back after rain, for ten minutes, while the sun is below 42°
        const state = bg.weather ?? '';
        if (RAINY.has(this.lastWeather) && ['sunny', 'partlycloudy', 'windy'].includes(state)) this.rainbowUntil = now + 10 * 60_000;
        if (state) this.lastWeather = state;
        const alt = Number(hass.states[this.config!.sun_entity ?? 'sun.sun']?.attributes?.elevation);
        const bow = now < this.rainbowUntil && ['sunny', 'partlycloudy', 'windy'].includes(state) && bg.mode === 'day' && !(alt >= 42);
        this.toggleAttribute('data-rainbow', bow);
        if (bow) set('--esc-bow-alt', Number.isFinite(alt) ? Math.max(alt, 0) : 20);
        // A day at 100 % self-sufficiency: a golden shooting star that evening
        this.toggleAttribute('data-golden', (this.selfSufficiency ?? 0) >= 99.5);
        this.placeSky();
    }

    /**
     * Where the sun and the moon go: their place on the day's arc (east on
     * the left of their zone, high up at the top), in the top right, kept
     * SUN_CLEARANCE px from the hero, the context line and the cells: moved
     * up, then right, when the sky would put them nearer; hidden when there
     * is no room. The rainbow keeps right of the hero and fades out above
     * the context line. Measured, so it holds for any size, value or language.
     */
    private placeSky(): void {
        const card = this.refs?.card;
        const sky = this.heavens;
        if (!card || !sky) return;
        const box = card.getBoundingClientRect();
        const W = box.width, H = Math.min(box.height, this.side ? 120 : 248);
        const set = (name: string, value: string | number) => card.style.setProperty(name, String(value));
        const rel = (r: { left: number; right: number; top: number; bottom: number }) => ({ left: r.left - box.left, right: r.right - box.left, top: r.top - box.top, bottom: r.bottom - box.top });
        const measured = (sel: string) => [...this.root.querySelectorAll(sel)].map(el => rel(el.getBoundingClientRect())).filter(b => b.right > b.left);
        const hero = measured('.hero-value, .hero-unit'), context = measured('.context-text'), cells = measured('.metric');
        const clear = (x: number, y: number) => ([[hero, SUN_CLEARANCE.hero], [context, SUN_CLEARANCE.context], [cells, SUN_CLEARANCE.cells]] as const)
            .every(([boxes, gap]) => boxes.every(b => Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom)) >= gap + 1));
        const heroRight = Math.max(0, ...hero.map(b => b.right));
        const xMin = Math.max(W * 0.5, heroRight + 24), xMax = W - 24, yTop = 20, yLow = Math.max(yTop, H * 0.36);
        /** The nearest clear place to (u, v): up first, then towards the right */
        const place = (u: number, v: number): [number, number] | undefined => {
            if (!W) return [xMin + u * (xMax - xMin), yLow - v * (yLow - yTop)];
            let x = xMin + u * Math.max(0, xMax - xMin), y = yLow - v * (yLow - yTop);
            for (; y >= yTop && !clear(x, y); y -= 4);
            if (y >= yTop) return [x, y];
            for (y = yTop; x <= xMax && !clear(x, y); x += 4);
            return x <= xMax ? [x, y] : undefined;
        };
        const sunAt = sky.sun && place(sky.sun.u, sky.sun.v);
        set('--esc-sun-o', sunAt && sky.sun ? Math.round(sky.sun.opacity * 100) / 100 : 0);
        if (sunAt) { set('--esc-sun-x', `${Math.round(sunAt[0])}px`); set('--esc-sun-y', `${Math.round(sunAt[1])}px`); }
        let moonAt = sky.moon && place(sky.moon.u, sky.moon.v);
        // Not on top of the sun
        if (moonAt && sunAt && sky.sun && sky.sun.opacity > 0 && Math.hypot(moonAt[0] - sunAt[0], moonAt[1] - sunAt[1]) < 40) moonAt = undefined;
        set('--esc-moon-o', moonAt && sky.moon ? Math.round(sky.moon.opacity * 100) / 100 : 0);
        if (moonAt) { set('--esc-moon-x', `${Math.round(moonAt[0])}px`); set('--esc-moon-y', `${Math.round(moonAt[1])}px`); }
        // The rainbow: its arc's top 42° minus the sun's height above the horizon; right of the hero (its inner radius 85 px)
        const alt = Number(card.style.getPropertyValue('--esc-bow-alt')) || 20;
        const contextTop = Math.min(H * 0.36, ...context.map(b => b.top));
        set('--esc-bow-x', `${Math.round(Math.max(W - 60, heroRight + 12 + 107))}px`);
        // The lower the sun, the higher the arc: its top 23 px from the card's top at sunset, 83 px with the sun at 42°
        const bowTop = Math.round(-20 + Math.min(alt, 42) / 42 * 60);
        set('--esc-bow-y', `${bowTop}px`);
        set('--esc-bow-fade', `${Math.round(contextTop - 8 - bowTop)}px`);
    }

    /** Sections view: full width, four rows (248 px), never under three; the side layout two rows (120 px) */
    getGridOptions() {
        // Unfolding changes the card's height: the grid lets the card set it
        if (this.config?.flow) return { columns: 12, rows: 'auto' as const, min_columns: 6 };
        return this.side
            ? { columns: 12, rows: 2, min_columns: 6, min_rows: 2 }
            : { columns: 12, rows: 4, min_columns: 6, min_rows: 3 };
    }

    getCardSize(): number {
        return this.side ? 2 : 4;
    }

    /**
     * Prefill from the Energy dashboard (solar, battery and grid sensors, and
     * those on the same devices), today's Tempo colour and sun.sun; without
     * an Energy dashboard, the first power sensor found
     */
    static async getStubConfig(hass?: HomeAssistant): Promise<Partial<EnergySkyCardConfig>> {
        return stubConfig(hass, await energyPrefs(hass));
    }

    /** The editor lives in its own bundle, loaded the first time it's opened */
    static async getConfigElement(): Promise<HTMLElement> {
        if (!customElements.get(CARD_EDITOR_NAME)) await loadEditorBundle();
        return document.createElement(CARD_EDITOR_NAME);
    }
}

/** The cloud shadows: each drifts in a card-wide band, from fully off the left edge to fully off the right */
function cloudsMarkup(): string {
    return CLOUDS.map(c =>
        `<div class="drift" style="animation-duration:${c.period}s;animation-delay:-${c.delay}s"><i class="cloud" style="width:${c.width}%;height:${c.height}%;top:${c.top}%;left:${(100 - c.width) / 2}%"></i></div>`,
    ).join('');
}

/** The flow's markup: the wires (SVG, drawn for the width by layoutFlow) under the four nodes (HTML) */
function flowMarkup(consumers: number): string {
    // Up to three dots per wire, one bead each, travelling along it (how many: the wire's level, in CSS)
    const comets = [1, 2, 3].map(n => `<g class="comet c${n}"><circle r="2.5"></circle></g>`).join('');
    // The grid ↔ battery link first: it passes under the sun → home wire, which a gap of the panel's colour bridges over it
    const order: WireKey[] = ['gb', 'bg', ...WIRE_KEYS.filter(k => k !== 'gb' && k !== 'bg')];
    const wires = order.map(key => `<g class="wire ${WIRES[key]}" data-wire="${key}" data-level="0">${key === 'sh' ? '<path class="gap"></path>' : ''}<path class="glow"></path><path class="line"></path>${comets}</g>`).join('');
    // The appliances' wires, from the home, under the rest
    const uses = Array.from({ length: consumers }, (_, i) => `<g class="wire use" data-wire="c${i}" data-level="0"><path class="glow"></path><path class="line"></path>${comets}</g>`).join('');
    const node = (attrs: string, icon: string) => `
        <div class="node" ${attrs}>
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon${icon ? ` icon="${icon}"` : ''}></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span><span class="nsub line"></span></span>
        </div>`;
    const nodes = NODES.map(([key, icon]) => node(`data-node="${key}"`, icon)).join('')
        + Array.from({ length: consumers }, (_, i) => node(`data-consumer="${i}"`, '')).join('');
    // The kW | kWh switch, in the free top-left corner (shown once the Energy dashboard's meters are known)
    const unit = `<div class="unit" hidden><span class="unit-switch" role="group" aria-label="kW / kWh">${(['power', 'energy'] as const).map(u => `<button type="button" data-unit="${u}" data-cell-target data-target-key="unit">${u === 'power' ? 'kW' : 'kWh'}</button>`).join('')}</span></div>`;
    return `<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${FLOW_HEIGHT}">${uses}${wires}</svg>${nodes}${unit}</div></div>`;
}

/** A flow node's text and ring elements */
function nodeRefs(el: HTMLElement): FlowNodeRefs {
    return { el, label: find(el, '.nlab'), value: find(el, '.nval'), sub: find(el, '.nsub'), centre: find(el, '.centre'), segs: [...el.querySelectorAll<SVGCircleElement>('.seg')] };
}

/** A node's ring: its segments around the disc, each a share of the circle in its source's colour */
function drawRing(segs: SVGCircleElement[], ring: [number, string][]): void {
    let offset = 0;
    segs.forEach((seg, i) => {
        const part = ring[i];
        const length = part ? Math.max(RING * part[0] - (ring.length > 1 ? 3 : 0), 0) : 0;
        setAttr(seg, 'stroke-dasharray', `${length.toFixed(1)} ${RING.toFixed(1)}`);
        setAttr(seg, 'stroke-dashoffset', (-offset).toFixed(1));
        // Too short to read as an arc (its round caps would make a dot): not drawn
        setAttr(seg, 'data-source', part && length >= 1.5 ? part[1] : '');
        if (part) offset += RING * part[0];
    });
}

/** An element the card built (it is there: the markup is the card's own) */
function find<T extends Element = HTMLElement>(parent: ParentNode, selector: string): T {
    return parent.querySelector(selector) as unknown as T;
}

/** Set an attribute only when it changed (null removes it) */
function setAttr(el: Element, name: string, value: string | null): void {
    if (value === null) {
        if (el.hasAttribute(name)) el.removeAttribute(name);
    } else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

/** Write text only when it changed, so an unchanged node isn't touched */
function setText(el: HTMLElement, text: string): void {
    if (el.textContent !== text) el.textContent = text;
}

if (!customElements.get(CARD_NAME)) {
    customElements.define(CARD_NAME, EnergySkyCard);
    window.customCards = window.customCards || [];
    window.customCards.push({
        type: CARD_NAME,
        name: CARD_DISPLAY_NAME,
        description: CARD_DESCRIPTION,
        preview: true,
        documentationURL: CARD_DOC_URL,
    });
}

if (!window.energySkyCardBannerShown) {
    window.energySkyCardBannerShown = true;
    console.info(`%c ${CARD_DISPLAY_NAME} %c ${CARD_VERSION} `,
        'color:#fff;background:#2f75bd;font-weight:600;border-radius:3px 0 0 3px',
        'color:#1d2b4d;background:#ffd68c;border-radius:0 3px 3px 0');
}
