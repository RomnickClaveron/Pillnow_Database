const Medication = require('../models/medicationModels');

exports.addMedication = async (req, res) => {
    try {
        const {
            name,
            description,
            dosage,
            form,
            manufacturer
        } = req.body;

        const medication = new Medication({
            name,
            description,
            dosage,
            form,
            manufacturer
        });

        await medication.save();
        res.status(201).json({
            success: true,
            message: 'Medication created successfully',
            data: medication
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get all medications
exports.getAllMedications = async (req, res) => {
    try {
        const medications = await Medication.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};  

// Get a single medication by ID
exports.getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);
        if (!medication) {
            return res.status(404).json({ 
                success: false,
                message: 'Medication not found' 
            });
        }
        res.status(200).json({
            success: true,
            data: medication
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update a medication by ID
exports.updateMedicationById = async (req, res) => {
    try {
        const { name, description, dosage, form, manufacturer } = req.body;
        const medication = await Medication.findByIdAndUpdate(
            req.params.id, 
            { name, description, dosage, form, manufacturer }, 
            { new: true, runValidators: true }
        );
        
        if (!medication) {
            return res.status(404).json({ 
                success: false,
                message: 'Medication not found' 
            });
        }
        res.status(200).json({
            success: true,
            message: 'Medication updated successfully',
            data: medication
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};   

// Delete a medication by ID
exports.deleteMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findByIdAndDelete(req.params.id);
        if (!medication) {
            return res.status(404).json({ 
                success: false,
                message: 'Medication not found' 
            });       
        }
        res.status(200).json({ 
            success: true,
            message: 'Medication deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};



