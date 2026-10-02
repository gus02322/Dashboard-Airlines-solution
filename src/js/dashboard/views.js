/* ============================================================
   Dashboard views: Ops timeline, Production, Airlines, Week.
   Each renderer builds its DOM once and returns an `update(now)`
   function that only touches what changes as time moves.
   ============================================================ */

import { EVENT_TYPES, t2m, m2t } from './data.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Monday-based weekday index (0 = Mon). */
export const mondayIndex = (d) => (d.getDay() + 6) % 7;

/** Does a flight operate N days after the demo day? */
export const operatesOn = (f, offset) => f.days[((offset % 7) + 7) % 7] === '1';

/* ------------------------------------------------------------
   Generic vertical 24h grid (used by Ops and Production)
   items: [{ key, mins, color, cls, html, listHtml, label, flightId, pastable }]
   ------------------------------------------------------------ */
export function renderGrid(scroll, items, ctx) {
  const { s, onOpen } = ctx;
  scroll.innerHTML = '';
  const listMode = scroll.clientWidth < 560 && !ctx.tv;
  return listMode ? renderList(scroll, items, ctx) : renderTimeline(scroll, items, s, onOpen, ctx);
}

/* Greedy column packing, same rule as the production board:
   a block goes in the first column that is free at its start time. */
function pack(items, span) {
  const cols = [];
  const placed = items.map((it) => {
    let c = cols.findIndex((e) => e <= it.mins);
    if (c === -1) { cols.push(it.mins + span); c = cols.length - 1; } else cols[c] = it.mins + span;
    return { it, col: c };
  });
  return { placed, ncols: Math.max(1, cols.length) };
}

function renderTimeline(scroll, items, s, onOpen, ctx) {
  const bh = ctx.tv ? 120 : 84;            // block height
  const LANE = ctx.tv ? 84 : 58, GAP = 6, PAD = 14;
  const minBw = ctx.tv ? 190 : 112, maxBw = ctx.tv ? 320 : 210;
  const avail = scroll.clientWidth - LANE - PAD;

  // Zoom the time axis (pixels per minute) until the columns fit the width
  let ppm = ctx.tv ? 3.4 : 2.4, layout;
  for (; ; ppm += 0.4) {
    layout = pack(items, (bh + GAP) / ppm);
    if (layout.ncols * (minBw + GAP) <= avail || ppm >= 6) break;
  }
  const { placed, ncols } = layout;
  let bw = Math.floor((avail - (ncols - 1) * GAP) / ncols);
  bw = Math.max(minBw, Math.min(maxBw, bw));

  const inner = document.createElement('div');
  inner.className = 'tl-inner';
  inner.style.height = 1440 * ppm + 'px';

  // Hour grid
  let grid = '';
  for (let h = 0; h < 24; h++) {
    const y = h * 60 * ppm;
    grid += `<div class="tl-tick" style="top:${y}px"></div><div class="tl-hour mono" style="top:${y + 3}px">${String(h).padStart(2, '0')}:00</div>`;
  }
  inner.innerHTML = grid;
  inner.style.minWidth = LANE + ncols * (bw + GAP) + PAD + 'px';

  const frag = document.createDocumentFragment();
  const blocks = [];
  for (const { it, col } of placed) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'eblock ' + it.cls;
    b.style.cssText = `top:${it.mins * ppm}px;left:${LANE + col * (bw + GAP)}px;width:${bw}px;height:${bh}px;--al:${it.color}`;
    b.innerHTML = it.html;
    b.addEventListener('click', () => it.flightId && onOpen(it.flightId));
    frag.appendChild(b);
    blocks.push({ el: b, mins: it.mins, pastable: it.pastable !== false });
  }
  inner.appendChild(frag);

  const now = document.createElement('div');
  now.className = 'now-line';
  now.innerHTML = '<span class="now-label mono">NOW 00:00</span><span class="now-dot"></span>';
  inner.appendChild(now);
  const nowLbl = now.firstChild;
  scroll.appendChild(inner);

  let lastMin = -1;
  return {
    update(t, follow) {
      now.style.transform = `translateY(${t * ppm}px)`;
      const m = Math.floor(t);
      if (m !== lastMin) {
        lastMin = m;
        nowLbl.textContent = 'NOW ' + m2t(m);
        for (const b of blocks) b.el.classList.toggle('past', b.pastable && b.mins < t);
      }
      if (follow) scroll.scrollTop = Math.max(0, t * ppm - scroll.clientHeight * 0.3);
    },
  };
}

function renderList(scroll, items, ctx) {
  const inner = document.createElement('div');
  inner.className = 'tl-list';
  scroll.appendChild(inner);
  let boundary = -1;

  function draw(t) {
    let html = '', lastHour = -1, nowDone = false;
    items.forEach((it, i) => {
      const past = it.pastable !== false && it.mins < t;
      if (!past && !nowDone) { nowDone = true; html += `<div class="list-now mono" data-now>NOW ${m2t(t)}</div>`; }
      const h = Math.floor(it.mins / 60);
      if (h !== lastHour) { lastHour = h; html += `<div class="list-hour mono">${String(h).padStart(2, '0')}:00</div>`; }
      html += `<button type="button" class="eblock eblock--list ${it.cls}${past ? ' past' : ''}" style="--al:${it.color}" data-i="${i}">${it.listHtml || it.html}</button>`;
    });
    if (!nowDone) html += `<div class="list-now mono" data-now>NOW ${m2t(t)}</div>`;
    inner.innerHTML = html;
  }
  inner.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) { const it = items[+b.dataset.i]; if (it.flightId) ctx.onOpen(it.flightId); }
  });

  return {
    update(t, follow) {
      const nb = items.filter((it) => it.pastable !== false && it.mins < t).length;
      const nowEl = inner.querySelector('[data-now]');
      if (nb !== boundary || !nowEl) { boundary = nb; draw(t); }
      else nowEl.textContent = 'NOW ' + m2t(t);
      if (follow) {
        const el = inner.querySelector('[data-now]');
        if (el) scroll.scrollTop = Math.max(0, el.offsetTop - scroll.clientHeight * 0.3);
      }
    },
  };
}

/* ------------------------------------------------------------
   Ops view
   ------------------------------------------------------------ */
export function renderOps(scroll, ctx) {
  const items = ctx.events.map((e) => {
    const T = EVENT_TYPES[e.type];
    const label = `${T.long} ${e.f.flight}, ${e.f.airline}, at ${e.time}`;
    return {
      key: e.key, mins: e.mins, color: e.f.color, cls: 'type-' + e.type, flightId: e.f.id, label,
      html: `<span class="eb-time mono">${e.time}</span><span class="eb-type">${T.label}</span><span class="eb-flight mono">${e.f.flight}</span>${ctx.tv ? '' : `<span class="eb-airline">${esc(e.f.airline)}</span>`}`,
      listHtml: `<span class="eb-row"><span class="eb-time mono">${e.time}</span><span class="eb-badge">${T.label}</span><span class="eb-flight mono">${e.f.flight}</span></span><span class="eb-airline">${esc(e.f.airline)}</span>`,
    };
  });
  if (!items.length) { scroll.innerHTML = '<p class="db-empty">No events match these filters.</p>'; return { update() {} }; }
  return renderGrid(scroll, items, ctx);
}

/* ------------------------------------------------------------
   Production view: Box Time slots, D and D-1
   ------------------------------------------------------------ */
export function renderProduction(scroll, ctx) {
  const items = ctx.slots.map((sl) => {
    const isD = sl.day === 'D';
    const label = `Box time ${sl.flight}, ${sl.airline}, ${isD ? 'today' : 'for tomorrow'}, at ${sl.time}`;
    const badge = `<span class="prod-badge ${isD ? 'is-d' : 'is-d1'}">${sl.day}</span>`;
    return {
      key: sl.flightId + '_box', mins: t2m(sl.time), color: sl.color, cls: 'type-box' + (isD ? '' : ' is-d1'), flightId: sl.flightId, label,
      pastable: isD,
      html: `<span class="eb-time mono">${sl.time} ${badge}</span><span class="eb-type">Box Time</span><span class="eb-flight mono">${sl.flight}</span><span class="eb-airline">${esc(sl.airline)}</span>`,
      listHtml: `<span class="eb-row"><span class="eb-time mono">${sl.time}</span>${badge}<span class="eb-flight mono">${sl.flight}</span></span><span class="eb-airline">${esc(sl.airline)} · Box Time</span>`,
    };
  });
  if (!items.length) { scroll.innerHTML = '<p class="db-empty">No production slots match these filters.</p>'; return { update() {} }; }
  return renderGrid(scroll, items, ctx);
}

/* ------------------------------------------------------------
   Airlines view: one card per airline with meal totals
   ------------------------------------------------------------ */
export function renderAirlines(scroll, ctx) {
  const by = new Map();
  for (const f of ctx.flights) {
    if (!by.has(f.airline)) by.set(f.airline, []);
    by.get(f.airline).push(f);
  }
  const total = ctx.flights.reduce((s, f) => s + f.meals, 0);
  const chip = (cls, t) => `<span class="al-chip ${cls} mono">${t}</span>`;

  function draw(t) {
    let cards = '';
    for (const [name, list] of by) {
      const meals = list.reduce((s, f) => s + f.meals, 0);
      const rows = list.map((f) => {
        const past = t2m(f.sealing) < t; // already sealed today
        return `<button type="button" class="al-row${past ? ' past' : ''}" data-id="${f.id}" aria-label="${esc(f.flight)} details">
          <span class="al-num mono">${f.flight}</span>
          <span class="al-chips">${chip('c-seal', 'SEAL ' + f.sealing)}${chip('c-truck', 'TRUCK ' + f.truck)}${chip('c-eta', 'ETA ' + f.eta)}${chip('c-etd', 'ETD ' + f.etd)}</span>
          <span class="al-meals mono">${f.meals}</span>
        </button>`;
      }).join('');
      cards += `<article class="al-card" style="--al:${list[0].color}">
        <header class="al-head"><span class="al-dot"></span><p class="al-name">${esc(name)}</p><span class="al-total mono">${meals} meals</span></header>
        <div class="al-body">${rows}</div></article>`;
    }
    scroll.innerHTML = `<div class="view-head"><span class="view-title">Flights by airline</span><span class="view-meta mono">Total meals <strong>${total.toLocaleString('en-US')}</strong></span></div>
      ${cards ? `<div class="al-grid">${cards}</div>` : '<p class="db-empty">No flights match these filters.</p>'}`;
  }
  scroll.onclick = (e) => { const r = e.target.closest('[data-id]'); if (r) ctx.onOpen(r.dataset.id); };
  let lastBucket = -1;
  draw(ctx.s.now);
  return {
    update(t) {
      const bucket = Math.floor(t / 5);
      if (bucket !== lastBucket) { lastBucket = bucket; const st = scroll.scrollTop; draw(t); scroll.scrollTop = st; }
    },
  };
}

/* ------------------------------------------------------------
   Week view: 7-day grid, today highlighted
   ------------------------------------------------------------ */
export function renderWeek(scroll, ctx) {
  const today = ctx.date;
  const ti = mondayIndex(today);
  const monday = new Date(today); monday.setDate(today.getDate() - ti);
  let cols = '';
  for (let d = 0; d < 7; d++) {
    const date = new Date(monday); date.setDate(monday.getDate() + d);
    const offset = d - ti;
    const list = ctx.flights.filter((f) => operatesOn(f, offset)).sort((a, b) => t2m(a.truck) - t2m(b.truck));
    const isToday = d === ti;
    const cards = list.map((f) => `<button type="button" class="wk-flight" style="--al:${f.color}" data-id="${f.id}" aria-label="${esc(f.flight)} ${esc(f.airline)}">
        <span class="wk-al">${esc(f.airline)}</span>
        <span class="wk-num mono">${f.flight}</span>
        <span class="wk-meta"><span class="meal-tag meal-${f.mealType}">${f.mealType}</span><span class="wk-truck mono">TRUCK ${f.truck}</span></span>
      </button>`).join('');
    cols += `<div class="wk-col${isToday ? ' is-today' : ''}">
      <div class="wk-head"><span class="wk-day">${DAY_SHORT[d]}</span><span class="wk-date mono">${date.getDate()} ${MONTHS[date.getMonth()]}</span><span class="wk-count mono">${list.length} flights</span></div>
      ${cards || '<p class="wk-empty mono">No flights</p>'}</div>`;
  }
  scroll.innerHTML = `<div class="wk-grid">${cols}</div>`;
  scroll.onclick = (e) => { const r = e.target.closest('[data-id]'); if (r) ctx.onOpen(r.dataset.id); };
  // Bring today's column into view on narrow screens
  const todayCol = scroll.querySelector('.wk-col.is-today');
  if (todayCol && scroll.clientWidth < 900) scroll.scrollLeft = Math.max(0, todayCol.offsetLeft - 12);
  return { update() {} };
}
