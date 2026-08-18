import { chromium } from '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/node_modules/playwright/index.mjs';
import fs from 'node:fs';

// Measure the *visible pixel* bounds (getBBox ignores clip paths and lies).
const PAGE = [0, 0, 612, 792];
const FILES = ['logo-icon','logo-icon-white','app-icon','logo-horizontal-dark-bg'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();

for (const name of FILES) {
  const p = `public/brand/${name}.svg`;
  const svg = fs.readFileSync(p, 'utf8');
  const full = svg.replace(/viewBox="[^"]*"/, `viewBox="${PAGE.join(' ')}"`);

  const bb = await page.evaluate(async ({ svgText, W, H }) => {
    const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = url; });
    const S = 1;
    const c = document.createElement('canvas');
    c.width = W * S; c.height = H * S;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    const W4 = c.width * 4;
    for (let y = 0; y < c.height; y++) {
      const row = y * W4;
      for (let i = row + 3, x = 0; x < c.width; i += 4, x++) {
        if (d[i] > 8) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    return { x: x0 / S, y: y0 / S, w: (x1 - x0 + 1) / S, h: (y1 - y0 + 1) / S };
  }, { svgText: full, W: PAGE[2], H: PAGE[3] });

  const pad = Math.max(bb.w, bb.h) * 0.02;
  const vb = [bb.x - pad, bb.y - pad, bb.w + pad*2, bb.h + pad*2].map(n => +n.toFixed(2));
  const out = svg.replace(/viewBox="[^"]*"/, `viewBox="${vb.join(' ')}"`);
  fs.writeFileSync(p, out);
  console.log(`${name.padEnd(28)} visible ${bb.w.toFixed(0)}×${bb.h.toFixed(0)} at (${bb.x.toFixed(0)},${bb.y.toFixed(0)})  ratio ${(vb[2]/vb[3]).toFixed(2)}`);
}
await browser.close();
