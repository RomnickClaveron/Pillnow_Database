const express = require('express');
const router = express.Router();
const deviceLogsController = require('../controllers/deviceLogsController');

// Create a new device log
router.post('/', deviceLogsController.createDeviceLog);

// Get all device logs
router.get('/', deviceLogsController.getAllDeviceLogs);

// Get device logs by device ID
router.get('/device/:deviceId', deviceLogsController.getDeviceLogsByDeviceId);

// Get device logs by user ID
router.get('/user/:userId', deviceLogsController.getDeviceLogsByUserId);

// Get device logs by action type
router.get('/action/:action', deviceLogsController.getDeviceLogsByAction);

// Update a device log
router.put('/:id', deviceLogsController.updateDeviceLog);

// Delete a device log
router.delete('/:id', deviceLogsController.deleteDeviceLog);

module.exports = router; 