// The night sky's stars: the same sky on every load (fixed seed)

export interface Star {
    /** Position in % of the card */
    x: number;
    y: number;
    /** Diameter in px, 1.4 … 2.2 */
    size: number;
    twinkle: boolean;
    /** Twinkle phase offset, in s, so they don't pulse together */
    delay: number;
}

export const FIXED_STARS = 24;
export const TWINKLING_STARS = 14;
export const STAR_SEED = 0x5eed;

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

/**
 * Where text sits, in % of the card: the hero and the context line on the
 * left, and the metric grid below the hairline. Stars stay out of both, so
 * none lands inside a letter: the sky is above the grid, beside the hero.
 */
export const SKY_BOTTOM = 46;
export const HERO_BLOCK = { right: 46, bottom: 47 };

export const inTextZone = (x: number, y: number): boolean =>
    y > SKY_BOTTOM || (x < HERO_BLOCK.right && y < HERO_BLOCK.bottom);

export function generateStars(seed = STAR_SEED): Star[] {
    const rand = seededRandom(seed);
    const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;
    const stars: Star[] = [];
    while (stars.length < FIXED_STARS + TWINKLING_STARS) {
        const x = round(2 + rand() * 96);
        const y = round(3 + rand() * (SKY_BOTTOM - 3));
        if (inTextZone(x, y)) continue;
        stars.push({
            x, y,
            size: round(1.4 + rand() * 0.8, 2),
            twinkle: stars.length >= FIXED_STARS,
            delay: round(rand() * 5, 2),
        });
    }
    return stars;
}

/** The stars as markup: numbers only, built from the seed (no outside data) */
export function starsMarkup(stars: Star[] = generateStars()): string {
    return stars.map(s =>
        `<i class="star${s.twinkle ? ' twinkle' : ''}" style="left:${s.x}%;top:${s.y}%;width:${s.size}px;height:${s.size}px;animation-delay:-${s.delay}s"></i>`,
    ).join('') + '<i class="shooting"></i>';
}
