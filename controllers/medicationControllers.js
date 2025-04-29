const Medication = require('../models/medicationModels');

// Add a new medication
const addMedication = async (req, res) => {
    try {
        const { name, description, dosage, frequency, startDate, endDate } = req.body;

        const medication = new Medication({ name, description, dosage, frequency, startDate, endDate });
        await medication.save();
        res.status(201).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all medications
const getAllMedications = async (req, res) => {
    try {
        const medications = await Medication.find();
        res.status(200).json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  

// Get a single medication by ID
const getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.status(200).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a medication by ID
const updateMedicationById = async (req, res) => {
    try {
        const { name, description, dosage, frequency, startDate, endDate } = req.body;
        const medication = await Medication.findByIdAndUpdate(req.params.id, { name, description, dosage, frequency, startDate, endDate }, { new: true });
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }
        res.status(200).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};          



