// The card's strings in French and English, and the number format.

import type { HomeAssistant } from './types';

export type CardString =
    | 'produced' | 'battery' | 'grid'
    | 'solar' | 'home'
    | 'voltage' | 'outage' | 'tomorrow' | 'soc_reached' | 'soc_reached_short' | 'consumption' | 'consumption_short';

const STRINGS: Record<'fr' | 'en', Record<CardString, string>> = {
    fr: {
        produced: '{value} kWh produits',
        battery: 'Batterie', grid: 'Réseau', solar: 'Solaire', home: 'Maison',
        voltage: 'Tension', outage: 'Coupure', tomorrow: 'Prévu demain',
        soc_reached: 'SOC atteint', soc_reached_short: 'SOC ✓', consumption: 'Consommation', consumption_short: 'Conso.',
    },
    en: {
        produced: '{value} kWh produced',
        battery: 'Battery', grid: 'Grid', solar: 'Solar', home: 'Home',
        voltage: 'Voltage', outage: 'Outage', tomorrow: 'Tomorrow',
        soc_reached: 'SOC reached', soc_reached_short: 'SOC ✓', consumption: 'Consumption', consumption_short: 'Use',
    },
};

export const CARD_STRINGS: Readonly<typeof STRINGS> = STRINGS;

export type Lang = keyof typeof STRINGS;

/** The dashboard's language (the user's profile, then Home Assistant's), reduced to fr or en */
export function cardLanguage(hass: Pick<HomeAssistant, 'language' | 'locale'> | undefined): Lang {
    const language = (hass?.locale?.language || hass?.language || 'en').toLowerCase();
    return language.startsWith('fr') ? 'fr' : 'en';
}

export function localize(lang: Lang, key: CardString, vars: Record<string, string> = {}): string {
    return STRINGS[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? '');
}

/** What the user's number format setting says the decimal separator is */
export function decimalSeparator(hass: Pick<HomeAssistant, 'language' | 'locale'> | undefined): string {
    switch (hass?.locale?.number_format) {
        case 'decimal_comma':
        case 'space_comma':
            return ',';
        case 'comma_decimal':
        case 'none':
            return '.';
        case 'system':
            return sepFor(undefined);
        default:
            return sepFor(hass?.locale?.language || hass?.language || 'en');
    }
}

function sepFor(language: string | undefined): string {
    try {
        return new Intl.NumberFormat(language).formatToParts(1.5).find(p => p.type === 'decimal')?.value ?? '.';
    } catch {
        return '.';
    }
}

/** Everything the formatters need about the locale */
export interface NumberLocale {
    lang: Lang;
    decimal: string;
}

export function numberLocale(hass: Pick<HomeAssistant, 'language' | 'locale'> | undefined): NumberLocale {
    return { lang: cardLanguage(hass), decimal: decimalSeparator(hass) };
}
