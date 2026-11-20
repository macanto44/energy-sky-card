// Smoothing: the powers shown are each sensor's average over the last few
// seconds (smoothing), so passing clouds don't make the numbers jump. Time
// weighted: a reading counts for as long as it stood. Pure apart from its
// own samples; the card asks for a smoothed copy of hass at each render.
// The averages shown are worked out at a steady pace (REFRESH_MS, or the
// window if shorter) and held in between: Home Assistant sends hass several
// times a second, and averages redone each time would creep towards every new
// reading, which reads as lag, not as calm.
import type { EnergySkyCardConfig, HassEntity, HomeAssistant } from './types';
import { batteryPowerEntities, gridPowerEntities, productionEntities } from './model';

/** The power entities smoothed: production, home, battery, grid and appliances */
export function smoothedEntities(config: EnergySkyCardConfig): string[] {
    const ids = [
        ...productionEntities(config),
        config.consumption_entity, ...batteryPowerEntities(config), ...gridPowerEntities(config),
        ...(config.consumers ?? []).map(c => c.entity),
    ];
    return [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0))];
}

interface Sample { t: number; v: number }

/** How often the averages shown are worked out again, at most */
export const REFRESH_MS = 5_000;

export class Smoother {
    /** Per entity: its readings in time order, and the last one's last_updated */
    private samples = new Map<string, { at: string; unit: unknown; list: Sample[] }>();

    /** The averages shown, held until the next refresh */
    private held = new Map<string, string>();
    private heldAt = -Infinity;
    private refreshMs: number;

    constructor(private windowMs: number) {
        this.refreshMs = Math.min(windowMs, REFRESH_MS);
    }

    /** Records the readings that are new since the last call */
    record(hass: HomeAssistant, ids: string[], now: number): void {
        for (const id of ids) {
            const entity = hass.states[id];
            const v = entity ? Number.parseFloat(entity.state) : Number.NaN;
            // No reading, or another unit: start again
            if (!entity || !Number.isFinite(v)) {
                this.samples.delete(id);
                continue;
            }
            const unit = entity.attributes.unit_of_measurement;
            let s = this.samples.get(id);
            if (!s || s.unit !== unit) {
                s = { at: '', unit, list: [] };
                this.samples.set(id, s);
            }
            if (s.at === entity.last_updated) continue;
            s.at = entity.last_updated;
            s.list.push({ t: now, v });
            // Keep the window, and the reading standing at its start
            const from = now - this.windowMs;
            while (s.list.length > 1 && s.list[1].t <= from) s.list.shift();
        }
    }

    /** The time-weighted average of an entity's readings over the window, or undefined without any */
    average(id: string, now: number): number | undefined {
        const list = this.samples.get(id)?.list;
        if (!list?.length) return undefined;
        const from = now - this.windowMs;
        let sum = 0;
        let span = 0;
        for (let i = 0; i < list.length; i++) {
            const start = Math.max(list[i].t, from);
            const end = i + 1 < list.length ? list[i + 1].t : now;
            if (end <= start) continue;
            sum += list[i].v * (end - start);
            span += end - start;
        }
        return span > 0 ? sum / span : list[list.length - 1].v;
    }

    /**
     * hass with each smoothed entity's state replaced by its average (nothing
     * else changes). The averages are those of the last refresh; a sensor with
     * readings but none held yet (the first, or back from unavailable) brings
     * the refresh forward.
     */
    smoothed(hass: HomeAssistant, ids: string[], now: number): HomeAssistant {
        // A sensor without readings now forgets its held average
        for (const id of this.held.keys()) if (!this.samples.has(id)) this.held.delete(id);
        const fresh = (id: string) => this.samples.has(id) && !this.held.has(id);
        if (now - this.heldAt >= this.refreshMs || ids.some(fresh)) {
            this.heldAt = now;
            this.held.clear();
            for (const id of ids) {
                const avg = this.average(id, now);
                if (avg !== undefined) this.held.set(id, String(Math.round(avg * 1000) / 1000));
            }
        }
        const states: Record<string, HassEntity> = { ...hass.states };
        for (const id of ids) {
            const avg = this.held.get(id);
            // Without readings now (unavailable), the sensor's own state shows
            if (avg !== undefined && states[id] && this.samples.has(id)) states[id] = { ...states[id], state: avg };
        }
        return { ...hass, states };
    }
}
