/* ============================================================
   Overlays: flight detail sheet, flight search, full-screen
   alert modal and the alert sound (Web Audio, no audio file).
   ============================================================ */

import { EVENT_TYPES, t2m, findFlight } from './data.js';
import { icon } from '../icons.js';
import { mondayIndex, operatesOn } from './views.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Format a relative time like "in 25 min" / "done 1h 10 ago". */
export function rel(diff) {
  const a = Math.abs(Math.round(diff));
  const txt = a >= 60 ? `${Math.floor(a / 60)}h ${String(a % 60).padStart(2, '0')}` : `${a} min`;
  return diff >= 0 ? `in ${txt}` : `${txt} ago`;
}

/* Remember the element that opened an overlay, so focus returns to it. */
function focusTrap(container, onClose) {
  const opener = document.activeElement;
  function key(e) {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = [...container.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', key);
  return () => { container.removeEventListener('keydown', key); if (opener && opener.focus) opener.focus({ preventScroll: true }); };
}

/* ------------------------------------------------------------
   Flight detail sheet (lives inside the dashboard frame)
   ------------------------------------------------------------ */
export function createSheet(db, getNow) {
  const layer = document.createElement('div');
  layer.className = 'db-layer db-sheet-layer';
  layer.hidden = true;
  layer.innerHTML = `<div class="db-scrim" data-close></div>
    <section class="db-sheet" role="dialog" aria-modal="true" aria-labelledby="fs-title" tabindex="-1">
      <div class="fs-grip" aria-hidden="true"></div>
      <button type="button" class="db-iconbtn fs-close" data-close aria-label="Close flight details">${icon('close')}</button>
      <div class="fs-content"></div>
    </section>`;
  db.appendChild(layer);
  const sheet = layer.querySelector('.db-sheet');
  const content = layer.querySelector('.fs-content');
  let release = null;

  function open(id) {
    const f = findFlight(id);
    if (!f) return;
    const now = getNow();
    const ti = mondayIndex(new Date());
    const days = DAYS.map((d, i) => `<span class="fs-day${operatesOn(f, i - ti) ? ' on' : ''}">${d}</span>`).join('');
    const cards = [
      ['eta', f.eta, 'landing'], ['seal', f.sealing, 'seal'], ['truck', f.truck, 'truck'], ['etd', f.etd, 'takeoff'],
    ].map(([k, t, ic]) => {
      const T = EVENT_TYPES[k];
      const diff = t2m(t) - now;
      return `<div class="fs-card c-${k}${diff < 0 ? ' done' : ''}">
        <span class="fs-ic">${icon(ic)}</span>
        <span class="fs-lbl">${T.long}</span>
        <span class="fs-time mono">${t}</span>
        <span class="fs-rel mono">${diff < 0 ? 'Done' : rel(diff)}</span>
      </div>`;
    }).join('');
    content.innerHTML = `<header class="fs-head" style="--al:${f.color}">
        <span class="fs-dot"></span>
        <div>
          <h4 class="fs-num mono" id="fs-title">${f.flight}</h4>
          <p class="fs-al">${esc(f.airline)}</p>
          <div class="fs-tags"><span class="meal-tag meal-${f.mealType}">${f.mealType}</span><span class="fs-meals mono">${f.meals} meals</span></div>
          <div class="fs-days" aria-label="Days of operation">${days}</div>
        </div>
      </header>
      <div class="fs-grid">${cards}</div>`;
    layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add('is-open'));
    sheet.focus({ preventScroll: true });
    release = focusTrap(layer, close);
  }
  function close() {
    if (layer.hidden) return;
    layer.classList.remove('is-open');
    setTimeout(() => { layer.hidden = true; }, 260);
    if (release) { release(); release = null; }
  }
  layer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  // Swipe down to close on touch screens
  let y0 = null;
  sheet.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchend', (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 80) close(); y0 = null; });
  return { open, close, isOpen: () => !layer.hidden };
}

/* ------------------------------------------------------------
   Flight search (inside the frame)
   ------------------------------------------------------------ */
export function createSearch(db, onPick, getFlights) {
  const layer = document.createElement('div');
  layer.className = 'db-layer db-search-layer';
  layer.hidden = true;
  layer.innerHTML = `<div class="db-scrim" data-close></div>
    <div class="db-search" role="dialog" aria-modal="true" aria-label="Search a flight">
      <div class="sr-input-wrap">${icon('search')}
        <input type="search" class="sr-input mono" placeholder="Flight number or airline" aria-label="Flight number or airline" autocomplete="off" spellcheck="false">
        <button type="button" class="db-iconbtn" data-close aria-label="Close search">${icon('close')}</button>
      </div>
      <ul class="sr-results" role="listbox" aria-label="Results"></ul>
    </div>`;
  db.appendChild(layer);
  const input = layer.querySelector('input');
  const results = layer.querySelector('.sr-results');
  let release = null;

  function run(q) {
    const query = q.trim().toUpperCase().replace(/\s+/g, '');
    const list = getFlights().filter((f) => !query || f.flight.replace(/\s/g, '').includes(query) || f.airline.toUpperCase().replace(/\s/g, '').includes(query)).slice(0, 8);
    results.innerHTML = list.length
      ? list.map((f) => `<li><button type="button" class="sr-item" data-id="${f.id}" style="--al:${f.color}">
          <span class="sr-dot"></span><span class="sr-num mono">${f.flight}</span><span class="sr-al">${esc(f.airline)}</span>
          <span class="sr-times mono"><span class="c-seal">SEAL ${f.sealing}</span><span class="c-truck">TRUCK ${f.truck}</span></span>
        </button></li>`).join('')
      : '<li class="sr-empty mono">No flight found</li>';
  }
  function open() {
    layer.hidden = false;
    input.value = '';
    run('');
    requestAnimationFrame(() => layer.classList.add('is-open'));
    input.focus({ preventScroll: true });
    release = focusTrap(layer, close);
  }
  function close() {
    if (layer.hidden) return;
    layer.classList.remove('is-open');
    layer.hidden = true;
    if (release) { release(); release = null; }
  }
  input.addEventListener('input', () => run(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const first = results.querySelector('[data-id]'); if (first) { close(); onPick(first.dataset.id); } }
    if (e.key === 'ArrowDown') { e.preventDefault(); const first = results.querySelector('[data-id]'); if (first) first.focus(); }
  });
  results.addEventListener('keydown', (e) => {
    const items = [...results.querySelectorAll('[data-id]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i < items.length - 1) { e.preventDefault(); items[i + 1].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? items[i - 1] : input).focus(); }
  });
  layer.addEventListener('click', (e) => {
    const item = e.target.closest('[data-id]');
    if (item) { close(); onPick(item.dataset.id); return; }
    if (e.target.closest('[data-close]')) close();
  });
  return { open, close, isOpen: () => !layer.hidden };
}

/* ------------------------------------------------------------
   Alert sound: two-tone beep, same pattern as the production board
   ------------------------------------------------------------ */
export function playAlertSound(duration = 3000) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const end = ctx.currentTime + duration / 1000;
    for (let t = ctx.currentTime; t < end - 0.18; t += 0.7) {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(660, t + 0.09);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
      gain.gain.setValueAtTime(0.35, t + 0.14);
      gain.gain.linearRampToValueAtTime(0, t + 0.18);
      osc.start(t); osc.stop(t + 0.18);
    }
    setTimeout(() => ctx.close().catch(() => {}), duration + 400);
  } catch (e) { /* audio unavailable: the visual alert still works */ }
}

/* ------------------------------------------------------------
   Full-screen alert modal (attached to <body>, or to the
   fullscreen element when TV mode is active)
   ------------------------------------------------------------ */
export function createAlertModal() {
  const el = document.createElement('div');
  el.className = 'alert-modal';
  el.hidden = true;
  el.innerHTML = `<div class="alert-box" role="alertdialog" aria-modal="true" aria-labelledby="al-title" aria-describedby="al-desc">
      <div class="alert-ic"></div>
      <p class="alert-badge">Upcoming event</p>
      <p class="alert-flight mono" id="al-title"></p>
      <p class="alert-type"></p>
      <p class="alert-time mono" id="al-desc"></p>
      <p class="alert-airline"></p>
      <button type="button" class="alert-dismiss">${icon('check')} Dismiss</button>
      <div class="alert-progress"><div class="alert-progress-fill"></div></div>
    </div>`;
  const q = (s) => el.querySelector(s);
  let timer = null, release = null;

  function show(ev, minsLeft, { muted } = {}) {
    (document.fullscreenElement || document.body).appendChild(el);
    const T = EVENT_TYPES[ev.type];
    el.dataset.type = ev.type;
    q('.alert-ic').innerHTML = icon(ev.type === 'truck' ? 'truck' : 'seal');
    q('.alert-flight').textContent = ev.f.flight;
    q('.alert-type').textContent = T.long;
    q('.alert-time').textContent = `in ${Math.max(1, Math.round(minsLeft))} min · ${ev.time}`;
    q('.alert-airline').textContent = ev.f.airline;
    const fill = q('.alert-progress-fill');
    fill.style.transition = 'none';
    fill.style.transform = 'scaleX(1)';
    el.hidden = false;
    requestAnimationFrame(() => {
      el.classList.add('is-open');
      requestAnimationFrame(() => { fill.style.transition = 'transform 30s linear'; fill.style.transform = 'scaleX(0)'; });
    });
    q('.alert-dismiss').focus({ preventScroll: true });
    release = focusTrap(el, hide);
    if (!muted) playAlertSound(3000);
    clearTimeout(timer);
    timer = setTimeout(hide, 30000);
  }
  function hide() {
    if (el.hidden) return;
    clearTimeout(timer);
    el.classList.remove('is-open');
    el.hidden = true;
    if (release) { release(); release = null; }
  }
  q('.alert-dismiss').addEventListener('click', hide);
  el.addEventListener('click', (e) => { if (e.target === el) hide(); });
  return { show, hide };
}

