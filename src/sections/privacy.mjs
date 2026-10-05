import { esc, icon } from './_helpers.mjs';
import head from './_head.mjs';

/** Data & privacy: five design principles, link to the details page. */
export default function privacy(cfg) {
  const p = cfg.privacy;
  return `
<section class="section privacy" id="privacy" aria-labelledby="privacy-title">
  <div class="container">
    ${head({ eyebrow: p.eyebrow, title: p.title, lead: p.text, id: 'privacy-title' })}
    <ul class="principles">
      ${p.items.map((it, i) => `<li class="principle reveal" style="--d:${(i % 3) * 80}ms">
        <span class="pr-num mono">0${i + 1}</span>
        <span class="pr-ic">${icon(it.icon)}</span>
        <h3 class="h3">${esc(it.title)}</h3>
        <p>${esc(it.text)}</p>
      </li>`).join('')}
      <li class="principle principle--link reveal" style="--d:160ms">
        <span class="pr-ic">${icon('shield')}</span>
        <p>How each principle is applied: hosting, encryption, access, retention.</p>
        <a class="btn btn--ghost btn--sm" href="privacy/">${esc(p.link)}${icon('arrow')}</a>
      </li>
    </ul>
  </div>
</section>`;
}
