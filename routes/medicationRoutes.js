const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationControllers');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes - anyone can view medications
router.get('/', medicationController.getAllMedications);
router.get('/:id', medicationController.getMedicationById);

// Admin-only routes - only admins can create, update, delete medications
router.post('/', protect, adminOnly, medicationController.addMedication);
router.put('/:id', protect, adminOnly, medicationController.updateMedicationById);
router.delete('/:id', protect, adminOnly, medicationController.deleteMedicationById);

module.exports = router; 