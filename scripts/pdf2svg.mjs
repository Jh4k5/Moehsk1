import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import * as mupdf from 'mupdf';
import fs from 'node:fs';
import path from 'node:path';

const U = '/root/.claude/uploads/5ce07edf-136c-5661-83c0-79701346b341';
const OUT = 'public/brand';
const MAP = {
  'edea3910-logoicon.pdf':             'logo-icon.svg',
  'ddd2ed9c-logoiconwhite.pdf':        'logo-icon-white.svg',
  'dacccede-appicon.pdf':              'app-icon.svg',
  '5c18aad5-logohorizontaldarkbg.pdf': 'logo-horizontal-dark-bg.svg',
  'b6afbe82-logoicontraced.pdf':       'logo-icon-traced.svg',
};

fs.mkdirSync(OUT, { recursive: true });
const digests = {};

for (const [src, dst] of Object.entries(MAP)) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(path.join(U, src)), 'application/pdf');
  const page = doc.loadPage(0);

  // real ink bounds, not the letter-size page box
  const list = page.toDisplayList();
  const b = list.getBounds();                       // [x0,y0,x1,y1]
  const pad = 2;
  const crop = [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];

  const buf = new mupdf.Buffer();
  const w = new mupdf.DocumentWriter(buf, 'svg', 'text=path');
  const dev = w.beginPage(crop);
  list.run(dev, mupdf.Matrix.identity);
  w.endPage();
  w.close();

  let svg = buf.asString();
  // mupdf writes width/height in pt; make it fluid and correctly framed
  const wpt = (crop[2] - crop[0]).toFixed(2), hpt = (crop[3] - crop[1]).toFixed(2);
  svg = svg.replace(/<svg([^>]*)>/, (m, attrs) => {
    const cleaned = attrs
      .replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '')
      .replace(/\sviewBox="[^"]*"/, '');
    return `<svg${cleaned} viewBox="0 0 ${wpt} ${hpt}" width="${wpt}" height="${hpt}" role="img">`;
  });

  fs.writeFileSync(path.join(OUT, dst), svg);
  digests[dst] = require('node:crypto').createHash('sha1').update(svg).digest('hex').slice(0, 12);
  console.log(`${dst.padEnd(30)} ${String((Buffer.byteLength(svg)/1024).toFixed(1)).padStart(7)} KB  ${wpt}×${hpt}pt  paths:${(svg.match(/<path/g)||[]).length}  raster:${(svg.match(/<image/g)||[]).length}`);
}
