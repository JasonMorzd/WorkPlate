import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const W = 2400;
const H = 3200;
const CX = W / 2;
const CY = H / 2;

// Load fonts as base64
const juraLightB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/Jura-Light.ttf').toString('base64');
const poiretOneB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/PoiretOne-Regular.ttf').toString('base64');
const crimsonProB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/CrimsonPro-Regular.ttf').toString('base64');
const crimsonProItalicB64 = readFileSync('c:/Users/Administrator/.trae/skills/canvas-design/canvas-fonts/CrimsonPro-Italic.ttf').toString('base64');

function svg(tag, attrs = {}, children = '') {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  if (!children && children !== 0) return `<${tag} ${attrStr}/>`;
  return `<${tag} ${attrStr}>${children}</${tag}>`;
}

// ─── Color Palette ───
const bg        = '#FBF9F5';
const warmGrey  = '#E8E4DE';
const midGrey   = '#D4CFC8';
const darkGrey  = '#8A857D';
const ink       = '#3D3935';
const citrine   = '#E0B843';
const citrineSoft = 'rgba(224,184,67,0.12)';

// ─── Build SVG ───
let elements = '';

// Background
elements += svg('rect', { width: W, height: H, fill: bg });

// ─── Subtle background texture: ultra-thin vertical rules ───
for (let x = 120; x < W; x += 180) {
  elements += svg('line', {
    x1: x, y1: 0, x2: x, y2: H,
    stroke: warmGrey, 'stroke-width': '0.5', opacity: '0.5',
  });
}

// ─── Central Circular Architecture ───
const mainR = 820;
elements += svg('circle', {
  cx: CX, cy: CY, r: mainR,
  fill: 'none', stroke: midGrey, 'stroke-width': '0.8',
});

elements += svg('circle', {
  cx: CX, cy: CY, r: mainR * 0.72,
  fill: 'none', stroke: midGrey, 'stroke-width': '0.6',
  opacity: '0.7',
});

const innerR = mainR * 0.34;
elements += svg('circle', {
  cx: CX, cy: CY, r: innerR,
  fill: 'none', stroke: darkGrey, 'stroke-width': '1.2',
});

elements += svg('circle', {
  cx: CX, cy: CY, r: innerR * 0.55,
  fill: citrineSoft, stroke: citrine, 'stroke-width': '2.5',
});

// ─── Radiating Segments ───
const segments = 16;
for (let i = 0; i < segments; i++) {
  const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
  const x1 = CX + Math.cos(angle) * (innerR * 0.55);
  const y1 = CY + Math.sin(angle) * (innerR * 0.55);
  const x2 = CX + Math.cos(angle) * mainR;
  const y2 = CY + Math.sin(angle) * mainR;
  elements += svg('line', { x1, y1, x2, y2, stroke: warmGrey, 'stroke-width': '0.5', opacity: '0.6' });
}

const halfSegments = 32;
for (let i = 0; i < halfSegments; i++) {
  const angle = (i / halfSegments) * Math.PI * 2 - Math.PI / 2;
  if (i % 2 === 0) continue;
  const x1 = CX + Math.cos(angle) * (innerR * 0.7);
  const y1 = CY + Math.sin(angle) * (innerR * 0.7);
  const x2 = CX + Math.cos(angle) * (mainR * 0.72);
  const y2 = CY + Math.sin(angle) * (mainR * 0.72);
  elements += svg('line', { x1, y1, x2, y2, stroke: warmGrey, 'stroke-width': '0.35', opacity: '0.4' });
}

// ─── Measurement Tick Marks along outer arc (top) ───
const tickCount = 120;
const arcStart = -Math.PI * 0.45;
const arcEnd   =  Math.PI * 0.45;

for (let i = 0; i <= tickCount; i++) {
  const t = i / tickCount;
  const angle = arcStart + t * (arcEnd - arcStart) - Math.PI / 2;
  const isMajor = i % 10 === 0;
  const isMedium = i % 5 === 0 && !isMajor;
  const tickLen = isMajor ? 42 : isMedium ? 24 : 12;
  const innerEdge = mainR + 30;
  const sw = isMajor ? '1.2' : isMedium ? '0.7' : '0.4';
  const op = isMajor ? '0.55' : isMedium ? '0.4' : '0.25';
  const col = isMajor ? darkGrey : midGrey;

  const x1 = CX + Math.cos(angle) * innerEdge;
  const y1 = CY + Math.sin(angle) * innerEdge;
  const x2 = CX + Math.cos(angle) * (innerEdge + tickLen);
  const y2 = CY + Math.sin(angle) * (innerEdge + tickLen);
  elements += svg('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': sw, opacity: op });

  if (isMajor) {
    const labelR = innerEdge + tickLen + 55;
    const lx = CX + Math.cos(angle) * labelR;
    const ly = CY + Math.sin(angle) * labelR;
    elements += svg('text', {
      x: lx, y: ly,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: darkGrey,
      'font-family': "'Jura Custom', sans-serif",
      'font-size': '18',
      'font-weight': '300',
      'letter-spacing': '2',
      opacity: '0.5',
    }, String(i));
  }
}

// Bottom arc ticks
const arcStartB = Math.PI * 0.55;
const arcEndB   = Math.PI * 1.45;
for (let i = 0; i <= tickCount; i++) {
  const t = i / tickCount;
  const angle = arcStartB + t * (arcEndB - arcStartB) - Math.PI / 2;
  const isMajor = i % 10 === 0;
  const tickLen = isMajor ? 28 : 10;
  const innerEdge = mainR + 28;
  const sw = isMajor ? '1.0' : '0.35';
  const op = isMajor ? '0.45' : '0.2';
  const x1 = CX + Math.cos(angle) * innerEdge;
  const y1 = CY + Math.sin(angle) * innerEdge;
  elements += svg('line', { x1, y1, x2: CX + Math.cos(angle) * (innerEdge + tickLen), y2: CY + Math.sin(angle) * (innerEdge + tickLen), stroke: midGrey, 'stroke-width': sw, opacity: op });
}

// ─── Citrine accent dots ───
const highlightAngles = [3, 8, 14, 22, 31];
for (const idx of highlightAngles) {
  const t = idx / tickCount;
  const angle = arcStart + t * (arcEnd - arcStart) - Math.PI / 2;
  const dotR = mainR + 44;
  elements += svg('circle', { cx: CX + Math.cos(angle) * dotR, cy: CY + Math.sin(angle) * dotR, r: '4', fill: citrine, opacity: '0.7' });
}

// ─── Floating dots inside circle ───
const dotClusters = [
  { r: 0.52, a: -0.35, s: 3.5, o: 0.5 },
  { r: 0.58, a: -0.15, s: 2.8, o: 0.4 },
  { r: 0.48, a: 0.08, s: 4.2, o: 0.55 },
  { r: 0.55, a: 0.28, s: 3.0, o: 0.45 },
  { r: 0.62, a: -0.42, s: 2.5, o: 0.35 },
  { r: 0.44, a: 0.52, s: 3.8, o: 0.5 },
  { r: 0.68, a: -0.22, s: 2.2, o: 0.3 },
  { r: 0.66, a: 0.15, s: 2.0, o: 0.3 },
];
for (const d of dotClusters) {
  const angle = d.a - Math.PI / 2;
  const r = mainR * d.r;
  elements += svg('circle', { cx: CX + Math.cos(angle) * r, cy: CY + Math.sin(angle) * r, r: d.s, fill: darkGrey, opacity: d.o });
}

// ─── Left calibration marks ───
const calibX = 200;
const calibStartY = 900;
const calibEndY = 2300;
const calibCount = 28;
for (let i = 0; i < calibCount; i++) {
  const y = calibStartY + (i / (calibCount - 1)) * (calibEndY - calibStartY);
  const maj = i % 7 === 0;
  elements += svg('line', { x1: calibX, y1: y, x2: calibX + (maj ? 80 : 40), y2: y, stroke: midGrey, 'stroke-width': maj ? '0.8' : '0.4', opacity: maj ? '0.4' : '0.2' });
}

// ─── Right calibration marks ───
const calibX2 = W - 200;
for (let i = 0; i < calibCount; i++) {
  const y = calibStartY + (i / (calibCount - 1)) * (calibEndY - calibStartY);
  const maj = i % 7 === 0;
  elements += svg('line', { x1: calibX2 - (maj ? 80 : 40), y1: y, x2: calibX2, y2: y, stroke: midGrey, 'stroke-width': maj ? '0.8' : '0.4', opacity: maj ? '0.4' : '0.2' });
}

// ─── Horizontal rules ───
elements += svg('line', { x1: 240, y1: 200, x2: W - 240, y2: 200, stroke: midGrey, 'stroke-width': '0.5', opacity: '0.6' });
elements += svg('line', { x1: 240, y1: H - 200, x2: W - 240, y2: H - 200, stroke: midGrey, 'stroke-width': '0.5', opacity: '0.6' });

// ─── Top annotations ───
elements += svg('text', { x: 240, y: 170, fill: darkGrey, 'font-family': "'Jura Custom', sans-serif", 'font-size': '22', 'font-weight': '300', 'letter-spacing': '4', opacity: '0.45' }, 'OBSERVATION NO. 042');
elements += svg('text', { x: W - 240, y: 170, 'text-anchor': 'end', fill: darkGrey, 'font-family': "'Jura Custom', sans-serif", 'font-size': '22', 'font-weight': '300', 'letter-spacing': '4', opacity: '0.45' }, 'SERIES \u03A3-7');

// ─── Bottom annotations ───
elements += svg('text', { x: 240, y: H - 150, fill: midGrey, 'font-family': "'Jura Custom', sans-serif", 'font-size': '16', 'font-weight': '300', 'letter-spacing': '3', opacity: '0.35' }, 'CALIBRATED AT 0.01g RESOLUTION');
elements += svg('text', { x: W - 240, y: H - 150, 'text-anchor': 'end', fill: midGrey, 'font-family': "'Jura Custom', sans-serif", 'font-size': '16', 'font-weight': '300', 'letter-spacing': '3', opacity: '0.35' }, 'REF: LUM-RED/2026.07.01');

// ─── Title ───
elements += svg('text', { x: CX, y: CY + mainR + 180, 'text-anchor': 'middle', fill: ink, 'font-family': "'Poiret One Custom', serif", 'font-size': '56', 'font-weight': '400', 'letter-spacing': '14', opacity: '0.7' }, 'R E D U C T I O N');

// ─── Subtitle ───
elements += svg('text', { x: CX, y: CY + mainR + 255, 'text-anchor': 'middle', fill: darkGrey, 'font-family': "'Jura Custom', sans-serif", 'font-size': '17', 'font-weight': '300', 'letter-spacing': '6', opacity: '0.35' }, 'A STUDY IN GRADUAL LUMINOUS TRANSFORMATION');

// ─── Center accent ───
elements += svg('text', { x: CX, y: CY - 8, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: citrine, 'font-family': "'Poiret One Custom', serif", 'font-size': '28', 'font-weight': '400', 'letter-spacing': '8', opacity: '0.65' }, 'LIGHT');

// ─── Greek markers left ───
const dataLabel = [
  { x: calibX + 100, y: calibStartY + (2 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B1' },
  { x: calibX + 100, y: calibStartY + (9 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B2' },
  { x: calibX + 100, y: calibStartY + (16 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B3' },
  { x: calibX + 100, y: calibStartY + (23 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B4' },
];
for (const d of dataLabel) {
  elements += svg('text', { x: d.x, y: d.y, fill: darkGrey, 'font-family': "'Crimson Pro Custom', serif", 'font-size': '20', 'font-style': 'italic', opacity: '0.35', 'dominant-baseline': 'central' }, d.t);
}

// ─── Greek markers right ───
const dataLabelR = [
  { x: calibX2 - 100, y: calibStartY + (4 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B5' },
  { x: calibX2 - 100, y: calibStartY + (12 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B6' },
  { x: calibX2 - 100, y: calibStartY + (20 / (calibCount - 1)) * (calibEndY - calibStartY), t: '\u03B7' },
];
for (const d of dataLabelR) {
  elements += svg('text', { x: d.x, y: d.y, 'text-anchor': 'end', fill: darkGrey, 'font-family': "'Crimson Pro Custom', serif", 'font-size': '20', 'font-style': 'italic', opacity: '0.35', 'dominant-baseline': 'central' }, d.t);
}

// ─── Reference square markers ───
const sqSize = 12;
const sqStroke = 1.5;
elements += svg('rect', { x: 240 - sqSize/2, y: 200 - sqSize/2, width: sqSize, height: sqSize, fill: 'none', stroke: citrine, 'stroke-width': sqStroke, opacity: '0.5' });
elements += svg('rect', { x: W - 240 - sqSize/2, y: 200 - sqSize/2, width: sqSize, height: sqSize, fill: 'none', stroke: citrine, 'stroke-width': sqStroke, opacity: '0.5' });
elements += svg('rect', { x: 240 - sqSize/2, y: H - 200 - sqSize/2, width: sqSize, height: sqSize, fill: 'none', stroke: citrine, 'stroke-width': sqStroke, opacity: '0.5' });
elements += svg('rect', { x: W - 240 - sqSize/2, y: H - 200 - sqSize/2, width: sqSize, height: sqSize, fill: 'none', stroke: citrine, 'stroke-width': sqStroke, opacity: '0.5' });

// ─── Subtle dot grid in center ───
const dotGridSpacing = 42;
const dotGridStartX = CX - 250;
const dotGridEndX = CX + 250;
const dotGridStartY = CY - 220;
const dotGridEndY = CY + 180;
for (let dx = dotGridStartX; dx <= dotGridEndX; dx += dotGridSpacing) {
  for (let dy = dotGridStartY; dy <= dotGridEndY; dy += dotGridSpacing) {
    if (Math.sqrt((dx - CX) ** 2 + (dy - CY) ** 2) < innerR * 0.55) continue;
    elements += svg('circle', { cx: dx, cy: dy, r: '1.2', fill: midGrey, opacity: '0.18' });
  }
}

// ─── Font-face declarations ───
const fontCSS = `
@font-face {
  font-family: 'Jura Custom';
  src: url(data:font/truetype;charset=utf-8;base64,${juraLightB64}) format('truetype');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'Poiret One Custom';
  src: url(data:font/truetype;charset=utf-8;base64,${poiretOneB64}) format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Crimson Pro Custom';
  src: url(data:font/truetype;charset=utf-8;base64,${crimsonProB64}) format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Crimson Pro Custom';
  src: url(data:font/truetype;charset=utf-8;base64,${crimsonProItalicB64}) format('truetype');
  font-weight: 400;
  font-style: italic;
}
`;

const styleBlock = svg('style', { type: 'text/css' }, fontCSS);

const fullSvg = svg('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: W,
  height: H,
  viewBox: `0 0 ${W} ${H}`,
}, styleBlock + elements);

writeFileSync('artwork-luminous-reduction.svg', fullSvg);
console.log('SVG written.');

sharp(Buffer.from(fullSvg))
  .png({ compressionLevel: 0 })
  .toFile('artwork-luminous-reduction.png')
  .then(info => console.log('PNG written:', info))
  .catch(err => console.error('Error:', err));
