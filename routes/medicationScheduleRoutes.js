const express = require('express');
const router = express.Router();
const medicationScheduleController = require('../controllers/medicationScheduleController');
const { protect } = require('../middleware/authMiddleware');
const { validateUserIdMatch, validateScheduleOwnership, validateCreateOwnership } = require('../middleware/scheduleAuthMiddleware');

// Create a new medication schedule
router.post('/', protect, validateCreateOwnership, medicationScheduleController.createMedicationSchedule);

// Get all medication schedules
router.get('/', protect, medicationScheduleController.getAllMedicationSchedules);

// Test connection endpoint (must come before parameterized routes)
router.get('/test/connection', medicationScheduleController.testConnection);

// Debug endpoint to check model and schema
router.get('/debug/model', medicationScheduleController.debugModel);

// Get medication schedules by user ID
router.get('/user/:userId', protect, validateUserIdMatch, medicationScheduleController.getMedicationSchedulesByUserId);

// Get medication schedules by medication ID
router.get('/medication/:medicationId', protect, medicationScheduleController.getMedicationSchedulesByMedicationId);

// Get medication schedules by container ID
router.get('/container/:containerId', protect, medicationScheduleController.getMedicationSchedulesByContainerId);

// Get container status summary
router.get('/container/:containerId/summary', protect, medicationScheduleController.getContainerStatusSummary);

// Get medication schedules by user and container
router.get('/user/:userId/container/:containerId', protect, validateUserIdMatch, medicationScheduleController.getMedicationSchedulesByUserAndContainer);

// Update a medication schedule
router.put('/:id', protect, validateScheduleOwnership, medicationScheduleController.updateMedicationSchedule);

// Delete a medication schedule
router.delete('/:id', protect, validateScheduleOwnership, medicationScheduleController.deleteMedicationSchedule);

// ===== NEW STATUS UPDATE SYSTEM ROUTES =====

// Manual status update
router.post('/status/update', protect, validateScheduleOwnership, medicationScheduleController.updateScheduleStatus);

// Get status history for a schedule
router.get('/status/history/:scheduleId', protect, validateScheduleOwnership, medicationScheduleController.getStatusHistory);

// Get schedules that need notifications
router.get('/notifications/pending', protect, medicationScheduleController.getSchedulesForNotification);

// Mark alert as sent
router.post('/notifications/mark-sent', protect, medicationScheduleController.markAlertSent);

// Start automatic status updates
router.post('/status/start-automatic', protect, medicationScheduleController.startAutomaticUpdates);

// Stop automatic status updates
router.post('/status/stop-automatic', protect, medicationScheduleController.stopAutomaticUpdates);

// Manual trigger for status updates (for testing)
router.post('/status/trigger-update', protect, medicationScheduleController.triggerStatusUpdate);

// Real-time status updates stream (SSE)
router.get('/status/stream', protect, medicationScheduleController.streamStatusUpdates);

// ===== NOTIFICATION SERVICE ROUTES =====

// Start notification service
router.post('/notifications/start-service', protect, medicationScheduleController.startNotificationService);

// Stop notification service
router.post('/notifications/stop-service', protect, medicationScheduleController.stopNotificationService);

// Send test notification
router.post('/notifications/test', protect, medicationScheduleController.sendTestNotification);

// Get user notification settings
router.get('/notifications/settings/:userId', protect, validateUserIdMatch, medicationScheduleController.getUserNotificationSettings);

// Update user notification settings
router.put('/notifications/settings/:userId', protect, validateUserIdMatch, medicationScheduleController.updateUserNotificationSettings);

module.exports = router; 