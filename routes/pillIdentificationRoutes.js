const express = require('express');
const router = express.Router();
const pillIdentificationController = require('../controllers/pillIdentificationController');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// ===== IoT DEVICE WORKFLOW ENDPOINTS =====

// IoT Device: Upload image file directly (multipart/form-data or base64) - ESP32-CAM
router.post('/upload-file', (req, res, next) => {
    console.log('Upload-file route hit');
    console.log('Content-Type:', req.headers['content-type']);
    uploadSingle(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error',
                error: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
        next();
    });
}, pillIdentificationController.uploadImageFile);

// IoT Device: Upload image (URL or base64 string)
router.post('/upload', pillIdentificationController.uploadImage);

// System: Process image, identify pill, verify against schedule, and generate report
router.post('/process', pillIdentificationController.processAndVerify);

// Get pending identifications (for system to process)
router.get('/pending', pillIdentificationController.getPendingIdentifications);

// ===== STANDARD ENDPOINTS =====

// Create a new pill identification (manual/complete entry)
router.post('/', pillIdentificationController.createPillIdentification);

// Get all pill identifications
router.get('/', pillIdentificationController.getAllPillIdentifications);

// Get pill identifications by user ID
router.get('/user/:userId', pillIdentificationController.getPillIdentificationsByUserId);

// Get pill identifications by medication ID
router.get('/medication/:medicationId', pillIdentificationController.getPillIdentificationsByMedicationId);

// Get pill identification by imageId
router.get('/image/:imageId', pillIdentificationController.getPillIdentificationByImageId);

// Update a pill identification
router.put('/:id', pillIdentificationController.updatePillIdentification);

// Delete a pill identification
router.delete('/:id', pillIdentificationController.deletePillIdentification);

module.exports = router; 