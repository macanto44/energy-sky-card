// The unfolding part (expandable: true): the energy flow between the sun,
// the grid, the battery and the home. Pure: powers → flows → what each node
// and wire shows, and the drawing's geometry for a width.

import { batteryPower, gridPower, productionEntities, productionPower } from './model';
import { formatPercent, formatPower } from './format';
import { localize, numberLocale } from './localize';
import { numericState, powerW } from './utils';
import { DEFAULT_PRODUCTION_MAX } from './sky';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

/** A wire: sun → home, sun → grid, sun → battery, grid → home, battery → home, grid → battery, battery → grid */
export type WireKey = 'sh' | 'sg' | 'sb' | 'gh' | 'bh' | 'gb' | 'bg';
/** Where the energy on a wire comes from: its colour */
export type Source = 'sun' | 'grid' | 'batt';
export type NodeKey = 'solar' | 'grid' | 'battery' | 'home';

export const WIRES: Record<WireKey, Source> = { sh: 'sun', sg: 'sun', sb: 'sun', gh: 'grid', bh: 'batt', gb: 'grid', bg: 'batt' };
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
 * positive when charging (the card's conventions). The sun feeds the
 * export first (only the sun or the battery can export), then the battery,
 * then the home; the grid feeds what is left of the battery's charge, then
 * the home; the battery feeds what is left of the export, then the home.
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
    /** Ring segments around the icon, as fractions of the circle, each with its colour's source */
    ring: [number, Source][];
    /** Text in the disc instead of the icon (the battery's charge) */
    centre?: string;
}

/** The entity a node opens: the first production sensor, grid power, battery power (else its charge), consumption */
export function flowNodeEntity(config: EnergySkyCardConfig, node: NodeKey): string | undefined {
    switch (node) {
        case 'solar': return productionEntities(config)[0];
        case 'grid': return config.grid?.power_entity;
        case 'battery': return config.battery?.power_entity || config.battery?.soc_entity;
        case 'home': return config.consumption_entity;
    }
}

export interface FlowView {
    nodes: Record<NodeKey, NodeView>;
    levels: Record<WireKey, 0 | 1 | 2 | 3 | 4>;
}

export function flowView(config: EnergySkyCardConfig, hass: HomeAssistant): FlowView {
    const loc = numberLocale(hass);
    const solar = productionPower(config, hass);
    const grid = gridPower(config, hass);
    const battery = batteryPower(config, hass);
    const consumption = powerW(hass.states[config.consumption_entity ?? '']);
    const flows = energyFlows(solar, grid, battery, consumption);
    const max = config.production_max && config.production_max > 0 ? config.production_max : DEFAULT_PRODUCTION_MAX;
    const soc = numericState(hass.states[config.battery?.soc_entity ?? '']);
    const into = { sun: flows.wires.sh, grid: flows.wires.gh, batt: flows.wires.bh };
    const total = into.sun + into.grid + into.batt;
    const levels = Object.fromEntries(WIRE_KEYS.map(k => [k, flowLevel(flows.wires[k])])) as FlowView['levels'];
    return {
        nodes: {
            solar: {
                present: true, label: localize(loc.lang, 'solar'), value: formatPower(solar, loc),
                ring: [[Math.min(pos(solar) / max, 1), 'sun']],
            },
            grid: {
                present: !!config.grid?.power_entity, label: localize(loc.lang, 'grid'), value: formatPower(grid, loc),
                ring: [],
            },
            battery: {
                present: !!(config.battery?.power_entity || config.battery?.soc_entity), label: localize(loc.lang, 'battery'),
                value: config.battery?.power_entity ? formatPower(battery, loc) : formatPercent(soc, loc),
                ring: soc === undefined ? [] : [[Math.min(Math.max(soc, 0), 100) / 100, 'batt']],
                centre: soc === undefined ? undefined : String(Math.round(soc)),
            },
            home: {
                present: true, label: localize(loc.lang, 'home'), value: formatPower(flows.home, loc),
                ring: total > 0 ? (['sun', 'batt', 'grid'] as const).filter(s => into[s] > 0).map(s => [into[s] / total, s]) : [],
            },
        },
        levels,
    };
}

/** The drawing is this tall (px); its width is the panel's */
export const FLOW_HEIGHT = 200;
export const NODE_HEIGHT = 46;
const SAMPLES = 12;

export interface FlowGeometry {
    /** The sun's and the home's width (they share the middle row) */
    nodeWidth: number;
    /** The grid's and the battery's (alone on their rows: wider, while the curves keep some length) */
    centreWidth: number;
    paths: Record<WireKey, string>;
    /** One @keyframes per wire, esc-flow-<key>: a comet along it (transform only) */
    keyframes: string;
}

type Pt = [number, number];

/** A point and the direction along a straight or quadratic segment */
function along(p0: Pt, c: Pt | null, p1: Pt, t: number): { at: Pt; deg: number } {
    if (!c) return { at: [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t], deg: Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI };
    const u = 1 - t;
    const at: Pt = [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
    const dx = 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
    const dy = 2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
    return { at, deg: Math.atan2(dy, dx) * 180 / Math.PI };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Where everything sits for a panel `width` px wide: the sun on the left,
 * the home on the right (a straight wire between), the grid above and the
 * battery below in the middle, joined by quarter curves that never cross.
 */
export function flowGeometry(width: number): FlowGeometry {
    const W = Math.max(width, 160);
    const nodeWidth = Math.round(Math.min(Math.max((W - 48) / 2, 96), 128));
    const centreWidth = Math.round(Math.min(nodeWidth + 20, W - nodeWidth - 32));
    const half = nodeWidth / 2, chalf = centreWidth / 2, r = NODE_HEIGHT / 2, mid = FLOW_HEIGHT / 2;
    const top = 3 + r, bottom = FLOW_HEIGHT - 3 - r;
    const sx = half, hx = W - half, cx = W / 2;
    const segs: Record<WireKey, [Pt, Pt | null, Pt]> = {
        sh: [[nodeWidth, mid], null, [W - nodeWidth, mid]],
        sg: [[sx, mid - r], [sx, top], [cx - chalf, top]],
        gh: [[cx + chalf, top], [hx, top], [hx, mid - r]],
        sb: [[sx, mid + r], [sx, bottom], [cx - chalf, bottom]],
        bh: [[cx + chalf, bottom], [hx, bottom], [hx, mid + r]],
        gb: [[cx, top + r], null, [cx, bottom - r]],
        bg: [[cx, bottom - r], null, [cx, top + r]],
    };
    const paths = {} as Record<WireKey, string>;
    let keyframes = '';
    for (const key of WIRE_KEYS) {
        const [p0, c, p1] = segs[key];
        paths[key] = c
            ? `M${r1(p0[0])},${r1(p0[1])} Q${r1(c[0])},${r1(c[1])} ${r1(p1[0])},${r1(p1[1])}`
            : `M${r1(p0[0])},${r1(p0[1])} L${r1(p1[0])},${r1(p1[1])}`;
        const steps = c ? SAMPLES : 1;
        const frames: string[] = [];
        for (let i = 0; i <= steps; i++) {
            const { at, deg } = along(p0, c, p1, i / steps);
            const ends = i === 0 || i === steps ? ' opacity: 0;' : '';
            frames.push(`${r1(i / steps * 100)}% { transform: translate(${r1(at[0])}px, ${r1(at[1])}px) rotate(${Math.round(deg)}deg);${ends} }`);
        }
        // In and out softly at the wire's ends
        frames.push('10%, 90% { opacity: 1; }');
        keyframes += `@keyframes esc-flow-${key} { ${frames.join(' ')} }\n`;
    }
    return { nodeWidth, centreWidth, paths, keyframes };
}
