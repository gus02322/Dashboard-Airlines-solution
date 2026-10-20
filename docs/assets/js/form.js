/* ============================================================
   Demo request form
   - inline validation with accessible error messages
   - sends the form as JSON (FormSubmit or Web3Forms, see config.js),
     without leaving the page or opening an email app
   - clear error message with the contact address if sending fails
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('[name]')].filter((el) => el.name in rules);
    const ok = fields.map(check).every(Boolean);
    if (!ok) {
      msg.textContent = 'Please check the highlighted fields.';
      fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }
    if (form.elements.botcheck?.checked) return; // honeypot: silently drop bots

    const payload = Object.fromEntries(new FormData(form));
    delete payload.botcheck;
    btn.disabled = true;
    msg.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      // Web3Forms answers success: true, FormSubmit answers success: "true"
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || 'HTTP ' + res.status);
      msg.textContent = '';
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (err) {
      msg.textContent = cfg.cta.error;
    } finally {
      btn.disabled = false;
    }
  });
}
