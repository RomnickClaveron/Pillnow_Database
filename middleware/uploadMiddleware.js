const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp_userId_originalname
        const userId = req.body.user || 'unknown';
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '_');
        const filename = `${timestamp}_${userId}_${originalName}`;
        cb(null, filename);
    }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype);
    // Accept image files
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.error('Invalid file type:', file.mimetype);
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware for single file upload
exports.uploadSingle = upload.single('image');

// Middleware for multiple files (if needed in future)
exports.uploadMultiple = upload.array('images', 10);

// Helper function to get file URL
exports.getFileUrl = (req, filename) => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${filename}`;
};


