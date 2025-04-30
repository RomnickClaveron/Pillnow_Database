const mongoose = require('mongoose');
const Counter = require('./counterModels');

const deviceLogSchema = new mongoose.Schema({
    logId: {
        type: Number,
        unique: true
    },
    deviceId: {
        type: String,
        required: true
    },
    user: {
        type: Number,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['Alarm Triggered', 'Button Pressed', 'Pill Taken'],
        required: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
deviceLogSchema.pre('save', async function(next) {
    if (!this.logId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'logId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.logId = counter.seq;
    }
    next();
});

module.exports = mongoose.model('DeviceLog', deviceLogSchema); 