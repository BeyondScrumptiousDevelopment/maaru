// The Wall — everything interactive on the landing page. Only touches .landing.
//  · cursor parallax on the pasted-up pieces (desktop, fine pointer)
//  · drag the photos, the scrap and the stamp around (pointer, or arrow keys when focused)
//  · click/tap a photo, or press Enter/Space, to turn it over
//  · press the stamp (click, tap, Enter/Space, or drop it after dragging) to leave an impression
//  · "Tidy the wall" puts everything back
const root = document.querySelector<HTMLElement>('.landing');

if (root) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const marks = root.querySelector<HTMLElement>('.landing__marks')!;
  const tidy = root.querySelector<HTMLButtonElement>('[data-tidy]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]');
  if (hint) hint.hidden = false;
  let z = 10;
  const touched = () => { tidy.hidden = false; if (hint) hint.hidden = true; };

  // ---------- parallax ----------
  const parallax = [...root.querySelectorAll<HTMLElement>('[data-parallax]')];
  if (fine && matchMedia('(min-width: 900px)').matches && !reduce) {
    let raf = 0;
    root.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        parallax.forEach((p) => {
          if (p.classList.contains('is-dragging')) return;
          const k = Number(p.dataset.parallax) || 0; // max px, ≤ 8
          p.style.setProperty('--px', `${(x * k).toFixed(2)}px`);
          p.style.setProperty('--py', `${(y * k).toFixed(2)}px`);
        });
      });
    });
  }

  // ---------- stamping ----------
  function stampAt(el: HTMLElement) {
    const wall = marks.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const m = document.createElement('span');
    m.className = 'landing__mark';
    m.style.left = `${r.left - wall.left}px`;
    m.style.top = `${r.top - wall.top}px`;
    m.style.width = `${r.width}px`;
    m.style.rotate = `${Math.round(Math.random() * 50 - 25)}deg`;
    marks.appendChild(m);
    while (marks.children.length > 8) marks.firstElementChild!.remove();
    if (!reduce) { el.classList.remove('is-thump'); void el.offsetWidth; el.classList.add('is-thump'); }
    touched();
  }

  // ---------- turning photos over ----------
  function flip(el: HTMLElement) {
    const card = el.querySelector<HTMLElement>('.landing__card');
    const next = !el.classList.contains('is-back');
    const swap = () => { el.classList.toggle('is-back', next); el.setAttribute('aria-pressed', String(next)); };
    if (reduce || !card) swap();
    else {
      card.classList.remove('is-turning'); void card.offsetWidth; card.classList.add('is-turning');
      setTimeout(swap, 180); // halfway through the turn
    }
    touched();
  }

  // ---------- dragging ----------
  // stop the browser's own image drag from hijacking the gesture
  root.addEventListener('dragstart', (e) => { if ((e.target as HTMLElement).closest('[data-drag]')) e.preventDefault(); });
  const pieces = [...root.querySelectorAll<HTMLElement>('[data-drag]')];
  pieces.forEach((el) => {
    // On touch screens, only the small stamp is draggable, so the page still scrolls.
    const draggable = fine || el.hasAttribute('data-stamp');
    if (draggable) el.classList.add('is-draggable');
    let start: { x: number; y: number; dx: number; dy: number } | null = null;
    let moved = false;
    const get = (n: string) => parseFloat(el.style.getPropertyValue(n)) || 0;
    const set = (dx: number, dy: number) => { el.style.setProperty('--dx', `${dx}px`); el.style.setProperty('--dy', `${dy}px`); };

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, dx: get('--dx'), dy: get('--dy') };
      moved = false;
      if (draggable) el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!start || !draggable) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { moved = true; el.classList.add('is-dragging'); el.style.zIndex = String(++z); }
      set(start.dx + dx, start.dy + dy);
    });
    const end = () => {
      if (!start) return;
      el.classList.remove('is-dragging');
      if (moved) {
        touched();
        if (el.hasAttribute('data-stamp')) stampAt(el); // a stamp leaves its mark where you put it down
      } else if (el.hasAttribute('data-flip')) flip(el);
      else if (el.hasAttribute('data-stamp')) stampAt(el);
      start = null;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { start = null; el.classList.remove('is-dragging'); });

    el.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 40 : 12;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) {
        e.preventDefault();
        set(get('--dx') + moves[e.key][0], get('--dy') + moves[e.key][1]);
        el.style.zIndex = String(++z);
        touched();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (el.hasAttribute('data-flip')) flip(el);
        else if (el.hasAttribute('data-stamp')) stampAt(el);
      }
    });
  });

  tidy.addEventListener('click', () => {
    pieces.forEach((el) => {
      el.style.removeProperty('--dx'); el.style.removeProperty('--dy'); el.style.removeProperty('z-index');
      el.classList.remove('is-back');
    });
    pieces.filter((el) => el.hasAttribute('data-flip')).forEach((el) => el.setAttribute('aria-pressed', 'false'));
    marks.replaceChildren();
    tidy.hidden = true;
    if (hint) hint.hidden = false;
    root.querySelector<HTMLElement>('.landing__ticket')?.focus();
  });
}
