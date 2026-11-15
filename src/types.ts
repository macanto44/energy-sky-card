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
}

/** A built-in cell of the grid */
export type CellKind = 'battery' | 'grid' | 'voltage' | 'tomorrow' | 'consumption';

/** A free cell: any entity, with its own name and icon */
export interface CustomCell {
    entity: string;
    name?: string;
    icon?: string;
}

export type CellConfig = CellKind | CustomCell;

/** What the hero shows at night: production (0 W, the default), the home's consumption, or the battery */
export type NightHero = 'production' | 'consumption' | 'battery';

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
        /** @deprecated 0.1.0–0.1.1 name of soc_reached_entities, still read */
        lock_entities?: string[];
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
    /** Up to 4 cells, in order; without it, the built-in cells whose entities are set */
    cells?: CellConfig[];
    forecast_tomorrow_entity?: string;
    tariff_color_entity?: string;
    tariff_palettes?: Record<string, [string, string, string]>;
    sun_entity?: string;
    /** @deprecated 0.1.0–0.1.1 place of battery.power_threshold, still read */
    power_threshold?: number;
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
