import { esc } from './_helpers.mjs';
import head from './_head.mjs';

/** 7. ROI calculator. Every assumption is visible and editable. */
export default function roi(cfg) {
  const r = cfg.roi, d = r.defaults;
  const field = (id, label, value, min, max, step, unit = '', hint = '') => `
    <div class="roi-field">
      <div class="roi-label-row"><label for="roi-${id}">${esc(label)}</label><output class="mono" for="roi-${id}" data-out="${id}">${value}${unit}</output></div>
      <input type="range" id="roi-${id}" name="${id}" min="${min}" max="${max}" step="${step}" value="${value}" data-roi="${id}">
      ${hint ? `<p class="roi-hint">${esc(hint)}</p>` : ''}
    </div>`;
  return `
<section class="section roi" id="roi" aria-labelledby="roi-title">
  <div class="container">
    ${head({ eyebrow: r.eyebrow, title: r.title, lead: r.text, id: 'roi-title' })}
    <div class="roi-card reveal" data-roi-root>
      <form class="roi-inputs" onsubmit="return false" aria-label="Your assumptions">
        ${field('flights', 'Flights per day', d.flightsPerDay, 5, 200, 1)}
        ${field('incidents', 'Late or early trucks, missed sealings per month', d.incidentsPerMonth, 0, 60, 1)}
        <div class="roi-field">
          <div class="roi-label-row"><label for="roi-cost">Average cost of one incident</label></div>
          <div class="roi-money"><span class="mono">${esc(r.currency)}</span><input type="number" id="roi-cost" name="cost" min="0" max="100000" step="50" value="${d.costPerIncident}" inputmode="numeric" data-roi="cost"></div>
          <p class="roi-hint">Delay penalties, re-loading, overtime, wasted meals. Use your own figure.</p>
        </div>
        ${field('pct', 'Share a live board could help avoid (assumption)', d.avoidablePct, 0, 100, 5, '%', 'Start low. 25% means one incident in four.')}
      </form>
      <div class="roi-result" aria-live="polite">
        <p class="roi-res-lbl">Estimated saving</p>
        <p class="roi-big mono"><span data-res="month"></span><span class="roi-per"> / month</span></p>
        <p class="roi-year mono"><span data-res="year"></span> / year</p>
        <p class="roi-formula mono" data-res="formula"></p>
        <p class="roi-rate" data-res="rate"></p>
        <p class="roi-disclaimer">${esc(r.disclaimer)}</p>
      </div>
    </div>
  </div>
</section>`;
}
