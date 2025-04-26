const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true,
    },
    alertTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    },
}, {
    timestamps: true,
});

exports.Alert = mongoose.model('Alert', alertSchema);