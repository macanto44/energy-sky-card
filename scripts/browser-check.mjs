// Runs the built card in headless Chrome and checks what jsdom can't:
// real CSS animations stop off-screen and never start under reduced motion,
// nothing overflows (both layouts), and the night's stars cover the card without touching text.
// Usage: npm run build && npm run test:browser   (CHROME=/path/to/chrome to override)
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const chrome = process.env.CHROME
    ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!chrome) {
    // Locally a missing Chrome skips the check; in CI it fails, so it can't pass by not running
    console.log(`browser-check: no Chrome found, ${process.env.CI ? 'failed' : 'skipped'} (set CHROME=…)`);
    process.exit(process.env.CI ? 1 : 0);
}
const page = `file://${resolve('demo/index.html')}`;

function probeOnce(query, extra, height) {
    const html = execFileSync(chrome, [
        '--headless=new', '--disable-gpu', '--allow-file-access-from-files', ...(process.env.CI ? ['--no-sandbox'] : []), `--window-size=720,${height}`,
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
 * or before the IntersectionObserver has reported (up to 4 times in 10 on a busy machine): try again, up to 6 times
 */
function probe(query, extra = [], height = 500, ready = cards => cards.length > 0) {
    let cards = [];
    for (let attempt = 0; attempt < 6 && !ready(cards); attempt++) cards = probeOnce(query, extra, height);
    return cards;
}

let failures = 0;
const check = (ok, message) => {
    console.log(`${ok ? '✓' : '✗'} ${message}`);
    if (!ok) failures++;
};

const cards = probe('', [], 500, cs => cs.length === 18 && cs.some(c => c.motion === 'paused'));
check(cards.length === 18, `18 demo cards rendered (got ${cards.length})`);
for (const c of cards) {
    if (c.motion === 'on') check(Number(c.running) > 0 && Number(c.paused) === 0, `${c.name}: on screen, animating (${c.running} running)`);
    else if (c.motion === 'paused') check(Number(c.running) === 0, `${c.name}: off-screen, nothing running (${c.paused} paused)`);
    else check(false, `${c.name}: unexpected motion=${c.motion}`);
}
check(cards.some(c => c.motion === 'paused'), 'at least one card is off-screen');

// Every language the card speaks
const LANGS = ['fr', 'en', 'de', 'es', 'it', 'nl'];

// Brief §5.3: no line overflows at 320 px (a 304 px card), in every language, extreme values included
for (const lang of LANGS) {
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

// The side layout (2 rows, 120 px): nothing overflows on a phone, in every language, extreme values included
for (const lang of LANGS) {
    for (const c of probe(`side&lang=${lang}`, [], 2400)) {
        check(c.overflow === '0' && c.tall === '0', `side ${lang} ${c.name}: no overflow (hero ${c.hero} px${['', ', short SOC', ', tight battery', ', no complement'][Number(c.short)]})`);
    }
}
// …and on a usual phone the battery keeps its temperature
for (const c of probe('side&s=bleu&widths=360', [], 1200)) check(c.short === '0', `side ${c.name}: battery in full`);

// Unfolded (expandable: true), both layouts: nothing overflows, the comets run on the busy wires
for (const layout of ['', 'side&']) {
    for (const lang of LANGS) {
        for (const c of probe(`${layout}expand&lang=${lang}`, [], 2800)) {
            check(c.overflow === '0' && c.tall === '0', `unfolded ${layout ? 'side ' : ''}${lang} ${c.name}: no overflow`);
        }
    }
}
for (const c of probe('expand&s=bleu,rouge&widths=360', [], 1400)) check(Number(c.comets) > 0, `unfolded ${c.name}: ${c.comets} comets running`);
// The flow always shown, both layouts: same checks
for (const layout of ['', 'side&']) {
    for (const c of probe(`${layout}expand=always&s=bleu,extremes,charge`, [], 2800)) {
        check(c.overflow === '0' && c.tall === '0' && (c.mode === 'night' || Number(c.comets) > 0), `always shown ${layout ? 'side ' : ''}${c.name}: no overflow, ${c.comets} comets`);
    }
}
for (const c of probe('expand&s=bleu&widths=360', ['--force-prefers-reduced-motion'], 1400)) check(c.comets === '0' && c.running === '0', `unfolded ${c.name}, reduced motion: no comet`);

// Appliances in the flow (2 and 4), both layouts: nothing overflows, a phone shows the first two
for (const layout of ['', 'side&']) {
    for (const n of [2, 4]) {
        for (const c of probe(`${layout}expand=always&consumers=${n}&s=bleu,extremes,nuit`, [], 2800)) {
            check(c.overflow === '0' && c.tall === '0', `${n} appliances ${layout ? 'side ' : ''}${c.name}: no overflow`);
        }
    }
}

// The flow in kWh (an Energy dashboard, flow_unit: energy), both layouts, every language, usual and large figures, 4 appliances:
// nothing overflows (the units kept on a phone), no comet runs; in kW the switch beside the grid leaves the comets running
for (const layout of ['', 'side&']) {
    for (const lang of LANGS) {
        for (const kwh of ['', '&kwh=big']) {
            const cards = probe(`${layout}expand=always&consumers=4&unit=energy${kwh}&s=bleu,nuit&lang=${lang}`, [], 2800, cs => cs.length === 4);
            check(cards.length === 4, `kWh ${layout ? 'side ' : ''}${lang}${kwh ? ' large' : ''}: 4 cards rendered (got ${cards.length})`);
            for (const c of cards) {
                check(c.overflow === '0' && c.tall === '0' && c.comets === '0', `kWh ${layout ? 'side ' : ''}${lang}${kwh ? ' large' : ''} ${c.name}: no overflow, no comet`);
            }
        }
    }
}
const kwCards = probe('expand=always&consumers=2&unit=power&s=bleu&widths=304,360', [], 1400, cs => cs.length === 2);
check(kwCards.length === 2, `kW with the switch: 2 cards rendered (got ${kwCards.length})`);
for (const c of kwCards) check(c.overflow === '0' && Number(c.comets) > 0, `kW with the switch ${c.name}: no overflow, ${c.comets} comets`);

// The weather sky: its rain, clouds and lightning run on screen, nothing overflows, none under reduced motion
for (const query of ['sky=weather&wx=lightning-rainy', 'side&sky=weather&wx=snowy', 'expand=always&sky=weather&wx=rainy']) {
    for (const c of probe(`${query}&s=bleu,nuit,extremes`, [], 2800)) {
        check(c.overflow === '0' && c.tall === '0' && (c.motion !== 'on' || Number(c.running) > 0), `weather ${query} ${c.name}: no overflow, ${c.running} animations running`);
    }
}
for (const c of probe('sky=weather&wx=rainy&s=bleu', ['--force-prefers-reduced-motion'], 1150)) {
    check(c.motion === 'off' && c.running === '0', `weather rainy ${c.name}, reduced motion: nothing moves`);
}

// The night sky covers the whole card (a visible star in each quarter) and none touches text
for (const query of ['lang=fr', 'lang=en', 'h=184', 'side', 'sky=weather&wx=sunny']) {
    for (const c of probe(query, [], 2400).filter(c => c.mode === 'night')) {
        check(c.hits === '0' && c.quarters === '4', `${query} ${c.name}: ${c.dots} stars in ${c.quarters} quarters, ${c.hits} on text`);
    }
}

for (const c of probe('s=nuit,bleu', ['--force-prefers-reduced-motion'], 1150)) {
    check(c.motion === 'off' && c.running === '0' && c.paused === '0', `${c.name}: reduced motion, no animation at all`);
}

process.exit(failures ? 1 : 0);
