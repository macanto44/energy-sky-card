// The README's pictures, from the built card in the local demo (headless Chrome):
// docs/images/{bleu,blanc,rouge}.png, docs/images/cote.png (the side layout), and docs/images/nuit-anim.png, an
// animated PNG of the night sky (4 s, looping: the twinkle's cycle), 2 × like the stills.
// Usage: npm run build && npm run screenshots   (CHROME=/path/to/chrome to override)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { crc32 } from 'node:zlib';

const chrome = process.env.CHROME
    ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!chrome) throw new Error('No Chrome found (set CHROME=…)');
const page = `file://${resolve('demo/index.html')}`;
const work = mkdtempSync(join(tmpdir(), 'esc-shots-'));

/** One card, 360 × 248 (or 120 in the side layout), frozen at `seek` ms, at `scale` × */
function shoot(out, scenario, seek, scale = 2, side = false) {
    execFileSync(chrome, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
        `--force-device-scale-factor=${scale}`, `--window-size=360,${side ? 120 : 248}`, '--virtual-time-budget=4000',
        `--screenshot=${out}`, `${page}?s=${scenario}&bare&widths=360&seek=${seek}${side ? '&side' : ''}`,
    ], { stdio: 'ignore' });
}

// The stills, by day, with the halo near its peak (the night is the animation below)
const stills = { bleu: 3000, blanc: 3000, rouge: 3000 };
for (const [name, seek] of Object.entries(stills)) {
    shoot(`docs/images/${name}.png`, name, seek);
    console.log(`docs/images/${name}.png`);
}
// The side layout (layout: side), Bleu
shoot('docs/images/cote.png', 'bleu', 3000, 2, true);
console.log('docs/images/cote.png');

/** A PNG's chunks: [type, data] */
function chunks(png) {
    const out = [];
    for (let at = 8; at < png.length;) {
        const length = png.readUInt32BE(at);
        out.push([png.toString('latin1', at + 4, at + 8), png.subarray(at + 8, at + 8 + length)]);
        at += 12 + length;
    }
    return out;
}

function chunk(type, data) {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, 'latin1');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
    return Buffer.concat([head, data, crc]);
}

const u32 = (...values) => {
    const b = Buffer.alloc(values.length * 4);
    values.forEach((v, i) => b.writeUInt32BE(v, i * 4));
    return b;
};

/** Frames (same size and format) into one looping animated PNG, `delay` ms each */
function apng(frames, delay) {
    const parsed = frames.map(f => chunks(readFileSync(f)));
    const ihdr = parsed[0].find(([t]) => t === 'IHDR')[1];
    if (!parsed.every(c => c.find(([t]) => t === 'IHDR')[1].equals(ihdr))) throw new Error('Frames differ in size or format');
    const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4);
    const parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('acTL', u32(frames.length, 0))];
    let seq = 0;
    parsed.forEach((c, i) => {
        // fcTL: sequence, size, offset 0,0, delay as delay/1000 s, dispose none, blend source
        const fctl = Buffer.concat([u32(seq++, width, height, 0, 0), Buffer.from([delay >> 8, delay & 255, 3, 232, 0, 0])]);
        parts.push(chunk('fcTL', fctl));
        for (const [type, data] of c.filter(([t]) => t === 'IDAT')) {
            parts.push(i === 0 ? chunk('IDAT', data) : chunk('fdAT', Buffer.concat([u32(seq++), data])));
        }
    });
    parts.push(chunk('IEND', Buffer.alloc(0)));
    return Buffer.concat(parts);
}

// The animation: 4 s from the first shooting star's pass (4 s in), 2 ×, 100 ms a frame
const DELAY = 100, START = 4000, LENGTH = 4000;
const frames = [];
for (let t = START; t < START + LENGTH; t += DELAY) {
    const f = join(work, `f${frames.length}.png`);
    shoot(f, 'nuit', t, 2);
    frames.push(f);
}
const anim = apng(frames, DELAY);
writeFileSync('docs/images/nuit-anim.png', anim);
console.log(`docs/images/nuit-anim.png: ${frames.length} frames, ${(anim.length / 1024).toFixed(0)} KB`);
rmSync(work, { recursive: true });
