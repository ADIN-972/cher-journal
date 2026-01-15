// Test script pour l'import en masse de volumes
const fetch = require('node-fetch');

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

async function testBulkImport(sessionToken, chapterId) {
    const testData = {
        volumeNumber: 99,
        title: 'Test Import Volume',
        narratorText: 'Ceci est le texte du narrateur pour tester l\'import en masse.',
        protagonistText: 'Ceci est mon texte en tant que protagoniste.'
    };

    console.log('\nTest d\'import du volume:', testData);

    const response = await fetch(`${API_URL}/api/admin/chapters/${chapterId}/bulk-import-volume`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `sessionToken=${sessionToken}`
        },
        body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (result.success) {
        console.log('✓ Import réussi!');
        console.log('Volume créé:', result.data);
    } else {
        console.error('✗ Erreur d\'import:', result.error);
    }

    return result;
}

async function main() {
    try {
        // Login
        const sessionToken = await login();

        // Get chapters to find a test chapter ID
        const chaptersResponse = await fetch(`${API_URL}/api/admin/chapters`, {
            headers: { 'Cookie': `sessionToken=${sessionToken}` }
        });
        const chaptersData = await chaptersResponse.json();

        if (!chaptersData.success || chaptersData.data.length === 0) {
            console.error('✗ Aucun chapitre trouvé');
            return;
        }

        const chapterId = chaptersData.data[0].id;
        console.log(`\nUtilisation du chapitre: ${chaptersData.data[0].title} (${chapterId})`);

        // Test bulk import
        await testBulkImport(sessionToken, chapterId);

        console.log('\n✓ Tests terminés!');

    } catch (error) {
        console.error('✗ Erreur:', error.message);
    }
}

main();
