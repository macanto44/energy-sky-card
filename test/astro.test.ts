import { describe, it, expect } from 'vitest';
import { moonView, sunPosition } from '../src/astro';

const PARIS = [48.8566, 2.3522] as const;
const at = (iso: string) => Date.parse(iso);

describe('the sun', () => {
    it('stands where the almanac says, from Paris', () => {
        // Summer solstice, solar noon: 90 - 48.86 + 23.44 = 64.6°, due south
        const noon = sunPosition(at('2024-06-20T11:52:00Z'), ...PARIS);
        expect(noon.alt).toBeCloseTo(64.6, 0);
        expect(Math.abs(noon.az - 180)).toBeLessThan(2);
        // Equinox noon: 90 - 48.86 = 41.1°
        expect(sunPosition(at('2024-03-20T12:00:00Z'), ...PARIS).alt).toBeCloseTo(41.1, 0);
        // Midnight: well below the horizon, to the north
        const night = sunPosition(at('2024-06-20T23:52:00Z'), ...PARIS);
        expect(night.alt).toBeLessThan(-10);
        expect(Math.min(night.az, 360 - night.az)).toBeLessThan(5);
    });

    it('rises in the east and sets in the west', () => {
        expect(sunPosition(at('2024-03-20T06:00:00Z'), ...PARIS).az).toBeGreaterThan(80);
        expect(sunPosition(at('2024-03-20T06:00:00Z'), ...PARIS).az).toBeLessThan(100);
        expect(sunPosition(at('2024-03-20T18:00:00Z'), ...PARIS).az).toBeGreaterThan(260);
    });
});

describe('the moon', () => {
    it('is full, new and half lit on the almanac\'s dates', () => {
        expect(moonView(at('2024-01-25T17:54:00Z'), ...PARIS).lit).toBeGreaterThan(0.99);
        expect(moonView(at('2024-01-11T11:57:00Z'), ...PARIS).lit).toBeLessThan(0.01);
        expect(moonView(at('2024-01-18T03:53:00Z'), ...PARIS).lit).toBeCloseTo(0.5, 1);
    });

    it('turns its lit side towards the sun: an evening crescent low in the west, lit from below right', () => {
        const m = moonView(at('2024-01-14T17:30:00Z'), ...PARIS);
        expect(m.alt).toBeGreaterThan(5);
        expect(m.az).toBeGreaterThan(200);
        expect(m.lit).toBeLessThan(0.2);
        // From straight up towards the west: pointing west and down, to the set sun
        expect(m.limb).toBeGreaterThan(90);
        expect(m.limb).toBeLessThan(180);
    });

    it('rises at full moon as the sun sets, opposite it', () => {
        const m = moonView(at('2024-01-25T17:00:00Z'), ...PARIS);
        expect(m.az).toBeGreaterThan(50);
        expect(m.az).toBeLessThan(80);
        expect(m.elongation).toBeGreaterThan(175);
    });
});
