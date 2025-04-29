const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    phone: {
        type: String
    },
    role: {
        type: String,
        enum: ['patient', 'caregiver'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);



