const express = require('express');
const router = express.Router();
const {
    getDeviceAdherenceStats,
    getDeviceSchedulesEnhanced,
    getElderDeviceMonitoring,
    getMonitoringAlerts
} = require('../controllers/monitorController');

// Enhanced Monitoring Routes
// GET /api/monitor/device-stats/:deviceId - Get device adherence stats
router.get('/device-stats/:deviceId', getDeviceAdherenceStats);

// GET /api/monitor/device-schedules/:deviceId - Get device-specific schedules
router.get('/device-schedules/:deviceId', getDeviceSchedulesEnhanced);

// GET /api/monitor/elder-device/:elderId - Get elder's device info
router.get('/elder-device/:elderId', getElderDeviceMonitoring);

// GET /api/monitor/alerts - Get monitoring alerts and notifications
router.get('/alerts', getMonitoringAlerts);

module.exports = router;



