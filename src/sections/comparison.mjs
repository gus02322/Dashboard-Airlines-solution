import { esc } from './_helpers.mjs';
import head from './_head.mjs';

/** 8. Comparison table. Factual, no brand named. */
export default function comparison(cfg) {
  const c = cfg.comparison;
  const hi = c.columns.indexOf('OpsRamp');
  return `
<section class="section compare" id="compare" aria-labelledby="compare-title">
  <div class="container">
    ${head({ eyebrow: c.eyebrow, title: c.title, id: 'compare-title' })}
    <div class="table-wrap reveal">
      <table class="cmp">
        <caption class="sr-only">${esc(c.title)}</caption>
        <thead><tr><td></td>${c.columns.map((col, i) => `<th scope="col"${i === hi ? ' class="is-hi"' : ''}>${esc(col)}</th>`).join('')}</tr></thead>
        <tbody>
          ${c.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th>${r.values.map((v, i) => `<td data-label="${esc(c.columns[i])}"${i === hi ? ' class="is-hi"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</section>`;
}
