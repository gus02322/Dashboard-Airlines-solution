import { esc } from './_helpers.mjs';

/** Thin strip of real figures right under the hero. */
export default function proofStrip(cfg) {
  return `
<div class="proof-strip" role="list" aria-label="In production today">
  <div class="container proof-strip-inner">
    ${cfg.proofStrip.map((p) => `<div class="ps-item" role="listitem"><span class="ps-val">${esc(p.value)}</span><span class="ps-lbl">${esc(p.label)}</span></div>`).join('')}
  </div>
</div>`;
}
