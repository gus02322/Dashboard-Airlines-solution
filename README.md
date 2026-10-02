# OpsRamp website

Marketing site and interactive demo for OpsRamp, the live operations board for airline catering.

## Edit the content

All text, prices, links and the contact email live in **`config.js`**. Edit it, then rebuild:

```bash
node build.mjs        # writes the site to ./dist (Node 18+, no npm install needed)
```

Preview locally:

```bash
cd dist && python3 -m http.server 4173   # then open http://localhost:4173
```

## Structure

```
config.js            the only file to edit for content
build.mjs            static build (zero dependencies)
src/layout.mjs       HTML shell: meta, Open Graph, structured data
src/sections/*.mjs   one template per landing section
src/css/             tokens, base, sections, dashboard
src/js/main.js       landing behaviour (nav, reveal, lazy demo)
src/js/hero.js       animated hero timeline
src/js/dashboard/    the interactive demo (data, views, overlays, app)
src/fonts/           self-hosted Barlow Condensed + Share Tech Mono
src/static/          files copied as-is (favicon, social image)
```

Deployment and the personalisation checklist are documented at the end of the project.
