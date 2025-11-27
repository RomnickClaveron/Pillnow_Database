# Quick Image Upload Guide

## 🚀 Fastest Methods to Upload Images

---

## Method 1: Using Postman (Easiest)

1. **Open Postman**
2. **Create POST request:**
   - URL: `http://localhost:3000/api/pill_identification/upload-file`
3. **Go to Body → form-data**
4. **Add fields:**
   - `user`: `1` (Text)
   - `image`: Select your image file (File)
5. **Click Send**

✅ **Done!** You'll get back an `imageId` and `imageUrl`.

---

## Method 2: Using cURL (Command Line)

```bash
curl -X POST http://localhost:3000/api/pill_identification/upload-file \
  -F "user=1" \
  -F "image=@/path/to/your/image.jpg"
```

Replace:
- `1` with your user ID
- `/path/to/your/image.jpg` with your actual image path

---

## Method 3: Base64 JSON (For ESP32-CAM)

**Endpoint:** `POST /api/pill_identification/upload-file`

**Request:**
```json
{
  "user": 1,
  "imageBase64": "data:image/jpeg;base64,YOUR_BASE64_STRING_HERE"
}
```

**Convert image to base64:**
```bash
# Linux/Mac
base64 -i image.jpg

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("image.jpg"))
```

---

## Method 4: URL Upload (If image already online)

**Endpoint:** `POST /api/pill_identification/upload`

**Request:**
```json
{
  "user": 1,
  "imageUrl": "https://example.com/pill_image.jpg"
}
```

---

## 📋 Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | Number | ✅ Yes | User ID |
| `image` | File | ✅ Yes* | Image file (for upload-file) |
| `imageUrl` | String | ✅ Yes* | Image URL (for upload) |
| `imageBase64` | String | ✅ Yes* | Base64 string (for upload-file) |

*One of these is required depending on endpoint

---

## 📋 Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `scheduleId` | Number | Link to medication schedule |
| `deviceId` | String | Device identifier (e.g., "ESP32_CAM_001") |
| `containerId` | String | Container identifier |
| `notes` | String | Additional notes |

---

## ✅ Success Response

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

## 🎯 Quick Test

**Copy and paste this in Postman:**

1. Method: `POST`
2. URL: `http://localhost:3000/api/pill_identification/upload-file`
3. Body → form-data:
   - `user`: `1`
   - `image`: [Select any image file]

**That's it!** 🎉

---

## 📸 View Your Uploaded Image

After upload, access your image at:
```
http://localhost:3000/uploads/{filename}
```

The filename is in the response `imageUrl` field.

---

## 🔧 Troubleshooting

**400 Error:** Missing `user` field → Add it!

**413 Error:** File too large → Reduce image size (max 5MB)

**500 Error:** Server issue → Check server logs

---

**Need more details?** See `ESP32_CAM_GUIDE.md` for ESP32-CAM setup.


