// The energy flow (flow: tap or always) between the sun,
// the grid, the battery and the home. Pure: powers → flows → what each node
// and wire shows, and the drawing's geometry for a width.

import { DEFAULT_POWER_THRESHOLD, MAX_CONSUMERS, batteryPower, batteryPowerEntities, batterySoc, batterySocEntities, gridOutage, gridPower, gridPowerEntities, productionEntities, productionPower, viewEstimate, type ViewOptions } from './model';
import { NO_VALUE, formatNumber, formatPercent, formatPower } from './format';
import { boughtShare, homeUse, type DayTotals } from './selfsufficiency';
import { localize, numberLocale, type NumberLocale } from './localize';
import { numericState, powerW } from './utils';
import { DEFAULT_PRODUCTION_MAX } from './sky';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

/** A wire: sun → home, sun → grid, sun → battery, grid → home, battery → home, grid → battery, battery → grid */
export type WireKey = 'sh' | 'sg' | 'sb' | 'gh' | 'bh' | 'gb' | 'bg';
/** Where the energy on a wire comes from: its colour */
export type Source = 'sun' | 'grid' | 'batt';
export type NodeKey = 'solar' | 'grid' | 'battery' | 'home';

export const WIRES: Record<WireKey, Source> = { sh: 'sun', sg: 'sun', sb: 'sun', gh: 'grid', bh: 'batt', gb: 'grid', bg: 'batt' };
/** The nodes each wire joins (a wire goes when either is missing) */
const WIRE_ENDS: Record<WireKey, [NodeKey, NodeKey]> = {
    sh: ['solar', 'home'], sg: ['solar', 'grid'], sb: ['solar', 'battery'], gh: ['grid', 'home'],
    bh: ['battery', 'home'], gb: ['grid', 'battery'], bg: ['battery', 'grid'],
};
export const WIRE_KEYS = Object.keys(WIRES) as WireKey[];

/** Below this a wire carries nothing (W) */
export const FLOW_MIN_W = 20;

export interface Flows {
    /** W on each wire, never negative */
    wires: Record<WireKey, number>;
    /** The home's power: the consumption sensor's, else what flows into it */
    home: number | undefined;
}

const pos = (v: number | undefined) => Math.max(v ?? 0, 0);

/**
 * Split the powers into flows. grid is positive when importing, battery
 * positive when charging (the card's conventions). Each source hands out
 * exactly what it gives, and each sink gets exactly what it takes:
 * - what is exported comes from the sun first, the rest from the battery;
 * - what charges the battery comes from the sun (what it has left), the
 *   rest from the grid (an off-peak charge, at night or on a dull day);
 * - the home gets what is left of the sun, the import and the discharge.
 * So home = sun + import + discharge − export − charge, as the meters say.
 */
export function energyFlows(solar: number | undefined, grid: number | undefined, battery: number | undefined, consumption: number | undefined): Flows {
    let sun = pos(solar);
    const exported = pos(grid === undefined ? undefined : -grid);
    const imported = pos(grid);
    const charge = pos(battery);
    const discharge = pos(battery === undefined ? undefined : -battery);
    const sg = Math.min(exported, sun);
    sun -= sg;
    const bg = Math.min(exported - sg, discharge);
    const sb = Math.min(charge, sun);
    sun -= sb;
    const gb = Math.min(charge - sb, imported);
    const wires: Record<WireKey, number> = { sh: sun, sg, sb, gh: imported - gb, bh: discharge - bg, gb, bg };
    for (const key of WIRE_KEYS) if (wires[key] < FLOW_MIN_W) wires[key] = 0;
    const known = solar !== undefined || grid !== undefined || battery !== undefined;
    return { wires, home: consumption ?? (known ? wires.sh + wires.gh + wires.bh : undefined) };
}

/** How busy a wire looks: 0 nothing (dotted), then thicker, more and faster comets */
export function flowLevel(watts: number): 0 | 1 | 2 | 3 | 4 {
    if (watts < FLOW_MIN_W) return 0;
    if (watts < 500) return 1;
    if (watts < 1500) return 2;
    if (watts < 3000) return 3;
    return 4;
}

export interface NodeView {
    present: boolean;
    label: string;
    value: string;
    /** The value where it doesn't fit: narrow spaces, and kWh from 10 on without their decimal (« 19 kWh ») */
    valueShort?: string;
    /** Ring segments around the icon, as fractions of the circle, each with its colour's source */
    ring: [number, Source | 'alert'][];
    /** Text in the disc instead of the icon (the battery's charge) */
    centre?: string;
    /** Something's wrong: the grid is down */
    alert?: boolean;
    /** The battery full and resting: a golden sheen crosses its node */
    full?: boolean;
    /** A third, small line: the battery's estimate, its sentence « Pleine à 14:20 » */
    sub?: string;
    /** The same where the sentence doesn't fit: the charge reached and when, « → 100 % 14:20 » */
    subShort?: string;
    /** Its sentence, for the node's title: « Pleine à 14:20 » */
    note?: string;
}

/** The battery node's estimate (unless estimate.flow is false): its line under the power, and its sentence */
function batteryNote(config: EnergySkyCardConfig, hass: HomeAssistant, loc: NumberLocale, options: ViewOptions): Pick<NodeView, 'sub' | 'subShort' | 'note'> {
    const estimate = config.battery?.estimate?.flow === false ? undefined : viewEstimate(config, hass, loc, options);
    return estimate ? { sub: estimate.title, subShort: `→\u202F${formatPercent(estimate.target, loc)}\u00a0${estimate.text}`, note: estimate.title } : {};
}

/** The entity a node opens: the first production sensor, grid power, battery power (else its charge), consumption */
export function flowNodeEntity(config: EnergySkyCardConfig, node: NodeKey): string | undefined {
    switch (node) {
        case 'solar': return productionEntities(config)[0];
        case 'grid': return gridPowerEntities(config)[0];
        case 'battery': return batteryPowerEntities(config)[0] ?? batterySocEntities(config)[0];
        case 'home': return config.consumption_entity;
    }
}

/** An appliance beside the home */
export interface ConsumerView {
    label: string;
    icon: string;
    value: string;
    /** Its share of the home's power, 0 … 1 (its ring) */
    share: number;
    /** The value where it doesn't fit (kWh) */
    valueShort?: string;
    level: 0 | 1 | 2 | 3 | 4;
    /** In the flow: its power reaches consumer_threshold (with 0, or always_show, always) */
    shown: boolean;
    /** Its charge (%), with a soc_entity: the ring and the number in the disc instead of its share */
    soc?: number;
}

export { MAX_CONSUMERS };
export const CONSUMER_ICON = 'mdi:power-plug-outline';
/** Below this power (W) an appliance leaves the flow, unless consumer_threshold says otherwise */
export const DEFAULT_CONSUMER_THRESHOLD = 10;

export interface FlowView {
    nodes: Record<NodeKey, NodeView>;
    consumers: ConsumerView[];
    levels: Record<WireKey, 0 | 1 | 2 | 3 | 4>;
    /** Wires not drawn: one of their nodes is missing */
    off: WireKey[];
}

export function flowView(config: EnergySkyCardConfig, hass: HomeAssistant, options: ViewOptions = {}): FlowView {
    const loc = numberLocale(hass);
    const solar = productionPower(config, hass);
    // A grid outage moves nothing through the grid, whatever its sensor says
    const outage = gridOutage(config, hass);
    const grid = outage ? 0 : gridPower(config, hass);
    const measured = batteryPower(config, hass);
    // A battery idling within its threshold (no arrow in its cell) moves no energy either
    const threshold = config.battery?.power_threshold ?? DEFAULT_POWER_THRESHOLD;
    const battery = measured !== undefined && Math.abs(measured) <= threshold ? 0 : measured;
    const consumption = powerW(hass.states[config.consumption_entity ?? '']);
    const flows = energyFlows(solar, grid, battery, consumption);
    const max = config.production_max && config.production_max > 0 ? config.production_max : DEFAULT_PRODUCTION_MAX;
    const soc = batterySoc(config, hass);
    const into = { sun: flows.wires.sh, grid: flows.wires.gh, batt: flows.wires.bh };
    const total = into.sun + into.grid + into.batt;
    // The sun and the home are always there (the home worked out if need be); the grid and the battery with their entity
    const present = (node: NodeKey) => node === 'solar' || node === 'home' || !!flowNodeEntity(config, node);
    const levels = Object.fromEntries(WIRE_KEYS.map(k => [k, flowLevel(flows.wires[k])])) as FlowView['levels'];
    return {
        nodes: {
            solar: {
                present: present('solar'), label: localize(loc.lang, 'solar'), value: formatPower(solar, loc),
                ring: [[Math.min(pos(solar) / max, 1), 'sun']],
            },
            grid: {
                present: present('grid'), label: localize(loc.lang, 'grid'),
                value: outage ? localize(loc.lang, 'outage') : formatPower(grid, loc),
                ring: outage ? [[1, 'alert']] : [], alert: outage,
            },
            battery: {
                present: present('battery'), label: localize(loc.lang, 'battery'), ...batteryNote(config, hass, loc, options),
                value: batteryPowerEntities(config).length ? formatPower(measured, loc) : formatPercent(soc, loc),
                ring: soc === undefined ? [] : [[Math.min(Math.max(soc, 0), 100) / 100, 'batt']],
                centre: soc === undefined ? undefined : String(Math.round(soc)),
                full: soc !== undefined && soc >= 99 && !battery,
            },
            home: {
                present: present('home'), label: localize(loc.lang, 'home'), value: formatPower(flows.home, loc),
                ring: total > 0 ? (['sun', 'batt', 'grid'] as const).filter(s => into[s] > 0).map(s => [into[s] / total, s]) : [],
            },
        },
        consumers: (config.consumers ?? []).slice(0, MAX_CONSUMERS).map(c => {
            const entity = hass.states[c.entity];
            const reading = powerW(entity);
            const power = pos(reading);
            const threshold = config.consumer_threshold ?? DEFAULT_CONSUMER_THRESHOLD;
            const own = (key: string) => typeof entity?.attributes[key] === 'string' ? entity.attributes[key] as string : undefined;
            const soc = c.soc_entity ? numericState(hass.states[c.soc_entity]) : undefined;
            return {
                label: c.name || own('friendly_name') || c.entity,
                icon: c.icon || own('icon') || CONSUMER_ICON,
                value: formatPower(powerW(entity), loc),
                share: flows.home ? Math.min(power / flows.home, 1) : 0,
                level: flowLevel(power),
                shown: threshold <= 0 || !!c.always_show || (reading !== undefined && power >= threshold),
                ...(soc === undefined ? {} : { soc: Math.min(Math.max(soc, 0), 100) }),
            };
        }),
        levels,
        off: WIRE_KEYS.filter(k => !WIRE_ENDS[k].every(present)),
    };
}

/** Today's energies, for the flow in kWh: the meters' totals, and each appliance's energy_entity since midnight */
export interface DayEnergy {
    totals: DayTotals;
    consumers: (number | undefined)[];
}

/**
 * Energies (kWh) as a node's value: « 4,2 · 6,1 kWh » (one figure, or two
 * for what comes in and goes out), « — » for a missing one; and the short
 * form, narrow spaces and no decimal from 10 kWh on (« 19 kWh »).
 */
export function energyText(values: (number | undefined)[], loc: NumberLocale): [string, string] {
    // Nothing read, or under 0.05 kWh (« 0,0 »): « — », lighter than a zero.
    const none = (v: number | undefined) => v === undefined || !Number.isFinite(v) || Math.abs(v) < 0.05;
    if (values.every(none)) return [NO_VALUE, NO_VALUE];
    const text = (short: boolean) => {
        const figures = values.map(v => none(v) ? NO_VALUE
            : short && Math.abs(v!) >= 9.95 ? formatNumber(Math.round(v!), 0, loc) : formatNumber(v!, 1, loc));
        return short ? `${figures.join('\u202F·\u202F')}\u202FkWh` : `${figures.join(' · ')} kWh`;
    };
    return [text(false), text(true)];
}

/**
 * The flow in kWh: the live view (its wires, which nodes are there, the
 * battery's charge, an outage) with today's energies in the nodes. The
 * grid's two figures are bought · sold, the battery's charged · discharged,
 * named by their small line (the battery's estimate gives way). The home's
 * ring is the day's self-sufficiency (the share not bought, in the sun's
 * colour); an appliance's, its share of the home's day; every appliance
 * shows, its figure « — » without an energy_entity.
 */
export function energyView(live: FlowView, config: EnergySkyCardConfig, hass: HomeAssistant, day: DayEnergy | undefined): FlowView {
    const loc = numberLocale(hass);
    const t = day?.totals ?? {};
    const used = homeUse(t);
    const bought = boughtShare(t);
    const node = (key: NodeKey, values: (number | undefined)[], extra: Partial<NodeView> = {}): NodeView => {
        const [value, valueShort] = energyText(values, loc);
        const { sub: _sub, subShort: _short, note: _note, ...rest } = live.nodes[key];
        return { ...rest, value, valueShort, ...extra };
    };
    return {
        ...live,
        nodes: {
            solar: node('solar', [t.solar], { ring: (t.solar ?? 0) > 0 ? [[1, 'sun']] : [] }),
            grid: node('grid', [t.from_grid, t.to_grid], {
                sub: localize(loc.lang, 'bought_sold'), subShort: localize(loc.lang, 'bought_sold_short'),
            }),
            battery: node('battery', [t.to_battery, t.from_battery], {
                sub: localize(loc.lang, 'charged_discharged'), subShort: localize(loc.lang, 'charged_discharged_short'),
            }),
            home: node('home', [used], {
                ring: bought === undefined ? [] : ([[1 - bought, 'sun'], [bought, 'grid']] as [number, Source][]).filter(([share]) => share > 0),
            }),
        },
        consumers: live.consumers.map((c, i) => {
            const kwh = config.consumers?.[i]?.energy_entity ? day?.consumers[i] : undefined;
            const [value, valueShort] = energyText([kwh], loc);
            return {
                ...c, value, valueShort, shown: true,
                share: used && kwh !== undefined ? Math.min(Math.max(kwh, 0) / used, 1) : 0,
                level: kwh !== undefined && kwh > 0 ? (c.level || 1) : 0,
            };
        }),
    };
}

/** The drawing is this tall (px); its width is the panel's */
export const FLOW_HEIGHT = 220;
/** Taller on a wide card, so it keeps its shape: this share of the width, between FLOW_HEIGHT and FLOW_MAX_HEIGHT */
export const FLOW_ASPECT = 0.65;
export const FLOW_MAX_HEIGHT = 360;
export const NODE_HEIGHT = 46;
const SAMPLES = 12;

export interface FlowGeometry {
    /** The sun's and the home's width (they share the middle row) */
    nodeWidth: number;
    /** The grid's and the battery's (alone on their rows: wider, while the curves keep some length) */
    centreWidth: number;
    paths: Record<WireKey, string>;
    /** The drawing's height for this width */
    height: number;
    /** The appliances, in the config's order */
    consumers: ConsumerPlace[];
    /** One @keyframes per wire, esc-flow-<key> (esc-flow-c<n> for an appliance's): a comet along it (transform only) */
    keyframes: string;
}

/** Where an appliance sits: a whole node, or compact (its icon and power) when there are more than two or little room */
export interface ConsumerPlace {
    /** Shown: a phone's narrow corners hold one each */
    visible: boolean;
    compact: boolean;
    below: boolean;
    left: number;
    top: number;
    width: number;
    /** Its wire, from the home */
    path: string;
}

/** A compact appliance's width */
export const COMPACT_WIDTH = 46;

type Pt = [number, number];

/** A wire: straight (no controls) or a cubic curve (two controls) */
type Seg = [Pt, [Pt, Pt] | null, Pt];

/** A point and the direction along a straight or cubic segment */
function along([p0, c, p1]: Seg, t: number): { at: Pt; deg: number } {
    if (!c) return { at: [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t], deg: Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI };
    const [c1, c2] = c, u = 1 - t;
    const point = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * p1[i];
    const slope = (i: 0 | 1) => 3 * u * u * (c1[i] - p0[i]) + 6 * u * t * (c2[i] - c1[i]) + 3 * t * t * (p1[i] - c2[i]);
    return { at: [point(0), point(1)], deg: Math.atan2(slope(1), slope(0)) * 180 / Math.PI };
}

const r1 = (v: number) => Math.round(v * 10) / 10;
const pt = ([x, y]: Pt) => `${r1(x)},${r1(y)}`;

/** How far in from a node's end a curve leaves its edge (past the rounded end, on the flat) */
export const WIRE_INSET = 27;

/**
 * Where everything sits for a panel `width` px wide: the sun on the left,
 * the home on the right (a straight wire between), the grid above and the
 * battery below in the middle. The other wires join the edges that face
 * each other (the sun's top to the grid's bottom…) with an S curve that
 * stays inside, between the rows: the four corners are left free. The
 * grid ↔ battery link runs straight down the middle.
 */
export function flowGeometry(width: number, consumers = 0): FlowGeometry {
    const W = Math.max(width, 160);
    const nodeWidth = Math.round(Math.min(Math.max((W - 48) / 2, 96), 128));
    const centreWidth = Math.round(Math.min(nodeWidth + 20, W - nodeWidth - 32));
    const H = Math.round(Math.min(Math.max(W * FLOW_ASPECT, FLOW_HEIGHT), FLOW_MAX_HEIGHT));
    const chalf = centreWidth / 2, r = NODE_HEIGHT / 2, mid = H / 2;
    const top = 3 + r, bottom = H - 3 - r, cx = W / 2;
    // The facing edges: the sun's and the home's inner ends, the grid's and the battery's outer ends
    const sunIn = nodeWidth - WIRE_INSET, homeIn = W - nodeWidth + WIRE_INSET;
    const centreLeft = cx - chalf + WIRE_INSET, centreRight = cx + chalf - WIRE_INSET;
    /** An S curve between two horizontal edges, leaving and arriving straight up or down */
    const s = (from: Pt, to: Pt): Seg => {
        const k = (to[1] - from[1]) / 2;
        return [from, [[from[0], from[1] + k], [to[0], to[1] - k]], to];
    };
    const segs: Record<string, Seg> = {
        sh: [[nodeWidth, mid], null, [W - nodeWidth, mid]],
        sg: s([sunIn, mid - r], [centreLeft, top + r]),
        gh: s([centreRight, top + r], [homeIn, mid - r]),
        sb: s([sunIn, mid + r], [centreLeft, bottom - r]),
        bh: s([centreRight, bottom - r], [homeIn, mid + r]),
        gb: [[cx, top + r], null, [cx, bottom - r]],
        bg: [[cx, bottom - r], null, [cx, top + r]],
    };
    // The appliances, in the corners right of the grid (above the home) and of the battery (below)
    const corner = W - (cx + chalf) - 8;
    const compact = consumers > 2 || corner < 110;
    const perSide = compact && corner < 100 ? 1 : 2;
    const places: ConsumerPlace[] = [];
    for (let i = 0; i < consumers; i++) {
        const below = i % 2 === 1, rank = Math.floor(i / 2);
        const onSide = Math.min(below ? Math.floor(consumers / 2) : Math.ceil(consumers / 2), perSide);
        const rowTop = below ? H - 3 - NODE_HEIGHT : 3;
        const homeEdge = below ? mid + r : mid - r, nodeEdge = below ? rowTop : rowTop + NODE_HEIGHT;
        if (rank >= perSide) {
            places.push({ visible: false, compact, below, left: 0, top: rowTop, width: 0, path: '' });
            continue;
        }
        let left: number, w: number;
        if (compact) {
            const slot = corner / onSide, centre = W - corner + slot * (rank + 0.5) + 4;
            w = COMPACT_WIDTH;
            left = centre - w / 2;
            segs[`c${i}`] = s([W - nodeWidth / 2 + (onSide > 1 ? (rank - 0.5) * 30 : 10), homeEdge], [centre, nodeEdge]);
        } else {
            w = Math.min(nodeWidth, corner);
            left = W - w;
            const x = left + w / 2 + 10;
            segs[`c${i}`] = [[x, homeEdge], null, [x, nodeEdge]];
        }
        places.push({ visible: true, compact, below, left: r1(left), top: rowTop, width: r1(w), path: '' });
    }
    const paths = {} as Record<string, string>;
    let keyframes = '';
    for (const [key, seg] of Object.entries(segs)) {
        const [p0, c, p1] = seg;
        paths[key] = c ? `M${pt(p0)} C${pt(c[0])} ${pt(c[1])} ${pt(p1)}` : `M${pt(p0)} L${pt(p1)}`;
        const steps = c ? SAMPLES : 1;
        const frames: string[] = [];
        for (let i = 0; i <= steps; i++) {
            const { at, deg } = along(seg, i / steps);
            const ends = i === 0 || i === steps ? ' opacity: 0;' : '';
            frames.push(`${r1(i / steps * 100)}% { transform: translate(${r1(at[0])}px, ${r1(at[1])}px) rotate(${Math.round(deg)}deg);${ends} }`);
        }
        // In and out softly at the wire's ends
        frames.push('10%, 90% { opacity: 1; }');
        keyframes += `@keyframes esc-flow-${key} { ${frames.join(' ')} }\n`;
    }
    places.forEach((place, i) => { place.path = paths[`c${i}`] ?? ''; });
    return { nodeWidth, centreWidth, height: H, paths: paths as Record<WireKey, string>, consumers: places, keyframes };
}
