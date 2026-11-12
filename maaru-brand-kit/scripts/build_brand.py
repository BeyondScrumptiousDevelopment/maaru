"""MAARU logo suite — rounded 'maaru.' (Nunito 800, outlined) .
"""
import json, numpy as np
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

K = '/home/claude/maaru-kit/maaru-brand-kit'
INK, BEIGE, CREAM, GOLD, STONE = '#171614', '#C7B49D', '#E9DFD0', '#A88955', '#786B5D'
rng = np.random.default_rng(11)
FONTS = {}

def font(name):
    if name not in FONTS:
        f = TTFont(f'/tmp/fonts/ttf/{name}.ttf'); FONTS[name] = (f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm)
    return FONTS[name]

def text_path(text, fname, size, x, y, tracking=0.0, anchor='start', split_last=False):
    gs, cmap, upm = font(fname); s = size / upm
    widths = [gs[cmap[ord(ch)]].width for ch in text]
    total = sum(widths) * s + tracking * size * (len(text) - 1)
    cx = x - (total if anchor == 'end' else total / 2 if anchor == 'middle' else 0)
    ds = []; bb = [1e9, 1e9, -1e9, -1e9]
    for ch, w in zip(text, widths):
        if ch != ' ':
            g = gs[cmap[ord(ch)]]; t = (s, 0, 0, -s, cx, y)
            pen = SVGPathPen(gs); g.draw(TransformPen(pen, t)); ds.append(pen.getCommands())
            bp = BoundsPen(gs); g.draw(TransformPen(bp, t))
            if bp.bounds:
                b = bp.bounds; bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
        cx += w * s + tracking * size
    if split_last: return ' '.join(ds[:-1]), ds[-1], total, bb
    return ' '.join(ds), total, bb

def text_on_circle(text, fname, size, cx, cy, r, start_deg=-90, tracking=0.0):
    gs, cmap, upm = font(fname); s = size / upm; ds = []; ang = np.radians(start_deg)
    for ch in text:
        gw = gs[cmap[ord(ch)]].width * s; w = gw + tracking * size
        a = ang + (w / 2) / r
        if ch != ' ':
            px, py = cx + r * np.cos(a), cy + r * np.sin(a); rot = a + np.pi / 2; c, si = np.cos(rot), np.sin(rot)
            t = (s * c, s * si, s * si, -s * c, px - (gw / 2) * c, py - (gw / 2) * si)
            pen = SVGPathPen(gs); gs[cmap[ord(ch)]].draw(TransformPen(pen, t)); ds.append(pen.getCommands())
        ang += w / r
    return ' '.join(ds), ang - np.radians(start_deg)

def svg(w, h, body, title='maaru.', bg=None):
    b = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{b}{body}</svg>\n')

def save(path, s): open(f'{K}/{path}', 'w').write(s)

# ---------- 1. Primary wordmark: maaru. ----------
SIZE = 400; TRACK = -0.012
word, dot, tw, bb = text_path('maaru.', 'nunito-800', SIZE, 0, 0, tracking=TRACK, split_last=True)
pad = 24
x0, y0 = bb[0] - pad, bb[1] - pad; W, H = bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad
g = lambda inner: f'<g transform="translate({-x0:.1f},{-y0:.1f})">{inner}</g>'
variants = {'ink': (INK, GOLD), 'cream': (CREAM, GOLD), 'ink-mono': (INK, INK), 'cream-mono': (CREAM, CREAM),
            'gold': (GOLD, GOLD), 'stone': (STONE, GOLD)}
for n, (a, b) in variants.items():
    save(f'logo/maaru-wordmark-{n}.svg', svg(W, H, g(f'<path fill="{a}" d="{word}"/><path fill="{b}" d="{dot}"/>')))
# CSS-colourable version: letters = currentColor, dot = var(--maaru-dot, gold)
save('logo/maaru-wordmark.svg', svg(W, H, g(f'<path fill="currentColor" d="{word}"/><path fill="var(--maaru-dot, {GOLD})" d="{dot}"/>')))
json.dump({'word': word, 'dot': dot, 'x0': x0, 'y0': y0, 'w': W, 'h': H}, open('/tmp/logo.json', 'w'))

# ---------- 2. Lockups ----------
lab, lw, _ = text_path('THE MAARU COLLECTIVE', 'barlow-condensed-latin-600-normal', 46, 0, 0, tracking=0.34)
tag, tgw, _ = text_path('There’s life in the mundane.', 'cormorant-garamond-latin-500-italic', 58, 0, 0)
# (a) stacked — wordmark, then label + tagline aligned to the wordmark's left edge, gold hairline between
LW = W; LH = H + 170
def stacked(a, c, d_col):
    return (g(f'<path fill="{a}" d="{word}"/><path fill="{d_col}" d="{dot}"/>') +
            f'<rect x="{pad+6}" y="{H+18}" width="54" height="3" fill="{GOLD}"/>'
            f'<g transform="translate({pad+78},{H+34})"><path fill="{a}" d="{lab}"/></g>'
            f'<g transform="translate({pad+6},{H+120})"><path fill="{c}" d="{tag}"/></g>')
save('logo/maaru-collective-stacked-ink.svg', svg(LW, LH, stacked(INK, STONE, GOLD), 'maaru. The Maaru Collective'))
save('logo/maaru-collective-stacked-cream.svg', svg(LW, LH, stacked(CREAM, BEIGE, GOLD), 'maaru. The Maaru Collective'))
# (b) horizontal — wordmark | THE MAARU / COLLECTIVE
sc = 0.42; ww, wh = W * sc, H * sc
l1, l1w, _ = text_path('THE MAARU', 'barlow-condensed-latin-600-normal', 40, 0, 0, tracking=.34)
l2, l2w, _ = text_path('COLLECTIVE', 'barlow-condensed-latin-600-normal', 40, 0, 0, tracking=.34)
HW = ww + 60 + max(l1w, l2w) + 20
def horiz(a):
    return (f'<g transform="scale({sc})">{g(f"<path fill=\"{a}\" d=\"{word}\"/><path fill=\"{GOLD}\" d=\"{dot}\"/>")}</g>'
            f'<rect x="{ww+22:.0f}" y="{wh*.22:.0f}" width="2.5" height="{wh*.56:.0f}" fill="{GOLD}"/>'
            f'<g transform="translate({ww+48:.0f},{wh*.47:.0f})"><path fill="{a}" d="{l1}"/></g>'
            f'<g transform="translate({ww+48:.0f},{wh*.47+48:.0f})"><path fill="{a}" d="{l2}"/></g>')
save('logo/maaru-collective-horizontal-ink.svg', svg(HW, wh, horiz(INK), 'maaru. The Maaru Collective'))
save('logo/maaru-collective-horizontal-cream.svg', svg(HW, wh, horiz(CREAM), 'maaru. The Maaru Collective'))

# ---------- 3. Monogram: m. ----------
mw_, md_, _, mbb = text_path('m.', 'nunito-800', SIZE, 0, 0, tracking=TRACK, split_last=True)
mx0, my0 = mbb[0] - pad, mbb[1] - pad; MW, MH = mbb[2] - mbb[0] + 2 * pad, mbb[3] - mbb[1] + 2 * pad
mono = lambda a, b: f'<g transform="translate({-mx0:.1f},{-my0:.1f})"><path fill="{a}" d="{mw_}"/><path fill="{b}" d="{md_}"/></g>'
for n, (a, b) in {'ink': (INK, GOLD), 'cream': (CREAM, GOLD), 'ink-mono': (INK, INK)}.items():
    save(f'logo/maaru-monogram-{n}.svg', svg(MW, MH, mono(a, b), 'maaru. monogram'))

# ---------- 4. Favicon (rounded square, m. centred optically) ----------
S = 512; fs = (S * 0.62) / MW
fx = (S - MW * fs) / 2 + 6; fy = (S - MH * fs) / 2 + 8
fav = lambda bgc, a, b, rx: (f'<rect width="{S}" height="{S}" rx="{rx}" fill="{bgc}"/>'
                             f'<g transform="translate({fx:.1f},{fy:.1f}) scale({fs:.4f})">{mono(a, b)}</g>')
save('favicon/favicon.svg', svg(S, S, fav(INK, CREAM, GOLD, 112), 'maaru.'))
save('favicon/favicon-light.svg', svg(S, S, fav(CREAM, INK, GOLD, 112), 'maaru.'))
save('favicon/maskable-icon.svg', svg(S, S, fav(INK, CREAM, GOLD, 0), 'maaru.'))

# ---------- 5. Stamp ----------
SS = 1000; c = SS / 2
def rough_ring(r, w, amp=2.6):
    t = np.linspace(0, 2 * np.pi, 360, endpoint=False)
    k = np.hanning(9); k /= k.sum()
    jo = np.convolve(rng.normal(0, amp, 360 + 8), k, 'valid')[:360]; ji = np.convolve(rng.normal(0, amp, 368), k, 'valid')[:360]
    ro = r + jo; ri = r - w + ji
    o = ' L'.join(f'{c+ro[i]*np.cos(a):.1f} {c+ro[i]*np.sin(a):.1f}' for i, a in enumerate(t))
    inn = ' L'.join(f'{c+ri[i]*np.cos(a):.1f} {c+ri[i]*np.sin(a):.1f}' for i, a in list(enumerate(t))[::-1])
    return f'M{o}Z M{inn}Z'
ring_text = 'THE MAARU COLLECTIVE • THERE’S LIFE IN THE MUNDANE • '
# fit tracking so the text wraps exactly once around r
lo, hi = 0.0, 1.0
for _ in range(30):
    mid = (lo + hi) / 2; _, span = text_on_circle(ring_text, 'barlow-condensed-latin-600-normal', 58, c, c, 352, tracking=mid)
    lo, hi = (mid, hi) if span < 2 * np.pi else (lo, mid)
ring_d, _ = text_on_circle(ring_text, 'barlow-condensed-latin-600-normal', 58, c, c, 352, tracking=lo)
url, _, _ = text_path('MAARU.ME', 'barlow-condensed-latin-600-normal', 36, c, c + 205, tracking=.42, anchor='middle')
est, _, _ = text_path('EST. MMXXVI', 'barlow-condensed-latin-500-normal', 32, c, c - 178, tracking=.42, anchor='middle')
ms = 300 / MW
core = (f'<path d="{rough_ring(468, 14)}"/><path d="{rough_ring(432, 5)}"/><path d="{ring_d}"/>'
        f'<path d="{rough_ring(292, 4)}"/>'
        f'<g transform="translate({c-MW*ms/2:.1f},{c-MH*ms/2+6:.1f}) scale({ms:.4f})"><g transform="translate({-mx0:.1f},{-my0:.1f})"><path d="{mw_} {md_}"/></g></g>'
        f'<path d="{url}"/><path d="{est}"/>')
def ring_pt(rmin, rmax):
    a = rng.uniform(0, 2*np.pi); r = rng.uniform(rmin, rmax); return c + r*np.cos(a), c + r*np.sin(a)
hp = [ring_pt(300, 480) for _ in range(650)] + [ring_pt(0, 290) for _ in range(120)]
holes = ''.join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{abs(rng.normal(0,1))*2.2+0.5:.1f}"/>' for x, y in hp)
wear = ''
for _ in range(6):
    a = rng.uniform(0, 360); x, y = c + 450*np.cos(np.radians(a)), c + 450*np.sin(np.radians(a))
    wear += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rng.uniform(40,90):.0f}" ry="{rng.uniform(4,9):.0f}" transform="rotate({a+90:.0f} {x:.0f} {y:.0f})" opacity="{rng.uniform(.4,.8):.2f}"/>'
mask = (f'<defs><mask id="maaru-wear" maskUnits="userSpaceOnUse" x="0" y="0" width="{SS}" height="{SS}">'
        f'<rect width="{SS}" height="{SS}" fill="#fff"/><g fill="#000">{holes}{wear}</g></mask></defs>')
for n, col, rot in [('ink', INK, -7), ('gold', GOLD, 5), ('cream', CREAM, -3), ('stone', STONE, 3)]:
    save(f'stamp/maaru-stamp-{n}.svg', svg(SS, SS, mask + f'<g mask="url(#maaru-wear)" fill="{col}" transform="rotate({rot} {c} {c})">{core}</g>', 'The Maaru Collective stamp'))
save('stamp/maaru-stamp.svg', svg(SS, SS, mask + f'<g mask="url(#maaru-wear)" fill="currentColor">{core}</g>', 'The Maaru Collective stamp'))

print('ok', round(W), round(H))
