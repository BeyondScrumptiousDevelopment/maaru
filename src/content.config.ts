import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro/content/config';
import { sanityEnabled } from './sanity/env';
import { sanityLoader } from './sanity/loader';

/**
 * Content model. One collection per section, all sharing `base`.
 * Adding a post = adding one Markdown file to src/content/<section>/.
 * The filename (without .md) becomes the URL slug unless `slug` is set.
 */
/** A Sanity image: already hosted on cdn.sanity.io, with its dimensions. */
const remoteImage = z.object({ src: z.url(), width: z.number(), height: z.number() });
/** Local image (Markdown) or remote image (Sanity). */
const anyImage = (image: SchemaContext['image']) => z.union([remoteImage, image()]);

const base = ({ image: localImage }: SchemaContext) => {
  const image = () => anyImage(localImage);
  return z.object({
    id: z.string().optional(),
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().max(240).optional(),
    image: image().optional(),
    imageAlt: z.string().optional(),
    gallery: z
      .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
      .default([]),
    video: z
      .object({ url: z.string(), poster: image().optional(), caption: z.string().optional() })
      .optional(),
    tags: z.array(z.string()).default([]),
    location: z
      .object({
        name: z.string(),
        country: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  });
};

const altRequired = (d: { image?: unknown; imageAlt?: string }) => !d.image || !!d.imageAlt?.trim();
const altMsg = { message: 'imageAlt is required when image is set', path: ['imageAlt'] };

// Markdown in src/content/<section>/ — or Sanity, once a project ID is set (src/sanity/env.ts).
const SANITY_TYPE: Record<string, string> = { journal: 'journal', visuals: 'visual', frequencies: 'frequency', elsewhere: 'place', experiments: 'experiment' };
const loader = (dir: string) =>
  sanityEnabled ? sanityLoader(SANITY_TYPE[dir]) : glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: `./src/content/${dir}`,
    generateId: ({ entry, data }) => (data.slug as string) || entry.replace(/\.(md|mdx)$/, ''),
  });

const journal = defineCollection({
  loader: loader('journal'),
  schema: (ctx) =>
    base(ctx)
      .extend({ kind: z.enum(['note', 'essay', 'observation', 'story', 'idea']).default('essay') })
      .refine(altRequired, altMsg),
});

const visuals = defineCollection({
  loader: loader('visuals'),
  schema: (ctx) =>
    base(ctx)
      .extend({
        format: z.enum(['photo', 'video', 'mixed']).default('photo'),
        roll: z.string().optional(),
      })
      .refine(altRequired, altMsg),
});

const frequencies = defineCollection({
  loader: loader('frequencies'),
  schema: (ctx) =>
    base(ctx)
      .extend({
        catalogue: z.string(),
        embeds: z
          .array(
            z.object({
              provider: z.enum(['spotify', 'soundcloud', 'bandcamp', 'youtube', 'mixcloud']),
              url: z.url(),
            }),
          )
          .default([]),
        tracklist: z
          .array(z.object({ side: z.enum(['A', 'B']).optional(), artist: z.string(), title: z.string() }))
          .default([]),
        mood: z.string().optional(),
      })
      .refine(altRequired, altMsg),
});

const elsewhere = defineCollection({
  loader: loader('elsewhere'),
  schema: (ctx) =>
    base(ctx)
      .extend({
        dateEnd: z.coerce.date().optional(),
        remember: z.array(z.string()).default([]),
      })
      .refine((d) => !!d.location, { message: 'elsewhere entries need a location', path: ['location'] })
      .refine(altRequired, altMsg),
});

const experiments = defineCollection({
  loader: loader('experiments'),
  schema: (ctx) =>
    base(ctx)
      .extend({
        status: z.enum(['in-progress', 'paused', 'done', 'abandoned']),
        version: z.string().optional(),
        lastTouched: z.coerce.date().optional(),
        next: z.string().optional(),
        history: z.array(z.object({ version: z.string(), date: z.coerce.date(), note: z.string() })).default([]),
      })
      .refine(altRequired, altMsg),
});

export const collections = { journal, visuals, frequencies, elsewhere, experiments };
