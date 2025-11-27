/**
 * Test script for Pill Identification Image Upload API
 * 
 * Usage:
 *   node test_image_upload.js
 * 
 * Make sure your server is running on the configured port (default: 3000)
 */

const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const ENDPOINT = '/api/pill_identification/upload';

// Test data
const testCases = [
    {
        name: 'Basic Upload (Required Fields Only)',
        data: {
            user: 1,
            imageUrl: 'https://example.com/images/pill_001.jpg'
        }
    },
    {
        name: 'Complete Upload (All Fields)',
        data: {
            user: 1,
            imageUrl: 'https://example.com/images/pill_002.jpg',
            scheduleId: 1,
            deviceId: 'device_001',
            containerId: 'container_A',
            notes: 'Test upload from IoT device'
        }
    },
    {
        name: 'Upload with Schedule ID',
        data: {
            user: 1,
            imageUrl: 'https://example.com/images/pill_003.jpg',
            scheduleId: 1
        }
    },
    {
        name: 'Upload with Device Info',
        data: {
            user: 1,
            imageUrl: 'https://example.com/images/pill_004.jpg',
            deviceId: 'device_001',
            containerId: 'container_B'
        }
    }
];

// Function to make HTTP request
function makeRequest(testCase) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE_URL + ENDPOINT);
        const postData = JSON.stringify(testCase.data);

        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: response
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Function to test invalid requests
async function testInvalidRequests() {
    console.log('\n=== Testing Invalid Requests ===\n');

    const invalidTests = [
        {
            name: 'Missing user field',
            data: {
                imageUrl: 'https://example.com/images/pill.jpg'
            }
        },
        {
            name: 'Missing imageUrl field',
            data: {
                user: 1
            }
        },
        {
            name: 'Empty body',
            data: {}
        }
    ];

    for (const test of invalidTests) {
        try {
            const response = await makeRequest(test);
            if (response.statusCode === 400) {
                console.log(`✅ ${test.name}: PASSED (Expected 400)`);
                console.log(`   Response: ${JSON.stringify(response.body, null, 2)}\n`);
            } else {
                console.log(`❌ ${test.name}: FAILED (Expected 400, got ${response.statusCode})`);
                console.log(`   Response: ${JSON.stringify(response.body, null, 2)}\n`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}\n`);
        }
    }
}

// Main test function
async function runTests() {
    console.log('='.repeat(60));
    console.log('Pill Identification Image Upload API Test');
    console.log('='.repeat(60));
    console.log(`\nTesting endpoint: ${API_BASE_URL}${ENDPOINT}\n`);

    // Test valid requests
    console.log('=== Testing Valid Requests ===\n');

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`Test ${i + 1}: ${testCase.name}`);
        console.log(`Request Body: ${JSON.stringify(testCase.data, null, 2)}`);

        try {
            const response = await makeRequest(testCase);

            if (response.statusCode === 201) {
                console.log(`✅ Status: ${response.statusCode} (Success)`);
                console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
                
                if (response.body.success && response.body.data.imageId) {
                    console.log(`📸 Image ID: ${response.body.data.imageId}`);
                }
            } else {
                console.log(`❌ Status: ${response.statusCode} (Unexpected)`);
                console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        console.log('\n' + '-'.repeat(60) + '\n');
    }

    // Test invalid requests
    await testInvalidRequests();

    console.log('='.repeat(60));
    console.log('Test completed!');
    console.log('='.repeat(60));
}

// Run tests
runTests().catch(console.error);


