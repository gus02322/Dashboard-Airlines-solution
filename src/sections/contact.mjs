import { esc, icon } from './_helpers.mjs';

/** 12. Final CTA + demo request form (Netlify Forms or Formspree, mailto fallback). */
export default function contact(cfg) {
  const c = cfg.cta, k = cfg.contact;
  const netlify = k.formProvider === 'netlify';
  const action = netlify ? '/' : k.formspreeEndpoint;
  return `
<section class="section contact" id="contact" aria-labelledby="contact-title">
  <div class="container contact-grid">
    <div class="contact-copy reveal">
      <p class="eyebrow">${esc(c.eyebrow)}</p>
      <h2 class="h2" id="contact-title">${esc(c.title)}</h2>
      <p class="lead">${esc(c.text)}</p>
      <p class="contact-direct">Prefer email? <a href="mailto:${esc(k.email)}">${esc(k.email)}</a></p>
    </div>
    <div class="form-card reveal">
      <form class="demo-form" name="demo-request" method="POST" action="${esc(action)}" novalidate data-form
        ${netlify ? 'data-netlify="true" netlify-honeypot="company_website"' : ''}>
        ${netlify ? '<input type="hidden" name="form-name" value="demo-request">' : ''}
        <p class="hp" aria-hidden="true"><label>Leave empty <input name="company_website" tabindex="-1" autocomplete="off"></label></p>
        <div class="field">
          <label for="f-name">Name</label>
          <input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120">
          <p class="field-err" id="f-name-err"></p>
        </div>
        <div class="field">
          <label for="f-email">Work email</label>
          <input id="f-email" name="email" type="email" autocomplete="email" required maxlength="160" inputmode="email">
          <p class="field-err" id="f-email-err"></p>
        </div>
        <div class="field">
          <label for="f-company">Company</label>
          <input id="f-company" name="company" type="text" autocomplete="organization" required maxlength="160">
          <p class="field-err" id="f-company-err"></p>
        </div>
        <div class="field">
          <label for="f-size">Operation size</label>
          <select id="f-size" name="size" required>
            <option value="">Select</option>
            ${c.sizes.map((s) => `<option>${esc(s)}</option>`).join('')}
          </select>
          <p class="field-err" id="f-size-err"></p>
        </div>
        <div class="field field--full">
          <label for="f-msg">Message <span class="opt">(optional)</span></label>
          <textarea id="f-msg" name="message" rows="4" maxlength="2000" placeholder="Number of sites, current tools, what you want to see in the demo"></textarea>
        </div>
        <input type="hidden" name="plan" value="">
        <button class="btn btn--primary form-submit" type="submit">${esc(c.submit)}${icon('arrow')}</button>
        <p class="form-msg" role="status" aria-live="polite"></p>
      </form>
      <div class="form-done" hidden tabindex="-1">
        <span class="form-done-ic">${icon('check')}</span>
        <p class="h3">${esc(c.success)}</p>
      </div>
    </div>
  </div>
</section>`;
}
