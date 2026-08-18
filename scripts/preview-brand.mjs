import { chromium } from '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const S = f => fs.readFileSync(`public/brand/${f}.svg`, 'utf8');
const cell = (f, label, w) =>
  `<div style="text-align:center"><div style="width:${w}px;height:${w}px;display:grid;place-items:center;margin:0 auto">${S(f)}</div><small style="font-size:11px;opacity:.75">${label}</small></div>`;
const html = `<body style="margin:0;font-family:system-ui">
<div style="background:#F7F4EF;padding:26px;display:flex;gap:30px;align-items:flex-end">
  ${cell('logo-icon','logo-icon 128',128)}
  ${cell('app-icon','app-icon 128',128)}
  ${cell('app-icon','64',64)}
  ${cell('app-icon','32',32)}
  ${cell('app-icon','16 favicon',16)}
  ${cell('logo-icon','logo-icon 32',32)}
</div>
<div style="background:#0C1626;padding:26px;display:flex;gap:30px;align-items:center;color:#F7F4EF">
  ${cell('logo-icon-white','white 128',128)}
  ${cell('app-icon','app-icon 64',64)}
  <div style="text-align:center"><div style="width:360px">${S('logo-horizontal-dark-bg')}</div><small style="font-size:11px;opacity:.75">horizontal-dark-bg</small></div>
</div></body>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1000, height: 400 } });
await p.setContent(html);
await p.waitForTimeout(500);
await p.screenshot({ path: '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/shots/brand-final.png', fullPage: true });
await b.close();
console.log('rendered brand-final.png');
