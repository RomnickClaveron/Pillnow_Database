const PillIdentification = require('../models/pill_identificationModels');

// Create a new pill identification
exports.createPillIdentification = async (req, res) => {
    try {
        const pillId = new PillIdentification({
            userId: req.body.userId,
            medicationId: req.body.medicationId,
            imageUrl: req.body.imageUrl,
            confidence: req.body.confidence,
            status: req.body.status
        });
        const savedPillId = await pillId.save();
        res.status(201).json(savedPillId);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all pill identifications
exports.getAllPillIdentifications = async (req, res) => {
    try {
        const pillIds = await PillIdentification.find()
            .populate('userId')
            .populate('medicationId');
        res.status(200).json(pillIds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pill identifications by user ID
exports.getPillIdentificationsByUserId = async (req, res) => {
    try {
        const pillIds = await PillIdentification.find({ userId: req.params.userId })
            .populate('userId')
            .populate('medicationId');
        res.status(200).json(pillIds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pill identifications by medication ID
exports.getPillIdentificationsByMedicationId = async (req, res) => {
    try {
        const pillIds = await PillIdentification.find({ medicationId: req.params.medicationId })
            .populate('userId')
            .populate('medicationId');
        res.status(200).json(pillIds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a pill identification
exports.updatePillIdentification = async (req, res) => {
    try {
        const updatedPillId = await PillIdentification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate('userId')
        .populate('medicationId');
        res.status(200).json(updatedPillId);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a pill identification
exports.deletePillIdentification = async (req, res) => {
    try {
        await PillIdentification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Pill identification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 