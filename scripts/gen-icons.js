#!/usr/bin/env node
/**
 * Generates placeholder PWA icons as SVG files.
 * In production, replace with proper PNG icons generated from your logo.
 * Run: node scripts/gen-icons.js
 */
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function makeSvg(size) {
  const fontSize = Math.round(size * 0.35);
  const radius = Math.round(size * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#1a3d2b"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
        font-family="serif" font-size="${fontSize}" fill="#e9a822">M</text>
  <text x="50%" y="78%" dominant-baseline="middle" text-anchor="middle"
        font-family="sans-serif" font-size="${Math.round(fontSize * 0.28)}" fill="#52b788" letter-spacing="2">PNG</text>
</svg>`;
}

sizes.forEach(size => {
  // Write SVG as placeholder (rename to .png in production or use sharp to convert)
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(svgPath, makeSvg(size));
  // Copy SVG as PNG placeholder so manifest references resolve
  fs.copyFileSync(svgPath, pngPath);
  console.log(`✓ icon-${size}x${size}.png`);
});

console.log('\nIcons written to public/icons/');
console.log('NOTE: Replace SVG-as-PNG files with real PNGs before production launch.');
