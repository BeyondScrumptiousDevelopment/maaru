import { defineArrayMember, defineField } from 'sanity';

/** Image with required alt text (used for the main image and gallery frames). */
export const altImage = (name: string, title: string, opts: { caption?: boolean; required?: boolean } = {}) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'Describe what is in the photo for people who cannot see it. Required.',
        validation: (r) => r.custom((alt, ctx) => ((ctx.parent as { asset?: unknown })?.asset && !alt ? 'Alt text is required' : true)),
      }),
      ...(opts.caption ? [defineField({ name: 'caption', title: 'Caption', type: 'string' })] : []),
    ],
    validation: opts.required ? (r) => r.required() : undefined,
  });

export const body = defineField({
  name: 'body',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Subheading', value: 'h3' },
        { title: 'Pull quote', value: 'blockquote' },
      ],
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (r) => r.required() })],
    }),
    defineArrayMember({
      type: 'object',
      name: 'code',
      title: 'Code / table of text',
      fields: [
        defineField({ name: 'language', type: 'string', initialValue: 'text' }),
        defineField({ name: 'code', type: 'text', rows: 8 }),
      ],
      preview: { select: { title: 'code' } },
    }),
  ],
});

const location = (required = false) =>
  defineField({
    name: 'location',
    title: 'Location',
    type: 'object',
    options: { collapsible: true, collapsed: !required },
    validation: required ? (r) => r.required() : undefined,
    fields: [
      defineField({ name: 'name', title: 'Place', type: 'string', validation: required ? (r) => r.required() : undefined }),
      defineField({ name: 'country', title: 'Country', type: 'string' }),
      defineField({ name: 'lat', title: 'Latitude', type: 'number', description: 'South is negative, e.g. Nairobi is -1.2921' }),
      defineField({ name: 'lng', title: 'Longitude', type: 'number', description: 'West is negative, e.g. Harrow is -0.3420' }),
    ],
  });

/** Fields every section shares. `extra` goes after the description. */
export function sharedFields(extra: ReturnType<typeof defineField>[] = [], opts: { locationRequired?: boolean } = {}) {
  return [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description: 'Click Generate. This becomes the web address, e.g. /journal/sunday-kettles/',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'date', title: 'Date', type: 'date', validation: (r) => r.required(), initialValue: () => new Date().toISOString().slice(0, 10) }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Under 240 characters. Shown on cards, in search and in link previews. Leave empty to use the first paragraph.',
      validation: (r) => r.max(240),
    }),
    ...extra,
    ...(opts.locationRequired ? [location(true)] : []),
    altImage('image', 'Main image'),
    defineField({ name: 'gallery', title: 'Gallery', type: 'array', of: [{ ...altImage('frame', 'Frame', { caption: true }), type: 'image' }], options: { layout: 'grid' } }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'url', title: 'Video URL', type: 'url', description: 'A YouTube or Vimeo link, or a direct link to a video file.' }),
        altImage('poster', 'Poster image'),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
      ],
    }),
    body,
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    ...(opts.locationRequired ? [] : [location(false)]),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [defineArrayMember({ type: 'object', name: 'link', fields: [
        defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'url', type: 'url', validation: (r) => r.required() }),
      ] })],
    }),
    defineField({ name: 'featured', title: 'Featured on /home', type: 'boolean', initialValue: false }),
    defineField({ name: 'updated', title: 'Updated', type: 'date' }),
  ];
}

export const preview = (subtitleField = 'date') => ({
  select: { title: 'title', subtitle: subtitleField, media: 'image' },
});
