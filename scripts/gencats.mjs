import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Regenerates the six basic cat faces + mascot into public/cats/.
// Run with: node scripts/gencats.mjs
const DIR = fileURLToPath(new URL('../public/cats/', import.meta.url));

// Shared cute cat-face builder. 64x64 viewBox, big kawaii eyes, blush, ears.
function cat({
  base, dark, ear = base, earDark = dark, innerEar = '#F7A8C4',
  eye = '#2E2733', eyePupil = null, stroke, muzzle = null,
  stripes = null, id,
}) {
  const S = stroke;
  const grad = `
    <radialGradient id="g_${id}" cx="0.42" cy="0.34" r="0.75">
      <stop offset="0" stop-color="${lighten(base, 34)}"/>
      <stop offset="0.62" stop-color="${base}"/>
      <stop offset="1" stop-color="${dark}"/>
    </radialGradient>`;

  // Eyes: big rounded, with two white sparkles. Optional pupil for pale eyes.
  const eyeEl = (cx) => `
    <ellipse cx="${cx}" cy="37.5" rx="5.2" ry="6.4" fill="${eye}"/>
    ${eyePupil ? `<ellipse cx="${cx}" cy="38.2" rx="2.2" ry="3.4" fill="${eyePupil}"/>` : ''}
    <circle cx="${cx - 1.7}" cy="34.8" r="2.1" fill="#fff"/>
    <circle cx="${cx + 1.4}" cy="40.2" r="1.05" fill="#fff" opacity="0.9"/>`;

  const stripeEl = stripes
    ? `<g stroke="${stripes}" stroke-width="2.1" stroke-linecap="round" fill="none" opacity="0.85">
         <path d="M32 15.5 L32 22"/>
         <path d="M26 17 L27 22.5"/>
         <path d="M38 17 L37 22.5"/>
         <path d="M10.5 36 L15.5 36.5"/>
         <path d="M11 40.5 L16 40.5"/>
         <path d="M53.5 36 L48.5 36.5"/>
         <path d="M53 40.5 L48 40.5"/>
       </g>`
    : '';

  const muzzleEl = muzzle
    ? `<ellipse cx="32" cy="44" rx="13" ry="10" fill="${muzzle}" opacity="0.9"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>${grad}</defs>
  <!-- ears -->
  <path d="M13 27 L16.5 6.5 L32 20 Z" fill="${ear}" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M51 27 L47.5 6.5 L32 20 Z" fill="${ear}" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M17.5 22 L19.5 12 L28 20 Z" fill="${innerEar}"/>
  <path d="M46.5 22 L44.5 12 L36 20 Z" fill="${innerEar}"/>
  <!-- head -->
  <circle cx="32" cy="37" r="20.5" fill="url(#g_${id})" stroke="${S}" stroke-width="2.4"/>
  ${muzzleEl}
  ${stripeEl}
  <!-- blush -->
  <ellipse cx="18.5" cy="43.5" rx="4.2" ry="2.6" fill="#FF7FB0" opacity="0.45"/>
  <ellipse cx="45.5" cy="43.5" rx="4.2" ry="2.6" fill="#FF7FB0" opacity="0.45"/>
  <!-- whiskers -->
  <g stroke="${S}" stroke-width="1.3" stroke-linecap="round" opacity="0.5">
    <path d="M16 39 L5 37"/>
    <path d="M16 42.5 L4.5 43"/>
    <path d="M48 39 L59 37"/>
    <path d="M48 42.5 L59.5 43"/>
  </g>
  <!-- eyes -->
  ${eyeEl(23.5)}
  ${eyeEl(40.5)}
  <!-- nose + mouth -->
  <path d="M29.4 41.5 L34.6 41.5 L32 44.4 Z" fill="#E8747E" stroke="#C85A66" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M32 44.4 Q28.5 48.5 25 46.2" fill="none" stroke="${S}" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M32 44.4 Q35.5 48.5 39 46.2" fill="none" stroke="${S}" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;
}

function lighten(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt);
  const g = Math.min(255, ((n >> 8) & 255) + amt);
  const b = Math.min(255, (n & 255) + amt);
  return `rgb(${r},${g},${b})`;
}

const cats = {
  orange: cat({
    id: 'orange', base: '#FFB765', dark: '#F0912F', stroke: '#A85E1C',
    stripes: '#E97B1E',
  }),
  gray: cat({
    id: 'gray', base: '#C2CDD9', dark: '#93A2B4', stroke: '#6E7C90',
    stripes: '#9AA8BA',
  }),
  white: cat({
    id: 'white', base: '#FBF3E7', dark: '#E4D3BC', stroke: '#C9AE8C',
    innerEar: '#F7B7CC',
  }),
  black: cat({
    id: 'black', base: '#5E5766', dark: '#3A3442', stroke: '#2A2530',
    innerEar: '#C77E9C', eye: '#8FE05A', eyePupil: '#243016',
  }),
  siamese: cat({
    id: 'siamese', base: '#EBDBC0', dark: '#CDB58E', stroke: '#9C7C55',
    ear: '#7C5A3C', earDark: '#5E4329', innerEar: '#C98F86',
    eye: '#4FA6DE', eyePupil: '#1E5E86', muzzle: '#C9A87E',
  }),
  tabby: cat({
    id: 'tabby', base: '#FF9DC6', dark: '#EA6B9E', stroke: '#C24D80',
    stripes: '#F274A8', innerEar: '#FFC2DB',
  }),
};

for (const [k, v] of Object.entries(cats)) {
  writeFileSync(DIR + k + '.svg', v);
}
// Mascot: reuse the orange hero for the logo.
writeFileSync(DIR + 'mascot.svg', cats.orange);
console.log('wrote', Object.keys(cats).join(', '), '+ mascot');
