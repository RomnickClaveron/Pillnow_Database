const mongoose = require('mongoose');
const Counter = require('./counterModels');

const medicationSchema = new mongoose.Schema({
    medId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dosage: {
        type: String,
        trim: true
    },
    form: {
        type: String,
        trim: true
    },
    manufacturer: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential numeric medId
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