const DeviceLogs = require('../models/device_logsModels');

// Create a new device log
exports.createDeviceLog = async (req, res) => {
    try {
        const deviceLog = new DeviceLogs({
            deviceId: req.body.deviceId,
            user: req.body.user,
            medication: req.body.medication,
            action: req.body.action,
            pillName: req.body.pillName,
            containerSlot: req.body.containerSlot,
            timestamp: req.body.timestamp || new Date(),
            metadata: req.body.metadata
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
        const logs = await DeviceLogs.find().populate('user').populate('medication');
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
        const logs = await DeviceLogs.find({ user: req.params.userId }).populate('user').populate('medication');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get device logs by action type
exports.getDeviceLogsByAction = async (req, res) => {
    try {
        const logs = await DeviceLogs.find({ action: req.params.action }).populate('user').populate('medication');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get device logs by medication ID
exports.getDeviceLogsByMedicationId = async (req, res) => {
    try {
        const logs = await DeviceLogs.find({ medication: req.params.medicationId }).populate('user').populate('medication');
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
        ).populate('user').populate('medication');
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

// Get current device status for a specific device
exports.getDeviceCurrentStatus = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        
        // Get the latest log for this device
        const latestLog = await DeviceLogs.findOne({ deviceId })
            .sort({ timestamp: -1 })
            .populate('user')
            .populate('medication');
        
        if (!latestLog) {
            return res.status(404).json({ message: 'No device logs found for this device' });
        }
        
        // Get recent activity (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivity = await DeviceLogs.find({
            deviceId: deviceId,
            timestamp: { $gte: oneDayAgo }
        }).sort({ timestamp: -1 }).limit(10);
        
        // Get device statistics
        const totalLogs = await DeviceLogs.countDocuments({ deviceId });
        const pillTakenCount = await DeviceLogs.countDocuments({ 
            deviceId: deviceId, 
            action: 'Pill Taken' 
        });
        
        const deviceStatus = {
            deviceId: deviceId,
            currentStatus: latestLog.action,
            lastActivity: latestLog.timestamp,
            lastPillTaken: latestLog.action === 'Pill Taken' ? latestLog.timestamp : null,
            recentActivity: recentActivity,
            statistics: {
                totalLogs: totalLogs,
                pillsTaken: pillTakenCount,
                last24Hours: recentActivity.length
            },
            currentMedication: latestLog.medication,
            currentUser: latestLog.user
        };
        
        res.status(200).json(deviceStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's current device overview
exports.getUserDeviceOverview = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Get all devices associated with this user
        const userDevices = await DeviceLogs.find({ user: userId })
            .distinct('deviceId');
        
        const deviceOverview = [];
        
        for (const deviceId of userDevices) {
            // Get latest status for each device
            const latestLog = await DeviceLogs.findOne({ 
                deviceId: deviceId, 
                user: userId 
            }).sort({ timestamp: -1 }).populate('medication');
            
            // Get today's pill count
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const todayPills = await DeviceLogs.countDocuments({
                deviceId: deviceId,
                user: userId,
                action: 'Pill Taken',
                timestamp: { $gte: today, $lt: tomorrow }
            });
            
            deviceOverview.push({
                deviceId: deviceId,
                currentStatus: latestLog ? latestLog.action : 'No Activity',
                lastActivity: latestLog ? latestLog.timestamp : null,
                currentMedication: latestLog ? latestLog.medication : null,
                todayPillsTaken: todayPills,
                pillName: latestLog ? latestLog.pillName : null
            });
        }
        
        res.status(200).json({
            userId: userId,
            totalDevices: deviceOverview.length,
            devices: deviceOverview
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get real-time device dashboard data
exports.getDeviceDashboard = async (req, res) => {
    try {
        const { deviceId, userId } = req.query;
        
        let query = {};
        if (deviceId) query.deviceId = deviceId;
        if (userId) query.user = userId;
        
        // Get today's data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayQuery = { ...query, timestamp: { $gte: today, $lt: tomorrow } };
        
        const dashboardData = {
            today: {
                pillsTaken: await DeviceLogs.countDocuments({ ...todayQuery, action: 'Pill Taken' }),
                alarmsTriggered: await DeviceLogs.countDocuments({ ...todayQuery, action: 'Alarm Triggered' }),
                containerOpened: await DeviceLogs.countDocuments({ ...todayQuery, action: 'Container Opened' }),
                totalActivities: await DeviceLogs.countDocuments(todayQuery)
            },
            recentActivity: await DeviceLogs.find(query)
                .sort({ timestamp: -1 })
                .limit(20)
                .populate('user')
                .populate('medication'),
            deviceStatus: await DeviceLogs.findOne(query)
                .sort({ timestamp: -1 })
                .populate('medication')
        };
        
        res.status(200).json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

