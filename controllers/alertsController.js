const Alert = require('../models/alertsModels');

// Create a new alert
exports.createAlert = async (req, res) => {
    try {
        const alert = new Alert({
            userId: req.body.userId,
            medId: req.body.medId,
            type: req.body.type,
            alertTime: req.body.alertTime,
            status: req.body.status
        });
        const savedAlert = await alert.save();
        res.status(201).json(savedAlert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all alerts
exports.getAllAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('userId')
            .populate('medId');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get alerts by user ID
exports.getAlertsByUserId = async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.params.userId })
            .populate('userId')
            .populate('medId');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get alerts by medication ID
exports.getAlertsByMedicationId = async (req, res) => {
    try {
        const alerts = await Alert.find({ medId: req.params.medId })
            .populate('userId')
            .populate('medId');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get alerts by type
exports.getAlertsByType = async (req, res) => {
    try {
        const alerts = await Alert.find({ type: req.params.type })
            .populate('userId')
            .populate('medId');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get alerts by status
exports.getAlertsByStatus = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: req.params.status })
            .populate('userId')
            .populate('medId');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update alert status
exports.updateAlertStatus = async (req, res) => {
    try {
        const updatedAlert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        )
        .populate('userId')
        .populate('medId');
        res.status(200).json(updatedAlert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an alert
exports.updateAlert = async (req, res) => {
    try {
        const updatedAlert = await Alert.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate('userId')
        .populate('medId');
        res.status(200).json(updatedAlert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an alert
exports.deleteAlert = async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Alert deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 