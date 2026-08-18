import { chromium } from '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/node_modules/playwright/index.mjs';
const OUT = '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/shots';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const theme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(t => { localStorage.setItem('theme', t); }, theme);
  await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/brand-${theme}-onboard.png` });
  await p.fill('input[placeholder*="اسمك"]', 'محمد');
  await p.click('button:has-text("متابعة")'); await p.waitForTimeout(700);
  await p.click('button:has-text("١٠ كلمات")'); await p.waitForTimeout(2200);
  await p.screenshot({ path: `${OUT}/brand-${theme}-dash.png` });
  await ctx.close();
  console.log(theme, 'captured');
}
await b.close();
