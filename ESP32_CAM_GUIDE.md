# ESP32-CAM Image Upload Guide

This guide explains how to upload images directly from ESP32-CAM to the PillNow API.

## API Endpoints

### Option 1: Multipart/Form-Data Upload (Recommended)
**POST** `/api/pill_identification/upload-file`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `user` (Number) - Required: User ID
- `image` (File) - Required: Image file
- `scheduleId` (Number) - Optional: Schedule ID
- `deviceId` (String) - Optional: Device identifier
- `containerId` (String) - Optional: Container identifier
- `notes` (String) - Optional: Additional notes

### Option 2: Base64 JSON Upload
**POST** `/api/pill_identification/upload-file` or `/api/pill_identification/upload`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "user": 1,
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "scheduleId": 1,
  "deviceId": "ESP32_CAM_001",
  "containerId": "container_A",
  "notes": "Image from ESP32-CAM"
}
```

---

## ESP32-CAM Setup

### 1. Install Required Libraries

In Arduino IDE:
1. Go to **Tools** → **Manage Libraries**
2. Search and install: **base64** by Densaugeo

### 2. Configure the Code

Open `ESP32_CAM_Code.ino` and update:

```cpp
// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// API URL - Replace with your server IP
const char* API_URL = "http://192.168.1.100:3000/api/pill_identification/upload-file";

// Device Information
const int USER_ID = 1;
const int SCHEDULE_ID = 1;  // Optional, set to 0 if not needed
const String DEVICE_ID = "ESP32_CAM_001";
const String CONTAINER_ID = "container_A";
```

### 3. Upload to ESP32-CAM

1. Select board: **Tools** → **Board** → **ESP32 Wrover Module**
2. Select partition scheme: **Tools** → **Partition Scheme** → **Huge APP (3MB No OTA/1MB SPIFFS)**
3. Upload the code

---

## Testing

### Method 1: Using cURL (Multipart)

```bash
curl -X POST http://localhost:3000/api/pill_identification/upload-file \
  -F "user=1" \
  -F "image=@/path/to/pill_image.jpg" \
  -F "deviceId=ESP32_CAM_001" \
  -F "containerId=container_A" \
  -F "scheduleId=1"
```

### Method 2: Using cURL (Base64)

```bash
# First, convert image to base64
IMAGE_BASE64=$(base64 -i pill_image.jpg)

curl -X POST http://localhost:3000/api/pill_identification/upload-file \
  -H "Content-Type: application/json" \
  -d "{
    \"user\": 1,
    \"imageBase64\": \"data:image/jpeg;base64,$IMAGE_BASE64\",
    \"deviceId\": \"ESP32_CAM_001\",
    \"containerId\": \"container_A\"
  }"
```

### Method 3: Using Postman

1. Create POST request: `http://localhost:3000/api/pill_identification/upload-file`
2. Go to **Body** → **form-data**
3. Add fields:
   - `user`: `1` (Text)
   - `image`: Select file (File)
   - `deviceId`: `ESP32_CAM_001` (Text)
   - `containerId`: `container_A` (Text)
4. Click **Send**

---

## Expected Response

**Success (201):**
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

**Error (400):**
```json
{
  "success": false,
  "message": "Missing required field: user is required"
}
```

---

## Image Storage

- Images are stored in: `uploads/` directory
- Filename format: `{timestamp}_{userId}_{originalname}`
- Images are accessible via: `http://your-server:3000/uploads/{filename}`
- Maximum file size: 5MB

---

## Troubleshooting

### ESP32-CAM Issues

**Camera initialization failed:**
- Check wiring connections
- Verify camera module compatibility
- Try different frame sizes (VGA, SVGA, UXGA)

**WiFi connection failed:**
- Verify SSID and password
- Check WiFi signal strength
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

**Upload failed:**
- Check server is running
- Verify API URL is correct
- Check WiFi connection is stable
- Monitor Serial output for error messages

### Server Issues

**File too large:**
- Reduce image quality in ESP32 code: `config.jpeg_quality = 15` (higher number = lower quality)
- Reduce frame size: Use `FRAMESIZE_VGA` instead of `FRAMESIZE_SVGA`

**Storage issues:**
- Check `uploads/` directory exists
- Verify write permissions
- Monitor disk space

**Connection refused:**
- Verify server is running
- Check firewall settings
- Ensure port 3000 is open

---

## Code Customization

### Adjust Image Quality

```cpp
config.jpeg_quality = 12;  // 0-63, lower = higher quality
config.frame_size = FRAMESIZE_SVGA;  // Options: VGA, SVGA, UXGA
```

### Change Upload Interval

```cpp
delay(30000);  // Wait 30 seconds (change as needed)
```

### Add Button Trigger

```cpp
#define BUTTON_PIN 0  // GPIO 0 (usually flash button)

void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    // Capture and upload image
    String imageData = captureImage();
    uploadImageBase64(imageData);
    delay(1000);  // Debounce
  }
}
```

### Add LED Indicator

```cpp
#define LED_PIN 4  // Built-in LED on ESP32-CAM

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // Turn on LED
  // ... capture and upload ...
  digitalWrite(LED_PIN, LOW);   // Turn off LED
}
```

---

## Next Steps

After uploading the image:

1. **Check Pending Images:**
   ```bash
   curl http://localhost:3000/api/pill_identification/pending
   ```

2. **Process the Image:**
   ```bash
   curl -X POST http://localhost:3000/api/pill_identification/process \
     -H "Content-Type: application/json" \
     -d '{
       "imageId": 1,
       "classification": "Aspirin",
       "confidence": 0.95
     }'
   ```

3. **View Uploaded Image:**
   Open in browser: `http://localhost:3000/uploads/{filename}`

---

## Security Considerations

For production:
- Add authentication tokens
- Use HTTPS instead of HTTP
- Implement rate limiting
- Add file type validation
- Set up proper file storage (cloud storage recommended)

---

## Example Workflow

1. **ESP32-CAM captures image** → Image stored in memory
2. **Convert to base64** → Encoded for transmission
3. **Upload to server** → POST request to API
4. **Server saves file** → Stored in `uploads/` directory
5. **Database record created** → Status: "pending"
6. **System processes image** → ML identification
7. **Verification report** → Check if correct pill
8. **Schedule updated** → Mark as "Taken" if verified

---

Enjoy using ESP32-CAM with PillNow! 📸💊


