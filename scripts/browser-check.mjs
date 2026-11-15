// Runs the built card in headless Chrome and checks what jsdom can't:
// real CSS animations stop off-screen and never start under reduced motion.
// Usage: npm run build && npm run test:browser   (CHROME=/path/to/chrome to override)
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const chrome = process.env.CHROME
    ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!chrome) {
    console.log('browser-check: no Chrome found, skipped (set CHROME=…)');
    process.exit(0);
}
const page = `file://${resolve('demo/index.html')}`;

function probeOnce(query, extra, height) {
    const html = execFileSync(chrome, [
        '--headless=new', '--disable-gpu', '--allow-file-access-from-files', `--window-size=720,${height}`,
        '--virtual-time-budget=3000', ...extra, '--dump-dom', `${page}?probe=1&${query}`,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const text = /<pre id="probe">([\s\S]*?)<\/pre>/.exec(html)?.[1] ?? '';
    return text.trim().split('\n').filter(line => line.includes(' | ')).map(line => {
        const [name, rest] = line.split(' | ');
        return { name, ...Object.fromEntries(rest.split(' ').map(kv => kv.split('='))) };
    });
}

/**
 * Headless Chrome sometimes dumps the page before the probe has written,
 * or before the IntersectionObserver has reported: try again, up to 3 times
 */
function probe(query, extra = [], height = 500, ready = cards => cards.length > 0) {
    let cards = [];
    for (let attempt = 0; attempt < 3 && !ready(cards); attempt++) cards = probeOnce(query, extra, height);
    return cards;
}

let failures = 0;
const check = (ok, message) => {
    console.log(`${ok ? '✓' : '✗'} ${message}`);
    if (!ok) failures++;
};

const cards = probe('', [], 500, cs => cs.length === 14 && cs.some(c => c.motion === 'paused'));
check(cards.length === 14, `14 demo cards rendered (got ${cards.length})`);
for (const c of cards) {
    if (c.motion === 'on') check(Number(c.running) > 0 && Number(c.paused) === 0, `${c.name}: on screen, animating (${c.running} running)`);
    else if (c.motion === 'paused') check(Number(c.running) === 0, `${c.name}: off-screen, nothing running (${c.paused} paused)`);
    else check(false, `${c.name}: unexpected motion=${c.motion}`);
}
check(cards.some(c => c.motion === 'paused'), 'at least one card is off-screen');

// Brief §5.3: no line overflows at 320 px (a 304 px card), in either language, extreme values included
for (const lang of ['fr', 'en']) {
    for (const c of probe(`lang=${lang}`, [], 2400)) {
        check(c.overflow === '0' && c.tall === '0', `${lang} ${c.name}: no overflow (hero ${c.hero} px${c.short === '1' ? ', short SOC' : c.short === '2' ? ', tight battery' : ''})`);
    }
}
// « SOC atteint » stays in full on a usual phone (360 px card), without a temperature
for (const c of probe('s=blanc&widths=360', [], 1200)) check(c.short === '0', `${c.name}: « SOC atteint » in full`);

// Three rows (184 px): the compact spacing takes over, still nothing overflows
for (const c of probe('h=184&s=bleu,extremes,coupure', [], 2400)) {
    check(c.overflow === '0' && c.tall === '0', `184 px ${c.name}: no overflow (hero ${c.hero} px)`);
}

for (const c of probe('s=nuit,bleu', ['--force-prefers-reduced-motion'], 1150)) {
    check(c.motion === 'off' && c.running === '0' && c.paused === '0', `${c.name}: reduced motion, no animation at all`);
}

process.exit(failures ? 1 : 0);
