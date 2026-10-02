/* ============================================================
   ROI calculator
   saving / month = incidents per month x cost per incident x avoidable share
   Nothing is hidden: the formula is printed under the result.
   ============================================================ */

export function initRoi(root, cfg) {
  const cur = cfg?.currency || '$';
  const get = (k) => root.querySelector(`[data-roi="${k}"]`);
  const out = (k) => root.querySelector(`[data-out="${k}"]`);
  const res = (k) => root.querySelector(`[data-res="${k}"]`);
  const money = (v) => cur + Math.round(v).toLocaleString('en-US');

  function update() {
    const flights = +get('flights').value;
    const incidents = +get('incidents').value;
    const cost = Math.max(0, +get('cost').value || 0);
    const pct = +get('pct').value;
    out('flights').textContent = flights;
    out('incidents').textContent = incidents;
    out('pct').textContent = pct + '%';
    const month = incidents * cost * (pct / 100);
    res('month').textContent = money(month);
    res('year').textContent = money(month * 12);
    res('formula').textContent = `${incidents} incidents × ${money(cost)} × ${pct}% = ${money(month)}`;
    const per1000 = flights ? (incidents / (flights * 30)) * 1000 : 0;
    res('rate').textContent = `For context: ${per1000.toFixed(1)} incidents per 1,000 flights, about ${(incidents * pct / 100).toFixed(1)} avoided per month.`;
    // Keep the slider fill in sync (visual only)
    root.querySelectorAll('input[type=range]').forEach((r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'));
  }
  root.addEventListener('input', update);
  update();
}
