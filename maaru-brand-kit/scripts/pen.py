"""Renders hand-authored centreline strokes as a pen signature.
Each stroke = SVG path d (centreline). Width varies with pen pressure:
taper at both ends, slightly heavier on downstrokes, tiny natural wobble."""
import numpy as np
from svgpathtools import parse_path
def render_strokes(strokes, base=4.0, contrast=0.6, taper=0.18, seed=3, n_per=500, wobble=0.25):
    rng=np.random.default_rng(seed); polys=[]
    for s in strokes:
        d,wmul=(s if isinstance(s,tuple) else (s,1.0))
        p=parse_path(d); L=p.length(); n=max(60,int(n_per*L/400))
        ts=np.linspace(0,1,n); pts=np.array([p.point(p.ilength(t*L) if 0<t<1 else t) for t in ts])
        P=np.c_[pts.real,pts.imag]
        # gentle hand wobble (low frequency, sub-pixel-ish)
        k=np.hanning(31);k/=k.sum()
        for j in range(2): P[:,j]+=np.convolve(rng.normal(0,wobble,n),k,'same')*5
        T=np.gradient(P,axis=0); T/=np.linalg.norm(T,axis=1,keepdims=True)+1e-9
        N=np.c_[-T[:,1],T[:,0]]
        # pressure: downstroke (dy>0 in svg coords) heavier
        down=np.clip(T[:,1],0,1)
        w=base*wmul*(1-contrast*0.5+contrast*down)
        # taper ends (pen lands quickly, lifts quickly)
        u=np.linspace(0,1,n); tp=np.minimum(1,np.minimum(u/taper,(1-u)/(taper*1.6)))
        w*=(0.04+0.96*np.sin(tp*np.pi/2)**0.8)
        w=np.convolve(np.r_[[w[0]]*7,w,[w[-1]]*7],np.ones(15)/15,'valid')
        A=P+N*(w/2)[:,None]; B=P-N*(w/2)[:,None]
        polys.append(np.vstack([A,B[::-1]]))
    return polys
def polys_to_d(polys,dx=0,dy=0):
    return ' '.join('M'+' L'.join(f'{x+dx:.1f} {y+dy:.1f}' for x,y in P)+'Z' for P in polys)
def bounds(polys):
    a=np.vstack(polys); return a.min(0),a.max(0)
