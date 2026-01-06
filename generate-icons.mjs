import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the SVG templates
const svgBuffer = readFileSync(join(__dirname, 'public', 'icon-template.svg'));
const maskableSvgBuffer = readFileSync(join(__dirname, 'public', 'maskable-icon-template.svg'));

// Icon configurations
const regularIcons = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

const maskableIcons = [
  { name: 'maskable-192.png', size: 192 },
  { name: 'maskable-512.png', size: 512 }
];

// Generate each icon
async function generateIcons() {
  console.log('Generating regular icons...\n');
  for (const icon of regularIcons) {
    console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);

    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(__dirname, 'public', icon.name));

    console.log(`✓ ${icon.name} created successfully`);
  }

  console.log('\nGenerating maskable icons...\n');
  for (const icon of maskableIcons) {
    console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);

    await sharp(maskableSvgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(__dirname, 'public', icon.name));

    console.log(`✓ ${icon.name} created successfully`);
  }

  console.log('\n✓ All regular icons generated with white circular background');
  console.log('✓ All maskable icons generated with safe zone padding');
}

generateIcons().catch(console.error);
