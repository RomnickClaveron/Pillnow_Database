const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('DeviceLog', deviceLogSchema); 