const MedicationSchedule = require('../models/medication_scheduleModels');

// Create a new medication schedule
exports.createMedicationSchedule = async (req, res) => {
    try {
        const schedule = new MedicationSchedule({
            userId: req.body.userId,
            medicationId: req.body.medicationId,
            scheduleTime: req.body.scheduleTime,
            frequency: req.body.frequency,
            status: req.body.status
        });
        const savedSchedule = await schedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all medication schedules
exports.getAllMedicationSchedules = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find()
            .populate('userId')
            .populate('medicationId');
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by user ID
exports.getMedicationSchedulesByUserId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ userId: req.params.userId })
            .populate('userId')
            .populate('medicationId');
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medication schedules by medication ID
exports.getMedicationSchedulesByMedicationId = async (req, res) => {
    try {
        const schedules = await MedicationSchedule.find({ medicationId: req.params.medicationId })
            .populate('userId')
            .populate('medicationId');
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a medication schedule
exports.updateMedicationSchedule = async (req, res) => {
    try {
        const updatedSchedule = await MedicationSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate('userId')
        .populate('medicationId');
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