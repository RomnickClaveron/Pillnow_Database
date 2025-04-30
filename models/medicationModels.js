const mongoose = require('mongoose');
const Counter = require('./counterModels');

const medicationSchema = new mongoose.Schema({
    medId: {
        type: Number,
        unique: true
    },
    user: {
        type: Number,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String
    },
    frequency: {
        type: String
    },
    pillImage: {
        type: String
    },
    schedule: [{
        time: {
            type: String,
            required: true
        },
        days: {
            type: [String],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Taken', 'Missed'],
            default: 'Pending'
        }
    }]
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
medicationSchema.pre('save', async function(next) {
    if (!this.medId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'medId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.medId = counter.seq;
    }
    next();
});

module.exports = mongoose.model('Medication', medicationSchema);