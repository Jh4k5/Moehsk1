import { chromium } from '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
p.on('response', r => { if (r.status() >= 400) console.log('FAILED', r.status(), r.url().slice(0, 110)); });
p.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0, 300)));
await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
await b.close();
