import { esc, icon } from './_helpers.mjs';

/** 13. Footer: contact, LinkedIn, legal. */
export default function footer(cfg, { root = '' } = {}) {
  const c = cfg.contact;
  return `
<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <a class="nav-logo" href="${root || './'}"><span class="logo-mark" aria-hidden="true"></span><span>${esc(cfg.site.name.toUpperCase())}</span></a>
      <p>${esc(cfg.footer.tagline)}</p>
    </div>
    <ul class="footer-links">
      <li><a href="mailto:${esc(c.email)}">${icon('mail')}<span>${esc(c.email)}</span></a></li>
      <li><a href="${esc(c.linkedin)}" rel="noopener" target="_blank">${icon('linkedin')}<span>LinkedIn</span></a></li>
      <li><a href="${root}legal/">Legal notice</a></li>
    </ul>
  </div>
  <div class="container footer-legal">
    <p>© ${cfg.site.year} ${esc(cfg.site.name)}. ${esc(cfg.footer.legal)}</p>
  </div>
</footer>`;
}
