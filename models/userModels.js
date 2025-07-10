const mongoose = require('mongoose');
const Counter = require('./counterModels');

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
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
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'elder', 'guardian'],
        required: true
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
        this.userId = counter.seq;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);



