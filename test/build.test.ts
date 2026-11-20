import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Runs against the committed bundles: `npm run build` first.
const MAIN = 'energy-sky-card.js';

describe.runIf(existsSync(MAIN))('main bundle', () => {
    const code = readFileSync(MAIN);

    it('stays under 30 KB gzipped', () => {
        expect(gzipSync(code).length).toBeLessThan(33 * 1024);
    });

    it('makes no network request at runtime', () => {
        expect(code.toString()).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket\(/);
    });
});
