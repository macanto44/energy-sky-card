// The card's stylesheet: typography (brief §5.2), sky layers, motion.

import { CLOUD_MAX_ALPHA, CLOUD_RGB, FLOOR_GLOW, FLOW_COLOURS, FOG_ALPHA, MOONLIGHT, SIDE_HALO, SIDE_SKY_FROM, SUN_BLOOM, SUN_BREATHE, SUN_GLOW, TWILIGHT } from '../sky';
import { FLOW_HEIGHT, MAX_CONSUMERS, NODE_HEIGHT, WIRE_KEYS } from '../flow';

const cloud = (alpha: number) => `rgba(${CLOUD_RGB.join(', ')}, ${alpha})`;
const rgb = (c: readonly number[]) => c.join(', ');
/** The dawn / dusk glow, from the bottom: its low colour, 55 % of it in its mid colour at 45 %, none from 85 % */
const twilight = (tone: { low: readonly number[]; mid: readonly number[] }) =>
    `linear-gradient(0deg, rgba(${rgb(tone.low)}, ${TWILIGHT.alpha}) 0%, rgba(${rgb(tone.mid)}, ${TWILIGHT.alpha * 0.55}) 45%, rgba(${rgb(tone.mid)}, 0) 85%)`;
/** The same glow carried on under the sky, over the flow's floor: from the low colour at the seam down to nothing (sky.ts, FLOOR_GLOW) */
const floorGlow = (tone: { low: readonly number[]; mid: readonly number[] }) =>
    `linear-gradient(180deg, rgba(${rgb(tone.low)}, ${TWILIGHT.alpha}) 0, rgba(${rgb(tone.mid)}, ${TWILIGHT.alpha * 0.55}) ${FLOOR_GLOW.mid}px, rgba(${rgb(tone.mid)}, 0) ${FLOOR_GLOW.end}px)`;
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
/** Side layout: the gradient from SIDE_SKY_FROM down, its first stop a mix of the top two */
const SIDE_SKY = `linear-gradient(180deg, color-mix(in srgb, var(--esc-c0, #4b90d5) ${pct(1 - SIDE_SKY_FROM / 0.6)}, var(--esc-c1, #2169b0)) 0%, var(--esc-c1, #2169b0) ${pct((0.6 - SIDE_SKY_FROM) / (1 - SIDE_SKY_FROM))}, var(--esc-c2, #1d4f87) 100%)`;
const SIDE_HALO_AT = `${SIDE_HALO.x}px ${SIDE_HALO.y}px`;
export { FLOW_COLOURS };
/**
 * Each colour's CSS variable: a Home Assistant theme sets it for every card,
 * flow_colors in the config for one (on the host). The default otherwise.
 */
export const FLOW_COLOUR_VARS = { sun: '--energy-sky-card-solar', grid: '--energy-sky-card-grid', batt: '--energy-sky-card-battery', use: '--energy-sky-card-consumption' } as const;
const flowColour = (k: keyof typeof FLOW_COLOURS) => `var(${FLOW_COLOUR_VARS[k]}, ${FLOW_COLOURS[k]})`;
/** The node's glass: white over the sky at this opacity at most (the contrast test uses it) */
export const NODE_GLASS_ALPHA = 0.14;
/** Per level: the wire's width (px) and one comet's trip (s) */
const LEVELS = [[1.6, 3.2], [2.4, 2.6], [3.2, 2], [4, 1.4]] as const;

/**
 * An animation, declared only while motion is on or paused (data-motion),
 * on host attributes; the play state after the shorthand, which resets it
 */
const animated = (host: string, target: string, declarations: string) =>
    `:host([data-motion="on"]${host}) ${target},\n:host([data-motion="paused"]${host}) ${target} { ${declarations} animation-play-state: var(--esc-play); }`;

export const CARD_CSS = `
:host {
    display: block;
    height: 100%;
    /* Apple's system font on iPhone and Mac, Home Assistant's body font elsewhere */
    --esc-font: system-ui, -apple-system, "SF Pro Text", var(--ha-font-family-body, Roboto), sans-serif;
    --esc-font-display: system-ui, -apple-system, "SF Pro Display", var(--ha-font-family-body, Roboto), sans-serif;
    --esc-hero-size: 56px;
}
ha-card {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    color: #fff;
    background: var(--esc-n2, #0b1026);
    border: none;
    -webkit-tap-highlight-color: transparent;
}
/* The sky: two layers, day and night, one shown at a time */
.sky { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
/* The night underneath, the day over it, fading with the sun's height (--esc-day: 1 day … 0 night) */
.layer { position: absolute; inset: 0; }
.layer.day { opacity: var(--esc-day, 1); }
.layer.day { background: linear-gradient(180deg, var(--esc-c0, #4b90d5) 0%, var(--esc-c1, #2169b0) 60%, var(--esc-c2, #1d4f87) 100%); }
.layer.night { background: linear-gradient(180deg, var(--esc-n0, #1d2b4d) 0%, var(--esc-n1, #121b36) 60%, var(--esc-n2, #0b1026) 100%); }
/*
 * The weather sky (background: weather): cumulus clouds drifting across,
 * rain, snow, fog bands, a lightning flash; all under the text. Raindrops
 * and snowflakes only show while they fall (motion on); clouds and fog
 * rest where they are without motion. The Tempo sky's cloud shadows give
 * way to the clouds.
 */
.wx { position: absolute; inset: 0; overflow: hidden; }
.cloudband { position: absolute; inset: 0; }
.cumulus { position: absolute; filter: blur(0.6px); }
.cumulus g { fill: #f4f7fb; opacity: var(--esc-cloud-a, 0.12); }
/* Far clouds: smaller, slower, fainter, softer (the card sets their size and pace) */
.cloudband.far .cumulus { filter: blur(1.2px); }
.cloudband.far .cumulus g { opacity: calc(var(--esc-cloud-a, 0.12) * 0.6); }
/* The side layout is short: smaller clouds, so one doesn't fill its height */
:host([data-layout="side"]) .cumulus { transform: scale(0.5); transform-origin: 0 0; }
.drop { position: absolute; top: 0; width: 1.2px; height: 16px; background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55)); display: none; }
.flake { position: absolute; top: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.85); display: none; }
.fogband { position: absolute; left: -40%; width: 180%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 255, 255, ${FOG_ALPHA}), rgba(255, 255, 255, 0)); }
/* Lightning lights a cloud from inside, and the sky a little */
.flash { position: absolute; inset: 0; opacity: 0; background: radial-gradient(ellipse 34% 26% at var(--esc-flash-x, 70%) 14%, rgba(236, 236, 255, 0.85), rgba(236, 236, 255, 0) 100%), linear-gradient(rgba(244, 242, 255, 0.22), rgba(244, 242, 255, 0.22)); }
:host([data-sky="weather"]) .drift { display: none; }
/* At night, the stars get through a clear sky only, or a few between clouds */
:host([data-stars="none"]) .layer.night .star, :host([data-stars="none"]) .layer.night .shooting { display: none; }
:host([data-stars="few"]) .layer.night .star:nth-of-type(3n+1), :host([data-stars="few"]) .layer.night .star:nth-of-type(3n+2) { display: none; }
.halo {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 88% 12%, rgb(255, 214, 140), rgba(255, 214, 140, 0) 45%);
    opacity: var(--esc-halo-alpha, 0);
    transform-origin: 88% 12%;
}
.star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
    opacity: calc(var(--esc-o, 1) * var(--esc-stars, 1));
}
.star.twinkle { opacity: calc(var(--esc-o, 1) * var(--esc-stars, 1) * 0.6); }
/*
 * Dawn and dusk (standard and side): a glow rising from the bottom while the
 * sun is low, rose at dawn, amber at dusk (--esc-twilight: its strength,
 * already lowered by the weather).
 */
.tint { position: absolute; inset: 0; opacity: var(--esc-twilight, 0); background: ${twilight(TWILIGHT.dusk)}; }
:host([data-dawn]) .tint { background: ${twilight(TWILIGHT.dawn)}; }
/*
 * The sun (standard layout; the side layout keeps the halo): placed by the
 * card (--esc-sun-x / -y, px), clear of the text. The sky lit around it, a
 * bloom that breathes, a white core, fine rays that shimmer and turn very
 * slowly. --esc-p: the production share; --esc-warm: its glow's colour,
 * white-gold high up, amber by the horizon, where it also flattens.
 */
.sun, .moon, .moonlight { position: absolute; left: var(--esc-sun-x, 80%); top: var(--esc-sun-y, 20px); width: 0; height: 0; opacity: var(--esc-sun-o, 0); }
.sun > i { position: absolute; border-radius: 50%; }
.sun .glow { width: ${SUN_GLOW.radius * 2}px; height: ${SUN_GLOW.radius * 2}px; margin: -${SUN_GLOW.radius}px; background: radial-gradient(closest-side, rgba(var(--esc-warm, ${rgb(SUN_GLOW.rgb)}), calc(${SUN_GLOW.alpha(0)} + ${SUN_GLOW.alpha(1) - SUN_GLOW.alpha(0)} * var(--esc-p, 0))), rgba(var(--esc-warm, ${rgb(SUN_GLOW.rgb)}), 0)); }
.sun .bloom { width: ${SUN_BLOOM.radius * 2}px; height: ${SUN_BLOOM.radius * 2}px; margin: -${SUN_BLOOM.radius}px; background: radial-gradient(closest-side, rgba(var(--esc-bloom, ${rgb(SUN_BLOOM.rgb)}), calc(${SUN_BLOOM.alpha(0)} + ${SUN_BLOOM.alpha(1) - SUN_BLOOM.alpha(0)} * var(--esc-p, 0))), rgba(var(--esc-warm, ${rgb(SUN_BLOOM.rgb)}), 0)); }
.sun .core {
    width: 15px; height: 15px; margin: -7.5px;
    background: radial-gradient(circle, var(--esc-core, #fff) 0 50%, var(--esc-rim, #fff4d6) 82%, var(--esc-edge, #ffe6a8) 100%);
    box-shadow: 0 0 3px 1px var(--esc-core, #fff), 0 0 12px 4px rgba(var(--esc-warm, 255, 244, 214), 0.75), 0 0 28px 9px rgba(var(--esc-warm, 255, 236, 190), calc(0.2 + 0.3 * var(--esc-p, 0)));
    transform: scale(var(--esc-sun-scale, 1), calc(var(--esc-sun-scale, 1) * var(--esc-flat, 1)));
}
.sun .rays { width: 0; height: 0; }
.sun .rays b {
    position: absolute; left: -0.6px; top: calc(var(--esc-ray, 60px) * var(--l, 1) / -2); width: 1.2px; height: calc(var(--esc-ray, 60px) * var(--l, 1)); border-radius: 1px;
    background: linear-gradient(180deg, rgba(255, 252, 240, 0), rgba(255, 252, 240, 0.85) 50%, rgba(255, 252, 240, 0));
    filter: blur(0.6px); transform: rotate(var(--a)); opacity: calc(0.25 + 0.4 * var(--esc-p, 0));
}
.sun:not([data-rays]) .rays, .sun[data-rays="6"] .rays b:nth-child(n+7) { display: none; }
/* The moon: its phase drawn by the card, lit side turned towards the sun (--esc-moon-r); moonlight around it */
.moon, .moonlight { left: var(--esc-moon-x, 80%); top: var(--esc-moon-y, 20px); opacity: var(--esc-moon-o, 0); }
.moon svg { position: absolute; width: 28px; height: 28px; left: -14px; top: -14px; overflow: visible; transform: rotate(var(--esc-moon-r, 0deg)); filter: drop-shadow(0 0 4px rgba(240, 236, 222, 0.55)) drop-shadow(0 0 14px rgba(200, 212, 255, 0.25)); }
.moonlight::before { content: ''; position: absolute; width: ${MOONLIGHT.radius * 2}px; height: ${MOONLIGHT.radius * 2}px; margin: -${MOONLIGHT.radius}px; border-radius: 50%; background: radial-gradient(closest-side, rgba(${rgb(MOONLIGHT.rgb)}, calc(${MOONLIGHT.alpha(0)} + ${MOONLIGHT.alpha(1) - MOONLIGHT.alpha(0)} * var(--esc-moon-lit, 0))), rgba(${rgb(MOONLIGHT.rgb)}, 0)); }
/* The side layout keeps the halo: no room for a sun or a moon clear of its text */
:host([data-layout="side"]) .sun, :host([data-layout="side"]) .moon, :host([data-layout="side"]) .moonlight, :host(:not([data-layout="side"])) .halo { display: none; }
/*
 * A rainbow after the rain, while the sun is low enough (below 42°): the
 * sun is then behind you, so it doesn't show. Its arc rises as the sun
 * sinks; it fades out above the context line and stays right of the hero
 * (--esc-bow-x / -y / -fade, px, set by the card).
 */
.rainbow {
    position: absolute; display: none; left: var(--esc-bow-x, 60%); top: var(--esc-bow-y, 20px); width: 300px; height: 300px; margin-left: -150px; border-radius: 50%;
    background: radial-gradient(circle, transparent 57%, rgba(255, 90, 90, 0.3) 59.5%, rgba(255, 170, 60, 0.3) 61.5%, rgba(255, 235, 90, 0.28) 63.5%, rgba(90, 210, 120, 0.27) 65.5%, rgba(80, 140, 255, 0.27) 67.5%, rgba(150, 100, 230, 0.25) 69.5%, transparent 71.5%);
    -webkit-mask-image: linear-gradient(180deg, #000 calc(var(--esc-bow-fade, 90px) - 50px), transparent var(--esc-bow-fade, 90px));
    mask-image: linear-gradient(180deg, #000 calc(var(--esc-bow-fade, 90px) - 50px), transparent var(--esc-bow-fade, 90px));
}
:host([data-rainbow]:not([data-layout="side"])) .rainbow { display: block; }
:host([data-rainbow]) .sun { display: none; }
/* Raindrops landing: a splash on the card's bottom edge */
.splash { position: absolute; bottom: 2px; width: 10px; height: 4px; border-radius: 50%; border-top: 1.4px solid rgba(255, 255, 255, 0.5); opacity: 0; display: none; }
/* A full battery: a golden sheen crosses its node now and then */
.node[data-full] { overflow: hidden; }
.node[data-full]::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background: linear-gradient(105deg, rgba(255, 214, 120, 0) 36%, rgba(255, 214, 120, 0.38) 50%, rgba(255, 214, 120, 0) 64%); transform: translateX(-110%); }
/* A day at 100 % self-sufficiency: the evening's first shooting star is golden */
:host([data-golden]) .shooting:first-of-type { background: linear-gradient(90deg, rgba(255, 214, 120, 0), #ffd678 80%, #fff8e0); height: 2px; }
/* Touch screens (phones, tablets): the far clouds and the blurs go, for the battery's sake */
@media (pointer: coarse) {
    .cumulus, .sun .rays b { filter: none; }
    .cloudband.far { display: none; }
}
/* Particles the card hid because they would touch text */
.sky [hidden] { display: none; }
/* Shooting stars, each on its own path and rhythm (set inline); hidden unless animated */
.shooting {
    position: absolute;
    width: 64px;
    height: 1.5px;
    border-radius: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff);
    opacity: 0;
    transform-origin: 100% 50%;
}
/*
 * By day, cloud shadows: soft dark bands, each in a card-wide .drift that
 * crosses from -110 % to 110 % (the cloud fully off both edges). They only
 * darken the sky; without motion they rest where they are.
 */
.drift { position: absolute; inset: 0; }
.cloud {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(closest-side, ${cloud(CLOUD_MAX_ALPHA)}, ${cloud(CLOUD_MAX_ALPHA / 2)} 50%, ${cloud(0)} 100%);
}
/*
 * Motion. data-motion on the host: "on" runs, "paused" holds (tab hidden,
 * card off-screen: the phase is kept), "off" never animates (animate: false,
 * prefers-reduced-motion). Every animation below is declared under on or
 * paused only; test/motion.test.ts holds the stylesheet to that.
 */
@keyframes esc-breathe {
    from { opacity: calc(var(--esc-halo-alpha, 0) * 0.55); transform: scale(1); }
    to { opacity: calc(var(--esc-halo-alpha, 0) * 1); transform: scale(1.12); }
}
@keyframes esc-twinkle {
    from { opacity: calc(var(--esc-o, 1) * var(--esc-stars, 1) * 0.15); transform: translate(-50%, -50%) scale(0.6); }
    to { opacity: calc(var(--esc-o, 1) * var(--esc-stars, 1)); transform: translate(-50%, -50%) scale(1.4); }
}
/* One pass in the first 8 % of each period (0.9 s of 11 s), quiet the rest of the time */
@keyframes esc-shoot {
    0% { opacity: 0; transform: rotate(var(--esc-shoot-angle, 20deg)) translateX(0) scaleX(0.3); }
    2% { opacity: 1; }
    8% { opacity: 0; transform: rotate(var(--esc-shoot-angle, 20deg)) translateX(var(--esc-shoot-run, 110px)) scaleX(1); }
    100% { opacity: 0; transform: rotate(var(--esc-shoot-angle, 20deg)) translateX(var(--esc-shoot-run, 110px)) scaleX(1); }
}
/* Rain slanting down; snow drifting down, swaying; fog bands breathing to and fro; lightning: two quick flashes in 7 s */
/* Rain slanting with the wind (--esc-rain-dx / -rot, from the weather's wind), splashing as it lands */
@keyframes esc-rain { from { transform: translate(0, -30px) rotate(var(--esc-rain-rot, 12deg)); } to { transform: translate(var(--esc-rain-dx, -70px), 300px) rotate(var(--esc-rain-rot, 12deg)); } }
@keyframes esc-splash { 0% { transform: scale(0.2); opacity: 0.85; } 100% { transform: scale(1.6); opacity: 0; } }
/* The sun: its bloom breathes, its rays shimmer and turn; a full battery's sheen */
@keyframes esc-sun-breathe { from { transform: scale(0.9); opacity: 0.78; } to { transform: scale(${SUN_BREATHE}); opacity: 1; } }
@keyframes esc-sun-turn { to { transform: rotate(360deg); } }
@keyframes esc-ray { from { opacity: calc(0.12 + 0.2 * var(--esc-p, 0)); } to { opacity: calc(0.35 + 0.5 * var(--esc-p, 0)); } }
@keyframes esc-sheen { 0% { transform: translateX(-110%); } 22%, 100% { transform: translateX(110%); } }
@keyframes esc-snow { 0% { transform: translate(0, -10px); } 25% { transform: translate(9px, 70px); } 50% { transform: translate(-7px, 145px); } 75% { transform: translate(8px, 215px); } 100% { transform: translate(0, 290px); } }
@keyframes esc-fog { from { transform: translateX(-12%); opacity: 0.7; } to { transform: translateX(12%); opacity: 1; } }
@keyframes esc-flash { 0%, 60%, 100% { opacity: 0; } 61% { opacity: 0.8; } 62% { opacity: 0.15; } 63.5% { opacity: 0.65; } 66% { opacity: 0; } }
/* A cloud's band crossing the card, left to right */
@keyframes esc-drift {
    from { transform: translateX(-110%); }
    to { transform: translateX(110%); }
}
/* The play state comes through a variable: the animation shorthand would reset a separate rule's */
:host { --esc-play: running; }
:host([data-motion="paused"]) { --esc-play: paused; }
${animated('[data-mode="day"][data-producing]', '.halo', 'animation: esc-breathe 3s ease-in-out infinite alternate;')}
${animated('[data-mode="night"]', '.star.twinkle', 'animation: esc-twinkle 2s ease-in-out infinite alternate;')}
${animated('[data-mode="night"]', '.shooting', 'animation: esc-shoot var(--esc-shoot-period, 11s) ease-out var(--esc-shoot-delay, 4s) infinite;')}
${animated('[data-mode="day"]', '.drift', 'animation: esc-drift 60s linear infinite;')}
${animated('[data-sky="weather"]', '.cloudband', 'animation: esc-drift 60s linear infinite var(--esc-wind-dir, normal);')}
${animated('[data-sky="weather"]', '.drop', 'display: block; animation: esc-rain 0.7s linear infinite;')}
${animated('[data-sky="weather"]', '.splash', 'display: block; animation: esc-splash 0.9s ease-out infinite;')}
${animated('[data-mode="day"][data-producing]', '.sun .bloom', 'animation: esc-sun-breathe 3s ease-in-out infinite alternate;')}
${animated('[data-mode="day"]', '.sun .rays', 'animation: esc-sun-turn 240s linear infinite;')}
${animated('[data-mode="day"]', '.sun .rays b', 'animation: esc-ray var(--s, 3s) ease-in-out var(--d, 0s) infinite alternate;')}
${animated('[data-expanded]', '.node[data-full]::after', 'animation: esc-sheen 8s ease-in-out 1s infinite;')}
${animated('[data-sky="weather"]', '.flake', 'display: block; animation: esc-snow 8s linear infinite;')}
${animated('[data-sky="weather"]', '.fogband', 'animation: esc-fog 18s ease-in-out infinite alternate;')}
${animated('[data-sky="weather"]', '.flash', 'animation: esc-flash 7s infinite;')}
/* Day ⇄ night: a 3 s cross-fade, once the first state is painted */
:host([data-ready]:not([data-motion="off"])) .layer { transition: opacity 3s ease-in-out; }
/* The flow's comets, along their wire (their keyframes are drawn for the width by layoutFlow), only unfolded */
${animated('[data-expanded]', '.wire:not([data-level="0"]) .comet', 'display: inline; animation: esc-flow var(--esc-dur, 3s) linear var(--esc-delay, 0s) infinite; animation-name: var(--esc-flow);')}
@media (prefers-reduced-motion: reduce) {
    .halo, .star, .shooting, .drift, .layer, .comet, .cloudband, .drop, .flake, .fogband, .flash, .splash, .sun *, .node::after { animation: none !important; transition: none !important; }
}
/* Compact: the tight spacing, for a card shorter than four rows (fit() sets it last) */
:host([data-compact]) .content { padding: 14px 20px 12px; }
:host([data-compact]) .context { margin: 0 0 6px; }
:host([data-compact]) .grid { padding-top: 7px; row-gap: 4px; }
:host([data-compact]) .value { margin-top: 0; }
ha-card:focus-visible { outline: 2px solid #fff; outline-offset: -2px; }
/* A cell with a tap of its own (its entity, or its tap_action) */
.metric[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 4px; }
.content {
    position: relative;
    z-index: 1;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    /* The prototype's air: ~27 px above the hero, 22 px under the last value */
    padding: 22px 20px 16px;
    font-family: var(--esc-font);
}
.content > * { flex-shrink: 0; }
.line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hero {
    font-family: var(--esc-font-display);
    font-size: var(--esc-hero-size);
    font-weight: 200;
    line-height: 0.9;
    letter-spacing: -0.045em;
    font-variant-numeric: tabular-nums;
    /* Room for the comma's tail below the baseline */
    padding: 2px 0 3px;
}
:host([data-layout="side"]) { --esc-hero-size: 44px; }
:host([data-hero="48"]) { --esc-hero-size: 48px; }
:host([data-hero="40"]) { --esc-hero-size: 40px; }
:host([data-hero="36"]) { --esc-hero-size: 36px; }
.hero-unit {
    font-size: 0.4em;
    font-weight: 400;
    letter-spacing: 0;
    opacity: 0.85;
    /* A word space, as in the prototype's « 1,3 kW » */
    margin-left: 0.45em;
}
.context {
    margin-top: 12px;
    margin-bottom: 16px;
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: -0.012em;
}
.grid {
    /* Anchored to the bottom; at least the prototype's gap above the hairline */
    margin-top: auto;
    padding-top: 13px;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 12px;
}
.grid:empty { display: none; }
.metric { min-width: 0; }
.label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 13px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.75;
}
.label-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.label ha-icon { --mdc-icon-size: 13px; width: 13px; height: 13px; display: inline-flex; flex: none; }
.value {
    font-size: 16px;
    font-weight: 500;
    line-height: 21px;
    font-variant-numeric: tabular-nums;
    margin-top: 5px;
}
.extra { font-size: 13px; font-weight: 400; opacity: 0.8; }
/*
 * Side layout (layout: side, 2 rows): the hero and context on the left, the
 * cells listed on the right, one line each, the icon standing for the label
 * (still read by screen readers, and shown on hover).
 */
:host([data-layout="side"]) .layer.day { background: ${SIDE_SKY}; }
:host([data-layout="side"]) .halo {
    background: radial-gradient(circle ${SIDE_HALO.radius}px at ${SIDE_HALO_AT}, rgb(255, 214, 140), rgba(255, 214, 140, 0));
    transform-origin: ${SIDE_HALO_AT};
}
:host([data-layout="side"]) .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    grid-template-rows: auto auto;
    align-content: center;
    column-gap: 16px;
    padding: 14px 18px 12px 20px;
}
:host([data-layout="side"]) .hero { grid-column: 1; grid-row: 1; align-self: end; }
:host([data-layout="side"]) .hero:has(+ .context[hidden]) { grid-row: 1 / 3; align-self: center; }
:host([data-layout="side"]) .context {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    margin: 8px 0 0;
    font-size: 15px;
    line-height: 20px;
    /* Too long for one line beside the cells (fit() tries that first): two lines, never cut */
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
:host([data-layout="side"]) .context[hidden] { display: none; }
:host([data-layout="side"]) .grid {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
    margin: 0;
    padding: 0 0 0 16px;
    border-top: none;
    border-left: 1px solid rgba(255, 255, 255, 0.22);
    grid-template-columns: max-content;
    row-gap: 3px;
}
:host([data-layout="side"]) .metric { display: flex; align-items: center; gap: 8px; }
:host([data-layout="side"]) .label { position: relative; flex: none; }
:host([data-layout="side"]) .label ha-icon { --mdc-icon-size: 15px; width: 15px; height: 15px; }
:host([data-layout="side"]) .label-text { position: absolute; top: 0; left: 0; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
:host([data-layout="side"]) .value { margin-top: 0; font-size: 15px; line-height: 20px; }
:host([data-layout="side"]) .extra { font-size: 12.5px; }
:host([data-layout="side"][data-compact]) .content { padding: 8px 16px 6px 18px; }
:host([data-layout="side"][data-compact]) .context { margin-top: 4px; }
:host([data-layout="side"][data-compact]) .grid { row-gap: 0; }
/*
 * The energy flow (flow: tap or always): the card sets its own height (the grid's
 * rows: auto), the sky stays on the top part at its usual height, and the
 * flow unfolds below on the sky's last colour (--esc-floor: the day's over
 * the night's by the sun's height, set by the card), with dawn and dusk
 * carried on below the seam (.floor).
 */
:host([data-flow]) { height: auto; --esc-top-h: 248px; }
:host([data-flow][data-layout="side"]) { --esc-top-h: 120px; }
:host([data-flow]) ha-card { height: auto; }
:host([data-flow]) .content { height: var(--esc-top-h); }
:host([data-flow]) .sky { bottom: auto; height: var(--esc-top-h); }
:host([data-flow]) ha-card { background: var(--esc-floor, var(--esc-n2, #0b1026)); }
.floor { position: absolute; left: 0; right: 0; top: var(--esc-top-h); height: ${FLOOR_GLOW.end}px; z-index: 0; pointer-events: none; opacity: var(--esc-twilight, 0); background: ${floorGlow(TWILIGHT.dusk)}; }
:host([data-dawn]) .floor { background: ${floorGlow(TWILIGHT.dawn)}; }
:host([data-ready][data-flow]:not([data-motion="off"])) ha-card { transition: background-color 3s ease-in-out; }
:host([data-flow="tap"]) .hero, :host([data-flow="tap"]) .context { cursor: pointer; }
:host([data-flow="tap"]) .hero:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 4px; }
.panel { position: relative; z-index: 1; margin: 0 20px; padding: 10px 0 14px; border-top: 1px solid rgba(255, 255, 255, 0.22); font-family: var(--esc-font); }
:host([data-layout="side"]) .panel { margin: 0 18px 0 20px; }
.flow { position: relative; height: var(--esc-flow-h); --esc-flow-h: ${FLOW_HEIGHT}px; --esc-node-w: 118px; --esc-centre-w: 138px; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.wire path { fill: none; stroke: currentColor; stroke-linecap: round; }
.wire .line { stroke-opacity: 0.55; stroke-width: var(--esc-w); }
.wire .glow { stroke-opacity: 0.16; stroke-width: calc(var(--esc-w) + 6px); }
.wire[data-level="0"] .line { stroke: #fff; stroke-opacity: 0.16; stroke-width: 1.2px; stroke-dasharray: 2 5; }
.wire[data-level="0"] .glow, .wire[data-off] { display: none; }
/* Grid ↔ battery: one link, dotted while idle; battery → grid is drawn only while a battery sells (it lies on the same line) */
.wire[data-wire="bg"][data-level="0"] { display: none; }
/* The bridge: where grid ↔ battery passes under sun → home, a gap of the panel's colour */
.panel { --esc-panel: var(--esc-floor, var(--esc-n2, #0b1026)); }
.wire .gap { stroke: var(--esc-panel); stroke-opacity: 1; stroke-width: 10px; stroke-linecap: butt; }
${LEVELS.map(([w, d], i) => `.wire[data-level="${i + 1}"] { --esc-w: ${w}px; --esc-dur: ${d}s; }`).join('\n')}
${(Object.keys(FLOW_COLOURS) as (keyof typeof FLOW_COLOURS)[]).map(k => `.wire.${k} { color: ${flowColour(k)}; }`).join(' ')}
${[...WIRE_KEYS, ...Array.from({ length: MAX_CONSUMERS }, (_, i) => `c${i}`)].map(k => `.wire[data-wire="${k}"] { --esc-flow: esc-flow-${k}; }`).join(' ')}
/* Comets: none without motion; one at level 1, two at 2, three above, evenly spaced */
.comet { display: none; }
.comet circle { fill: currentColor; }
/* Spare comets of a quieter wire: hidden, still in step for when the wire gets busier */
.wire[data-level="1"] .c2, .wire[data-level="1"] .c3, .wire[data-level="2"] .c3 { visibility: hidden; }
.wire[data-level="2"] .c2 { --esc-delay: calc(var(--esc-dur) * -0.5); }
.wire[data-level="3"] .c2, .wire[data-level="4"] .c2 { --esc-delay: calc(var(--esc-dur) * -0.333); }
.wire[data-level="3"] .c3, .wire[data-level="4"] .c3 { --esc-delay: calc(var(--esc-dur) * -0.667); }
.node {
    position: absolute;
    top: calc((var(--esc-flow-h) - ${NODE_HEIGHT}px) / 2);
    width: var(--esc-node-w);
    height: ${NODE_HEIGHT}px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 6px;
    border-radius: ${NODE_HEIGHT / 2}px;
    /* The glass fades as dawn or dusk lights the floor behind it (the white text keeps its contrast) */
    background: linear-gradient(180deg, rgba(255, 255, 255, calc(${NODE_GLASS_ALPHA} * (1 - var(--esc-twilight, 0)))), rgba(255, 255, 255, calc(0.06 * (1 - var(--esc-twilight, 0)))));
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.node[hidden] { display: none; }
.node[data-node="solar"] { left: 0; }
.node[data-node="home"] { right: 0; }
.node[data-node="grid"], .node[data-node="battery"] { width: var(--esc-centre-w); left: calc(50% - var(--esc-centre-w) / 2); }
.node[data-node="grid"] { top: 3px; }
.node[data-node="battery"] { top: calc(var(--esc-flow-h) - ${3 + NODE_HEIGHT}px); }
.node[data-cell-target] { cursor: pointer; }
.node[data-cell-target]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.ring { position: absolute; inset: -3px; width: 40px; height: 40px; transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 2.5; }
.ring .track { stroke: rgba(255, 255, 255, 0.14); }
.seg { stroke-linecap: round; }
.seg:not([data-source]), .seg[data-source=""] { display: none; }
${(Object.keys(FLOW_COLOURS) as (keyof typeof FLOW_COLOURS)[]).map(k => `.seg[data-source="${k}"] { stroke: ${flowColour(k)}; }`).join(' ')}
.disc ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; display: inline-flex; }
.centre { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
/* The charge's unit, small beside the number so the ring's disc holds « 100 % » */
.centre { display: inline-flex; align-items: baseline; letter-spacing: -0.02em; }
.centre:not(:empty)::after { content: '%'; font-size: 7px; font-weight: 600; margin-left: 0.5px; opacity: 0.85; }
.centre[data-long] { font-size: 9px; letter-spacing: -0.04em; }
.centre[data-long]::after { font-size: 6px; }
.node[data-centre] .disc ha-icon, .node:not([data-centre]) .centre { display: none; }
.ntext { min-width: 0; display: flex; flex-direction: column; }
.nlab { font-size: 9.5px; font-weight: 600; line-height: 12px; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.78; }
.nval { font-size: 15px; font-weight: 500; line-height: 19px; font-variant-numeric: tabular-nums; }
/* The battery's estimate, a small third line under its power (« 14:20 »); none elsewhere */
.nsub { font-size: 10px; font-weight: 500; line-height: 11px; font-variant-numeric: tabular-nums; opacity: 0.85; }
.nsub:empty { display: none; }
.nsub[data-tight] { font-size: 9px; letter-spacing: -0.02em; }
.flow[data-narrow] .nval { font-size: 13.5px; }
.flow[data-narrow] .nlab { font-size: 8.5px; }
.flow[data-narrow] .node { gap: 6px; padding: 0 8px 0 5px; }
.flow[data-narrow] .disc { width: 32px; height: 32px; }
.flow[data-narrow] .ring { width: 38px; height: 38px; }
/* An appliance at rest: its disc dims, its text stays readable */
.node[data-idle] .disc { opacity: 0.55; }
/* The grid down: a red ring and border, its value reads « Coupure » */
.node[data-alert] { border-color: rgba(255, 138, 128, 0.9); }
.seg[data-source="alert"] { stroke: #ff8a80; }
/* A reading gone quiet: a dashed border (a cell's icon turns to a clock instead) */
.node[data-stale] { border-style: dashed; }
/* Compact appliances (more than two, or a narrow corner): the icon in its ring and the power; the name on hover (title) and for screen readers (aria-label) */
.flow[data-compact] .node[data-consumer] { flex-direction: column; justify-content: flex-start; gap: 3px; padding: 0; border: none; background: none; border-radius: 0; }
.flow[data-compact] .node[data-consumer][data-side="below"] { flex-direction: column-reverse; }
.flow[data-compact] .node[data-consumer] .disc { width: 30px; height: 30px; }
.flow[data-compact] .node[data-consumer] .ring { width: 36px; height: 36px; }
.flow[data-compact] .node[data-consumer] .ntext { align-items: center; max-width: 100%; }
.flow[data-compact] .node[data-consumer] .nlab { display: none; }
.flow[data-compact] .node[data-consumer] .nval { font-size: 11.5px; font-weight: 600; line-height: 13px; }
`;
