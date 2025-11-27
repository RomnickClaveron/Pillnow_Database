# Postman Setup Guide for PillNow API

## Quick Start

1. **Import the Collection**
   - Open Postman
   - Click "Import" button (top left)
   - Select `PillNow_API_Collection.postman_collection.json`
   - Click "Import"

2. **Set Environment Variables** (Optional but Recommended)
   - Click the gear icon (top right) → "Manage Environments"
   - Create a new environment called "PillNow Local"
   - Add variables:
     - `baseUrl` = `http://localhost:3000`
     - `imageId` = `1` (will be auto-updated)
     - `token` = (your auth token if needed)

3. **Select the Environment**
   - Use the dropdown in top right to select "PillNow Local"

---

## Testing Image Upload

### Step 1: Upload Image

1. Open the collection: **PillNow API Collection**
2. Navigate to: **Pill Identification** → **Upload Image (IoT Device)**
3. Click "Send"

**Request Body:**
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

**Expected Response (201):**
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

**Note:** The `imageId` is automatically saved to the environment variable for the next request!

---

### Step 2: Process and Verify

1. Navigate to: **Pill Identification** → **Process and Verify Image**
2. The `imageId` is automatically filled from the previous request
3. Modify the classification and confidence as needed
4. Click "Send"

**Request Body:**
```json
{
    "imageId": 1,
    "classification": "Aspirin",
    "confidence": 0.95,
    "medicationId": 1
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Image processed and verified successfully",
    "report": {
        "imageId": 1,
        "identification": {
            "classification": "Aspirin",
            "confidence": 0.95,
            "confidencePercentage": "95.0%",
            "status": "verified"
        },
        "verification": {
            "isCorrectPill": true,
            "expectedMedication": "Aspirin 100mg",
            "identifiedMedication": "Aspirin",
            "matchConfidence": 0.95
        },
        "schedule": {
            "scheduleId": 1,
            "status": "Taken",
            "scheduledTime": "2024-01-15 08:00",
            "medicationTaken": true,
            "takenOnTime": true
        },
        "summary": {
            "medicineTaken": true,
            "correctPill": true,
            "actionRequired": false
        }
    }
}
```

---

## Available Requests in Collection

### Pill Identification Endpoints

1. **Upload Image (IoT Device)** - Full upload with all fields
2. **Upload Image - Minimal** - Only required fields
3. **Process and Verify Image** - Process uploaded image
4. **Get Pending Identifications** - Get all pending images
5. **Get Image by ID** - Get specific image record
6. **Get All Pill Identifications** - Get all records

### Medication Schedules Endpoints

1. **Create Medication Schedule** - Create new schedule
2. **Get All Schedules** - Get all schedules

---

## Customizing Requests

### Change Base URL

1. Click the collection name
2. Go to "Variables" tab
3. Edit `baseUrl` value
4. Or set it in your environment

### Update Request Body

1. Click on any request
2. Go to "Body" tab
3. Edit the JSON as needed

**Example - Different User ID:**
```json
{
    "user": 2,
    "imageUrl": "https://example.com/images/pill_003.jpg"
}
```

**Example - Different Image URL:**
```json
{
    "user": 1,
    "imageUrl": "https://your-storage.com/pills/pill_123.jpg"
}
```

---

## Testing Different Scenarios

### Test 1: Basic Upload (Required Fields Only)
- Use: **Upload Image - Minimal**
- Body: Only `user` and `imageUrl`

### Test 2: Complete Upload
- Use: **Upload Image (IoT Device)**
- Body: All fields included

### Test 3: Process with High Confidence
- Use: **Process and Verify Image**
- Body: `confidence: 0.95` (high confidence)

### Test 4: Process with Low Confidence
- Use: **Process and Verify Image**
- Body: `confidence: 0.5` (low confidence - may fail verification)

### Test 5: Check Pending Images
- Use: **Get Pending Identifications**
- Should return all images with status "pending"

---

## Error Testing

### Test Missing Required Field

1. Use **Upload Image (IoT Device)**
2. Remove `user` field from body:
```json
{
    "imageUrl": "https://example.com/images/pill.jpg"
}
```
3. Expected: 400 Bad Request

### Test Invalid Data

1. Use **Process and Verify Image**
2. Set invalid `imageId`:
```json
{
    "imageId": 99999,
    "classification": "Aspirin",
    "confidence": 0.95
}
```
3. Expected: 404 Not Found

---

## Tips

1. **Use Environment Variables**: Set `baseUrl` in environment to easily switch between local/dev/prod
2. **Save Responses**: Right-click response → "Save Response" to keep examples
3. **Use Tests Tab**: The collection includes automatic tests that verify responses
4. **Collection Runner**: Run multiple requests in sequence using Collection Runner
5. **Pre-request Scripts**: Can be added to set dynamic values before requests

---

## Troubleshooting

### Connection Refused
- **Problem**: Can't connect to server
- **Solution**: 
  - Check if server is running: `npm start` or `node server.js`
  - Verify port (default: 3000)
  - Check `baseUrl` in environment

### 404 Not Found
- **Problem**: Endpoint not found
- **Solution**:
  - Verify route path: `/api/pill_identification/upload`
  - Check server logs for route registration

### 400 Bad Request
- **Problem**: Invalid request data
- **Solution**:
  - Check required fields: `user` and `imageUrl`
  - Verify JSON format is valid
  - Check data types (user must be number)

### 500 Internal Server Error
- **Problem**: Server error
- **Solution**:
  - Check MongoDB connection
  - Verify database is running
  - Check server console for error details

---

## Next Steps

After testing the upload:

1. **Verify Upload**: Use "Get Pending Identifications" to see your uploaded image
2. **Process Image**: Use "Process and Verify Image" to identify and verify
3. **Check Schedule**: If linked to schedule, verify it was updated to "Taken"
4. **View Report**: Check the verification report in the process response

---

## Collection Features

✅ **Automatic Tests**: Tests verify response status and structure  
✅ **Environment Variables**: Auto-saves `imageId` for chained requests  
✅ **Organized Folders**: Requests grouped by functionality  
✅ **Descriptions**: Each request has detailed description  
✅ **Example Bodies**: Pre-filled with example data  

Enjoy testing! 🚀


