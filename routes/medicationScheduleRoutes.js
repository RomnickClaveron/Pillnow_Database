const express = require('express');
const router = express.Router();
const medicationScheduleController = require('../controllers/medicationScheduleController');

// Create a new medication schedule
router.post('/', medicationScheduleController.createMedicationSchedule);

// Get all medication schedules
router.get('/', medicationScheduleController.getAllMedicationSchedules);

// Test connection endpoint (must come before parameterized routes)
router.get('/test/connection', medicationScheduleController.testConnection);

// Debug endpoint to check model and schema
router.get('/debug/model', medicationScheduleController.debugModel);

// Get medication schedules by user ID
router.get('/user/:userId', medicationScheduleController.getMedicationSchedulesByUserId);

// Get medication schedules by medication ID
router.get('/medication/:medicationId', medicationScheduleController.getMedicationSchedulesByMedicationId);

// Get medication schedules by container ID
router.get('/container/:containerId', medicationScheduleController.getMedicationSchedulesByContainerId);

// Get medication schedules by user and container
router.get('/user/:userId/container/:containerId', medicationScheduleController.getMedicationSchedulesByUserAndContainer);

// Update a medication schedule
router.put('/:id', medicationScheduleController.updateMedicationSchedule);

// Delete a medication schedule
router.delete('/:id', medicationScheduleController.deleteMedicationSchedule);

module.exports = router; 