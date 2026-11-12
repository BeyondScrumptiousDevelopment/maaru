const pad = (n: number) => String(n).padStart(2, '0');
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 12.11.26 — the condensed-label date */
export const short = (d: Date) => `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${String(d.getUTCFullYear()).slice(2)}`;
/** 12 November 2026 */
export const long = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
/** NOV 2026 */
export const monthYear = (d: Date) => `${MONTHS[d.getUTCMonth()].slice(0, 3).toUpperCase()} ${d.getUTCFullYear()}`;
/** 09.26 */
export const mmyy = (d: Date) => `${pad(d.getUTCMonth() + 1)}.${String(d.getUTCFullYear()).slice(2)}`;
export const iso = (d: Date) => d.toISOString().slice(0, 10);

/** 12.11.26 — 19.11.26, or one date */
export const range = (a: Date, b?: Date) => (b ? `${short(a)} — ${short(b)}` : short(a));

/** "3 days ago" style, relative to build time */
export function ago(d: Date, now = new Date()) {
  const days = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} year${days >= 730 ? 's' : ''} ago`;
}

/** 51.5806° N, 0.3420° W */
export function coords(lat?: number, lng?: number) {
  if (lat == null || lng == null) return '';
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
}
