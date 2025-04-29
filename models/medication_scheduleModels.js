const mongoose = require('mongoose');

const medSchedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    medId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true,
    },
    scheduledTime: {
        type: Date,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly'],
        required: true,
    },
    daysOfWeek: [{
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    timesPerDay: [{
        time: String,
        taken: {
            type: Boolean,
            default: false
        }
    }],
    startDate: {
        type: Date,
        required: true,
    },
    endDate: Date,
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
    },
    dosage: {
        amount: Number,
        unit: String
    },
    notes: String,
    alert_sent: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedSched', medSchedSchema);



