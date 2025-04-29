const DeviceLogs = require('../models/device_logsModels');

// Create a new device log
exports.createDeviceLog = async (req, res) => {
    try {
        const deviceLog = new DeviceLogs({
            deviceId: req.body.deviceId,
            userId: req.body.userId,
            action: req.body.action
        });
        const savedLog = await deviceLog.save();
        res.status(201).json(savedLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all device logs
exports.getAllDeviceLogs = async (req, res) => {
    try {
        const logs = await DeviceLogs.find().populate('userId');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get device logs by device ID
exports.getDeviceLogsByDeviceId = async (req, res) => {
    try {
        const logs = await DeviceLogs.find({ deviceId: req.params.deviceId }).populate('userId');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get device logs by user ID
exports.getDeviceLogsByUserId = async (req, res) => {
    try {
        const logs = await DeviceLogs.find({ userId: req.params.userId }).populate('userId');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get device logs by action type
exports.getDeviceLogsByAction = async (req, res) => {
    try {
        const logs = await DeviceLogs.find({ action: req.params.action }).populate('userId');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a device log
exports.updateDeviceLog = async (req, res) => {
    try {
        const updatedLog = await DeviceLogs.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('userId');
        res.status(200).json(updatedLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a device log
exports.deleteDeviceLog = async (req, res) => {
    try {
        await DeviceLogs.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Device log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

