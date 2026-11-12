/** Strip Markdown to plain text (good enough for excerpts, search and reading time). */
export function plain(md = ''): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** First real paragraph of a Markdown body. */
export function firstParagraph(md = ''): string {
  const paras = md.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^(#|!\[|<|```|>|-{3,}|\* |- |\d+\. )/.test(p));
  return plain(paras[0] ?? '');
}

export function excerpt(md = '', max = 180): string {
  const p = firstParagraph(md);
  if (p.length <= max) return p;
  return p.slice(0, p.lastIndexOf(' ', max)).replace(/[,;:.\s]+$/, '') + '…';
}

export function readingTime(md = ''): number {
  const words = plain(md).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Small stable hash, used to pick tilts and sleeve colours per entry. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/** Deterministic tilt between -max and max degrees, one decimal. */
export const tilt = (seed: string, max = 3) => Math.round(((hash(seed) % 1000) / 1000 * 2 - 1) * max * 10) / 10;
