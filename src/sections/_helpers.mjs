/* Shared helpers for section templates (run at build time, in Node). */
export { icon } from '../js/icons.js';

/** Escape text for safe HTML output. */
export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
