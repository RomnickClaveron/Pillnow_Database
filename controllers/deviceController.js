const Device = require('../models/deviceModels');
const CaregiverConnection = require('../models/caregiverConnectionModels');
const User = require('../models/userModels');
const MedicationSchedule = require('../models/medication_scheduleModels');

// Connect caregiver to device
const connectCaregiverToDevice = async (req, res) => {
    try {
        const { caregiverId, elderId, deviceId, relationship, permissions, deviceSettings, monitoringSettings } = req.body;

        // Validate required fields
        if (!caregiverId || !elderId || !deviceId) {
            return res.status(400).json({
                success: false,
                message: 'Caregiver ID, Elder ID, and Device ID are required'
            });
        }

        // Check if device exists
        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        // Check if caregiver and elder exist
        const caregiver = await User.findById(caregiverId);
        const elder = await User.findById(elderId);
        
        if (!caregiver || !elder) {
            return res.status(404).json({
                success: false,
                message: 'Caregiver or Elder not found'
            });
        }

        // Check if connection already exists
        const existingConnection = await CaregiverConnection.findOne({
            caregiver: caregiverId,
            elder: elderId,
            device: deviceId
        });

        if (existingConnection) {
            return res.status(409).json({
                success: false,
                message: 'Connection already exists'
            });
        }

        // Create new connection
        const connection = new CaregiverConnection({
            caregiver: caregiverId,
            elder: elderId,
            device: deviceId,
            relationship: relationship || 'family',
            permissions: permissions || {
                viewMedications: true,
                manageMedications: false,
                viewAdherence: true,
                receiveAlerts: true,
                manageDevice: false
            },
            deviceSettings: deviceSettings || {},
            monitoringSettings: monitoringSettings || {}
        });

        await connection.save();

        // Update device connection status
        device.updateConnectionStatus(true);
        await device.save();

        res.status(201).json({
            success: true,
            message: 'Caregiver connected to device successfully',
            data: {
                connectionId: connection.connectionId,
                caregiver: {
                    id: caregiver.userId,
                    name: caregiver.name,
                    email: caregiver.email
                },
                elder: {
                    id: elder.userId,
                    name: elder.name,
                    email: elder.email
                },
                device: {
                    id: device.deviceId,
                    name: device.deviceName,
                    type: device.deviceType
                },
                status: connection.status
            }
        });

    } catch (error) {
        console.error('Error connecting caregiver to device:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get caregiver's devices
const getCaregiverDevices = async (req, res) => {
    try {
        const { caregiverId } = req.params;

        const connections = await CaregiverConnection.findActiveByCaregiver(caregiverId);

        const devices = connections.map(connection => ({
            connectionId: connection.connectionId,
            elder: {
                id: connection.elder.userId,
                name: connection.elder.name,
                email: connection.elder.email,
                phone: connection.elder.phone
            },
            device: {
                id: connection.device.deviceId,
                name: connection.device.deviceName,
                type: connection.device.deviceType,
                status: connection.device.status,
                batteryLevel: connection.device.batteryLevel,
                lastSeen: connection.device.lastSeen
            },
            relationship: connection.relationship,
            permissions: connection.permissions,
            connectedAt: connection.connectedAt,
            lastActivity: connection.lastActivity
        }));

        res.status(200).json({
            success: true,
            message: 'Caregiver devices retrieved successfully',
            data: devices
        });

    } catch (error) {
        console.error('Error getting caregiver devices:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Disconnect device
const disconnectDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { caregiverId } = req.body;

        // Find the connection
        const connection = await CaregiverConnection.findOne({
            device: deviceId,
            caregiver: caregiverId,
            status: 'active'
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Active connection not found'
            });
        }

        // Update connection status
        connection.updateStatus('inactive');
        await connection.save();

        // Update device status
        const device = await Device.findById(deviceId);
        if (device) {
            device.updateConnectionStatus(false);
            await device.save();
        }

        res.status(200).json({
            success: true,
            message: 'Device disconnected successfully',
            data: {
                connectionId: connection.connectionId,
                disconnectedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error disconnecting device:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get device statistics
const getDeviceStats = async (req, res) => {
    try {
        const { deviceId } = req.params;

        // Get device info
        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        // Get adherence statistics
        const schedules = await MedicationSchedule.findByDevice(deviceId);
        
        const totalSchedules = schedules.length;
        const takenSchedules = schedules.filter(s => s.status === 'Taken').length;
        const missedSchedules = schedules.filter(s => s.status === 'Missed').length;
        const pendingSchedules = schedules.filter(s => s.status === 'Pending').length;
        
        const adherenceRate = totalSchedules > 0 ? (takenSchedules / totalSchedules) * 100 : 0;
        
        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSchedules = schedules.filter(s => s.date >= sevenDaysAgo);
        const recentAdherenceRate = recentSchedules.length > 0 ? 
            (recentSchedules.filter(s => s.status === 'Taken').length / recentSchedules.length) * 100 : 0;

        res.status(200).json({
            success: true,
            message: 'Device statistics retrieved successfully',
            data: {
                device: {
                    id: device.deviceId,
                    name: device.deviceName,
                    type: device.deviceType,
                    status: device.status,
                    batteryLevel: device.batteryLevel,
                    lastSeen: device.lastSeen,
                    isConnected: device.isConnected
                },
                statistics: {
                    totalSchedules,
                    takenSchedules,
                    missedSchedules,
                    pendingSchedules,
                    adherenceRate: Math.round(adherenceRate * 100) / 100,
                    recentAdherenceRate: Math.round(recentAdherenceRate * 100) / 100
                }
            }
        });

    } catch (error) {
        console.error('Error getting device statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get device-specific schedules
const getDeviceSchedules = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { date, status } = req.query;

        let query = { device: deviceId };
        
        if (date) {
            const targetDate = new Date(date);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: targetDate, $lt: nextDay };
        }
        
        if (status) {
            query.status = status;
        }

        const schedules = await MedicationSchedule.find(query)
            .populate('user', 'name email phone')
            .populate('medication', 'name dosage instructions')
            .sort({ time: 1 });

        res.status(200).json({
            success: true,
            message: 'Device schedules retrieved successfully',
            data: schedules
        });

    } catch (error) {
        console.error('Error getting device schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get elder's device info
const getElderDevice = async (req, res) => {
    try {
        const { elderId } = req.params;

        const connections = await CaregiverConnection.findActiveByElder(elderId);

        if (connections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active device connections found for this elder'
            });
        }

        const deviceInfo = connections.map(connection => ({
            connectionId: connection.connectionId,
            caregiver: {
                id: connection.caregiver.userId,
                name: connection.caregiver.name,
                email: connection.caregiver.email,
                phone: connection.caregiver.phone
            },
            device: {
                id: connection.device.deviceId,
                name: connection.device.deviceName,
                type: connection.device.deviceType,
                status: connection.device.status,
                batteryLevel: connection.device.batteryLevel,
                lastSeen: connection.device.lastSeen,
                isConnected: connection.device.isConnected
            },
            relationship: connection.relationship,
            permissions: connection.permissions,
            connectedAt: connection.connectedAt,
            lastActivity: connection.lastActivity
        }));

        res.status(200).json({
            success: true,
            message: 'Elder device info retrieved successfully',
            data: deviceInfo
        });

    } catch (error) {
        console.error('Error getting elder device info:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Assign elder to device
const assignElderDevice = async (req, res) => {
    try {
        const { elderId, deviceId, caregiverId, relationship, permissions } = req.body;

        // Validate required fields
        if (!elderId || !deviceId || !caregiverId) {
            return res.status(400).json({
                success: false,
                message: 'Elder ID, Device ID, and Caregiver ID are required'
            });
        }

        // Check if assignment already exists
        const existingAssignment = await CaregiverConnection.findOne({
            elder: elderId,
            device: deviceId,
            caregiver: caregiverId
        });

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: 'Assignment already exists'
            });
        }

        // Create new assignment
        const assignment = new CaregiverConnection({
            elder: elderId,
            device: deviceId,
            caregiver: caregiverId,
            relationship: relationship || 'family',
            permissions: permissions || {
                viewMedications: true,
                manageMedications: false,
                viewAdherence: true,
                receiveAlerts: true,
                manageDevice: false
            }
        });

        await assignment.save();

        res.status(201).json({
            success: true,
            message: 'Elder assigned to device successfully',
            data: {
                assignmentId: assignment.connectionId,
                elderId,
                deviceId,
                caregiverId,
                status: assignment.status
            }
        });

    } catch (error) {
        console.error('Error assigning elder to device:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    connectCaregiverToDevice,
    getCaregiverDevices,
    disconnectDevice,
    getDeviceStats,
    getDeviceSchedules,
    getElderDevice,
    assignElderDevice
};



