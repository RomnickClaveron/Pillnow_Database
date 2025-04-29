const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['dispense', 'refill', 'error', 'maintenance', 'other'],
        required: true
    },
    details: {
        type: Object
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        default: 'success'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeviceLog', deviceLogSchema);
