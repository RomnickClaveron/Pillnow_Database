const express = require('express');
const router = express.Router();
const {
    assignElderDevice,
    getElderDevice
} = require('../controllers/deviceController');

// Caregiver-Elder-Device Association Routes
// POST /api/caregivers/assign-elder-device - Link elder to device
router.post('/assign-elder-device', assignElderDevice);

// GET /api/caregivers/elder-device/:elderId - Get elder's device
router.get('/elder-device/:elderId', getElderDevice);

module.exports = router;



