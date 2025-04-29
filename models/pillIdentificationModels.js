const mongoose = require('mongoose');

const pillIdentificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('PillIdentification', pillIdentificationSchema); 