import { esc, icon } from './_helpers.mjs';

/** 12. Final CTA + demo request form, sent with Web3Forms (form.js posts it as JSON). */
export default function contact(cfg) {
  const c = cfg.cta, k = cfg.contact, f = k.form;
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
      <form class="demo-form" name="demo-request" action="${esc(f.endpoint)}" method="POST" novalidate data-form>
        <input type="hidden" name="access_key" value="${esc(f.accessKey)}">
        <input type="hidden" name="subject" value="${esc(f.subject)}">
        <input type="hidden" name="from_name" value="${esc(f.fromName)}">
        <input type="checkbox" name="botcheck" class="hidden" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
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
