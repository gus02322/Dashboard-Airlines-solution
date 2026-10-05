import { esc, icon } from './_helpers.mjs';
import head from './_head.mjs';

/** How it works: three steps. */
export default function howItWorks(cfg) {
  const h = cfg.howItWorks;
  const icons = ['box', 'sliders', 'tv'];
  return `
<section class="section how" id="how" aria-labelledby="how-title">
  <div class="container">
    ${head({ eyebrow: h.eyebrow, title: h.title, id: 'how-title' })}
    <ol class="steps">
      ${h.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 110}ms">
        <div class="step-top"><span class="step-num mono">0${i + 1}</span><span class="step-ic">${icon(icons[i])}</span></div>
        <h3 class="h3">${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
}
