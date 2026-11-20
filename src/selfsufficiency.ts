// Today's self-sufficiency: the share of the home's use not bought from the
// grid, since midnight, from the Energy dashboard's meters. The same sum as
// the dashboard's own gauge: 1 - min(1, bought / used), where used is the
// home meter when there is one, else bought + solar + discharged - sold -
// charged. The meters' changes since midnight come from Home Assistant's
// statistics (a request to Home Assistant itself, never to the internet).

import type { EnergyPrefs } from './stub';
import type { HomeAssistant } from './types';

/** The Energy dashboard's meters (kWh statistics), by what they count */
export interface EnergyMeters {
    from_grid: string[];
    to_grid: string[];
    solar: string[];
    from_battery: string[];
    to_battery: string[];
    home: string[];
}

export type MeterKey = keyof EnergyMeters;

/** The meters of the Energy dashboard's sources, in both prefs shapes (grid flow_from / flow_to, or stat_energy_from / _to) */
export function energyMeters(prefs: EnergyPrefs | undefined): EnergyMeters {
    const meters: EnergyMeters = { from_grid: [], to_grid: [], solar: [], from_battery: [], to_battery: [], home: [] };
    const add = (key: MeterKey, id: string | null | undefined) => {
        if (id && !meters[key].includes(id)) meters[key].push(id);
    };
    for (const source of prefs?.energy_sources ?? []) {
        switch (source.type) {
            case 'grid':
                add('from_grid', source.stat_energy_from);
                add('to_grid', source.stat_energy_to);
                for (const flow of source.flow_from ?? []) add('from_grid', flow.stat_energy_from);
                for (const flow of source.flow_to ?? []) add('to_grid', flow.stat_energy_to);
                break;
            case 'solar':
                add('solar', source.stat_energy_from);
                break;
            case 'battery':
                add('from_battery', source.stat_energy_from);
                add('to_battery', source.stat_energy_to);
                break;
            case 'home':
                add('home', source.stat_energy_from);
                break;
        }
    }
    return meters;
}

/** Whether the dashboard has what the sum needs: a grid import meter */
export const canComputeSelfSufficiency = (meters: EnergyMeters): boolean => meters.from_grid.length > 0;

/** Every meter, once */
export const meterIds = (meters: EnergyMeters): string[] => [...new Set(Object.values(meters).flat())];

/**
 * The share (%) of today's use not bought, from each meter's change since
 * midnight (kWh). Undefined without a grid meter, a reading of it, or any use.
 */
export function selfSufficiency(meters: EnergyMeters, changes: Record<string, number | undefined>): number | undefined {
    const total = (key: MeterKey): number | undefined => {
        const values = meters[key].map(id => changes[id]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
        return values.length ? values.reduce((a, b) => a + b, 0) : undefined;
    };
    const bought = total('from_grid');
    if (bought === undefined) return undefined;
    const home = total('home');
    const used = Math.max(0, home ?? bought + (total('solar') ?? 0) + (total('from_battery') ?? 0) - (total('to_grid') ?? 0) - (total('to_battery') ?? 0));
    if (!(used > 0)) return undefined;
    return (1 - Math.min(1, Math.max(0, bought) / used)) * 100;
}

/** Each meter's change since midnight (the profile's day), from Home Assistant's statistics */
export async function todaysChanges(hass: HomeAssistant, ids: string[]): Promise<Record<string, number | undefined>> {
    const call = hass.callWS;
    if (!call) return {};
    const results = await Promise.all(ids.map(async id => {
        try {
            const r = await call<{ change?: number | null }>({
                type: 'recorder/statistic_during_period', statistic_id: id, calendar: { period: 'day' }, types: ['change'], units: { energy: 'kWh' },
            });
            return [id, typeof r?.change === 'number' ? r.change : undefined] as const;
        } catch {
            return [id, undefined] as const;
        }
    }));
    return Object.fromEntries(results);
}

/** How often today's figure is asked for again */
export const SELF_SUFFICIENCY_REFRESH_MS = 5 * 60_000;

/** The time until the next refresh: the usual pace, or just after midnight when that comes first (a new day starts at 0) */
export function nextRefreshIn(now: Date): number {
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime();
    return Math.max(1000, Math.min(SELF_SUFFICIENCY_REFRESH_MS, midnight - now.getTime()));
}
