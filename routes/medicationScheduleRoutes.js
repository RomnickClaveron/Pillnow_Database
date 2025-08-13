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

// Get container status summary
router.get('/container/:containerId/summary', medicationScheduleController.getContainerStatusSummary);

// Get medication schedules by user and container
router.get('/user/:userId/container/:containerId', medicationScheduleController.getMedicationSchedulesByUserAndContainer);

// Update a medication schedule
router.put('/:id', medicationScheduleController.updateMedicationSchedule);

// Delete a medication schedule
router.delete('/:id', medicationScheduleController.deleteMedicationSchedule);

// ===== NEW STATUS UPDATE SYSTEM ROUTES =====

// Manual status update
router.post('/status/update', medicationScheduleController.updateScheduleStatus);

// Get status history for a schedule
router.get('/status/history/:scheduleId', medicationScheduleController.getStatusHistory);

// Get schedules that need notifications
router.get('/notifications/pending', medicationScheduleController.getSchedulesForNotification);

// Mark alert as sent
router.post('/notifications/mark-sent', medicationScheduleController.markAlertSent);

// Start automatic status updates
router.post('/status/start-automatic', medicationScheduleController.startAutomaticUpdates);

// Stop automatic status updates
router.post('/status/stop-automatic', medicationScheduleController.stopAutomaticUpdates);

// Manual trigger for status updates (for testing)
router.post('/status/trigger-update', medicationScheduleController.triggerStatusUpdate);

// Real-time status updates stream (SSE)
router.get('/status/stream', medicationScheduleController.streamStatusUpdates);

// ===== NOTIFICATION SERVICE ROUTES =====

// Start notification service
router.post('/notifications/start-service', medicationScheduleController.startNotificationService);

// Stop notification service
router.post('/notifications/stop-service', medicationScheduleController.stopNotificationService);

// Send test notification
router.post('/notifications/test', medicationScheduleController.sendTestNotification);

// Get user notification settings
router.get('/notifications/settings/:userId', medicationScheduleController.getUserNotificationSettings);

// Update user notification settings
router.put('/notifications/settings/:userId', medicationScheduleController.updateUserNotificationSettings);

module.exports = router; 