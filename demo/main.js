// The demo's cards: one per scenario and width (query: s=…, widths=…, lang=…, side, expand[=always], consumers=n, h=…, bare, probe, seek)
import { ATTRIBUTES, CONSUMERS, SCENARIOS, SCENARIO_CONFIGS, CONFIG } from './scenarios.js';
const params = new URLSearchParams(location.search);
const only = params.get('s');
const lang = params.get('lang') || 'fr';
const root = document.getElementById('cards');
// ?side: the side layout, in a 2-row cell (120 px) unless h says otherwise
const side = params.has('side');
// ?expand: the flow on a tap, unfolded; ?expand=always: the flow always shown (both set their own height)
const expand = params.has('expand');
const flow = params.get('expand') === 'always' ? 'always' : 'tap';
// ?consumers=n: the first n appliances in the flow
const consumers = params.has('consumers') ? { consumers: CONSUMERS.slice(0, Number(params.get('consumers')) || 2) } : {};
const height = expand ? '' : params.get('h') || (side ? '120' : '');
if (params.has('bare')) document.body.classList.add('bare');
for (const [name, overrides] of Object.entries(SCENARIOS)) {
  if (only && !only.split(',').includes(name)) continue;
  const widths = (params.get('widths') || '360,304').split(',').map(Number);
  for (const width of widths) {
    const fig = document.createElement('figure');
    fig.innerHTML = `<figcaption>${name} — ${width} px</figcaption><div class="cell" style="width:${width}px${height ? `;height:${height}px` : expand ? ';height:auto' : ''}"></div>`;
    const card = document.createElement('energy-sky-card');
    card.setConfig({ ...CONFIG, ...(SCENARIO_CONFIGS[name] ?? {}), ...(side ? { layout: 'side' } : {}), ...(expand ? { flow, ...consumers } : {}) });
    const states = {};
    let t = 0;
    for (const [id, state] of Object.entries(overrides)) {
      const stamp = new Date(Date.UTC(2026, 10, 15, 12, 0, t++)).toISOString();
      states[id] = { entity_id: id, state: String(state), attributes: ATTRIBUTES[id] ?? {}, last_changed: stamp, last_updated: stamp };
    }
    card.hass = { states, language: lang, locale: { language: lang, number_format: 'language' } };
    fig.querySelector('.cell').appendChild(card);
    if (expand) card.expanded = true;
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
      const comets = anims.filter(a => a.playState === 'running' && a.effect?.target?.classList?.contains('comet')).length;
      const lines = [...card.shadowRoot.querySelectorAll('.line')].filter(l => !l.hidden);
      const overflow = lines.filter(l => l.scrollWidth > l.clientWidth + 1).length;
      const content = card.shadowRoot.querySelector('.content');
      const tall = content.scrollHeight > content.clientHeight + 1 ? 1 : 0;
      // The night sky: visible stars touching text (should be none), and the quarters they reach
      const box = card.shadowRoot.querySelector('ha-card').getBoundingClientRect();
      const texts = [...card.shadowRoot.querySelectorAll('.hero-value, .hero-unit, .context-text, .label ha-icon, .label-text, .value-main, .extra')]
        .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height);
      const dots = [...card.shadowRoot.querySelectorAll('.star')]
        .filter(el => !el.hidden).map(el => el.getBoundingClientRect());
      const hits = dots.filter(d => texts.some(t => d.left < t.right && d.right > t.left && d.top < t.bottom && d.bottom > t.top)).length;
      const quarters = new Set(dots.map(d => `${(d.left + d.right) / 2 > box.left + box.width / 2 ? 'r' : 'l'}${(d.top + d.bottom) / 2 > box.top + box.height / 2 ? 'b' : 't'}`)).size;
      return `${card.closest('figure').querySelector('figcaption').textContent} | mode=${card.dataset.mode} motion=${card.dataset.motion} running=${running} paused=${paused} overflow=${overflow} tall=${tall} hero=${card.getAttribute('data-hero') ?? (side ? 44 : 56)} short=${card.getAttribute('data-form') ?? 0} dots=${dots.length} hits=${hits} quarters=${quarters} comets=${comets}`;
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
    pre.textContent = `height=${box.height} compact=${card.hasAttribute('data-compact')} hero=${card.getAttribute('data-hero') ?? (side ? 44 : 56)}\nhero ${q('.hero')}\ncontext ${q('.context')}\nlabels ${q('.label')}\nvalues ${q('.value')}\ngrid ${q('.grid')}\nhero box ${(() => { const r = card.shadowRoot.querySelector('.hero-value').getBoundingClientRect(); return `x=${(r.left - box.left).toFixed(0)} top=${(r.top - box.top).toFixed(0)}`; })()}`;
    document.body.prepend(pre);
  }, 1000);
}
