const User = require('../models/usersModel');

const jwt = require('jsonwebtoken');

const User = require('../models/usersModel');

const createUser = async (req, res) => {
    try{
        const { name, email, age, phoneNumber } = req.body;
        const user = await User.create({ name, email, age, phoneNumber });
        res.status(201).json({ user });

    }catch(error){
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createUser,
    
};