const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    age:{
        type: Number,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
        minlength: 11,
    },
    role:{
        type: String,
        enum:['caregiver', 'elder'],
        default: 'user',
    },
}, {
    timestamps: true,

})

module.exports = mongoose.model('User', userSchema);



