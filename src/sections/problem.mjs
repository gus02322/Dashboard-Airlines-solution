import { esc, icon } from './_helpers.mjs';
import head from './_head.mjs';

/** 2. Problem: three concrete pains, one line each. */
export default function problem(cfg) {
  const p = cfg.problem;
  return `
<section class="section problem" id="problem" aria-labelledby="problem-title">
  <div class="container">
    ${head({ eyebrow: p.eyebrow, title: p.title, id: 'problem-title' })}
    <ol class="problem-list">
      ${p.items.map((it, i) => `<li class="problem-item reveal" style="--d:${i * 90}ms">
        <span class="problem-ic">${icon(it.icon)}</span>
        <div><h3 class="h3">${esc(it.title)}</h3><p>${esc(it.text)}</p></div>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
}
