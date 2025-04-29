const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    medId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true,
    },
    type: {
        type: String,
        enum: ['Push', 'SMS', 'Email'],
        required: true,
        default: 'Push',
    },
    alertTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Delivered', 'Not Delivered'],
        default: 'Not Delivered',
    },
}, {
    timestamps: true,
});

exports.Alert = mongoose.model('Alert', alertSchema);