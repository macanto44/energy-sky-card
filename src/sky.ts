// The background: day gradient in the tariff colour with a sun halo, or the night sky,
// and the WCAG colour maths the contrast test relies on.

import type { EnergySkyCardConfig, HomeAssistant } from './types';
import { powerW } from './utils';

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
export const DEFAULT_PRODUCTION_MAX = 6000;

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

export interface Background {
    mode: 'day' | 'night';
    /** The tariff palette (by day) */
    palette: Palette;
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
    const production = powerW(hass.states[config.production_entity]) ?? 0;
    const max = config.production_max && config.production_max > 0 ? config.production_max : DEFAULT_PRODUCTION_MAX;
    const ratio = Math.min(Math.max(production, 0) / max, 1);
    return {
        mode: sun === 'below_horizon' ? 'night' : 'day',
        palette: tariffPalette(config, config.tariff_color_entity ? hass.states[config.tariff_color_entity]?.state : undefined),
        haloAlpha: Math.round(ratio * HALO_MAX_ALPHA * 1000) / 1000,
        producing: production > 0,
    };
}
