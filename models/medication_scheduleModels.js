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
    time: {
            type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Taken', 'Missed'],
        default: 'Pending',

    },
    alert_sent: {
        type: Boolean,
        default: false,
    },  
}, {
    timestamps: true,
});

const MedSched = mongoose.model('MedSched', medSchedSchema);



