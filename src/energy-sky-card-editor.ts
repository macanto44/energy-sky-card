// Entry point of the editor bundle, loaded on demand by getConfigElement().
// The visual editor: Home Assistant's own ha-form with selectors, in blocks
// (Production, Battery, Grid, Tariff and sky, Actions). Tariff palettes stay
// YAML-only and pass through untouched.

import { CARD_EDITOR_NAME } from './constants';
import { cardLanguage, type Lang } from './localize';
import { CELL_KINDS, DEFAULT_OUTAGE_STATES, MAX_CELLS, MAX_CONSUMERS, cellKind, defaultCells, entityList, isBuiltinObject, isCustom } from './model';
import { isAction } from './actions';
import { DEFAULT_PRODUCTION_MAX, DEFAULT_SOLID_COLOR, FLOW_COLOURS } from './sky';
import type { BatteryEstimateConfig, CellConfig, CellKind, ConsumerConfig, CustomCell, EnergySkyCardConfig, HomeAssistant } from './types';

/** The parts of ha-form's schema the editor uses */
export interface SchemaItem {
    name: string;
    type?: 'expandable';
    flatten?: boolean;
    expanded?: boolean;
    title?: string;
    icon?: string;
    required?: boolean;
    selector?: Record<string, unknown>;
    schema?: SchemaItem[];
}

const LABELS: Record<Lang, Record<string, string>> = {
    fr: {
        production: 'Production', battery: 'Batterie', grid: 'Réseau', sky: 'Ciel', actions: 'Actions', cells: 'Cases', display: 'Disposition', consumers: 'Consommateurs', consumer: 'Appareil {n}', consumer_threshold: 'Seuil d\'affichage',
        production_entity: 'Puissance solaire (W, additionnées)',
        stale_after: 'Valeur figée après', production_threshold: 'Seuil de production', smoothing: 'Lissage des puissances',
        consumption_entity: 'Consommation de la maison (W)', night_hero: 'Grand chiffre la nuit',
        invert: 'Inverser le signe du capteur',
        flow_color_solar: 'Couleur du solaire', flow_color_grid: 'Couleur du réseau', flow_color_battery: 'Couleur de la batterie', flow_color_consumption: 'Couleur des appareils',
        flow: 'Flux d\'énergie', flow_none: 'Aucun', flow_tap: 'Déplier en touchant le grand chiffre', flow_always: 'Toujours visible',
        layout: 'Format', layout_standard: 'Standard : les cases sous le chiffre (4 rangées)', layout_side: 'Côté : icône + valeur à droite (2 rangées)',
        cell: 'Case {n}', cell_entity: 'Entité', cell_name: 'Nom (facultatif)', cell_icon: 'Icône (facultative)', cell_tap_action: 'Appui sur la case',
        kind_none: 'Aucune', kind_battery: 'Batterie', kind_grid: 'Réseau', kind_voltage: 'Tension', kind_tomorrow: 'Prévu demain',
        kind_consumption: 'Consommation', kind_custom: 'Libre (une entité au choix)',
        hero_production: 'Production solaire', hero_consumption: 'Consommation de la maison', hero_battery: 'Charge de la batterie', production_max: 'Puissance maximale (halo)',
        daily_production_entities: 'Production du jour (kWh, additionnés)', forecast_tomorrow_entity: 'Prévision pour demain (kWh)',
        soc_entity: 'Charge (%)', power_entity: 'Puissance (W)', temperature_entity: 'Température', soc_reached_entities: 'SOC atteint',
        voltage_entity: 'Tension (V)', outage_entity: 'Alarme de coupure', outage_states: 'États de coupure',
        tariff_color_entity: 'Couleur tarifaire (Bleu / Blanc / Rouge)', sun_entity: 'Soleil',
        background: 'Fond', background_tempo: 'Tempo : la couleur du jour', background_solid: 'Neutre : une couleur', background_weather: 'Météo',
        background_color: 'Couleur du fond', weather_entity: 'Entité météo',
        power_threshold: 'Seuil des flèches ↑ / ↓', animate: 'Animations',
        tap_action: 'Appui', hold_action: 'Appui long', double_tap_action: 'Double appui',
        capacity: 'Capacité (kWh)', max_soc: 'Charge visée (%)', reserve_soc: 'Réserve (%)', estimate_charge: 'Estimation en charge', estimate_discharge: 'Estimation en décharge', estimate_time: 'Heure (14:20)', estimate_duration: 'Durée (2 h 10)', estimate_off: 'Aucune', estimate_with_temperature: 'Avec la température', estimate_replace: 'L\'estimation remplace la température', estimate_both: 'Les deux', estimate_flow: 'Estimation dans le flux',
        sensors: 'Capteurs de puissance', sensors_single: 'Un capteur (+ / −)', sensors_split_grid: 'Deux capteurs : achat et vente', sensors_split_battery: 'Deux capteurs : charge et décharge', import_entity: 'Achat (W)', export_entity: 'Vente (W)', charge_entity: 'Puissance de charge (W)', discharge_entity: 'Puissance de décharge (W)',
        loading: 'Chargement de l\'éditeur…',
    },
    en: {
        production: 'Production', battery: 'Battery', grid: 'Grid', sky: 'Sky', actions: 'Actions', cells: 'Cells', display: 'Layout', consumers: 'Appliances', consumer: 'Appliance {n}', consumer_threshold: 'Display threshold',
        production_entity: 'Solar power (W, summed)',
        stale_after: 'Stale after', production_threshold: 'Production threshold', smoothing: 'Power smoothing',
        consumption_entity: 'Home consumption (W)', night_hero: 'Big number at night',
        invert: 'Flip the sensor\'s sign',
        flow_color_solar: 'Solar colour', flow_color_grid: 'Grid colour', flow_color_battery: 'Battery colour', flow_color_consumption: 'Appliances colour',
        flow: 'Energy flow', flow_none: 'None', flow_tap: 'Unfold on a tap on the big number', flow_always: 'Always shown',
        layout: 'Format', layout_standard: 'Standard: the cells under the number (4 rows)', layout_side: 'Side: icon + value on the right (2 rows)',
        cell: 'Cell {n}', cell_entity: 'Entity', cell_name: 'Name (optional)', cell_icon: 'Icon (optional)', cell_tap_action: 'Tap on the cell',
        kind_none: 'None', kind_battery: 'Battery', kind_grid: 'Grid', kind_voltage: 'Voltage', kind_tomorrow: 'Tomorrow',
        kind_consumption: 'Consumption', kind_custom: 'Free (any entity)',
        hero_production: 'Solar production', hero_consumption: 'Home consumption', hero_battery: 'Battery charge', production_max: 'Maximum power (halo)',
        daily_production_entities: 'Energy today (kWh, summed)', forecast_tomorrow_entity: 'Forecast for tomorrow (kWh)',
        soc_entity: 'Charge (%)', power_entity: 'Power (W)', temperature_entity: 'Temperature', soc_reached_entities: 'SOC reached',
        voltage_entity: 'Voltage (V)', outage_entity: 'Outage alarm', outage_states: 'Outage states',
        tariff_color_entity: 'Tariff colour (Bleu / Blanc / Rouge)', sun_entity: 'Sun',
        background: 'Background', background_tempo: 'Tempo: today\'s colour', background_solid: 'Solid: one colour', background_weather: 'Weather',
        background_color: 'Background colour', weather_entity: 'Weather entity',
        power_threshold: 'Threshold for the ↑ / ↓ arrows', animate: 'Animations',
        tap_action: 'Tap', hold_action: 'Hold', double_tap_action: 'Double tap',
        capacity: 'Capacity (kWh)', max_soc: 'Target charge (%)', reserve_soc: 'Reserve (%)', estimate_charge: 'Estimate while charging', estimate_discharge: 'Estimate while discharging', estimate_time: 'Time (14:20)', estimate_duration: 'Duration (2 h 10)', estimate_off: 'None', estimate_with_temperature: 'With the temperature', estimate_replace: 'The estimate replaces the temperature', estimate_both: 'Both', estimate_flow: 'Estimate in the flow',
        sensors: 'Power sensors', sensors_single: 'One sensor (+ / −)', sensors_split_grid: 'Two sensors: import and export', sensors_split_battery: 'Two sensors: charge and discharge', import_entity: 'Import (W)', export_entity: 'Export (W)', charge_entity: 'Charging power (W)', discharge_entity: 'Discharging power (W)',
        loading: 'Loading the editor…',
    },
    de: {
        production: 'Produktion', battery: 'Batterie', grid: 'Netz', sky: 'Himmel', actions: 'Aktionen', cells: 'Felder', display: 'Darstellung', consumers: 'Verbraucher', consumer: 'Gerät {n}', consumer_threshold: 'Anzeigeschwelle',
        production_entity: 'Solarleistung (W, summiert)',
        stale_after: 'Veraltet nach', production_threshold: 'Produktionsschwelle', smoothing: 'Leistungsglättung',
        consumption_entity: 'Hausverbrauch (W)', night_hero: 'Große Zahl bei Nacht',
        invert: 'Vorzeichen des Sensors umkehren',
        flow_color_solar: 'Farbe Solar', flow_color_grid: 'Farbe Netz', flow_color_battery: 'Farbe Batterie', flow_color_consumption: 'Farbe Geräte',
        flow: 'Energiefluss', flow_none: 'Keiner', flow_tap: 'Durch Tippen auf die große Zahl aufklappen', flow_always: 'Immer sichtbar',
        layout: 'Format', layout_standard: 'Standard: die Felder unter der Zahl (4 Reihen)', layout_side: 'Seitlich: Symbol + Wert rechts (2 Reihen)',
        cell: 'Feld {n}', cell_entity: 'Entität', cell_name: 'Name (optional)', cell_icon: 'Symbol (optional)', cell_tap_action: 'Tippen auf das Feld',
        kind_none: 'Keines', kind_battery: 'Batterie', kind_grid: 'Netz', kind_voltage: 'Spannung', kind_tomorrow: 'Morgen',
        kind_consumption: 'Verbrauch', kind_custom: 'Frei (beliebige Entität)',
        hero_production: 'Solarproduktion', hero_consumption: 'Hausverbrauch', hero_battery: 'Batterieladung', production_max: 'Maximale Leistung (Halo)',
        daily_production_entities: 'Energie heute (kWh, summiert)', forecast_tomorrow_entity: 'Prognose für morgen (kWh)',
        soc_entity: 'Ladung (%)', power_entity: 'Leistung (W)', temperature_entity: 'Temperatur', soc_reached_entities: 'SOC erreicht',
        voltage_entity: 'Spannung (V)', outage_entity: 'Stromausfall-Alarm', outage_states: 'Ausfall-Zustände',
        tariff_color_entity: 'Tariffarbe (Bleu / Blanc / Rouge)', sun_entity: 'Sonne',
        background: 'Hintergrund', background_tempo: 'Tempo: die Farbe des Tages', background_solid: 'Einfarbig: eine Farbe', background_weather: 'Wetter',
        background_color: 'Hintergrundfarbe', weather_entity: 'Wetter-Entität',
        power_threshold: 'Schwelle für die Pfeile ↑ / ↓', animate: 'Animationen',
        tap_action: 'Tippen', hold_action: 'Gedrückt halten', double_tap_action: 'Doppelt tippen',
        capacity: 'Kapazität (kWh)', max_soc: 'Ziel-Ladung (%)', reserve_soc: 'Reserve (%)', estimate_charge: 'Schätzung beim Laden', estimate_discharge: 'Schätzung beim Entladen', estimate_time: 'Uhrzeit (14:20)', estimate_duration: 'Dauer (2 h 10)', estimate_off: 'Keine', estimate_with_temperature: 'Mit der Temperatur', estimate_replace: 'Die Schätzung ersetzt die Temperatur', estimate_both: 'Beides', estimate_flow: 'Schätzung im Fluss',
        sensors: 'Leistungssensoren', sensors_single: 'Ein Sensor (+ / −)', sensors_split_grid: 'Zwei Sensoren: Bezug und Einspeisung', sensors_split_battery: 'Zwei Sensoren: Laden und Entladen', import_entity: 'Bezug (W)', export_entity: 'Einspeisung (W)', charge_entity: 'Ladeleistung (W)', discharge_entity: 'Entladeleistung (W)',
        loading: 'Editor wird geladen…',
    },
    es: {
        production: 'Producción', battery: 'Batería', grid: 'Red', sky: 'Cielo', actions: 'Acciones', cells: 'Casillas', display: 'Disposición', consumers: 'Consumidores', consumer: 'Aparato {n}', consumer_threshold: 'Umbral de visualización',
        production_entity: 'Potencia solar (W, sumadas)',
        stale_after: 'Valor congelado tras', production_threshold: 'Umbral de producción', smoothing: 'Suavizado de potencias',
        consumption_entity: 'Consumo de la casa (W)', night_hero: 'Cifra grande de noche',
        invert: 'Invertir el signo del sensor',
        flow_color_solar: 'Color solar', flow_color_grid: 'Color de la red', flow_color_battery: 'Color de la batería', flow_color_consumption: 'Color de los aparatos',
        flow: 'Flujo de energía', flow_none: 'Ninguno', flow_tap: 'Desplegar tocando la cifra grande', flow_always: 'Siempre visible',
        layout: 'Formato', layout_standard: 'Estándar: las casillas bajo la cifra (4 filas)', layout_side: 'Lateral: icono + valor a la derecha (2 filas)',
        cell: 'Casilla {n}', cell_entity: 'Entidad', cell_name: 'Nombre (opcional)', cell_icon: 'Icono (opcional)', cell_tap_action: 'Toque en la casilla',
        kind_none: 'Ninguna', kind_battery: 'Batería', kind_grid: 'Red', kind_voltage: 'Tensión', kind_tomorrow: 'Mañana',
        kind_consumption: 'Consumo', kind_custom: 'Libre (cualquier entidad)',
        hero_production: 'Producción solar', hero_consumption: 'Consumo de la casa', hero_battery: 'Carga de la batería', production_max: 'Potencia máxima (halo)',
        daily_production_entities: 'Energía de hoy (kWh, sumadas)', forecast_tomorrow_entity: 'Previsión para mañana (kWh)',
        soc_entity: 'Carga (%)', power_entity: 'Potencia (W)', temperature_entity: 'Temperatura', soc_reached_entities: 'SOC alcanzado',
        voltage_entity: 'Tensión (V)', outage_entity: 'Alarma de corte', outage_states: 'Estados de corte',
        tariff_color_entity: 'Color tarifario (Bleu / Blanc / Rouge)', sun_entity: 'Sol',
        background: 'Fondo', background_tempo: 'Tempo: el color del día', background_solid: 'Liso: un color', background_weather: 'Tiempo',
        background_color: 'Color de fondo', weather_entity: 'Entidad meteorológica',
        power_threshold: 'Umbral de las flechas ↑ / ↓', animate: 'Animaciones',
        tap_action: 'Toque', hold_action: 'Toque largo', double_tap_action: 'Doble toque',
        capacity: 'Capacidad (kWh)', max_soc: 'Carga objetivo (%)', reserve_soc: 'Reserva (%)', estimate_charge: 'Estimación al cargar', estimate_discharge: 'Estimación al descargar', estimate_time: 'Hora (14:20)', estimate_duration: 'Duración (2 h 10)', estimate_off: 'Ninguna', estimate_with_temperature: 'Con la temperatura', estimate_replace: 'La estimación sustituye a la temperatura', estimate_both: 'Las dos', estimate_flow: 'Estimación en el flujo',
        sensors: 'Sensores de potencia', sensors_single: 'Un sensor (+ / −)', sensors_split_grid: 'Dos sensores: compra y venta', sensors_split_battery: 'Dos sensores: carga y descarga', import_entity: 'Compra (W)', export_entity: 'Venta (W)', charge_entity: 'Potencia de carga (W)', discharge_entity: 'Potencia de descarga (W)',
        loading: 'Cargando el editor…',
    },
    it: {
        production: 'Produzione', battery: 'Batteria', grid: 'Rete', sky: 'Cielo', actions: 'Azioni', cells: 'Caselle', display: 'Disposizione', consumers: 'Utenze', consumer: 'Apparecchio {n}', consumer_threshold: 'Soglia di visualizzazione',
        production_entity: 'Potenza solare (W, sommate)',
        stale_after: 'Valore fermo dopo', production_threshold: 'Soglia di produzione', smoothing: 'Livellamento delle potenze',
        consumption_entity: 'Consumo della casa (W)', night_hero: 'Numero grande di notte',
        invert: 'Inverti il segno del sensore',
        flow_color_solar: 'Colore del solare', flow_color_grid: 'Colore della rete', flow_color_battery: 'Colore della batteria', flow_color_consumption: 'Colore degli apparecchi',
        flow: 'Flusso di energia', flow_none: 'Nessuno', flow_tap: 'Apri toccando il numero grande', flow_always: 'Sempre visibile',
        layout: 'Formato', layout_standard: 'Standard: le caselle sotto il numero (4 righe)', layout_side: 'Laterale: icona + valore a destra (2 righe)',
        cell: 'Casella {n}', cell_entity: 'Entità', cell_name: 'Nome (facoltativo)', cell_icon: 'Icona (facoltativa)', cell_tap_action: 'Tocco sulla casella',
        kind_none: 'Nessuna', kind_battery: 'Batteria', kind_grid: 'Rete', kind_voltage: 'Tensione', kind_tomorrow: 'Domani',
        kind_consumption: 'Consumo', kind_custom: 'Libera (un\'entità a scelta)',
        hero_production: 'Produzione solare', hero_consumption: 'Consumo della casa', hero_battery: 'Carica della batteria', production_max: 'Potenza massima (alone)',
        daily_production_entities: 'Energia di oggi (kWh, sommate)', forecast_tomorrow_entity: 'Previsione per domani (kWh)',
        soc_entity: 'Carica (%)', power_entity: 'Potenza (W)', temperature_entity: 'Temperatura', soc_reached_entities: 'SOC raggiunto',
        voltage_entity: 'Tensione (V)', outage_entity: 'Allarme blackout', outage_states: 'Stati di blackout',
        tariff_color_entity: 'Colore tariffario (Bleu / Blanc / Rouge)', sun_entity: 'Sole',
        background: 'Sfondo', background_tempo: 'Tempo: il colore del giorno', background_solid: 'Tinta unita: un colore', background_weather: 'Meteo',
        background_color: 'Colore di sfondo', weather_entity: 'Entità meteo',
        power_threshold: 'Soglia delle frecce ↑ / ↓', animate: 'Animazioni',
        tap_action: 'Tocco', hold_action: 'Tocco prolungato', double_tap_action: 'Doppio tocco',
        capacity: 'Capacità (kWh)', max_soc: 'Carica obiettivo (%)', reserve_soc: 'Riserva (%)', estimate_charge: 'Stima in carica', estimate_discharge: 'Stima in scarica', estimate_time: 'Ora (14:20)', estimate_duration: 'Durata (2 h 10)', estimate_off: 'Nessuna', estimate_with_temperature: 'Con la temperatura', estimate_replace: 'La stima sostituisce la temperatura', estimate_both: 'Entrambe', estimate_flow: 'Stima nel flusso',
        sensors: 'Sensori di potenza', sensors_single: 'Un sensore (+ / −)', sensors_split_grid: 'Due sensori: prelievo e immissione', sensors_split_battery: 'Due sensori: carica e scarica', import_entity: 'Prelievo (W)', export_entity: 'Immissione (W)', charge_entity: 'Potenza di carica (W)', discharge_entity: 'Potenza di scarica (W)',
        loading: 'Caricamento dell\'editor…',
    },
    nl: {
        production: 'Productie', battery: 'Batterij', grid: 'Net', sky: 'Lucht', actions: 'Acties', cells: 'Vakken', display: 'Indeling', consumers: 'Verbruikers', consumer: 'Apparaat {n}', consumer_threshold: 'Weergavedrempel',
        production_entity: 'Zonnevermogen (W, opgeteld)',
        stale_after: 'Verouderd na', production_threshold: 'Productiedrempel', smoothing: 'Vermogens afvlakken',
        consumption_entity: 'Verbruik van het huis (W)', night_hero: 'Groot getal \'s nachts',
        invert: 'Teken van de sensor omkeren',
        flow_color_solar: 'Kleur zon', flow_color_grid: 'Kleur net', flow_color_battery: 'Kleur batterij', flow_color_consumption: 'Kleur apparaten',
        flow: 'Energiestroom', flow_none: 'Geen', flow_tap: 'Uitklappen door op het grote getal te tikken', flow_always: 'Altijd zichtbaar',
        layout: 'Formaat', layout_standard: 'Standaard: de vakken onder het getal (4 rijen)', layout_side: 'Zijkant: icoon + waarde rechts (2 rijen)',
        cell: 'Vak {n}', cell_entity: 'Entiteit', cell_name: 'Naam (optioneel)', cell_icon: 'Icoon (optioneel)', cell_tap_action: 'Tikken op het vak',
        kind_none: 'Geen', kind_battery: 'Batterij', kind_grid: 'Net', kind_voltage: 'Spanning', kind_tomorrow: 'Morgen',
        kind_consumption: 'Verbruik', kind_custom: 'Vrij (elke entiteit)',
        hero_production: 'Zonneproductie', hero_consumption: 'Verbruik van het huis', hero_battery: 'Lading van de batterij', production_max: 'Maximaal vermogen (halo)',
        daily_production_entities: 'Energie vandaag (kWh, opgeteld)', forecast_tomorrow_entity: 'Verwachting voor morgen (kWh)',
        soc_entity: 'Lading (%)', power_entity: 'Vermogen (W)', temperature_entity: 'Temperatuur', soc_reached_entities: 'SOC bereikt',
        voltage_entity: 'Spanning (V)', outage_entity: 'Stroomuitvalalarm', outage_states: 'Uitvaltoestanden',
        tariff_color_entity: 'Tariefkleur (Bleu / Blanc / Rouge)', sun_entity: 'Zon',
        background: 'Achtergrond', background_tempo: 'Tempo: de kleur van de dag', background_solid: 'Effen: één kleur', background_weather: 'Weer',
        background_color: 'Achtergrondkleur', weather_entity: 'Weerentiteit',
        power_threshold: 'Drempel voor de pijlen ↑ / ↓', animate: 'Animaties',
        tap_action: 'Tikken', hold_action: 'Lang indrukken', double_tap_action: 'Dubbel tikken',
        capacity: 'Capaciteit (kWh)', max_soc: 'Doellading (%)', reserve_soc: 'Reserve (%)', estimate_charge: 'Schatting bij laden', estimate_discharge: 'Schatting bij ontladen', estimate_time: 'Tijd (14:20)', estimate_duration: 'Duur (2 h 10)', estimate_off: 'Geen', estimate_with_temperature: 'Met de temperatuur', estimate_replace: 'De schatting vervangt de temperatuur', estimate_both: 'Beide', estimate_flow: 'Schatting in de stroom',
        sensors: 'Vermogenssensoren', sensors_single: 'Eén sensor (+ / −)', sensors_split_grid: 'Twee sensoren: afname en teruglevering', sensors_split_battery: 'Twee sensoren: laden en ontladen', import_entity: 'Afname (W)', export_entity: 'Teruglevering (W)', charge_entity: 'Laadvermogen (W)', discharge_entity: 'Ontlaadvermogen (W)',
        loading: 'Editor laden…',
    },
};

/** For the tests: every language's labels and helpers */
export const EDITOR_LABELS: Readonly<typeof LABELS> = LABELS;

export function editorLabel(lang: Lang, key: string): string {
    // An appliance's slot: its entity is labelled with its number, the rest like a cell's
    const consumer = /^consumer_(\d)_(entity|name|icon|tap_action)$/.exec(key);
    if (consumer) return consumer[2] === 'entity' ? LABELS[lang].consumer.replace('{n}', consumer[1]) : LABELS[lang][`cell_${consumer[2]}`];
    const slot = /^cell_(\d)(?:_(entity|name|icon|tap_action))?$/.exec(key);
    if (slot) return slot[2] ? LABELS[lang][`cell_${slot[2]}`] : LABELS[lang].cell.replace('{n}', slot[1]);
    return LABELS[lang][key] ?? key;
}

/** The line under a field, where its label can't say it all */
const HELPERS: Record<Lang, Record<string, string>> = {
    fr: {
        soc_reached_entities: 'Entités on / off (input_boolean, binary_sensor, switch) qui passent à « on » quand la batterie a atteint la charge que vous visez, par exemple un input_boolean activé par une automatisation. Si l\'une est à « on », la case Batterie affiche « · SOC atteint » ; sinon rien.',
        stale_after: 'Une mesure sans nouvelle valeur depuis ce délai est signalée : l\'icône de sa case devient une horloge. 30 min si vide ; 0 désactive.',
        power_threshold: 'En dessous de cette puissance, la batterie est considérée au repos : pas de flèche ↑ / ↓. 20 W si vide.',
        smoothing: 'Les puissances affichées (grand chiffre, cases, flux) sont la moyenne de ce nombre de secondes. Vide ou 0 : les valeurs telles quelles.',
        production_threshold: 'En dessous de cette puissance, la production compte pour 0. Vide ou 0 pour désactiver.',
        temperature_entity: 'Facultatif : affichée après la charge, « 78 % ↑ · 24 °C ».',
        battery_invert: 'À cocher si votre capteur est positif en décharge : la carte attend une valeur positive en charge.',
        grid_invert: 'À cocher si votre capteur est positif quand vous vendez : la carte attend une valeur positive à l\'achat.',
        consumers: 'Un capteur de puissance (W) par appareil, quatre au plus : le premier au-dessus de « Maison », le deuxième en dessous, puis on alterne.',
        consumer_tap_action: 'Par défaut : ouvre l\'entité de l\'appareil.',
        consumer_threshold: 'En dessous de cette puissance, un appareil n\'apparaît pas dans le flux. 10 W si vide ; 0 les montre toujours.',
        cell_tap_action: 'Par défaut : ouvre l\'entité de la case, ou fait l\'« Appui » de la carte s\'il est choisi (bloc Actions).',
        capacity: 'Active l\'estimation : l\'heure à laquelle la batterie sera pleine, le temps avant la réserve. Plusieurs batteries : leur capacité totale (ou une par batterie en YAML).',
        soc_entity: 'Plusieurs batteries : une entité par batterie ; la carte affiche leur charge moyenne et additionne leurs puissances.', import_entity: 'Deux capteurs positifs ; s\'il en manque un, il compte pour 0.', charge_entity: 'Deux capteurs positifs ; s\'il en manque un, il compte pour 0.',
    },
    en: {
        soc_reached_entities: 'On / off entities (input_boolean, binary_sensor, switch) that turn on when the battery has reached the charge you aim for, e.g. an input_boolean set by an automation. When any is on, the Battery cell reads "· SOC reached"; otherwise nothing.',
        stale_after: 'A reading with nothing new for this long is flagged: its cell\'s icon turns to a clock. 30 min when empty; 0 turns it off.',
        power_threshold: 'Below this power the battery counts as idle: no ↑ / ↓ arrow. 20 W when empty.',
        smoothing: 'The powers shown (big number, cells, flow) are averaged over this many seconds. Empty or 0: as read.',
        production_threshold: 'Below this power the production reads 0. Empty or 0 to turn it off.',
        temperature_entity: 'Optional: shown after the charge, "78% ↑ · 24 °C".',
        battery_invert: 'Tick if your sensor is positive when discharging: the card expects positive when charging.',
        grid_invert: 'Tick if your sensor is positive when exporting: the card expects positive when importing.',
        consumers: 'One power sensor (W) per appliance, four at most: the first above the home, the second below, then in turn.',
        consumer_tap_action: 'By default: opens the appliance\'s entity.',
        consumer_threshold: 'Below this power an appliance stays out of the flow. 10 W when empty; 0 always shows them.',
        cell_tap_action: 'By default: opens the cell\'s entity, or runs the card\'s Tap action if one is set (Actions block).',
        capacity: 'Turns the estimate on: when the battery will be full, how long until the reserve. Several batteries: their total capacity (or one each in YAML).',
        soc_entity: 'Several batteries: one entity each; the card shows their average charge and adds up their powers.', import_entity: 'Two positive sensors; a missing one counts as 0.', charge_entity: 'Two positive sensors; a missing one counts as 0.',
    },
    de: {
        soc_reached_entities: 'Ein/Aus-Entitäten (input_boolean, binary_sensor, switch), die auf „on“ gehen, wenn die Batterie die gewünschte Ladung erreicht hat, z. B. ein input_boolean, das eine Automatisierung setzt. Ist eine davon „on“, zeigt das Feld Batterie „· SOC erreicht“; sonst nichts.',
        stale_after: 'Ein Messwert ohne neuen Wert seit dieser Zeit wird markiert: Das Symbol seines Feldes wird zur Uhr. Leer: 30 min; 0 schaltet es aus.',
        power_threshold: 'Unter dieser Leistung gilt die Batterie als im Ruhezustand: kein Pfeil ↑ / ↓. Leer: 20 W.',
        smoothing: 'Die angezeigten Leistungen (große Zahl, Felder, Fluss) sind der Mittelwert über so viele Sekunden. Leer oder 0: die Werte, wie sie kommen.',
        production_threshold: 'Unter dieser Leistung zählt die Produktion als 0. Leer oder 0 zum Ausschalten.',
        temperature_entity: 'Optional: nach der Ladung angezeigt, „78 % ↑ · 24 °C“.',
        battery_invert: 'Ankreuzen, wenn der Sensor beim Entladen positiv ist: Die Karte erwartet beim Laden einen positiven Wert.',
        grid_invert: 'Ankreuzen, wenn der Sensor bei Einspeisung positiv ist: Die Karte erwartet beim Bezug einen positiven Wert.',
        consumers: 'Ein Leistungssensor (W) pro Gerät, höchstens vier: das erste über „Haus“, das zweite darunter, dann abwechselnd.',
        consumer_tap_action: 'Standard: öffnet die Entität des Geräts.',
        consumer_threshold: 'Unter dieser Leistung erscheint ein Gerät nicht im Fluss. Leer: 10 W; 0 zeigt sie immer.',
        cell_tap_action: 'Standard: öffnet die Entität des Feldes, oder führt das „Tippen“ der Karte aus, falls gewählt (Block Aktionen).',
        capacity: 'Schaltet die Schätzung ein: wann die Batterie voll ist, wie lange bis zur Reserve. Mehrere Batterien: die Gesamtkapazität (oder je eine in YAML).',
        soc_entity: 'Mehrere Batterien: je eine Entität; die Karte zeigt die mittlere Ladung und addiert die Leistungen.', import_entity: 'Zwei positive Sensoren; ein fehlender zählt als 0.', charge_entity: 'Zwei positive Sensoren; ein fehlender zählt als 0.',
    },
    es: {
        soc_reached_entities: 'Entidades on / off (input_boolean, binary_sensor, switch) que pasan a «on» cuando la batería alcanza la carga que buscas, por ejemplo un input_boolean activado por una automatización. Si alguna está en «on», la casilla Batería muestra «· SOC alcanzado»; si no, nada.',
        stale_after: 'Una medida sin valor nuevo durante este tiempo se señala: el icono de su casilla pasa a ser un reloj. 30 min si está vacío; 0 lo desactiva.',
        power_threshold: 'Por debajo de esta potencia, la batería se considera en reposo: sin flecha ↑ / ↓. 20 W si está vacío.',
        smoothing: 'Las potencias mostradas (cifra grande, casillas, flujo) son la media de este número de segundos. Vacío o 0: los valores tal cual.',
        production_threshold: 'Por debajo de esta potencia, la producción cuenta como 0. Vacío o 0 para desactivarlo.',
        temperature_entity: 'Opcional: se muestra tras la carga, «78 % ↑ · 24 °C».',
        battery_invert: 'Márcalo si tu sensor es positivo al descargar: la tarjeta espera un valor positivo al cargar.',
        grid_invert: 'Márcalo si tu sensor es positivo al vender: la tarjeta espera un valor positivo al comprar.',
        consumers: 'Un sensor de potencia (W) por aparato, cuatro como máximo: el primero encima de «Casa», el segundo debajo, y luego se alterna.',
        consumer_tap_action: 'Por defecto: abre la entidad del aparato.',
        consumer_threshold: 'Por debajo de esta potencia, un aparato no aparece en el flujo. 10 W si está vacío; 0 los muestra siempre.',
        cell_tap_action: 'Por defecto: abre la entidad de la casilla, o ejecuta el «Toque» de la tarjeta si está elegido (bloque Acciones).',
        capacity: 'Activa la estimación: cuándo estará llena la batería, cuánto falta para la reserva. Varias baterías: su capacidad total (o una por batería en YAML).',
        soc_entity: 'Varias baterías: una entidad por batería; la tarjeta muestra su carga media y suma sus potencias.', import_entity: 'Dos sensores positivos; si falta uno, cuenta como 0.', charge_entity: 'Dos sensores positivos; si falta uno, cuenta como 0.',
    },
    it: {
        soc_reached_entities: 'Entità on / off (input_boolean, binary_sensor, switch) che passano a «on» quando la batteria ha raggiunto la carica desiderata, ad esempio un input_boolean attivato da un\'automazione. Se una è «on», la casella Batteria mostra «· SOC raggiunto»; altrimenti niente.',
        stale_after: 'Una misura senza un nuovo valore da questo tempo viene segnalata: l\'icona della sua casella diventa un orologio. 30 min se vuoto; 0 disattiva.',
        power_threshold: 'Sotto questa potenza la batteria è considerata a riposo: nessuna freccia ↑ / ↓. 20 W se vuoto.',
        smoothing: 'Le potenze mostrate (numero grande, caselle, flusso) sono la media su questo numero di secondi. Vuoto o 0: i valori così come arrivano.',
        production_threshold: 'Sotto questa potenza la produzione vale 0. Vuoto o 0 per disattivare.',
        temperature_entity: 'Facoltativa: mostrata dopo la carica, «78% ↑ · 24 °C».',
        battery_invert: 'Seleziona se il sensore è positivo in scarica: la scheda si aspetta un valore positivo in carica.',
        grid_invert: 'Seleziona se il sensore è positivo quando immetti in rete: la scheda si aspetta un valore positivo quando prelevi.',
        consumers: 'Un sensore di potenza (W) per apparecchio, al massimo quattro: il primo sopra «Casa», il secondo sotto, poi si alterna.',
        consumer_tap_action: 'Predefinito: apre l\'entità dell\'apparecchio.',
        consumer_threshold: 'Sotto questa potenza un apparecchio non compare nel flusso. 10 W se vuoto; 0 li mostra sempre.',
        cell_tap_action: 'Predefinito: apre l\'entità della casella, o esegue il «Tocco» della scheda se impostato (blocco Azioni).',
        capacity: 'Attiva la stima: quando la batteria sarà piena, quanto manca alla riserva. Più batterie: la capacità totale (o una per batteria in YAML).',
        soc_entity: 'Più batterie: un\'entità per batteria; la scheda mostra la carica media e somma le potenze.', import_entity: 'Due sensori positivi; se ne manca uno, conta 0.', charge_entity: 'Due sensori positivi; se ne manca uno, conta 0.',
    },
    nl: {
        soc_reached_entities: 'Aan/uit-entiteiten (input_boolean, binary_sensor, switch) die „on” worden zodra de batterij de gewenste lading heeft bereikt, bijvoorbeeld een input_boolean die een automatisering aanzet. Staat er één op „on”, dan toont het vak Batterij „· SOC bereikt”; anders niets.',
        stale_after: 'Een meting zonder nieuwe waarde gedurende deze tijd wordt gemarkeerd: het icoon van het vak wordt een klok. Leeg: 30 min; 0 schakelt het uit.',
        power_threshold: 'Onder dit vermogen geldt de batterij als in rust: geen pijl ↑ / ↓. Leeg: 20 W.',
        smoothing: 'De getoonde vermogens (groot getal, vakken, stroom) zijn het gemiddelde over zoveel seconden. Leeg of 0: de waarden zoals ze binnenkomen.',
        production_threshold: 'Onder dit vermogen telt de productie als 0. Leeg of 0 om uit te schakelen.',
        temperature_entity: 'Optioneel: getoond na de lading, „78% ↑ · 24 °C”.',
        battery_invert: 'Aanvinken als de sensor positief is bij ontladen: de kaart verwacht een positieve waarde bij laden.',
        grid_invert: 'Aanvinken als de sensor positief is bij teruglevering: de kaart verwacht een positieve waarde bij afname.',
        consumers: 'Eén vermogenssensor (W) per apparaat, hoogstens vier: de eerste boven „Huis”, de tweede eronder, daarna om en om.',
        consumer_tap_action: 'Standaard: opent de entiteit van het apparaat.',
        consumer_threshold: 'Onder dit vermogen verschijnt een apparaat niet in de stroom. Leeg: 10 W; 0 toont ze altijd.',
        cell_tap_action: 'Standaard: opent de entiteit van het vak, of voert het „Tikken” van de kaart uit als dat is ingesteld (blok Acties).',
        capacity: 'Zet de schatting aan: wanneer de batterij vol is, hoe lang tot de reserve. Meerdere batterijen: de totale capaciteit (of één per batterij in YAML).',
        soc_entity: 'Meerdere batterijen: één entiteit per batterij; de kaart toont de gemiddelde lading en telt de vermogens op.', import_entity: 'Twee positieve sensoren; een ontbrekende telt als 0.', charge_entity: 'Twee positieve sensoren; een ontbrekende telt als 0.',
    },
};

export const EDITOR_HELPERS: Readonly<typeof HELPERS> = HELPERS;

/** The helper under a field; in a block, the block's name tells the two invert fields apart */
export function editorHelper(lang: Lang, key: string, block?: string): string | undefined {
    if (/^cell_\d_tap_action$/.test(key)) return HELPERS[lang].cell_tap_action;
    if (/^consumer_\d_tap_action$/.test(key)) return HELPERS[lang].consumer_tap_action;
    if (key === 'consumer_1_entity') return HELPERS[lang].consumers;
    return HELPERS[lang][block && key === 'invert' ? `${block}_invert` : key];
}

const sensor = (extra: Record<string, unknown> = {}) => ({ entity: { domain: 'sensor', ...extra } });

const CELL_CHOICES = ['none', ...CELL_KINDS, 'custom'] as const;

/** The slots' fields: a choice per cell, and entity, name and icon under a free one */
function cellFields(lang: Lang, data: Record<string, unknown>): SchemaItem[] {
    const options = CELL_CHOICES.map(value => ({ value, label: editorLabel(lang, `kind_${value}`) }));
    return Array.from({ length: MAX_CELLS }, (_, i) => i + 1).flatMap(n => [
        { name: `cell_${n}`, selector: { select: { mode: 'dropdown', options } } },
        ...(data[`cell_${n}`] === 'custom' ? [
            { name: `cell_${n}_entity`, selector: { entity: {} } },
            { name: `cell_${n}_name`, selector: { text: {} } },
            { name: `cell_${n}_icon`, selector: { icon: {} } },
        ] : []),
        // Home Assistant's action picker: more-info, navigate, url, perform-action, none…
        ...(data[`cell_${n}`] && data[`cell_${n}`] !== 'none' ? [{ name: `cell_${n}_tap_action`, selector: { ui_action: {} } }] : []),
    ]);
}

/** Whether a block's power comes from two sensors (the form's choice) */
const split = (data: Record<string, unknown>, block: 'grid' | 'battery'): boolean =>
    (data[block] as Record<string, unknown> | undefined)?.sensors === 'split';

/** The battery block's values in the form */
const battery = (data: Record<string, unknown>): Record<string, unknown> => (data.battery as Record<string, unknown> | undefined) ?? {};

/** The estimate's display choices: the form's fields, their YAML names and defaults (left out of the YAML) */
const ESTIMATE_FIELDS: [string, keyof BatteryEstimateConfig, unknown][] = [
    ['estimate_charge', 'charge', 'time'], ['estimate_discharge', 'discharge', 'duration'],
    ['estimate_with_temperature', 'with_temperature', 'replace'], ['estimate_flow', 'flow', true],
];

/** The battery's entity options, as lists for the form's multiple selectors */
const BATTERY_LISTS = ['soc_entity', 'power_entity', 'charge_entity', 'discharge_entity'] as const;
/** The two-sensor fields of each block, and the one-sensor ones they replace */
const SPLIT_FIELDS = { grid: [['import_entity', 'export_entity'], ['power_entity', 'invert']], battery: [['charge_entity', 'discharge_entity'], ['power_entity', 'invert']] } as const;

/** The form; data (the form's current values) decides which free-cell fields show */
export function editorSchema(lang: Lang, data: Record<string, unknown> = {}): SchemaItem[] {
    const t = (key: string) => editorLabel(lang, key);
    const heroOptions = (['production', 'consumption', 'battery'] as const).map(value => ({ value, label: t(`hero_${value}`) }));
    const estimateChoice = (name: string, values: string[]): SchemaItem => ({
        name, selector: { select: { mode: 'dropdown', options: values.map(value => ({ value, label: t(`estimate_${value}`) })) } },
    });
    // One signed power sensor, or two positive ones (import / export, charge / discharge)
    const sensorsChoice = (block: 'grid' | 'battery'): SchemaItem => ({
        name: 'sensors',
        selector: { select: { mode: 'list', options: [{ value: 'single', label: t('sensors_single') }, { value: 'split', label: t(`sensors_split_${block}`) }] } },
    });
    return [
        {
            name: '', type: 'expandable', flatten: true, expanded: true, title: t('production'), icon: 'mdi:solar-power-variant-outline',
            schema: [
                { name: 'production_entity', required: true, selector: sensor({ device_class: 'power', multiple: true }) },
                { name: 'production_threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'W' } } },
                { name: 'production_max', selector: { number: { min: 100, max: 100000, step: 100, mode: 'box', unit_of_measurement: 'W' } } },
                { name: 'daily_production_entities', selector: sensor({ multiple: true }) },
                { name: 'forecast_tomorrow_entity', selector: sensor() },
                { name: 'smoothing', selector: { number: { min: 0, max: 300, step: 1, mode: 'box', unit_of_measurement: 's' } } },
                { name: 'stale_after', selector: { number: { min: 0, max: 1440, step: 1, mode: 'box', unit_of_measurement: 'min' } } },
            ],
        },
        {
            name: 'battery', type: 'expandable', title: t('battery'), icon: 'mdi:home-battery-outline',
            schema: [
                { name: 'soc_entity', selector: sensor({ multiple: true }) },
                sensorsChoice('battery'),
                ...(split(data, 'battery')
                    ? [{ name: 'charge_entity', selector: sensor({ multiple: true }) }, { name: 'discharge_entity', selector: sensor({ multiple: true }) }]
                    : [{ name: 'power_entity', selector: sensor({ multiple: true }) }]),
                { name: 'temperature_entity', selector: sensor({ device_class: 'temperature' }) },
                ...(split(data, 'battery') ? [] : [{ name: 'invert', selector: { boolean: {} } }]),
                { name: 'power_threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'W' } } },
                { name: 'soc_reached_entities', selector: { entity: { multiple: true, domain: ['input_boolean', 'binary_sensor', 'switch'] } } },
                // The estimate: a capacity turns it on (a list of them stays YAML-only, kept as it is)
                ...(Array.isArray(battery(data).capacity) ? [] : [{ name: 'capacity', selector: { number: { min: 0, max: 1000, step: 0.1, mode: 'box', unit_of_measurement: 'kWh' } } }]),
                ...(battery(data).capacity ? [
                    { name: 'max_soc', selector: { number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' } } },
                    { name: 'reserve_soc', selector: { number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' } } },
                    estimateChoice('estimate_charge', ['time', 'duration', 'off']),
                    estimateChoice('estimate_discharge', ['duration', 'time', 'off']),
                    estimateChoice('estimate_with_temperature', ['replace', 'both']),
                    { name: 'estimate_flow', selector: { boolean: {} } },
                ] : []),
            ],
        },
        {
            name: 'grid', type: 'expandable', title: t('grid'), icon: 'mdi:transmission-tower',
            schema: [
                sensorsChoice('grid'),
                ...(split(data, 'grid')
                    ? [{ name: 'import_entity', selector: sensor() }, { name: 'export_entity', selector: sensor() }]
                    : [{ name: 'power_entity', selector: sensor() }, { name: 'invert', selector: { boolean: {} } }]),
                { name: 'voltage_entity', selector: sensor() },
                { name: 'outage_entity', selector: { entity: {} } },
                { name: 'outage_states', selector: { select: { multiple: true, custom_value: true, options: DEFAULT_OUTAGE_STATES } } },
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('display'), icon: 'mdi:page-layout-body',
            schema: [
                { name: 'layout', selector: { select: { mode: 'list', options: (['standard', 'side'] as const).map(value => ({ value, label: t(`layout_${value}`) })) } } },
                { name: 'night_hero', selector: { select: { mode: 'dropdown', options: heroOptions } } },
                { name: 'flow', selector: { select: { mode: 'list', options: (['none', 'tap', 'always'] as const).map(value => ({ value, label: t(`flow_${value}`) })) } } },
                // The flow's colours, with a flow (a theme can set them too)
                ...(data.flow === 'tap' || data.flow === 'always' ? FLOW_COLOR_FIELDS.map(key => ({ name: `flow_color_${key}`, selector: { color_rgb: {} } })) : []),
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('cells'), icon: 'mdi:view-grid-outline',
            schema: cellFields(lang, data),
        },
        // The home's consumption, and the appliances with a flow
        {
            name: '', type: 'expandable', flatten: true, title: t('consumers'), icon: 'mdi:power-plug-outline',
            schema: [
                { name: 'consumption_entity', selector: sensor({ device_class: 'power' }) },
                ...(data.flow === 'tap' || data.flow === 'always' ? consumerFields(data) : []),
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('sky'), icon: 'mdi:weather-partly-cloudy',
            schema: [
                { name: 'background', selector: { select: { mode: 'list', options: (['tempo', 'solid', 'weather'] as const).map(value => ({ value, label: t(`background_${value}`) })) } } },
                // The background's own field: the tariff sensor, the colour, or the weather entity
                ...(data.background === 'solid' ? [{ name: 'background_color', selector: { color_rgb: {} } }]
                    : data.background === 'weather' ? [{ name: 'weather_entity', selector: { entity: { domain: 'weather' } } }]
                    : [{ name: 'tariff_color_entity', selector: sensor() }]),
                { name: 'sun_entity', selector: { entity: { domain: 'sun' } } },
                { name: 'animate', selector: { boolean: {} } },
            ],
        },
        {
            name: '', type: 'expandable', flatten: true, title: t('actions'), icon: 'mdi:gesture-tap',
            schema: [
                { name: 'tap_action', selector: { ui_action: {} } },
                { name: 'hold_action', selector: { ui_action: {} } },
                { name: 'double_tap_action', selector: { ui_action: {} } },
            ],
        },
    ];
}


/** The appliances' slots: an entity each, its name, icon and tap once it has one; a slot shows once the previous one is filled */
function consumerFields(data: Record<string, unknown>): SchemaItem[] {
    const fields: SchemaItem[] = [{ name: 'consumer_threshold', selector: { number: { min: 0, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'W' } } }];
    for (let n = 1; n <= MAX_CONSUMERS; n++) {
        if (n > 1 && !data[`consumer_${n - 1}_entity`]) break;
        fields.push({ name: `consumer_${n}_entity`, selector: sensor({ device_class: 'power' }) });
        if (data[`consumer_${n}_entity`]) {
            fields.push(
                { name: `consumer_${n}_name`, selector: { text: {} } },
                { name: `consumer_${n}_icon`, selector: { icon: {} } },
                { name: `consumer_${n}_tap_action`, selector: { ui_action: {} } },
            );
        }
    }
    return fields;
}

/** The appliances as the form's slots */
function consumerSlots(config: EnergySkyCardConfig): Record<string, unknown> {
    return Object.fromEntries((config.consumers ?? []).flatMap((c, i) => [
        [`consumer_${i + 1}_entity`, c.entity], [`consumer_${i + 1}_name`, c.name], [`consumer_${i + 1}_icon`, c.icon], [`consumer_${i + 1}_tap_action`, c.tap_action],
    ]));
}

/** Back from the slots to a consumers list (an appliance needs its entity) */
function consumersFromSlots(value: Record<string, unknown>): ConsumerConfig[] {
    const consumers: ConsumerConfig[] = [];
    for (let n = 1; n <= MAX_CONSUMERS; n++) {
        const entity = value[`consumer_${n}_entity`];
        if (typeof entity !== 'string' || !entity) continue;
        const consumer: ConsumerConfig = { entity };
        for (const field of ['name', 'icon'] as const) {
            const v = value[`consumer_${n}_${field}`];
            if (typeof v === 'string' && v) consumer[field] = v;
        }
        const tap = value[`consumer_${n}_tap_action`];
        if (isAction(tap)) consumer.tap_action = tap;
        consumers.push(consumer);
    }
    return consumers;
}

/** The cells as the form's slots: cell_1 … cell_4, and the free cells' entity, name and icon */
function cellSlots(config: EnergySkyCardConfig): Record<string, unknown> {
    const cells: CellConfig[] = config.cells ?? defaultCells(config);
    const slots: Record<string, unknown> = {};
    for (let i = 0; i < MAX_CELLS; i++) {
        const cell = cells[i];
        const n = i + 1;
        if (cell === undefined) slots[`cell_${n}`] = 'none';
        else if (isCustom(cell)) {
            Object.assign(slots, { [`cell_${n}`]: 'custom', [`cell_${n}_entity`]: cell.entity, [`cell_${n}_name`]: cell.name, [`cell_${n}_icon`]: cell.icon, [`cell_${n}_tap_action`]: cell.tap_action });
        } else {
            slots[`cell_${n}`] = cellKind(cell);
            if (isBuiltinObject(cell)) slots[`cell_${n}_tap_action`] = cell.tap_action;
        }
    }
    return slots;
}

/** Back from the slots to a cells list (a free cell needs its entity) */
function cellsFromSlots(value: Record<string, unknown>): CellConfig[] {
    const cells: CellConfig[] = [];
    for (let n = 1; n <= MAX_CELLS; n++) {
        const kind = value[`cell_${n}`];
        const tap = value[`cell_${n}_tap_action`];
        const tapAction = isAction(tap) ? { tap_action: tap } : {};
        if (kind === 'custom') {
            const entity = value[`cell_${n}_entity`];
            if (typeof entity !== 'string' || !entity) continue;
            const cell: CustomCell = { entity };
            for (const field of ['name', 'icon'] as const) {
                const v = value[`cell_${n}_${field}`];
                if (typeof v === 'string' && v) cell[field] = v;
            }
            cells.push({ ...cell, ...tapAction });
        } else if ((CELL_KINDS as unknown[]).includes(kind)) {
            // A built-in cell stays a plain name, unless it has a tap action of its own
            cells.push(isAction(tap) ? { type: kind as CellKind, tap_action: tap } : kind as CellKind);
        }
    }
    return cells;
}

/** The flow's colours in the editor: Home Assistant's colour picker gives [r, g, b] */
const FLOW_COLOR_FIELDS = ['solar', 'grid', 'battery', 'consumption'] as const;
const DEFAULT_FLOW_COLORS: Record<string, string> = { solar: FLOW_COLOURS.sun, grid: FLOW_COLOURS.grid, battery: FLOW_COLOURS.batt, consumption: FLOW_COLOURS.use };
const FLOW_COLOR_SLOT = /^flow_color_/;
const isRgb = (v: unknown): v is [number, number, number] => Array.isArray(v) && v.length === 3 && v.every(n => typeof n === 'number');
const toHex = (rgb: [number, number, number]) => '#' + rgb.map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
/** A #rrggbb colour as [r, g, b]; anything else (a theme variable, a named colour) has no picker value */
function fromHex(colour: string): [number, number, number] | undefined {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour.trim());
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : undefined;
}

/** The pickers' values: the card's colour, else the default (a colour the picker can't show is left as it is) */
function flowColorSlots(config: EnergySkyCardConfig): Record<string, unknown> {
    return Object.fromEntries(FLOW_COLOR_FIELDS.map(key => {
        const own = config.flow_colors?.[key];
        return [`flow_color_${key}`, own ? fromHex(own) : fromHex(DEFAULT_FLOW_COLORS[key])];
    }));
}

/** The form's slot fields, cells' and appliances', which the config writes as lists */
const SLOT_KEY = /^(cell|consumer)_\d(_|$)|^flow_color_/;
const CELL_SLOT = /^cell_\d(_|$)/;
const CONSUMER_SLOT = /^consumer_\d_/;

/** What the form shows for the config: defaults filled in where YAML left them out, the cells as slots */
export function formData(config: EnergySkyCardConfig): Record<string, unknown> {
    const production = config.production_entity;
    return {
        production_max: DEFAULT_PRODUCTION_MAX,
        sun_entity: 'sun.sun',
        animate: true,
        night_hero: 'production',
        layout: 'standard',
        ...config,
        // 0.3.3's expandable: true is flow: tap
        flow: config.flow ?? (config.expandable ? 'tap' : 'none'),
        ...flowColorSlots(config),
        background: config.background ?? 'tempo',
        background_color: fromHex(config.background_color ?? DEFAULT_SOLID_COLOR),
        production_entity: production === undefined ? [] : Array.isArray(production) ? production : [production],
        battery: {
            ...config.battery,
            sensors: config.battery?.charge_entity || config.battery?.discharge_entity ? 'split' : 'single',
            ...Object.fromEntries(BATTERY_LISTS.map(key => [key, entityList(config.battery?.[key])])),
            ...Object.fromEntries(ESTIMATE_FIELDS.map(([field, key, def]) => [field, config.battery?.estimate?.[key] ?? def])),
            estimate: undefined,
        },
        grid: { ...config.grid, sensors: config.grid?.import_entity || config.grid?.export_entity ? 'split' : 'single' },
        ...cellSlots(config),
        ...consumerSlots(config),
    };
}

const isEmpty = (v: unknown): boolean =>
    v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);

/** Drop empty values (and empty blocks) so the YAML stays as short as the user wrote it */
function prune(obj: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const v = value && typeof value === 'object' && !Array.isArray(value) && !key.endsWith('_action') && key !== 'tariff_palettes'
            ? prune(value as Record<string, unknown>) : value;
        if (!isEmpty(v)) out[key] = v;
    }
    return out;
}

/**
 * The config after a form change: the form's values over the old config
 * (keys the form doesn't show, like tariff_palettes, are kept), empty
 * values dropped, and values equal to their default left out unless YAML
 * had them.
 */
export function nextConfig(previous: EnergySkyCardConfig, value: Record<string, unknown>): EnergySkyCardConfig {
    const fields = Object.fromEntries(Object.entries(value).filter(([key]) => !SLOT_KEY.test(key)));
    const merged = prune({ ...previous, ...fields }) as Record<string, unknown>;
    // One production sensor stays a plain string in YAML
    if (Array.isArray(merged.production_entity) && merged.production_entity.length === 1) merged.production_entity = merged.production_entity[0];
    // Cells: written only when they differ from what the card would pick by itself
    if (Object.keys(value).some(key => CONSUMER_SLOT.test(key))) {
        const consumers = consumersFromSlots(value);
        if (consumers.length) merged.consumers = consumers;
        else delete merged.consumers;
    }
    if (Object.keys(value).some(key => CELL_SLOT.test(key))) {
        const cells = cellsFromSlots(value);
        const auto = previous.cells === undefined && JSON.stringify(cells) === JSON.stringify(defaultCells(previous));
        if (auto) delete merged.cells;
        else merged.cells = cells;
    }
    for (const block of ['battery', 'grid'] as const) {
        const b = merged[block] as Record<string, unknown> | undefined;
        if (b) {
            // The form's choice: keep the chosen sensors' fields, drop the others
            const [two, one] = SPLIT_FIELDS[block];
            if (b.sensors === 'split') for (const key of one) delete b[key];
            else if (b.sensors === 'single') for (const key of two) delete b[key];
            delete b.sensors;
            // The estimate's choices: written under estimate, only where they aren't the default
            if (block === 'battery' && ESTIMATE_FIELDS.some(([field]) => field in b)) {
                const estimate: Record<string, unknown> = {};
                for (const [field, key, def] of ESTIMATE_FIELDS) {
                    if (field in b && b[field] !== def) estimate[key] = b[field];
                    delete b[field];
                }
                if (Object.keys(estimate).length) b.estimate = estimate;
                else delete b.estimate;
            }
            // One battery stays a plain string in YAML
            if (block === 'battery') for (const key of BATTERY_LISTS) if (Array.isArray(b[key]) && (b[key] as unknown[]).length === 1) b[key] = (b[key] as unknown[])[0];
        }
        // false is the default: no need to write it
        if (b?.invert === false) delete b.invert;
        if (b && !Object.keys(b).length) delete merged[block];
    }
    const defaults: Record<string, unknown> = { production_max: DEFAULT_PRODUCTION_MAX, sun_entity: 'sun.sun', animate: true, night_hero: 'production', layout: 'standard', background: 'tempo' };
    for (const [key, def] of Object.entries(defaults)) {
        if (merged[key] === def && !(key in previous)) delete merged[key];
    }
    // The solid sky's colour: from the picker's [r, g, b], written only for a solid sky that isn't the default
    const picked = value.background_color;
    if (isRgb(picked)) merged.background_color = toHex(picked);
    if (merged.background !== 'solid' && !previous.background_color) delete merged.background_color;
    if (merged.background === 'solid' && merged.background_color === DEFAULT_SOLID_COLOR && !previous.background_color) delete merged.background_color;
    // No flow is written as no flow option; expandable (0.3.3) is saved as flow
    if (merged.flow === 'none') delete merged.flow;
    // The colour pickers: written as flow_colors, a colour only when it isn't the default
    if (Object.keys(value).some(key => FLOW_COLOR_SLOT.test(key))) {
        const colours = { ...(previous.flow_colors ?? {}) } as Record<string, string>;
        for (const key of FLOW_COLOR_FIELDS) {
            const rgb = value[`flow_color_${key}`];
            if (!isRgb(rgb)) continue;
            const hex = toHex(rgb);
            if (hex === DEFAULT_FLOW_COLORS[key]) delete colours[key];
            else if (!(colours[key] && isRgb(fromHex(colours[key])) && toHex(fromHex(colours[key])!) === hex)) colours[key] = hex;
        }
        if (Object.keys(colours).length) merged.flow_colors = colours;
        else delete merged.flow_colors;
    }
    delete merged.expandable;
    // The flow changes the height: a fixed number of rows in the sections view would cut it
    const grid = merged.grid_options as { rows?: unknown } | undefined;
    if (merged.flow && grid && typeof grid.rows === 'number') merged.grid_options = { ...grid, rows: 'auto' };
    return { ...merged, type: previous.type } as EnergySkyCardConfig;
}

interface HaForm extends HTMLElement {
    hass?: HomeAssistant;
    data?: Record<string, unknown>;
    schema?: SchemaItem[];
    computeLabel?: (item: SchemaItem) => string;
    computeHelper?: (item: SchemaItem) => string | undefined;
}

declare global {
    interface Window {
        loadCardHelpers?: () => Promise<{ createCardElement: (config: Record<string, unknown>) => HTMLElement }>;
    }
}

/**
 * ha-form is Home Assistant's, and only defined once one of its own card
 * editors has been loaded: ask for a built-in card's editor to get it.
 */
async function loadHaForm(): Promise<void> {
    try {
        const helpers = await window.loadCardHelpers?.();
        const tile = await helpers?.createCardElement({ type: 'tile', entity: 'sun.sun' });
        await (tile?.constructor as { getConfigElement?: () => Promise<HTMLElement> | HTMLElement } | undefined)?.getConfigElement?.();
    } catch {
        // The loading line stays; YAML still works
    }
}

export class EnergySkyCardEditor extends HTMLElement {
    private config?: EnergySkyCardConfig;
    private _hass?: HomeAssistant;
    private form?: HaForm;

    setConfig(config: EnergySkyCardConfig): void {
        this.config = config;
        this.render();
    }

    set hass(hass: HomeAssistant) {
        const langChanged = cardLanguage(hass) !== cardLanguage(this._hass);
        this._hass = hass;
        if (this.form && !langChanged) this.form.hass = hass;
        else this.render();
    }

    private render(): void {
        if (!this.config) return;
        const lang = cardLanguage(this._hass);
        if (!customElements.get('ha-form')) {
            this.textContent = editorLabel(lang, 'loading');
            customElements.whenDefined('ha-form').then(() => this.render());
            void loadHaForm();
            return;
        }
        if (!this.form) {
            this.form = document.createElement('ha-form') as HaForm;
            this.form.addEventListener('value-changed', e => this.onValue(e as CustomEvent));
            this.replaceChildren(this.form);
        }
        this.form.hass = this._hass;
        const data = formData(this.config);
        this.form.schema = editorSchema(lang, data);
        this.form.computeLabel = item => editorLabel(lang, item.name);
        this.form.computeHelper = item => editorHelper(lang, item.name, this.blockOf(item));
        this.form.data = data;
    }

    /** The nested block (battery, grid) a field belongs to, from the schema */
    private blockOf(item: SchemaItem): string | undefined {
        return this.form?.schema?.find(block => block.name && block.schema?.includes(item))?.name;
    }

    private onValue(e: CustomEvent): void {
        e.stopPropagation();
        if (!this.config) return;
        const value = (e.detail?.value ?? {}) as Record<string, unknown>;
        this.config = nextConfig(this.config, value);
        if (this.form) {
            // The free-cell fields follow the slots' choices, even before an entity is picked
            const data = { ...formData(this.config), ...Object.fromEntries(Object.entries(value).filter(([key]) => SLOT_KEY.test(key))) };
            this.form.schema = editorSchema(cardLanguage(this._hass), data);
            this.form.data = data;
        }
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    }
}

if (!customElements.get(CARD_EDITOR_NAME)) customElements.define(CARD_EDITOR_NAME, EnergySkyCardEditor);
