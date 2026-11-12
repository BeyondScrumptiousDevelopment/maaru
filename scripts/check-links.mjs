// Link check: starts from every page in dist/, follows every internal href/src/srcset,
// and requests each one from a running server (default: `npm run preview` on :4321).
//   npm run build && npm run preview   (in one terminal)
//   npm run check:links                (in another)   — or: BASE=https://maaru.me npm run check:links
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = (process.env.BASE || 'http://localhost:4321').replace(/\/$/, '');
const DIST = path.resolve('dist');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = (await walk(DIST)).map((f) => '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/'));
const urls = new Map(); // url -> first page that references it
for (const pg of pages) urls.set(pg, '(page)');
for (const pg of pages) {
  const file = path.join(DIST, pg, pg.endsWith('/') || pg === '/' ? 'index.html' : '');
  const html = await readFile(file.endsWith('.html') ? file : file, 'utf8').catch(() => '');
  const refs = [...html.matchAll(/(?:href|src|poster)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])));
  for (let r of refs) {
    r = r.replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(r)) continue;
    const u = new URL(r, BASE + pg);
    if (!urls.has(u.pathname + u.search)) urls.set(u.pathname + u.search, pg);
  }
}

let bad = 0;
const list = [...urls.entries()];
for (let i = 0; i < list.length; i += 16) {
  await Promise.all(list.slice(i, i + 16).map(async ([u, from]) => {
    const res = await fetch(BASE + u, { redirect: 'follow' }).catch((e) => ({ status: e.message }));
    if (res.status !== 200) { bad++; console.log(`✗ ${res.status}  ${u}   (linked from ${from})`); }
  }));
}
console.log(`${list.length} URLs checked across ${pages.length} pages — ${bad ? `${bad} broken` : 'all 200'}`);
process.exit(bad ? 1 : 0);
