const PillIdentification = require('../models/pill_identificationModels');
const MedicationSchedule = require('../models/medication_scheduleModels');
const Medication = require('../models/medicationModels');
const statusUpdateService = require('../services/statusUpdateService');
const { getFileUrl } = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

// IoT Device: Upload image file directly (multipart/form-data or base64)
exports.uploadImageFile = async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('Headers:', req.headers);
        
        // Validate required fields
        if (!req.body.user) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required field: user is required',
                received: {
                    body: req.body,
                    hasFile: !!req.file
                }
            });
        }

        let imageUrl = null;
        let imagePath = null;

        // Handle file upload (multipart/form-data)
        if (req.file) {
            console.log('Processing file upload:', req.file.filename);
            imagePath = req.file.path;
            imageUrl = getFileUrl(req, req.file.filename);
        }
        // Handle base64 image
        else if (req.body.imageBase64) {
            console.log('Processing base64 upload');
            const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Determine file extension from base64 header or default to jpg
            const imageType = req.body.imageBase64.match(/data:image\/(\w+);base64/);
            const extension = imageType ? imageType[1] : 'jpg';
            
            const userId = req.body.user;
            const timestamp = Date.now();
            const filename = `${timestamp}_${userId}_pill.${extension}`;
            const uploadsDir = path.join(__dirname, '../uploads');
            
            // Ensure uploads directory exists
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            imagePath = path.join(uploadsDir, filename);
            fs.writeFileSync(imagePath, buffer);
            imageUrl = getFileUrl(req, filename);
        }
        else {
            return res.status(400).json({ 
                success: false,
                message: 'Missing image: Please provide either a file upload or imageBase64' 
            });
        }

        if (!imageUrl) {
            return res.status(400).json({ 
                success: false,
                message: 'Failed to process image' 
            });
        }

        const pillId = new PillIdentification({
            user: Number(req.body.user),
            scheduleId: req.body.scheduleId ? Number(req.body.scheduleId) : undefined,
            imageUrl: imageUrl,
            deviceId: req.body.deviceId || undefined,
            containerId: req.body.containerId || undefined,
            status: 'pending',
            notes: req.body.notes || 'Image uploaded from ESP32-CAM, awaiting identification'
        });
        
        const savedPillId = await pillId.save();
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully, awaiting identification',
            data: {
                imageId: savedPillId.imageId,
                status: savedPillId.status,
                imageUrl: savedPillId.imageUrl,
                imagePath: imagePath,
                createdAt: savedPillId.createdAt
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);
        
        // Clean up uploaded file if database save fails
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        res.status(500).json({ 
            success: false,
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// IoT Device: Upload image (initial capture - pending identification) - URL or base64
exports.uploadImage = async (req, res) => {
    try {
        // Validate required fields for initial upload
        if (!req.body.user || !req.body.imageUrl) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: user and imageUrl are required' 
            });
        }

        const pillId = new PillIdentification({
            user: req.body.user,
            scheduleId: req.body.scheduleId || undefined,
            imageUrl: req.body.imageUrl,
            deviceId: req.body.deviceId || undefined,
            containerId: req.body.containerId || undefined,
            status: 'pending',  // Will be updated after identification
            notes: req.body.notes || 'Image uploaded from IoT device, awaiting identification'
        });
        
        const savedPillId = await pillId.save();
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully, awaiting identification',
            data: {
                imageId: savedPillId.imageId,
                status: savedPillId.status,
                imageUrl: savedPillId.imageUrl,
                createdAt: savedPillId.createdAt
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// System: Process image, identify pill, verify against schedule, and generate report
exports.processAndVerify = async (req, res) => {
    try {
        const { imageId, classification, confidence, medicationId } = req.body;

        if (!imageId || !classification || confidence === undefined) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: imageId, classification, and confidence are required' 
            });
        }

        // Validate confidence
        const confValue = Number(confidence);
        if (isNaN(confValue) || confValue < 0 || confValue > 1) {
            return res.status(400).json({ 
                success: false,
                message: 'Confidence must be a number between 0 and 1' 
            });
        }

        // Find the pill identification record
        const pillId = await PillIdentification.findOne({ imageId: imageId });
        if (!pillId) {
            return res.status(404).json({ 
                success: false,
                message: 'Image record not found' 
            });
        }

        if (pillId.status !== 'pending') {
            return res.status(400).json({ 
                success: false,
                message: `Image already processed. Current status: ${pillId.status}` 
            });
        }

        // Update with identification results
        pillId.classification = classification;
        pillId.confidence = confValue;
        pillId.status = 'identified';
        if (medicationId) {
            pillId.medication = medicationId;
        }

        // Find matching medication by name (classification)
        let matchedMedication = null;
        if (medicationId) {
            matchedMedication = await Medication.findOne({ medId: medicationId });
        } else {
            // Try to find medication by name match
            matchedMedication = await Medication.findOne({ 
                name: { $regex: new RegExp(classification, 'i') } 
            });
            if (matchedMedication) {
                pillId.medication = matchedMedication.medId;
            }
        }

        // Verify against schedule if scheduleId exists
        let schedule = null;
        let isCorrectPill = false;
        let verificationReport = null;

        if (pillId.scheduleId) {
            schedule = await MedicationSchedule.findOne({ scheduleId: pillId.scheduleId })
                .populate('medication', 'name');
            
            if (schedule) {
                const expectedMedication = await Medication.findOne({ medId: schedule.medication });
                
                if (expectedMedication) {
                    // Check if identified pill matches expected medication
                    const expectedName = expectedMedication.name.toLowerCase();
                    const identifiedName = classification.toLowerCase();
                    
                    // Simple name matching (can be enhanced with fuzzy matching)
                    isCorrectPill = expectedName.includes(identifiedName) || 
                                   identifiedName.includes(expectedName) ||
                                   (matchedMedication && matchedMedication.medId === expectedMedication.medId);

                    pillId.verification.isCorrectPill = isCorrectPill;
                    pillId.verification.expectedMedication = expectedMedication.medId;
                    pillId.verification.expectedMedicationName = expectedMedication.name;
                    pillId.verification.identifiedMedicationName = classification;
                    pillId.verification.matchConfidence = isCorrectPill ? confValue : (1 - confValue);
                    pillId.verification.verifiedAt = new Date();

                    if (isCorrectPill && confValue >= 0.7) {
                        pillId.status = 'verified';
                        
                        // Update schedule status to "Taken" if it's pending
                        if (schedule.status === 'Pending') {
                            await statusUpdateService.updateScheduleStatus(
                                schedule.scheduleId,
                                'Taken',
                                'automatic',
                                `Pill verified via image identification. Confidence: ${(confValue * 100).toFixed(1)}%`
                            );
                            
                            // Update adherence data
                            schedule = await MedicationSchedule.findOne({ scheduleId: pillId.scheduleId });
                            const scheduledTime = new Date(`${schedule.date.toISOString().split('T')[0]} ${schedule.time}`);
                            const now = new Date();
                            const timeDiff = Math.abs(now - scheduledTime) / (1000 * 60); // minutes
                            
                            schedule.updateAdherenceData({
                                takenOnTime: timeDiff <= 15,
                                takenLate: timeDiff > 15,
                                lateByMinutes: timeDiff > 15 ? timeDiff : 0
                            });
                            await schedule.save();
                        }
                    } else {
                        pillId.status = 'mismatch';
                    }
                }
            }
        }

        await pillId.save();

        // Generate comprehensive report
        const report = {
            imageId: pillId.imageId,
            identification: {
                classification: classification,
                confidence: confValue,
                confidencePercentage: (confValue * 100).toFixed(1) + '%',
                status: pillId.status
            },
            verification: pillId.verification.isCorrectPill ? {
                isCorrectPill: true,
                expectedMedication: pillId.verification.expectedMedicationName,
                identifiedMedication: pillId.verification.identifiedMedicationName,
                matchConfidence: pillId.verification.matchConfidence
            } : {
                isCorrectPill: false,
                expectedMedication: pillId.verification.expectedMedicationName || 'Not specified',
                identifiedMedication: pillId.verification.identifiedMedicationName,
                warning: 'Identified pill does not match expected medication'
            },
            schedule: schedule ? {
                scheduleId: schedule.scheduleId,
                status: schedule.status,
                scheduledTime: `${schedule.date.toISOString().split('T')[0]} ${schedule.time}`,
                medicationTaken: schedule.status === 'Taken',
                takenOnTime: schedule.adherenceData?.takenOnTime || false
            } : null,
            summary: {
                medicineTaken: schedule && schedule.status === 'Taken',
                correctPill: isCorrectPill,
                actionRequired: !isCorrectPill || confValue < 0.7
            },
            timestamp: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            message: 'Image processed and verified successfully',
            report: report,
            data: pillId
        });

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Create a new pill identification (manual/complete entry)
exports.createPillIdentification = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.user || !req.body.imageUrl || !req.body.classification || req.body.confidence === undefined) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: user, imageUrl, classification, and confidence are required' 
            });
        }

        // Validate confidence is a number between 0 and 1
        const confidence = Number(req.body.confidence);
        if (isNaN(confidence) || confidence < 0 || confidence > 1) {
            return res.status(400).json({ 
                success: false,
                message: 'Confidence must be a number between 0 and 1' 
            });
        }

        const pillId = new PillIdentification({
            user: req.body.user,
            medication: req.body.medication || undefined,
            scheduleId: req.body.scheduleId || undefined,
            imageUrl: req.body.imageUrl,
            classification: req.body.classification,
            confidence: confidence,
            status: req.body.status || 'identified',
            deviceId: req.body.deviceId || undefined,
            containerId: req.body.containerId || undefined
        });
        const savedPillId = await pillId.save();
        res.status(201).json({
            success: true,
            message: 'Pill identification created successfully',
            data: savedPillId
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get all pill identifications
exports.getAllPillIdentifications = async (req, res) => {
    try {
        const pillIds = await PillIdentification.find()
            .populate('user', 'name email')
            .populate('medication', 'name dosage');
        res.status(200).json({
            success: true,
            count: pillIds.length,
            data: pillIds
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get pill identifications by user ID
exports.getPillIdentificationsByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid user ID' 
            });
        }
        const pillIds = await PillIdentification.find({ user: userId })
            .populate('user', 'name email')
            .populate('medication', 'name dosage');
        res.status(200).json({
            success: true,
            count: pillIds.length,
            userId: userId,
            data: pillIds
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get pill identifications by medication ID
exports.getPillIdentificationsByMedicationId = async (req, res) => {
    try {
        const medicationId = Number(req.params.medicationId);
        if (isNaN(medicationId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid medication ID' 
            });
        }
        const pillIds = await PillIdentification.find({ medication: medicationId })
            .populate('user', 'name email')
            .populate('medication', 'name dosage');
        res.status(200).json({
            success: true,
            count: pillIds.length,
            medicationId: medicationId,
            data: pillIds
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get pending identifications (for system processing)
exports.getPendingIdentifications = async (req, res) => {
    try {
        const pendingIds = await PillIdentification.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: 1 }); // Oldest first
        
        res.status(200).json({
            success: true,
            count: pendingIds.length,
            data: pendingIds
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get pill identification by imageId
exports.getPillIdentificationByImageId = async (req, res) => {
    try {
        const imageId = Number(req.params.imageId);
        if (isNaN(imageId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid image ID' 
            });
        }
        const pillId = await PillIdentification.findOne({ imageId: imageId })
            .populate('user', 'name email')
            .populate('medication', 'name dosage')
            .populate('scheduleId', 'scheduleId date time status');
        
        if (!pillId) {
            return res.status(404).json({ 
                success: false,
                message: 'Pill identification not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: pillId
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update a pill identification
exports.updatePillIdentification = async (req, res) => {
    try {
        // Validate confidence if provided
        if (req.body.confidence !== undefined) {
            const confidence = Number(req.body.confidence);
            if (isNaN(confidence) || confidence < 0 || confidence > 1) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Confidence must be a number between 0 and 1' 
                });
            }
            req.body.confidence = confidence;
        }

        // Map field names if old format is used
        const updateData = { ...req.body };
        if (updateData.userId) {
            updateData.user = updateData.userId;
            delete updateData.userId;
        }
        if (updateData.medicationId !== undefined) {
            updateData.medication = updateData.medicationId;
            delete updateData.medicationId;
        }

        const updatedPillId = await PillIdentification.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('user', 'name email')
        .populate('medication', 'name dosage');
        
        if (!updatedPillId) {
            return res.status(404).json({ 
                success: false,
                message: 'Pill identification not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pill identification updated successfully',
            data: updatedPillId
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Delete a pill identification
exports.deletePillIdentification = async (req, res) => {
    try {
        const deletedPillId = await PillIdentification.findByIdAndDelete(req.params.id);
        if (!deletedPillId) {
            return res.status(404).json({ 
                success: false,
                message: 'Pill identification not found' 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Pill identification deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};