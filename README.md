# OpsRamp website

Marketing site and interactive demo for OpsRamp, the live operations board for airline catering.

- One page with 13 sections, plus a shareable full-screen demo at `/demo/` and a legal page at `/legal/`.
- Plain HTML, CSS and JavaScript. No framework, no `npm install` needed to build.
- Lighthouse (local test): 98 to 100 on Performance, 100 on Accessibility, Best Practices and SEO.

## 1. Edit the content

Every text, price, link and the contact email live in **`config.js`**. You never need to touch the code to change wording.

```bash
node build.mjs                                 # regenerates the site in ./dist (Node 18+)
python3 -m http.server 4173 -d dist            # preview at http://localhost:4173
```

## 2. Personalisation checklist

| What | Where in `config.js` | Status |
|---|---|---|
| Real prices | `pricing.plans[].price`, then set `pricing.showExampleTag: false` | Example values ($290 / $690) |
| LinkedIn profile | `contact.linkedin` | Placeholder |
| Final domain | `site.url` (used for social previews, canonical, sitemap) | `https://opsramp-demo.netlify.app` |
| Form provider | `contact.formProvider` (`'netlify'` or `'formspree'`) and `contact.formspreeEndpoint` | Netlify |
| Testimonials | `proof.testimonials` (block appears automatically when not empty) | Empty, by design |
| Proof figures | `proofStrip` and `proof.stats` | ~50 users, multi-site, 4 milestones |
| Product name | `site.name` | Check trademark and domain availability for "OpsRamp" before launch |

After changing `site.url` or any visible text used in the images, regenerate the social visuals (section 4).

## 3. Deploy

### Option A: Netlify (recommended, the form works with no setup)

1. Push this repository to GitHub.
2. On netlify.com: **Add new site > Import an existing project > GitHub**, pick the repository.
3. Netlify reads `netlify.toml`: build command `node build.mjs`, publish directory `dist`. Click **Deploy**.
4. **Site configuration > Domain management**: add your domain, then put the same URL in `site.url` and push.
5. **Forms**: after the first deploy, the "demo-request" form appears under *Forms*. Add an email notification to `augustin@de-franssu.com` (*Forms > Form notifications*).
6. Test the form once from the live site.

### Option B: GitHub Pages

1. In `config.js`: set `contact.formProvider: 'formspree'`. Create a free form on formspree.io and paste its endpoint in `contact.formspreeEndpoint`.
2. Set `site.url` to `https://<user>.github.io/<repo>` (or your custom domain).
3. Repository **Settings > Pages > Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` builds and publishes on every push to `main`.

If the form provider is unreachable, the form opens the visitor's email app with the message pre-filled to `contact.email`, so no request is lost.

## 4. Visuals for LinkedIn, emails and decks

Ready-made files (also published at `/share/...` on the site):

| File | Size | Use |
|---|---|---|
| `share/hero.png` | 1200 x 1200 | LinkedIn post (square) |
| `share/timeline.png` | 1600 x 1000 | LinkedIn, slides, emails |
| `share/tv.png` | 1920 x 1080 | TV view, slides |
| `src/static/assets/og-image.png` | 1200 x 630 | Automatic link preview (Open Graph / Twitter) |

To regenerate them after a change (needs Playwright once):

```bash
npm i -D playwright && npx playwright install chromium
node build.mjs && node tools/capture.mjs && node build.mjs
```

Share link for the demo alone: `https://<your-domain>/demo/` (the page has a "Copy link" button).

## Structure

```
config.js            the only file to edit for content
build.mjs            static build (zero dependencies)
netlify.toml         Netlify build + headers
src/layout.mjs       HTML shell: meta, Open Graph, structured data (SoftwareApplication)
src/sections/*.mjs   one template per landing section
src/css/             tokens, base, sections, dashboard
src/js/main.js       landing behaviour (nav, reveal, lazy demo, copy link)
src/js/hero.js       animated hero timeline
src/js/copilot.js    scripted Copilot chat (answers computed from the demo data)
src/js/roi.js        ROI calculator
src/js/form.js       demo request form (validation, Netlify / Formspree, mailto fallback)
src/js/dashboard/    interactive demo: data, views, overlays (sheet, search, alert), app
src/fonts/           self-hosted Barlow Condensed + Share Tech Mono
src/static/          copied as-is (favicon, social image)
share/               LinkedIn visuals
tools/               poster layouts + capture script for the visuals
```

## Demo data

`src/js/dashboard/data.js` holds 28 fictional flights for 12 real airlines at a fictional hub. Times follow the real sequence (ETA, sealing, truck departure, ETD). Nothing in it comes from a real schedule. The demo runs entirely in the browser: no network calls, no storage, no API key.
