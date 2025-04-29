const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },
    type: {
        type: String,
        enum: ['Push', 'SMS', 'Email'],
        required: true
    },
    status: {
        type: String,
        enum: ['Delivered', 'Failed'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema); 