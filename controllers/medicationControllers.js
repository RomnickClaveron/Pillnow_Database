const Medication = require('../models/medicationModels');

exports.addMedication = async (req, res) => {
    try {
        const {
            user,
            name,
            dosage,
            frequency,
            pillImage,
            schedule
        } = req.body;

        const medication = new Medication({
            user,
            name,
            dosage,
            frequency,
            pillImage,
            schedule
        });

        await medication.save();
        res.status(201).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all medications
exports.getAllMedications = async (req, res) => {
    try {
        const medications = await Medication.find().populate('user');
        res.status(200).json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  

// Get a single medication by ID
exports.getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id).populate('user');
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.status(200).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a medication by ID
exports.updateMedicationById = async (req, res) => {
    try {
        const { user, name, dosage, frequency, pillImage, schedule } = req.body;
        const medication = await Medication.findByIdAndUpdate(
            req.params.id, 
            { user, name, dosage, frequency, pillImage, schedule }, 
            { new: true }
        ).populate('user');
        
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.status(200).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};   

// Delete a medication by ID
exports.deleteMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findByIdAndDelete(req.params.id);
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });       
        }
        res.status(200).json({ message: 'Medication deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



