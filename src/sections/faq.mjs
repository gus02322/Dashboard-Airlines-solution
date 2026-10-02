import { esc } from './_helpers.mjs';
import head from './_head.mjs';

/** 11. FAQ: native <details> accordion (keyboard and screen-reader friendly). */
export default function faq(cfg) {
  const f = cfg.faq;
  return `
<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="container faq-grid">
    ${head({ eyebrow: f.eyebrow, title: f.title, id: 'faq-title' })}
    <div class="faq-list reveal">
      ${f.items.map((it) => `<details class="faq-item">
        <summary><span>${esc(it.q)}</span><span class="faq-plus" aria-hidden="true"></span></summary>
        <div class="faq-a"><p>${esc(it.a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`;
}
