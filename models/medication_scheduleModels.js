const mongoose = require('mongoose');
const Counter = require('./counterModels');

const medicationScheduleSchema = new mongoose.Schema({
    scheduleId: {
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
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Taken', 'Missed'],
        default: 'Pending'
    },
    alertSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
medicationScheduleSchema.pre('save', async function(next) {
    if (!this.scheduleId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'scheduleId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.scheduleId = counter.seq;
    }
    next();
});

module.exports = mongoose.model('MedicationSchedule', medicationScheduleSchema); 