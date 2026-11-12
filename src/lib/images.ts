import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/** An image hosted on Sanity's CDN (cdn.sanity.io), with its pixel size. */
export type RemoteImage = { src: string; width: number; height: number };
/** Any image an entry can have: a local file (Markdown entries) or a Sanity image. */
export type Img = ImageMetadata | RemoteImage;

export const isRemote = (i: Img): boolean => typeof i.src === 'string' && /^https?:\/\//.test(i.src) && !('format' in i);

/** Sanity image-CDN URL: resized, and served as AVIF/WebP to browsers that support them. */
export function cdn(src: string, w: number, opts: { h?: number; crop?: boolean; fm?: string } = {}) {
  const u = new URL(src);
  u.searchParams.set('w', String(Math.round(w)));
  if (opts.h) u.searchParams.set('h', String(Math.round(opts.h)));
  u.searchParams.set('fit', opts.crop ? 'crop' : 'max');
  if (opts.fm) u.searchParams.set('fm', opts.fm); else u.searchParams.set('auto', 'format');
  u.searchParams.set('q', '78');
  return u.href;
}

/** A URL for an image at a given width (used for the lightbox, video posters and link previews). */
export async function imageUrl(i: Img, width: number, opts: { height?: number; format?: 'webp' | 'jpg' } = {}) {
  if (isRemote(i)) return cdn(i.src, Math.min(width, i.width), { h: opts.height, crop: !!opts.height, fm: opts.format });
  const local = i as ImageMetadata;
  const r = await getImage({ src: local, width: Math.min(width, local.width), ...(opts.height ? { height: opts.height, fit: 'cover' as const } : {}), format: opts.format ?? 'webp' });
  return r.src;
}
