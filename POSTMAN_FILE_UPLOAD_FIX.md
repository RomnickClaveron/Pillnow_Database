# Fix: Postman File Upload Error

## 🔴 Error Message
"The file above is not in your working directory, and will be unavailable to your teammates when you share the request."

## ✅ Solution

### Method 1: Select File Directly (Recommended)

1. **In Postman, go to the Body tab**
2. **Select "form-data"**
3. **For the `image` field:**
   - Make sure the type is set to **"File"** (not Text)
   - Click **"Select Files"** button
   - **Browse and select your image file** from your computer
   - The file will be embedded in the request

**Important:** Don't type a file path - use the "Select Files" button!

### Method 2: Use Base64 Instead

If file selection doesn't work, use base64:

1. **Convert your image to base64:**
   ```bash
   # Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("image.jpg"))
   
   # Linux/Mac
   base64 -i image.jpg
   ```

2. **In Postman:**
   - Method: POST
   - URL: `http://localhost:3000/api/pill_identification/upload-file`
   - Body → **raw** → **JSON**
   - Paste this:
   ```json
   {
     "user": 1,
     "imageBase64": "data:image/jpeg;base64,YOUR_BASE64_STRING_HERE",
     "deviceId": "postman_test"
   }
   ```

### Method 3: Use Postman's File Upload Feature

1. **Click on the `image` field**
2. **You should see "Select Files" button**
3. **Click it and choose your file**
4. **The file name should appear next to the field**

---

## 📸 Step-by-Step Visual Guide

### Correct Way:
```
┌─────────────────────────────────────┐
│ Body → form-data                    │
├─────────────────────────────────────┤
│ Key          │ Type │ Value         │
├──────────────┼──────┼───────────────┤
│ user        │ Text │ 1             │
│ image       │ File │ [Select Files]│ ← Click here!
│             │      │ pill.jpg ✓    │ ← File appears here
└─────────────────────────────────────┘
```

### Wrong Way:
```
┌─────────────────────────────────────┐
│ Key          │ Type │ Value         │
├──────────────┼──────┼───────────────┤
│ image       │ Text │ C:\path\to\   │ ← ❌ Don't type path!
│             │      │ image.jpg     │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Problem: "Select Files" button not showing
**Solution:**
1. Make sure you selected **"form-data"** (not raw)
2. Click the dropdown next to "Key" field
3. Select **"File"** from dropdown
4. Then "Select Files" will appear

### Problem: File selected but still getting error
**Solution:**
1. Make sure the file is actually selected (you should see filename)
2. Try a different image file
3. Check file size (max 5MB)
4. Try using base64 method instead

### Problem: Can't find the file type dropdown
**Solution:**
- The dropdown is on the RIGHT side of the Key field
- It shows "Text" by default
- Click it and change to "File"

---

## 🎯 Quick Fix Checklist

- [ ] Body tab is selected
- [ ] "form-data" is selected (not raw)
- [ ] `image` field type is set to "File" (not Text)
- [ ] Clicked "Select Files" button
- [ ] File is selected (filename appears)
- [ ] File size is under 5MB

---

## 💡 Alternative: Use the HTML Form

If Postman keeps giving issues, use the HTML form I created:

1. Open `examples/upload_image_simple.html` in your browser
2. Select image
3. Click "Upload Image"
4. Done! ✅

This works directly in the browser and doesn't have file path issues.

---

## 📝 Updated Postman Collection

The Postman collection has been updated. When you import it:

1. The "Upload Image File (Multipart)" request is ready
2. Just click "Select Files" in the `image` field
3. Choose your image
4. Click Send

**No file paths needed - just select the file directly!**



