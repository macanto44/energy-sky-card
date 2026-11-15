// The sky's particles, the same on every load (fixed seeds): stars by night,
// motes of sunlight by day, over the whole card. The card hides the ones
// that would touch text (coveredBy, after each layout): none sits behind a
// letter, so the text's contrast is the background's alone.

export interface Star {
    /** Position in % of the card */
    x: number;
    y: number;
    /** Diameter in px: 1.4 … 2.2 at the top, down to 70 % of that at the bottom */
    size: number;
    /** Brightness, 1 at the top to 0.55 at the bottom (a sky fading towards the horizon) */
    opacity: number;
    twinkle: boolean;
    /** Phase offset, in s, so they don't pulse together */
    delay: number;
}

export interface Mote {
    x: number;
    y: number;
    /** Diameter in px, 7 … 12 (a soft dot: the edge fades out) */
    size: number;
    /** Phase offset and length of one drift, in s */
    delay: number;
    duration: number;
}

export const STAR_SEED = 0x5eed;
export const MOTE_SEED = 0x50e1;
/** Stars: one try per cell of a 10 × 6 grid, kept less often lower down */
export const STAR_GRID = { cols: 10, rows: 6 };
export const STAR_KEEP = [1, 0.9, 0.8, 0.7, 0.6, 0.5];
export const TWINKLE_SHARE = 0.4;
/** Motes: one per cell of an 8 × 5 grid */
export const MOTE_GRID = { cols: 8, rows: 5 };
/** How far a mote drifts up and down, in px (its keep-out margin counts it) */
export const MOTE_DRIFT = 3;
/** Clear space kept between a particle's edge and text, in px */
export const TEXT_GAP = 3;
/** A twinkling star grows to this scale at its peak */
export const TWINKLE_PEAK_SCALE = 1.4;

/** mulberry32: a tiny deterministic PRNG */
export function seededRandom(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/** A point jittered inside a grid cell (10 … 90 % of it), in % of the card */
function inCell(rand: () => number, col: number, row: number, grid: { cols: number; rows: number }) {
    return {
        x: round((col + 0.1 + rand() * 0.8) / grid.cols * 100),
        y: round((row + 0.1 + rand() * 0.8) / grid.rows * 100),
    };
}

/** Stars over the whole card: a jittered grid, so no corner is left empty */
export function generateStars(seed = STAR_SEED): Star[] {
    const rand = seededRandom(seed);
    const stars: Star[] = [];
    for (let row = 0; row < STAR_GRID.rows; row++) {
        for (let col = 0; col < STAR_GRID.cols; col++) {
            const keep = rand() < STAR_KEEP[row];
            const { x, y } = inCell(rand, col, row, STAR_GRID);
            const size = 1.4 + rand() * 0.8;
            const twinkle = rand() < TWINKLE_SHARE;
            const delay = round(rand() * 5, 2);
            if (!keep) continue;
            const depth = y / 100;
            stars.push({ x, y, size: round(size * (1 - 0.3 * depth), 2), opacity: round(1 - 0.45 * depth, 2), twinkle, delay });
        }
    }
    return stars;
}

export function generateMotes(seed = MOTE_SEED): Mote[] {
    const rand = seededRandom(seed);
    const motes: Mote[] = [];
    for (let row = 0; row < MOTE_GRID.rows; row++) {
        for (let col = 0; col < MOTE_GRID.cols; col++) {
            const { x, y } = inCell(rand, col, row, MOTE_GRID);
            motes.push({ x, y, size: round(7 + rand() * 5), delay: round(rand() * 8, 2), duration: round(4 + rand() * 3, 1) });
        }
    }
    return motes;
}

/**
 * The shooting stars: three paths, across the top right, the top left and
 * across the middle, each with its own rhythm (one pass in the first 8 % of its
 * period, so the longer runs pass at the same speed)
 */
export const SHOOTING_STARS = [
    { left: 52, top: 7, angle: 20, run: 110, period: 11, delay: 4 },
    { left: 4, top: 5, angle: 12, run: 170, period: 17, delay: 9 },
    { left: 44, top: 36, angle: 9, run: 150, period: 23, delay: 15 },
] as const;

/**
 * How far from its centre a particle must stay clear of text, in px: its
 * radius at its largest, its drift, and the gap
 */
export const starReach = (s: Star) => round(s.size / 2 * (s.twinkle ? TWINKLE_PEAK_SCALE : 1) + TEXT_GAP, 2);
export const moteReach = (m: Mote) => round(m.size / 2 + MOTE_DRIFT + TEXT_GAP, 2);

/** The particles as markup: numbers only, built from the seeds (no outside data) */
export function starsMarkup(stars: Star[] = generateStars()): string {
    return stars.map(s =>
        `<i class="star${s.twinkle ? ' twinkle' : ''}" data-reach="${starReach(s)}" style="left:${s.x}%;top:${s.y}%;width:${s.size}px;height:${s.size}px;--esc-o:${s.opacity};animation-delay:-${s.delay}s"></i>`,
    ).join('') + SHOOTING_STARS.map(s =>
        `<i class="shooting" style="left:${s.left}%;top:${s.top}%;--esc-shoot-angle:${s.angle}deg;--esc-shoot-run:${s.run}px;--esc-shoot-period:${s.period}s;--esc-shoot-delay:${s.delay}s"></i>`,
    ).join('');
}

export function motesMarkup(motes: Mote[] = generateMotes()): string {
    return motes.map(m =>
        `<i class="mote" data-reach="${moteReach(m)}" style="left:${m.x}%;top:${m.y}%;width:${m.size}px;height:${m.size}px;animation-delay:-${m.delay}s;animation-duration:${m.duration}s"></i>`,
    ).join('');
}

export interface Box { left: number; top: number; right: number; bottom: number }

/** Whether a particle at (x, y) with this reach would touch any of the boxes */
export const coveredBy = (x: number, y: number, reach: number, boxes: Box[]): boolean =>
    boxes.some(b => x > b.left - reach && x < b.right + reach && y > b.top - reach && y < b.bottom + reach);
