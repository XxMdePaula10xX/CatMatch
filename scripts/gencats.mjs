import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Regenerates the six basic cat faces + mascot into public/cats/.
// Aims for a polished, glossy "sticker" look: layered gradients, fluffy head
// silhouette, big glossy eyes with multiple catchlights, blush and rim light.
// Run with: node scripts/gencats.mjs
const DIR = fileURLToPath(new URL('../public/cats/', import.meta.url));

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
function shift(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${clamp(((n >> 16) & 255) + amt)},${clamp(((n >> 8) & 255) + amt)},${clamp((n & 255) + amt)})`;
}

function cat({
  id, base, dark, stroke,
  ear = base, earDark = dark, innerEar = '#F6A7C6',
  eye = 'dark', iris = null, // 'dark' glossy | color for iris
  stripes = null, points = null,
}) {
  const hi = shift(base, 46);
  const lo = shift(dark, -14);

  // Eye rendering: glossy dark, or a colored iris with pupil.
  const eyeGrad =
    eye === 'dark'
      ? `<radialGradient id="eye_${id}" cx="0.42" cy="0.3" r="0.95">
           <stop offset="0" stop-color="#5a4f63"/>
           <stop offset="0.55" stop-color="#332b3d"/>
           <stop offset="1" stop-color="#1e1826"/>
         </radialGradient>`
      : `<radialGradient id="eye_${id}" cx="0.42" cy="0.32" r="0.95">
           <stop offset="0" stop-color="${shift(iris, 55)}"/>
           <stop offset="0.6" stop-color="${iris}"/>
           <stop offset="1" stop-color="${shift(iris, -50)}"/>
         </radialGradient>`;

  const eyeEl = (cx) => `
    <g>
      <ellipse cx="${cx}" cy="37.6" rx="5.9" ry="7.4" fill="url(#eye_${id})"/>
      ${
        iris
          ? `<ellipse cx="${cx}" cy="38.6" rx="2.5" ry="4" fill="#20161f"/>`
          : ''
      }
      <path d="M${cx - 5.6} 33 Q${cx} 29.4 ${cx + 5.6} 33" fill="none" stroke="#0000001f" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="${cx - 2}" cy="34.4" rx="2.5" ry="3.2" fill="#ffffff"/>
      <circle cx="${cx + 1.9}" cy="40.4" r="1.5" fill="#ffffff" opacity="0.95"/>
      <ellipse cx="${cx - 2.6}" cy="41.6" rx="1.1" ry="0.8" fill="#ffffff" opacity="0.5"/>
    </g>`;

  const stripeEl = stripes
    ? `<g stroke="${stripes}" stroke-width="2.3" stroke-linecap="round" fill="none" opacity="0.9">
         <path d="M32 14 Q32 18 32 22"/>
         <path d="M25.5 15.5 Q26.5 19 27.2 22.5"/>
         <path d="M38.5 15.5 Q37.5 19 36.8 22.5"/>
         <path d="M9.5 35.5 Q13 35.8 16 36.3"/>
         <path d="M9.8 40.5 Q13.2 40.5 16.2 40.6"/>
         <path d="M54.5 35.5 Q51 35.8 48 36.3"/>
         <path d="M54.2 40.5 Q50.8 40.5 47.8 40.6"/>
       </g>`
    : '';

  const pointEl = points
    ? `<path d="M32 45 C22 45 16.5 40 16.5 33 C16.5 27 23 24 32 24 C41 24 47.5 27 47.5 33 C47.5 40 42 45 32 45 Z" fill="${points}" opacity="0.55"/>`
    : '';

  // Fluffy head silhouette with subtle cheek-fluff bumps and a soft chin.
  const head = `M32 14
    C44.5 14 53.5 21.5 53.5 32
    C53.5 37 56.2 41 53.6 44.5
    C50.5 53 42.5 58.5 32 58.5
    C21.5 58.5 13.5 53 10.4 44.5
    C7.8 41 10.5 37 10.5 32
    C10.5 21.5 19.5 14 32 14 Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="body_${id}" cx="0.4" cy="0.32" r="0.85">
      <stop offset="0" stop-color="${hi}"/>
      <stop offset="0.6" stop-color="${base}"/>
      <stop offset="1" stop-color="${lo}"/>
    </radialGradient>
    <linearGradient id="ear_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shift(ear, 20)}"/>
      <stop offset="1" stop-color="${earDark}"/>
    </linearGradient>
    <linearGradient id="innerEar_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shift(innerEar, 25)}"/>
      <stop offset="1" stop-color="${innerEar}"/>
    </linearGradient>
    ${eyeGrad}
  </defs>

  <!-- ears -->
  <path d="M12.5 30 C10 15 13.5 5.5 18 6.2 C23.5 7.5 30 15.5 31.5 21.5 C25 20 17 23 12.5 30 Z" fill="url(#ear_${id})" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M51.5 30 C54 15 50.5 5.5 46 6.2 C40.5 7.5 34 15.5 32.5 21.5 C39 20 47 23 51.5 30 Z" fill="url(#ear_${id})" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M17.5 24 C16.5 15 18.5 10.5 21 11 C24 12 27.5 17 28.5 21 C24.5 20.2 20.5 21.5 17.5 24 Z" fill="url(#innerEar_${id})"/>
  <path d="M46.5 24 C47.5 15 45.5 10.5 43 11 C40 12 36.5 17 35.5 21 C39.5 20.2 43.5 21.5 46.5 24 Z" fill="url(#innerEar_${id})"/>

  <!-- head -->
  <path d="${head}" fill="url(#body_${id})" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
  ${pointEl}
  ${stripeEl}

  <!-- glossy sheen on the forehead -->
  <ellipse cx="26" cy="26" rx="12" ry="7" fill="#ffffff" opacity="0.16"/>
  <!-- rim light -->
  <path d="M15 26 C19 19 26 15.5 33 15.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>

  <!-- blush -->
  <ellipse cx="17.8" cy="44" rx="4.6" ry="2.9" fill="#FF7CAE" opacity="0.5"/>
  <ellipse cx="46.2" cy="44" rx="4.6" ry="2.9" fill="#FF7CAE" opacity="0.5"/>

  <!-- whiskers -->
  <g stroke="${stroke}" stroke-width="1.3" stroke-linecap="round" opacity="0.45" fill="none">
    <path d="M15.5 39.5 Q9 39 4.5 37"/>
    <path d="M15.5 43 Q9 43.5 4 44.5"/>
    <path d="M48.5 39.5 Q55 39 59.5 37"/>
    <path d="M48.5 43 Q55 43.5 60 44.5"/>
  </g>

  <!-- eyes -->
  ${eyeEl(23.4)}
  ${eyeEl(40.6)}

  <!-- nose + mouth -->
  <path d="M29 41.4 Q32 40.6 35 41.4 Q33.4 44 32 45 Q30.6 44 29 41.4 Z" fill="#EF8288" stroke="#CB5F68" stroke-width="0.8" stroke-linejoin="round"/>
  <ellipse cx="30.6" cy="42" rx="0.9" ry="0.6" fill="#ffffff" opacity="0.6"/>
  <path d="M32 45 Q29 48.6 25.6 46.6" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M32 45 Q35 48.6 38.4 46.6" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;
}

const cats = {
  orange: cat({ id: 'orange', base: '#FFB765', dark: '#EF8E2C', stroke: '#B4671F', stripes: '#E97B1E' }),
  gray: cat({ id: 'gray', base: '#C4CFDB', dark: '#94A3B5', stroke: '#6D7C90', stripes: '#98A7B9' }),
  white: cat({ id: 'white', base: '#FDF5EA', dark: '#E6D6C0', stroke: '#C6AB88', innerEar: '#F7B7CC' }),
  black: cat({ id: 'black', base: '#63596E', dark: '#3B3543', stroke: '#2A2531', innerEar: '#C77E9C', eye: 'color', iris: '#8CDC57' }),
  siamese: cat({ id: 'siamese', base: '#ECDDC3', dark: '#D2BF9C', stroke: '#9E7D55', ear: '#7A5539', earDark: '#5A3D28', innerEar: '#C68C82', eye: 'color', iris: '#54AEE2', points: '#C6A279' }),
  tabby: cat({ id: 'tabby', base: '#FF9FC7', dark: '#EE6EA0', stroke: '#C34E82', stripes: '#F274A8', innerEar: '#FFC4DC' }),
};

for (const [k, v] of Object.entries(cats)) writeFileSync(DIR + k + '.svg', v);
writeFileSync(DIR + 'mascot.svg', cats.orange);
console.log('wrote', Object.keys(cats).join(', '), '+ mascot');
