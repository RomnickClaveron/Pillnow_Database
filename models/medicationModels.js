const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    dosageForm: {
        type: String,
        enum: ['tablet', 'capsule', 'liquid', 'injection', 'other'],
        required: true
    },
    strength: {
        amount: Number,
        unit: String
    },
    manufacturer: String,
    prescriptionRequired: {
        type: Boolean,
        default: true
    },
    sideEffects: [String],
    interactions: [String],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medication', medicationSchema);