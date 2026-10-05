/* ============================================================
   Landing page behaviour
   - sticky nav state + mobile menu
   - scroll reveal (IntersectionObserver)
   - hero mini-timeline
   - lazy-loaded interactive dashboard
   - "Copy link" buttons
   ============================================================ */

import { initHero } from './hero.js';
import { initCopilot } from './copilot.js';
import { initRoi } from './roi.js';
import { initForm } from './form.js';

/* Browser-side settings written by the build from config.js */
let CFG = {};
try { CFG = JSON.parse(document.getElementById('site-config')?.textContent || '{}'); } catch (e) { /* defaults */ }

document.documentElement.classList.remove('no-js');

/* ---------- Nav ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = nav.querySelector('.nav-toggle');
  const menu = nav.querySelector('.nav-menu');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
}

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add('is-in'));

/* ---------- Hero ---------- */
const hero = document.querySelector('.hero-visual');
if (hero) initHero(hero);

/* ---------- Dashboard (loaded when it approaches the viewport) ---------- */
const dashHost = document.querySelector('[data-dashboard]');
if (dashHost) {
  let started = false;
  const start = async () => {
    if (started) return;
    started = true;
    const { createDashboard } = await import('./dashboard/app.js');
    createDashboard(dashHost, { start: dashHost.dataset.start || '10:40', name: CFG.name });
  };
  // Direct link to the demo or a click on "Try the live demo" loads it immediately
  if (location.hash === '#demo' || dashHost.hasAttribute('data-eager')) start();
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' });
    io.observe(dashHost);
  } else start();
}

/* ---------- Live slots and config panel (loaded near the viewport) ---------- */
function lazy(el, load) {
  if (!el) return;
  let done = false;
  const go = () => { if (!done) { done = true; load(el); } };
  if (location.hash === '#' + el.closest('section')?.id) go();
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
  } else go();
}
lazy(document.querySelector('[data-live-slots]'), async (el) => (await import('./live-slots.js')).initLiveSlots(el));
lazy(document.querySelector('[data-config-panel]'), async (el) => (await import('./config-panel.js')).initConfigPanel(el));

/* ---------- Copilot, ROI, form ---------- */
const chat = document.querySelector('[data-copilot]');
if (chat) initCopilot(chat);
const roi = document.querySelector('[data-roi-root]');
if (roi) initRoi(roi, CFG.roi);
const form = document.querySelector('[data-form]');
if (form) initForm(form, CFG);

/* ---------- Copy link ---------- */
document.querySelectorAll('[data-copy-link]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const url = new URL(btn.getAttribute('data-copy-link') || '', location.href).href;
    const label = btn.querySelector('span');
    const original = label.textContent;
    try {
      await navigator.clipboard.writeText(url);
      label.textContent = 'Link copied';
    } catch (e) {
      window.prompt('Copy this link:', url);
    }
    btn.classList.add('is-done');
    setTimeout(() => { label.textContent = original; btn.classList.remove('is-done'); }, 2000);
  });
});
