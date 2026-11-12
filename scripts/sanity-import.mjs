// Copies the Markdown entries in src/content/ (and their images) into Sanity.
//
//   1. In sanity.io/manage → your project → API → Tokens, create a token with "Editor" rights.
//   2. SANITY_WRITE_TOKEN=xxxx npm run sanity:import
//
// Safe to run more than once: each entry gets a fixed id (e.g. journal.sunday-kettles),
// so re-running updates documents instead of duplicating them, and each image is
// uploaded once (Sanity de-duplicates identical files).
//
//   npm run sanity:import -- --dry-run     writes sanity-import.ndjson and uploads nothing
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse as parseYaml } from 'yaml';
import sharp from 'sharp';
import { createClient } from '@sanity/client';
import { markdownToPortableText } from '@portabletext/markdown';

const ROOT = path.resolve('src/content');
const SECTIONS = { journal: 'journal', visuals: 'visual', frequencies: 'frequency', elsewhere: 'place', experiments: 'experiment' };
const dry = process.argv.includes('--dry-run');

// project id / dataset from src/sanity/env.ts or the environment
const envTs = await readFile('src/sanity/env.ts', 'utf8');
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || envTs.match(/PROJECT_ID = '([^']*)'/)?.[1] || '';
const dataset = process.env.PUBLIC_SANITY_DATASET || envTs.match(/DATASET = '([^']*)'/)?.[1] || 'production';
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && (!projectId || !token)) {
  console.error('Set the project ID in src/sanity/env.ts and run with SANITY_WRITE_TOKEN=… (or use --dry-run).');
  process.exit(1);
}
const client = dry ? null : createClient({ projectId, dataset, token, apiVersion: '2026-11-01', useCdn: false });

const key = () => crypto.randomBytes(6).toString('hex');
const uploaded = new Map();

/** Upload (or, in a dry run, describe) one image and return a Sanity image object. */
async function image(fromFile, rel, extra = {}) {
  const abs = path.resolve(path.dirname(fromFile), rel);
  if (!uploaded.has(abs)) {
    const buf = await readFile(abs);
    let ref;
    if (dry) {
      const { width, height, format } = await sharp(buf).metadata();
      const sha = crypto.createHash('sha1').update(buf).digest('hex');
      ref = `image-${sha}-${width}x${height}-${format === 'jpeg' ? 'jpg' : format}`;
    } else {
      const asset = await client.assets.upload('image', buf, { filename: path.basename(abs) });
      ref = asset._id;
      process.stdout.write('.');
    }
    uploaded.set(abs, ref);
  }
  return { _type: 'image', _key: key(), asset: { _type: 'reference', _ref: uploaded.get(abs) }, ...extra, ...(dry ? { _localPath: path.relative(process.cwd(), abs) } : {}) };
}

const date = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : undefined);
const withKeys = (arr = [], fn = (x) => x) => arr.map((x) => ({ _key: key(), ...fn(x) }));

function body(md) {
  if (!md.trim()) return [];
  const blocks = markdownToPortableText(md);
  const fix = (b) => {
    const out = { ...b, _key: b._key || key() };
    if (out._type === 'block') {
      out.markDefs = (out.markDefs || []).map((m) => ({ ...m, _key: m._key || key() }));
      out.children = (out.children || []).map((c) => ({ ...c, _key: c._key || key() }));
      if (out.style && !['normal', 'h2', 'h3', 'blockquote'].includes(out.style)) out.style = out.style === 'h1' ? 'h2' : out.style.startsWith('h') ? 'h3' : 'normal';
    }
    return out;
  };
  return blocks.map(fix);
}

const docs = [];
for (const [dir, type] of Object.entries(SECTIONS)) {
  for (const f of (await readdir(path.join(ROOT, dir))).filter((n) => /\.mdx?$/.test(n) && !n.startsWith('_'))) {
    const file = path.join(ROOT, dir, f);
    const raw = await readFile(file, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    const fm = parseYaml(m[1]) || {};
    const slug = fm.slug || f.replace(/\.mdx?$/, '');
    const doc = {
      _id: `${type}.${slug}`,
      _type: type,
      title: fm.title,
      slug: { _type: 'slug', current: slug },
      date: date(fm.date),
      updated: date(fm.updated),
      description: fm.description,
      image: fm.image ? { ...(await image(file, fm.image, { alt: fm.imageAlt ?? '' })), _key: undefined } : undefined,
      gallery: fm.gallery ? await Promise.all(fm.gallery.map((g) => image(file, g.src, { alt: g.alt, ...(g.caption ? { caption: g.caption } : {}) }))) : undefined,
      video: fm.video ? { url: fm.video.url, caption: fm.video.caption, poster: fm.video.poster ? { ...(await image(file, fm.video.poster, { alt: fm.video.caption ?? fm.title })), _key: undefined } : undefined } : undefined,
      tags: fm.tags,
      location: fm.location,
      links: fm.links ? withKeys(fm.links, (l) => ({ _type: 'link', ...l })) : undefined,
      featured: !!fm.featured,
      body: body(m[2]),
      kind: fm.kind, format: fm.format, roll: fm.roll,
      catalogue: fm.catalogue, mood: fm.mood,
      tracklist: fm.tracklist ? withKeys(fm.tracklist, (t) => ({ _type: 'track', ...t })) : undefined,
      embeds: fm.embeds ? withKeys(fm.embeds, (e) => ({ _type: 'embed', ...e })) : undefined,
      dateEnd: date(fm.dateEnd), remember: fm.remember,
      status: fm.status, version: fm.version, lastTouched: date(fm.lastTouched), next: fm.next,
      history: fm.history ? withKeys(fm.history, (h) => ({ _type: 'version', ...h, date: date(h.date) })) : undefined,
    };
    if (fm.draft) { console.log(`skipping draft: ${dir}/${f}`); continue; }
    docs.push(JSON.parse(JSON.stringify(doc))); // drops undefined
  }
}

if (dry) {
  await writeFile('sanity-import.ndjson', docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
  console.log(`Dry run: ${docs.length} documents and ${uploaded.size} images described in sanity-import.ndjson`);
} else {
  let tx = client.transaction();
  docs.forEach((d) => (tx = tx.createOrReplace(d)));
  await tx.commit();
  console.log(`\nImported ${docs.length} documents and ${uploaded.size} images into ${projectId}/${dataset}.`);
}
