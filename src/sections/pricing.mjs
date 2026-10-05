import { esc, icon } from './_helpers.mjs';
import head from './_head.mjs';

/** Custom pricing: what the quote depends on, one call to action. No prices. */
export default function pricing(cfg) {
  const p = cfg.pricing;
  return `
<section class="section pricing" id="pricing" aria-labelledby="pricing-title">
  <div class="container">
    ${head({ eyebrow: p.eyebrow, title: p.title, lead: p.subtitle, id: 'pricing-title' })}
    <ul class="criteria">
      ${p.criteria.map((c, i) => `<li class="criterion reveal" style="--d:${i * 90}ms">
        <span class="crit-ic">${icon(c.icon)}</span>
        <h3 class="h3">${esc(c.title)}</h3>
        <p>${esc(c.text)}</p>
      </li>`).join('')}
    </ul>
    <div class="quote-bar reveal">
      <p>${esc(p.included)}</p>
      <a class="btn btn--primary" href="#contact" data-plan="Custom quote">${esc(p.cta)}${icon('arrow')}</a>
    </div>
  </div>
</section>`;
}
