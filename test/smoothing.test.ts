import { describe, it, expect, vi, afterEach } from 'vitest';
import { REFRESH_MS, Smoother, smoothedEntities } from '../src/smoothing';
import { validateConfig } from '../src/energy-sky-card';
import { $, ANNEX_B, FULL_CONFIG, entity, makeHass, mountCard } from './helpers';

const hassWith = (state: string | number, unit = 'W') => makeHass({ 'sensor.pv': entity('sensor.pv', state, { unit_of_measurement: unit }) });

describe('the smoother', () => {
    it('averages over time: each reading counts for as long as it stood', () => {
        const s = new Smoother(10_000);
        s.record(hassWith(1000), ['sensor.pv'], 0);
        s.record(hassWith(0), ['sensor.pv'], 5_000);
        expect(s.average('sensor.pv', 5_000)).toBe(1000);
        // 5 s at 1000 W, 5 s at 0 W
        expect(s.average('sensor.pv', 10_000)).toBe(500);
        // The window has passed the 1000 W reading
        expect(s.average('sensor.pv', 15_000)).toBe(0);
    });

    it('counts a reading once, however many updates repeat it', () => {
        const s = new Smoother(10_000);
        const hass = hassWith(1000);
        s.record(hass, ['sensor.pv'], 0);
        s.record(hass, ['sensor.pv'], 4_000);
        s.record(hassWith(2000), ['sensor.pv'], 5_000);
        expect(s.average('sensor.pv', 10_000)).toBe(1500);
    });

    it('starts again after an unavailable reading or a change of unit', () => {
        const s = new Smoother(10_000);
        s.record(hassWith(1000), ['sensor.pv'], 0);
        s.record(hassWith('unavailable'), ['sensor.pv'], 2_000);
        expect(s.average('sensor.pv', 2_000)).toBeUndefined();
        s.record(hassWith(3), ['sensor.pv'], 3_000);
        s.record(hassWith(2, 'kW'), ['sensor.pv'], 4_000);
        expect(s.average('sensor.pv', 8_000)).toBe(2);
    });

    it('hands out a hass with the averages, leaving everything else alone', () => {
        const s = new Smoother(10_000);
        const hass = hassWith(1000);
        s.record(hass, ['sensor.pv'], 0);
        s.record(hassWith(0), ['sensor.pv'], 5_000);
        const smoothed = s.smoothed(hass, ['sensor.pv'], 10_000);
        expect(smoothed.states['sensor.pv'].state).toBe('500');
        expect(smoothed.states['sensor.pv'].attributes).toEqual({ unit_of_measurement: 'W' });
        expect(hass.states['sensor.pv'].state).toBe('1000');
    });

    it('holds the averages shown between refreshes, however often hass comes', () => {
        const s = new Smoother(10_000);
        s.record(hassWith(1000), ['sensor.pv'], 0);
        expect(s.smoothed(hassWith(1000), ['sensor.pv'], 0).states['sensor.pv'].state).toBe('1000');
        // A new reading, then many updates within the refresh: the number holds
        for (let t = 1_000; t < REFRESH_MS; t += 250) {
            s.record(hassWith(0), ['sensor.pv'], 1_000);
            expect(s.smoothed(hassWith(0), ['sensor.pv'], t).states['sensor.pv'].state).toBe('1000');
        }
        // 1 s at 1000 W, 4 s at 0 W
        expect(s.smoothed(hassWith(0), ['sensor.pv'], REFRESH_MS).states['sensor.pv'].state).toBe('200');
        // Unavailable: its own state at once; back: its reading at once
        s.record(hassWith('unavailable'), ['sensor.pv'], 6_000);
        expect(s.smoothed(hassWith('unavailable'), ['sensor.pv'], 6_000).states['sensor.pv'].state).toBe('unavailable');
        s.record(hassWith(300), ['sensor.pv'], 7_000);
        expect(s.smoothed(hassWith(300), ['sensor.pv'], 7_000).states['sensor.pv'].state).toBe('300');
    });

    it('smooths the powers only: production, home, battery, grid, appliances', () => {
        const ids = smoothedEntities({ ...FULL_CONFIG, consumption_entity: 'sensor.home', consumers: [{ entity: 'sensor.boiler' }] });
        expect(ids).toEqual(expect.arrayContaining(['sensor.production_pv', 'sensor.home', FULL_CONFIG.battery!.power_entity!, FULL_CONFIG.grid!.power_entity!, 'sensor.boiler']));
        expect(ids).not.toContain(FULL_CONFIG.battery!.soc_entity);
    });
});

describe('the card with smoothing', () => {
    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('shows the average, and moves on between readings', () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        const config = { ...FULL_CONFIG, smoothing: 10 };
        const card = mountCard(config, makeHass({ ...ANNEX_B, 'sensor.production_pv': 4000 }));
        expect($(card, '.hero-value').textContent).toBe('4,0');
        vi.advanceTimersByTime(5_000);
        card.hass = makeHass({ ...ANNEX_B, 'sensor.production_pv': 2000 });
        expect($(card, '.hero-value').textContent).toBe('4,0');
        // 5 s at 4 kW, 5 s at 2 kW: 3 kW, with no new reading (the card's own tick)
        vi.advanceTimersByTime(5_000);
        expect($(card, '.hero-value').textContent).toBe('3,0');
        vi.advanceTimersByTime(10_000);
        expect($(card, '.hero-value').textContent).toBe('2,0');
    });

    it('shows readings as they come without it, and refuses a negative value', () => {
        const card = mountCard(FULL_CONFIG, makeHass({ ...ANNEX_B, 'sensor.production_pv': 4000 }));
        card.hass = makeHass({ ...ANNEX_B, 'sensor.production_pv': 2000 });
        expect($(card, '.hero-value').textContent).toBe('2,0');
        expect(() => validateConfig({ ...FULL_CONFIG, smoothing: -1 })).toThrow(/smoothing/);
    });
});
