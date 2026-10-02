import { esc } from './_helpers.mjs';

/** Shared section heading: eyebrow, H2, optional lead. */
export default function head({ eyebrow, title, lead, id, center = false }) {
  return `<div class="section-head${center ? ' section-head--center' : ''} reveal">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h2 class="h2" id="${id}">${esc(title)}</h2>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    </div>`;
}
