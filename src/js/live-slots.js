/* ============================================================
   Live slots demo
   One inbound flight on a simulated clock (×12). Its live
   estimated ETA drives the estimated ETD, and the Box Time and
   truck slots follow from the timing rules. "Simulate a delay"
   adds 25 minutes and everything downstream moves on its own.
   Sample data only: nothing is fetched.
   ============================================================ */

import { m2t } from './dashboard/data.js';

const SPEED = 12;               // simulated seconds per real second
const START = 7 * 3600;         // 07:00:00
const ETA0 = 7 * 60 + 55;       // planned ETA, minutes
const GROUND = 150, BOX_BEFORE = 120, TRUCK_BEFORE = 75; // rules, minutes
const DELAY = 25;
const P0 = 0.18;                // the aircraft is already en route
const WIN0 = 6 * 60 + 45, WIN1 = 11 * 60 + 15; // track window

const slotsFor = (eta) => {
  const etd = eta + GROUND;
  return { eta, box: etd - BOX_BEFORE, truck: etd - TRUCK_BEFORE, etd };
};
const pct = (m) => ((m - WIN0) / (WIN1 - WIN0)) * 100;

export function initLiveSlots(root) {
  const q = (s) => root.querySelector(s);
  const route = q('[data-route]'), done = q('[data-done]'), plane = q('[data-plane]');
  const len = route.getTotalLength();
  done.style.strokeDasharray = `${len} ${len}`;
  const els = {
    clock: q('[data-clock]'), eta: q('[data-eta]'), count: q('[data-count]'), ping: q('[data-ping]'),
    badge: q('[data-badge]'), badgeTxt: q('[data-badge-txt]'), now: q('[data-now]'),
    delayBtn: q('[data-delay]'), resetBtn: q('[data-reset]'), announce: q('[data-announce]'),
  };
  const slotEls = {};
  for (const k of ['eta', 'box', 'truck', 'etd']) {
    const li = q(`[data-slot="${k}"]`);
    slotEls[k] = { li, time: li.querySelector('[data-time]'), sub: li.querySelector('[data-sub]'), mk: q(`[data-mk="${k}"]`) };
  }
  // Hour labels on the slot track
  q('.ls-axis').innerHTML = [7, 8, 9, 10, 11].map((h) => `<span style="left:${pct(h * 60)}%">${String(h).padStart(2, '0')}:00</span>`).join('');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const planned = slotsFor(ETA0);
  let sim, p, delay, etaShown, landedAt, lastPing, running = false, raf = 0, last = 0, timers = [];

  function placeSlots(s, changed) {
    for (const k of Object.keys(slotEls)) {
      const e = slotEls[k];
      e.time.textContent = m2t(s[k]);
      e.mk.style.left = pct(s[k]) + '%';
      const diff = s[k] - planned[k];
      e.sub.innerHTML = diff ? `+${diff} min<br>plan ${m2t(planned[k])}` : k === 'box' ? 'meals ready<br>&nbsp;' : k === 'truck' ? 'kitchen to aircraft<br>&nbsp;' : `on plan<br>${m2t(planned[k])}`;
      e.li.classList.toggle('is-moved', !!diff);
      if (changed) { e.li.classList.remove('flash'); void e.li.offsetWidth; e.li.classList.add('flash'); }
    }
  }

  function reset() {
    timers.forEach(clearTimeout); timers = [];
    sim = START; p = P0; delay = 0; etaShown = ETA0; landedAt = 0; lastPing = performance.now();
    els.badge.classList.remove('is-updated', 'is-landed');
    els.badgeTxt.textContent = 'Live';
    els.delayBtn.disabled = false;
    els.resetBtn.disabled = true;
    Object.values(slotEls).forEach((e) => e.li.classList.remove('flash'));
    placeSlots(planned, false);
    render(true);
  }

  function simulateDelay() {
    if (delay || landedAt) return;
    delay = DELAY;
    els.delayBtn.disabled = true;
    els.resetBtn.disabled = false;
    els.badge.classList.add('is-updated');
    els.badgeTxt.textContent = 'Updated automatically';
    // The ETA counts up minute by minute, then each slot follows in turn
    const steps = reduced ? 1 : DELAY;
    for (let i = 1; i <= steps; i++) {
      timers.push(setTimeout(() => { etaShown = ETA0 + Math.round((DELAY * i) / steps); els.eta.textContent = m2t(etaShown); }, reduced ? 0 : i * 32));
    }
    const target = slotsFor(ETA0 + DELAY);
    const order = ['eta', 'box', 'truck', 'etd'];
    order.forEach((k, i) => timers.push(setTimeout(() => {
      const partial = { ...planned };
      order.slice(0, i + 1).forEach((kk) => { partial[kk] = target[kk]; });
      placeSlots(partial, false);
      const e = slotEls[k];
      e.li.classList.remove('flash'); void e.li.offsetWidth; e.li.classList.add('flash');
    }, reduced ? 0 : 900 + i * 260)));
    els.announce.textContent = `Delay detected. Live estimated ETA now ${m2t(ETA0 + DELAY)}. Box Time ${m2t(target.box)}, truck departure ${m2t(target.truck)} and ETD ${m2t(target.etd)} updated automatically.`;
  }

  function render(force) {
    const etaSec = (ETA0 + delay) * 60;
    const left = Math.max(0, etaSec - sim);
    const pt = route.getPointAtLength(len * p);
    const ahead = route.getPointAtLength(Math.min(len, len * p + 2));
    const behind = route.getPointAtLength(Math.max(0, len * p - 2));
    const ang = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
    plane.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${(ang + 45).toFixed(1)})`);
    done.style.strokeDashoffset = String(len * (1 - p));
    els.clock.textContent = m2t(sim / 60) + ':' + String(Math.floor(sim % 60)).padStart(2, '0');
    els.now.style.left = pct(sim / 60) + '%';
    if (landedAt) els.count.textContent = 'Landed';
    else els.count.textContent = left >= 60 ? `in ${Math.floor(left / 60)} min ${String(Math.floor(left % 60)).padStart(2, '0')} s` : `in ${Math.ceil(left)} s`;
    if (force) els.eta.textContent = m2t(etaShown);
    const ago = Math.floor((performance.now() - lastPing) / 1000);
    els.ping.textContent = landedAt ? 'On the ground' : `Position updated ${ago} s ago`;
  }

  function tick(t) {
    const dt = Math.min(0.25, (t - last) / 1000);
    last = t;
    if (!landedAt) {
      const dtSim = dt * SPEED;
      const left = (ETA0 + delay) * 60 - sim;
      // The aircraft covers the remaining distance in the remaining time: a delay slows it down
      p = left > 0 ? p + (1 - p) * Math.min(1, dtSim / left) : 1;
      sim += dtSim;
      if (t - lastPing > 4000) lastPing = t;
      if (left - dtSim <= 0) {
        landedAt = t; p = 1;
        els.badge.classList.add('is-landed');
        els.badgeTxt.textContent = 'Landed';
        els.delayBtn.disabled = true;
      }
    } else if (t - landedAt > 6000) reset();
    if (!reduced || Math.floor(t / 1000) !== Math.floor((t - dt * 1000) / 1000)) render(false);
    raf = requestAnimationFrame(tick);
  }

  function play(on) {
    if (on === running) return;
    running = on;
    if (on) { last = performance.now(); raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf);
  }

  els.delayBtn.addEventListener('click', simulateDelay);
  els.resetBtn.addEventListener('click', () => { reset(); els.delayBtn.focus(); });
  reset();

  // Only animate while the card is on screen
  let visible = false;
  const sync = () => play(visible && !document.hidden);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }).observe(root);
  } else { visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);
}
