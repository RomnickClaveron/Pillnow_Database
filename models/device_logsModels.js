const mongoose = require('mongoose');

const deviceLogsSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        enum: ['AlarmTriggered', 'AlarmCleared', 'MedicationTaken', 'MedicationMissed', 'MedicationReminderSent', 'MedicationReminderCleared'],
        default: 'AlarmTriggered',
        required: true,
    
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('DeviceLogs', deviceLogsSchema);
