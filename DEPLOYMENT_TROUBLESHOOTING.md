# Deployment Troubleshooting - Render.com

## 🔴 Issue: Upload endpoint not working on Render

### Common Problems on Render.com:

1. **Ephemeral File Storage** - Files get deleted on restart
2. **Missing Dependencies** - multer might not be installed
3. **Code Not Deployed** - Latest code might not be deployed
4. **Error Handling** - Errors might not be visible

---

## ✅ Quick Fixes

### 1. Check if Endpoint Exists

Test with a simple GET request:
```bash
curl https://pillnow-database.onrender.com/api/pill_identification/pending
```

### 2. Test with Base64 (More Reliable on Render)

**Postman:**
- Method: POST
- URL: `https://pillnow-database.onrender.com/api/pill_identification/upload-file`
- Body → raw → JSON:
```json
{
  "user": 1,
  "imageBase64": "data:image/jpeg;base64,YOUR_BASE64_HERE"
}
```

### 3. Check Render Logs

1. Go to Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for error messages

### 4. Verify Deployment

Make sure:
- [ ] Latest code is pushed to GitHub
- [ ] Render auto-deployed the latest commit
- [ ] Build completed successfully
- [ ] `multer` is in `package.json`

---

## 🔧 Solutions

### Solution 1: Use Base64 Instead of File Upload

Base64 is more reliable on Render because it doesn't require file storage:

```javascript
// In Postman or your client
{
  "user": 1,
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Solution 2: Use Cloud Storage (Recommended for Production)

For production, use cloud storage instead of local files:

**Options:**
- AWS S3
- Cloudinary
- Firebase Storage
- Google Cloud Storage

### Solution 3: Check Error Response

The endpoint now returns detailed errors. Check the response:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Stack trace (in development)"
}
```

---

## 🧪 Test Endpoints

### Test 1: Check if route is registered
```bash
curl https://pillnow-database.onrender.com/api/pill_identification/pending
```

### Test 2: Test base64 upload
```bash
curl -X POST https://pillnow-database.onrender.com/api/pill_identification/upload-file \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

### Test 3: Test file upload (if supported)
```bash
curl -X POST https://pillnow-database.onrender.com/api/pill_identification/upload-file \
  -F "user=1" \
  -F "image=@test.jpg"
```

---

## 📋 Checklist

- [ ] Code is pushed to GitHub
- [ ] Render deployment completed
- [ ] `multer` is in `package.json` dependencies
- [ ] Server logs show no errors
- [ ] Testing with base64 method
- [ ] Checking error responses

---

## 💡 Recommended: Use Base64 for Render

Since Render has ephemeral storage, **base64 upload is recommended**:

**Advantages:**
- ✅ No file storage needed
- ✅ Works immediately
- ✅ More reliable
- ✅ Same functionality

**Disadvantages:**
- ⚠️ Slightly larger payload size
- ⚠️ Needs base64 encoding on client side

---

## 🔍 Debug Steps

1. **Check Render Logs:**
   - Look for "Upload request received"
   - Check for multer errors
   - Verify file processing

2. **Test Locally First:**
   ```bash
   npm start
   # Test on localhost:3000
   ```

3. **Verify Package.json:**
   ```json
   {
     "dependencies": {
       "multer": "^1.4.5-lts.1"
     }
   }
   ```

4. **Check Environment Variables:**
   - Make sure `DB_URI` is set
   - Verify `PORT` is set (Render sets this automatically)

---

## 🚀 Quick Test Script

```bash
# Test base64 upload
curl -X POST https://pillnow-database.onrender.com/api/pill_identification/upload-file \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "imageBase64": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

This should return:
```json
{
  "success": true,
  "data": {
    "imageId": 1,
    "imageUrl": "..."
  }
}
```

---

## 📞 Next Steps

1. **Check Render logs** for specific error
2. **Try base64 method** (more reliable)
3. **Verify deployment** completed successfully
4. **Check package.json** includes multer

If still not working, share the error message from Render logs!





