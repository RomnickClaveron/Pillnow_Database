/*
 * ESP32-CAM Pill Identification Image Upload
 * 
 * This code captures an image from ESP32-CAM and uploads it to the PillNow API
 * 
 * Hardware Required:
 * - ESP32-CAM module
 * - WiFi connection
 * 
 * Libraries Required:
 * - ESP32 Camera (built-in)
 * - WiFi (built-in)
 * - HTTPClient (built-in)
 * - base64 (install from Library Manager: "base64" by Densaugeo)
 * 
 * Configuration:
 * 1. Update WIFI_SSID and WIFI_PASSWORD
 * 2. Update API_URL to your server address
 * 3. Update USER_ID, DEVICE_ID, etc. as needed
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <base64.h>

// ========== CONFIGURATION ==========
// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// API Configuration
const char* API_URL = "http://YOUR_SERVER_IP:3000/api/pill_identification/upload-file";
// Alternative: Use base64 endpoint
// const char* API_URL = "http://YOUR_SERVER_IP:3000/api/pill_identification/upload";

// Device Information
const int USER_ID = 1;                    // User ID from database
const int SCHEDULE_ID = 1;                // Optional: Schedule ID if known
const String DEVICE_ID = "ESP32_CAM_001";  // Your device identifier
const String CONTAINER_ID = "container_A"; // Container identifier

// Camera Configuration (for AI-Thinker ESP32-CAM)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ========== FUNCTION DECLARATIONS ==========
bool initCamera();
bool connectWiFi();
String captureImage();
bool uploadImageMultipart(String imageData);
bool uploadImageBase64(String imageData);

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ESP32-CAM Pill Identification ===");
  
  // Initialize camera
  if (!initCamera()) {
    Serial.println("Camera initialization failed!");
    return;
  }
  Serial.println("Camera initialized successfully");
  
  // Connect to WiFi
  if (!connectWiFi()) {
    Serial.println("WiFi connection failed!");
    return;
  }
  Serial.println("WiFi connected successfully");
  
  delay(2000);
}

// ========== MAIN LOOP ==========
void loop() {
  Serial.println("\n--- Capturing image ---");
  
  // Capture image
  String imageData = captureImage();
  if (imageData.length() == 0) {
    Serial.println("Failed to capture image");
    delay(5000);
    return;
  }
  
  Serial.println("Image captured successfully");
  Serial.print("Image size: ");
  Serial.print(imageData.length());
  Serial.println(" bytes");
  
  // Upload image using multipart/form-data (recommended)
  Serial.println("\n--- Uploading image (multipart) ---");
  if (uploadImageMultipart(imageData)) {
    Serial.println("Image uploaded successfully!");
  } else {
    Serial.println("Multipart upload failed, trying base64...");
    // Fallback to base64
    if (uploadImageBase64(imageData)) {
      Serial.println("Image uploaded successfully (base64)!");
    } else {
      Serial.println("Base64 upload also failed!");
    }
  }
  
  // Wait before next capture
  Serial.println("\nWaiting 30 seconds before next capture...");
  delay(30000);
}

// ========== CAMERA INITIALIZATION ==========
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Frame size - adjust based on your needs
  // FRAMESIZE_UXGA (1600x1200) - highest quality but larger
  // FRAMESIZE_SVGA (800x600) - good balance
  // FRAMESIZE_VGA (640x480) - smaller, faster
  config.frame_size = FRAMESIZE_SVGA;
  config.jpeg_quality = 12;  // 0-63, lower = higher quality
  config.fb_count = 1;
  
  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }
  
  return true;
}

// ========== WIFI CONNECTION ==========
bool connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP address: ");
    Serial.println(WiFi.localIP());
    return true;
  }
  
  return false;
}

// ========== CAPTURE IMAGE ==========
String captureImage() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return "";
  }
  
  // Convert to base64 string
  String imageBase64 = base64::encode((uint8_t*)fb->buf, fb->len);
  
  // Free the frame buffer
  esp_camera_fb_return(fb);
  
  return imageBase64;
}

// ========== UPLOAD IMAGE - MULTIPART/FORM-DATA ==========
bool uploadImageMultipart(String imageBase64) {
  HTTPClient http;
  http.begin(API_URL);
  
  // Decode base64 to binary
  int imageLen = base64::decodeLength(imageBase64);
  uint8_t* imageData = new uint8_t[imageLen];
  base64::decode(imageBase64, imageData, imageLen);
  
  // Build multipart form data
  String boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  String body = "--" + boundary + "\r\n";
  body += "Content-Disposition: form-data; name=\"user\"\r\n\r\n";
  body += String(USER_ID) + "\r\n";
  
  body += "--" + boundary + "\r\n";
  body += "Content-Disposition: form-data; name=\"deviceId\"\r\n\r\n";
  body += DEVICE_ID + "\r\n";
  
  body += "--" + boundary + "\r\n";
  body += "Content-Disposition: form-data; name=\"containerId\"\r\n\r\n";
  body += CONTAINER_ID + "\r\n";
  
  if (SCHEDULE_ID > 0) {
    body += "--" + boundary + "\r\n";
    body += "Content-Disposition: form-data; name=\"scheduleId\"\r\n\r\n";
    body += String(SCHEDULE_ID) + "\r\n";
  }
  
  body += "--" + boundary + "\r\n";
  body += "Content-Disposition: form-data; name=\"image\"; filename=\"pill.jpg\"\r\n";
  body += "Content-Type: image/jpeg\r\n\r\n";
  
  // Calculate total length
  int bodyLen = body.length();
  String endBoundary = "\r\n--" + boundary + "--\r\n";
  int totalLen = bodyLen + imageLen + endBoundary.length();
  
  // Set headers
  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
  http.addHeader("Content-Length", String(totalLen));
  
  // Build complete payload
  uint8_t* payload = new uint8_t[totalLen];
  int pos = 0;
  
  // Copy body text
  memcpy(payload + pos, body.c_str(), bodyLen);
  pos += bodyLen;
  
  // Copy image data
  memcpy(payload + pos, imageData, imageLen);
  pos += imageLen;
  
  // Copy end boundary
  memcpy(payload + pos, endBoundary.c_str(), endBoundary.length());
  
  // Send POST request
  int httpResponseCode = http.POST(payload, totalLen);
  
  delete[] imageData;
  delete[] payload;
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
    http.end();
    return (httpResponseCode == 201);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    http.end();
    return false;
  }
}

// ========== UPLOAD IMAGE - BASE64 JSON ==========
bool uploadImageBase64(String imageBase64) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Build JSON payload
  String jsonPayload = "{";
  jsonPayload += "\"user\":" + String(USER_ID) + ",";
  jsonPayload += "\"imageBase64\":\"data:image/jpeg;base64," + imageBase64 + "\",";
  jsonPayload += "\"deviceId\":\"" + DEVICE_ID + "\",";
  jsonPayload += "\"containerId\":\"" + CONTAINER_ID + "\"";
  
  if (SCHEDULE_ID > 0) {
    jsonPayload += ",\"scheduleId\":" + String(SCHEDULE_ID);
  }
  
  jsonPayload += "}";
  
  Serial.print("Payload size: ");
  Serial.println(jsonPayload.length());
  
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
    http.end();
    return (httpResponseCode == 201);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    http.end();
    return false;
  }
}

