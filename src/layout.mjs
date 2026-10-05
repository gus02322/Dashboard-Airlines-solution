import { esc } from './sections/_helpers.mjs';

/**
 * HTML document shell: meta, social previews, structured data,
 * preloaded fonts, one stylesheet, one module entry point.
 *
 * @param {object} cfg   site config
 * @param {object} page  { path, title, description, body, root, script, bodyClass, extraHead }
 */
export default function layout(cfg, page) {
  const { site } = cfg;
  const root = page.root || '';
  const url = site.url + '/' + (page.path || '');
  const ogImage = site.url + '/assets/og-image.png';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Airline catering operations',
    operatingSystem: 'Web browser',
    description: site.description,
    url: site.url + '/',
    image: ogImage,
      };
  return `<!doctype html>
<html lang="${site.language}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${esc(url)}">${page.noindex ? '\n<meta name="robots" content="noindex">' : ''}
<meta name="theme-color" content="#13161e">
<meta name="color-scheme" content="dark">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${root}assets/fonts/barlow-condensed-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/barlow-condensed-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/share-tech-mono-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/site.css">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} live operations board with the NOW line and colour-coded flight milestones">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${page.extraHead || ''}
<script type="module" src="${root}assets/js/${page.script || 'main.js'}"></script>
</head>
<body class="${page.bodyClass || ''}">
<a class="skip-link" href="#main">Skip to content</a>
${page.body}
</body>
</html>
`;
}
