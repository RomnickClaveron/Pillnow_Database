const express = require('express');
const router = express.Router();
const pillIdentificationController = require('../controllers/pillIdentificationController');

// Create a new pill identification
router.post('/', pillIdentificationController.createPillIdentification);

// Get all pill identifications
router.get('/', pillIdentificationController.getAllPillIdentifications);

// Get pill identifications by user ID
router.get('/user/:userId', pillIdentificationController.getPillIdentificationsByUserId);

// Get pill identifications by medication ID
router.get('/medication/:medicationId', pillIdentificationController.getPillIdentificationsByMedicationId);

// Update a pill identification
router.put('/:id', pillIdentificationController.updatePillIdentification);

// Delete a pill identification
router.delete('/:id', pillIdentificationController.deletePillIdentification);

module.exports = router; 