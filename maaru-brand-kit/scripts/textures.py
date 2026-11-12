"""Procedural, tileable MAARU textures + graphic marks."""
import numpy as np, sys
from PIL import Image, ImageFilter
sys.path.insert(0, '/home/claude/maaru-kit/scripts')
from pen import render_strokes, polys_to_d, bounds
K = '/home/claude/maaru-kit/maaru-brand-kit'
rng = np.random.default_rng(42)
hexrgb = lambda h: np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], float)
INK, BEIGE, CREAM, GOLD, STONE = map(hexrgb, ['#171614', '#C7B49D', '#E9DFD0', '#A88955', '#786B5D'])

def tile_noise(n, scale):
    """Tileable value noise via FFT-filtered white noise (periodic by construction)."""
    w = rng.normal(0, 1, (n, n)); f = np.fft.fft2(w)
    fy = np.fft.fftfreq(n)[:, None]; fx = np.fft.fftfreq(n)[None, :]
    r = np.sqrt(fx**2 + fy**2) * n / scale
    out = np.real(np.fft.ifft2(f * np.exp(-r**2)))
    return (out - out.mean()) / (out.std() + 1e-9)

def fbm(n, scales, weights):
    return sum(w * tile_noise(n, s) for s, w in zip(scales, weights))

def to_img(arr): return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def plaster(name, base, dark, n=1024, crack=True, strength=1.0):
    h = fbm(n, [3, 8, 24, 80, 260], [1.0, .6, .45, .3, .25]) * strength
    t = (h - h.min()) / (h.max() - h.min())
    img = base[None, None, :] * (1 - .16 * (t[..., None] - .5))
    # trowel patches: broad soft darker blotches
    blot = np.clip(tile_noise(n, 2.5) - .6, 0, None); img = img * (1 - .07 * blot[..., None]) + dark * .07 * blot[..., None]
    # pitting
    pits = (rng.random((n, n)) > .9985).astype(float)
    pits = np.array(Image.fromarray((pits * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))) / 255.
    img = img * (1 - .5 * pits[..., None]) + dark * .5 * pits[..., None]
    if crack:
        # hairline cracks: thresholded ridges of low-freq noise
        r = np.abs(tile_noise(n, 6) + .5 * tile_noise(n, 14))
        cr = np.clip(1 - r / .035, 0, 1) * (tile_noise(n, 3) > .4)
        img = img * (1 - .09 * cr[..., None]) + dark * .09 * cr[..., None]
    img += rng.normal(0, 3.2, (n, n, 1))  # fine grain
    to_img(img).save(f'{K}/textures/{name}.jpg', quality=84, optimize=True, progressive=True)

plaster('plaster-cream', CREAM, STONE)
plaster('plaster-beige', BEIGE, STONE)
plaster('concrete-stone', STONE, INK, strength=1.3)
plaster('wall-ink', INK + 6, np.array([0, 0, 0.]), crack=False)

# paper grain: fine fibrous, tileable, cream
n = 512
fib = fbm(n, [60, 140, 256], [.6, .5, .4]); fib += .4 * np.roll(tile_noise(n, 90), 1, 1)
img = CREAM[None, None, :] + fib[..., None] * 4.5 + rng.normal(0, 2.5, (n, n, 1))
to_img(img).save(f'{K}/textures/paper-cream.jpg', quality=86)

# overlays (transparent PNG, blend with mix-blend-mode: multiply)
def overlay(name, alpha, col=INK, n=512):
    a = np.clip(alpha, 0, 1) * 255; rgb = np.broadcast_to(col, (n, n, 3))
    Image.fromarray(np.dstack([rgb, a]).astype(np.uint8), 'RGBA').save(f'{K}/textures/{name}.png', optimize=True)
g = rng.normal(0, 1, (512, 512)); overlay('grain-overlay', np.clip(np.abs(g) - 1.0, 0, None) * .22)
# photocopy speckle: sparse dark specks + toner streaks
sp = (rng.random((512, 512)) > .9965).astype(float)
sp = np.array(Image.fromarray((sp * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7))) / 255. * 1.8
streak = np.clip(np.tile(tile_noise(512, 40)[:1, :], (512, 1)) - 2.2, 0, None) * .06
overlay('photocopy-overlay', sp + streak)

# ---------- SVG graphics ----------
def svg(w, h, body, extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" preserveAspectRatio="none" aria-hidden="true"{extra}>{body}</svg>\n'
# torn paper edges (tile horizontally — ends match at y)
def torn(w=1600, h=90, seed=1):
    r = np.random.default_rng(seed); xs = np.linspace(0, w, 420)
    y = 40 + np.cumsum(r.normal(0, 2.2, len(xs))); y -= np.linspace(0, y[-1] - y[0], len(xs))  # close loop
    y += r.normal(0, 1.4, len(xs)) + 8 * np.sin(xs / w * 2 * np.pi * 3 + seed)
    y = np.clip(y, 8, h - 8)
    fib = ''.join(f' L{x:.1f} {yy + (r.random()*6 if r.random() > .85 else 0):.1f}' for x, yy in zip(xs, y))
    return f'M0 {h} L0 {y[0]:.1f}{fib} L{w} {h}Z'
for i, (nm, col) in enumerate([('cream', '#E9DFD0'), ('beige', '#C7B49D'), ('ink', '#171614')]):
    d = torn(seed=i + 3)
    open(f'{K}/graphics/torn-edge-{nm}.svg', 'w').write(svg(1600, 90, f'<path fill="{col}" d="{d}"/>'))

# brush / pen marks using the pen renderer (gold = aged ink, slightly broken)
def mark(name, strokes, col, base, con, pad=12, extra_holes=0):
    polys = render_strokes(strokes, base=base, contrast=con, seed=9, wobble=.4, taper=.22)
    mn, mx = bounds(polys); d = polys_to_d(polys, -mn[0] + pad, -mn[1] + pad); w, h = mx - mn + 2 * pad
    body = f'<path fill="{col}" d="{d}"/>'
    if extra_holes:
        r = np.random.default_rng(5)
        holes = ''.join(f'<circle cx="{r.uniform(0,w):.0f}" cy="{r.uniform(0,h):.0f}" r="{r.uniform(.4,1.6):.1f}"/>' for _ in range(extra_holes))
        body = f'<defs><mask id="m-{name}"><rect width="{w:.0f}" height="{h:.0f}" fill="#fff"/><g fill="#000">{holes}</g></mask></defs><g mask="url(#m-{name})">{body}</g>'
    open(f'{K}/graphics/{name}.svg', 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" aria-hidden="true">{body}</svg>\n')
mark('underline-gold', [("M0 20 C 120 8, 300 6, 520 16",1.0), ("M14 24 C 140 13, 300 12, 470 19",.5)], '#A88955', 8, .3, extra_holes=60)
mark('underline-ink', ["M0 18 C 140 10, 320 12, 480 6"], '#171614', 5, .3)
mark('circle-gold', ["M120 20 C 40 18, 6 70, 30 110 C 60 158, 200 160, 238 104 C 266 60, 220 14, 140 22 C 110 26, 96 34, 90 40"], '#A88955', 5, .4, extra_holes=40)
mark('arrow-ink', ["M10 80 C 60 70, 120 40, 200 30", "M176 14 C 186 22, 196 28, 202 30 C 196 38, 188 48, 184 58"], '#171614', 3.2, .4)
r_ = np.random.default_rng(3)
bristles = []
for k in range(9):
    off = (k - 4) * 6.5; L = 760 * r_.uniform(.72, 1.0); s0 = r_.uniform(0, 30)
    bristles.append((f"M{s0:.0f} {40+off:.1f} C {200:.0f} {20+off:.1f}, {500*L/760:.0f} {30+off*.8:.1f}, {L:.0f} {22+off*.6:.1f}", r_.uniform(.6, 1.2)))
mark('brush-swipe-gold', bristles, '#A88955', 7, .2, extra_holes=120)
mark('scribble-ink', ["M0 30 C 20 0, 40 60, 60 30 C 80 0, 100 60, 120 30 C 140 0, 160 60, 180 30"], '#171614', 2.6, .3)
mark('cross-ink', ["M0 0 C 10 12, 22 26, 34 38", "M34 2 C 24 14, 12 26, 2 36"], '#171614', 3.4, .3)
print('textures ok')
