// The Wall: subtle cursor parallax on pasted-up pieces (desktop, fine pointer, motion allowed).
const root = document.querySelector<HTMLElement>('.landing');
if (root && matchMedia('(pointer: fine) and (min-width: 900px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const pieces = [...root.querySelectorAll<HTMLElement>('[data-parallax]')];
  let raf = 0;
  root.addEventListener('pointermove', (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      pieces.forEach((p) => {
        const k = Number(p.dataset.parallax) || 0; // max px, ≤ 8
        p.style.setProperty('--px', `${(x * k).toFixed(2)}px`);
        p.style.setProperty('--py', `${(y * k).toFixed(2)}px`);
      });
    });
  });
}
