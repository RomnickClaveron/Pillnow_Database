const User = require('../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Role constants
const ROLE_ADMIN = 1;
const ROLE_ELDER = 2;
const ROLE_GUARDIAN = 3;

// Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '30d',
    });
};

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        
        // Check if user exists by email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Validate role (must be 1, 2, or 3)
        const validRoles = [ROLE_ADMIN, ROLE_ELDER, ROLE_GUARDIAN];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be 1 (admin), 2 (elder), or 3 (guardian)' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        res.status(201).json({
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user.userId)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -_id');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by userId (admin or self)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id }).select('-password -_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user (admin or self)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Role-based validation
        const requestingUser = req.user;
        
        // If not admin, prevent role changes
        if (requestingUser.role !== ROLE_ADMIN && req.body.role) {
            return res.status(403).json({ 
                message: 'Only admins can change user roles' 
            });
        }

        // If updating password, hash it
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId: req.params.id },
            req.body,
            { new: true }
        ).select('-password -_id');

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete user (admin or self)
exports.deleteUser = async (req, res) => {
    try {
        const userIdStr = req.params.id.toString();
        console.log('req.params.id:', req.params.id, 'Type:', typeof req.params.id);
        const user = await User.findOne({ userId: userIdStr });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves (optional safety measure)
        const requestingUser = req.user;
        if (requestingUser.role === ROLE_ADMIN && requestingUser.userId == userIdStr) {
            return res.status(400).json({ 
                message: 'Admin cannot delete their own account for security reasons' 
            });
        }

        await User.findOneAndDelete({ userId: userIdStr });
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId }).select('-password -_id');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};