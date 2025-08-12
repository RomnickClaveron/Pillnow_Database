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
    container: {
        type: String,
        required: true,
        default: 'default',
        trim: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Container ID cannot be empty'
        }
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Basic time format validation (HH:MM)
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Time must be in HH:MM format (e.g., 08:00)'
        }
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