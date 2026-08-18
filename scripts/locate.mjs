import { chromium } from '/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const svg = fs.readFileSync('public/brand/app-icon.svg','utf8').replace(/viewBox="[^"]*"/,'viewBox="0 0 612 792"');
// 612x792 rendered 1:1, with a 50pt ruler grid so coordinates are readable
const ticks = [];
for (let x=0;x<=612;x+=50) ticks.push(`<div style="position:absolute;left:${x}px;top:0;width:1px;height:792px;background:rgba(255,0,255,.35)"></div><div style="position:absolute;left:${x+2}px;top:2px;font:10px monospace;color:#f0f">${x}</div>`);
for (let y=0;y<=792;y+=50) ticks.push(`<div style="position:absolute;left:0;top:${y}px;height:1px;width:612px;background:rgba(0,255,255,.35)"></div><div style="position:absolute;left:2px;top:${y+2}px;font:10px monospace;color:#0aa">${y}</div>`);
const html=`<body style="margin:0;background:#ddd"><div style="position:relative;width:612px;height:792px">
<div style="position:absolute;inset:0">${svg}</div>${ticks.join('')}</div></body>`;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:620,height:800}});
await p.setContent(html); await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/claude-0/-home-user-Moehsk1/5ce07edf-136c-5661-83c0-79701346b341/scratchpad/shots/appicon-grid.png'});
await b.close(); console.log('grid rendered');
