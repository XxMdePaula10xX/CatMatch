import sharp from 'sharp';

const SIZE = 1024;
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="g" cx="38%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#FFF7E2"/>
      <stop offset="60%" stop-color="#FFE7B5"/>
      <stop offset="100%" stop-color="#FFD482"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  <g fill="#FF8FBE" opacity="0.16">
    <circle cx="150" cy="170" r="46"/>
    <circle cx="880" cy="860" r="54"/>
  </g>
  <g fill="#7FC4FF" opacity="0.16">
    <circle cx="880" cy="170" r="34"/>
    <circle cx="150" cy="860" r="40"/>
  </g>
</svg>`;

const cat = await sharp('public/cats/orange.png')
  .resize({ width: 620, kernel: 'lanczos3' })
  .toBuffer();

await sharp(Buffer.from(bg))
  .composite([{ input: cat, gravity: 'centre' }])
  .png()
  .toFile('assets/logo.png');

console.log('wrote assets/logo.png');
