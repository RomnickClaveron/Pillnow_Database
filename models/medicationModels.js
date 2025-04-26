const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    Dosage: {
        type: String,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['once', 'twice', 'thrice'],
        required: true,
    },
    pill_image: {
        type: String,
        required: true,
    },

}, {
    timestamps: true,
});

exports.Medication = mongoose.model('Medication', medicationSchema);