import { esc, icon } from './_helpers.mjs';

/** 3. Interactive demo: the dashboard replica mounts into [data-dashboard]. */
export default function demo(cfg) {
  const d = cfg.demo;
  return `
<section class="section demo" id="demo" aria-labelledby="demo-title">
  <div class="container">
    <div class="section-head section-head--center reveal">
      <p class="eyebrow">${esc(d.eyebrow)}</p>
      <h2 class="h2" id="demo-title">${esc(d.title)}</h2>
      <p class="lead">${esc(d.subtitle)}</p>
    </div>
    <div class="demo-stage">
      <div class="db-host" data-dashboard data-start="10:40">
        <noscript><p class="db-noscript">The interactive demo needs JavaScript.</p></noscript>
      </div>
    </div>
    <div class="demo-share">
      <p class="demo-note">${esc(d.note)}</p>
      <div class="demo-share-links">
        <a class="link-btn" href="demo/">${icon('expand')}<span>Open full screen</span></a>
        <button type="button" class="link-btn" data-copy-link="demo/">${icon('link')}<span>Copy link</span></button>
      </div>
    </div>
  </div>
</section>`;
}
