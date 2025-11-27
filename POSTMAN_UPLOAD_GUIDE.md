# Postman Image Upload Guide

## 📸 Step-by-Step: Upload Image in Postman

---

## Method 1: Using Form-Data (Recommended)

### Step 1: Create New Request
1. Open Postman
2. Click **"New"** → **"HTTP Request"**
3. Set method to **POST**

### Step 2: Set URL
```
http://localhost:3000/api/pill_identification/upload-file
```

**Or if your server is on a different IP:**
```
http://YOUR_SERVER_IP:3000/api/pill_identification/upload-file
```

### Step 3: Configure Body
1. Click on **"Body"** tab
2. Select **"form-data"** (NOT raw or x-www-form-urlencoded)

### Step 4: Add Fields

Click **"Key"** and add these fields:

| Key | Type | Value | Required |
|-----|------|-------|----------|
| `user` | Text | `1` | ✅ Yes |
| `image` | File | [Click "Select Files"] | ✅ Yes |
| `deviceId` | Text | `postman_test_001` | ❌ No |
| `containerId` | Text | `container_A` | ❌ No |
| `scheduleId` | Text | `1` | ❌ No |
| `notes` | Text | `Test upload from Postman` | ❌ No |

**Important:** 
- For `image` field, click the dropdown next to "Key" and select **"File"** (not Text)
- Then click **"Select Files"** and choose your image

### Step 5: Send Request
Click the blue **"Send"** button

### Step 6: Check Response

**Success Response (201):**
```json
{
  "success": true,
  "message": "Image uploaded successfully, awaiting identification",
  "data": {
    "imageId": 1,
    "status": "pending",
    "imageUrl": "http://localhost:3000/uploads/1234567890_1_pill.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Method 2: Using Base64 (JSON)

### Step 1: Create New Request
- Method: **POST**
- URL: `http://localhost:3000/api/pill_identification/upload-file`

### Step 2: Set Headers
1. Click **"Headers"** tab
2. Add header:
   - Key: `Content-Type`
   - Value: `application/json`

### Step 3: Configure Body
1. Click **"Body"** tab
2. Select **"raw"**
3. Select **"JSON"** from dropdown (top right)

### Step 4: Add JSON Payload

```json
{
  "user": 1,
  "imageBase64": "data:image/jpeg;base64,YOUR_BASE64_STRING_HERE",
  "deviceId": "postman_test_001",
  "containerId": "container_A",
  "scheduleId": 1,
  "notes": "Test upload from Postman"
}
```

**To get base64 string:**
- Use online tool: https://www.base64-image.de/
- Or use command line: `base64 -i image.jpg`

### Step 5: Send Request
Click **"Send"**

---

## 📋 Visual Guide

### Form-Data Setup:
```
┌─────────────────────────────────────┐
│ POST http://localhost:3000/...     │
├─────────────────────────────────────┤
│ Body → form-data                    │
├─────────────────────────────────────┤
│ Key          │ Type │ Value         │
├──────────────┼──────┼───────────────┤
│ user         │ Text │ 1             │
│ image        │ File │ [Select File] │ ← Click here!
│ deviceId     │ Text │ postman_001   │
│ containerId  │ Text │ container_A   │
│ scheduleId   │ Text │ 1             │
│ notes        │ Text │ Test upload   │
└─────────────────────────────────────┘
```

---

## 🎯 Quick Test (Minimal)

**Fastest way to test:**

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/pill_identification/upload-file`
3. **Body:** form-data
4. **Add only:**
   - `user`: `1` (Text)
   - `image`: [Your image file] (File)
5. **Click Send**

That's it! ✅

---

## 🔧 Troubleshooting

### Problem: "Missing required field: user"
**Solution:** Make sure you added `user` field as Text with value `1`

### Problem: "Missing image"
**Solution:** 
- Make sure `image` field type is set to **"File"** (not Text)
- Click "Select Files" and choose an image

### Problem: "413 Request Entity Too Large"
**Solution:** Image is too big (max 5MB). Reduce image size.

### Problem: Connection refused
**Solution:** 
- Make sure your server is running
- Check the URL is correct
- Verify port 3000 is correct

### Problem: Can't see image field as File type
**Solution:**
- Click the dropdown arrow next to the Key field
- Select "File" from the dropdown
- Then you'll see "Select Files" button

---

## 📸 View Uploaded Image

After successful upload, you can view the image at:
```
http://localhost:3000/uploads/{filename}
```

The filename is in the response `imageUrl` field.

**Example:**
If response shows:
```json
"imageUrl": "http://localhost:3000/uploads/1234567890_1_pill.jpg"
```

Open in browser:
```
http://localhost:3000/uploads/1234567890_1_pill.jpg
```

---

## 💡 Pro Tips

1. **Save Request:** Click "Save" to save this request for future use
2. **Create Collection:** Group related requests together
3. **Use Variables:** Set `{{baseUrl}}` variable for easy server switching
4. **Test Scripts:** Add tests in "Tests" tab to verify response

### Setting up Variables:

1. Click gear icon (top right) → "Manage Environments"
2. Click "Add" to create new environment
3. Add variable:
   - Variable: `baseUrl`
   - Initial Value: `http://localhost:3000`
4. Use in URL: `{{baseUrl}}/api/pill_identification/upload-file`

---

## 📝 Example Request Collection

I've already created a Postman collection for you!

**File:** `PillNow_API_Collection.postman_collection.json`

**To import:**
1. Open Postman
2. Click "Import" (top left)
3. Select `PillNow_API_Collection.postman_collection.json`
4. Click "Import"

The collection includes:
- ✅ Upload Image (IoT Device) - Ready to use!
- ✅ Upload Image - Minimal
- ✅ Process and Verify Image
- ✅ Get Pending Identifications
- And more...

---

## 🎬 Complete Workflow Example

1. **Upload Image** → Get `imageId`
2. **Process Image** → Use the `imageId` from step 1
3. **Check Report** → See verification results

**In Postman Collection:**
- Request 1: "Upload Image (IoT Device)" → Save `imageId` from response
- Request 2: "Process and Verify Image" → Use saved `imageId`

---

## ✅ Success Checklist

- [ ] Server is running on port 3000
- [ ] URL is correct: `/api/pill_identification/upload-file`
- [ ] Method is POST
- [ ] Body type is `form-data`
- [ ] `user` field is added (Text, value: 1)
- [ ] `image` field is added (File type, file selected)
- [ ] Clicked "Send"
- [ ] Got 201 response with `imageId`

---

**That's it! You're ready to upload images in Postman! 🚀**


