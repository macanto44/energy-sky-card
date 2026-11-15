// The demo's cards: one per scenario and width (query: s=…, widths=…, lang=…, bare, probe, seek)
import { SCENARIOS, CONFIG } from './scenarios.js';
const params = new URLSearchParams(location.search);
const only = params.get('s');
const lang = params.get('lang') || 'fr';
const root = document.getElementById('cards');
if (params.has('bare')) document.body.classList.add('bare');
for (const [name, overrides] of Object.entries(SCENARIOS)) {
  if (only && !only.split(',').includes(name)) continue;
  const widths = (params.get('widths') || '360,304').split(',').map(Number);
  for (const width of widths) {
    const fig = document.createElement('figure');
    fig.innerHTML = `<figcaption>${name} — ${width} px</figcaption><div class="cell" style="width:${width}px${params.get('h') ? `;height:${params.get('h')}px` : ''}"></div>`;
    const card = document.createElement('energy-sky-card');
    card.setConfig(CONFIG);
    const states = {};
    let t = 0;
    for (const [id, state] of Object.entries(overrides)) {
      const stamp = new Date(Date.UTC(2026, 10, 15, 12, 0, t++)).toISOString();
      states[id] = { entity_id: id, state: String(state), attributes: {}, last_changed: stamp, last_updated: stamp };
    }
    card.hass = { states, language: lang, locale: { language: lang, number_format: 'language' } };
    fig.querySelector('.cell').appendChild(card);
    root.appendChild(fig);
  }
}
// ?seek=ms: freeze every animation at that time (to screenshot a moment of it)
if (params.has('seek')) {
  setTimeout(() => {
    for (const card of document.querySelectorAll('energy-sky-card')) {
      for (const a of card.shadowRoot.querySelector('ha-card').getAnimations({ subtree: true })) {
        a.pause();
        a.currentTime = Number(params.get('seek'));
      }
    }
  }, 1000);
}
// ?probe: report each card's motion state and its running animations (for headless checks)
if (params.has('probe')) {
  setTimeout(() => {
    const lines = [...document.querySelectorAll('energy-sky-card')].map((card, i) => {
      const anims = card.shadowRoot.querySelector('ha-card').getAnimations({ subtree: true });
      const running = anims.filter(a => a.playState === 'running').length;
      const paused = anims.filter(a => a.playState === 'paused').length;
      const lines = [...card.shadowRoot.querySelectorAll('.line')].filter(l => !l.hidden);
      const overflow = lines.filter(l => l.scrollWidth > l.clientWidth + 1).length;
      const content = card.shadowRoot.querySelector('.content');
      const tall = content.scrollHeight > content.clientHeight + 1 ? 1 : 0;
      return `${card.closest('figure').querySelector('figcaption').textContent} | mode=${card.dataset.mode} motion=${card.dataset.motion} running=${running} paused=${paused} overflow=${overflow} tall=${tall} hero=${card.getAttribute('data-hero') ?? 56} short=${card.hasAttribute('data-short-extra') ? 1 : 0}`;
    });
    const pre = document.createElement('pre');
    pre.id = 'probe';
    pre.textContent = lines.join('\n');
    document.body.prepend(pre);
  }, 1500);
}

// ?layout: where each text line sits, as fractions of the card's height (for the contrast test)
if (params.has('layout')) {
  setTimeout(() => {
    const card = document.querySelector('energy-sky-card');
    const box = card.shadowRoot.querySelector('ha-card').getBoundingClientRect();
    const frac = el => { const r = el.getBoundingClientRect(); return [(r.top - box.top) / box.height, (r.bottom - box.top) / box.height].map(v => v.toFixed(3)).join('–'); };
    const q = sel => [...card.shadowRoot.querySelectorAll(sel)].map(frac).join(' ');
    const pre = document.createElement('pre');
    pre.id = 'layout';
    pre.textContent = `height=${box.height} compact=${card.hasAttribute('data-compact')} hero=${card.getAttribute('data-hero') ?? 56}\nhero ${q('.hero')}\ncontext ${q('.context')}\nlabels ${q('.label')}\nvalues ${q('.value')}\ngrid ${q('.grid')}`;
    document.body.prepend(pre);
  }, 1000);
}
