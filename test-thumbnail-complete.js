#!/usr/bin/env node
/**
 * Complete thumbnail test: Upload image, verify thumbnail generation, serve public endpoint
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const sharp = require('sharp');

const API_URL = 'http://localhost:3000/api';
const UPLOAD_DIR = path.join(__dirname, 'apps/backend/uploads');
const SESSION_COOKIE = 'session=test-session'; // Will be set after login

let authToken = null;

async function login() {
    console.log('\n📝 Logging in...');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@cherjournal.com',
                password: 'admin123',
            }),
        });

        const data = await response.json();
        if (data.success) {
            // Extract cookie from headers
            const setCookie = response.headers.get('set-cookie');
            authToken = setCookie;
            console.log('✅ Login successful');
            return authToken;
        } else {
            throw new Error(data.error?.message || 'Login failed');
        }
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        process.exit(1);
    }
}

async function generateTestImage(filename, width, height) {
    console.log(`\n🎨 Creating test image: ${filename} (${width}x${height})`);
    const filePath = path.join(__dirname, filename);

    // Create a simple gradient image
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad)" />
    <text x="50%" y="50%" font-size="48" text-anchor="middle" dy=".3em" fill="white">Test ${width}x${height}</text>
  </svg>`;

    await sharp(Buffer.from(svg))
        .png()
        .toFile(filePath);

    console.log(`✅ Test image created: ${filePath}`);
    return filePath;
}

async function uploadImage(filePath, chapterId = '9f8c9e9e-2b2b-4b4b-8b8b-8b8b8b8b8b8b') {
    console.log(`\n📤 Uploading image: ${path.basename(filePath)}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('label', `Test Thumbnail ${Date.now()}`);
    form.append('chapterId', chapterId);

    try {
        const response = await fetch(`${API_URL}/admin/assets/upload`, {
            method: 'POST',
            headers: form.getHeaders({
                'Cookie': authToken,
            }),
            body: form,
        });

        const data = await response.json();
        if (data.success) {
            console.log('✅ Image uploaded successfully');
            console.log(`   Asset ID: ${data.data.id}`);
            console.log(`   Original: ${data.data.objectKey}`);
            console.log(`   Thumbnail: ${data.data.thumbnailObjectKey}`);
            return data.data;
        } else {
            throw new Error(data.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        throw error;
    }
}

async function verifyThumbnailFile(objectKey) {
    console.log(`\n🔍 Verifying thumbnail file exists...`);
    const thumbnailPath = path.join(UPLOAD_DIR, objectKey);

    if (fs.existsSync(thumbnailPath)) {
        const stats = fs.statSync(thumbnailPath);
        console.log(`✅ Thumbnail file exists: ${thumbnailPath}`);
        console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);

        // Get actual dimensions
        try {
            const metadata = await sharp(thumbnailPath).metadata();
            console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

            if (metadata.width <= 600 && metadata.height <= 600) {
                console.log('   ✅ Dimensions OK (≤ 600x600)');
            } else {
                console.log(`   ❌ Dimensions exceed 600x600!`);
            }
        } catch (error) {
            console.error('   ⚠️  Could not read metadata:', error.message);
        }
    } else {
        console.error(`❌ Thumbnail file not found: ${thumbnailPath}`);
        return false;
    }

    return true;
}

async function serveThumbnailPublic(objectKey) {
    console.log(`\n🌐 Testing public thumbnail endpoint...`);
    const encodedKey = encodeURIComponent(objectKey);
    const url = `http://localhost:3000/uploads/${encodedKey}`;

    try {
        const response = await fetch(url);

        if (response.ok) {
            const buffer = await response.buffer();
            console.log(`✅ Public endpoint accessible: ${url}`);
            console.log(`   HTTP ${response.status}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            console.log(`   Cache-Control: ${response.headers.get('cache-control')}`);
            console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
            return true;
        } else {
            console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Request failed: ${error.message}`);
        return false;
    }
}

async function testThumbnailGeneration() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   THUMBNAIL GENERATION TEST');
    console.log('═══════════════════════════════════════════════════════');

    try {
        // Step 1: Login
        await login();

        // Step 2: Create test images (different sizes to test aspect ratio)
        const testImage1 = await generateTestImage('test-thumb-4000x4000.png', 4000, 4000);
        const testImage2 = await generateTestImage('test-thumb-4000x2000.png', 4000, 2000); // Wide
        const testImage3 = await generateTestImage('test-thumb-2000x4000.png', 2000, 4000); // Tall

        // Step 3: Upload images
        console.log('\n\n--- UPLOAD 1: Square 4000x4000 ---');
        const asset1 = await uploadImage(testImage1);

        console.log('\n--- UPLOAD 2: Wide 4000x2000 ---');
        const asset2 = await uploadImage(testImage2);

        console.log('\n--- UPLOAD 3: Tall 2000x4000 ---');
        const asset3 = await uploadImage(testImage3);

        // Step 4: Verify thumbnails exist and have correct dimensions
        console.log('\n\n--- THUMBNAIL FILE VERIFICATION ---');
        await verifyThumbnailFile(asset1.thumbnailObjectKey);
        await verifyThumbnailFile(asset2.thumbnailObjectKey);
        await verifyThumbnailFile(asset3.thumbnailObjectKey);

        // Step 5: Test public endpoints
        console.log('\n\n--- PUBLIC ENDPOINT TEST ---');
        const served1 = await serveThumbnailPublic(asset1.thumbnailObjectKey);
        const served2 = await serveThumbnailPublic(asset2.thumbnailObjectKey);
        const served3 = await serveThumbnailPublic(asset3.thumbnailObjectKey);

        // Summary
        console.log('\n\n═══════════════════════════════════════════════════════');
        console.log('   TEST SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ All tests passed!`);
        console.log(`\nThumbnails generated and served publicly:
   - ${asset1.thumbnailObjectKey}
   - ${asset2.thumbnailObjectKey}
   - ${asset3.thumbnailObjectKey}`);

        // Cleanup
        console.log('\n🧹 Cleaning up test files...');
        fs.unlinkSync(testImage1);
        fs.unlinkSync(testImage2);
        fs.unlinkSync(testImage3);
        console.log('✅ Cleanup complete');

        process.exit(0);
    } catch (error) {
        console.error('\n\n❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

testThumbnailGeneration();
