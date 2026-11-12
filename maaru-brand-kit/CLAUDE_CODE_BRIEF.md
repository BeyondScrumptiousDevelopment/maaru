# MAARU — Build brief for Claude Code

> **Read this file first, then `reference/original-brief.txt`.**
> The original brief is the full vision. **This file overrides it wherever they disagree.** The visual identity is now done and the decisions below are final.
> Open `brand-guidelines.html` in a browser to see everything in context.

---

## 0. What changed since the original brief

| Original brief | Final decision |
|---|---|
| Handwritten brush signature as the primary wordmark | **Primary logo is a rounded, bold lowercase `maaru.` (Nunito 800, outlined to SVG) with an antique-gold full stop.** It's a sister mark to the owner's other brand, *naavcaptured* ("captured." in Nunito Sans). |
| Handwriting throughout | **No handwritten lettering anywhere.** The hand-made feel comes from textures, torn edges, the stamp and the hand-drawn marks in `graphics/` (underlines, circles, arrows). |
| Space Grotesk for body | **Nunito Sans** for body, nav and captions. It ties the UI to the logo. |
| Explore editorial serifs | **Cormorant Garamond** 500/600 + italics for headlines and statements. |
| Condensed type | **Barlow Condensed** 500/600, uppercase and tracked, for labels, dates and numbering. |

Everything else in the original brief stands: the routes, sections, content model, the separate landing page, Astro on Cloudflare Pages, accessibility, no paid services, and no fake interactions.

**The tension to manage:** the logo is soft, round and friendly, while the world around it is raw, editorial and tactile. That contrast is the identity. Don't soften the rest of the site to match the logo. Keep the UI square, typographic and textured, and let the round `maaru.` be the one warm, rounded thing.

---

## 1. The kit: what's where

Copy these into the Astro project as shown.

```
maaru-brand-kit/                   → in the site
├── logo/                          → src/assets/brand/ (inline SVG components)
│   ├── maaru-wordmark.svg         ← USE THIS IN CODE: letters = currentColor, dot = var(--maaru-dot)
│   ├── maaru-wordmark-{ink,cream,stone,gold,ink-mono,cream-mono}.svg   fixed-colour versions
│   ├── maaru-collective-stacked-{ink,cream}.svg      wordmark + THE MAARU COLLECTIVE + tagline
│   ├── maaru-collective-horizontal-{ink,cream}.svg   wordmark | THE MAARU / COLLECTIVE
│   ├── maaru-monogram-{ink,cream,ink-mono}.svg       "m." compact mark
│   └── png/                       2400px transparent PNGs (social, docs, not for the site)
├── stamp/                         → src/assets/brand/
│   └── maaru-stamp{,-ink,-gold,-cream}.svg           distressed circular stamp (currentColor version included)
├── favicon/                       → public/ (root) — see §7 for the <head> tags
├── textures/                      → public/textures/
│   ├── plaster-cream.jpg, plaster-beige.jpg, concrete-stone.jpg, wall-ink.jpg   1024px tileable walls
│   ├── paper-cream.jpg            512px tileable paper
│   ├── grain-overlay.png          transparent film grain (multiply)
│   └── photocopy-overlay.png      transparent toner speckle (multiply)
├── graphics/                      → src/assets/graphics/ (SVG) and public/og-image.png
│   ├── torn-edge-{cream,beige,ink}.svg   section dividers. preserveAspectRatio="none", tile horizontally
│   ├── underline-gold.svg, underline-ink.svg, brush-swipe-gold.svg   hand-drawn marks
│   ├── circle-gold.svg, arrow-ink.svg, scribble-ink.svg, cross-ink.svg   annotation marks
│   └── og-image.png               1200×630 default Open Graph image
├── fonts/                         → public/fonts/  (all OFL, licence included)
├── tokens/
│   ├── fonts.css                  → src/styles/fonts.css
│   ├── tokens.css                 → src/styles/tokens.css   (single source of truth)
│   └── tokens.json                same values, for scripts or a CMS
├── scripts/                       Python generators that made these assets (keep them out of the site build)
└── reference/original-brief.txt
```

All SVGs are pure paths with no font dependencies. Every logo-type SVG has a `<title>`. Decorative graphics are `aria-hidden`.

---

## 2. Brand rules (enforce these)

**Logo `maaru.`**
- Always use the SVG. **Never set "maaru." as live text** to fake the logo. The SVG has custom tracking and a separate dot path.
- The full stop is **antique gold** on both ink and cream. Use the mono versions only where one colour is forced (e.g. a gold-on-gold stamp).
- Minimum size: wordmark 72px wide on screen; below that, use the `m.` monogram (min 16px).
- Clear space: at least the height of the "a" on every side.
- Don't stretch, outline, shadow, gradient, rotate (except the stamp), or recolour the letters gold.
- In the nav, the wordmark links to `/home` with `aria-label="maaru. — home"`.

**Colour**
- Cream (`--cream`) is the default ground. Ink sections (`--ink`) are used deliberately: Frequencies, the footer, and the occasional feature. Beige and concrete are for layered panels.
- **Gold is an accent, not a colour scheme.** Keep it to the dot, hairline rules, hand-drawn marks, the stamp, hover states and active nav. If a screen looks "gold", there's too much.
- Contrast (checked): ink/cream 13.7, ink/beige 9.0, gold/ink 5.5, `--stone-text`/cream 5.1, `--gold-text`/cream 5.0. **Raw gold on cream is 2.5:1 and raw stone on cream is 3.9:1**, so never use them for text on cream; use the `-text` tokens.
- No gradients, glossy effects or bright yellow.

**Type**
- Cormorant Garamond: headlines, statements, pull quotes, big numerals. Go big (`--step-4` to `--step-6`), tight leading (0.95) and `--tracking-tight`. Mix roman and italic within a headline for rhythm.
- Nunito Sans: body (400, `--leading-body`, max `--measure`), nav (600, uppercase optional), captions (`--step--1`).
- Barlow Condensed: uppercase, `--tracking-label`, at `--step--2`/`--step--1`. Use it for dates (`12.11.26`), numbering (`N° 014`), type labels (`JOURNAL — NOTE`), coordinates and catalogue numbers.
- Unexpected placement is encouraged: rotated labels in margins, numbers hanging outside the grid, headlines that break the column. Keep body copy plain and readable.

**Shape and texture**
- UI corners are square (`--radius-0`/`--radius-s`). Pills only for filter chips. No rounded card UI anywhere.
- Textures go on backgrounds, dividers and small details at low intensity. Body text always sits on a calm surface (plain cream or paper texture, never concrete).
- Use the site-wide grain (`.grain` in tokens.css) once in the main layout. Optional on the landing page.
- Torn edges divide sections. Vary which edge and colour you use; don't put one between every section.
- Tilt pasted-up elements (photos, labels, stamp) by −4° to 4°. Never tilt body text.

---

## 3. Tech direction

- **Astro** (latest stable; check the current docs, as APIs change between majors), TypeScript, **static output** (no SSR needed for v1).
- **Cloudflare Pages** with Git integration: build `npm run build`, output `dist`, Node version set via `.nvmrc`. Check Cloudflare's current guidance first. Cloudflare has been steering new static sites towards Workers static assets, and either is fine as long as it's free.
- Plain CSS with the tokens. Use a small amount of vanilla JS (or tiny islands) only for: mobile menu, lightbox, archive filter/search, embeds, reveal animations. No UI framework is needed.
- Images: Astro's `<Image>`/`<Picture>` from `src/assets` for optimisation. Generate AVIF/WebP, use `loading="lazy"` below the fold, and set explicit sizes.
- **Video:** don't commit large video files to git. Support a `video` field that accepts either a YouTube/Vimeo URL (privacy-enhanced, click-to-load facade) or a self-hosted URL. Self-hosting at scale needs storage, so **ask the owner before introducing Cloudflare R2 or any other service.**
- No database, no auth, no paid services.

### Suggested structure

```
src/
  pages/
    index.astro                 ← landing page ONLY (uses LandingLayout)
    home.astro
    journal/index.astro   journal/[slug].astro
    visuals/index.astro   visuals/[slug].astro
    frequencies/index.astro     (+ [slug].astro if entries need their own page)
    elsewhere/index.astro elsewhere/[slug].astro
    experiments/index.astro experiments/[slug].astro
    everything.astro   about.astro   404.astro
  landing/                      ← EVERYTHING for "/" lives here: components, styles, scripts
    Landing.astro  landing.css  landing.ts  assets/
  layouts/  BaseLayout.astro (head/meta)  SiteLayout.astro (nav+footer+grain)  LandingLayout.astro
  components/  Nav, MobileMenu, Footer, Logo, Stamp, TornEdge, Mark, EntryCard/*, Lightbox, Embed, Filters, ...
  content/  (collections — see §5)   content.config.ts
  styles/  fonts.css  tokens.css  global.css
  lib/  dates.ts  readingTime.ts  entries.ts (helpers to query/sort/filter all types)
public/  fonts/  textures/  favicon files  og-image.png  _headers  (cache rules)
```

**Landing independence test:** deleting `src/landing/` and replacing `src/pages/index.astro` with a redirect to `/home` (or with `home.astro`'s content) must not break anything else. `landing.css` must not leak; scope it all under `.landing`.

---

## 4. Art direction, page by page

The site should feel like an independent publication that someone keeps adding to. **Each section gets its own format** while sharing the tokens.

### `/` — Landing page: "The Wall"
A paste-up on a plaster wall, not a hero section.
- Full-viewport `plaster-cream` wall. Optional faint photocopy overlay.
- **Oversized `maaru.`** (~85–110vw wide on desktop) that **bleeds off the left edge** and sits partly *under* a torn paper scrap.
- 1–2 **film-photo scraps** (placeholders), tilted, with taped corners (beige rectangles at 40% opacity) and a condensed caption like `FRAME 07 — HARROW`.
- The **stamp**, tilted, overlapping the corner of a photo.
- "There's life in the mundane." in Cormorant italic `--step-3`, offset to the right, with `underline-gold.svg` drawing in beneath it.
- `THE MAARU COLLECTIVE` and "Ideas, images, sounds and everything else." as small labels in odd positions (one rotated 90° up the right margin).
- A small **circle-gold** mark loops around one word of the supporting line, as if someone marked up the wall.
- **GO TO HOME**: styled as a torn paper ticket or tag in ink with cream Barlow Condensed and `arrow-ink` (inverted). On hover/focus the ticket lifts and straightens (rotation → 0°, small translate), the gold underline draws, and the arrow nudges right. It's a real `<a href="/home">` with a ≥44px touch target, keyboard focus ring, and visible text.
- **Motion sequence** (one pass, ~2.5s total, skip entirely with reduced motion): wall fades in, then the wordmark slides 4% from left, photos "drop" with a tiny overshoot, the stamp thumps (scale 1.08 → 1), the tagline underline draws, the gold circle marks its word, and the button appears last. A very subtle cursor-parallax on the photos (desktop pointer only, ≤8px).
- **Mobile:** recompose vertically, don't shrink. The wordmark spans full width at top, still bleeding off the left. One photo scrap below it, tilted. Then tagline and the ticket button within thumb reach (lower third). No horizontal scroll (`overflow-x: clip` on the wall).

### `/home` — The journal
An ongoing issue, like a magazine contents spread.
- Header strip: `THE MAARU COLLECTIVE — ONGOING — LONDON` with today's date in condensed labels and the nav.
- Editorial intro: one big Cormorant statement (`--step-5`), roman and italic mixed, breaking the column, with the gold underline mark on one word.
- **Recent:** a deliberately mixed, asymmetric feed where **each content type has its own card treatment** (see below). Use a 12-col grid with varied spans and some vertical offsets. No two neighbouring cards should share a format.
- **Index of sections:** a numbered list (`01 Journal`, `02 Visuals` …) in big Cormorant, with a short line and entry count each. On hover/focus, a small image peeks out and follows the cursor (desktop only).
- "Everything →" link to the archive. Footer.

**Card treatments by type (reuse across Home and Everything):**
- **journal**: pure type. Date + label, Cormorant title, 2-line excerpt, reading time. Notes (short thoughts) render as a big italic quote with no image.
- **visual**: image-led and full-bleed within its span; caption in condensed type underneath like a contact sheet (`ROLL 03 / 24 FRAMES`).
- **frequency**: square record sleeve on ink with catalogue number `MRU-007`, title, and a mini tracklist.
- **elsewhere**: postcard with photo, place name in Cormorant, coordinates and date, and a small stamp graphic.
- **experiment**: index card on paper texture with status label (`IN PROGRESS`, `PAUSED`, `DONE`, `ABANDONED`) and version (`v0.3`).

### `/journal` and `/journal/[slug]`
- Index as a **table of contents**, not cards: rows with date | title (Cormorant `--step-3`) | label | reading time. Hairline rules between them. Filter by kind (note / essay / observation / story). On hover the excerpt slides in.
- Post: narrow measure, a big headline breaking left, standfirst, drop cap, pull quotes in italic `--step-3` hanging into the margin, margin notes in condensed labels on wide screens. End with a small gold `m.` monogram, then prev/next.
- `kind: note` posts: no hero, just centred large italic text and the date. Short and quiet.

### `/visuals` and `/visuals/[slug]`
- Index: **asymmetric masonry or editorial grid** with mixed spans and orientations, some with gaps and offsets. Collection title in condensed labels over or under the image. Filter: photo / video / mixed.
- Collection: full-bleed opener image, title and intro, then a **sequenced layout** varying full-bleed, pairs, single small images with large whitespace, and an occasional text interlude. Contact-sheet frame numbers on each image.
- **Lightbox**: click any image to open fullscreen on ink. Arrow keys, swipe, Esc, focus trap, caption, `N / total` counter, and focus returns to the trigger on close. Video plays inline with controls; no autoplay with sound.

### `/frequencies`
Record shop after hours. The **whole section is on ink** (`wall-ink` texture).
- Entries as **record sleeves** in a crate/grid: square covers, catalogue numbers, Side A/B tracklists, listening notes in Nunito Sans, genre or mood tags.
- Generate **typographic sleeves** from the entry (title + catalogue number + colour field from the palette + grain). **Never use real album artwork.**
- Embeds for Spotify, SoundCloud, Bandcamp, YouTube and Mixcloud via a **click-to-load facade** (privacy and speed). Otherwise, plain outbound links. **No direct streaming of copyrighted audio.**
- Optional `[slug]` pages for longer music writing.

### `/elsewhere` and `/elsewhere/[slug]`
Places, not a travel blog.
- Index as a **wall of postcards and luggage tags**: place, country, coordinates, date range, tilted slightly. Group by place or year. Possibly a simple typographic "map" list of places visited with counts. No map service needed.
- Entry: location header (`HARROW — 51.5806° N, 0.3420° W`), date, a short diary in dated fragments ("Day 2 — 07:40"), photos interleaved at varied sizes, and a "worth remembering" list at the end.

### `/experiments` and `/experiments/[slug]`
The lab bench.
- Index as **index cards / a lab log**: status, version, started date, last touched, one-line idea. Sort by last touched. Filter by status.
- Entry: flexible block layout (text, image, video, embed, code, and a "what I'd do next" note). It's fine for these to look unfinished. Show a version history list if provided.

### `/everything`
Browsing a collection, not querying a database.
- Chronological, grouped by **year then month** with big Cormorant year numerals hanging in the margin.
- Every entry uses its type's card treatment in a compact form.
- Controls: search input (title + description + body text + tags), type chips, tag chips, and newest/oldest toggle. Filters sync to URL query params (`?type=visual&tag=harrow&q=bus`) so a filtered view can be shared. Show a live count, an empty state, and a "clear" button.
- Implementation: build a JSON index at build time (`/search-index.json`), filter client-side with vanilla JS. Pagefind is a free alternative if full-text gets heavy later. **The page must still list everything without JS.**

### `/about`
Minimal. A large Cormorant statement: *"A creative collective of one. An ever-growing collection of ideas, images, sounds, places and everything else."* One portrait or texture image (placeholder), a few lines of plain personal text, the stamp, and a contact link if the owner wants one. No services, no CV, no agency tone.

### Navigation and footer
- Desktop: `maaru.` (→ `/home`) left; `JOURNAL VISUALS FREQUENCIES ELSEWHERE EXPERIMENTS EVERYTHING ABOUT` in Barlow Condensed. **Active section:** gold hand-drawn underline (`underline-gold.svg`) under the item plus `aria-current="page"`. Hover: underline draws in.
- Mobile: wordmark + "MENU" text button (`aria-expanded`, `aria-controls`) opens a **full-screen ink panel**: big Cormorant section names, numbered, each with its entry count; the stamp at the bottom; Esc/close button; focus trap; body scroll lock.
- Skip link to main content.
- Footer on ink: stacked collective lockup (cream), section links, "There's life in the mundane.", `© MAARU · maaru.me`, a small rotated stamp, and a "back to the wall" link to `/` (while the landing page exists).

---

## 5. Content architecture

Use **Astro content collections** (Markdown/MDX + frontmatter, validated with zod). Keep content in files and presentation in components, so adding a post is "add one file".

**Recommended:** one collection per section (simple for a future CMS), all sharing a base schema, plus a helper `lib/entries.ts` that merges them for Home and Everything.

```ts
// src/content.config.ts — sketch; adapt to the current Astro API
const base = z.object({
  id: z.string().optional(),            // defaults to file slug
  title: z.string(),
  slug: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  description: z.string().max(240).optional(),
  image: image().optional(),            // main image (src/assets/...)
  imageAlt: z.string().optional(),      // required if image is set — enforce with .refine
  gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
  video: z.object({ url: z.string().url(), poster: image().optional(), caption: z.string().optional() }).optional(),
  tags: z.array(z.string()).default([]),
  location: z.object({ name: z.string(), country: z.string().optional(),
                       lat: z.number().optional(), lng: z.number().optional() }).optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),    // drafts excluded from production builds
  links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
});
journal     = base.extend({ kind: z.enum(['note','essay','observation','story','idea']).default('essay') })
visuals     = base.extend({ format: z.enum(['photo','video','mixed']).default('photo'), roll: z.string().optional() })
frequencies = base.extend({ catalogue: z.string(), // e.g. MRU-007
                            embeds: z.array(z.object({ provider: z.enum(['spotify','soundcloud','bandcamp','youtube','mixcloud']), url: z.string().url() })).default([]),
                            tracklist: z.array(z.object({ side: z.enum(['A','B']).optional(), artist: z.string(), title: z.string() })).default([]),
                            mood: z.string().optional() })
elsewhere   = base.extend({ dateEnd: z.coerce.date().optional() })   // location required via refine
experiments = base.extend({ status: z.enum(['in-progress','paused','done','abandoned']), version: z.string().optional(),
                            lastTouched: z.coerce.date().optional() })
```

- Not every field is required. Layouts must handle missing images, descriptions or tags without breaking or leaving blank boxes.
- Reading time is computed from the body. Excerpt falls back to the first paragraph.
- Tags are free-form, normalised to lowercase slugs.
- Drafts show in `npm run dev` and are excluded in builds.

**Sample content:** write ~4–6 entries per section in the MAARU voice: plain, observant, a bit dry. Draw naturally on Harrow, Kutchh, Nairobi, house music, architecture and everyday details **without making it a heritage or travel site**. Mix long and short. Include at least one `note`, one video collection, one entry with no image, one experiment marked `abandoned`, and one frequency with an embed. Write all copy fresh; don't paste lyrics or quotes.

**Placeholder images:** don't use stock photos. Generate placeholder frames at build time or as committed files: tonal fields from the palette with film grain, a thin frame border and a condensed caption like `PLACEHOLDER — 4:5 — HARROW STREET`. Use realistic aspect ratios (4:5, 3:2, 1:1, 16:9, 9:16). Put them in clearly named folders (`src/assets/placeholder/`) so the owner can swap them for real photos.

**Future CMS:** keep the content as Markdown in git so a git-based CMS can sit on top later with no rebuild. Evaluate free, git-based options that work with Astro on Cloudflare, e.g. **Pages CMS, Keystatic, Decap CMS** (Decap needs a small OAuth proxy, which can run on a free Cloudflare Worker). Check each one's current pricing and auth setup. **Recommend one in the README; don't install it in v1.**

---

## 6. Motion and interaction

- Calm and alive, not flashy. One landing sequence, small reveals elsewhere.
- Allowed: wordmark reveal, hand-drawn underline draws (`clip-path` wipe), images fading up 12px on scroll (IntersectionObserver, once), headline italic shift on hover, cursor-follow image peeks on the Home index (pointer: fine only), and gentle parallax on landing scraps.
- Not allowed: scroll-jacking, smooth-scroll libraries, cursor replacement, page-transition wipes on every click.
- `prefers-reduced-motion: reduce` → no movement, content visible immediately. The tokens already zero the durations.
- Everything works by touch: no hover-only content. Anything revealed on hover is also available on focus or always visible on touch.

---

## 7. SEO, accessibility, head

- Per-page `<title>` like `Journal — maaru.` and a natural meta description (no marketing tone). Use Open Graph and Twitter tags with `og-image.png` as the default and the entry image when present. Add a canonical URL on `https://maaru.me`, plus a sitemap and robots.txt.
- Favicon tags:
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#171614">
```
- Semantic landmarks, one `<h1>` per page, visible focus (gold outline), skip link, real buttons and links, alt text required in the schema, `lang="en-GB"`, and keyboard-operable lightbox, menu and filters.
- Body text must meet WCAG AA. The token comments note which combinations pass.
- Optional RSS feed for Journal.

---

## 8. Build order and definition of done

Follow the stages in the original brief. Additionally:

1. Scaffold Astro, copy the kit in (§1), wire up tokens and fonts, and build `BaseLayout`/`SiteLayout`, Nav, MobileMenu and Footer.
2. Build the content collections + sample content + placeholder images.
3. Build `/home`, all index pages and all `[slug]` templates, the card treatments, the lightbox and embeds.
4. Build `/everything` with search and filters.
5. Build the landing page in `src/landing/` last, so it's clearly independent.
6. Test at 375, 768, 1024, 1440 and 1920 widths; keyboard-only; reduced motion; no-JS (archive lists everything, links work); Lighthouse a11y ≥ 95.
7. `npm run build` passes with zero errors, `npm run preview` is checked, and every route and every generated slug returns 200 (write a tiny link-check script). Deploy to Cloudflare and verify the live URL. **Don't report success without running the build.**
8. Write `README.md`: local dev, how to add each content type (with a copy-paste frontmatter template per type), how to swap placeholder images, how to edit tokens, how to change or remove the landing page, the deploy steps, and the CMS recommendation.

**Done means:** every route in the original brief is real and populated, every button does something real, mobile is recomposed rather than shrunk, the logo is always the SVG, and gold stays rare.
