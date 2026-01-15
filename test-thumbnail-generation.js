// Test script pour la génération de miniatures
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const API_URL = 'http://localhost:3000';

async function login() {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@cherjournal.com',
            password: 'admin123'
        })
    });

    const cookies = response.headers.get('set-cookie');
    const sessionToken = cookies?.match(/sessionToken=([^;]+)/)?.[1];

    console.log('✓ Logged in');
    return sessionToken;
}

async function createTestImage(width, height, name) {
    // Create a test PNG with specified dimensions
    const pngBuffer = await sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 100, b: 100 }
        }
    }).png().toBuffer();

    fs.writeFileSync(name, pngBuffer);
    console.log(`✓ Created test image: ${name} (${width}x${height})`);
    return pngBuffer;
}

async function testThumbnailGeneration(sessionToken, chapterId) {
    // Create a large test image (4000x4000)
    await createTestImage(4000, 4000, 'test-large-image-3.png');

    // Upload the image
    const formData = new FormData();
    formData.append('chapterId', chapterId);
    formData.append('kind', 'IMAGE');
    formData.append('file', fs.createReadStream('test-large-image-3.png'));

    const uploadResponse = await fetch(`${API_URL}/api/admin/assets/upload`, {
        method: 'POST',
        headers: {
            ...formData.getHeaders(),
            'Cookie': `sessionToken=${sessionToken}`
        },
        body: formData
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success) {
        console.error('✗ Upload failed:', uploadResult.error);
        fs.unlinkSync('test-large-image-3.png');
        return;
    }

    console.log('\n✓ Image uploaded successfully');
    console.log(`  Original: ${uploadResult.data.width}x${uploadResult.data.height}`);
    console.log(`  Asset ID: ${uploadResult.data.id}`);

    if (uploadResult.data.thumbnailObjectKey) {
        console.log(`  Thumbnail generated: ${uploadResult.data.thumbnailObjectKey}`);
        console.log(`  Thumbnail URL: ${API_URL}/uploads/${uploadResult.data.thumbnailObjectKey}`);

        // Try to access the thumbnail
        try {
            const thumbResponse = await fetch(`${API_URL}/uploads/${uploadResult.data.thumbnailObjectKey}`);
            if (thumbResponse.ok) {
                const thumbBuffer = await thumbResponse.buffer();
                const metadata = await sharp(thumbBuffer).metadata();
                console.log(`  ✓ Thumbnail accessible: ${metadata.width}x${metadata.height}`);
            } else {
                console.error(`  ✗ Thumbnail not accessible: ${thumbResponse.status}`);
            }
        } catch (err) {
            console.error(`  ✗ Error accessing thumbnail: ${err.message}`);
        }
    } else {
        console.log('  ✗ No thumbnail was generated');
    }

    // Cleanup
    fs.unlinkSync('test-large-image-3.png');
    console.log('\n✓ Test completed!');
}

async function main() {
    try {
        const sessionToken = await login();

        // Get chapters
        const chaptersResponse = await fetch(`${API_URL}/api/admin/chapters`, {
            headers: { 'Cookie': `sessionToken=${sessionToken}` }
        });
        const chaptersData = await chaptersResponse.json();

        if (!chaptersData.success || chaptersData.data.length === 0) {
            console.error('✗ No chapters found');
            return;
        }

        const chapterId = chaptersData.data[0].id;
        console.log(`\nUtilisation du chapitre: ${chaptersData.data[0].title} (${chapterId})\n`);

        // Test thumbnail generation
        await testThumbnailGeneration(sessionToken, chapterId);

    } catch (error) {
        console.error('✗ Erreur:', error.message);
    }
}

main();
