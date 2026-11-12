# maaru. — brand kit v1

**The Maaru Collective · maaru.me · There's life in the mundane.**

This folder holds everything needed to build the MAARU website: the logo suite, colours, type, textures, graphic marks, and a build brief for Claude Code.

## How to hand this to Claude Code

1. Unzip this folder into an empty project folder, e.g. `~/Sites/maaru/maaru-brand-kit/`.
2. Open Claude Code in the project folder (one level up from the kit).
3. Give it this prompt:

> Read `maaru-brand-kit/CLAUDE_CODE_BRIEF.md` first, then `maaru-brand-kit/reference/original-brief.txt`. The brand kit is final, so use its files exactly as provided. Build the MAARU website described there in this folder, working through the stages in order. Ask me before adding any paid service.

## What's inside

| Folder | Contents |
|---|---|
| `brand-guidelines.html` | **Open this first.** The visual brand book: logo, lockups, colour, type, textures and in-use sketches |
| `CLAUDE_CODE_BRIEF.md` | The build brief. It overrides the original brief where they differ |
| `logo/` | `maaru.` wordmark (ink, cream, stone, gold, mono, plus a CSS-colourable version), collective lockups, `m.` monogram. SVG, with 2400px PNGs in `logo/png/` |
| `favicon/` | favicon.svg / .ico, apple-touch-icon, 192/512 and maskable icons, site.webmanifest |
| `stamp/` | Distressed circular stamp (ink, gold, cream, CSS-colourable) as SVG + PNG |
| `textures/` | Plaster (cream, beige), concrete, ink wall, paper (tileable JPGs), and grain and photocopy overlays (transparent PNGs) |
| `graphics/` | Torn edges, gold underline, brush swipe, circle, arrow, scribble, cross, and the default Open Graph image |
| `tokens/` | `tokens.css` (all design values), `fonts.css`, `tokens.json` |
| `fonts/` | Nunito 800, Nunito Sans, Cormorant Garamond, Barlow Condensed. All SIL Open Font License, free to self-host |
| `scripts/` | The Python that generated the logo, stamp and textures, so assets can be regenerated or tweaked |
| `reference/original-brief.txt` | The original full website brief |

## The identity in one breath

A bold, rounded lowercase **maaru.** with an antique-gold full stop sits in a raw, editorial world of plaster walls, torn paper, film grain, Cormorant headlines and condensed labels. The logo is the only rounded thing; everything around it stays square, textured and typographic. Cream is the ground, ink is the voice, and gold is used sparingly.

## Notes

- The logo is outlined Nunito 800 with custom tracking. Always use the SVG; never retype it.
- Colour contrast has been checked. Raw gold and raw stone are too light for text on cream, so use `--gold-text` and `--stone-text` (in `tokens.css`).
- Textures are procedurally generated, so you own them outright. Swap in photos of real walls later if you like.
