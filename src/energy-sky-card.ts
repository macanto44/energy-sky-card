// Energy Sky Card — the card element: a plain HTMLElement with a shadow root.

import { CARD_NAME, CARD_EDITOR_NAME, CARD_DISPLAY_NAME, CARD_DESCRIPTION, CARD_DOC_URL, CARD_VERSION } from './constants';
import { loadEditorBundle } from './bundles';
import { CARD_CSS } from './styles/card';
import { METRIC_ICONS, buildView, configuredMetrics, normalizeConfig, trackedEntities, type MetricKey } from './model';
import { cardLanguage } from './localize';
import { computeBackground, isHexColor } from './sky';
import { starsMarkup } from './stars';
import { MotionController } from './motion';
import { listenForGestures, readActions, updateTargetSemantics, type ActionsConfig } from './actions';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

/** The hero's sizes, largest first: it steps down until the card's lines fit */
export const HERO_SIZES = [56, 48, 40] as const;

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
    if (typeof c.production_entity !== 'string' || !c.production_entity) {
        throw configError('production_entity est obligatoire', 'production_entity is required');
    }
    const lists: [string, unknown][] = [
        ['daily_production_entities', c.daily_production_entities],
        ['battery.soc_reached_entities', c.battery?.soc_reached_entities],
        ['grid.outage_states', c.grid?.outage_states],
    ];
    for (const [name, value] of lists) {
        if (!isStringList(value)) throw configError(`${name} doit être une liste`, `${name} must be a list`);
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
    metrics: Map<MetricKey, { label: HTMLElement; value: HTMLElement; extra: HTMLElement; extraShort: HTMLElement }>;
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
    private resizeObserver?: ResizeObserver;
    private readyFrame?: number;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }

    setConfig(config: EnergySkyCardConfig): void {
        this.config = validateConfig(config);
        this.build();
        this.renderedKey = '';
        this.removeAttribute('data-ready');
        this.motion.setAnimate(this.config.animate !== false);
        if (this._hass) this.update();
    }

    connectedCallback(): void {
        this.motion.start();
        if (this.refs && this.resizeObserver) this.resizeObserver.observe(this.refs.card);
        this.fit();
    }

    disconnectedCallback(): void {
        this.motion.stop();
        this.resizeObserver?.disconnect();
        if (this.readyFrame !== undefined) cancelAnimationFrame(this.readyFrame);
        this.readyFrame = undefined;
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
        const metrics = configuredMetrics(config);
        this.root.innerHTML = `
            <style>${CARD_CSS}</style>
            <ha-card>
                <div class="sky" aria-hidden="true">
                    <div class="layer day"><div class="halo"></div></div>
                    <div class="layer night">${starsMarkup()}</div>
                </div>
                <div class="content">
                    <div class="hero line"><span class="hero-value"></span><span class="hero-unit"></span></div>
                    <div class="context line"${config.daily_production_entities?.length ? '' : ' hidden'}></div>
                    <div class="grid">${metrics.map(key => `
                        <div class="metric" data-metric="${key}">
                            <div class="label line"><ha-icon icon="${METRIC_ICONS[key]}"></ha-icon><span class="label-text"></span></div>
                            <div class="value line"><span class="value-main"></span><span class="extra extra-full"></span><span class="extra extra-short"></span></div>
                        </div>`).join('')}</div>
                </div>
            </ha-card>`;
        const q = (sel: string, parent: ParentNode = this.root) => parent.querySelector(sel) as HTMLElement;
        this.refs = {
            card: q('ha-card'),
            heroValue: q('.hero-value'),
            heroUnit: q('.hero-unit'),
            context: q('.context'),
            metrics: new Map(metrics.map(key => {
                const el = q(`[data-metric="${key}"]`);
                return [key, { label: q('.label-text', el), value: q('.value-main', el), extra: q('.extra-full', el), extraShort: q('.extra-short', el) }];
            })),
        };
        this.actions = readActions(config, config.production_entity);
        listenForGestures(this.refs.card, this, () => this.actions);
        updateTargetSemantics(this.refs.card, this.actions);
        this.resizeObserver?.disconnect();
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => this.fit());
            this.resizeObserver.observe(this.refs.card);
        }
    }

    /**
     * The roomiest layout at which nothing overflows (the hero's line across,
     * the content down): the prototype's spacing with the hero at 56, 48 or
     * 40 px, then the compact spacing (data-compact) at the same sizes.
     * Measured, so it holds for any size, value or language. Then a metric
     * line still too wide (« 100 % ↓ · SOC atteint » on a 320 px phone)
     * switches the complements to their short form (data-short-extra).
     */
    fit(): void {
        this.fitLayout();
        this.fitExtras();
    }

    private fitLayout(): void {
        const refs = this.refs;
        if (!refs) return;
        const content = refs.card.querySelector('.content') as HTMLElement;
        const hero = refs.heroValue.parentElement as HTMLElement;
        const overflows = () => hero.scrollWidth > hero.clientWidth + 1 || content.scrollHeight > content.clientHeight + 1;
        for (const compact of [false, true]) {
            this.toggleAttribute('data-compact', compact);
            for (const size of HERO_SIZES) {
                if (size === HERO_SIZES[0]) this.removeAttribute('data-hero');
                else this.setAttribute('data-hero', String(size));
                if (!overflows()) return;
            }
        }
    }

    private fitExtras(): void {
        if (!this.refs) return;
        this.removeAttribute('data-short-extra');
        const lines = [...this.refs.metrics.values()].map(m => m.value.parentElement as HTMLElement);
        if (lines.some(l => l.scrollWidth > l.clientWidth + 1)) this.setAttribute('data-short-extra', '');
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
        if (view.context !== undefined) setText(refs.context, view.context);
        for (const metric of view.metrics) {
            const el = refs.metrics.get(metric.key);
            if (!el) continue;
            setText(el.label, metric.label);
            setText(el.value, metric.value);
            setText(el.extra, metric.extra);
            setText(el.extraShort, metric.extraShort);
        }
        // A longer hero ("12,3 kW" after "8 W") or metric may not fit any more
        if (before !== this.fitSensitiveText()) this.fit();
    }

    /** The text whose length decides the layout: the hero and the metric lines */
    private fitSensitiveText(): string {
        const refs = this.refs!;
        return [refs.heroValue, refs.heroUnit, ...[...refs.metrics.values()].flatMap(m => [m.value, m.extra])]
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

    /** Sections view: full width, four rows (248 px), never under three */
    getGridOptions() {
        return { columns: 12, rows: 4, min_columns: 6, min_rows: 3 };
    }

    getCardSize(): number {
        return 4;
    }

    /** Prefill with the first power sensor found, and sun.sun */
    static getStubConfig(hass?: HomeAssistant): Partial<EnergySkyCardConfig> {
        const states = hass?.states ?? {};
        const power = Object.values(states).find(s =>
            s.entity_id.startsWith('sensor.') &&
            (s.attributes.device_class === 'power' || s.attributes.unit_of_measurement === 'W'));
        return { production_entity: power?.entity_id ?? 'sensor.production_pv', sun_entity: 'sun.sun' };
    }

    /** The editor lives in its own bundle, loaded the first time it's opened */
    static async getConfigElement(): Promise<HTMLElement> {
        if (!customElements.get(CARD_EDITOR_NAME)) await loadEditorBundle();
        return document.createElement(CARD_EDITOR_NAME);
    }
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
