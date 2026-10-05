import { esc, icon, wordmark } from './_helpers.mjs';

/** 1. Hero: headline, one sentence, two CTAs, animated mini-timeline. */
export default function hero(cfg) {
  const h = cfg.hero;
  const lines = h.title.map((l, i) => `<span class="hero-line${i === h.title.length - 1 ? ' is-accent' : ''}">${esc(l)}</span>`).join(' ');
  return `
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero-grid-bg" aria-hidden="true"></div>
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="eyebrow eyebrow--live"><span class="live-dot" aria-hidden="true"></span>${esc(h.eyebrow)}</p>
      <h1 class="h1 hero-title" id="hero-title">${lines}</h1>
      <p class="lead hero-sub">${esc(h.subtitle)}</p>
      <div class="hero-ctas">
        <a class="btn btn--primary" href="#contact">${esc(h.primaryCta)}</a>
        <a class="btn btn--ghost" href="#demo">${icon('play')}${esc(h.secondaryCta)}</a>
      </div>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <div class="hv-card">
        <div class="hv-top">
          <span class="hv-logo">${wordmark(cfg.site.name)}</span>
          <span class="hv-clock mono">10:40</span>
          <span class="hv-live mono"><span class="live-dot"></span>LIVE</span>
        </div>
        <div class="hv-legend mono">
          <span class="c-eta">ETA</span><span class="c-seal">Sealing</span><span class="c-truck">Truck</span><span class="c-etd">ETD</span>
        </div>
        <div class="hv-view">
          <div class="hv-track"></div>
          <div class="hv-now"><span class="hv-now-lbl mono">NOW 10:40</span></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}
