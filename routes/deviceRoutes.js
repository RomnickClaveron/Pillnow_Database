const express = require('express');
const router = express.Router();
const {
    connectCaregiverToDevice,
    getCaregiverDevices,
    disconnectDevice,
    getDeviceStats,
    getDeviceSchedules,
    getElderDevice,
    assignElderDevice
} = require('../controllers/deviceController');

// Device Management Routes
// POST /api/devices/connect - Connect caregiver to device
router.post('/connect', connectCaregiverToDevice);

// GET /api/devices/caregiver/:caregiverId - Get caregiver's devices
router.get('/caregiver/:caregiverId', getCaregiverDevices);

// POST /api/devices/disconnect/:deviceId - Disconnect device
router.post('/disconnect/:deviceId', disconnectDevice);

// GET /api/devices/stats/:deviceId - Get device adherence stats
router.get('/stats/:deviceId', getDeviceStats);

// GET /api/devices/schedules/:deviceId - Get device-specific schedules
router.get('/schedules/:deviceId', getDeviceSchedules);

// GET /api/devices/elder/:elderId - Get elder's device info
router.get('/elder/:elderId', getElderDevice);

// POST /api/devices/assign-elder - Link elder to device
router.post('/assign-elder', assignElderDevice);

module.exports = router;



