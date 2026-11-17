// Energy Sky Card — the card element: a plain HTMLElement with a shadow root.

import { CARD_NAME, CARD_EDITOR_NAME, CARD_DISPLAY_NAME, CARD_DESCRIPTION, CARD_DOC_URL, CARD_VERSION } from './constants';
import { loadEditorBundle } from './bundles';
import { CARD_CSS, FLOW_COLOUR_VARS } from './styles/card';
import { CELL_KINDS, CUSTOM_CELL_ICON, MAX_CELLS, METRIC_ICONS, buildView, cellEntity, configuredCells, metricForm, productionEntities, staleReadings, trackedEntities, type CardView, type MetricKey } from './model';
import { localize } from './localize';
import { cardLanguage } from './localize';
import { CLOUDS, WEATHER, computeBackground, isHexColor } from './sky';
import { weatherMarkup } from './weather';
import { coveredBy, starsMarkup, type Box } from './stars';
import { MotionController } from './motion';
import { energyPrefs, stubConfig } from './stub';
import { isAction, listenForGestures, readActions, updateTargetSemantics, type ActionConfig, type ActionsConfig } from './actions';
import { FLOW_HEIGHT, MAX_CONSUMERS, WIRES, WIRE_KEYS, flowGeometry, flowNodeEntity, flowView, type NodeKey, type WireKey } from './flow';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

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
    ['background', ['tempo', 'solid', 'weather']],
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
const KINDS: [string[], (v: unknown) => boolean, string, string][] = [
    [['battery.invert', 'grid.invert', 'expandable', 'animate'], v => v === undefined || typeof v === 'boolean', 'doit valoir true ou false', 'must be true or false'],
    [['daily_production_entities', 'battery.soc_reached_entities', 'grid.outage_states'], isStringList, 'doit être une liste', 'must be a list'],
    [['production_max', 'battery.power_threshold', 'consumer_threshold', 'stale_after'], v => v === undefined || (typeof v === 'number' && Number.isFinite(v) && v >= 0), 'doit être un nombre positif', 'must be a positive number'],
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
            const o = (consumer && typeof consumer === 'object' ? consumer : {}) as { entity?: unknown; tap_action?: unknown };
            if (typeof o.entity !== 'string' || !o.entity) throw configError('consumers : chaque appareil a une entity', 'consumers: each appliance needs an entity');
            if (o.tap_action !== undefined && !isAction(o.tap_action)) {
                throw configError('consumers : tap_action doit avoir une action (more-info, navigate, url…)', 'consumers: tap_action needs an action (more-info, navigate, url…)');
            }
        }
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
interface FlowNodeRefs { el: HTMLElement; label: HTMLElement; value: HTMLElement; centre: HTMLElement; segs: SVGCircleElement[] }

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
    /** Unfolded: the flow shows under the card (always with flow: always) */
    private open = false;
    /** The width the flow's geometry was last drawn for */
    private flowWidth = 0;
    /** The weather drawn in the sky (its WEATHER key), redrawn only when the condition changes */
    private weatherDrawn = '';
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
        if (this._hass) this.update();
    }

    connectedCallback(): void {
        this.motion.start();
        this.staleTimer ??= setInterval(() => this.markStale(), 60_000);
        if (this.refs && this.resizeObserver) this.resizeObserver.observe(this.refs.card);
        this.fit();
        // Text measured before the fonts load is narrower or wider than it will be
        document.fonts?.ready?.then(() => this.fit());
    }

    disconnectedCallback(): void {
        this.motion.stop();
        clearInterval(this.staleTimer);
        this.staleTimer = undefined;
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
                    <div class="layer day"><div class="halo"></div>${cloudsMarkup()}</div>
                    <div class="layer night">${starsMarkup()}</div>
                    ${config.background === 'weather' ? '<div class="wx"></div>' : ''}
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-text"></span></div>
                    ${config.flow === 'tap' ? '<i class="grabber" aria-hidden="true"></i>' : ''}
                    <div class="grid">${cells.map(cell => `
                        <div class="metric" data-metric="${cell.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra"></span></div>
                        </div>`).join('')}</div>
                </div>
                ${config.flow ? flowMarkup(config.consumers?.length ?? 0) : ''}
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
            const tap = isAction(cell.tapAction) ? cell.tapAction : undefined;
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
        this.clearText();
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
        };
    }

    /** The flow's numbers, rings and wires, in place */
    private updateFlow(): void {
        const flow = this.refs?.flow;
        if (!flow) return;
        const view = flowView(this.config!, this._hass!);
        for (const [key, node] of flow.nodes) {
            const v = view.nodes[key];
            if (node.el.hidden === v.present) node.el.hidden = !v.present;
            setText(node.label, v.label);
            setText(node.value, v.value);
            setText(node.centre, v.centre ?? '');
            node.el.toggleAttribute('data-centre', v.centre !== undefined);
            node.el.toggleAttribute('data-alert', !!v.alert);
            drawRing(node.segs, v.ring);
        }
        view.consumers.forEach((v, i) => {
            const node = flow.consumers[i];
            if (!node) return;
            // The name is the user's: text and attributes only
            setText(node.label, v.label);
            setAttr(node.el, 'title', v.label);
            setAttr(node.el, 'aria-label', `${v.label} ${v.value}`);
            setText(node.value, v.value);
            setAttr(node.icon, 'icon', v.icon);
            node.el.toggleAttribute('data-idle', v.level === 0);
            drawRing(node.segs, [[v.share, 'use']]);
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
            if (!attempt(true, FORM_LEVELS)) attempt(false, FORM_LEVELS.slice(-1));
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
        const key = this.stateKey(this._hass);
        if (key === this.renderedKey) return;
        this.renderedKey = key;

        const view = this.view = buildView(this.config, this._hass);
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
            const title = [this.side ? metric.label : '', text ?? ''].filter(Boolean).join(' · ');
            setAttr(el.el, 'title', title || null);
        }
        const flow = this.refs.flow;
        if (!flow) return;
        for (const [key, node] of flow.nodes) {
            const text = note(flowNodeEntity(this.config, key));
            node.el.toggleAttribute('data-stale', !!text);
            setAttr(node.el, 'title', text ?? null);
        }
        (this.config.consumers ?? []).forEach((consumer, i) => {
            const node = flow.consumers[i];
            if (!node) return;
            const text = note(consumer.entity);
            node.el.toggleAttribute('data-stale', !!text);
            const name = node.label.textContent ?? '';
            setAttr(node.el, 'title', text ? `${name} · ${text}` : name);
        });
    }

    /** The background: day or night, the tariff colours, the halo's strength */
    private paintSky(): void {
        const bg = computeBackground(this.config!, this._hass!);
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
        // The day / night cross-fade is for changes, not for the first paint
        if (!this.hasAttribute('data-ready') && this.readyFrame === undefined) {
            this.readyFrame = requestAnimationFrame(() => {
                this.readyFrame = undefined;
                this.setAttribute('data-ready', '');
            });
        }
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
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`;
    const nodes = NODES.map(([key, icon]) => node(`data-node="${key}"`, icon)).join('')
        + Array.from({ length: consumers }, (_, i) => node(`data-consumer="${i}"`, '')).join('');
    return `<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${FLOW_HEIGHT}">${uses}${wires}</svg>${nodes}</div></div>`;
}

/** A flow node's text and ring elements */
function nodeRefs(el: HTMLElement): FlowNodeRefs {
    return { el, label: find(el, '.nlab'), value: find(el, '.nval'), centre: find(el, '.centre'), segs: [...el.querySelectorAll<SVGCircleElement>('.seg')] };
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
