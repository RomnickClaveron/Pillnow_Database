# Testing Image Upload API

This guide explains how to test the image upload endpoint for pill identification.

## Endpoint

**POST** `/api/pill_identification/upload`

**Base URL:** `http://localhost:3000` (or your server URL)

## Required Fields

- `user` (Number) - User ID
- `imageUrl` (String) - URL or path to the image

## Optional Fields

- `scheduleId` (Number) - Medication schedule ID
- `deviceId` (String) - IoT device identifier
- `containerId` (String) - Container identifier
- `notes` (String) - Additional notes

---

## Testing Methods

### 1. Using cURL (Command Line)

#### Basic Upload
```bash
curl -X POST http://localhost:3000/api/pill_identification/upload \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "imageUrl": "https://example.com/images/pill_001.jpg"
  }'
```

#### Complete Upload (All Fields)
```bash
curl -X POST http://localhost:3000/api/pill_identification/upload \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "imageUrl": "https://example.com/images/pill_002.jpg",
    "scheduleId": 1,
    "deviceId": "device_001",
    "containerId": "container_A",
    "notes": "Test upload from IoT device"
  }'
```

#### Test Missing Required Field (Should Fail)
```bash
curl -X POST http://localhost:3000/api/pill_identification/upload \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/images/pill.jpg"
  }'
```

---

### 2. Using Postman

1. **Create a new POST request**
   - URL: `http://localhost:3000/api/pill_identification/upload`
   - Method: `POST`

2. **Set Headers**
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body** (select "raw" and "JSON")
   ```json
   {
     "user": 1,
     "imageUrl": "https://example.com/images/pill_001.jpg",
     "scheduleId": 1,
     "deviceId": "device_001",
     "containerId": "container_A",
     "notes": "Test upload from IoT device"
   }
   ```

4. **Send Request**

---

### 3. Using Node.js Test Script

Run the provided test script:

```bash
node test_image_upload.js
```

Or with custom API URL:

```bash
API_URL=http://localhost:3000 node test_image_upload.js
```

---

### 4. Using JavaScript/Fetch (Browser or Node.js)

```javascript
async function uploadImage() {
  const response = await fetch('http://localhost:3000/api/pill_identification/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: 1,
      imageUrl: 'https://example.com/images/pill_001.jpg',
      scheduleId: 1,
      deviceId: 'device_001',
      containerId: 'container_A',
      notes: 'Test upload from IoT device'
    })
  });

  const data = await response.json();
  console.log('Response:', data);
}

uploadImage();
```

---

### 5. Using Python (requests library)

```python
import requests
import json

url = "http://localhost:3000/api/pill_identification/upload"

payload = {
    "user": 1,
    "imageUrl": "https://example.com/images/pill_001.jpg",
    "scheduleId": 1,
    "deviceId": "device_001",
    "containerId": "container_A",
    "notes": "Test upload from IoT device"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
```

---

## Expected Responses

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Image uploaded successfully, awaiting identification",
  "data": {
    "imageId": 1,
    "status": "pending",
    "imageUrl": "https://example.com/images/pill_001.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

**Missing Required Field:**
```json
{
  "success": false,
  "message": "Missing required fields: user and imageUrl are required"
}
```

**Invalid Data:**
```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Test Scenarios

### ✅ Valid Test Cases

1. **Minimal Request** - Only required fields
   ```json
   {
     "user": 1,
     "imageUrl": "https://example.com/pill.jpg"
   }
   ```

2. **With Schedule ID** - Links to medication schedule
   ```json
   {
     "user": 1,
     "imageUrl": "https://example.com/pill.jpg",
     "scheduleId": 1
   }
   ```

3. **Complete Request** - All fields included
   ```json
   {
     "user": 1,
     "imageUrl": "https://example.com/pill.jpg",
     "scheduleId": 1,
     "deviceId": "device_001",
     "containerId": "container_A",
     "notes": "Test upload"
   }
   ```

### ❌ Invalid Test Cases

1. **Missing user field**
   ```json
   {
     "imageUrl": "https://example.com/pill.jpg"
   }
   ```

2. **Missing imageUrl field**
   ```json
   {
     "user": 1
   }
   ```

3. **Empty body**
   ```json
   {}
   ```

---

## Verification Steps

After uploading, verify the record was created:

1. **Get Pending Identifications:**
   ```bash
   curl http://localhost:3000/api/pill_identification/pending
   ```

2. **Get Specific Image by ID:**
   ```bash
   curl http://localhost:3000/api/pill_identification/image/1
   ```

3. **Get All Identifications:**
   ```bash
   curl http://localhost:3000/api/pill_identification/
   ```

---

## Next Steps After Upload

Once the image is uploaded with status "pending", you can:

1. **Process the Image** (identify the pill):
   ```bash
   curl -X POST http://localhost:3000/api/pill_identification/process \
     -H "Content-Type: application/json" \
     -d '{
       "imageId": 1,
       "classification": "Aspirin",
       "confidence": 0.95
     }'
   ```

2. **Check the Report** - The process endpoint will return a verification report

---

## Troubleshooting

### Connection Refused
- Make sure your server is running
- Check the port (default: 3000)
- Verify the API URL is correct

### 404 Not Found
- Check the endpoint path: `/api/pill_identification/upload`
- Verify the route is registered in `server.js`

### 400 Bad Request
- Check that all required fields are present
- Verify JSON format is correct
- Ensure `user` is a number and `imageUrl` is a string

### Database Errors
- Ensure MongoDB is running and connected
- Check database connection string in `.env` file
- Verify the `pill_identifications` collection exists

---

## Example Complete Workflow

```bash
# 1. Upload image
curl -X POST http://localhost:3000/api/pill_identification/upload \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "imageUrl": "https://example.com/pill.jpg",
    "scheduleId": 1
  }'

# Response: { "success": true, "data": { "imageId": 1, ... } }

# 2. Process and verify (after ML identification)
curl -X POST http://localhost:3000/api/pill_identification/process \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": 1,
    "classification": "Aspirin",
    "confidence": 0.92
  }'

# Response: { "success": true, "report": { ... } }
```


