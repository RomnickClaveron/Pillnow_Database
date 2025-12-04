const mongoose = require('mongoose');
const Counter = require('./counterModels');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true
    },
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
        type: String,
        required: true
    },
    // role: 1=admin, 2=elder, 3=guardian
    role: {
        type: Number,
        enum: [1, 2, 3],
        required: true
    },
    // Password reset fields
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpiry: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
userSchema.pre('save', async function(next) {
    if (!this.userId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.userId = counter.seq.toString(); // Ensure userId is a string
    }
    next();
});

module.exports = mongoose.model('User', userSchema);



