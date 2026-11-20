// The card's strings (French, English, German, Spanish, Italian, Dutch), and the number format.

import type { HomeAssistant } from './types';

export type CardString =
    | 'produced' | 'battery' | 'grid'
    | 'solar' | 'home' | 'stale'
    | 'voltage' | 'outage' | 'tomorrow' | 'soc_reached' | 'soc_reached_short' | 'consumption' | 'consumption_short';

const STRINGS: Record<'fr' | 'en' | 'de' | 'es' | 'it' | 'nl', Record<CardString, string>> = {
    fr: {
        produced: '{value} kWh produits',
        battery: 'Batterie', grid: 'Réseau', solar: 'Solaire', home: 'Maison',
        stale: 'Pas de nouvelle valeur depuis {age}',
        voltage: 'Tension', outage: 'Coupure', tomorrow: 'Prévu demain',
        soc_reached: 'SOC atteint', soc_reached_short: 'SOC ✓', consumption: 'Consommation', consumption_short: 'Conso.',
    },
    en: {
        produced: '{value} kWh produced',
        battery: 'Battery', grid: 'Grid', solar: 'Solar', home: 'Home',
        stale: 'No new reading for {age}',
        voltage: 'Voltage', outage: 'Outage', tomorrow: 'Tomorrow',
        soc_reached: 'SOC reached', soc_reached_short: 'SOC ✓', consumption: 'Consumption', consumption_short: 'Use',
    },
    de: {
        produced: '{value} kWh erzeugt',
        battery: 'Batterie', grid: 'Netz', solar: 'Solar', home: 'Haus',
        stale: 'Kein neuer Wert seit {age}',
        voltage: 'Spannung', outage: 'Ausfall', tomorrow: 'Morgen',
        soc_reached: 'SOC erreicht', soc_reached_short: 'SOC ✓', consumption: 'Verbrauch', consumption_short: 'Verbr.',
    },
    es: {
        produced: '{value} kWh producidos',
        battery: 'Batería', grid: 'Red', solar: 'Solar', home: 'Casa',
        stale: 'Sin valor nuevo desde hace {age}',
        voltage: 'Tensión', outage: 'Corte', tomorrow: 'Mañana',
        soc_reached: 'SOC alcanzado', soc_reached_short: 'SOC ✓', consumption: 'Consumo', consumption_short: 'Cons.',
    },
    it: {
        produced: '{value} kWh prodotti',
        battery: 'Batteria', grid: 'Rete', solar: 'Solare', home: 'Casa',
        stale: 'Nessun nuovo valore da {age}',
        voltage: 'Tensione', outage: 'Blackout', tomorrow: 'Domani',
        soc_reached: 'SOC raggiunto', soc_reached_short: 'SOC ✓', consumption: 'Consumo', consumption_short: 'Cons.',
    },
    nl: {
        produced: '{value} kWh opgewekt',
        battery: 'Batterij', grid: 'Net', solar: 'Zon', home: 'Huis',
        stale: 'Geen nieuwe waarde sinds {age}',
        voltage: 'Spanning', outage: 'Storing', tomorrow: 'Morgen',
        soc_reached: 'SOC bereikt', soc_reached_short: 'SOC ✓', consumption: 'Verbruik', consumption_short: 'Verbr.',
    },
};

export const CARD_STRINGS: Readonly<typeof STRINGS> = STRINGS;

export type Lang = keyof typeof STRINGS;

/** The languages the card speaks */
export const LANGUAGES = Object.keys(STRINGS) as Lang[];

/** The dashboard's language (the user's profile, then Home Assistant's), reduced to one the card speaks, else English */
export function cardLanguage(hass: Pick<HomeAssistant, 'language' | 'locale'> | undefined): Lang {
    const base = (hass?.locale?.language || hass?.language || 'en').toLowerCase().split(/[-_]/)[0];
    return (LANGUAGES as string[]).includes(base) ? base as Lang : 'en';
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
