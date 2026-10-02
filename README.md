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
| Final domain | `site.url` (used for social previews, canonical, sitemap) | GitHub Pages URL |
| Form provider | `contact.formProvider` (`'mailto'`, `'formspree'` or `'netlify'`) | `mailto` |
| Testimonials | `proof.testimonials` (block appears automatically when not empty) | Empty, by design |
| Proof figures | `proofStrip` and `proof.stats` | ~50 users, multi-site, 4 milestones |
| Product name | `site.name` | Check trademark and domain availability for "OpsRamp" before launch |

After changing `site.url` or any visible text used in the images, regenerate the social visuals (section 4).

## 3. Deploy

`node build.mjs` writes the site twice: `dist/` (Netlify) and `docs/` (GitHub Pages). Commit `docs/` after every build.

### Option A: GitHub Pages (current setup, free)

1. Repository **Settings > Pages**.
2. **Source: Deploy from a branch**. Branch: `main` (or the working branch before merging), folder: **`/docs`**. Save.
3. After about a minute the site is live at `https://gus02322.github.io/Dashboard-Airlines-solution/`.
4. The form uses `formProvider: 'mailto'`: it opens the visitor's email app with the request pre-filled. To receive requests without the visitor's email app, create a free form on formspree.io, set `formProvider: 'formspree'` and paste the endpoint in `formspreeEndpoint`, then rebuild and commit `docs/`.

A `404 File not found` on GitHub Pages means the folder is set to `/ (root)` instead of `/docs`, or the branch has no `docs/` folder yet.

### Option B: Netlify (custom domain, built-in forms)

1. On netlify.com: **Add new site > Import an existing project > GitHub**, pick the repository. Netlify reads `netlify.toml` (build `node build.mjs`, publish `dist`). Click **Deploy**.
2. In `config.js`: set `contact.formProvider: 'netlify'` and `site.url` to the Netlify or custom domain, then push.
3. **Forms > Form notifications**: add an email notification to `augustin@de-franssu.com` and send one test request from the live site.

In every mode, if sending fails the form falls back to the visitor's email app, so no request is lost.

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
docs/                built site for GitHub Pages (generated, commit it)
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
