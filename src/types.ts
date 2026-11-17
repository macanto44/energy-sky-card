// The slice of Home Assistant's frontend types the card uses

export interface HassEntity {
    entity_id: string;
    state: string;
    attributes: Record<string, unknown>;
    last_changed: string;
    last_updated: string;
}

export interface HomeAssistant {
    states: Record<string, HassEntity>;
    /** Home Assistant's own state formatting (2023.12+): units, precision, translations */
    formatEntityState?: (entity: HassEntity) => string;
    language?: string;
    locale?: { language?: string; number_format?: string; time_format?: string };
    /** The entity registry's display entries (device, integration) */
    entities?: Record<string, { entity_id: string; device_id?: string | null; platform?: string }>;
    /** A websocket command (energy/get_prefs for the card picker's starting config) */
    callWS?: <T>(msg: { type: string; [key: string]: unknown }) => Promise<T>;
}

/** A built-in cell of the grid */
export type CellKind = 'battery' | 'grid' | 'voltage' | 'tomorrow' | 'consumption';

/** A built-in cell with its own tap action: { type: grid, tap_action: … } */
export interface BuiltinCell {
    type: CellKind;
    tap_action?: Record<string, unknown>;
}

/** A free cell: any entity, with its own name, icon and tap action */
export interface CustomCell {
    entity: string;
    name?: string;
    icon?: string;
    tap_action?: Record<string, unknown>;
}

export type CellConfig = CellKind | BuiltinCell | CustomCell;

/** What the hero shows at night: production (0 W, the default), the home's consumption, or the battery */
export type NightHero = 'production' | 'consumption' | 'battery';

/** The card's shape: the cells in a grid under the hero (standard), or listed on its right as icon + value (side) */
export type CardLayout = 'standard' | 'side';

export interface EnergySkyCardConfig {
    type: string;
    /** One power sensor, or several summed (micro-inverters + a string inverter) */
    production_entity: string | string[];
    production_max?: number;
    daily_production_entities?: string[];
    battery?: {
        soc_entity?: string;
        power_entity?: string;
        /** The battery's temperature, shown after the charge: « 78 % ↑ · 24 °C » */
        temperature_entity?: string;
        /** Entities on when the battery has reached its target charge: « SOC atteint » */
        soc_reached_entities?: string[];
        /** Below this power (W) the battery is idle: no ↑ / ↓ arrow */
        power_threshold?: number;
        /** The sensor is positive when discharging (the card expects positive when charging) */
        invert?: boolean;
    };
    grid?: {
        power_entity?: string;
        voltage_entity?: string;
        outage_entity?: string;
        outage_states?: string[];
        /** The sensor is positive when exporting (the card expects positive when importing) */
        invert?: boolean;
    };
    /** The home's power use (W) */
    consumption_entity?: string;
    night_hero?: NightHero;
    /** standard (default, 4 rows) or side (2 rows: the cells on the right, icon + value) */
    layout?: CardLayout;
    /** A tap on the big number unfolds the energy flow (sun, grid, battery, home) under the card */
    expandable?: boolean;
    /** Up to 4 cells, in order; without it, the built-in cells whose entities are set */
    cells?: CellConfig[];
    forecast_tomorrow_entity?: string;
    tariff_color_entity?: string;
    tariff_palettes?: Record<string, [string, string, string]>;
    sun_entity?: string;
    animate?: boolean;
    tap_action?: Record<string, unknown>;
    hold_action?: Record<string, unknown>;
    double_tap_action?: Record<string, unknown>;
}

export interface CustomCardEntry {
    type: string;
    name: string;
    description?: string;
    preview?: boolean;
    documentationURL?: string;
}

declare global {
    interface Window {
        customCards?: CustomCardEntry[];
        energySkyCardBannerShown?: boolean;
    }
}
