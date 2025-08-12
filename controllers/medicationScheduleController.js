const MedicationSchedule = require('../models/medication_scheduleModels');

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
        
        // Simple query without any complex operations
        const schedules = await MedicationSchedule.find().lean();
        
        console.log(`Found ${schedules.length} schedules`);
        
        // Return the schedules directly
        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
        
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
        const schedules = await MedicationSchedule.find({ container: req.params.containerId });
        res.status(200).json({
            success: true,
            count: schedules.length,
            containerId: req.params.containerId,
            data: schedules
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
