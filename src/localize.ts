// The card's strings (French, English, German, Spanish, Italian, Dutch), and the number format.

import type { HomeAssistant } from './types';

export type CardString =
    | 'produced' | 'battery' | 'grid'
    | 'solar' | 'home' | 'stale'
    | 'voltage' | 'outage' | 'tomorrow' | 'soc_reached' | 'soc_reached_short' | 'consumption' | 'consumption_short'
    | 'full_at' | 'full_in' | 'reserve_at' | 'reserve_in' | 'empty_at' | 'empty_in'
    | 'self_sufficiency' | 'self_sufficiency_title'
    | 'bought_sold' | 'bought_sold_short' | 'charged_discharged' | 'charged_discharged_short' | 'since_midnight';

const STRINGS: Record<'fr' | 'en' | 'de' | 'es' | 'it' | 'nl', Record<CardString, string>> = {
    fr: {
        bought_sold: 'acheté · revendu', bought_sold_short: 'achat · vente', charged_discharged: 'chargé · déchargé', charged_discharged_short: 'ch. · déch.', since_midnight: 'depuis 0 h',
        produced: '{value} kWh produits',
        battery: 'Batterie', grid: 'Réseau', solar: 'Solaire', home: 'Maison',
        stale: 'Pas de nouvelle valeur depuis {age}',
        voltage: 'Tension', outage: 'Coupure', tomorrow: 'Prévu demain',
        soc_reached: 'SOC atteint', soc_reached_short: 'SOC ✓', consumption: 'Consommation', consumption_short: 'Conso.',
        self_sufficiency: 'Autosuff.', self_sufficiency_title: 'Autosuffisance du jour',
        full_at: 'Pleine à {time}', full_in: 'Pleine dans {time}', reserve_at: 'Réserve atteinte à {time}', reserve_in: 'Réserve dans {time}', empty_at: 'Vide à {time}', empty_in: 'Vide dans {time}',
    },
    en: {
        bought_sold: 'bought · sold', bought_sold_short: 'in · out', charged_discharged: 'charged · discharged', charged_discharged_short: 'in · out', since_midnight: 'today',
        produced: '{value} kWh produced',
        battery: 'Battery', grid: 'Grid', solar: 'Solar', home: 'Home',
        stale: 'No new reading for {age}',
        voltage: 'Voltage', outage: 'Outage', tomorrow: 'Tomorrow',
        soc_reached: 'SOC reached', soc_reached_short: 'SOC ✓', consumption: 'Consumption', consumption_short: 'Use',
        self_sufficiency: 'Self-suff.', self_sufficiency_title: 'Today\'s self-sufficiency',
        full_at: 'Full at {time}', full_in: 'Full in {time}', reserve_at: 'Reserve at {time}', reserve_in: 'Reserve in {time}', empty_at: 'Empty at {time}', empty_in: 'Empty in {time}',
    },
    de: {
        bought_sold: 'gekauft · verkauft', bought_sold_short: 'Kauf · Verkauf', charged_discharged: 'geladen · entladen', charged_discharged_short: 'Lad. · Entl.', since_midnight: 'heute',
        produced: '{value} kWh erzeugt',
        battery: 'Batterie', grid: 'Netz', solar: 'Solar', home: 'Haus',
        stale: 'Kein neuer Wert seit {age}',
        voltage: 'Spannung', outage: 'Ausfall', tomorrow: 'Morgen',
        soc_reached: 'SOC erreicht', soc_reached_short: 'SOC ✓', consumption: 'Verbrauch', consumption_short: 'Verbr.',
        self_sufficiency: 'Autarkie', self_sufficiency_title: 'Autarkie heute',
        full_at: 'Voll um {time}', full_in: 'Voll in {time}', reserve_at: 'Reserve um {time}', reserve_in: 'Reserve in {time}', empty_at: 'Leer um {time}', empty_in: 'Leer in {time}',
    },
    es: {
        bought_sold: 'comprada · vendida', bought_sold_short: 'compra · venta', charged_discharged: 'cargada · descargada', charged_discharged_short: 'carga · desc.', since_midnight: 'hoy',
        produced: '{value} kWh producidos',
        battery: 'Batería', grid: 'Red', solar: 'Solar', home: 'Casa',
        stale: 'Sin valor nuevo desde hace {age}',
        voltage: 'Tensión', outage: 'Corte', tomorrow: 'Mañana',
        soc_reached: 'SOC alcanzado', soc_reached_short: 'SOC ✓', consumption: 'Consumo', consumption_short: 'Cons.',
        self_sufficiency: 'Autosuf.', self_sufficiency_title: 'Autosuficiencia de hoy',
        full_at: 'Llena a las {time}', full_in: 'Llena en {time}', reserve_at: 'Reserva a las {time}', reserve_in: 'Reserva en {time}', empty_at: 'Vacía a las {time}', empty_in: 'Vacía en {time}',
    },
    it: {
        bought_sold: 'acquistata · venduta', bought_sold_short: 'acq. · vend.', charged_discharged: 'caricata · scaricata', charged_discharged_short: 'car. · scar.', since_midnight: 'oggi',
        produced: '{value} kWh prodotti',
        battery: 'Batteria', grid: 'Rete', solar: 'Solare', home: 'Casa',
        stale: 'Nessun nuovo valore da {age}',
        voltage: 'Tensione', outage: 'Blackout', tomorrow: 'Domani',
        soc_reached: 'SOC raggiunto', soc_reached_short: 'SOC ✓', consumption: 'Consumo', consumption_short: 'Cons.',
        self_sufficiency: 'Autosuff.', self_sufficiency_title: 'Autosufficienza di oggi',
        full_at: 'Piena alle {time}', full_in: 'Piena tra {time}', reserve_at: 'Riserva alle {time}', reserve_in: 'Riserva tra {time}', empty_at: 'Scarica alle {time}', empty_in: 'Scarica tra {time}',
    },
    nl: {
        bought_sold: 'gekocht · verkocht', bought_sold_short: 'in · uit', charged_discharged: 'geladen · ontladen', charged_discharged_short: 'in · uit', since_midnight: 'vandaag',
        produced: '{value} kWh opgewekt',
        battery: 'Batterij', grid: 'Net', solar: 'Zon', home: 'Huis',
        stale: 'Geen nieuwe waarde sinds {age}',
        voltage: 'Spanning', outage: 'Storing', tomorrow: 'Morgen',
        soc_reached: 'SOC bereikt', soc_reached_short: 'SOC ✓', consumption: 'Verbruik', consumption_short: 'Verbr.',
        self_sufficiency: 'Zelfvoorz.', self_sufficiency_title: 'Zelfvoorziening vandaag',
        full_at: 'Vol om {time}', full_in: 'Vol over {time}', reserve_at: 'Reserve om {time}', reserve_in: 'Reserve over {time}', empty_at: 'Leeg om {time}', empty_in: 'Leeg over {time}',
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
    /** Clock times: the locale to format them in (undefined: the browser's) and 12 / 24 h when the profile says */
    time?: { locale?: string; hour12?: boolean };
}

/** The profile's time format: 12 h, 24 h, the language's or the system's */
export function timeLocale(hass: Pick<HomeAssistant, 'language' | 'locale'> | undefined): NonNullable<NumberLocale['time']> {
    const language = hass?.locale?.language || hass?.language || 'en';
    switch (hass?.locale?.time_format) {
        case '12': return { locale: language, hour12: true };
        case '24': return { locale: language, hour12: false };
        case 'system': return {};
        default: return { locale: language };
    }
}

export function numberLocale(hass: Pick<HomeAssistant, 'language' | 'locale'> | undefined): NumberLocale {
    return { lang: cardLanguage(hass), decimal: decimalSeparator(hass), time: timeLocale(hass) };
}
