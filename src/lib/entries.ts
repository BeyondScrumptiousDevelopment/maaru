import { getCollection, type CollectionEntry } from 'astro:content';
import { excerpt, plain, readingTime, slugify } from './text';

export const SECTIONS = ['journal', 'visuals', 'frequencies', 'elsewhere', 'experiments'] as const;
export type Section = (typeof SECTIONS)[number];
export type AnyEntry = { [K in Section]: CollectionEntry<K> }[Section];

export const SECTION_META: Record<Section, { label: string; n: string; line: string; singular: string }> = {
  journal: { label: 'Journal', n: '01', line: 'Writing, notes, things noticed on the way somewhere else.', singular: 'Journal' },
  visuals: { label: 'Visuals', n: '02', line: 'Photographs and moving pictures, in rolls and sequences.', singular: 'Visual' },
  frequencies: { label: 'Frequencies', n: '03', line: 'Records, mixes and listening notes. After hours.', singular: 'Frequency' },
  elsewhere: { label: 'Elsewhere', n: '04', line: 'Places, kept as postcards and fragments.', singular: 'Elsewhere' },
  experiments: { label: 'Experiments', n: '05', line: 'Things made, half-made and abandoned on purpose.', singular: 'Experiment' },
};

const visible = (e: { data: { draft: boolean } }) => (import.meta.env.PROD ? !e.data.draft : true);
const byDateDesc = (a: AnyEntry, b: AnyEntry) => b.data.date.getTime() - a.data.date.getTime();

export async function getSection<K extends Section>(section: K): Promise<CollectionEntry<K>[]> {
  const all = (await getCollection(section, visible as never)) as CollectionEntry<K>[];
  return all.sort(byDateDesc as never);
}

export async function getAll(): Promise<AnyEntry[]> {
  const lists = await Promise.all(SECTIONS.map((s) => getSection(s)));
  return (lists.flat() as AnyEntry[]).sort(byDateDesc);
}

export async function getCounts(): Promise<Record<Section, number>> {
  const lists = await Promise.all(SECTIONS.map((s) => getSection(s)));
  return Object.fromEntries(SECTIONS.map((s, i) => [s, lists[i].length])) as Record<Section, number>;
}

export const urlFor = (e: AnyEntry) => `/${e.collection}/${e.id}/`;
export const tagsOf = (e: AnyEntry) => [...new Set(e.data.tags.map(slugify))].filter(Boolean);
export const excerptOf = (e: AnyEntry, max = 180) => e.data.description || excerpt(e.body ?? '', max);
export const minutesOf = (e: AnyEntry) => readingTime(e.body ?? '');
export const textOf = (e: AnyEntry) => plain(e.body ?? '');

/** Main image for any entry: image → gallery[0] → video poster. */
export function coverOf(e: AnyEntry) {
  const d = e.data;
  if (d.image) return { src: d.image, alt: d.imageAlt ?? '' };
  if (d.gallery[0]) return { src: d.gallery[0].src, alt: d.gallery[0].alt };
  if (d.video?.poster) return { src: d.video.poster, alt: d.video.caption ?? d.title };
  return undefined;
}

/** Previous / next within a section list (sorted newest first). */
export function neighbours<T extends { id: string }>(list: T[], id: string) {
  const i = list.findIndex((x) => x.id === id);
  return { newer: i > 0 ? list[i - 1] : undefined, older: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}

/** A label for the type line on cards and in the archive, e.g. "JOURNAL — NOTE". */
export function typeLabel(e: AnyEntry) {
  const s = SECTION_META[e.collection].singular.toUpperCase();
  switch (e.collection) {
    case 'journal': return `${s} — ${e.data.kind.toUpperCase()}`;
    case 'visuals': return `${s} — ${e.data.format.toUpperCase()}`;
    case 'frequencies': return `${s} — ${e.data.catalogue}`;
    case 'elsewhere': return `${s} — ${(e.data.location?.name ?? '').toUpperCase()}`;
    case 'experiments': return `${s} — ${e.data.status.replace('-', ' ').toUpperCase()}`;
  }
}
