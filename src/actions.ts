// Gestures on the card: tap, hold and double tap, handed to Home Assistant.

/** A Home Assistant card action (navigate, more-info, perform-action, url, none, …) */
export interface ActionConfig {
    action: string;
    [key: string]: unknown;
}

/** The payload Home Assistant's hass-action expects: the entity and the three actions */
export interface ActionsConfig {
    entity?: string;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export type Gesture = 'tap' | 'hold' | 'double_tap';

/** A press at least this long is a hold */
export const HOLD_MS = 500;
/** A second tap within this delay makes a double tap */
export const DOUBLE_TAP_MS = 250;
/** Moving farther than this while pressed means scrolling: no gesture */
const SLOP_PX = 10;

const isAction = (v: unknown): v is ActionConfig =>
    typeof v === 'object' && v !== null && typeof (v as { action?: unknown }).action === 'string';

const active = (a: ActionConfig | undefined): boolean => a !== undefined && a.action !== 'none';

/** Pick the three gesture actions out of a card config; anything malformed is ignored */
export function readActions(config: object | undefined, entity: string | undefined): ActionsConfig {
    const source = (config ?? {}) as Record<string, unknown>;
    const result: ActionsConfig = { entity };
    for (const key of ['tap_action', 'hold_action', 'double_tap_action'] as const) {
        if (isAction(source[key])) result[key] = source[key] as ActionConfig;
    }
    return result;
}

/** Whether a tap leads anywhere: an explicit action, or the entity's dialog by default */
export function tapIsActive(config: ActionsConfig): boolean {
    return config.tap_action === undefined ? Boolean(config.entity) : active(config.tap_action);
}

function emit(host: HTMLElement, type: string, detail: unknown): void {
    host.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

/**
 * Run a gesture. With no tap_action, a tap opens the entity's dialog.
 * Otherwise a configured action goes to Home Assistant through hass-action,
 * which handles every action type (a navigate to '#popup-…' opens a Bubble
 * Card pop-up). Unset hold and double tap do nothing.
 */
export function runGesture(host: HTMLElement, config: ActionsConfig, gesture: Gesture): void {
    const action = config[`${gesture}_action` as const];
    if (action === undefined) {
        if (gesture === 'tap' && config.entity) emit(host, 'hass-more-info', { entityId: config.entity });
        return;
    }
    if (active(action)) emit(host, 'hass-action', { config, action: gesture });
}

/**
 * Listens to one element and turns pointer and keyboard input into
 * gestures. The config is read through a getter at every gesture, so a new
 * config needs no new listeners.
 */
class GestureListener {
    private origin: { x: number; y: number } | null = null;
    private holdFired = false;
    private holdTimer?: ReturnType<typeof setTimeout>;
    private pendingTap?: ReturnType<typeof setTimeout>;

    constructor(private el: HTMLElement, private host: HTMLElement, private config: () => ActionsConfig) {
        el.addEventListener('pointerdown', e => this.down(e));
        el.addEventListener('pointermove', e => this.move(e));
        el.addEventListener('pointerup', () => this.up());
        el.addEventListener('pointercancel', () => this.reset());
        el.addEventListener('pointerleave', () => this.reset());
        el.addEventListener('keydown', e => this.key(e));
        el.addEventListener('contextmenu', e => {
            if (active(this.config().hold_action)) e.preventDefault();
        });
    }

    private down(e: PointerEvent): void {
        if (e.button !== 0) return;
        this.reset();
        this.origin = { x: e.clientX, y: e.clientY };
        this.holdFired = false;
        if (!active(this.config().hold_action)) return;
        this.holdTimer = setTimeout(() => {
            this.holdTimer = undefined;
            this.holdFired = true;
            runGesture(this.host, this.config(), 'hold');
        }, HOLD_MS);
    }

    private move(e: PointerEvent): void {
        if (!this.origin) return;
        const dx = e.clientX - this.origin.x;
        const dy = e.clientY - this.origin.y;
        if (dx * dx + dy * dy > SLOP_PX * SLOP_PX) this.reset();
    }

    private up(): void {
        const wasTap = this.origin !== null && !this.holdFired;
        this.reset();
        if (wasTap) this.tap();
    }

    private reset(): void {
        this.origin = null;
        if (this.holdTimer !== undefined) clearTimeout(this.holdTimer);
        this.holdTimer = undefined;
    }

    /** Without a double tap configured, a tap fires at once; with one, it waits to see if a second follows */
    private tap(): void {
        const config = this.config();
        if (!active(config.double_tap_action)) {
            runGesture(this.host, config, 'tap');
            return;
        }
        if (this.pendingTap !== undefined) {
            clearTimeout(this.pendingTap);
            this.pendingTap = undefined;
            runGesture(this.host, config, 'double_tap');
            return;
        }
        this.pendingTap = setTimeout(() => {
            this.pendingTap = undefined;
            runGesture(this.host, this.config(), 'tap');
        }, DOUBLE_TAP_MS);
    }

    private key(e: KeyboardEvent): void {
        if (e.target !== this.el || (e.key !== 'Enter' && e.key !== ' ')) return;
        if (!tapIsActive(this.config())) return;
        e.preventDefault();
        runGesture(this.host, this.config(), 'tap');
    }
}

const listening = new WeakSet<HTMLElement>();

/** Make an element the card's touch target (once per element) */
export function listenForGestures(el: HTMLElement, host: HTMLElement, config: () => ActionsConfig): void {
    if (listening.has(el)) return;
    listening.add(el);
    new GestureListener(el, host, config);
}

/** Button semantics while a tap does something; no text selection under a long press */
export function updateTargetSemantics(el: HTMLElement, config: ActionsConfig): void {
    const clickable = tapIsActive(config);
    if (clickable) {
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
    } else {
        el.removeAttribute('role');
        el.removeAttribute('tabindex');
    }
    el.style.cursor = clickable ? 'pointer' : '';
    const noSelect = active(config.hold_action) ? 'none' : '';
    el.style.userSelect = noSelect;
    el.style.setProperty('-webkit-user-select', noSelect);
    el.style.setProperty('-webkit-touch-callout', noSelect);
}
