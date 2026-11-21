// The background: day gradient in the tariff colour with a sun halo, or the night sky,
// and the WCAG colour maths the contrast test relies on.

import type { EnergySkyCardConfig, HomeAssistant } from './types';
import { productionPower } from './model';

export type Rgb = [number, number, number];
export type Palette = [string, string, string];

/**
 * Default tariff palettes, top → bottom (0 % → 60 % → 100 %). The brief's
 * colours, with the top two stops darkened in OKLCH lightness (Bleu ×0.928,
 * Blanc ×0.907, Rouge ×0.980, hue and chroma kept) until white text passes
 * the contrast test where it actually sits, with a 0.04 margin: see
 * test/sky.test.ts.
 */
export const DEFAULT_PALETTES: Record<string, Palette> = {
    Bleu: ['#4b90d5', '#2169b0', '#1d4f87'],
    Blanc: ['#7b899c', '#5c6b81', '#4f5d72'],
    Rouge: ['#d2766a', '#ac443a', '#76261f'],
};
export const DEFAULT_TARIFF = 'Bleu';
/** Night: fixed, whatever the tariff. #1d2b4d → #0b1026 (the middle stop sits on that straight line) */
export const NIGHT_PALETTE: Palette = ['#1d2b4d', '#121b36', '#0b1026'];
export const HALO_RGB: Rgb = [255 / 255, 214 / 255, 140 / 255];
export const HALO_MAX_ALPHA = 0.55;
/**
 * The breathing halo peaks at this multiple of its alpha, 12 % larger: it
 * breathes down (×0.55) rather than up, so the hero keeps its 3:1 contrast
 */
export const HALO_BREATHE_PEAK = 1;
export const DEFAULT_PRODUCTION_MAX = 6000;
/** The energy flow's colours, by where the energy comes from (a theme or flow_colors can change them) */
export const FLOW_COLOURS = { sun: '#ffd68c', grid: '#cfe0ff', batt: '#9ef0c8', use: '#f4d9ff' } as const;
/**
 * The side layout (2 rows, 120 px) puts values over the whole height, where
 * the full gradient's top is too light for 15 px text: its sky is the lower
 * part of the gradient, from this height down (the part the standard
 * layout's values sit on)
 */
export const SIDE_SKY_FROM = 0.45;
/**
 * The side layout's halo: off the values' column, a glow from just above
 * the card's top left corner, behind the hero (px: centre x, y, radius)
 */
export const SIDE_HALO = { x: 0, y: -30, radius: 100 } as const;
/**
 * By day, cloud shadows drift across the card: a dark navy at most this
 * opaque. They only ever darken the sky, so white text keeps (or gains) its
 * contrast wherever they pass
 */
export const CLOUD_RGB = [8, 18, 40] as const;
export const CLOUD_MAX_ALPHA = 0.2;
/**
 * The sun (standard layout; the side layout keeps the halo): the sky lit
 * around it and a bloom, each a disc whose alpha falls linearly from its
 * centre to its radius (px), stronger with the production share p; the
 * bloom breathes up to SUN_BREATHE × its size. The card keeps the sun at
 * least SUN_CLEARANCE px from each kind of text, and test/sky.test.ts holds
 * every palette to its contrast there.
 */
export const SUN_GLOW = { radius: 84, rgb: [255, 246, 226] as Rgb, alpha: (p: number) => 0.08 + 0.14 * p };
export const SUN_BLOOM = { radius: 44, rgb: [255, 252, 240] as Rgb, alpha: (p: number) => 0.35 + 0.4 * p };
export const SUN_BREATHE = 1.06;
export const SUN_CLEARANCE = { hero: 52, context: 86, cells: 86 } as const;
/** Moonlight: a cool glow around the moon, stronger as it fills */
export const MOONLIGHT = { radius: 120, rgb: [205, 215, 255] as Rgb, alpha: (lit: number) => 0.05 + 0.1 * lit };
/**
 * Dawn and dusk: a glow rising from the bottom of the card while the sun is
 * low, rose at dawn, amber at dusk; its alpha at the bottom (strength 1),
 * 55 % of it at mid-height, none above 15 % of the height
 */
export const TWILIGHT = {
    alpha: 0.6,
    dawn: { low: [190, 96, 120] as Rgb, mid: [140, 100, 160] as Rgb },
    dusk: { low: [196, 84, 36] as Rgb, mid: [170, 90, 70] as Rgb },
};
/** The tint's alpha at a height y (0 top … 1 bottom), for strength 1 */
export function twilightAlpha(y: number): number {
    if (y <= 0.15) return 0;
    if (y <= 0.55) return TWILIGHT.alpha * 0.55 * (y - 0.15) / 0.4;
    return TWILIGHT.alpha * (0.55 + 0.45 * (y - 0.55) / 0.45);
}
/** The tint's colour at a height y, from its mid colour to its low one */
export function twilightRgb(tone: { low: Rgb; mid: Rgb }, y: number): Rgb {
    const t = Math.min(Math.max((y - 0.55) / 0.45, 0), 1);
    return tone.mid.map((c, i) => (c + (tone.low[i] - c) * t) / 255) as Rgb;
}

/**
 * Under the sky, the flow's floor: the sky's last colour, the day's over the
 * night's by the day's weight (--esc-day), so the seam never shows while the
 * sky turns. Its dawn and dusk: the twilight's glow carried on below the
 * horizon, at the sky's bottom alpha and colour where they meet, its mid colour
 * at 55 % of it FLOOR_GLOW.mid px down, gone at FLOOR_GLOW.end px (above the
 * wires' crossing, whose bridge is the floor's plain colour).
 */
export const FLOOR_GLOW = { mid: 40, end: 100 } as const;
export function floorRgb(palette: Palette, nightPalette: Palette, day: number): Rgb {
    return composite(hexToRgb(nightPalette[2]), hexToRgb(palette[2]), Math.min(Math.max(day, 0), 1));
}
/** The floor's twilight at d px below the sky, for strength 1: its alpha and colour */
export function floorGlowAlpha(d: number): number {
    if (d <= FLOOR_GLOW.mid) return TWILIGHT.alpha * (1 - 0.45 * d / FLOOR_GLOW.mid);
    return d >= FLOOR_GLOW.end ? 0 : TWILIGHT.alpha * 0.55 * (FLOOR_GLOW.end - d) / (FLOOR_GLOW.end - FLOOR_GLOW.mid);
}
export function floorGlowRgb(tone: { low: Rgb; mid: Rgb }, d: number): Rgb {
    const t = Math.min(Math.max(d / FLOOR_GLOW.mid, 0), 1);
    return tone.low.map((c, i) => (c + (tone.mid[i] - c) * t) / 255) as Rgb;
}

/** Three clouds: width and height (% of the card), top (%), one crossing in s, phase offset in s */
export const CLOUDS = [
    { width: 110, height: 38, top: 2, period: 47, delay: 9 },
    { width: 95, height: 32, top: 38, period: 61, delay: 41 },
    { width: 120, height: 36, top: 70, period: 73, delay: 22 },
] as const;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
export const isHexColor = (v: unknown): v is string => typeof v === 'string' && HEX.test(v);

export function hexToRgb(hex: string): Rgb {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
}

/** sRGB channel (0–1) to linear light, per the sRGB transfer function */
function toLinear(channel: number): number {
    return channel > 0.04045 ? ((channel + 0.055) / 1.055) ** 2.4 : channel / 12.92;
}

/** Relative luminance as WCAG 2 defines it (Rec. 709 weights on linear light) */
export function relativeLuminance(rgb: Rgb): number {
    const weights = [0.2126, 0.7152, 0.0722];
    return rgb.reduce((sum, channel, i) => sum + weights[i] * toLinear(channel), 0);
}

/** WCAG contrast ratio, 1 … 21 */
export function contrastRatio(a: Rgb, b: Rgb): number {
    const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

/** `top` over `bottom` at `alpha`, blended in sRGB as CSS does */
export function composite(bottom: Rgb, top: Rgb, alpha: number): Rgb {
    return [0, 1, 2].map(i => bottom[i] + (top[i] - bottom[i]) * alpha) as Rgb;
}

/** The gradient's colour at a height (0 top, 1 bottom), stops at 0 %, 60 %, 100 % */
export function gradientAt(palette: Palette, y: number): Rgb {
    const [a, b, c] = palette.map(hexToRgb);
    return y <= 0.6 ? composite(a, b, y / 0.6) : composite(b, c, (y - 0.6) / 0.4);
}

/** The side layout's sky at a height of the card (0 top, 1 bottom) */
export function sideGradientAt(palette: Palette, y: number): Rgb {
    return gradientAt(palette, SIDE_SKY_FROM + (1 - SIDE_SKY_FROM) * y);
}

/** Where text sits on the card, as fractions of its height (context line to the last value) */
const TEXT_SPAN = [0.36, 0.5, 0.64, 0.76, 0.86, 0.98];
const WHITE: Rgb = [1, 1, 1];

/** The weakest white-text contrast where text sits, with a veil of white at `veil` over the sky (a cloud, fog) */
export function textContrast(palette: Palette, veil = 0): number {
    return Math.min(...TEXT_SPAN.map(y => contrastRatio(WHITE, composite(gradientAt(palette, y), WHITE, veil))));
}

const toHex = (c: Rgb) => '#' + c.map(v => Math.round(Math.min(Math.max(v, 0), 1) * 255).toString(16).padStart(2, '0')).join('');

/** The default solid sky: a slate blue */
export const DEFAULT_SOLID_COLOR = '#3a6b8c';

/**
 * A sky of one colour: a little lighter at the top, the colour, darker at
 * the bottom, darkened step by step until white text reads at 4.5:1 where
 * it sits (a pale colour comes out as its deeper shade).
 */
export function solidPalette(colour: string): Palette {
    let base = hexToRgb(isHexColor(colour) ? colour : DEFAULT_SOLID_COLOR);
    const build = (c: Rgb): Palette => [toHex(composite(c, WHITE, 0.12)), toHex(c), toHex(composite(c, [0, 0, 0], 0.35))];
    let palette = build(base);
    for (let i = 0; i < 40 && textContrast(palette) < 4.6; i++) {
        base = composite(base, [0, 0, 0], 0.06);
        palette = build(base);
    }
    return palette;
}

/** What a weather condition looks like: its day and night skies, and what moves over them */
export interface WeatherLook {
    day: Palette;
    night: Palette;
    /** Cumulus clouds: how many, how opaque by day and at night, and whether the wind hurries them */
    clouds: number;
    cloudAlpha: number;
    nightCloudAlpha: number;
    windy?: boolean;
    /** Raindrops and snowflakes: how many */
    rain: number;
    snow: number;
    fog?: boolean;
    /** Lightning: a brief flash every few seconds */
    flash?: boolean;
    /** The sun's halo, by day (production) */
    halo?: boolean;
    /** At night: every star, a few through the clouds, or none; shooting stars with any */
    stars: 'all' | 'few' | 'none';
}

/** Fog's veil at its densest (the contrast test counts it) */
export const FOG_ALPHA = 0.12;

/**
 * The weather skies, by Home Assistant condition. Each day palette is dark
 * enough for white text with its clouds or fog passing behind it (tested).
 */
export const WEATHER: Record<string, WeatherLook> = {
    sunny: { day: ['#3f8de0', '#1b65bd', '#164a8c'], night: NIGHT_PALETTE, clouds: 0, cloudAlpha: 0, nightCloudAlpha: 0, rain: 0, snow: 0, halo: true, stars: 'all' },
    partlycloudy: { day: ['#4d78a6', '#2a5b8b', '#20446c'], night: ['#202c47', '#141c31', '#0d1222'], clouds: 3, cloudAlpha: 0.12, nightCloudAlpha: 0.1, rain: 0, snow: 0, halo: true, stars: 'few' },
    cloudy: { day: ['#647285', '#475567', '#35404f'], night: ['#262c3a', '#1a1f2b', '#11141c'], clouds: 6, cloudAlpha: 0.14, nightCloudAlpha: 0.1, rain: 0, snow: 0, stars: 'none' },
    rainy: { day: ['#5a6879', '#405062', '#2f3a48'], night: ['#20252f', '#161a22', '#0e1117'], clouds: 5, cloudAlpha: 0.13, nightCloudAlpha: 0.08, rain: 40, snow: 0, stars: 'none' },
    pouring: { day: ['#4a5664', '#343f4c', '#262e38'], night: ['#1b1f27', '#12151b', '#0b0d11'], clouds: 5, cloudAlpha: 0.11, nightCloudAlpha: 0.06, rain: 80, snow: 0, stars: 'none' },
    lightning: { day: ['#3e4360', '#2b2f46', '#1e2132'], night: ['#1a1c2a', '#11131e', '#0a0b13'], clouds: 4, cloudAlpha: 0.1, nightCloudAlpha: 0.06, rain: 0, snow: 0, flash: true, stars: 'none' },
    'lightning-rainy': { day: ['#3e4360', '#2b2f46', '#1e2132'], night: ['#1a1c2a', '#11131e', '#0a0b13'], clouds: 4, cloudAlpha: 0.1, nightCloudAlpha: 0.06, rain: 60, snow: 0, flash: true, stars: 'none' },
    snowy: { day: ['#67778b', '#4e5e74', '#3d4d60'], night: ['#2a3142', '#1d2331', '#141924'], clouds: 4, cloudAlpha: 0.1, nightCloudAlpha: 0.06, rain: 0, snow: 40, stars: 'none' },
    'snowy-rainy': { day: ['#67778b', '#4e5e74', '#3d4d60'], night: ['#2a3142', '#1d2331', '#141924'], clouds: 4, cloudAlpha: 0.1, nightCloudAlpha: 0.06, rain: 20, snow: 24, stars: 'none' },
    fog: { day: ['#6a737c', '#525a64', '#404750'], night: ['#2a2f37', '#1e2229', '#15181d'], clouds: 0, cloudAlpha: 0, nightCloudAlpha: 0, rain: 0, snow: 0, fog: true, stars: 'none' },
    windy: { day: ['#4c79a7', '#2a5a8b', '#1f446b'], night: ['#1f2b46', '#131b30', '#0c1121'], clouds: 5, cloudAlpha: 0.12, nightCloudAlpha: 0.09, windy: true, rain: 0, snow: 0, halo: true, stars: 'few' },
};

/** Home Assistant's other conditions, drawn as their nearest look; anything unknown as cloudy */
const WEATHER_ALIASES: Record<string, string> = { 'clear-night': 'sunny', hail: 'pouring', 'windy-variant': 'windy', exceptional: 'cloudy' };

/** The look's key for a weather entity's state */
export function weatherKey(state: string | undefined): string {
    const s = String(state ?? '').toLowerCase();
    return WEATHER[s] ? s : WEATHER_ALIASES[s] ?? 'cloudy';
}

export interface Background {
    mode: 'day' | 'night';
    /** The sky: tempo, solid or weather */
    sky: 'tempo' | 'solid' | 'weather';
    /** The day palette: the tariff's, the solid colour's, the weather's */
    palette: Palette;
    /** The night palette: the night's, or the weather's at night */
    nightPalette: Palette;
    /** With the weather sky: the condition's key in WEATHER */
    weather?: string;
    /** 0 … 0.55, the halo's opacity: production / production_max × 0.55 */
    haloAlpha: number;
    /** Production above zero: the halo may breathe */
    producing: boolean;
}

/** The palette for a tariff state: the config's, then the defaults, case-insensitive; Bleu when unknown */
export function tariffPalette(config: EnergySkyCardConfig, state: string | undefined): Palette {
    const palettes: Record<string, Palette> = { ...DEFAULT_PALETTES, ...(config.tariff_palettes ?? {}) };
    const wanted = String(state ?? '').toLowerCase();
    const key = Object.keys(palettes).find(k => k.toLowerCase() === wanted);
    return key ? palettes[key] : (config.tariff_palettes?.[DEFAULT_TARIFF] ?? DEFAULT_PALETTES[DEFAULT_TARIFF]);
}

export function computeBackground(config: EnergySkyCardConfig, hass: HomeAssistant): Background {
    const sun = hass.states[config.sun_entity ?? 'sun.sun']?.state;
    const production = productionPower(config, hass) ?? 0;
    const max = config.production_max && config.production_max > 0 ? config.production_max : DEFAULT_PRODUCTION_MAX;
    const ratio = Math.min(Math.max(production, 0) / max, 1);
    const halo = Math.round(ratio * HALO_MAX_ALPHA * 1000) / 1000;
    const base = { mode: sun === 'below_horizon' ? 'night' as const : 'day' as const, producing: production > 0 };
    if (config.background === 'solid') {
        // One calm colour: no halo
        return { ...base, sky: 'solid', palette: solidPalette(config.background_color ?? DEFAULT_SOLID_COLOR), nightPalette: NIGHT_PALETTE, haloAlpha: 0 };
    }
    if (config.background === 'weather') {
        const weather = weatherKey(hass.states[config.weather_entity ?? '']?.state);
        const look = WEATHER[weather];
        return { ...base, sky: 'weather', weather, palette: look.day, nightPalette: look.night, haloAlpha: look.halo ? halo : 0 };
    }
    return {
        ...base,
        sky: 'tempo',
        palette: tariffPalette(config, config.tariff_color_entity ? hass.states[config.tariff_color_entity]?.state : undefined),
        nightPalette: NIGHT_PALETTE,
        haloAlpha: halo,
    };
}
