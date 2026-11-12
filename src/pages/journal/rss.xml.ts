import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSection, excerptOf } from '../../lib/entries';

export async function GET(context: APIContext) {
  const posts = await getSection('journal');
  return rss({
    title: 'maaru. — Journal',
    description: "Notes, essays and observations from the Maaru Collective. There's life in the mundane.",
    site: context.site!,
    items: posts.map((p) => ({ title: p.data.title, pubDate: p.data.date, description: excerptOf(p, 300), link: `/journal/${p.id}/`, categories: p.data.tags })),
    customData: '<language>en-gb</language>',
  });
}
