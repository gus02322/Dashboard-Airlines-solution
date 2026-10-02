import { esc } from './_helpers.mjs';

/** 10. Proof: real figures only; testimonials appear when added in config.js. */
export default function proof(cfg) {
  const p = cfg.proof;
  const quotes = (p.testimonials || []).map((t) => `<figure class="quote reveal">
      <blockquote><p>${esc(t.quote)}</p></blockquote>
      <figcaption><strong>${esc(t.name)}</strong>, ${esc(t.role)}${t.company ? `, ${esc(t.company)}` : ''}</figcaption>
    </figure>`).join('');
  return `
<section class="section proof" id="proof" aria-labelledby="proof-title">
  <div class="container">
    <div class="proof-card reveal">
      <p class="eyebrow">${esc(p.eyebrow)}</p>
      <h2 class="h2" id="proof-title">${esc(p.title)}</h2>
      <p class="lead">${esc(p.text)}</p>
      <dl class="proof-stats">
        ${p.stats.map((s) => `<div><dt class="sr-only">${esc(s.label)}</dt><dd><span class="proof-val">${esc(s.value)}</span><span class="proof-lbl" aria-hidden="true">${esc(s.label)}</span></dd></div>`).join('')}
      </dl>
    </div>
    ${quotes ? `<div class="quotes">${quotes}</div>` : ''}
  </div>
</section>`;
}
