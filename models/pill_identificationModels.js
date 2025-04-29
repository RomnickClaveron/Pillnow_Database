const mongoose = require('mongoose');

const pillIdentificationSchema = new mongoose.Schema({
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
   image_url: {
    type: String,
    required: true,
   },
   classification: {
    type: String,
    required: true,
   },
   confidence: {
    type: Number,
    required: true,
   },
}, {
    timestamps: true,
});


