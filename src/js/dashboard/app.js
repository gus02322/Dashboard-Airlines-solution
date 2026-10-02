/* ============================================================
   OpsRamp demo dashboard
   A faithful, self-contained replica of the production board,
   running on a simulated clock with sample data.
   No network, no storage, no API key.

   Usage: createDashboard(hostElement, { start: '10:40' })
   ============================================================ */

import { FLIGHTS, EVENTS, PROD_SLOTS, EVENT_TYPES, t2m, m2t } from './data.js';
import { renderOps, renderProduction, renderAirlines, renderWeek } from './views.js';
import { createSheet, createSearch, createAlertModal, rel } from './overlays.js';
import { icon } from '../icons.js';

const VIEWS = [
  { key: 'ops', label: 'Ops' },
  { key: 'airlines', label: 'Airlines' },
  { key: 'production', label: 'Production' },
  { key: 'week', label: 'Week' },
];
const FILTERS = [
  { key: 'eta', label: 'ETA', cls: 'c-eta' },
  { key: 'etd', label: 'ETD', cls: 'c-etd' },
  { key: 'seal', label: 'Sealing', cls: 'c-seal' },
  { key: 'truck', label: 'Truck', cls: 'c-truck' },
  { key: 'halal', label: 'Halal', cls: 'c-halal', sep: true },
  { key: 'western', label: 'Western', cls: 'c-western' },
];
const BUSY_SPEED = 120;   // 2 simulated minutes per real second
const ALERT_WINDOW = 15;  // minutes before Sealing / Truck
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function createDashboard(host, opts = {}) {
  const s = {
    now: t2m(opts.start || '10:40'),
    speed: 1,
    view: 'ops',
    filters: { eta: true, etd: true, seal: true, truck: true, halal: true, western: true },
    tv: false,
    muted: false,
    followPausedUntil: 0,
  };
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const alerted = new Set();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Shell ---------- */
  host.classList.add('db-host');
  host.innerHTML = `
    <div class="db-frame">
      <div class="db" tabindex="-1" aria-label="OpsRamp live demo dashboard" role="region">
        <div class="db-top">
          <div class="db-logo"><span class="db-logo-mark" aria-hidden="true"></span>OPSRAMP</div>
          <div class="db-date mono">${DAY[date.getDay()]} ${date.getDate()} ${MON[date.getMonth()]}</div>
          <div class="db-clock mono" aria-label="Simulated time">00:00:00</div>
          <div class="db-sync" title="Google Sheet sync"><span class="db-sync-dot"></span><span class="db-sync-lbl mono">Sheet synced</span></div>
          <div class="db-status">
            <div class="spill"><span class="spill-lbl">Current</span><span class="spill-val mono cur">-</span></div>
            <div class="spill"><span class="spill-lbl">Next</span><span class="spill-val mono nxt">-</span></div>
          </div>
          <button type="button" class="db-iconbtn db-search-btn" aria-label="Search a flight">${icon('search')}</button>
          <button type="button" class="db-tv-exit" aria-label="Exit TV mode">${icon('close')}<span>Exit TV</span></button>
        </div>
        <div class="db-bar">
          <div class="db-tabs" role="tablist" aria-label="Views">
            ${VIEWS.map((v) => `<button type="button" role="tab" class="db-tab" data-view="${v.key}" aria-selected="${v.key === 'ops'}">${v.label}</button>`).join('')}
          </div>
          <div class="db-filters" role="group" aria-label="Filters">
            ${FILTERS.map((f) => `${f.sep ? '<span class="db-filter-sep" aria-hidden="true"></span>' : ''}<button type="button" class="db-chip ${f.cls}" data-filter="${f.key}" aria-pressed="true"><span class="db-chip-dot"></span>${f.label}</button>`).join('')}
          </div>
        </div>
        <div class="db-banner" role="status" aria-live="polite"></div>
        <div class="db-body">
          <div class="db-main" tabindex="0" aria-label="Schedule"></div>
          <aside class="db-panel" aria-label="Summary">
            <section class="pn-sec"><h4 class="pn-title">${icon('bell')}Next alerts</h4><ul class="pn-alerts"></ul></section>
            <section class="pn-sec"><h4 class="pn-title">Day progress</h4><div class="pn-bar"><div class="pn-fill"></div></div><p class="pn-txt mono"></p></section>
            <section class="pn-sec"><h4 class="pn-title">Airlines today</h4><ul class="pn-legend"></ul></section>
          </aside>
        </div>
      </div>
    </div>
    <div class="db-controls" role="toolbar" aria-label="Demo controls">
      <button type="button" class="ctl ctl--alert" data-act="alert">${icon('bell')}<span>Trigger a sealing alert</span></button>
      <button type="button" class="ctl" data-act="busy" aria-pressed="false">${icon('bolt')}<span>Simulate a busy day</span></button>
      <button type="button" class="ctl" data-act="tv">${icon('tv')}<span>TV mode</span></button>
      <button type="button" class="ctl ctl--icon" data-act="mute" aria-pressed="false" aria-label="Mute alert sound">${icon('sound')}</button>
    </div>`;

  const $ = (sel) => host.querySelector(sel);
  const db = $('.db');
  const main = $('.db-main');
  const els = {
    clock: $('.db-clock'), cur: $('.cur'), nxt: $('.nxt'), sync: $('.db-sync-lbl'),
    banner: $('.db-banner'), alerts: $('.pn-alerts'), fill: $('.pn-fill'), ptxt: $('.pn-txt'), legend: $('.pn-legend'),
    busyBtn: $('[data-act="busy"]'), muteBtn: $('[data-act="mute"]'),
  };

  /* ---------- Overlays ---------- */
  const sheet = createSheet(db, () => s.now);
  const search = createSearch(db, (id) => sheet.open(id), () => filteredFlights());
  const modal = createAlertModal();

  /* ---------- Data selection ---------- */
  const mealOk = (f) => s.filters[f.mealType] !== false;
  const filteredFlights = () => FLIGHTS.filter(mealOk);
  const filteredEvents = () => EVENTS.filter((e) => s.filters[e.type] && mealOk(e.f));
  const filteredSlots = () => PROD_SLOTS.filter((sl) => mealOk(FLIGHTS.find((f) => f.id === sl.flightId)));

  /* ---------- Rendering ---------- */
  let view = null;
  function render() {
    db.dataset.view = s.view;
    const ctx = {
      s, tv: s.tv, date,
      flights: filteredFlights(), events: filteredEvents(), slots: filteredSlots(),
      onOpen: (id) => sheet.open(id),
    };
    main.scrollTop = 0;
    if (s.view === 'ops') view = renderOps(main, ctx);
    else if (s.view === 'production') view = renderProduction(main, ctx);
    else if (s.view === 'airlines') view = renderAirlines(main, ctx);
    else view = renderWeek(main, ctx);
    renderLegend(ctx.flights);
    lastSec = -1;
    update(true);
  }

  function renderLegend(flights) {
    const seen = new Map();
    flights.forEach((f) => seen.set(f.airline, f.color));
    els.legend.innerHTML = [...seen].map(([n, c]) => `<li><span class="pn-dot" style="background:${c}"></span>${n}</li>`).join('');
  }

  /* ---------- Time-driven updates ---------- */
  let lastSec = -1, lastMin = -1;
  function update(force) {
    const t = s.now;
    const follow = Date.now() > s.followPausedUntil;
    if (view) view.update(t, follow && (s.view === 'ops' || s.view === 'production'));
    const sec = Math.floor(t * 60);
    if (sec === lastSec && !force) return;
    lastSec = sec;
    els.clock.textContent = m2t(t) + ':' + String(sec % 60).padStart(2, '0');
    db.classList.toggle('is-night', t < 360);

    const m = Math.floor(t);
    if (m === lastMin && !force) return;
    lastMin = m;
    const evs = filteredEvents();
    let cur = null, nxt = null;
    for (const e of evs) { if (e.mins <= t) cur = e; else if (!nxt) nxt = e; }
    els.cur.textContent = cur ? `${cur.time} ${EVENT_TYPES[cur.type].label} ${cur.f.flight}` : '-';
    els.nxt.textContent = nxt ? `${nxt.time} ${EVENT_TYPES[nxt.type].label} ${nxt.f.flight}` : 'None';
    els.sync.textContent = 'Synced ' + m2t(Math.floor(m / 5) * 5);

    // Side panel
    const done = evs.filter((e) => e.mins <= t).length;
    els.fill.style.transform = `scaleX(${evs.length ? done / evs.length : 0})`;
    els.ptxt.textContent = `${done} / ${evs.length} events done`;
    const upcoming = EVENTS.filter((e) => (e.type === 'seal' || e.type === 'truck') && e.mins > t && mealOk(e.f)).slice(0, 4);
    els.alerts.innerHTML = upcoming.map((e) => `<li class="c-${e.type}"><span class="mono">${e.time}</span> ${EVENT_TYPES[e.type].label} <b class="mono">${e.f.flight}</b><em class="mono">${rel(e.mins - t)}</em></li>`).join('') || '<li>No more alerts today</li>';

    checkAutoAlerts(t);
  }

  /* Auto alerts: a non-blocking banner 15 min before each sealing / truck.
     The full-screen modal is reserved for the explicit "Trigger" button,
     so a visitor is never interrupted without asking. */
  let bannerTimer = null;
  function checkAutoAlerts(t) {
    for (const e of EVENTS) {
      if (e.type !== 'seal' && e.type !== 'truck') continue;
      const diff = e.mins - t;
      if (diff > 0 && diff <= ALERT_WINDOW && !alerted.has(e.key)) {
        alerted.add(e.key);
        if (!mealOk(e.f) || !s.filters[e.type]) continue;
        els.banner.innerHTML = `<span class="bn-ic">${icon('bell')}</span><b>${EVENT_TYPES[e.type].long}</b><span class="mono">${e.f.flight}</span><span class="mono bn-time">${rel(diff)} · ${e.time}</span>`;
        els.banner.className = 'db-banner is-on c-' + e.type;
        clearTimeout(bannerTimer);
        bannerTimer = setTimeout(() => { els.banner.className = 'db-banner'; }, s.speed > 1 ? 2500 : 8000);
      }
    }
  }
  // Events already inside the window at start are considered "seen"
  EVENTS.forEach((e) => { const d = e.mins - s.now; if (d > 0 && d <= ALERT_WINDOW) alerted.add(e.key); });

  /* ---------- Clock loop ---------- */
  let last = performance.now();
  function loop(ts) {
    const dt = Math.min(1000, ts - last);
    last = ts;
    s.now += (dt / 60000) * s.speed;
    if (s.now >= 1440) { s.now -= 1440; alerted.clear(); render(); }
    update(false);
    raf = requestAnimationFrame(loop);
  }
  let raf = requestAnimationFrame(loop);

  /* ---------- Controls ---------- */
  function setView(v) {
    s.view = v;
    s.followPausedUntil = 0; // a new view always opens on NOW
    host.querySelectorAll('.db-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === v)));
    render();
  }
  function toggleFilter(k) {
    s.filters[k] = !s.filters[k];
    const b = host.querySelector(`[data-filter="${k}"]`);
    b.setAttribute('aria-pressed', String(s.filters[k]));
    render();
  }
  function setBusy(on) {
    s.speed = on ? BUSY_SPEED : 1;
    els.busyBtn.setAttribute('aria-pressed', String(on));
    els.busyBtn.querySelector('span').textContent = on ? 'Back to real time' : 'Simulate a busy day';
    s.followPausedUntil = 0;
  }
  function triggerAlert() {
    const t = s.now;
    const next = EVENTS.find((e) => e.type === 'seal' && e.mins > t + 1) || EVENTS.find((e) => e.type === 'seal');
    let diff = next.mins - t; if (diff < 0) diff += 1440;
    modal.show(next, Math.min(diff, ALERT_WINDOW), { muted: s.muted });
  }

  async function setTV(on) {
    s.tv = on;
    db.classList.toggle('is-tv', on);
    if (on) {
      if (s.view !== 'ops' && s.view !== 'production') setView('ops');
      try {
        if (db.requestFullscreen) await db.requestFullscreen({ navigationUI: 'hide' });
        else throw new Error('no fullscreen');
      } catch (e) {
        db.classList.add('is-tv-fallback');
        document.documentElement.classList.add('db-lock');
      }
      db.focus({ preventScroll: true });
    } else {
      if (document.fullscreenElement === db) document.exitFullscreen().catch(() => {});
      db.classList.remove('is-tv-fallback');
      document.documentElement.classList.remove('db-lock');
    }
    s.followPausedUntil = 0;
    // Wait one frame so the new size is applied before laying out blocks
    requestAnimationFrame(render);
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && s.tv && !db.classList.contains('is-tv-fallback')) setTV(false);
  });

  host.addEventListener('click', (e) => {
    const tab = e.target.closest('.db-tab');
    if (tab) return setView(tab.dataset.view);
    const chip = e.target.closest('[data-filter]');
    if (chip) return toggleFilter(chip.dataset.filter);
    if (e.target.closest('.db-search-btn')) return search.open();
    if (e.target.closest('.db-tv-exit')) return setTV(false);
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'alert') triggerAlert();
    if (a === 'busy') setBusy(s.speed === 1);
    if (a === 'tv') setTV(!s.tv);
    if (a === 'mute') {
      s.muted = !s.muted;
      act.setAttribute('aria-pressed', String(s.muted));
      act.setAttribute('aria-label', s.muted ? 'Unmute alert sound' : 'Mute alert sound');
      act.innerHTML = icon(s.muted ? 'mute' : 'sound');
    }
  });

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  $('.db-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = VIEWS.findIndex((v) => v.key === s.view);
    const n = VIEWS[(i + (e.key === 'ArrowRight' ? 1 : VIEWS.length - 1)) % VIEWS.length].key;
    setView(n);
    host.querySelector(`.db-tab[data-view="${n}"]`).focus();
  });

  db.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && s.tv && !sheet.isOpen() && !search.isOpen()) setTV(false);
  });

  // When the visitor scrolls the board, stop auto-follow for a while
  const pauseFollow = () => { s.followPausedUntil = Date.now() + 8000; };
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((ev) => main.addEventListener(ev, pauseFollow, { passive: true }));

  // Re-layout on resize (debounced)
  let rz = null;
  new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(render, 120); }).observe(main);

  render();

  return {
    setView, setTV, setBusy, triggerAlert,
    setTime(hhmm) { s.now = t2m(hhmm); alerted.clear(); render(); },
    destroy() { cancelAnimationFrame(raf); },
    reduced,
  };
}
