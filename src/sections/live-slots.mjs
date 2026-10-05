import { esc, icon } from './_helpers.mjs';

/** Live slots: an inbound aircraft drives its ETA, ETD and the slots tied to them. */
export default function liveSlots(cfg) {
  const l = cfg.liveSlots;
  const slot = (key, label, live, color) => `<li class="ls-slot" data-slot="${key}" style="--c:var(--${color})">
          <span class="ls-slot-lbl">${label}${live ? '<span class="ls-livetag mono"><span class="ls-pulse" aria-hidden="true"></span>Live</span>' : ''}</span>
          <span class="ls-slot-time mono" data-time>--:--</span>
          <span class="ls-slot-sub mono" data-sub></span>
        </li>`;
  return `
<section class="section lslots" id="live-slots" aria-labelledby="ls-title">
  <div class="container lslots-grid">
    <div class="lslots-copy reveal">
      <p class="eyebrow">${esc(l.eyebrow)}</p>
      <h2 class="h2" id="ls-title">${esc(l.title)}</h2>
      <p class="lead">${esc(l.text)}</p>
      <ul class="ticks">
        ${l.points.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}
      </ul>
      <p class="honesty">${esc(l.honesty)}</p>
    </div>
    <div class="ls-card reveal" data-live-slots>
      <div class="ls-top">
        <span class="ls-flight"><span class="ls-dot" aria-hidden="true"></span><span class="mono">EK 230</span><span class="ls-al">Emirates · inbound</span></span>
        <span class="ls-badge mono" data-badge><span class="ls-pulse" aria-hidden="true"></span><span data-badge-txt>Live</span></span>
      </div>
      <div class="ls-map">
        <svg viewBox="0 0 560 210" role="img" aria-label="Map: the inbound aircraft flies along an arc towards the airport">
          <defs>
            <pattern id="ls-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#262b39" stroke-width="1"/></pattern>
          </defs>
          <rect width="560" height="210" fill="url(#ls-grid)"/>
          <circle cx="516" cy="160" r="44" class="ls-ring"/>
          <circle cx="516" cy="160" r="88" class="ls-ring"/>
          <path d="M36 176 Q 270 -18 516 160" class="ls-route" data-route/>
          <path d="M36 176 Q 270 -18 516 160" class="ls-done" data-done/>
          <circle cx="36" cy="176" r="4" class="ls-origin"/>
          <g class="ls-apt"><circle cx="516" cy="160" r="7"/><circle cx="516" cy="160" r="2.5"/></g>
          <text x="516" y="196" text-anchor="middle" class="ls-apt-lbl">HUB</text>
          <g class="ls-plane" data-plane><g transform="translate(-14 -14) scale(1.15)" fill="#13161e" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">${icon('plane').replace(/^.*?>|<\/svg>$/g, '')}</g></g>
        </svg>
        <p class="ls-clock mono"><span data-clock>07:00</span><span class="ls-speed">sample flight · time ×12</span></p>
      </div>
      <div class="ls-eta">
        <div>
          <p class="ls-k">Live estimated ETA</p>
          <p class="ls-eta-time mono" data-eta>07:55</p>
        </div>
        <div class="ls-eta-right">
          <p class="ls-count mono" data-count>in 55 min</p>
          <p class="ls-src mono"><span data-ping>Position updated 1 s ago</span> · live aircraft tracking (ADS-B)</p>
        </div>
      </div>
      <ul class="ls-slots">
        ${slot('eta', 'ETA', true, 'eta')}
        ${slot('box', 'Box Time', false, 'western')}
        ${slot('truck', 'Truck departure', false, 'truck')}
        ${slot('etd', 'ETD', true, 'etd')}
      </ul>
      <div class="ls-track" aria-hidden="true">
        <div class="ls-axis mono"></div>
        <span class="ls-now" data-now></span>
        <span class="ls-mk" data-mk="eta" style="--c:var(--eta)"></span>
        <span class="ls-mk" data-mk="box" style="--c:var(--western)"></span>
        <span class="ls-mk" data-mk="truck" style="--c:var(--truck)"></span>
        <span class="ls-mk" data-mk="etd" style="--c:var(--etd)"></span>
      </div>
      <div class="ls-actions">
        <button type="button" class="btn btn--primary btn--sm" data-delay>${icon('clock')}Simulate a delay</button>
        <button type="button" class="btn btn--ghost btn--sm" data-reset disabled>${icon('reset')}Reset</button>
      </div>
      <p class="ls-rule mono">Rules: ground time 2h30 · Box Time = ETD − 2h00 · Truck = ETD − 1h15</p>
      <p class="sr-only" role="status" aria-live="polite" data-announce></p>
    </div>
  </div>
</section>`;
}
