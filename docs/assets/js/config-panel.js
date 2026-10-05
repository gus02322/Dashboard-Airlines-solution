/* ============================================================
   Config panel mockup
   Four tabs (Flights, Timing rules, Alerts, Display) edit an
   in-memory sample workspace. Every change redraws the board
   preview next to it at once. Nothing is saved or sent.
   ============================================================ */

import { AIRLINES, t2m, m2t } from './dashboard/data.js';
import { icon } from './icons.js';
import { playAlertSound } from './dashboard/overlays.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_FLIGHTS = 8;
const AL = AIRLINES.filter((a) => ['EK', 'QR', 'ET', 'KQ', 'TK', 'AF', 'WB', 'LH'].includes(a.code));
const EV = [
  { k: 'eta', label: 'ETA' },
  { k: 'seal', label: 'Sealing' },
  { k: 'truck', label: 'Truck departure' },
  { k: 'etd', label: 'ETD' },
];

let uid = 0;
const mk = (code, num, size, meal, eta, etd, days = '1111111') =>
  ({ id: 'cf' + uid++, code, num, size, meal, eta, etd, days: days.split('').map((d) => d === '1'), on: true });

export function initConfigPanel(root) {
  const st = {
    flights: [
      mk('EK', 'EK 214', 'wide', 'halal', '06:50', '09:20'),
      mk('AF', 'AF 996', 'wide', 'western', '11:50', '13:50'),
      mk('KQ', 'KQ 436', 'narrow', 'western', '13:15', '14:45', '1110111'),
      mk('TK', 'TK 623', 'narrow', 'halal', '15:20', '17:20'),
    ],
    rules: { wide: { seal: 170, truck: 55 }, narrow: { seal: 120, truck: 45 } },
    alerts: { lead: 15, ev: { eta: false, seal: true, truck: true, etd: false }, sound: true },
    display: { show: { eta: true, seal: true, truck: true, etd: true }, tv: false, night: false, colors: Object.fromEntries(AL.map((a) => [a.code, a.color])) },
    day: (new Date().getDay() + 6) % 7,
  };
  const fresh = new Set();
  const $ = (s) => root.querySelector(s);
  const panes = { flights: $('#cp-pane-flights'), rules: $('#cp-pane-rules'), alerts: $('#cp-pane-alerts'), display: $('#cp-pane-display') };
  const preview = $('.cp-preview'), rowsEl = $('.cpv-rows'), axis = $('.cpv-axis'), daysEl = $('.cpv-days'), alertEl = $('.cpv-alert'), saved = $('[data-saved]');

  /* ---------- Derived times ---------- */
  const times = (f) => {
    const r = st.rules[f.size];
    const etd = t2m(f.etd), seal = etd - r.seal;
    return { eta: t2m(f.eta), seal, truck: seal + r.truck, etd };
  };
  const alName = (code) => AL.find((a) => a.code === code)?.name || code;

  /* "Saved" indicator, like a real autosaving panel */
  let savedT = 0;
  function touched() {
    saved.textContent = 'Saving…';
    saved.classList.add('is-saving');
    clearTimeout(savedT);
    savedT = setTimeout(() => { saved.textContent = 'All changes saved'; saved.classList.remove('is-saving'); }, 600);
    drawPreview();
    panes.rules.querySelectorAll('[data-example]').forEach((p) => { p.innerHTML = ruleExample(p.dataset.example); });
  }

  /* ---------- Tabs (WAI-ARIA, arrow keys) ---------- */
  const tabs = [...root.querySelectorAll('.cp-tab')];
  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panes[t.dataset.tab].hidden = !on;
    });
    if (focus) tab.focus();
  }
  root.querySelector('.cp-tabs').addEventListener('click', (e) => { const t = e.target.closest('.cp-tab'); if (t) select(t); });
  root.querySelector('.cp-tabs').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); select(tabs[n], true); }
  });

  /* ---------- Flights tab ---------- */
  const opt = (v, l, cur) => `<option value="${v}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`;
  function flightRow(f) {
    const n = f.id;
    return `<li class="cf-row${f.on ? '' : ' is-off'}" data-id="${n}">
      <div class="cf-line">
        <label class="cf-f cf-al"><span>Airline</span><select data-k="code">${AL.map((a) => opt(a.code, a.name, f.code)).join('')}</select></label>
        <label class="cf-f cf-num"><span>Flight</span><input data-k="num" value="${esc(f.num)}" maxlength="8" autocomplete="off" spellcheck="false"></label>
        <label class="cf-f"><span>Aircraft</span><select data-k="size">${opt('wide', 'Wide-body', f.size)}${opt('narrow', 'Narrow-body', f.size)}</select></label>
        <label class="cf-f"><span>Meals</span><select data-k="meal">${opt('halal', 'Halal', f.meal)}${opt('western', 'Western', f.meal)}</select></label>
      </div>
      <div class="cf-line">
        <label class="cf-f cf-t"><span>ETA</span><input data-k="eta" value="${f.eta}" inputmode="numeric" maxlength="5" placeholder="HH:MM" autocomplete="off" spellcheck="false"></label>
        <label class="cf-f cf-t"><span>ETD</span><input data-k="etd" value="${f.etd}" inputmode="numeric" maxlength="5" placeholder="HH:MM" autocomplete="off" spellcheck="false"></label>
        <div class="cf-f cf-days"><span id="${n}-d">Days</span><div role="group" aria-labelledby="${n}-d">${DAYS.map((d, i) => `<button type="button" class="cf-day" data-day="${i}" aria-pressed="${f.days[i]}" aria-label="${d}">${d[0]}</button>`).join('')}</div></div>
        <div class="cf-acts">
          <button type="button" class="cf-act" data-act="dup" aria-label="Duplicate ${esc(f.num)}">${icon('copy')}<span>Duplicate</span></button>
          <button type="button" class="cf-act" data-act="off" aria-pressed="${!f.on}" aria-label="${f.on ? 'Disable' : 'Enable'} ${esc(f.num)}">${icon('ban')}<span>${f.on ? 'Disable' : 'Enable'}</span></button>
        </div>
      </div>
    </li>`;
  }
  function drawFlights() {
    const full = st.flights.length >= MAX_FLIGHTS;
    panes.flights.innerHTML = `<div class="cp-bar">
        <p class="cp-hint">${st.flights.length} flights · edit any field</p>
        <button type="button" class="btn btn--primary btn--sm" data-act="add"${full ? ' disabled' : ''}>${icon('plus')}Add flight</button>
      </div>
      ${full ? `<p class="cp-hint cp-limit">This mockup holds ${MAX_FLIGHTS} flights. Your workspace has no such limit.</p>` : ''}
      <ul class="cf-list">${st.flights.map(flightRow).join('')}</ul>`;
  }
  const flightOf = (el) => st.flights.find((f) => f.id === el.closest('[data-id]')?.dataset.id);

  panes.flights.addEventListener('input', (e) => {
    const f = flightOf(e.target), k = e.target.dataset.k;
    if (!f || !k) return;
    const v = e.target.value;
    if (k === 'eta' || k === 'etd') {
      // 24h clock, as on the board; only valid times reach the preview
      const ok = /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
      e.target.setAttribute('aria-invalid', String(!ok));
      if (!ok) return;
    }
    f[k] = k === 'num' ? v.toUpperCase() : v;
    touched();
  });
  panes.flights.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.act === 'add') {
      if (st.flights.length >= MAX_FLIGHTS) return;
      const used = new Set(st.flights.map((f) => f.code));
      const al = AL.find((a) => !used.has(a.code)) || AL[0];
      const last = st.flights.reduce((m, f) => Math.max(m, t2m(f.etd)), 0);
      const etd = Math.min(23 * 60 + 30, last + 75);
      const nf = mk(al.code, `${al.code} ${100 + Math.floor(Math.random() * 800)}`, 'narrow', 'western', m2t(etd - 90), m2t(etd));
      st.flights.push(nf);
      fresh.add(nf.id);
      drawFlights();
      touched();
      panes.flights.querySelector(`[data-id="${nf.id}"] [data-k="num"]`).focus();
      return;
    }
    const f = flightOf(b);
    if (!f) return;
    if (b.dataset.day) {
      f.days[+b.dataset.day] = !f.days[+b.dataset.day];
      b.setAttribute('aria-pressed', String(f.days[+b.dataset.day]));
      touched();
    } else if (b.dataset.act === 'dup') {
      if (st.flights.length >= MAX_FLIGHTS) return;
      const copy = { ...f, id: 'cf' + uid++, days: [...f.days], num: f.num.replace(/\d+$/, (d) => String(+d + 2)) };
      st.flights.splice(st.flights.indexOf(f) + 1, 0, copy);
      fresh.add(copy.id);
      drawFlights();
      touched();
      panes.flights.querySelector(`[data-id="${copy.id}"] [data-k="num"]`).focus();
    } else if (b.dataset.act === 'off') {
      f.on = !f.on;
      b.closest('.cf-row').classList.toggle('is-off', !f.on);
      b.setAttribute('aria-pressed', String(!f.on));
      b.setAttribute('aria-label', `${f.on ? 'Disable' : 'Enable'} ${f.num}`);
      b.querySelector('span').textContent = f.on ? 'Disable' : 'Enable';
      touched();
    }
  });

  /* ---------- Range helper ---------- */
  const range = (id, label, val, min, max, step, unit, data) => `<div class="range-field">
      <div class="roi-label-row"><label for="${id}">${label}</label><output class="mono" for="${id}" id="${id}-o">${val} ${unit}</output></div>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" ${data} style="--p:${((val - min) / (max - min)) * 100}%">
    </div>`;
  const syncRange = (input, unit) => {
    input.style.setProperty('--p', ((input.value - input.min) / (input.max - input.min)) * 100 + '%');
    root.querySelector(`#${input.id}-o`).textContent = `${input.value} ${unit}`;
  };

  /* ---------- Timing rules tab ---------- */
  function ruleExample(size) {
    const f = st.flights.find((x) => x.size === size);
    if (!f) return `No ${size === 'wide' ? 'wide' : 'narrow'}-body flight in the list yet.`;
    const t = times(f);
    return `${esc(f.num)}: ETD ${f.etd} → sealing ${m2t(t.seal)} → truck ${m2t(t.truck)}`;
  }
  function drawRules() {
    panes.rules.innerHTML = `<p class="cp-hint">Rules apply to every flight of that aircraft size. Move a slider and watch the preview.</p>
      ${['wide', 'narrow'].map((sz) => `<fieldset class="cp-group">
        <legend>${sz === 'wide' ? 'Wide-body' : 'Narrow-body'}</legend>
        ${range(`r-${sz}-seal`, 'Sealing = ETD minus', st.rules[sz].seal, 60, 240, 5, 'min', `data-rule="${sz}.seal"`)}
        ${range(`r-${sz}-truck`, 'Truck departure = sealing plus', st.rules[sz].truck, 15, 120, 5, 'min', `data-rule="${sz}.truck"`)}
        <p class="cp-example mono" data-example="${sz}">${ruleExample(sz)}</p>
      </fieldset>`).join('')}`;
  }
  panes.rules.addEventListener('input', (e) => {
    const r = e.target.dataset.rule;
    if (!r) return;
    const [sz, k] = r.split('.');
    st.rules[sz][k] = +e.target.value;
    syncRange(e.target, 'min');
    touched();
  });

  /* ---------- Alerts tab ---------- */
  const check = (id, label, on, data) => `<label class="cp-check" for="${id}"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} ${data}><span class="cp-box" aria-hidden="true">${icon('check')}</span>${label}</label>`;
  const toggle = (id, label, on, data, ic) => `<label class="cp-switch" for="${id}">${ic ? icon(ic) : ''}<span>${label}</span><input type="checkbox" role="switch" id="${id}" ${on ? 'checked' : ''} ${data}><span class="cp-knob" aria-hidden="true"></span></label>`;
  function drawAlerts() {
    const a = st.alerts;
    panes.alerts.innerHTML = `${range('a-lead', 'Alert before the event', a.lead, 5, 30, 5, 'min', 'data-lead')}
      <fieldset class="cp-group"><legend>Alert on</legend>
        <div class="cp-checks">${EV.map((ev) => check(`a-${ev.k}`, ev.label, a.ev[ev.k], `data-alert-ev="${ev.k}"`)).join('')}</div>
      </fieldset>
      ${toggle('a-sound', 'Sound on alert', a.sound, 'data-sound', 'sound')}
      <button type="button" class="btn btn--ghost btn--sm cp-test" data-test>${icon('bell')}Send a test alert</button>`;
  }
  panes.alerts.addEventListener('input', (e) => {
    const t = e.target;
    if (t.hasAttribute('data-lead')) { st.alerts.lead = +t.value; syncRange(t, 'min'); }
    else if (t.dataset.alertEv) st.alerts.ev[t.dataset.alertEv] = t.checked;
    else if (t.hasAttribute('data-sound')) st.alerts.sound = t.checked;
    else return;
    touched();
  });
  let alertT = 0;
  panes.alerts.addEventListener('click', (e) => {
    if (!e.target.closest('[data-test]')) return;
    const evk = EV.find((ev) => st.alerts.ev[ev.k])?.k || 'seal';
    const f = st.flights.find((x) => x.on) || st.flights[0];
    const label = EV.find((ev) => ev.k === evk).label;
    alertEl.className = `cpv-alert c-${evk}`;
    alertEl.innerHTML = `<span class="cpv-al-ic">${icon(evk === 'truck' ? 'truck' : 'bell')}</span>
      <span class="cpv-al-txt"><span class="cpv-al-badge mono">Test alert</span><strong class="mono">${esc(f ? f.num : 'EK 214')}</strong><span>${label} in ${st.alerts.lead} min</span></span>`;
    alertEl.hidden = false;
    if (st.alerts.sound) playAlertSound(1400);
    clearTimeout(alertT);
    alertT = setTimeout(() => { alertEl.hidden = true; }, 4000);
  });

  /* ---------- Display tab ---------- */
  function drawDisplay() {
    const d = st.display;
    const used = [...new Set(st.flights.map((f) => f.code))];
    panes.display.innerHTML = `<fieldset class="cp-group"><legend>Show on the board</legend>
        <div class="cp-checks">${EV.map((ev) => check(`d-${ev.k}`, ev.label, d.show[ev.k], `data-show="${ev.k}"`)).join('')}</div>
      </fieldset>
      <div class="cp-switches">
        ${toggle('d-tv', 'TV mode', d.tv, 'data-tv', 'tv')}
        ${toggle('d-night', 'Night mode', d.night, 'data-night', 'moon')}
      </div>
      <fieldset class="cp-group"><legend>Airline colours</legend>
        <div class="cp-colors">${used.map((c) => `<label class="cp-color"><input type="color" value="${d.colors[c]}" data-color="${c}"><span>${esc(alName(c))}</span></label>`).join('')}</div>
      </fieldset>`;
  }
  panes.display.addEventListener('input', (e) => {
    const t = e.target, d = st.display;
    if (t.dataset.show) d.show[t.dataset.show] = t.checked;
    else if (t.hasAttribute('data-tv')) d.tv = t.checked;
    else if (t.hasAttribute('data-night')) d.night = t.checked;
    else if (t.dataset.color) d.colors[t.dataset.color] = t.value;
    else return;
    touched();
  });

  /* ---------- Preview ---------- */
  daysEl.innerHTML = DAYS.map((d, i) => `<button type="button" class="cpv-day" data-day="${i}" aria-pressed="${i === st.day}" aria-label="${d}">${d.slice(0, 2)}</button>`).join('');
  daysEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (!b) return;
    st.day = +b.dataset.day;
    daysEl.querySelectorAll('[data-day]').forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.day === st.day)));
    drawPreview();
  });
  /* Time window: fitted to the flights so markers stay readable */
  let lo = 0, hi = 1440, winKey = '';
  const pos = (m) => ((m - lo) / (hi - lo)) * 100;
  function fitWindow() {
    const all = st.flights.flatMap((f) => Object.values(times(f)));
    let a = Math.max(0, Math.floor((Math.min(...all) - 30) / 60) * 60);
    let b = Math.min(1440, Math.ceil((Math.max(...all) + 30) / 60) * 60);
    if (b - a < 360) b = Math.min(1440, a + 360);
    if (b - a < 360) a = b - 360;
    if (`${a}-${b}` === winKey) return;
    winKey = `${a}-${b}`; lo = a; hi = b;
    const step = hi - lo <= 600 ? 120 : 180;
    const ticks = [];
    for (let m = Math.ceil(lo / step) * step; m <= hi; m += step) ticks.push(m);
    axis.innerHTML = ticks.map((m) => `<span style="left:${pos(m)}%">${m2t(m === 1440 ? 1439.99 : m).replace('23:59', '24:00')}</span>`).join('');
    rowsEl.style.setProperty('--grid', `${(step / (hi - lo)) * 100}%`);
    rowsEl.style.setProperty('--grid0', `${pos(ticks[0])}%`);
  }

  function drawPreview() {
    const d = st.display;
    fitWindow();
    preview.classList.toggle('is-tv', d.tv);
    preview.classList.toggle('is-night', d.night);
    const keep = new Map([...rowsEl.children].map((li) => [li.dataset.id, li]));
    const list = [...st.flights].sort((a, b) => t2m(a.etd) - t2m(b.etd));
    const rows = [];
    for (const f of list) {
      const t = times(f);
      const today = f.days[st.day];
      let li = keep.get(f.id);
      if (!li) {
        li = document.createElement('li');
        li.dataset.id = f.id;
        li.className = 'cpv-row';
        li.innerHTML = `<div class="cpv-head"><span class="cpv-dot"></span><span class="cpv-num mono"></span><span class="cpv-tag mono"></span><span class="cpv-times mono"></span></div>
          <div class="cpv-track"><span class="cpv-span"></span>${EV.map((ev) => `<span class="cpv-bell" data-b="${ev.k}"></span><span class="cpv-mk c-${ev.k}" data-m="${ev.k}"></span>`).join('')}</div>`;
      }
      keep.delete(f.id);
      li.style.setProperty('--al', d.colors[f.code] || '#888');
      li.classList.toggle('is-off', !f.on || !today);
      li.querySelector('.cpv-num').textContent = f.num || '(no number)';
      li.querySelector('.cpv-tag').textContent = !f.on ? 'Disabled' : !today ? `Not on ${DAYS[st.day].slice(0, 3)}` : f.meal === 'halal' ? 'Halal' : 'Western';
      li.querySelector('.cpv-times').textContent = EV.filter((ev) => d.show[ev.k]).map((ev) => `${ev.k === 'truck' ? 'TRK' : ev.k.toUpperCase()} ${m2t(t[ev.k])}`).join('  ');
      const shown = EV.filter((ev) => d.show[ev.k]).map((ev) => t[ev.k]);
      const span = li.querySelector('.cpv-span');
      if (shown.length > 1) { const a = pos(Math.min(...shown)), b = pos(Math.max(...shown)); span.style.left = a + '%'; span.style.width = Math.max(0, b - a) + '%'; span.hidden = false; } else span.hidden = true;
      for (const ev of EV) {
        const m = li.querySelector(`[data-m="${ev.k}"]`), bell = li.querySelector(`[data-b="${ev.k}"]`);
        m.hidden = !d.show[ev.k];
        m.style.left = pos(t[ev.k]) + '%';
        bell.hidden = !d.show[ev.k] || !st.alerts.ev[ev.k];
        bell.style.left = pos(t[ev.k] - st.alerts.lead) + '%';
      }
      if (fresh.has(f.id)) { fresh.delete(f.id); li.classList.add('is-new'); setTimeout(() => li.classList.remove('is-new'), 1600); }
      rows.push(li);
    }
    keep.forEach((li) => li.remove());
    // Move rows only when the order changes, so markers keep their sliding transition
    rows.forEach((li, i) => { if (rowsEl.children[i] !== li) rowsEl.insertBefore(li, rowsEl.children[i] || null); });
  }

  drawFlights();
  drawRules();
  drawAlerts();
  drawDisplay();
  drawPreview();
  // Colours list follows the airlines in use
  panes.flights.addEventListener('change', (e) => { if (e.target.dataset.k === 'code') drawDisplay(); });
  panes.flights.addEventListener('click', (e) => { if (e.target.closest('[data-act="add"], [data-act="dup"]')) drawDisplay(); });
}
