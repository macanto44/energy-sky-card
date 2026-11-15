// The card's name, in one place. esbuild.config.js reads CARD_NAME from this
// file to name the bundles, so keep it a plain single-quoted literal.

export const CARD_NAME = 'energy-sky-card';
export const CARD_EDITOR_NAME = `${CARD_NAME}-editor`;
export const CARD_DISPLAY_NAME = 'Energy Sky Card';
export const CARD_DESCRIPTION = 'Solar production, battery and grid on a sky that follows the tariff colour and the sun';
export const CARD_DOC_URL = 'https://github.com/macanto44/energy-sky-card';

/** Injected by esbuild (and vitest) from package.json */
declare const __VERSION__: string;
export const CARD_VERSION: string = __VERSION__;
