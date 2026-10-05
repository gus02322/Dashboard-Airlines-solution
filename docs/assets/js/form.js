/* ============================================================
   Demo request form
   - inline validation with accessible error messages
   - sends to Netlify Forms or Formspree (config.js)
   - if sending fails, opens the visitor's email app with the
     message pre-filled, so no lead is ever lost
   ============================================================ */

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton(mail)?|gmx|yandex)\./i;

export function initForm(form, cfg) {
  const msg = form.querySelector('.form-msg');
  const done = form.parentElement.querySelector('.form-done');
  const btn = form.querySelector('.form-submit');

  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : ''),
    company: (v) => (v.trim().length < 2 ? 'Please enter your company.' : ''),
    size: (v) => (!v ? 'Please choose your operation size.' : ''),
  };

  function check(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const err = rule(input.value);
    const box = form.querySelector(`#${input.id}-err`);
    input.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (err) input.setAttribute('aria-describedby', box.id); else input.removeAttribute('aria-describedby');
    box.textContent = err;
    // Soft hint, not a blocker: free webmail is accepted
    if (!err && input.name === 'email' && FREE_MAIL.test(input.value)) box.textContent = 'Tip: a work email helps us prepare a relevant demo.';
    box.classList.toggle('is-hint', !err && !!box.textContent);
    return !err;
  }

  form.addEventListener('blur', (e) => { if (e.target.name in rules && e.target.value) check(e.target); }, true);
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') check(e.target); });

  // Pricing buttons pre-select the plan in the hidden field
  document.querySelectorAll('[data-plan]').forEach((a) => a.addEventListener('click', () => { form.elements.plan.value = a.dataset.plan; }));

  function mailto(data) {
    const body = ['name', 'email', 'company', 'size', 'plan', 'message'].filter((k) => data.get(k)).map((k) => `${k[0].toUpperCase() + k.slice(1)}: ${data.get(k)}`).join('\n');
    return `mailto:${cfg.email}?subject=${encodeURIComponent((cfg.name || '') + ' demo request: ' + (data.get('company') || ''))}&body=${encodeURIComponent(body)}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('[name]')].filter((el) => el.name in rules);
    const ok = fields.map(check).every(Boolean);
    if (!ok) {
      msg.textContent = 'Please check the highlighted fields.';
      fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }
    const data = new FormData(form);
    if (data.get('company_website')) return; // honeypot: silently drop bots
    // No form backend configured: hand over to the visitor's email app
    if (cfg.formProvider === 'mailto') {
      msg.textContent = 'Your email app is opening with your request ready to send.';
      window.location.href = mailto(data);
      return;
    }
    btn.disabled = true;
    msg.textContent = 'Sending…';
    try {
      let res;
      if (cfg.formProvider === 'formspree') {
        if (/YOUR_FORM_ID/.test(cfg.formspreeEndpoint)) throw new Error('Formspree not configured');
        res = await fetch(cfg.formspreeEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      } else {
        res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() });
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (err) {
      msg.textContent = cfg.cta.error;
      window.location.href = mailto(data);
    } finally {
      btn.disabled = false;
    }
  });
}
