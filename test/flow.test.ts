import { describe, it, expect, afterEach } from 'vitest';
import '../src/energy-sky-card';
import type { EnergySkyCard } from '../src/energy-sky-card';
import { CARD_NAME } from '../src/constants';
import { CARD_CSS, FLOW_COLOURS, NODE_GLASS_ALPHA } from '../src/styles/card';
import { FLOW_HEIGHT, NODE_HEIGHT, WIRE_KEYS, energyFlows, flowGeometry, flowLevel, flowView } from '../src/flow';
import { DEFAULT_PALETTES, NIGHT_PALETTE, composite, contrastRatio, hexToRgb, type Rgb } from '../src/sky';
import { ANNEX_B, FULL_CONFIG, makeHass } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const GRID = 'sensor.victrongrid_ac_l1_power31';
const BATT = 'sensor.victron_system_battery_power';
const SOC = 'sensor.victron_system_battery_soc';
const PV = 'sensor.production_pv';
const DAY = { ...ANNEX_B, 'sun.sun': 'above_horizon' };
/** The card puts a no-break space between a number and its unit */
const nb = '\u00a0';

describe('energy flows', () => {
    it('sends the sun to the grid, the battery, then the home (selling and charging at noon)', () => {
        const f = energyFlows(3200, -1800, 300, undefined);
        expect(f.wires).toEqual({ sh: 1100, sg: 1800, sb: 300, gh: 0, bh: 0, gb: 0, bg: 0 });
        expect(f.home).toBe(1100);
    });

    it('feeds the home from the sun and the battery on a Rouge day', () => {
        expect(energyFlows(1400, 0, -1200, undefined).wires).toMatchObject({ sh: 1400, bh: 1200, sg: 0, gh: 0 });
    });

    it('feeds the home from the battery and the grid at night', () => {
        const f = energyFlows(0, 200, -700, undefined);
        expect(f.wires).toMatchObject({ bh: 700, gh: 200, sh: 0 });
        expect(f.home).toBe(900);
    });

    it('charges the battery from the grid (off-peak), and lets a battery sell', () => {
        expect(energyFlows(0, 2500, 2000, undefined).wires).toMatchObject({ gb: 2000, gh: 500, sb: 0 });
        expect(energyFlows(0, -1000, -1500, undefined).wires).toMatchObject({ bg: 1000, bh: 500 });
    });

    it('takes the home from its sensor when there is one, and nothing below 20 W', () => {
        expect(energyFlows(3200, -1800, 300, 1250).home).toBe(1250);
        expect(energyFlows(10, 5, undefined, undefined).wires.sh).toBe(0);
        expect(energyFlows(undefined, undefined, undefined, undefined).home).toBeUndefined();
    });

    it('steps the wires by power', () => {
        expect([0, 19, 20, 499, 500, 1499, 1500, 2999, 3000].map(flowLevel)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4]);
    });
});

describe('flow view', () => {
    const view = (states: Record<string, string | number>, config: EnergySkyCardConfig = FULL_CONFIG) => flowView(config, makeHass({ ...DAY, ...states }));

    it('names the nodes as the card does, with the card\'s signs', () => {
        const v = view({ [PV]: 3200, [GRID]: -1800, [BATT]: 300, [SOC]: 78 });
        expect(Object.values(v.nodes).map(n => n.label)).toEqual(['Solaire', 'Réseau', 'Batterie', 'Maison']);
        expect(v.nodes.grid.value).toBe(`-1,8${nb}kW`);
        expect(v.nodes.battery.value).toBe(`300${nb}W`);
        expect(view({ [BATT]: -700 }).nodes.battery.value).toBe(`-700${nb}W`);
        expect(v.nodes.home.value).toBe(`1,1${nb}kW`);
    });

    it('rings the sun\'s share of its maximum, the battery\'s charge (shown in the disc), the home\'s sources', () => {
        const v = view({ [PV]: 3000, [GRID]: 0, [BATT]: -1000, [SOC]: 64 });
        expect(v.nodes.solar.ring).toEqual([[0.5, 'sun']]);
        expect(v.nodes.battery.ring).toEqual([[0.64, 'batt']]);
        expect(v.nodes.battery.centre).toBe('64');
        expect(v.nodes.home.ring).toEqual([[0.75, 'sun'], [0.25, 'batt']]);
    });

    it('leaves out a grid or a battery the card doesn\'t have', () => {
        const v = view({}, { type: 'custom:energy-sky-card', production_entity: PV });
        expect(v.nodes.grid.present).toBe(false);
        expect(v.nodes.battery.present).toBe(false);
        expect(v.nodes.home.present).toBe(true);
    });
});

describe('flow geometry', () => {
    it('animates only transform and opacity, one keyframes block per wire', () => {
        const g = flowGeometry(400);
        expect(g.keyframes.match(/@keyframes esc-flow-/g)?.length).toBe(WIRE_KEYS.length);
        const props = [...g.keyframes.matchAll(/([a-z-]+)\s*:/g)].map(m => m[1]);
        expect(new Set(props)).toEqual(new Set(['transform', 'opacity']));
    });

    it('keeps the four nodes apart, from a phone to a wide card', () => {
        for (const width of [200, 264, 400, 600]) {
            const { nodeWidth } = flowGeometry(width);
            expect(nodeWidth).toBeGreaterThanOrEqual(96);
            expect(nodeWidth).toBeLessThanOrEqual(128);
            // Sun and home share the middle row
            if (width >= 264) expect(width - 2 * nodeWidth).toBeGreaterThanOrEqual(8);
            // The grid and the battery leave the curves from the sun and the home at least 16 px
            const { centreWidth } = flowGeometry(width);
            expect((width - centreWidth) / 2 - nodeWidth / 2).toBeGreaterThanOrEqual(16);
            // The grid and battery rows clear the middle one
            expect(3 + NODE_HEIGHT).toBeLessThan((FLOW_HEIGHT - NODE_HEIGHT) / 2);
        }
    });

    it('starts each curve at a node\'s edge and ends it at another\'s', () => {
        const g = flowGeometry(400);
        expect(g.nodeWidth).toBe(128);
        expect(g.paths.sh).toBe('M128,100 L272,100');
        expect(g.centreWidth).toBe(148);
        expect(g.paths.sg).toBe('M64,77 Q64,26 126,26');
        expect(g.paths.bh).toBe('M274,174 Q336,174 336,123');
    });
});

describe('the expandable card', () => {
    const cards: EnergySkyCard[] = [];
    afterEach(() => { document.body.innerHTML = ''; cards.length = 0; });

    function mount(extra: Partial<EnergySkyCardConfig> = {}, states: Record<string, string | number> = DAY) {
        const card = document.createElement(CARD_NAME) as EnergySkyCard;
        card.setConfig({ ...FULL_CONFIG, expandable: true, ...extra });
        card.hass = makeHass(states);
        document.body.appendChild(card);
        const events: { type: string; detail: any }[] = [];
        for (const type of ['hass-action', 'hass-more-info']) card.addEventListener(type, e => events.push({ type, detail: (e as CustomEvent).detail }));
        cards.push(card);
        const $ = (sel: string) => card.shadowRoot!.querySelector(sel) as HTMLElement;
        return { card, events, $ };
    }
    const press = (el: HTMLElement, type: string) => el.dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
    const tap = (el: HTMLElement) => { press(el, 'pointerdown'); press(el, 'pointerup'); };

    it('is off by default, and must be true or false', () => {
        const card = document.createElement(CARD_NAME) as EnergySkyCard;
        card.setConfig(FULL_CONFIG);
        expect(card.shadowRoot!.querySelector('.panel')).toBeNull();
        expect(() => card.setConfig({ ...FULL_CONFIG, expandable: 'yes' as any })).toThrow(/expandable/);
    });

    it('lets the sections grid size it (rows: auto), in both layouts', () => {
        expect(mount().card.getGridOptions()).toEqual({ columns: 12, rows: 'auto', min_columns: 6 });
        expect(mount({ layout: 'side' }).card.getGridOptions().rows).toBe('auto');
    });

    it('unfolds and folds on a tap on the big number or its line, instead of the card\'s tap action', () => {
        const { card, events, $ } = mount({ tap_action: { action: 'navigate', navigation_path: '/menu' } });
        expect($('.panel').hidden).toBe(true);
        tap($('.hero'));
        expect(card.expanded).toBe(true);
        expect(card.hasAttribute('data-expanded')).toBe(true);
        expect($('.panel').hidden).toBe(false);
        expect($('.hero').getAttribute('aria-expanded')).toBe('true');
        tap($('.context'));
        expect(card.expanded).toBe(false);
        expect(events).toEqual([]);
        // Elsewhere on the card, the card's own tap
        tap($('ha-card'));
        expect(events.map(e => e.type)).toEqual(['hass-action']);
    });

    it('unfolds from the keyboard, the big number being a button', () => {
        const { card, $ } = mount();
        expect($('.hero').getAttribute('role')).toBe('button');
        $('.hero').focus();
        $('.hero').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(card.expanded).toBe(true);
    });

    it('keeps the hold action on the big number', async () => {
        const { events, $ } = mount({ hold_action: { action: 'navigate', navigation_path: '/menu' } });
        press($('.hero'), 'pointerdown');
        await new Promise(r => setTimeout(r, 550));
        press($('.hero'), 'pointerup');
        expect(events.map(e => e.detail.action)).toEqual(['hold']);
    });

    it('opens a node\'s entity on a tap; the home only with a consumption sensor', () => {
        const { card, events, $ } = mount();
        card.expanded = true;
        tap($('[data-node="grid"]'));
        expect(events).toEqual([{ type: 'hass-more-info', detail: { entityId: GRID } }]);
        expect($('[data-node="battery"]').getAttribute('role')).toBe('button');
        expect($('[data-node="home"]').hasAttribute('role')).toBe(false);
        const withHome = mount({ consumption_entity: 'sensor.home' });
        expect(withHome.$('[data-node="home"]').getAttribute('role')).toBe('button');
    });

    it('writes the numbers in place, and the wires\' levels', () => {
        const { card, $ } = mount({}, { ...DAY, [PV]: 3200, [GRID]: -1800, [BATT]: 300, [SOC]: 78 });
        const value = $('[data-node="grid"] .nval');
        expect(value.textContent).toBe(`-1,8${nb}kW`);
        expect($('[data-node="battery"] .centre').textContent).toBe('78');
        expect($('[data-node="battery"]').hasAttribute('data-centre')).toBe(true);
        expect($('[data-wire="sg"]').getAttribute('data-level')).toBe('3');
        expect($('[data-wire="sh"]').getAttribute('data-level')).toBe('2');
        expect($('[data-wire="gh"]').getAttribute('data-level')).toBe('0');
        card.hass = makeHass({ ...DAY, [PV]: 3200, [GRID]: 250, [BATT]: 300, [SOC]: 78 });
        expect($('[data-node="grid"] .nval')).toBe(value);
        expect(value.textContent).toBe(`250${nb}W`);
    });

    it('drops a missing battery with its wires', () => {
        const { $ } = mount({ battery: undefined });
        expect($('[data-node="battery"]').hidden).toBe(true);
        expect($('[data-wire="sb"]').hasAttribute('data-off')).toBe(true);
        expect($('[data-wire="sg"]').hasAttribute('data-off')).toBe(false);
    });

    it('folds again on a new config', () => {
        const { card } = mount();
        card.expanded = true;
        card.setConfig({ ...FULL_CONFIG, expandable: true });
        expect(card.expanded).toBe(false);
        card.setConfig(FULL_CONFIG);
        card.expanded = true;
        expect(card.expanded).toBe(false);
    });
});

describe('the flow\'s stylesheet', () => {
    it('keeps the sky on the top part and runs the comets only unfolded and in motion', () => {
        expect(CARD_CSS).toContain(':host([data-expandable]) .sky { bottom: auto; height: var(--esc-top-h); }');
        expect(CARD_CSS).toMatch(/:host\(\[data-motion="on"\]\[data-expanded\]\) \.wire:not\(\[data-level="0"\]\) \.comet,\s*:host\(\[data-motion="paused"\]\[data-expanded\]\) \.wire:not\(\[data-level="0"\]\) \.comet \{ display: inline; animation: esc-flow/);
        expect(CARD_CSS).toMatch(/\n\.comet \{ display: none; \}/);
    });
});

/*
 * The flow sits on the gradient's last colour (the night's at night), under
 * the nodes' glass: white over it at NODE_GLASS_ALPHA at most. Values (15 px)
 * need 4.5:1; the labels (78 % opacity) 3:1.
 */
describe('contrast of the flow\'s text', () => {
    const WHITE: Rgb = [1, 1, 1];
    for (const [name, palette] of [...Object.entries(DEFAULT_PALETTES), ['Nuit', NIGHT_PALETTE] as const]) {
        it(`passes on ${name}`, () => {
            const glass = composite(hexToRgb(palette[2]), WHITE, NODE_GLASS_ALPHA);
            expect(contrastRatio(WHITE, glass)).toBeGreaterThanOrEqual(4.5);
            expect(contrastRatio(composite(glass, WHITE, 0.78), glass)).toBeGreaterThanOrEqual(3);
        });
    }

    it('draws the three sources in their own colours', () => {
        expect(Object.keys(FLOW_COLOURS)).toEqual(['sun', 'grid', 'batt']);
    });
});
