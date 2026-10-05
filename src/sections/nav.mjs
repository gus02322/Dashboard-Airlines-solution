import { esc, wordmark } from './_helpers.mjs';

/** Sticky navigation. `root` is the relative path to the site root. */
export default function nav(cfg, { root = '', home = true } = {}) {
  const href = (h) => (home ? h : root + h);
  return `
<header class="nav">
  <div class="container nav-inner">
    <a class="nav-logo" href="${home ? '#top' : root || './'}" aria-label="${esc(cfg.site.name)} home">
      ${wordmark(cfg.site.name)}
    </a>
    <nav class="nav-menu" id="nav-menu" aria-label="Main">
      <ul>
        ${cfg.nav.map((l) => `<li><a href="${href(l.href)}">${esc(l.label)}</a></li>`).join('')}
      </ul>
      <a class="btn btn--primary btn--sm nav-cta-mobile" href="${href('#contact')}">${esc(cfg.navCta)}</a>
    </nav>
    <a class="btn btn--primary btn--sm nav-cta" href="${href('#contact')}">${esc(cfg.navCta)}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
      <span></span><span></span>
    </button>
  </div>
</header>`;
}
