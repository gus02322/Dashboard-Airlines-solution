import { esc, icon } from './_helpers.mjs';
import head from './_head.mjs';

/** 4. Features: up to six outcomes. */
export default function features(cfg) {
  const f = cfg.features;
  const tints = ['var(--accent)', 'var(--seal)', 'var(--etd)', 'var(--eta)', 'var(--now)', 'var(--accent)'];
  return `
<section class="section features" id="features" aria-labelledby="features-title">
  <div class="container">
    ${head({ eyebrow: f.eyebrow, title: f.title, id: 'features-title' })}
    <ul class="feature-grid">
      ${f.items.slice(0, 6).map((it, i) => `<li class="feature reveal" style="--d:${(i % 3) * 80}ms;--tint:${tints[i]}">
        <span class="feature-ic">${icon(it.icon)}</span>
        <h3 class="h3">${esc(it.title)}</h3>
        <p>${esc(it.text)}</p>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
}
