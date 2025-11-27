/**
 * Image Upload Examples for PillNow API
 * 
 * This file contains multiple examples of how to upload images
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = 'http://localhost:3000';
const UPLOAD_ENDPOINT = '/api/pill_identification/upload-file';
const UPLOAD_URL_ENDPOINT = '/api/pill_identification/upload';

// ============================================
// Example 1: Upload Image File (Multipart)
// ============================================
async function uploadImageFile(imagePath, userId = 1) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        
        // Add form fields
        form.append('user', userId.toString());
        form.append('deviceId', 'test_device_001');
        form.append('containerId', 'container_A');
        form.append('scheduleId', '1');
        form.append('notes', 'Test upload from Node.js');
        
        // Add image file
        form.append('image', fs.createReadStream(imagePath));
        
        // Make request
        form.submit(`${API_URL}${UPLOAD_ENDPOINT}`, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (e) {
                    resolve({ raw: data, statusCode: res.statusCode });
                }
            });
        });
    });
}

// ============================================
// Example 2: Upload Base64 Image
// ============================================
async function uploadBase64Image(imagePath, userId = 1) {
    return new Promise((resolve, reject) => {
        // Read and convert image to base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const imageType = path.extname(imagePath).slice(1) || 'jpg';
        
        // Build request body
        const payload = JSON.stringify({
            user: userId,
            imageBase64: `data:image/${imageType};base64,${base64Image}`,
            deviceId: 'test_device_001',
            containerId: 'container_A',
            scheduleId: 1,
            notes: 'Test upload using base64'
        });
        
        const url = new URL(`${API_URL}${UPLOAD_ENDPOINT}`);
        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ raw: data, statusCode: res.statusCode });
                }
            });
        });
        
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// ============================================
// Example 3: Upload Image URL
// ============================================
async function uploadImageUrl(imageUrl, userId = 1) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            user: userId,
            imageUrl: imageUrl,
            deviceId: 'test_device_001',
            containerId: 'container_A',
            scheduleId: 1,
            notes: 'Test upload using image URL'
        });
        
        const url = new URL(`${API_URL}${UPLOAD_URL_ENDPOINT}`);
        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ raw: data, statusCode: res.statusCode });
                }
            });
        });
        
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// ============================================
// Example 4: Using Fetch (Browser/Node 18+)
// ============================================
async function uploadImageFetch(imageFile, userId = 1) {
    const formData = new FormData();
    formData.append('user', userId.toString());
    formData.append('image', imageFile);
    formData.append('deviceId', 'test_device_001');
    
    const response = await fetch(`${API_URL}${UPLOAD_ENDPOINT}`, {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
}

// ============================================
// Main Test Function
// ============================================
async function testUpload() {
    console.log('=== PillNow Image Upload Examples ===\n');
    
    // Example image path (create a test image or use existing)
    const testImagePath = path.join(__dirname, 'test_pill.jpg');
    
    // Check if test image exists
    if (!fs.existsSync(testImagePath)) {
        console.log('⚠️  Test image not found. Creating a placeholder...');
        console.log('   Please provide an image file at:', testImagePath);
        console.log('   Or update the path in the code.\n');
        return;
    }
    
    try {
        // Test 1: Upload file (multipart)
        console.log('1. Testing File Upload (Multipart)...');
        const result1 = await uploadImageFile(testImagePath, 1);
        console.log('✅ Success!');
        console.log('   Image ID:', result1.data?.imageId);
        console.log('   Image URL:', result1.data?.imageUrl);
        console.log('');
        
        // Test 2: Upload base64
        console.log('2. Testing Base64 Upload...');
        const result2 = await uploadBase64Image(testImagePath, 1);
        console.log('✅ Success!');
        console.log('   Image ID:', result2.data?.imageId);
        console.log('   Image URL:', result2.data?.imageUrl);
        console.log('');
        
        // Test 3: Upload URL (if you have a hosted image)
        console.log('3. Testing URL Upload...');
        console.log('   (Skipped - requires hosted image URL)');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run if executed directly
if (require.main === module) {
    testUpload();
}

// Export functions for use in other files
module.exports = {
    uploadImageFile,
    uploadBase64Image,
    uploadImageUrl,
    uploadImageFetch
};


