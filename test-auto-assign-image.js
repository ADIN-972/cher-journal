// Test script pour l'auto-assignment des images aux volumes
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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

async function testAutoAssignImage(sessionToken, chapterId) {
    // Create a test image file with volume number in name
    const testImagePath = path.join(__dirname, 'test-image-5.png');

    // Create a simple PNG (1x1 red pixel)
    const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x01, 0x00, 0x05, 0x69, 0x62, 0x6F, 0x4A,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
    ]);

    fs.writeFileSync(testImagePath, pngData);
    console.log('\n✓ Created test image: test-image-5.png');

    // Upload the image
    const formData = new FormData();
    formData.append('chapterId', chapterId);
    formData.append('kind', 'IMAGE');
    formData.append('file', fs.createReadStream(testImagePath));

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
        fs.unlinkSync(testImagePath);
        return;
    }

    console.log('✓ Image uploaded successfully');
    console.log(`  Asset ID: ${uploadResult.data.id}`);
    console.log(`  Original name: test-image-5.png`);

    // Get chapter details to check if image was auto-assigned to volume 5
    const chapterResponse = await fetch(`${API_URL}/api/admin/chapters/${chapterId}`, {
        headers: { 'Cookie': `sessionToken=${sessionToken}` }
    });

    const chapterData = await chapterResponse.json();
    const volume5 = chapterData.data.volumes?.find((v) => v.volumeNumber === 5);

    if (volume5 && volume5.illustrationAssetId === uploadResult.data.id) {
        console.log('✓ Image was auto-assigned to volume 5!');
    } else if (volume5) {
        console.log(`✗ Image was NOT assigned to volume 5 (current illustration: ${volume5.illustrationAssetId})`);
    } else {
        console.log('✗ Volume 5 not found');
    }

    // Cleanup
    fs.unlinkSync(testImagePath);
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
        console.log(`\nUtilisation du chapitre: ${chaptersData.data[0].title} (${chapterId})`);

        // Test auto-assign
        await testAutoAssignImage(sessionToken, chapterId);

    } catch (error) {
        console.error('✗ Erreur:', error.message);
    }
}

main();
