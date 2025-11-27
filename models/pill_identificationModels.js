const mongoose = require('mongoose');
const Counter = require('./counterModels');

const pillIdentificationSchema = new mongoose.Schema({
    imageId: {
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
        ref: 'Medication'
    },
    scheduleId: {
        type: Number,
        ref: 'MedicationSchedule'
    },
    imageUrl: {
        type: String,
        required: true
    },
    classification: {
        type: String,
        required: false  // Will be set after identification
    },
    confidence: {
        type: Number,
        required: false,  // Will be set after identification
        min: 0,
        max: 1
    },
    status: {
        type: String,
        enum: ['pending', 'identified', 'verified', 'failed', 'mismatch'],
        default: 'pending'
    },
    // Verification data
    verification: {
        isCorrectPill: {
            type: Boolean,
            default: false
        },
        expectedMedication: {
            type: Number,
            ref: 'Medication'
        },
        expectedMedicationName: {
            type: String
        },
        identifiedMedicationName: {
            type: String
        },
        matchConfidence: {
            type: Number,
            min: 0,
            max: 1
        },
        verifiedAt: {
            type: Date
        }
    },
    // Device information
    deviceId: {
        type: String
    },
    containerId: {
        type: String
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
pillIdentificationSchema.pre('save', async function(next) {
    if (!this.imageId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'imageId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.imageId = counter.seq;
    }
    next();
});

module.exports = mongoose.model('PillIdentification', pillIdentificationSchema); 