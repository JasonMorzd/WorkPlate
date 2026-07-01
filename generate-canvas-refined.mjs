import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const W = 2400;
const H = 3200;
const CX = W / 2;
const CY = H / 2;

const juraLightB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/Jura-Light.ttf').toString('base64');
const poiretOneB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/PoiretOne-Regular.ttf').toString('base64');
const crimsonProItalicB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/CrimsonPro-Italic.ttf').toString('base64');

function svg(tag, attrs = {}, children = '') {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  if (!children && children !== 0) return `<${tag} ${attrStr}/>`;
  return `<${tag} ${attrStr}>${children}</${tag}>`;
}

const bg        = '#FBFAF7';
const warmGrey  = '#E9E5DF';
const midGrey   = '#D5D0C9';
const darkGrey  = '#8B867F';
const ink       = '#3E3A36';
const citrine   = '#DFB740';
const citrineFill = 'rgba(223,183,64,0.10)';

let elements = '';

// ─── Canvas background ───
elements += svg('rect', { width: W, height: H, fill: bg });

// ─── Ultra-subtle vertical rhythm ───
for (let x = 180; x <= W - 180; x += 240) {
  elements += svg('line', {
    x1: x, y1: 0, x2: x, y2: H,
    stroke: warmGrey, 'stroke-width': '0.4', opacity: '0.4',
  });
}

// ─── Concentric Architecture ───
const R1 = 780;
const R2 = R1 * 0.74;
const R3 = R1 * 0.36;
const R4 = R3 * 0.52;

elements += svg('circle', { cx: CX, cy: CY, r: R1, fill: 'none', stroke: midGrey, 'stroke-width': '0.7' });
elements += svg('circle', { cx: CX, cy: CY, r: R2, fill: 'none', stroke: midGrey, 'stroke-width': '0.5', opacity: '0.65' });
elements += svg('circle', { cx: CX, cy: CY, r: R3, fill: 'none', stroke: darkGrey, 'stroke-width': '1.0' });
elements += svg('circle', { cx: CX, cy: CY, r: R4, fill: citrineFill, stroke: citrine, 'stroke-width': '2.2' });

// ─── Radiating segments ───
const segs = 16;
for (let i = 0; i < segs; i++) {
  const a = (i / segs) * Math.PI * 2 - Math.PI / 2;
  elements += svg('line', {
    x1: CX + Math.cos(a) * R4, y1: CY + Math.sin(a) * R4,
    x2: CX + Math.cos(a) * R1, y2: CY + Math.sin(a) * R1,
    stroke: warmGrey, 'stroke-width': '0.45', opacity: '0.5',
  });
}

// Half-segments (within R2)
for (let i = 0; i < 32; i++) {
  if (i % 2 === 0) continue;
  const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
  elements += svg('line', {
    x1: CX + Math.cos(a) * R3, y1: CY + Math.sin(a) * R3,
    x2: CX + Math.cos(a) * R2, y2: CY + Math.sin(a) * R2,
    stroke: warmGrey, 'stroke-width': '0.3', opacity: '0.35',
  });
}

// ─── Arc Tick Marks (top arc — the scale) ───
const TICK_N = 120;
const ARC_S = -Math.PI * 0.42;
const ARC_E =  Math.PI * 0.42;

for (let i = 0; i <= TICK_N; i++) {
  const t = i / TICK_N;
  const a = ARC_S + t * (ARC_E - ARC_S) - Math.PI / 2;
  const maj = i % 10 === 0;
  const med = i % 5 === 0 && !maj;
  const len = maj ? 38 : med ? 20 : 10;
  const base = R1 + 36;
  const sw = maj ? '1.1' : med ? '0.6' : '0.35';
  const op = maj ? '0.5' : med ? '0.35' : '0.2';

  elements += svg('line', {
    x1: CX + Math.cos(a) * base, y1: CY + Math.sin(a) * base,
    x2: CX + Math.cos(a) * (base + len), y2: CY + Math.sin(a) * (base + len),
    stroke: maj ? darkGrey : midGrey, 'stroke-width': sw, opacity: op,
  });

  if (maj) {
    elements += svg('text', {
      x: CX + Math.cos(a) * (base + len + 48), y: CY + Math.sin(a) * (base + len + 48),
      'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: darkGrey, 'font-family': "'Jura Refined', sans-serif",
      'font-size': '16', 'font-weight': '300', 'letter-spacing': '2', opacity: '0.45',
    }, String(i));
  }
}

// Bottom arc (subtler, no labels)
for (let i = 0; i <= TICK_N; i++) {
  const t = i / TICK_N;
  const a = Math.PI * 0.58 + t * (Math.PI * 0.84) - Math.PI / 2;
  const maj = i % 10 === 0;
  const len = maj ? 24 : 8;
  const base = R1 + 32;
  elements += svg('line', {
    x1: CX + Math.cos(a) * base, y1: CY + Math.sin(a) * base,
    x2: CX + Math.cos(a) * (base + len), y2: CY + Math.sin(a) * (base + len),
    stroke: midGrey, 'stroke-width': maj ? '0.8' : '0.3', opacity: maj ? '0.4' : '0.18',
  });
}

// ─── Citrine highlight dots on arc ───
const hlIdxs = [4, 10, 17, 25, 34];
for (const idx of hlIdxs) {
  const a = ARC_S + (idx / TICK_N) * (ARC_E - ARC_S) - Math.PI / 2;
  const dr = R1 + 47;
  elements += svg('circle', {
    cx: CX + Math.cos(a) * dr, cy: CY + Math.sin(a) * dr,
    r: '3.5', fill: citrine, opacity: '0.65',
  });
}

// ─── Weighted interior dots ───
const dots = [
  { r: 0.50, a: -0.38, s: 3.8, o: 0.5 },
  { r: 0.56, a: -0.12, s: 2.5, o: 0.38 },
  { r: 0.47, a: 0.10, s: 4.0, o: 0.52 },
  { r: 0.53, a: 0.32, s: 2.8, o: 0.42 },
  { r: 0.60, a: -0.48, s: 2.2, o: 0.33 },
  { r: 0.43, a: 0.55, s: 3.5, o: 0.48 },
  { r: 0.64, a: 0.18, s: 1.8, o: 0.28 },
];
for (const d of dots) {
  const a = d.a - Math.PI / 2;
  const rr = R1 * d.r;
  elements += svg('circle', {
    cx: CX + Math.cos(a) * rr, cy: CY + Math.sin(a) * rr,
    r: d.s, fill: darkGrey, opacity: d.o,
  });
}

// ─── Framing rules ───
elements += svg('line', { x1: 260, y1: 220, x2: W - 260, y2: 220, stroke: midGrey, 'stroke-width': '0.45', opacity: '0.55' });
elements += svg('line', { x1: 260, y1: H - 220, x2: W - 260, y2: H - 220, stroke: midGrey, 'stroke-width': '0.45', opacity: '0.55' });

// ─── Clinical header annotations ───
elements += svg('text', {
  x: 260, y: 185, fill: darkGrey,
  'font-family': "'Jura Refined', sans-serif", 'font-size': '18', 'font-weight': '300',
  'letter-spacing': '5', opacity: '0.4',
}, 'OBSERVATION NO. 042');

elements += svg('text', {
  x: W - 260, y: 185, 'text-anchor': 'end', fill: darkGrey,
  'font-family': "'Jura Refined', sans-serif", 'font-size': '18', 'font-weight': '300',
  'letter-spacing': '5', opacity: '0.4',
}, 'SERIES \u03A3-7');

// ─── Footer references ───
elements += svg('text', {
  x: 260, y: H - 160, fill: midGrey,
  'font-family': "'Jura Refined', sans-serif", 'font-size': '14', 'font-weight': '300',
  'letter-spacing': '3', opacity: '0.3',
}, 'CALIBRATED AT \u00B10.01g \u00B7 22\u00B0C \u00B7 45% RH');

elements += svg('text', {
  x: W - 260, y: H - 160, 'text-anchor': 'end', fill: midGrey,
  'font-family': "'Jura Refined', sans-serif", 'font-size': '14', 'font-weight': '300',
  'letter-spacing': '3', opacity: '0.3',
}, 'ARCHIVE REF: LUM-RED/\u03A3-7.042');

// ─── Title — "REDUCTION" ───
elements += svg('text', {
  x: CX, y: CY + R1 + 200,
  'text-anchor': 'middle', fill: ink,
  'font-family': "'Poiret One Refined', serif", 'font-size': '52', 'font-weight': '400',
  'letter-spacing': '16', opacity: '0.68',
}, 'R E D U C T I O N');

// ─── Subtitle ───
elements += svg('text', {
  x: CX, y: CY + R1 + 275,
  'text-anchor': 'middle', fill: darkGrey,
  'font-family': "'Jura Refined', sans-serif", 'font-size': '15', 'font-weight': '300',
  'letter-spacing': '8', opacity: '0.32',
}, 'A STUDY IN GRADUAL LUMINOUS TRANSFORMATION');

// ─── Center word ───
elements += svg('text', {
  x: CX, y: CY - 6,
  'text-anchor': 'middle', 'dominant-baseline': 'central',
  fill: citrine,
  'font-family': "'Poiret One Refined', serif", 'font-size': '26', 'font-weight': '400',
  'letter-spacing': '10', opacity: '0.6',
}, 'LIGHT');

// ─── Greek data markers ───
const greeks = [
  { x: 340, y: CY - R1 * 0.42, t: '\u03B1' },
  { x: 340, y: CY - R1 * 0.10, t: '\u03B2' },
  { x: 340, y: CY + R1 * 0.18, t: '\u03B3' },
  { x: 340, y: CY + R1 * 0.44, t: '\u03B4' },
];
for (const g of greeks) {
  elements += svg('text', {
    x: g.x, y: g.y, fill: darkGrey,
    'font-family': "'Crimson Pro Refined', serif", 'font-size': '18',
    'font-style': 'italic', opacity: '0.3', 'dominant-baseline': 'central',
  }, g.t);
}

// ─── Corner reference squares ───
const sq = 10;
elements += svg('rect', { x: 260 - sq/2, y: 220 - sq/2, width: sq, height: sq, fill: 'none', stroke: citrine, 'stroke-width': '1.2', opacity: '0.45' });
elements += svg('rect', { x: W - 260 - sq/2, y: 220 - sq/2, width: sq, height: sq, fill: 'none', stroke: citrine, 'stroke-width': '1.2', opacity: '0.45' });
elements += svg('rect', { x: 260 - sq/2, y: H - 220 - sq/2, width: sq, height: sq, fill: 'none', stroke: citrine, 'stroke-width': '1.2', opacity: '0.45' });
elements += svg('rect', { x: W - 260 - sq/2, y: H - 220 - sq/2, width: sq, height: sq, fill: 'none', stroke: citrine, 'stroke-width': '1.2', opacity: '0.45' });

// ─── Embedded fonts ───
const fontCSS = `
@font-face {
  font-family: 'Jura Refined';
  src: url(data:font/truetype;charset=utf-8;base64,${juraLightB64}) format('truetype');
  font-weight: 300; font-style: normal;
}
@font-face {
  font-family: 'Poiret One Refined';
  src: url(data:font/truetype;charset=utf-8;base64,${poiretOneB64}) format('truetype');
  font-weight: 400; font-style: normal;
}
@font-face {
  font-family: 'Crimson Pro Refined';
  src: url(data:font/truetype;charset=utf-8;base64,${crimsonProItalicB64}) format('truetype');
  font-weight: 400; font-style: italic;
}
`;

const styleBlock = svg('style', { type: 'text/css' }, fontCSS);

const fullSvg = svg('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: W, height: H,
  viewBox: `0 0 ${W} ${H}`,
}, styleBlock + elements);

writeFileSync('artwork-luminous-reduction.svg', fullSvg);
console.log('Refined SVG written.');

sharp(Buffer.from(fullSvg))
  .png({ compressionLevel: 0 })
  .toFile('artwork-luminous-reduction.png')
  .then(info => console.log('Masterpiece PNG written:', info))
  .catch(err => console.error('Error:', err));
