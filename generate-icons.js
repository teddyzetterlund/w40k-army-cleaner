const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
    try {
        // Read the SVG file
        const svgBuffer = fs.readFileSync('icon.svg');

        // Generate 192x192 icon
        await sharp(svgBuffer)
            .resize(192, 192)
            .png()
            .toFile('icon-192.png');

        // Generate 512x512 icon
        await sharp(svgBuffer)
            .resize(512, 512)
            .png()
            .toFile('icon-512.png');

        console.log('Icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons(); 