# maaru.

**The Maaru Collective · maaru.me · There's life in the mundane.**

The website for MAARU: a creative collective of one. It's built with [Astro](https://astro.build) as a fully static site, ready for Cloudflare Pages. It has no database, no server, no paid services and no tracking.

- `/`: **The Wall**, the experimental landing page, kept separate from everything else
- `/home`: the main site, an ongoing journal
- `/journal`, `/visuals`, `/frequencies`, `/elsewhere`, `/experiments`: each has an index and a page per entry
- `/everything`: the full archive with search, type and tag filters, and sorting. Filters are kept in the URL so a filtered view can be shared.
- `/about`, a 404 page, `/journal/rss.xml`, `/sitemap-index.xml` and `/search-index.json`

The brand kit sits untouched in `maaru-brand-kit/`. Open `maaru-brand-kit/brand-guidelines.html` to see the identity, and read `maaru-brand-kit/CLAUDE_CODE_BRIEF.md` for the decisions behind the build.

---

## Local development

You need Node 22.12 or newer (`.nvmrc` pins 22.23.4).

```bash
npm install
npm run dev        # http://localhost:4321 — drafts are visible here
npm run build      # production build into dist/ (drafts excluded)
npm run preview    # serve dist/ locally
npm run check:links   # with preview running: requests every page, image and link and reports anything not 200
```

## Project layout

```
src/
  pages/            routes (index.astro is the landing page; home.astro is /home)
  landing/          EVERYTHING for "/" — Landing.astro, landing.css (scoped to .landing), landing.ts, assets/
  layouts/          BaseLayout (head/meta/tokens) · SiteLayout (nav, footer, grain, lightbox) · LandingLayout
  components/       Logo, Stamp, Mark (hand-drawn marks), TornEdge, Nav, Footer, Photo, Gallery, Lightbox,
                    Embed (click-to-load players), VideoPlayer, Sleeve (generated record sleeves), PrevNext
  components/cards/ one card treatment per content type + EntryCard (picks the right one)
  content/          the Markdown entries, one folder per section
  content.config.ts the content model (validated: missing alt text, bad URLs etc. fail the build)
  lib/              entries.ts (query/sort/merge), dates.ts, text.ts (excerpts, reading time), embeds.ts
  styles/           tokens.css + fonts.css (from the kit), base.css (shared), global.css (main site)
  assets/brand/     logo + stamp SVGs from the kit (inlined, so letters take currentColor and the dot stays gold)
  assets/placeholder/  generated placeholder photos — swap for your own
public/             fonts, textures, graphics, favicons, og-image.png, robots.txt, _headers, media/
scripts/            make-placeholders.mjs, check-links.mjs
maaru-brand-kit/    the brand kit, as delivered (not part of the build)
```

---

## Adding content

Every entry is one Markdown file in `src/content/<section>/`. The filename becomes the URL: `src/content/journal/my-post.md` is published at `/journal/my-post/`. Set `slug:` to choose a different URL.

Content is plain Markdown after the frontmatter. Put images in `src/assets/` (any folder, e.g. `src/assets/photos/2026/`) and link to them with a path relative to the Markdown file. Astro resizes them and converts them to AVIF and WebP.

**Fields every type shares** (all optional unless marked):

| field | notes |
|---|---|
| `title` | **required** |
| `date` | **required**, `2026-11-12` |
| `description` | under 240 characters. Used on cards, in search and for link previews. If it's missing, the first paragraph is used |
| `image` + `imageAlt` | main image. If you set `image`, the build requires `imageAlt` |
| `gallery` | list of `{ src, alt, caption? }` |
| `video` | `{ url, poster?, caption? }`. The url can be YouTube, Vimeo or a direct video file (see "Video" below) |
| `tags` | free-form; they're turned into lowercase slugs |
| `location` | `{ name, country?, lat?, lng? }` (south and west are negative) |
| `featured` | `true` moves it up the Recent feed on /home |
| `draft` | `true` shows it in `npm run dev` but leaves it out of the build |
| `links` | list of `{ label, url }` |
| `updated` | date |

Copy-paste templates:

### Journal: `src/content/journal/<slug>.md`

```markdown
---
title: The title
date: 2026-11-12
kind: essay            # note | essay | observation | story | idea
description: One or two plain sentences.
image: ../../assets/photos/my-photo.jpg     # optional — notes usually have none
imageAlt: What's in the photo.
tags: [harrow, buses]
---

Body text. Use > for a pull quote, ## for subheadings.
```

A `kind: note` entry has no hero image. It shows as large centred italic text, so keep it short.

### Visuals: `src/content/visuals/<slug>.md`

```markdown
---
title: Collection title
date: 2026-11-12
format: photo          # photo | video | mixed
roll: ROLL 05          # optional contact-sheet label
description: A line about the collection.
gallery:
  - { src: ../../assets/photos/roll-05/01.jpg, alt: "Describe the frame.", caption: "Optional caption" }
  - { src: ../../assets/photos/roll-05/02.jpg, alt: "Describe the frame." }
---

An intro paragraph or two.
```

The first gallery image becomes the full-bleed opener, unless you set `image`. Every frame opens in the lightbox.

### Frequencies: `src/content/frequencies/<slug>.md`

```markdown
---
title: Sunday, late
catalogue: MRU-008     # required — also decides the generated sleeve's colours
date: 2026-11-12
mood: slow, deep
description: A line about it.
tracklist:
  - { side: A, artist: "Artist", title: "Track" }
  - { side: B, artist: "Artist", title: "Track" }
embeds:
  - { provider: spotify, url: "https://open.spotify.com/playlist/…" }
  # providers: spotify | soundcloud | mixcloud | youtube | bandcamp
  # bandcamp: paste the EmbeddedPlayer URL from Bandcamp's Share/Embed box
---

Listening notes.
```

Sleeves are generated from the title and catalogue number, so you never need real artwork. Players use a click-to-load facade: nothing loads from Spotify or the other services until a visitor asks for it. There's always a plain link too.

### Elsewhere: `src/content/elsewhere/<slug>.md`

```markdown
---
title: Place name
date: 2026-11-12
dateEnd: 2026-11-19    # optional
location: { name: Mandvi, country: India, lat: 22.8333, lng: 69.35 }   # required
image: ../../assets/photos/mandvi.jpg
imageAlt: Describe it.
gallery: []
remember:
  - Something worth remembering.
---

**Day 1 — 07:40.** Diary fragments. Start a paragraph with a bold time stamp and it becomes a label.
```

### Experiments: `src/content/experiments/<slug>.md`

```markdown
---
title: Project name
date: 2026-11-12       # started
lastTouched: 2026-11-12
status: in-progress    # in-progress | paused | done | abandoned
version: v0.1
description: The one-line idea.
next: What I'd do next.
history:
  - { version: v0.1, date: 2026-11-12, note: "What changed." }
---

Anything: text, images, ```code```, lists.
```

### Video

Don't commit large video files to git. You have two options:

- **YouTube or Vimeo:** set `video.url` to the normal share link. It loads through a privacy-friendly click-to-play facade.
- **A file:** a short clip can go in `public/media/` (the sample is `public/media/placeholder/upper-hill-rain.mp4`, about 80 KB). For anything bigger you'd need storage such as Cloudflare R2. That's a separate service, so it isn't set up. Decide first, then point `video.url` at the file's URL.

---

## Swapping the placeholder images

Every placeholder is a generated "film frame" labelled `PLACEHOLDER — ratio — subject`:

- `src/assets/placeholder/<section>/…`: used by the sample entries
- `src/assets/placeholder/about/portrait.jpg`: the About page
- `src/landing/assets/frame-07.jpg`, `frame-12.jpg`: the two scraps on the landing page

You can replace a file with your own photo under **the same name**, at any aspect ratio, and nothing else needs to change. Alternatively, put photos anywhere in `src/assets/` and update the `image:` and `gallery:` paths in the entry. Also update the `alt` text so it describes your real photo.

To regenerate placeholders: `npm run placeholders` (only creates missing files) or `npm run placeholders -- --force`.

The sample entries are written in the MAARU voice so you can see how each layout behaves. Edit them or delete them freely. The site handles a section with very few entries.

## Editing the look

- **Colours, type sizes, spacing, motion:** `src/styles/tokens.css` is the single source of truth. Change a value there and it changes everywhere. Keep using `--gold-text` and `--stone-text` for text on cream, because raw gold and raw stone fail contrast there.
- **Fonts:** `src/styles/fonts.css`, with the files in `public/fonts/`. All are SIL Open Font License.
- **Main site styles:** `src/styles/global.css`, organised by page.
- **Logo:** always use `<Logo />` (the SVG), never live text. `<Logo variant="monogram" />` gives the `m.` mark.
- **Gold marks:** `<Mark name="underline-gold" | "circle-gold" | "arrow" | "scribble" | "cross" | "brush-gold" />`.
- **Textures:** in `public/textures/`. Swap in photos of real walls at the same filenames if you want.

## Changing or removing the landing page

Everything for `/` lives in `src/landing/` plus the six-line `src/pages/index.astro`. Nothing else imports from `src/landing/`, and `landing.css` is scoped to `.landing`.

- **To redesign it:** edit `src/landing/Landing.astro`, `landing.css` and `landing.ts`.
- **To make `/home` the front page:** replace `src/pages/index.astro` with a redirect, then delete `src/landing/`:

  ```astro
  ---
  return Astro.redirect('/home/');
  ---
  ```

  (On a static site this produces a small redirect page. For a true 301, also add `/  /home/  301` to `public/_redirects`.) Also remove the "← Back to the wall" link in `src/components/Footer.astro`.

---

## Deploying to Cloudflare (free)

The site is plain static files, so any Cloudflare option works. **Cloudflare Pages with Git integration** is the simplest:

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Use these build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22.23.4` (Cloudflare also reads `.nvmrc`)
4. Deploy. Every push to the main branch redeploys, and other branches get preview URLs.
5. Under **Custom domains**, add `maaru.me` (and `www.maaru.me` if you want it).

No environment variables or secrets are needed. `public/_headers` sets long cache lifetimes for fonts and hashed assets.

Cloudflare has also been steering new static sites towards **Workers with static assets**. That works too: point it at `dist/` with the same build command. Check Cloudflare's current docs when you set it up, because the dashboard changes often.

After the first deploy, run the link check against the live site:

```bash
BASE=https://maaru.me npm run check:links
```

## Editing content in the browser (Pages CMS)

The site is set up for [Pages CMS](https://pagescms.org), a free, open-source CMS that edits the Markdown files in this GitHub repository. Its configuration is `.pages.yml` at the repository root. There's nothing to host and no database.

**First time:**
1. Go to **https://app.pagescms.org** and sign in with GitHub, using the account that can access `BeyondScrumptiousDevelopment/maaru`.
2. When asked, install the Pages CMS GitHub App and give it access to the `maaru` repository. Because the repo belongs to an organisation, an owner of that organisation may need to approve it.
3. Open the repository in Pages CMS and pick the branch the live site deploys from.

**After that:** open app.pagescms.org, choose maaru, and you'll see Journal, Visuals, Frequencies, Elsewhere and Experiments with a form for each. **Save** commits the change to GitHub, and Cloudflare rebuilds the site in about a minute.

- Uploaded images go to `src/assets/uploads/`, and Astro resizes them as usual.
- Alt text is required whenever you add an image, otherwise the build stops. The form reminds you.
- Tick **Draft** to keep an entry off the live site.
- The sample entries point at the placeholder images, so their image previews may look empty in the CMS. Replace them with your own uploads.
- New entries are named after their title (e.g. "Sunday kettles" becomes `sunday-kettles.md`, at `/journal/sunday-kettles/`).

**If you ever outgrow it:** Keystatic (first-class Astro integration) and Decap CMS (needs a small OAuth proxy, which can run on a free Cloudflare Worker) are the alternatives. Check their current pricing and auth setup first.
