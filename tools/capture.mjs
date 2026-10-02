#!/usr/bin/env node
/* ============================================================
   Export the social preview image and the LinkedIn visuals.

     node build.mjs && node tools/capture.mjs

   Needs Playwright once: `npm i -D playwright && npx playwright install chromium`
   (or set PLAYWRIGHT_MODULE to an existing install).
   Writes:
     src/static/assets/og-image.png  1200x630   (link previews)
     share/hero.png                  1200x1200  (LinkedIn)
     share/timeline.png              1600x1000  (LinkedIn, decks)
     share/tv.png                    1920x1080  (TV view)
   ============================================================ */

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

// Minimal static server over the repository root
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://localhost:${server.address().port}/tools/poster.html`;

const jobs = [
  { p: 'og', w: 1200, h: 630, out: 'src/static/assets/og-image.png' },
  { p: 'hero', w: 1200, h: 1200, out: 'share/hero.png' },
  { p: 'timeline', w: 1600, h: 1000, out: 'share/timeline.png' },
  { p: 'tv', w: 1920, h: 1080, out: 'share/tv.png' },
];

const browser = await chromium.launch();
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h }, reducedMotion: 'reduce' });
  await page.goto(`${base}?p=${j.p}`);
  await page.waitForSelector('body[data-ready]');
  await mkdir(join(ROOT, dirname(j.out)), { recursive: true });
  await page.screenshot({ path: join(ROOT, j.out) });
  console.log('wrote', j.out);
  await page.close();
}
await browser.close();
server.close();
