/**
 * Generates all required app icon PNGs from an inline SVG.
 * Run with: node scripts/generate-icons.mjs
 */

import { createRequire } from 'module'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Resolve sharp from pnpm's nested node_modules
let sharp
try {
  sharp = require('sharp')
} catch {
  // Try pnpm path
  const sharpPath = resolve(__dirname, '../node_modules/.pnpm/sharp@0.33.5/node_modules/sharp')
  sharp = require(sharpPath)
}

// ─── SVG Icon Definition ─────────────────────────────────────────────────────
// Dark rounded square + 3 lime-green bars (skewed bar-chart style)
// matching the Athletics app icon design

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Dark background with rounded corners -->
  <rect width="512" height="512" rx="112" ry="112" fill="#141414"/>

  <!-- Three lime-green bars, slightly skewed to match the reference -->
  <g transform="translate(256, 256) skewX(-10)">
    <!-- Left bar (medium height) -->
    <rect x="-122" y="-95" width="54" height="195" rx="10" ry="10" fill="#AAFF00"/>
    <!-- Center bar (tallest) -->
    <rect x="-52" y="-140" width="54" height="280" rx="10" ry="10" fill="#AAFF00"/>
    <!-- Right small square -->
    <rect x="18" y="-10" width="54" height="60" rx="10" ry="10" fill="#AAFF00"/>
  </g>
</svg>`

// ─── Output sizes ─────────────────────────────────────────────────────────────
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const PUBLIC = resolve(__dirname, '../public')

async function generate() {
  const svgBuffer = Buffer.from(SVG)

  for (const size of SIZES) {
    const output = resolve(PUBLIC, `icon-${size}.png`)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(output)
    console.log(`✓ icon-${size}.png`)
  }

  // Main app icon (512px) — used as the primary icon
  await sharp(svgBuffer).resize(512, 512).png().toFile(resolve(PUBLIC, 'fittracker-app-icon.png'))
  console.log('✓ fittracker-app-icon.png (overwritten)')

  // Favicon (64px)
  await sharp(svgBuffer).resize(64, 64).png().toFile(resolve(PUBLIC, 'fittracker-favicon.png'))
  console.log('✓ fittracker-favicon.png')

  // Mask icon (monochrome — just white bars on transparent bg for Safari pinned tab)
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <g transform="translate(256, 256) skewX(-10)">
      <rect x="-122" y="-95" width="54" height="195" rx="10" ry="10" fill="black"/>
      <rect x="-52" y="-140" width="54" height="280" rx="10" ry="10" fill="black"/>
      <rect x="18" y="-10" width="54" height="60" rx="10" ry="10" fill="black"/>
    </g>
  </svg>`
  await sharp(Buffer.from(maskSvg)).resize(512, 512).png().toFile(resolve(PUBLIC, 'fittracker-mask-icon.png'))
  console.log('✓ fittracker-mask-icon.png')

  // Also save the SVG source
  writeFileSync(resolve(PUBLIC, 'fittracker-icon-512.svg'), SVG)
  console.log('✓ fittracker-icon-512.svg')

  console.log('\nAll icons generated successfully.')
}

generate().catch(err => {
  console.error('Error generating icons:', err)
  process.exit(1)
})
