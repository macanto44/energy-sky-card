// What the sky holds at this moment: how far day has turned to night, the
// dawn or dusk glow, the sun (its colour by height, its strength by the
// production) and the moon (its phase and lit side), from sun.sun's
// elevation and azimuth or from Home Assistant's place. Pure.

import { moonView, sunPosition } from './astro';
import type { Background } from './sky';
import type { EnergySkyCardConfig, HomeAssistant } from './types';

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** How much each weather lets the dawn and dusk colours through */
const GLOW_THROUGH: Record<string, number> = {
    sunny: 1, partlycloudy: 1, windy: 0.85, cloudy: 0.35, fog: 0.3, snowy: 0.3, 'snowy-rainy': 0.25, rainy: 0.25, pouring: 0.15, lightning: 0.15, 'lightning-rainy': 0.15,
};

export interface SunView {
    /** Place on the sky: 0 rising (east) … 1 setting (west), 0 at the horizon … 1 high */
    u: number;
    v: number;
    /** Production share, 0 … 1: the glow's and the rays' strength */
    p: number;
    /** 0 … 1: fading out as it sets, in as it rises */
    opacity: number;
    /** Low and warm, flattened, a little larger by the horizon; white and round high up */
    warmth: number;
    /** Rays (clear sky only): how many */
    rays: number;
}

export interface MoonSky {
    u: number;
    v: number;
    lit: number;
    /** The CSS rotation that turns its lit side (drawn on the right) towards the sun */
    rotate: number;
    opacity: number;
}

export interface Celestial {
    /** 1 day … 0 night (the day layer's opacity) */
    day: number;
    /** 0 … 1: how many stars show (night falling, the moon's light) */
    stars: number;
    /** Dawn or dusk: its strength (0 … 1) and which */
    twilight: number;
    dawn: boolean;
    sun?: SunView;
    moon?: MoonSky;
}

/** The sun's elevation and azimuth: sun.sun's attributes, else worked out for Home Assistant's place */
function sunNow(config: EnergySkyCardConfig, hass: HomeAssistant, now: number): { alt: number; az: number } | undefined {
    const attrs = hass.states[config.sun_entity ?? 'sun.sun']?.attributes;
    const alt = Number(attrs?.elevation), az = Number(attrs?.azimuth);
    if (attrs?.elevation !== undefined && attrs?.azimuth !== undefined && Number.isFinite(alt) && Number.isFinite(az)) return { alt, az };
    const { latitude, longitude } = hass.config ?? {};
    return typeof latitude === 'number' && typeof longitude === 'number' ? sunPosition(now, latitude, longitude) : undefined;
}

/** East (0) to west (1) along the day's arc, whichever hemisphere: in the north the sun crosses the south */
export function eastToWest(az: number, latitude: number): number {
    return clamp01(latitude >= 0 ? (az - 90) / 180 : (((90 - az) % 360) + 360) % 360 / 180);
}

/** The strength of the dawn / dusk glow at a sun elevation (degrees) */
export function twilightStrength(alt: number): number {
    if (alt >= 12 || alt <= -7) return 0;
    if (alt >= 2) return (12 - alt) / 10;
    if (alt >= -1) return 1;
    return (alt + 7) / 6;
}

export function celestial(config: EnergySkyCardConfig, hass: HomeAssistant, bg: Background, now = Date.now()): Celestial {
    const sun = sunNow(config, hass, now);
    const night = bg.mode === 'night';
    if (!sun) return { day: night ? 0 : 1, stars: night ? 1 : 0, twilight: 0, dawn: false };
    const { latitude, longitude } = hass.config ?? {};
    const lat = typeof latitude === 'number' ? latitude : 45;
    const weather = bg.weather;
    // Day deepens into night from 5° above the horizon to 4° below; the stars come out from 1° below to 8° below
    const day = clamp01((sun.alt + 4) / 9);
    let stars = clamp01((-sun.alt - 1) / 7);
    const rising = eastToWest(sun.az, lat) < 0.5;
    const through = bg.sky === 'solid' ? 0 : weather ? GLOW_THROUGH[weather] ?? 0.3 : 1;
    const view: Celestial = { day, stars, twilight: twilightStrength(sun.alt) * through, dawn: rising };

    // The sun: on skies that show it (Tempo, a clear or partly clear weather), above the horizon
    const shows = bg.sky === 'tempo' || (bg.sky === 'weather' && bg.haloAlpha >= 0 && ['sunny', 'partlycloudy', 'windy'].includes(weather ?? ''));
    if (shows && sun.alt > -1) {
        const p = clamp01(bg.haloAlpha / 0.55);
        const clear = bg.sky === 'tempo' || weather === 'sunny' || weather === 'windy';
        view.sun = {
            u: eastToWest(sun.az, lat), v: clamp01(sun.alt / 60), p,
            opacity: clamp01((sun.alt + 1) / 3),
            warmth: clamp01(1 - sun.alt / 25),
            rays: clear && sun.alt > 8 && p > 0.05 ? (p > 0.8 ? 12 : 6) : 0,
        };
    }

    // The moon: up, lit enough, through a clear enough sky; pale by day, and only well away from the sun
    if (typeof latitude === 'number' && typeof longitude === 'number' && (!weather || ['sunny', 'partlycloudy', 'windy'].includes(weather))) {
        const m = moonView(now, latitude, longitude);
        const byNight = m.alt > 0 && m.lit > 0.03 ? clamp01(m.alt / 4) : 0;
        // A crescent too thin or too near the sun is lost in the daylight
        const byDay = m.elongation > 50 && m.lit > 0.25 ? 0.55 * byNight : 0;
        const opacity = mix(byNight, byDay, day);
        if (opacity > 0.02) {
            view.moon = {
                u: eastToWest(m.az, lat), v: clamp01(m.alt / 60), lit: m.lit,
                rotate: Math.round(lat >= 0 ? m.limb - 90 : -m.limb - 90), opacity,
            };
            // Its light hides the faint stars
            view.stars = stars = stars * (1 - 0.55 * m.lit * byNight);
        }
    }
    return view;
}

/**
 * The moon's disc at its phase, lit side on the right (rotated into place by
 * the card): the lit part with its shading and seas, the dark part faint
 * with earthshine. Numbers only; id keeps its gradients apart.
 */
export function moonMarkup(lit: number, id: string): string {
    const rx = Math.abs(1 - 2 * lit).toFixed(3);
    const shape = lit >= 0.99 ? 'M0,-1A1,1 0 1 1 0,1A1,1 0 1 1 0,-1' : `M0,-1A1,1 0 0 1 0,1A${rx},1 0 0 ${lit < 0.5 ? 0 : 1} 0,-1`;
    // The seas as seen from the north (Imbrium, Serenitatis, Tranquillitatis, Crisium, Fecunditatis, Nubium, Procellarum), and Tycho
    const seas = [[-0.3, -0.38, 0.3, 0.22], [0.16, -0.36, 0.2, 0.16], [0.32, -0.02, 0.22, 0.17], [0.62, -0.2, 0.12, 0.1], [0.5, 0.28, 0.13, 0.16], [-0.12, 0.34, 0.16, 0.12], [-0.55, 0.05, 0.22, 0.32]]
        .map(([cx, cy, ex, ey]) => `<ellipse cx="${cx}" cy="${cy}" rx="${ex}" ry="${ey}"/>`).join('');
    return `<svg viewBox="-1.05 -1.05 2.1 2.1" aria-hidden="true"><defs>`
        + `<radialGradient id="${id}g" cx=".4" cy=".38" r=".72"><stop offset="0" stop-color="#fbf8ef"/><stop offset=".7" stop-color="#ebe5d6"/><stop offset="1" stop-color="#cdc6b4"/></radialGradient>`
        + `<filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".07"/></filter>`
        + `<clipPath id="${id}c"><path d="${shape}"/></clipPath></defs>`
        + `<circle r="1" fill="rgba(170,186,225,.07)"/>`
        + `<g clip-path="url(#${id}c)"><circle r="1" fill="url(#${id}g)"/><g fill="rgba(118,122,138,.3)" filter="url(#${id}b)">${seas}</g>`
        + `<circle cx=".12" cy=".74" r=".07" fill="rgba(255,255,255,.55)" filter="url(#${id}b)"/></g></svg>`;
}
