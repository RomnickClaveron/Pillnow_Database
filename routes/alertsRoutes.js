const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

// Create a new alert
router.post('/', alertsController.createAlert);

// Get all alerts
router.get('/', alertsController.getAllAlerts);

// Get alerts by user ID
router.get('/user/:userId', alertsController.getAlertsByUserId);

// Get alerts by medication ID
router.get('/medication/:medId', alertsController.getAlertsByMedicationId);

// Get alerts by type
router.get('/type/:type', alertsController.getAlertsByType);

// Get alerts by status
router.get('/status/:status', alertsController.getAlertsByStatus);

// Update alert status
router.patch('/:id/status', alertsController.updateAlertStatus);

// Update an alert
router.put('/:id', alertsController.updateAlert);

// Delete an alert
router.delete('/:id', alertsController.deleteAlert);

module.exports = router; 