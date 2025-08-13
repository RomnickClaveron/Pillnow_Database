const mongoose = require('mongoose');
const Counter = require('./counterModels');

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Pending', 'Taken', 'Done', 'Missed'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        enum: ['automatic', 'manual', 'system'],
        default: 'manual'
    },
    notes: {
        type: String,
        trim: true
    }
}, { _id: false });

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
        enum: ['Pending', 'Taken', 'Done', 'Missed'],
        default: 'Pending'
    },
    alertSent: {
        type: Boolean,
        default: false
    },
    statusHistory: [statusHistorySchema],
    lastStatusUpdate: {
        type: Date,
        default: Date.now
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

// Method to update status and track history
medicationScheduleSchema.methods.updateStatus = function(newStatus, reason = 'manual', notes = '') {
    // Add current status to history before updating
    if (this.status) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            reason: 'system',
            notes: 'Status changed automatically'
        });
    }
    
    // Update current status
    this.status = newStatus;
    this.lastStatusUpdate = new Date();
    
    // Add new status to history
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        reason: reason,
        notes: notes
    });
    
    return this;
};

module.exports = mongoose.model('MedicationSchedule', medicationScheduleSchema); 