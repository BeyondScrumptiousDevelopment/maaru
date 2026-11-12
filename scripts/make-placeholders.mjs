// Generates the placeholder "film frames" in src/assets/placeholder/.
// Tonal fields from the MAARU palette + simple abstract scenes + film grain,
// a thin frame border and a condensed caption. Replace any file with a real
// photo of the same name (any aspect ratio works) — nothing else needs to change.
//
//   npm run placeholders          (only creates missing files)
//   npm run placeholders -- --force
import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('src/assets/placeholder');
const force = process.argv.includes('--force');

const R = { '4:5': [1120, 1400], '3:2': [1500, 1000], '1:1': [1200, 1200], '16:9': [1600, 900], '9:16': [900, 1600], '2:3': [1000, 1500] };

// tone sets: [ground, mid, dark, light]
const T = {
  cream: ['#E9DFD0', '#C7B49D', '#786B5D', '#F2EADF'],
  beige: ['#C7B49D', '#A8957E', '#5E5347', '#DED2C0'],
  stone: ['#786B5D', '#5E5347', '#2A2724', '#A8957E'],
  ink:   ['#2A2724', '#3B3632', '#171614', '#786B5D'],
  bw:    ['#BDBAB4', '#8C8984', '#3A3836', '#DAD7D1'],
  bwdark:['#5A5856', '#3A3836', '#1C1B1A', '#9C9994'],
  warm:  ['#C9A57A', '#A88955', '#6E5A38', '#E2C9A6'],
};

// abstract scenes — deliberately simple shapes, never pretending to be real photos
function scene(kind, w, h, [g, m, d, l], seed) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const parts = [];
  switch (kind) {
    case 'street': { // horizon, kerb, a lamppost, a bus-shaped block
      const hz = h * (0.52 + rnd() * 0.1);
      parts.push(`<rect y="${hz}" width="${w}" height="${h - hz}" fill="${m}"/>`);
      parts.push(`<polygon points="0,${h} ${w * 0.42},${hz} ${w * 0.58},${hz} ${w},${h}" fill="${d}" opacity="0.35"/>`);
      for (let i = 0; i < 5; i++) { const x = rnd() * w * 0.9; const bh = h * (0.12 + rnd() * 0.25); parts.push(`<rect x="${x}" y="${hz - bh}" width="${w * (0.06 + rnd() * 0.12)}" height="${bh}" fill="${d}" opacity="${0.35 + rnd() * 0.4}"/>`); }
      parts.push(`<rect x="${w * 0.72}" y="${hz - h * 0.42}" width="${w * 0.012}" height="${h * 0.42}" fill="${d}"/>`);
      break; }
    case 'facade': { // grid of windows, one lit
      const cols = 4 + Math.floor(rnd() * 3), rows = 5 + Math.floor(rnd() * 3);
      const pw = w * 0.82, ph = h * 0.8, ox = w * 0.09 + (rnd() - 0.5) * w * 0.1, oy = h * 0.06;
      parts.push(`<rect x="${ox - w * 0.03}" y="${oy - h * 0.02}" width="${pw + w * 0.06}" height="${h}" fill="${m}"/>`);
      const lit = Math.floor(rnd() * cols * rows);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const cw = pw / cols, rh = ph / rows;
        parts.push(`<rect x="${ox + c * cw + cw * 0.18}" y="${oy + r * rh + rh * 0.2}" width="${cw * 0.64}" height="${rh * 0.55}" fill="${r * cols + c === lit ? l : d}" opacity="${r * cols + c === lit ? 0.9 : 0.55 + rnd() * 0.3}"/>`);
      }
      break; }
    case 'stairs': { // diagonal shadow steps
      const n = 7 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) { const y = (h / n) * i; parts.push(`<polygon points="0,${y} ${w},${y + h * 0.18} ${w},${y + h * 0.18 + h / n * 0.5} 0,${y + h / n * 0.5}" fill="${i % 2 ? d : m}" opacity="${0.35 + (i / n) * 0.5}"/>`); }
      break; }
    case 'sun': { // flat land, low sun, salt-flat line
      const hz = h * (0.6 + rnd() * 0.12);
      parts.push(`<circle cx="${w * (0.25 + rnd() * 0.5)}" cy="${hz - h * 0.16}" r="${Math.min(w, h) * 0.09}" fill="${l}" opacity="0.9"/>`);
      parts.push(`<rect y="${hz}" width="${w}" height="${h - hz}" fill="${l}" opacity="0.65"/>`);
      parts.push(`<rect y="${hz - 3}" width="${w}" height="${h * 0.01}" fill="${d}" opacity="0.5"/>`);
      break; }
    case 'record': { // a record on a counter
      const cx = w * (0.4 + rnd() * 0.2), cy = h * (0.45 + rnd() * 0.1), r = Math.min(w, h) * 0.32;
      parts.push(`<rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="${m}"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${d}"/>`);
      for (let i = 1; i < 6; i++) parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * (0.4 + i * 0.1)}" fill="none" stroke="${m}" stroke-opacity="0.25" stroke-width="2"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${l}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.03}" fill="${d}"/>`);
      break; }
    case 'shadow': { // hard window-light shadow across a wall
      parts.push(`<polygon points="${w * 0.2},0 ${w * 0.75},0 ${w * 0.95},${h} ${w * 0.4},${h}" fill="${l}" opacity="0.55"/>`);
      for (let i = 1; i < 4; i++) parts.push(`<line x1="${w * (0.2 + i * 0.14)}" y1="0" x2="${w * (0.4 + i * 0.14)}" y2="${h}" stroke="${d}" stroke-width="${w * 0.02}" opacity="0.6"/>`);
      break; }
    case 'water': { // sea, sky, a dhow-ish triangle
      const hz = h * (0.45 + rnd() * 0.1);
      parts.push(`<rect y="${hz}" width="${w}" height="${h - hz}" fill="${m}"/>`);
      for (let i = 0; i < 9; i++) { const y = hz + (h - hz) * (i / 9) + 6; parts.push(`<rect x="${rnd() * w * 0.5}" y="${y}" width="${w * (0.2 + rnd() * 0.5)}" height="3" fill="${l}" opacity="0.35"/>`); }
      const bx = w * (0.3 + rnd() * 0.4);
      parts.push(`<polygon points="${bx},${hz - h * 0.2} ${bx},${hz + 2} ${bx + w * 0.12},${hz + 2}" fill="${d}" opacity="0.8"/><rect x="${bx - w * 0.05}" y="${hz}" width="${w * 0.2}" height="${h * 0.025}" fill="${d}"/>`);
      break; }
    case 'object': { // a single object on a table: tiffin stack / cup
      parts.push(`<rect y="${h * 0.66}" width="${w}" height="${h * 0.34}" fill="${m}"/>`);
      const cx = w * 0.5, bw = w * 0.26;
      for (let i = 0; i < 3; i++) parts.push(`<rect x="${cx - bw / 2}" y="${h * 0.66 - (i + 1) * h * 0.12}" width="${bw}" height="${h * 0.11}" fill="${i % 2 ? l : d}" opacity="0.85"/>`);
      parts.push(`<rect x="${cx - bw * 0.06}" y="${h * 0.66 - h * 0.44}" width="${bw * 0.12}" height="${h * 0.08}" fill="${d}"/>`);
      break; }
    default: break;
  }
  return parts.join('');
}

const list = [
  // visuals
  ['visuals/station-road-01', '3:2', 'street', 'bw', 'STATION ROAD'], ['visuals/station-road-02', '4:5', 'facade', 'bw', 'STATION ROAD — FLATS'],
  ['visuals/station-road-03', '16:9', 'street', 'bwdark', 'BUS STOP, 12:04'], ['visuals/station-road-04', '1:1', 'shadow', 'bw', 'SHOPFRONT SHADOW'],
  ['visuals/station-road-05', '4:5', 'stairs', 'bwdark', 'CAR PARK STAIRS'], ['visuals/station-road-06', '3:2', 'facade', 'bwdark', 'ABOVE THE BOOKIES'],
  ['visuals/station-road-07', '2:3', 'shadow', 'bw', 'NOON, WEST SIDE'], ['visuals/station-road-08', '3:2', 'street', 'bw', 'CROSSING'],
  ['visuals/salt-white-01', '3:2', 'sun', 'cream', 'RANN — EDGE'], ['visuals/salt-white-02', '4:5', 'sun', 'warm', 'SALT, 17:40'],
  ['visuals/salt-white-03', '16:9', 'sun', 'cream', 'FLAT, FLATTER'], ['visuals/salt-white-04', '1:1', 'object', 'warm', 'CHAI GLASS'],
  ['visuals/salt-white-05', '2:3', 'water', 'beige', 'MANDVI SHORE'], ['visuals/salt-white-06', '3:2', 'water', 'warm', 'DHOW YARD'],
  ['visuals/upper-hill-01', '16:9', 'street', 'stone', 'UPPER HILL — RAIN'], ['visuals/upper-hill-02', '9:16', 'facade', 'stone', 'OFFICE BLOCK, WET'],
  ['visuals/upper-hill-03', '3:2', 'street', 'ink', 'MATATU STAGE'],
  ['visuals/stairwell-01', '4:5', 'stairs', 'beige', 'STAIRWELL — 3F'], ['visuals/stairwell-02', '2:3', 'shadow', 'beige', 'HANDRAIL'],
  ['visuals/stairwell-03', '1:1', 'stairs', 'stone', 'LANDING LIGHT'], ['visuals/stairwell-04', '3:2', 'shadow', 'cream', 'GLASS BLOCKS'],
  ['visuals/stairwell-05', '4:5', 'stairs', 'cream', 'STAIRWELL — 5F'],
  ['visuals/counter-01', '1:1', 'record', 'ink', 'THE COUNTER'], ['visuals/counter-02', '4:5', 'record', 'stone', 'NEW IN, SATURDAY'],
  ['visuals/counter-03', '3:2', 'facade', 'ink', 'CRATES'], ['visuals/counter-04', '4:5', 'object', 'stone', 'THE KETTLE BEHIND'],
  // journal
  ['journal/route-140', '3:2', 'street', 'bw', 'HARROW — 07:12'], ['journal/car-park', '4:5', 'facade', 'beige', 'MULTI-STOREY'],
  ['journal/tiffin', '4:5', 'object', 'warm', 'THREE NAMES'],
  // elsewhere
  ['elsewhere/harrow-01', '3:2', 'street', 'bw', 'HARROW ON THE HILL'], ['elsewhere/harrow-02', '4:5', 'facade', 'bwdark', 'CHURCH HILL'],
  ['elsewhere/harrow-03', '1:1', 'shadow', 'bw', 'LOWLANDS ROAD'],
  ['elsewhere/mandvi-01', '3:2', 'water', 'warm', 'MANDVI'], ['elsewhere/mandvi-02', '4:5', 'object', 'warm', 'DABELI CART'],
  ['elsewhere/mandvi-03', '16:9', 'water', 'beige', 'RUKMAVATI BRIDGE'],
  ['elsewhere/nairobi-01', '3:2', 'facade', 'stone', 'KILIMANI'], ['elsewhere/nairobi-02', '4:5', 'street', 'stone', 'NGONG ROAD'],
  ['elsewhere/nairobi-03', '1:1', 'record', 'ink', 'RIVER ROAD SHOP'],
  ['elsewhere/margate-01', '16:9', 'water', 'cream', 'MARGATE — LOW TIDE'], ['elsewhere/margate-02', '4:5', 'facade', 'cream', 'ARLINGTON HOUSE'],
  ['elsewhere/bhuj-01', '3:2', 'sun', 'warm', 'BHUJ — HILL'], ['elsewhere/bhuj-02', '2:3', 'stairs', 'warm', 'STEPWELL'],
  // experiments
  ['experiments/bus-stop-type', '3:2', 'facade', 'cream', 'BUS STOP SIGN, TRACED'], ['experiments/lift-recordings', '1:1', 'shadow', 'stone', 'LIFT 2 — DOORS'],
  ['experiments/zine', '4:5', 'object', 'beige', 'A4, FOLDED'], ['experiments/plaster', '1:1', 'shadow', 'cream', 'PLASTER TEST 04'],
  // about
  ['about/portrait', '4:5', 'shadow', 'beige', 'PORTRAIT GOES HERE'],
  // landing
  ['../../landing/assets/frame-07', '4:5', 'street', 'bw', 'FRAME 07 — HARROW'], ['../../landing/assets/frame-12', '3:2', 'water', 'warm', 'FRAME 12 — MANDVI'],
  // home index peeks
  ['home/peek-frequencies', '1:1', 'record', 'ink', 'FREQUENCIES'],
];

const exists = (p) => access(p).then(() => true, () => false);
let i = 0, made = 0;
for (const [name, ratio, kind, tone, label] of list) {
  i++;
  const file = path.join(OUT, `${name}.jpg`);
  if (!force && (await exists(file))) continue;
  await mkdir(path.dirname(file), { recursive: true });
  const [w, h] = R[ratio];
  const tones = T[tone];
  const b = Math.round(Math.min(w, h) * 0.03);
  const fs = Math.round(Math.min(w, h) * 0.026);
  const lum = parseInt(tones[0].slice(1, 3), 16) * 0.3 + parseInt(tones[0].slice(3, 5), 16) * 0.59 + parseInt(tones[0].slice(5, 7), 16) * 0.11;
  const ink = lum > 140 ? tones[2] : tones[3];
  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${tones[0]}"/>${scene(kind, w, h, tones, i * 7919)}</svg>`;
  const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="none" stroke="${ink}" stroke-opacity="0.45" stroke-width="2"/>
    <text x="${b * 1.6}" y="${h - b * 1.6}" font-family="DejaVu Sans Condensed, Arial Narrow, sans-serif" font-size="${fs}" letter-spacing="${fs * 0.22}" fill="${ink}" fill-opacity="0.85">PLACEHOLDER — ${ratio} — ${label}</text></svg>`;
  const noise = await sharp({ create: { width: w, height: h, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 22 } } }).blur(0.5).png().toBuffer();
  await sharp(Buffer.from(base)).blur(Math.min(w, h) * 0.004)
    .composite([{ input: noise, blend: 'soft-light' }, { input: Buffer.from(frame) }])
    .jpeg({ quality: 70, mozjpeg: true }).toFile(file);
  made++;
}
console.log(`placeholders: ${made} written, ${list.length - made} kept`);
