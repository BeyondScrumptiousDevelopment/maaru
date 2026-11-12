/**
 * Astro content-layer loader for Sanity. It maps each Sanity document onto exactly the
 * same shape as the Markdown entries (same fields, same `body` + rendered HTML), so every
 * page, card and the archive work unchanged whichever source is active.
 */
import type { Loader } from 'astro/loaders';
import { createClient } from '@sanity/client';
import { portableTextToMarkdown } from '@portabletext/markdown';
import { projectId, dataset, apiVersion, apiHost } from './env';

type Img = { url?: string; w?: number; h?: number; alt?: string; caption?: string } | null | undefined;

const IMG = `{ "url": asset->url, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height, alt, caption }`;
const QUERY = `*[_type == $type && defined(slug.current) && !(_id in path("drafts.**"))]{
  ..., "slug": slug.current,
  "image": image${IMG},
  "gallery": gallery[]${IMG},
  "video": video{ url, caption, "poster": poster${IMG} },
  "body": body[]{ ..., _type == "image" => { "_type": "image", "_key": _key, "src": asset->url, alt } }
}`;

const remote = (i: Img) => (i?.url && i.w && i.h ? { src: i.url, width: i.w, height: i.h } : undefined);
const clean = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)) as T;

export function toMarkdown(blocks: unknown[] | null | undefined): string {
  if (!Array.isArray(blocks) || !blocks.length) return '';
  return portableTextToMarkdown(blocks as never, {
    types: {
      image: ({ value }: { value: { src?: string; alt?: string } }) => (value.src ? `![${(value.alt ?? '').replace(/[[\]]/g, '')}](${value.src}?w=1600&auto=format)` : ''),
      code: ({ value }: { value: { code?: string; language?: string } }) => '```' + (value.language && value.language !== 'text' ? value.language : '') + '\n' + (value.code ?? '') + '\n```',
    },
  } as never).trim();
}

/** Sanity document → the site's entry data (same field names as the Markdown frontmatter). */
export function mapDoc(doc: Record<string, any>) {
  const data: Record<string, unknown> = clean({
    title: doc.title,
    date: doc.date,
    updated: doc.updated,
    description: doc.description,
    image: remote(doc.image),
    imageAlt: doc.image?.alt,
    gallery: (doc.gallery ?? []).filter((g: Img) => remote(g)).map((g: Img) => clean({ src: remote(g), alt: g?.alt ?? '', caption: g?.caption })),
    video: doc.video?.url ? clean({ url: doc.video.url, caption: doc.video.caption, poster: remote(doc.video.poster) }) : undefined,
    tags: doc.tags ?? [],
    location: doc.location?.name ? clean({ name: doc.location.name, country: doc.location.country, lat: doc.location.lat, lng: doc.location.lng }) : undefined,
    featured: !!doc.featured,
    draft: false,
    links: (doc.links ?? []).map((l: any) => ({ label: l.label, url: l.url })),
    // section-specific
    kind: doc.kind,
    format: doc.format,
    roll: doc.roll,
    catalogue: doc.catalogue,
    mood: doc.mood,
    tracklist: doc.tracklist?.map((t: any) => clean({ side: t.side, artist: t.artist, title: t.title })),
    embeds: doc.embeds?.map((e: any) => ({ provider: e.provider, url: e.url })),
    dateEnd: doc.dateEnd,
    remember: doc.remember,
    status: doc.status,
    version: doc.version,
    lastTouched: doc.lastTouched,
    next: doc.next,
    history: doc.history?.map((h: any) => ({ version: h.version, date: h.date, note: h.note })),
  });
  return { id: String(doc.slug), data, body: toMarkdown(doc.body) };
}

export function sanityLoader(type: string): Loader {
  return {
    name: `sanity:${type}`,
    load: async ({ store, parseData, renderMarkdown, generateDigest, logger }) => {
      const client = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: 'published', ...(apiHost ? { apiHost, useProjectHostname: false } : {}) });
      const docs: Record<string, any>[] = await client.fetch(QUERY, { type });
      store.clear();
      const seen = new Set<string>();
      for (const doc of docs) {
        const { id, data, body } = mapDoc(doc);
        if (seen.has(id)) { logger.warn(`Two ${type} documents use the URL "${id}" — skipping ${doc._id}. Change one slug in the studio.`); continue; }
        seen.add(id);
        const parsed = await parseData({ id, data });
        store.set({ id, data: parsed, body, rendered: await renderMarkdown(body), digest: generateDigest({ rev: doc._rev ?? '', id }) });
      }
      logger.info(`${docs.length} ${type} document(s) from Sanity`);
    },
  };
}
