#!/usr/bin/env node
/* ============================================================
   Static site build (zero dependencies)

   node build.mjs           -> writes the site to ./dist

   Reads config.js, renders every section to static HTML (good for
   SEO, social previews and zero layout shift), bundles the CSS
   into one file and copies JS, fonts and images.
   ============================================================ */

import { rm, mkdir, readFile, writeFile, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');

// Cache-bust config on repeated runs (watch scripts)
const cfg = (await import(pathToFileURL(join(ROOT, 'config.js')).href + '?t=' + Date.now())).default;
const layout = (await import('./src/layout.mjs')).default;
const S = {};
for (const f of await readdir(join(SRC, 'sections'))) {
  if (f.endsWith('.mjs') && !f.startsWith('_')) S[f.replace('.mjs', '').replace(/-(\w)/g, (_, c) => c.toUpperCase())] = (await import(`./src/sections/${f}`)).default;
}

/* ---------- Clean output ---------- */
await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, 'assets'), { recursive: true });

/* ---------- CSS: one file, in cascade order ---------- */
const cssOrder = ['tokens.css', 'base.css', 'sections.css', 'dashboard.css'];
let css = '';
for (const f of cssOrder) {
  const p = join(SRC, 'css', f);
  if (existsSync(p)) css += `/* ${f} */\n` + (await readFile(p, 'utf8')) + '\n';
}
// Light minification: strip comments and collapse whitespace
css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim();
await writeFile(join(OUT, 'assets', 'site.css'), css);

/* ---------- Static assets ---------- */
await cp(join(SRC, 'js'), join(OUT, 'assets', 'js'), { recursive: true });
await cp(join(SRC, 'fonts'), join(OUT, 'assets', 'fonts'), { recursive: true });
await cp(join(SRC, 'static'), OUT, { recursive: true });
if (existsSync(join(ROOT, 'share'))) await cp(join(ROOT, 'share'), join(OUT, 'share'), { recursive: true });

/* Browser-side config: only what scripts need (never secrets). */
const clientCfg = `<script id="site-config" type="application/json">${JSON.stringify({
  name: cfg.site.name,
  email: cfg.contact.email,
  formProvider: cfg.contact.formProvider,
  formspreeEndpoint: cfg.contact.formspreeEndpoint,
  cta: { success: cfg.cta.success, error: cfg.cta.error },
  roi: cfg.roi,
  copilot: { questions: cfg.copilot?.questions || [] },
}).replace(/</g, '\\u003c')}</script>`;

/* ---------- Pages ---------- */
async function page(path, html) {
  const file = join(OUT, path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

// Landing page: sections render in this order. A section module that
// does not exist yet is simply skipped.
const order = ['hero', 'proofStrip', 'problem', 'demo', 'liveSlots', 'configPanel', 'copilot', 'privacy', 'features', 'howItWorks', 'roi', 'comparison', 'pricing', 'faq', 'contact'];
const mainHtml = order.filter((k) => S[k]).map((k) => S[k](cfg)).join('\n');
await page('', layout(cfg, {
  path: '',
  title: cfg.site.title,
  description: cfg.site.description,
  extraHead: clientCfg,
  body: `${S.nav(cfg)}\n<main id="main">${mainHtml}</main>\n${S.footer(cfg)}`,
}));

// /demo: full-screen, shareable demo only
await page('demo', layout(cfg, {
  path: 'demo/',
  root: '../',
  title: cfg.demoPage.title,
  description: cfg.demoPage.description,
  bodyClass: 'page-demo',
  extraHead: clientCfg,
  body: `
<header class="demo-bar">
  <a class="nav-logo" href="../" aria-label="${cfg.site.name} home">${(await import('./src/js/icons.js')).wordmark(cfg.site.name)}</a>
  <p class="demo-bar-note">Live demo · sample data</p>
  <div class="demo-bar-actions">
    <button type="button" class="link-btn" data-copy-link="" aria-label="Copy link to this demo">${(await import('./src/js/icons.js')).icon('link')}<span>Copy link</span></button>
    <a class="btn btn--primary btn--sm" href="../#contact">${cfg.navCta}</a>
  </div>
</header>
<main id="main" class="demo-page">
  <h1 class="sr-only">${cfg.demoPage.title}</h1>
  <div class="db-host" data-dashboard data-eager data-start="10:40"></div>
</main>`,
}));

// /legal: basic legal notice
await page('legal', layout(cfg, {
  path: 'legal/',
  root: '../',
  title: `Legal notice | ${cfg.site.name}`,
  description: `Legal notice and privacy information for ${cfg.site.name}.`,
  body: `${S.nav(cfg, { root: '../', home: false })}
<main id="main" class="section legal"><div class="container legal-inner">
  <h1 class="h2">Legal notice</h1>
  <h2 class="h3">Publisher</h2>
  <p>${cfg.site.name}. Contact: <a href="mailto:${cfg.contact.email}">${cfg.contact.email}</a>.</p>
  <h2 class="h3">Hosting</h2>
  <p>This website is a static site served by its hosting provider (for example Netlify or GitHub Pages).</p>
  <h2 class="h3">Personal data</h2>
  <p>The demo request form collects your name, work email, company, operation size and message, only to answer your request. The data is not sold or shared for marketing. Ask for access or deletion at any time by email.</p>
  <h2 class="h3">Cookies</h2>
  <p>This website does not use tracking cookies. The interactive demo runs entirely in your browser and stores nothing.</p>
  <h2 class="h3">Trademarks</h2>
  <p>${cfg.footer.legal}</p>
</div></main>
${S.footer(cfg, { root: '../' })}`,
}));

// /privacy: security & privacy details. Placeholder until each point is
// confirmed; kept out of search engines (noindex) until then.
const todo = (t) => `<span class="todo">To complete: ${t}</span>`;
await page('privacy', layout(cfg, {
  path: 'privacy/',
  root: '../',
  noindex: true,
  title: `Security & privacy | ${cfg.site.name}`,
  description: `How ${cfg.site.name} isolates, protects and handles your operational data.`,
  body: `${S.nav(cfg, { root: '../', home: false })}
<main id="main" class="section legal"><div class="container legal-inner">
  <p class="eyebrow">${cfg.privacy.eyebrow}</p>
  <h1 class="h2">Security & privacy</h1>
  <p class="lead">${cfg.privacy.text}</p>
  ${cfg.privacy.items.map((it) => `<h2 class="h3">${it.title}</h2><p>${it.text}</p>`).join('\n  ')}
  <h2 class="h3">What data ${cfg.site.name} handles</h2>
  <p>Operational schedule data: flights, airlines, times, meal types and the timing rules you set. No passenger data is needed.</p>
  <h2 class="h3">Live flight tracking</h2>
  <p>Live estimated ETA and ETD come from live aircraft tracking (ADS-B). They are estimates based on the real position of the aircraft, not official airline schedules.</p>
  <h2 class="h3">AI assistants (MCP)</h2>
  <p>When you connect your own AI assistant through MCP, it reads your board data with the access you grant. Your AI provider's own terms apply to that assistant. ${cfg.site.name} does not use your data to train AI models.</p>
  <h2 class="h3">Hosting and storage</h2>
  ${todo('hosting provider, data region, backup policy.')}
  <h2 class="h3">Retention</h2>
  ${todo('how long data is kept after a contract ends.')}
  <h2 class="h3">Subprocessors</h2>
  ${todo('list of third-party services that process customer data.')}
  <h2 class="h3">Contact</h2>
  <p>Questions, export or deletion requests: <a href="mailto:${cfg.contact.email}">${cfg.contact.email}</a>.</p>
</div></main>
${S.footer(cfg, { root: '../' })}`,
}));

/* ---------- SEO files ---------- */
const today = new Date().toISOString().slice(0, 10);
await writeFile(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', 'demo/', 'legal/'].map((p) => `  <url><loc>${cfg.site.url}/${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
await writeFile(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${cfg.site.url}/sitemap.xml\n`);

/* ---------- GitHub Pages copy ----------
   GitHub Pages can serve a branch's /docs folder directly, so the built
   site is mirrored there (commit it). Netlify keeps using ./dist. */
const DOCS = join(ROOT, 'docs');
await rm(DOCS, { recursive: true, force: true });
await cp(OUT, DOCS, { recursive: true });
await writeFile(join(DOCS, '.nojekyll'), '');

/* Safety net: if GitHub Pages is set to serve the repository root instead
   of /docs, it would show this README. A root index.html sends visitors
   (and link previews) to the real site in /docs, keeping any #anchor. */
await writeFile(join(ROOT, 'index.html'), `<!doctype html>
<html lang="${cfg.site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${cfg.site.title}</title>
<meta name="description" content="${cfg.site.description}">
<meta property="og:title" content="${cfg.site.title}">
<meta property="og:description" content="${cfg.site.description}">
<meta property="og:image" content="${cfg.site.url}/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=docs/">
<script>location.replace('docs/' + location.hash);</script>
<style>body{background:#13161e;color:#d8dce8;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0}a{color:#00d4ff}</style>
</head>
<body><p>Opening ${cfg.site.name}… <a href="docs/">continue</a></p></body>
</html>
`);

console.log(`Built ${Object.keys(S).length} sections -> ${OUT} (and ./docs for GitHub Pages)`);
