// Energy Sky Card — the card element: a plain HTMLElement with a shadow root.

import { CARD_NAME, CARD_EDITOR_NAME, CARD_DISPLAY_NAME, CARD_DESCRIPTION, CARD_DOC_URL, CARD_VERSION } from './constants';
import { loadEditorBundle } from './bundles';
import { CARD_CSS } from './styles/card';
import { CELL_KINDS, CUSTOM_CELL_ICON, MAX_CELLS, METRIC_ICONS, buildView, cellEntity, cellTapOpensEntity, configuredCells, normalizeConfig, productionEntities, trackedEntities, type MetricKey } from './model';
import { cardLanguage } from './localize';
import { CLOUDS, computeBackground, isHexColor } from './sky';
import { coveredBy, starsMarkup, type Box } from './stars';
import { MotionController } from './motion';
import { energyPrefs, stubConfig } from './stub';
import { isAction, listenForGestures, readActions, updateTargetSemantics, type ActionConfig, type ActionsConfig } from './actions';
import { FLOW_HEIGHT, WIRES, WIRE_KEYS, flowGeometry, flowNodeEntity, flowView, type NodeKey, type WireKey } from './flow';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

/** The hero's sizes, largest first: it steps down until the card's lines fit */
export const HERO_SIZES = [56, 48, 40] as const;
/** The side layout's hero sizes (2 rows: a smaller hero beside the cells) */
export const SIDE_HERO_SIZES = [44, 40, 36] as const;
/** The side layout's ways to shorten a cell's line, in order: none, short complements, tight form, no complement */
const SIDE_EXTRAS = [[], ['data-short-extra'], ['data-short-extra', 'data-tight-extra'], ['data-no-extra']] as const;
const EXTRA_ATTRIBUTES = ['data-short-extra', 'data-tight-extra', 'data-no-extra'] as const;
/** The flow's nodes and their icons (the battery shows its charge instead, when known) */
const NODES: [NodeKey, string][] = [['solar', METRIC_ICONS.tomorrow], ['grid', METRIC_ICONS.grid], ['battery', METRIC_ICONS.battery], ['home', METRIC_ICONS.consumption]];
/** A ring's circumference: r = 17 in a 40 × 40 box */
const RING = 2 * Math.PI * 17;
/** The wires a missing node takes away with it */
const WIRES_OF: Record<'grid' | 'battery', WireKey[]> = { grid: ['sg', 'gh', 'gb', 'bg'], battery: ['sb', 'bh', 'gb', 'bg'] };

/** A config error, in the page's language (French or English) */
function configError(fr: string, en: string): Error {
    const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
    return new Error(lang.startsWith('fr') ? fr : en);
}

const isStringList = (v: unknown): boolean => v === undefined || (Array.isArray(v) && v.every(x => typeof x === 'string'));

export function validateConfig(config: unknown): EnergySkyCardConfig {
    if (!config || typeof config !== 'object') {
        throw configError('Configuration invalide', 'Invalid configuration');
    }
    const c = normalizeConfig(config as Partial<EnergySkyCardConfig>);
    const production = c.production_entity;
    const productionOk = typeof production === 'string'
        ? production.length > 0
        : Array.isArray(production) && production.length > 0 && production.every(id => typeof id === 'string' && id.length > 0);
    if (!productionOk) {
        throw configError('production_entity est obligatoire (une entité ou une liste)', 'production_entity is required (one entity or a list)');
    }
    if (c.night_hero !== undefined && !(['production', 'consumption', 'battery'] as unknown[]).includes(c.night_hero)) {
        throw configError('night_hero : production, consumption ou battery', 'night_hero: production, consumption or battery');
    }
    if (c.layout !== undefined && !(['standard', 'side'] as unknown[]).includes(c.layout)) {
        throw configError('layout : standard ou side', 'layout: standard or side');
    }
    if (c.cell_tap !== undefined && !(['auto', 'more-info', 'card'] as unknown[]).includes(c.cell_tap)) {
        throw configError('cell_tap : auto, more-info ou card', 'cell_tap: auto, more-info or card');
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
            if (ok && o.tap_action !== undefined && !(o.tap_action && typeof o.tap_action === 'object' && typeof (o.tap_action as { action?: unknown }).action === 'string')) {
                throw configError('cells : tap_action doit avoir une action (more-info, navigate, url…)', 'cells: tap_action needs an action (more-info, navigate, url…)');
            }
            if (!ok) {
                throw configError(`cells : « ${String(typeof cell === 'object' ? JSON.stringify(cell) : cell)} » n'est ni ${CELL_KINDS.join(', ')}, ni { type: … }, ni { entity: … }`,
                    `cells: "${String(typeof cell === 'object' ? JSON.stringify(cell) : cell)}" is neither ${CELL_KINDS.join(', ')}, { type: … } nor { entity: … }`);
            }
        }
    }
    for (const [name, value] of [['battery.invert', c.battery?.invert], ['grid.invert', c.grid?.invert]] as const) {
        if (value !== undefined && typeof value !== 'boolean') throw configError(`${name} doit valoir true ou false`, `${name} must be true or false`);
    }
    const lists: [string, unknown][] = [
        ['daily_production_entities', c.daily_production_entities],
        ['battery.soc_reached_entities', c.battery?.soc_reached_entities],
        ['grid.outage_states', c.grid?.outage_states],
    ];
    for (const [name, value] of lists) {
        if (!isStringList(value)) throw configError(`${name} doit être une liste`, `${name} must be a list`);
    }
    if (c.expandable !== undefined && typeof c.expandable !== 'boolean') {
        throw configError('expandable doit valoir true ou false', 'expandable must be true or false');
    }
    if (c.animate !== undefined && typeof c.animate !== 'boolean') {
        throw configError('animate doit valoir true ou false', 'animate must be true or false');
    }
    const numbers: [string, unknown][] = [['production_max', c.production_max], ['battery.power_threshold', c.battery?.power_threshold]];
    for (const [name, value] of numbers) {
        if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
            throw configError(`${name} doit être un nombre positif`, `${name} must be a positive number`);
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
    return c as EnergySkyCardConfig;
}

/** The elements updated in place on every change */
interface Refs {
    card: HTMLElement;
    heroValue: HTMLElement;
    heroUnit: HTMLElement;
    context: HTMLElement;
    contextFull: HTMLElement;
    contextShort: HTMLElement;
    /** The unfolding part (expandable: true) */
    flow?: {
        panel: HTMLElement;
        box: HTMLElement;
        svg: SVGSVGElement;
        keyframes: HTMLStyleElement;
        wires: Map<WireKey, { g: SVGGElement; paths: SVGPathElement[] }>;
        nodes: Map<NodeKey, { el: HTMLElement; label: HTMLElement; value: HTMLElement; centre: HTMLElement; segs: SVGCircleElement[] }>;
    };
    metrics: Map<MetricKey, { el: HTMLElement; icon: HTMLElement; label: HTMLElement; value: HTMLElement; extra: HTMLElement; extraShort: HTMLElement; valueTight: HTMLElement; extraTight: HTMLElement; valueBare: HTMLElement }>;
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
    /** Unfolded (expandable: true): the flow shows under the card */
    private open = false;
    /** The width the flow's geometry was last drawn for */
    private flowWidth = 0;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }

    setConfig(config: EnergySkyCardConfig): void {
        this.config = validateConfig(config);
        this.build();
        this.open = false;
        this.removeAttribute('data-expanded');
        this.renderedKey = '';
        this.removeAttribute('data-ready');
        this.motion.setAnimate(this.config.animate !== false);
        if (this._hass) this.update();
    }

    connectedCallback(): void {
        this.motion.start();
        if (this.refs && this.resizeObserver) this.resizeObserver.observe(this.refs.card);
        this.fit();
        // Text measured before the fonts load is narrower or wider than it will be
        document.fonts?.ready?.then(() => this.fit());
    }

    disconnectedCallback(): void {
        this.motion.stop();
        this.resizeObserver?.disconnect();
        if (this.readyFrame !== undefined) cancelAnimationFrame(this.readyFrame);
        this.readyFrame = undefined;
    }

    /** Whether the energy flow is unfolded (expandable: true only) */
    get expanded(): boolean {
        return this.open;
    }

    set expanded(open: boolean) {
        const next = open && this.config?.expandable === true;
        if (next === this.open && this.hasAttribute('data-expanded') === next) return;
        this.open = next;
        this.toggleAttribute('data-expanded', next);
        const flow = this.refs?.flow;
        if (flow) flow.panel.hidden = !next;
        if (this.config?.expandable) this.refs?.heroValue.parentElement?.setAttribute('aria-expanded', String(next));
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
        this.toggleAttribute('data-expandable', config.expandable === true);
        this.flowWidth = 0;
        this.root.innerHTML = `
            <style>${CARD_CSS}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div>${cloudsMarkup()}</div>
                    <div class="layer night">${starsMarkup()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line" hidden><span class="context-full"></span><span class="context-short"></span></div>
                    ${config.expandable ? '<i class="grabber" aria-hidden="true"></i>' : ''}
                    <div class="grid">${cells.map(cell => `
                        <div class="metric" data-metric="${cell.key}">
                            <div class="label line"><ha-icon></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span><span class="value-tight"></span><span class="extra extra-tight"></span><span class="value-bare"></span></div>
                        </div>`).join('')}</div>
                </div>
                ${config.expandable ? flowMarkup() : ''}
            </ha-card>`;
        const q = (sel: string, parent: ParentNode = this.root) => parent.querySelector(sel) as HTMLElement;
        this.refs = {
            card: q('ha-card'),
            flow: config.expandable ? this.flowRefs() : undefined,
            heroValue: q('.hero-value'),
            heroUnit: q('.hero-unit'),
            context: q('.context'),
            contextFull: q('.context-full'),
            contextShort: q('.context-short'),
            metrics: new Map(cells.map(cell => {
                const el = q(`[data-metric="${cell.key}"]`);
                const icon = q('ha-icon', el);
                // Set as an attribute, never in markup: a free cell's icon comes from the config
                icon.setAttribute('icon', cell.kind === 'custom' ? cell.custom!.icon || CUSTOM_CELL_ICON : METRIC_ICONS[cell.kind]);
                return [cell.key, { el, icon, label: q('.label-text', el), value: q('.value-main', el), extra: q('.extra-full', el), extraShort: q('.extra-short', el), valueTight: q('.value-tight', el), extraTight: q('.extra-tight', el), valueBare: q('.value-bare', el) }];
            })),
        };
        this.actions = readActions(config, productionEntities(config)[0]);
        const opensEntity = cellTapOpensEntity(config);
        this.cellTargets = new Map(cells.flatMap((cell): [string, { entity?: string; tap?: ActionConfig }][] => {
            const entity = cellEntity(config, cell);
            const tap = isAction(cell.tapAction) ? cell.tapAction : undefined;
            if (tap) return [[cell.key, { entity, tap }]];
            return opensEntity && entity ? [[cell.key, { entity }]] : [];
        }));
        if (config.expandable) {
            const hero = this.refs.heroValue.parentElement as HTMLElement;
            for (const el of [hero, this.refs.context, this.refs.flow!.panel]) {
                el.dataset.cellTarget = '';
                el.dataset.targetKey = 'toggle';
            }
            hero.setAttribute('role', 'button');
            hero.tabIndex = 0;
            hero.setAttribute('aria-controls', 'esc-flow');
            hero.setAttribute('aria-expanded', 'false');
            for (const [key] of NODES) {
                const entity = flowNodeEntity(config, key);
                if (!entity) continue;
                this.cellTargets.set(`node:${key}`, { entity });
                const el = this.refs.flow!.nodes.get(key)!.el;
                el.dataset.cellTarget = '';
                el.setAttribute('role', 'button');
                el.tabIndex = 0;
            }
        }
        for (const [key, target] of this.cellTargets) {
            if (key.startsWith('node:')) continue;
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
        const key = cell?.dataset.node ? `node:${cell.dataset.node}` : cell?.dataset.metric ?? '';
        const target = cell ? this.cellTargets.get(key) : undefined;
        if (!target) return this.actions;
        const { tap_action: _cardTap, ...rest } = this.actions;
        return { ...rest, entity: target.entity ?? this.actions.entity, ...(target.tap ? { tap_action: target.tap } : {}) };
    }

    /**
     * The roomiest layout at which nothing overflows (the hero's line across,
     * the content down): the prototype's spacing with the hero at 56, 48 or
     * 40 px, then the compact spacing (data-compact) at the same sizes.
     * Measured, so it holds for any size, value or language. Then a metric
     * line still too wide (« 100 % ↓ · SOC atteint » on a 320 px phone)
     * switches the complements to their short form (data-short-extra), and
     * one still too wide to the tight form (data-tight-extra: « 100 % ↓ · -13° ✓ »),
     * and
     * a context line too wide at night « Consommation » → « Conso. »
     * (data-short-context).
     */
    fit(): void {
        this.fitLayout();
        this.fitExtras();
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
        const geometry = flowGeometry(width);
        flow.svg.setAttribute('viewBox', `0 0 ${width} ${FLOW_HEIGHT}`);
        flow.box.style.setProperty('--esc-node-w', `${geometry.nodeWidth}px`);
        flow.box.style.setProperty('--esc-centre-w', `${geometry.centreWidth}px`);
        flow.box.toggleAttribute('data-narrow', geometry.nodeWidth < 112);
        for (const [key, wire] of flow.wires) for (const path of wire.paths) path.setAttribute('d', geometry.paths[key]);
        flow.keyframes.textContent = geometry.keyframes;
    }

    /** The flow panel's elements, once built */
    private flowRefs(): NonNullable<Refs['flow']> {
        const q = <T extends Element = HTMLElement>(sel: string, parent: ParentNode = this.root) => parent.querySelector(sel) as unknown as T;
        return {
            panel: q('.panel'),
            box: q('.flow'),
            svg: q<SVGSVGElement>('.wires'),
            keyframes: q<HTMLStyleElement>('style.flow-keyframes'),
            wires: new Map(WIRE_KEYS.map(key => {
                const g = q<SVGGElement>(`[data-wire="${key}"]`);
                return [key, { g, paths: [...g.querySelectorAll('path')] }];
            })),
            nodes: new Map(NODES.map(([key]) => {
                const el = q(`[data-node="${key}"]`);
                return [key, { el, label: q('.nlab', el), value: q('.nval', el), centre: q('.centre', el), segs: [...el.querySelectorAll<SVGCircleElement>('.seg')] }];
            })),
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
            let offset = 0;
            node.segs.forEach((seg, i) => {
                const part = v.ring[i];
                const length = part ? Math.max(RING * part[0] - (v.ring.length > 1 ? 3 : 0), 0) : 0;
                setAttr(seg, 'stroke-dasharray', `${length.toFixed(1)} ${RING.toFixed(1)}`);
                setAttr(seg, 'stroke-dashoffset', (-offset).toFixed(1));
                // Too short to read as an arc (its round caps would make a dot): not drawn
                setAttr(seg, 'data-source', part && length >= 1.5 ? part[1] : '');
                if (part) offset += RING * part[0];
            });
        }
        const off = new Set<WireKey>();
        for (const node of ['grid', 'battery'] as const) if (!view.nodes[node].present) for (const w of WIRES_OF[node]) off.add(w);
        for (const [key, wire] of flow.wires) {
            setAttr(wire.g, 'data-level', String(view.levels[key]));
            setAttr(wire.g, 'data-off', off.has(key) ? '' : null);
        }
    }

    /** Where text sits: the visible words and icons, and the hairline above the grid */
    private textBoxes(): Box[] {
        const root = this.root;
        const boxes: Box[] = [...root.querySelectorAll('.hero-value, .hero-unit, .context-full, .context-short, .label ha-icon, .label-text, .value-main, .extra, .value-tight, .value-bare')]
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

    private fitLayout(): void {
        const refs = this.refs;
        if (!refs) return;
        const content = refs.card.querySelector('.content') as HTMLElement;
        const hero = refs.heroValue.parentElement as HTMLElement;
        const context = refs.context;
        // Side: the context line shares the left column with the hero; it may wrap onto a second line, as a last resort
        const lineHeight = () => parseFloat(getComputedStyle(context).lineHeight) || 20;
        const contextCut = () => this.side && !context.hidden
            && (context.scrollWidth > context.clientWidth + 1 || context.scrollHeight > lineHeight() + 1);
        const overflows = (withContext: boolean) => hero.scrollWidth > hero.clientWidth + 1 || content.scrollHeight > content.clientHeight + 1
            || content.scrollWidth > content.clientWidth + 1 || (withContext && contextCut());
        const sizes = this.side ? SIDE_HERO_SIZES : HERO_SIZES;
        // Side: the cells' column takes the width its lines need, so a long line squeezes the hero; shorten the lines before the hero gets too small
        const extras = this.side ? SIDE_EXTRAS : [[]];
        const attempt = (withContext: boolean): boolean => {
            for (const compact of [false, true]) {
                this.toggleAttribute('data-compact', compact);
                for (const set of extras) {
                    for (const name of EXTRA_ATTRIBUTES) this.toggleAttribute(name, (set as readonly string[]).includes(name));
                    for (const size of sizes) {
                        if (size === sizes[0]) this.removeAttribute('data-hero');
                        else this.setAttribute('data-hero', String(size));
                        if (!overflows(withContext)) return true;
                    }
                }
            }
            return false;
        };
        if (!this.side) {
            attempt(false);
            return;
        }
        // Side: the context line in full on one line, else its short form on one line,
        // else in full on two lines (the short form if even two lines are too few)
        this.removeAttribute('data-short-context');
        if (attempt(true)) return;
        this.setAttribute('data-short-context', '');
        if (attempt(true)) return;
        this.removeAttribute('data-short-context');
        attempt(false);
        if (!context.hidden && context.scrollHeight > context.clientHeight + 1) this.setAttribute('data-short-context', '');
    }

    private fitExtras(): void {
        if (!this.refs) return;
        // Side: fitLayout already chose the context's and the cells' forms
        if (this.side) return;
        const tooWide = (l: HTMLElement) => l.scrollWidth > l.clientWidth + 1;
        this.removeAttribute('data-short-context');
        if (!this.refs.context.hidden && tooWide(this.refs.context)) this.setAttribute('data-short-context', '');
        for (const name of EXTRA_ATTRIBUTES) this.removeAttribute(name);
        const lines = [...this.refs.metrics.values()].map(m => m.value.parentElement as HTMLElement);
        if (lines.some(tooWide)) this.setAttribute('data-short-extra', '');
        if (lines.some(tooWide)) this.setAttribute('data-tight-extra', '');
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

        const view = buildView(this.config, this._hass);
        const refs = this.refs;
        this.paintSky();
        const before = this.fitSensitiveText();
        setText(refs.heroValue, view.hero.value);
        setText(refs.heroUnit, view.hero.unit);
        refs.context.hidden = view.context === undefined;
        setText(refs.contextFull, view.context ?? '');
        setText(refs.contextShort, view.contextShort ?? '');
        for (const metric of view.metrics) {
            const el = refs.metrics.get(metric.key);
            if (!el) continue;
            setText(el.label, metric.label);
            // Side: the icon stands for the label, which shows on hover
            if (this.side && el.el.title !== metric.label) el.el.title = metric.label;
            setText(el.value, metric.value);
            setText(el.extra, metric.extra);
            setText(el.extraShort, metric.extraShort);
            // Only a cell with a tight form gets one (data-tight on its line)
            setText(el.valueTight, metric.tight?.value ?? '');
            setText(el.extraTight, metric.tight?.extra ?? '');
            el.value.parentElement!.toggleAttribute('data-tight', !!metric.tight);
            setText(el.valueBare, metric.bare ?? '');
            el.value.parentElement!.toggleAttribute('data-bare', !!metric.bare);
            if (metric.icon && el.icon.getAttribute('icon') !== metric.icon) el.icon.setAttribute('icon', metric.icon);
        }
        this.updateFlow();
        // A longer hero ("12,3 kW" after "8 W") or metric may not fit any more
        if (before !== this.fitSensitiveText()) this.fit();
    }

    /** The text whose length decides the layout: the hero and the metric lines */
    private fitSensitiveText(): string {
        const refs = this.refs!;
        return [refs.heroValue, refs.heroUnit, refs.contextFull, ...[...refs.metrics.values()].flatMap(m => [m.value, m.extra])]
            .map(el => el.textContent).join('|');
    }

    /** The background: day or night, the tariff colours, the halo's strength */
    private paintSky(): void {
        const bg = computeBackground(this.config!, this._hass!);
        const card = this.refs!.card;
        this.dataset.mode = bg.mode;
        this.toggleAttribute('data-producing', bg.producing);
        bg.palette.forEach((colour, i) => card.style.setProperty(`--esc-c${i}`, colour));
        card.style.setProperty('--esc-halo-alpha', String(bg.haloAlpha));
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
        if (this.config?.expandable) return { columns: 12, rows: 'auto' as const, min_columns: 6 };
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
function flowMarkup(): string {
    const comets = [1, 2, 3].map(n => `<g class="comet c${n}"><circle cx="-8" r="1.3" opacity="0.25"></circle><circle cx="-4" r="1.8" opacity="0.5"></circle><circle r="2.5"></circle></g>`).join('');
    const wires = WIRE_KEYS.map(key => `<g class="wire ${WIRES[key]}" data-wire="${key}" data-level="0"><path class="glow"></path><path class="line"></path>${comets}</g>`).join('');
    const nodes = NODES.map(([key, icon]) => `
        <div class="node" data-node="${key}">
            <span class="disc"><svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="track" cx="20" cy="20" r="17"></circle>${'<circle class="seg" cx="20" cy="20" r="17"></circle>'.repeat(3)}</svg><ha-icon icon="${icon}"></ha-icon><span class="centre"></span></span>
            <span class="ntext"><span class="nlab line"></span><span class="nval line"></span></span>
        </div>`).join('');
    return `<div class="panel" id="esc-flow" hidden><style class="flow-keyframes"></style><div class="flow"><svg class="wires" aria-hidden="true" viewBox="0 0 400 ${FLOW_HEIGHT}">${wires}</svg>${nodes}</div></div>`;
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
