/* Shared helpers for section templates (run at build time, in Node). */
export { icon, wordmark } from '../js/icons.js';

/** Escape text for safe HTML output. */
export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Which service sends the demo form: Web3Forms when a key is set, FormSubmit otherwise. */
export function formService(cfg) {
  const key = (cfg.contact.form.web3formsKey || '').trim();
  return key
    ? { web3forms: true, name: 'Web3Forms', action: 'https://api.web3forms.com/submit' }
    : { web3forms: false, name: 'FormSubmit', action: `https://formsubmit.co/ajax/${cfg.contact.email}` };
}
