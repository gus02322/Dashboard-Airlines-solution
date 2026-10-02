/* ============================================================
   Hero mini-timeline
   A compact, decorative version of the Ops view: the day scrolls
   upward under a fixed NOW line. Static when the visitor prefers
   reduced motion, paused when off-screen.
   ============================================================ */

import { EVENTS, EVENT_TYPES, m2t, t2m } from './dashboard/data.js';

const PPM = 2.4;            // pixels per minute
const BH = 54;              // block height
const LANES = 3;
const SIM_MIN_PER_SEC = 6;  // 1 simulated hour every 10 seconds

export function initHero(root) {
  const track = root.querySelector('.hv-track');
  const nowLbl = root.querySelector('.hv-now-lbl');
  const clock = root.querySelector('.hv-clock');
  const view = root.querySelector('.hv-view');
  if (!track || !view) return;

  // Build the day once: hour ticks + event blocks in 3 lanes
  const ends = new Array(LANES).fill(-Infinity);
  let html = '';
  for (let h = 0; h < 24; h++) {
    html += `<div class="hv-tick" style="top:${h * 60 * PPM}px"><span class="mono">${String(h).padStart(2, '0')}:00</span></div>`;
  }
  const blocks = [];
  for (const e of EVENTS) {
    let lane = ends.findIndex((end) => end <= e.mins);
    if (lane === -1) continue; // keep the visual airy: skip when all lanes are busy
    ends[lane] = e.mins + (BH + 8) / PPM;
    const T = EVENT_TYPES[e.type];
    html += `<div class="hv-block type-${e.type}" data-m="${e.mins}" style="top:${e.mins * PPM}px;--lane:${lane};--al:${e.f.color}">
      <span class="hv-b-top"><span class="mono">${e.time}</span><b>${T.label}</b></span><span class="hv-b-fl mono">${e.f.flight}</span></div>`;
  }
  track.innerHTML = html;
  track.style.height = 1440 * PPM + 'px';
  track.querySelectorAll('.hv-block').forEach((el) => blocks.push({ el, m: +el.dataset.m }));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let now = t2m('10:40');
  let visible = true, last = performance.now(), lastMin = -1;

  function paint() {
    const nowY = view.clientHeight * 0.42;
    track.style.transform = `translate3d(0, ${nowY - now * PPM}px, 0)`;
    const m = Math.floor(now);
    if (m !== lastMin) {
      lastMin = m;
      const t = m2t(m);
      if (nowLbl) nowLbl.textContent = 'NOW ' + t;
      if (clock) clock.textContent = t;
      for (const b of blocks) b.el.classList.toggle('past', b.m < now);
    }
  }

  function loop(ts) {
    const dt = Math.min(100, ts - last);
    last = ts;
    if (visible) {
      now += (dt / 1000) * SIM_MIN_PER_SEC;
      if (now >= 1440) now -= 1440;
      paint();
    }
    requestAnimationFrame(loop);
  }

  paint();
  if (reduced) return;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(root);
  requestAnimationFrame(loop);
}
