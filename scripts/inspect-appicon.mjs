import { chromium } from '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/node_modules/playwright/index.mjs';
import fs from 'node:fs';
// re-render the ORIGINAL uncropped page to see what app-icon.pdf actually contains
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport:{width:900,height:420} });
const s = fs.readFileSync('public/brand/app-icon.svg','utf8')
  .replace(/viewBox="[^"]*"/,'viewBox="0 0 612 792"');
await p.setContent(`<body style="margin:0;background:#888"><div style="width:400px">${s}</div></body>`);
await p.waitForTimeout(300);
await p.screenshot({ path:'/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/shots/appicon-raw.png' });
await b.close(); console.log('done');
