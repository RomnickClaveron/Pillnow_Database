const MedicationSchedule = require('../models/medication_scheduleModels');
const CaregiverConnection = require('../models/caregiverConnectionModels');
const Device = require('../models/deviceModels');
const User = require('../models/userModels');
const Alert = require('../models/alertsModels');

// Get device adherence statistics
const getDeviceAdherenceStats = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate } = req.query;

        // Validate device exists
        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        // Build date filter
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            dateFilter.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            dateFilter.date = { $lte: new Date(endDate) };
        }

        // Get schedules for the device
        const schedules = await MedicationSchedule.find({
            device: deviceId,
            ...dateFilter
        }).populate('user', 'name email phone').populate('medication', 'name dosage');

        // Calculate statistics
        const totalSchedules = schedules.length;
        const takenSchedules = schedules.filter(s => s.status === 'Taken').length;
        const missedSchedules = schedules.filter(s => s.status === 'Missed').length;
        const pendingSchedules = schedules.filter(s => s.status === 'Pending').length;
        const doneSchedules = schedules.filter(s => s.status === 'Done').length;

        const adherenceRate = totalSchedules > 0 ? (takenSchedules / totalSchedules) * 100 : 0;
        const missedRate = totalSchedules > 0 ? (missedSchedules / totalSchedules) * 100 : 0;

        // Calculate late doses
        const lateDoses = schedules.filter(s => s.adherenceData.takenLate).length;
        const lateRate = totalSchedules > 0 ? (lateDoses / totalSchedules) * 100 : 0;

        // Get daily breakdown
        const dailyStats = {};
        schedules.forEach(schedule => {
            const dateKey = schedule.date.toISOString().split('T')[0];
            if (!dailyStats[dateKey]) {
                dailyStats[dateKey] = {
                    total: 0,
                    taken: 0,
                    missed: 0,
                    pending: 0,
                    late: 0
                };
            }
            
            dailyStats[dateKey].total++;
            if (schedule.status === 'Taken') dailyStats[dateKey].taken++;
            if (schedule.status === 'Missed') dailyStats[dateKey].missed++;
            if (schedule.status === 'Pending') dailyStats[dateKey].pending++;
            if (schedule.adherenceData.takenLate) dailyStats[dateKey].late++;
        });

        // Convert to array and calculate daily adherence rates
        const dailyBreakdown = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            total: stats.total,
            taken: stats.taken,
            missed: stats.missed,
            pending: stats.pending,
            late: stats.late,
            adherenceRate: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100 * 100) / 100 : 0
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json({
            success: true,
            message: 'Device adherence statistics retrieved successfully',
            data: {
                device: {
                    id: device.deviceId,
                    name: device.deviceName,
                    type: device.deviceType,
                    status: device.status,
                    batteryLevel: device.batteryLevel,
                    lastSeen: device.lastSeen
                },
                statistics: {
                    totalSchedules,
                    takenSchedules,
                    missedSchedules,
                    pendingSchedules,
                    doneSchedules,
                    lateDoses,
                    adherenceRate: Math.round(adherenceRate * 100) / 100,
                    missedRate: Math.round(missedRate * 100) / 100,
                    lateRate: Math.round(lateRate * 100) / 100
                },
                dailyBreakdown
            }
        });

    } catch (error) {
        console.error('Error getting device adherence stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get device-specific schedules with enhanced monitoring
const getDeviceSchedulesEnhanced = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { date, status, includeAdherence } = req.query;

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
            .populate('user', 'name email phone age')
            .populate('medication', 'name dosage instructions sideEffects')
            .populate('device', 'deviceName deviceType status batteryLevel')
            .sort({ time: 1 });

        // Enhance with adherence data if requested
        let enhancedSchedules = schedules;
        if (includeAdherence === 'true') {
            enhancedSchedules = schedules.map(schedule => {
                const scheduleObj = schedule.toObject();
                
                // Add adherence insights
                scheduleObj.adherenceInsights = {
                    isOnTime: schedule.adherenceData.takenOnTime,
                    isLate: schedule.adherenceData.takenLate,
                    lateByMinutes: schedule.adherenceData.lateByMinutes,
                    missedReason: schedule.adherenceData.missedReason,
                    caregiverNotified: schedule.adherenceData.caregiverNotified,
                    caregiverNotifiedAt: schedule.adherenceData.caregiverNotifiedAt,
                    needsAttention: schedule.status === 'Missed' || 
                                  schedule.adherenceData.takenLate || 
                                  (schedule.status === 'Pending' && new Date() > new Date(`${schedule.date.toDateString()} ${schedule.time}`))
                };

                return scheduleObj;
            });
        }

        res.status(200).json({
            success: true,
            message: 'Enhanced device schedules retrieved successfully',
            data: {
                deviceId,
                totalSchedules: enhancedSchedules.length,
                schedules: enhancedSchedules
            }
        });

    } catch (error) {
        console.error('Error getting enhanced device schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get elder's device information with monitoring data
const getElderDeviceMonitoring = async (req, res) => {
    try {
        const { elderId } = req.params;

        // Get elder info
        const elder = await User.findById(elderId);
        if (!elder) {
            return res.status(404).json({
                success: false,
                message: 'Elder not found'
            });
        }

        // Get active connections
        const connections = await CaregiverConnection.findActiveByElder(elderId);

        if (connections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active device connections found for this elder'
            });
        }

        // Get monitoring data for each device
        const monitoringData = await Promise.all(connections.map(async (connection) => {
            const device = connection.device;
            
            // Get recent schedules (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentSchedules = await MedicationSchedule.find({
                device: device._id,
                date: { $gte: thirtyDaysAgo }
            });

            // Calculate adherence metrics
            const totalRecent = recentSchedules.length;
            const takenRecent = recentSchedules.filter(s => s.status === 'Taken').length;
            const missedRecent = recentSchedules.filter(s => s.status === 'Missed').length;
            const lateRecent = recentSchedules.filter(s => s.adherenceData.takenLate).length;

            const adherenceRate = totalRecent > 0 ? (takenRecent / totalRecent) * 100 : 0;
            const missedRate = totalRecent > 0 ? (missedRecent / totalRecent) * 100 : 0;
            const lateRate = totalRecent > 0 ? (lateRecent / totalRecent) * 100 : 0;

            // Get today's schedules
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todaySchedules = await MedicationSchedule.find({
                device: device._id,
                date: { $gte: today, $lt: tomorrow }
            }).populate('medication', 'name dosage');

            return {
                connectionId: connection.connectionId,
                caregiver: {
                    id: connection.caregiver.userId,
                    name: connection.caregiver.name,
                    email: connection.caregiver.email,
                    phone: connection.caregiver.phone
                },
                device: {
                    id: device.deviceId,
                    name: device.deviceName,
                    type: device.deviceType,
                    status: device.status,
                    batteryLevel: device.batteryLevel,
                    lastSeen: device.lastSeen,
                    isConnected: device.isConnected
                },
                monitoring: {
                    totalRecentSchedules: totalRecent,
                    takenRecent: takenRecent,
                    missedRecent: missedRecent,
                    lateRecent: lateRecent,
                    adherenceRate: Math.round(adherenceRate * 100) / 100,
                    missedRate: Math.round(missedRate * 100) / 100,
                    lateRate: Math.round(lateRate * 100) / 100,
                    todaySchedules: todaySchedules.length,
                    todayTaken: todaySchedules.filter(s => s.status === 'Taken').length,
                    todayMissed: todaySchedules.filter(s => s.status === 'Missed').length,
                    todayPending: todaySchedules.filter(s => s.status === 'Pending').length
                },
                relationship: connection.relationship,
                permissions: connection.permissions,
                connectedAt: connection.connectedAt,
                lastActivity: connection.lastActivity
            };
        }));

        res.status(200).json({
            success: true,
            message: 'Elder device monitoring data retrieved successfully',
            data: {
                elder: {
                    id: elder.userId,
                    name: elder.name,
                    email: elder.email,
                    phone: elder.phone,
                    age: elder.age
                },
                devices: monitoringData
            }
        });

    } catch (error) {
        console.error('Error getting elder device monitoring:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get alerts and notifications for monitoring
const getMonitoringAlerts = async (req, res) => {
    try {
        const { deviceId, elderId, caregiverId } = req.query;

        let query = {};
        
        if (deviceId) {
            query.device = deviceId;
        }
        if (elderId) {
            query.elder = elderId;
        }
        if (caregiverId) {
            query.caregiver = caregiverId;
        }

        // Get recent alerts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query.createdAt = { $gte: sevenDaysAgo };

        const alerts = await Alert.find(query)
            .populate('user', 'name email phone')
            .populate('device', 'deviceName deviceType')
            .sort({ createdAt: -1 });

        // Get schedules needing attention
        const schedulesNeedingAttention = await MedicationSchedule.findNeedingCaregiverAttention();

        res.status(200).json({
            success: true,
            message: 'Monitoring alerts retrieved successfully',
            data: {
                alerts: alerts.map(alert => ({
                    id: alert._id,
                    type: alert.type,
                    message: alert.message,
                    severity: alert.severity,
                    user: alert.user ? {
                        id: alert.user.userId,
                        name: alert.user.name,
                        email: alert.user.email
                    } : null,
                    device: alert.device ? {
                        id: alert.device.deviceId,
                        name: alert.device.deviceName,
                        type: alert.device.deviceType
                    } : null,
                    createdAt: alert.createdAt,
                    isRead: alert.isRead
                })),
                schedulesNeedingAttention: schedulesNeedingAttention.map(schedule => ({
                    id: schedule._id,
                    scheduleId: schedule.scheduleId,
                    user: {
                        id: schedule.user.userId,
                        name: schedule.user.name,
                        email: schedule.user.email,
                        phone: schedule.user.phone
                    },
                    medication: schedule.medication,
                    date: schedule.date,
                    time: schedule.time,
                    status: schedule.status,
                    adherenceData: schedule.adherenceData,
                    device: schedule.device ? {
                        id: schedule.device.deviceId,
                        name: schedule.device.deviceName,
                        status: schedule.device.status
                    } : null
                }))
            }
        });

    } catch (error) {
        console.error('Error getting monitoring alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getDeviceAdherenceStats,
    getDeviceSchedulesEnhanced,
    getElderDeviceMonitoring,
    getMonitoringAlerts
};



