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
    createdBy: {
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
    },
    // Device integration fields
    device: {
        type: String,
        ref: 'Device',
        required: false
    },
    deviceContainer: {
        type: String,
        trim: true
    },
    deviceStatus: {
        type: String,
        enum: ['synced', 'pending_sync', 'sync_failed'],
        default: 'pending_sync'
    },
    lastDeviceSync: {
        type: Date
    },
    // Enhanced tracking for caregiver monitoring
    adherenceData: {
        takenOnTime: {
            type: Boolean,
            default: false
        },
        takenLate: {
            type: Boolean,
            default: false
        },
        lateByMinutes: {
            type: Number,
            default: 0
        },
        missedReason: {
            type: String,
            enum: ['forgot', 'device_offline', 'medication_unavailable', 'user_refused', 'other'],
            default: null
        },
        caregiverNotified: {
            type: Boolean,
            default: false
        },
        caregiverNotifiedAt: {
            type: Date
        }
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

// Method to update adherence data
medicationScheduleSchema.methods.updateAdherenceData = function(adherenceInfo) {
    this.adherenceData = { ...this.adherenceData, ...adherenceInfo };
    
    // Calculate if taken on time or late
    const scheduledTime = new Date(`${this.date.toDateString()} ${this.time}`);
    const now = new Date();
    const timeDiff = Math.abs(now - scheduledTime) / (1000 * 60); // difference in minutes
    
    if (timeDiff <= 15) { // within 15 minutes is considered on time
        this.adherenceData.takenOnTime = true;
        this.adherenceData.takenLate = false;
        this.adherenceData.lateByMinutes = 0;
    } else {
        this.adherenceData.takenOnTime = false;
        this.adherenceData.takenLate = true;
        this.adherenceData.lateByMinutes = timeDiff;
    }
    
    return this;
};

// Method to mark caregiver as notified
medicationScheduleSchema.methods.markCaregiverNotified = function() {
    this.adherenceData.caregiverNotified = true;
    this.adherenceData.caregiverNotifiedAt = new Date();
    return this;
};

// Method to sync with device
medicationScheduleSchema.methods.syncWithDevice = function(deviceId, containerId) {
    this.device = deviceId;
    this.deviceContainer = containerId;
    this.deviceStatus = 'synced';
    this.lastDeviceSync = new Date();
    return this;
};

// Static method to find schedules by device
medicationScheduleSchema.statics.findByDevice = function(deviceId) {
    return this.find({ device: deviceId }).populate('user', 'name email').populate('medication', 'name dosage');
};

// Static method to find schedules needing caregiver attention
medicationScheduleSchema.statics.findNeedingCaregiverAttention = function() {
    return this.find({
        $or: [
            { status: 'Missed' },
            { 'adherenceData.takenLate': true },
            { 'adherenceData.caregiverNotified': false, status: { $in: ['Missed', 'Pending'] } }
        ]
    }).populate('user', 'name email phone').populate('device', 'deviceName status');
};

module.exports = mongoose.model('MedicationSchedule', medicationScheduleSchema); 