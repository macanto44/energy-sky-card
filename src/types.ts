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
    language?: string;
    locale?: { language?: string; number_format?: string; time_format?: string };
}

export interface EnergySkyCardConfig {
    type: string;
    production_entity: string;
    production_max?: number;
    daily_production_entities?: string[];
    battery?: {
        soc_entity?: string;
        power_entity?: string;
        lock_entities?: string[];
    };
    grid?: {
        power_entity?: string;
        voltage_entity?: string;
        outage_entity?: string;
        outage_states?: string[];
    };
    forecast_tomorrow_entity?: string;
    tariff_color_entity?: string;
    tariff_palettes?: Record<string, [string, string, string]>;
    sun_entity?: string;
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
