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
                message: 'Missing required fields: user, medication, date, and time are required' 
            });
        }
        
        // Validate date format
        const dateValue = new Date(req.body.date);
        if (isNaN(dateValue.getTime())) {
            return res.status(400).json({ 
                message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD or ISO string)' 
            });
        }
        
        const schedule = new MedicationSchedule({
            user: req.body.user,
            medication: req.body.medication,
            date: dateValue,
            time: req.body.time,
            status: req.body.status || 'Pending',
            alertSent: req.body.alertSent || false
        });
        const savedSchedule = await schedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        console.log('Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// Get all medication schedules
exports.getAllMedicationSchedules = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find()
            .populate('user')
            .populate('medication');
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by user ID
exports.getMedicationSchedulesByUserId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ user: req.params.userId })
            .populate('user')
            .populate('medication');
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by medication ID
exports.getMedicationSchedulesByMedicationId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ medication: req.params.medicationId })
            .populate('user')
            .populate('medication');
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateMedicationSchedule = async (req, res) => {
    try {
        const updatedSchedule = await MedicationSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate('user')
        .populate('medication');
        res.status(200).json(updatedSchedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a medication schedule
exports.deleteMedicationSchedule = async (req, res) => {
    try {
        await MedicationSchedule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Medication schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
