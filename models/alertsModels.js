const mongoose = require('mongoose');
const Counter = require('./counterModels');

const alertSchema = new mongoose.Schema({
    alertId: {
        type: Number,
        unique: true
    },
    user: {
        type: Number,
        ref: 'User',
        required: true
    },
    medication: {
        type: Number,
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

// Pre-save middleware to generate sequential ID
alertSchema.pre('save', async function(next) {
    if (!this.alertId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'alertId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.alertId = counter.seq;
    }
    next();
});

module.exports = mongoose.model('Alert', alertSchema); 