import { esc, icon } from './_helpers.mjs';
import head from './_head.mjs';

/** 9. Pricing: three plans, values from config.js. */
export default function pricing(cfg) {
  const p = cfg.pricing;
  return `
<section class="section pricing" id="pricing" aria-labelledby="pricing-title">
  <div class="container">
    ${head({ eyebrow: p.eyebrow, title: p.title, lead: p.subtitle, id: 'pricing-title' })}
    <ul class="plans">
      ${p.plans.map((pl, i) => `<li class="plan${pl.highlighted ? ' is-hi' : ''} reveal" style="--d:${i * 90}ms">
        ${pl.highlighted ? '<p class="plan-flag">Most teams start here</p>' : ''}
        <h3 class="plan-name">${esc(pl.name)}</h3>
        <p class="plan-tag">${esc(pl.tagline)}</p>
        <p class="plan-price"><span class="plan-amount">${esc(pl.price)}</span>${pl.period ? `<span class="plan-period">${esc(pl.period)}</span>` : ''}</p>
        ${p.showExampleTag && /\d/.test(pl.price) ? '<p class="plan-example mono">Example price</p>' : ''}
        <ul class="plan-feats">${pl.features.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
        <a class="btn ${pl.highlighted ? 'btn--primary' : 'btn--ghost'}" href="#contact" data-plan="${esc(pl.name)}">${esc(pl.cta)}</a>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
}
