import type { APIRoute } from 'astro';
import { getAll, tagsOf, textOf, SECTION_META } from '../lib/entries';

/** Built at build time: one record per entry, used by /everything for full-text search. */
export const GET: APIRoute = async () => {
  const all = await getAll();
  const docs = all.map((e) => {
    const d = e.data as Record<string, unknown> & typeof e.data;
    const extra = e.collection === 'frequencies' ? [e.data.catalogue, e.data.mood, ...e.data.tracklist.map((t) => `${t.artist} ${t.title}`)] : [];
    return {
      key: `${e.collection}/${e.id}`,
      url: `/${e.collection}/${e.id}/`,
      type: e.collection,
      title: d.title,
      date: d.date.toISOString(),
      tags: tagsOf(e),
      text: [d.title, SECTION_META[e.collection].label, d.description, d.location?.name, d.location?.country, ...tagsOf(e), ...extra, textOf(e)].filter(Boolean).join(' '),
    };
  });
  return new Response(JSON.stringify(docs), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
