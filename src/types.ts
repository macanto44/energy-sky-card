// The slice of Home Assistant's frontend types the card uses

export interface HassEntity {
    entity_id: string;
    state: string;
    attributes: Record<string, unknown>;
    last_changed: string;
    last_updated: string;
    /** When the integration last sent a reading, changed or not (Home Assistant 2024.3+) */
    last_reported?: string;
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
export type CellKind = 'battery' | 'grid' | 'voltage' | 'tomorrow' | 'consumption' | 'self_sufficiency';

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

/** An appliance in the energy flow, beside the home: its power, its own name, icon and tap action */
export interface ConsumerConfig {
    entity: string;
    name?: string;
    icon?: string;
    tap_action?: Record<string, unknown>;
    /** A charge (%) to show in the appliance's ring, a car's battery say */
    soc_entity?: string;
    /** Stays in the flow below consumer_threshold (with its charge) */
    always_show?: boolean;
}

/** What the hero shows at night: production (0 W, the default), the home's consumption, or the battery */
export type NightHero = 'production' | 'consumption' | 'battery';

/** The card's shape: the cells in a grid under the hero (standard), or listed on its right as icon + value (side) */
export type CardLayout = 'standard' | 'side';

/** The sky behind the card: today's tariff colour, one colour of your own, or the weather */
export type SkyMode = 'tempo' | 'solid' | 'weather';

/** The energy flow under the card: unfolded by a tap on the big number, or always shown */
export type FlowMode = 'tap' | 'always';

/** How the battery's estimate shows: a clock time, a duration, or not at all */
export type EstimateForm = 'time' | 'duration' | 'off';

export interface BatteryEstimateConfig {
    /** While charging: time (default, « 14:20 »), duration (« 2 h 10 ») or off */
    charge?: EstimateForm;
    /** While discharging: duration (default, « 5 h 30 »), time (« 04:10 ») or off */
    discharge?: EstimateForm;
    /** With a temperature: replace it (default) or show both */
    with_temperature?: 'replace' | 'both';
    /** In the battery node's label too (default true) */
    flow?: boolean;
}

export interface EnergySkyCardConfig {
    type: string;
    /** One power sensor, or several summed (micro-inverters + a string inverter) */
    production_entity: string | string[];
    production_max?: number;
    daily_production_entities?: string[];
    battery?: {
        /** The charge (%), or one per battery: averaged (weighted by capacity when it lists one per battery) */
        soc_entity?: string | string[];
        /** One signed power sensor (positive when charging), or one per battery, summed */
        power_entity?: string | string[];
        /** Instead of power_entity: the charging and discharging powers, each positive (one per battery, summed) */
        charge_entity?: string | string[];
        discharge_entity?: string | string[];
        /** kWh, or one per battery: turns the estimate on (full at… / reserve in…) */
        capacity?: number | number[];
        /** The charge (%) the estimate aims for when charging (100 by default) */
        max_soc?: number;
        /** The charge (%) the estimate stops at when discharging (0 by default) */
        reserve_soc?: number;
        estimate?: BatteryEstimateConfig;
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
        /** One signed power sensor, positive when importing */
        power_entity?: string;
        /** Instead of power_entity: the import and export powers, each positive */
        import_entity?: string;
        export_entity?: string;
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
    /** The energy flow (sun, grid, battery, home) under the card: on a tap on the big number, or always; none without it */
    flow?: FlowMode;
    /** 0.3.3's name of flow: tap, still read */
    expandable?: boolean;
    /** Up to 4 appliances in the flow, around the home: the first above, the second below, and so on */
    consumers?: ConsumerConfig[];
    /** The flow's colours, any CSS colour; a theme can set them for every card (--energy-sky-card-solar…) */
    flow_colors?: { solar?: string; grid?: string; battery?: string; consumption?: string };
    /** Minutes without a new reading before a value is flagged as stale (30 by default; 0 never) */
    stale_after?: number;
    /** Seconds: the powers shown are each sensor's average over this long (0, the default: as read) */
    smoothing?: number;
    /** Below this power (W) the production reads 0 (none by default) */
    production_threshold?: number;
    /** Below this power (W) an appliance leaves the flow (10 by default; 0 keeps them all) */
    consumer_threshold?: number;
    /** Up to 4 cells, in order; without it, the built-in cells whose entities are set */
    cells?: CellConfig[];
    forecast_tomorrow_entity?: string;
    tariff_color_entity?: string;
    /** The sky: tempo (default), solid (background_color) or weather (weather_entity) */
    background?: SkyMode;
    /** The solid sky's colour (#rrggbb), darkened if need be for white text */
    background_color?: string;
    /** A weather entity, for the weather sky */
    weather_entity?: string;
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
