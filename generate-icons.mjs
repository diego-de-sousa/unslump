import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the SVG template
const svgBuffer = readFileSync(join(__dirname, 'public', 'icon-template.svg'));

// Icon configurations
const icons = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

// Generate each icon
async function generateIcons() {
  for (const icon of icons) {
    console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);

    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(__dirname, 'public', icon.name));

    console.log(`✓ ${icon.name} created successfully`);
  }

  console.log('\n✓ All icons generated with white circular background');
}

generateIcons().catch(console.error);
