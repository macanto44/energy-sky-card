// Where the sun and the moon are in the sky, and how much of the moon is lit:
// low-precision formulas from the usual astronomical series (a few tenths of
// a degree, plenty for a card), worked out for the place Home Assistant is
// set at. Pure: a date and a place in, angles out (degrees).

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);
const deg = (rad: number) => rad / RAD;
const wrap = (d: number) => ((d % 360) + 360) % 360;

/** Days since 2000-01-01 12:00 UTC (J2000.0) */
export const daysSinceJ2000 = (ms: number): number => ms / 86_400_000 - 10_957.5;

interface Equatorial { ra: number; dec: number }

/** Ecliptic longitude / latitude to right ascension / declination, for day d */
function toEquatorial(lon: number, lat: number, d: number): Equatorial {
    const e = 23.4393 - 3.563e-7 * d;
    return {
        ra: wrap(deg(Math.atan2(sin(lon) * cos(e) - Math.tan(lat * RAD) * sin(e), cos(lon)))),
        dec: deg(Math.asin(sin(lat) * cos(e) + cos(lat) * sin(e) * sin(lon))),
    };
}

/** The sun's ecliptic longitude on day d (its latitude is 0) */
function sunLongitude(d: number): number {
    const g = 357.529 + 0.98560028 * d;
    return 280.459 + 0.98564736 * d + 1.915 * sin(g) + 0.02 * sin(2 * g);
}

/** The moon's ecliptic longitude and latitude on day d: its largest periodic terms */
function moonEcliptic(d: number): { lon: number; lat: number } {
    const L = 218.316 + 13.176396 * d;
    const M = 134.963 + 13.064993 * d;
    const F = 93.272 + 13.22935 * d;
    const D = 297.85 + 12.190749 * d;
    const S = 357.529 + 0.98560028 * d;
    return {
        lon: L + 6.289 * sin(M) - 1.274 * sin(M - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(S) - 0.059 * sin(2 * M - 2 * D) - 0.057 * sin(M - 2 * D + S) + 0.053 * sin(M + 2 * D),
        lat: 5.128 * sin(F) + 0.281 * sin(M + F) - 0.278 * sin(F - M) - 0.173 * sin(F - 2 * D),
    };
}

/** A body's place in the sky: altitude above the horizon, azimuth from north towards east */
export interface Horizontal { alt: number; az: number }

function toHorizontal({ ra, dec }: Equatorial, d: number, latitude: number, longitude: number): Horizontal {
    const h = 280.46061837 + 360.98564736629 * d + longitude - ra;
    return {
        alt: deg(Math.asin(sin(latitude) * sin(dec) + cos(latitude) * cos(dec) * cos(h))),
        az: wrap(deg(Math.atan2(-cos(dec) * sin(h), cos(latitude) * sin(dec) - sin(latitude) * cos(dec) * cos(h)))),
    };
}

/** Where the sun is, seen from latitude / longitude at a time */
export function sunPosition(ms: number, latitude: number, longitude: number): Horizontal {
    const d = daysSinceJ2000(ms);
    return toHorizontal(toEquatorial(sunLongitude(d), 0, d), d, latitude, longitude);
}

export interface MoonView extends Horizontal {
    /** The lit share of its disc, 0 (new) to 1 (full) */
    lit: number;
    /**
     * Which way its lit side faces: the bearing of the sun from the moon on
     * the sky, from straight up towards increasing azimuth (degrees)
     */
    limb: number;
    /** Its angular distance from the sun (degrees) */
    elongation: number;
}

/** The moon seen from latitude / longitude at a time: its place (with the parallax of its nearness), phase and lit side */
export function moonView(ms: number, latitude: number, longitude: number): MoonView {
    const d = daysSinceJ2000(ms);
    const sunEq = toEquatorial(sunLongitude(d), 0, d);
    const ecl = moonEcliptic(d);
    const moonEq = toEquatorial(ecl.lon, ecl.lat, d);
    const sun = toHorizontal(sunEq, d, latitude, longitude);
    const moon = toHorizontal(moonEq, d, latitude, longitude);
    // Seen from the ground rather than the earth's centre, the moon sits up to ~1° lower
    moon.alt -= 0.95 * cos(moon.alt);
    const cosElong = sin(sunEq.dec) * sin(moonEq.dec) + cos(sunEq.dec) * cos(moonEq.dec) * cos(sunEq.ra - moonEq.ra);
    const elongation = deg(Math.acos(Math.max(-1, Math.min(1, cosElong))));
    const dAz = sun.az - moon.az;
    const limb = wrap(deg(Math.atan2(sin(dAz) * cos(sun.alt), cos(moon.alt) * sin(sun.alt) - sin(moon.alt) * cos(sun.alt) * cos(dAz))));
    return { ...moon, lit: (1 - cosElong) / 2, limb, elongation };
}
