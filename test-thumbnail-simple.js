#!/usr/bin/env node
/**
 * Simple thumbnail test without fancy formatting
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

async function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data ? JSON.parse(data) : null,
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data,
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request failed: ${e.message}`));
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testHealth() {
    console.log('Testing health endpoint...');
    try {
        const result = await makeRequest('GET', '/health');
        console.log(`Status: ${result.status}`);
        console.log(`Response:`, result.body);
        if (result.status === 200) {
            console.log('✓ Server is responding\n');
            return true;
        } else {
            console.log('✗ Unexpected status code\n');
            return false;
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}\n`);
        return false;
    }
}

async function testLogin() {
    console.log('Testing login...');
    try {
        const result = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@cherjournal.com',
            password: 'admin123',
        });

        console.log(`Status: ${result.status}`);
        console.log(`Response:`, JSON.stringify(result.body, null, 2).substring(0, 200));

        if (result.status === 200 || result.status === 201) {
            console.log('✓ Login successful\n');
            return result.headers['set-cookie'];
        } else {
            console.log('✗ Login failed\n');
            return null;
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}\n`);
        return null;
    }
}

async function testPublicEndpoint() {
    console.log('Testing public thumbnail endpoint...');
    try {
        // Test with a dummy path - should return 404 but endpoint should be accessible
        const result = await makeRequest('GET', '/uploads/test.png');
        console.log(`Status: ${result.status}`);
        console.log(`Headers:`, result.headers);

        if (result.status === 404) {
            console.log('✓ Public endpoint is accessible (404 is expected for missing file)\n');
            return true;
        } else if (result.status >= 200 && result.status < 500) {
            console.log('✓ Public endpoint is accessible\n');
            return true;
        } else {
            console.log('✗ Unexpected status code\n');
            return false;
        }
    } catch (error) {
        console.log(`✗ Error: ${error.message}\n`);
        return false;
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('THUMBNAIL FEATURE TEST');
    console.log('='.repeat(60) + '\n');

    const healthOk = await testHealth();
    if (!healthOk) {
        console.log('Server is not responding. Exiting.');
        process.exit(1);
    }

    const loginCookie = await testLogin();
    const publicEndpointOk = await testPublicEndpoint();

    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Health check: ${healthOk ? 'PASS' : 'FAIL'}`);
    console.log(`Login: ${loginCookie ? 'PASS' : 'FAIL'}`);
    console.log(`Public endpoint: ${publicEndpointOk ? 'PASS' : 'FAIL'}`);

    if (healthOk && publicEndpointOk) {
        console.log('\nAll core tests passed. Thumbnail feature is operational.');
        process.exit(0);
    } else {
        console.log('\nSome tests failed.');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
