const MedicationSchedule = require('../models/medication_scheduleModels');
const statusUpdateService = require('../services/statusUpdateService');
const notificationService = require('../services/notificationService');

// Create a new medication schedule
exports.createMedicationSchedule = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);
        console.log('Content-Type:', req.headers['content-type']);
        
        // Validate required fields
        if (!req.body.user || !req.body.medication || !req.body.date || !req.body.time) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: user, medication, date, and time are required' 
            });
        }
        
        // Validate container field
        if (!req.body.container) {
            console.log('No container specified, using default');
        }
        
        // Validate date format
        const dateValue = new Date(req.body.date);
        if (isNaN(dateValue.getTime())) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD or ISO string)' 
            });
        }
        
        const schedule = new MedicationSchedule({
            user: req.body.user,
            medication: req.body.medication,
            container: req.body.container || 'default',
            date: dateValue,
            time: req.body.time,
            status: req.body.status || 'Pending',
            alertSent: req.body.alertSent || false
        });
        
        const savedSchedule = await schedule.save();
        
        res.status(201).json({
            success: true,
            message: 'Medication schedule created successfully',
            data: savedSchedule
        });
        
    } catch (error) {
        console.log('Error:', error.message);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get all medication schedules
exports.getAllMedicationSchedules = async (req, res) => {
    try {
        console.log('Fetching all medication schedules...');
        console.log('Request query:', req.query);
        console.log('Request params:', req.params);
        
        // Simple query without any complex operations
        const schedules = await MedicationSchedule.find().lean();
        
        console.log(`Found ${schedules.length} schedules`);
        console.log('Schedules data:', JSON.stringify(schedules, null, 2));
        
        // Transform data for frontend compatibility
        const transformedSchedules = schedules.map(schedule => ({
            ...schedule,
            // Ensure consistent data types
            user: Number(schedule.user),
            medication: Number(schedule.medication),
            container: String(schedule.container || 'default'),
            // Format date for frontend
            date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : null,
            time: String(schedule.time || ''),
            status: String(schedule.status || 'Pending'),
            alertSent: Boolean(schedule.alertSent)
        }));
        
        // Check if client wants old format (for backward compatibility)
        const useOldFormat = req.query.format === 'old' || req.query.legacy === 'true';
        
        if (useOldFormat) {
            // Return old format (direct array)
            console.log('Returning old format for backward compatibility');
            res.status(200).json(transformedSchedules);
        } else {
            // Return new format (structured response)
            console.log('Returning new structured format');
            res.status(200).json({
                success: true,
                count: transformedSchedules.length,
                data: transformedSchedules,
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('Error in getAllMedicationSchedules:', error);
        res.status(500).json({ 
            success: false,
            message: error.message,
            error: error.stack 
        });
    }
};

// Get medication schedules by user ID
exports.getMedicationSchedulesByUserId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ user: req.params.userId });
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error in getMedicationSchedulesByUserId:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by medication ID
exports.getMedicationSchedulesByMedicationId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ medication: req.params.medicationId });
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error in getMedicationSchedulesByMedicationId:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by container ID
exports.getMedicationSchedulesByContainerId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ container: req.params.containerId }).lean();
        
        // Transform data for frontend compatibility
        const transformedSchedules = schedules.map(schedule => ({
            ...schedule,
            user: Number(schedule.user),
            medication: Number(schedule.medication),
            container: String(schedule.container),
            date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : null,
            time: String(schedule.time || ''),
            status: String(schedule.status || 'Pending'),
            alertSent: Boolean(schedule.alertSent)
        }));
        
        res.status(200).json({
            success: true,
            count: transformedSchedules.length,
            containerId: req.params.containerId,
            data: transformedSchedules,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getMedicationSchedulesByContainerId:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by user and container
exports.getMedicationSchedulesByUserAndContainer = async (req, res) => {
    try {
        const { userId, containerId } = req.params;
        const schedules = await MedicationSchedule.find({ 
            user: userId, 
            container: containerId 
        });
        res.status(200).json({
            success: true,
            count: schedules.length,
            userId: userId,
            containerId: containerId,
            data: schedules
        });
    } catch (error) {
        console.error('Error in getMedicationSchedulesByUserAndContainer:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.updateMedicationSchedule = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            // Ensure container field is included in updates
            container: req.body.container || 'default'
        };
        
        const updatedSchedule = await MedicationSchedule.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.status(200).json(updatedSchedule);
    } catch (error) {
        console.error('Error in updateMedicationSchedule:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a medication schedule
exports.deleteMedicationSchedule = async (req, res) => {
    try {
        await MedicationSchedule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Medication schedule deleted successfully' });
    } catch (error) {
        console.error('Error in deleteMedicationSchedule:', error);
        res.status(500).json({ message: error.message });
    }
};

// Test endpoint to verify database connection
exports.testConnection = async (req, res) => {
    try {
        console.log('Testing medication schedule connection...');
        
        // Test basic database operations
        const count = await MedicationSchedule.countDocuments();
        
        res.status(200).json({
            success: true,
            message: 'Database connection successful',
            collectionName: 'medication_schedules',
            documentCount: count,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

// Debug endpoint to check model and schema
exports.debugModel = async (req, res) => {
    try {
        console.log('Debugging medication schedule model...');
        
        // Get model info
        const modelName = MedicationSchedule.modelName;
        const collectionName = MedicationSchedule.collection.name;
        
        // Test a simple find operation
        const sampleData = await MedicationSchedule.find().limit(1).lean();
        
        res.status(200).json({
            success: true,
            modelName: modelName,
            collectionName: collectionName,
            sampleData: sampleData,
            schemaFields: Object.keys(MedicationSchedule.schema.paths),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Model debug failed:', error);
        res.status(500).json({
            success: false,
            message: 'Model debug failed',
            error: error.message
        });
    }
};

// Get container status summary
exports.getContainerStatusSummary = async (req, res) => {
    try {
        const { containerId } = req.params;
        
        // Get all schedules for this container
        const schedules = await MedicationSchedule.find({ container: containerId }).lean();
        
        // Group by status
        const statusSummary = {
            pending: schedules.filter(s => s.status === 'Pending').length,
            taken: schedules.filter(s => s.status === 'Taken').length,
            missed: schedules.filter(s => s.status === 'Missed').length,
            total: schedules.length
        };
        
        // Get today's schedules
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaySchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.date);
            return scheduleDate >= today && scheduleDate < tomorrow;
        });
        
        // Transform data for frontend
        const transformedSchedules = schedules.map(schedule => ({
            ...schedule,
            user: Number(schedule.user),
            medication: Number(schedule.medication),
            container: String(schedule.container),
            date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : null,
            time: String(schedule.time || ''),
            status: String(schedule.status || 'Pending'),
            alertSent: Boolean(schedule.alertSent)
        }));
        
        res.status(200).json({
            success: true,
            containerId: containerId,
            statusSummary: statusSummary,
            todaySchedules: todaySchedules.length,
            data: transformedSchedules,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in getContainerStatusSummary:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// Manual status update endpoint
exports.updateScheduleStatus = async (req, res) => {
    try {
        const { scheduleId, status, notes } = req.body;
        
        if (!scheduleId || !status) {
            return res.status(400).json({
                success: false,
                message: 'scheduleId and status are required'
            });
        }

        const result = await statusUpdateService.updateScheduleStatus(
            scheduleId, 
            status, 
            'manual', 
            notes || ''
        );

        res.status(200).json({
            success: true,
            message: 'Schedule status updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error in updateScheduleStatus:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get status history for a schedule
exports.getStatusHistory = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        
        if (!scheduleId) {
            return res.status(400).json({
                success: false,
                message: 'scheduleId is required'
            });
        }

        const result = await statusUpdateService.getStatusHistory(scheduleId);

        res.status(200).json({
            success: true,
            message: 'Status history retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error in getStatusHistory:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get schedules that need notifications
exports.getSchedulesForNotification = async (req, res) => {
    try {
        const schedules = await statusUpdateService.getSchedulesForNotification();

        res.status(200).json({
            success: true,
            message: 'Schedules for notification retrieved successfully',
            count: schedules.length,
            data: schedules
        });

    } catch (error) {
        console.error('Error in getSchedulesForNotification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark alert as sent
exports.markAlertSent = async (req, res) => {
    try {
        const { scheduleId } = req.body;
        
        if (!scheduleId) {
            return res.status(400).json({
                success: false,
                message: 'scheduleId is required'
            });
        }

        await statusUpdateService.markAlertSent(scheduleId);

        res.status(200).json({
            success: true,
            message: 'Alert marked as sent successfully'
        });

    } catch (error) {
        console.error('Error in markAlertSent:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Start automatic status updates
exports.startAutomaticUpdates = async (req, res) => {
    try {
        statusUpdateService.startAutomaticUpdates();

        res.status(200).json({
            success: true,
            message: 'Automatic status updates started successfully'
        });

    } catch (error) {
        console.error('Error starting automatic updates:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Stop automatic status updates
exports.stopAutomaticUpdates = async (req, res) => {
    try {
        statusUpdateService.stopAutomaticUpdates();

        res.status(200).json({
            success: true,
            message: 'Automatic status updates stopped successfully'
        });

    } catch (error) {
        console.error('Error stopping automatic updates:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Manual trigger for status updates (for testing)
exports.triggerStatusUpdate = async (req, res) => {
    try {
        await statusUpdateService.updatePendingSchedules();

        res.status(200).json({
            success: true,
            message: 'Status update triggered successfully'
        });

    } catch (error) {
        console.error('Error triggering status update:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// Start notification service
exports.startNotificationService = async (req, res) => {
    try {
        notificationService.startNotificationService();

        res.status(200).json({
            success: true,
            message: 'Notification service started successfully'
        });

    } catch (error) {
        console.error('Error starting notification service:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Stop notification service
exports.stopNotificationService = async (req, res) => {
    try {
        notificationService.stopNotificationService();

        res.status(200).json({
            success: true,
            message: 'Notification service stopped successfully'
        });

    } catch (error) {
        console.error('Error stopping notification service:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Send test notification
exports.sendTestNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const result = await notificationService.sendTestNotification(userId, message);

        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user notification settings
exports.getUserNotificationSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const settings = await notificationService.getUserNotificationSettings(userId);

        res.status(200).json({
            success: true,
            message: 'Notification settings retrieved successfully',
            data: settings
        });

    } catch (error) {
        console.error('Error getting notification settings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user notification settings
exports.updateUserNotificationSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        const settings = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const result = await notificationService.updateUserNotificationSettings(userId, settings);

        res.status(200).json({
            success: true,
            message: 'Notification settings updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// Server-Sent Events stream for real-time status updates
exports.streamStatusUpdates = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Optional: filter by user or container via query params
    const { userId, containerId } = req.query;

    const onUpdate = (event) => {
        if (userId && String(event.userId) !== String(userId)) return;
        if (containerId && String(event.containerId) !== String(containerId)) return;
        res.write(`event: statusUpdate\n`);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    statusUpdateService.events.on('statusUpdate', onUpdate);

    // Keep connection alive with periodic comments
    const keepAlive = setInterval(() => {
        res.write(`: keep-alive\n\n`);
    }, 25000);

    req.on('close', () => {
        clearInterval(keepAlive);
        statusUpdateService.events.off('statusUpdate', onUpdate);
        res.end();
    });
}; 
