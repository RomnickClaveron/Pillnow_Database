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
    imageUrl: {
        type: String,
        required: true
    },
    classification: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
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