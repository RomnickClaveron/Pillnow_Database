# Image Upload Examples

Quick examples to upload images to PillNow API.

---

## 📋 Table of Contents

1. [cURL Examples](#curl-examples)
2. [Postman](#postman)
3. [HTML Form](#html-form)
4. [Node.js](#nodejs)
5. [Python](#python)
6. [JavaScript/Fetch](#javascriptfetch)

---

## 1. cURL Examples

### Upload Image File (Multipart)

```bash
curl -X POST http://localhost:3000/api/pill_identification/upload-file \
  -F "user=1" \
  -F "image=@/path/to/your/image.jpg" \
  -F "deviceId=test_device_001" \
  -F "containerId=container_A" \
  -F "scheduleId=1" \
  -F "notes=Test upload"
```

### Upload Base64 Image

```bash
# First, convert image to base64
IMAGE_BASE64=$(base64 -i image.jpg)

# Then upload
curl -X POST http://localhost:3000/api/pill_identification/upload-file \
  -H "Content-Type: application/json" \
  -d "{
    \"user\": 1,
    \"imageBase64\": \"data:image/jpeg;base64,$IMAGE_BASE64\",
    \"deviceId\": \"test_device_001\"
  }"
```

### Upload Image URL

```bash
curl -X POST http://localhost:3000/api/pill_identification/upload \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "imageUrl": "https://example.com/pill_image.jpg",
    "deviceId": "test_device_001"
  }'
```

---

## 2. Postman

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/pill_identification/upload-file`
3. **Body:** Select `form-data`
4. **Add fields:**
   - `user`: `1` (Text)
   - `image`: [Select File] (File)
   - `deviceId`: `test_device_001` (Text, optional)
   - `containerId`: `container_A` (Text, optional)
   - `scheduleId`: `1` (Text, optional)
5. **Click Send**

---

## 3. HTML Form

Open `upload_image_simple.html` in your browser.

**Features:**
- Drag & drop or click to select image
- Image preview before upload
- All form fields included
- Real-time feedback

**Or create your own:**

```html
<form id="uploadForm">
  <input type="number" name="user" value="1" required>
  <input type="file" name="image" accept="image/*" required>
  <input type="text" name="deviceId" value="web_001">
  <button type="submit">Upload</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const response = await fetch('http://localhost:3000/api/pill_identification/upload-file', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log(result);
});
</script>
```

---

## 4. Node.js

### Using FormData (requires form-data package)

```bash
npm install form-data
```

```javascript
const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const form = new FormData();
form.append('user', '1');
form.append('image', fs.createReadStream('image.jpg'));
form.append('deviceId', 'nodejs_001');

form.submit('http://localhost:3000/api/pill_identification/upload-file', (err, res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});
```

### Using Base64

```javascript
const fs = require('fs');
const http = require('http');

const imageBuffer = fs.readFileSync('image.jpg');
const base64Image = imageBuffer.toString('base64');

const payload = JSON.stringify({
  user: 1,
  imageBase64: `data:image/jpeg;base64,${base64Image}`,
  deviceId: 'nodejs_001'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/pill_identification/upload-file',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

req.write(payload);
req.end();
```

**Or use the example file:**
```bash
node examples/upload_image_examples.js
```

---

## 5. Python

### Using requests library

```bash
pip install requests
```

```python
import requests

# Method 1: File upload
url = "http://localhost:3000/api/pill_identification/upload-file"

files = {
    'image': ('pill.jpg', open('pill.jpg', 'rb'), 'image/jpeg')
}

data = {
    'user': 1,
    'deviceId': 'python_001',
    'containerId': 'container_A',
    'scheduleId': 1,
    'notes': 'Uploaded from Python'
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### Using Base64

```python
import requests
import base64

url = "http://localhost:3000/api/pill_identification/upload-file"

# Read and encode image
with open('pill.jpg', 'rb') as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

payload = {
    'user': 1,
    'imageBase64': f'data:image/jpeg;base64,{image_base64}',
    'deviceId': 'python_001'
}

response = requests.post(url, json=payload)
print(response.json())
```

---

## 6. JavaScript/Fetch

### Browser or Node.js 18+

```javascript
// Method 1: File upload
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('user', '1');
  formData.append('image', file);
  formData.append('deviceId', 'browser_001');
  
  const response = await fetch('http://localhost:3000/api/pill_identification/upload-file', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log(result);
  return result;
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await uploadImage(file);
    console.log('Image ID:', result.data.imageId);
  }
});
```

### Base64 Upload

```javascript
async function uploadBase64(imageFile) {
  // Convert file to base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(imageFile);
  });
  
  const response = await fetch('http://localhost:3000/api/pill_identification/upload-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: 1,
      imageBase64: base64,
      deviceId: 'browser_001'
    })
  });
  
  return await response.json();
}
```

---

## Expected Response

### Success (201)

```json
{
  "success": true,
  "message": "Image uploaded successfully, awaiting identification",
  "data": {
    "imageId": 1,
    "status": "pending",
    "imageUrl": "http://localhost:3000/uploads/1234567890_1_pill.jpg",
    "imagePath": "/path/to/uploads/1234567890_1_pill.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error (400)

```json
{
  "success": false,
  "message": "Missing required field: user is required"
}
```

---

## Quick Test

**Fastest way to test:**

1. Open `examples/upload_image_simple.html` in browser
2. Select an image
3. Click "Upload Image"
4. Done! ✅

---

## Need Help?

- Check `QUICK_UPLOAD_GUIDE.md` for quick reference
- See `ESP32_CAM_GUIDE.md` for ESP32-CAM setup
- Review server logs for detailed error messages


