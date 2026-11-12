import { defineArrayMember, defineField, defineType } from 'sanity';
import { sharedFields, preview } from './fields';

const ordering = [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' as const }] }];

export const journal = defineType({
  name: 'journal',
  title: 'Journal',
  type: 'document',
  fields: sharedFields([
    defineField({
      name: 'kind', title: 'Kind', type: 'string', initialValue: 'essay', validation: (r) => r.required(),
      options: { list: ['note', 'essay', 'observation', 'story', 'idea'], layout: 'radio', direction: 'horizontal' },
      description: 'A note has no hero image and shows as large quiet text — keep it short.',
    }),
  ]),
  orderings: ordering,
  preview: { select: { title: 'title', date: 'date', kind: 'kind', media: 'image' }, prepare: ({ title, date, kind, media }) => ({ title, subtitle: `${kind ?? ''} · ${date ?? ''}`, media }) },
});

export const visual = defineType({
  name: 'visual',
  title: 'Visuals',
  type: 'document',
  fields: sharedFields([
    defineField({ name: 'format', title: 'Format', type: 'string', initialValue: 'photo', options: { list: ['photo', 'video', 'mixed'], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'roll', title: 'Roll label', type: 'string', description: 'e.g. ROLL 05 — shown like a contact sheet' }),
  ]),
  orderings: ordering,
  preview: preview(),
});

export const frequency = defineType({
  name: 'frequency',
  title: 'Frequencies',
  type: 'document',
  fields: sharedFields([
    defineField({ name: 'catalogue', title: 'Catalogue number', type: 'string', validation: (r) => r.required(), description: 'e.g. MRU-008. Also picks the colours of the generated sleeve.' }),
    defineField({ name: 'mood', title: 'Mood', type: 'string' }),
    defineField({
      name: 'tracklist', title: 'Tracklist', type: 'array',
      of: [defineArrayMember({
        type: 'object', name: 'track',
        fields: [
          defineField({ name: 'side', type: 'string', options: { list: ['A', 'B'], layout: 'radio', direction: 'horizontal' } }),
          defineField({ name: 'artist', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
        ],
        preview: { select: { title: 'title', subtitle: 'artist', side: 'side' }, prepare: ({ title, subtitle, side }) => ({ title: `${side ?? ''} ${title}`, subtitle }) },
      })],
    }),
    defineField({
      name: 'embeds', title: 'Players', type: 'array', description: 'Load only when a visitor clicks. Spotify, SoundCloud, Mixcloud, YouTube or Bandcamp.',
      of: [defineArrayMember({
        type: 'object', name: 'embed',
        fields: [
          defineField({ name: 'provider', title: 'Service', type: 'string', validation: (r) => r.required(), options: { list: ['spotify', 'soundcloud', 'mixcloud', 'youtube', 'bandcamp'] } }),
          defineField({ name: 'url', title: 'Link', type: 'url', validation: (r) => r.required(), description: 'The normal share link. For Bandcamp, paste the EmbeddedPlayer link from Share / Embed.' }),
        ],
        preview: { select: { title: 'provider', subtitle: 'url' } },
      })],
    }),
  ]),
  orderings: ordering,
  preview: { select: { title: 'title', subtitle: 'catalogue' } },
});

export const place = defineType({
  name: 'place',
  title: 'Elsewhere',
  type: 'document',
  fields: sharedFields([
    defineField({ name: 'dateEnd', title: 'End date', type: 'date' }),
    defineField({ name: 'remember', title: 'Worth remembering', type: 'array', of: [{ type: 'string' }] }),
  ], { locationRequired: true }),
  orderings: ordering,
  preview: { select: { title: 'title', subtitle: 'location.name', media: 'image' } },
});

export const experiment = defineType({
  name: 'experiment',
  title: 'Experiments',
  type: 'document',
  fields: sharedFields([
    defineField({ name: 'status', title: 'Status', type: 'string', initialValue: 'in-progress', validation: (r) => r.required(), options: { list: ['in-progress', 'paused', 'done', 'abandoned'], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'version', title: 'Version', type: 'string', description: 'e.g. v0.3' }),
    defineField({ name: 'lastTouched', title: 'Last touched', type: 'date' }),
    defineField({ name: 'next', title: "What I'd do next", type: 'text', rows: 2 }),
    defineField({
      name: 'history', title: 'Version history', type: 'array',
      of: [defineArrayMember({ type: 'object', name: 'version', fields: [
        defineField({ name: 'version', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'date', type: 'date', validation: (r) => r.required() }),
        defineField({ name: 'note', title: 'What changed', type: 'string', validation: (r) => r.required() }),
      ], preview: { select: { title: 'version', subtitle: 'note' } } })],
    }),
  ]),
  orderings: ordering,
  preview: { select: { title: 'title', subtitle: 'status', media: 'image' } },
});

export const schemaTypes = [journal, visual, frequency, place, experiment];

/** Sanity document type → site section (folder / URL). */
export const TYPE_TO_SECTION = { journal: 'journal', visual: 'visuals', frequency: 'frequencies', place: 'elsewhere', experiment: 'experiments' } as const;
