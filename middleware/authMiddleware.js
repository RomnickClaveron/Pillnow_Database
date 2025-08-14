const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

// Role constants
const ROLE_ADMIN = 1;
const ROLE_ELDER = 2;
const ROLE_GUARDIAN = 3;

// Protect routes - verify token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

            // Get user from token using userId
            req.user = await User.findOne({ userId: decoded.userId }).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin authorization - only admins can access
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === ROLE_ADMIN) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

// Self or admin authorization - users can access their own data, admins can access any data
const selfOrAdmin = (req, res, next) => {
    const targetUserId = req.params.id;
    
    if (req.user && (req.user.role === ROLE_ADMIN || req.user.userId == targetUserId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You can only access your own account or admin access required.' });
    }
};

// Admin or self for update/delete - admins can update/delete any user, others can only update/delete themselves
const adminOrSelf = (req, res, next) => {
    const targetUserId = req.params.id;
    
    if (req.user && (req.user.role === ROLE_ADMIN || req.user.userId == targetUserId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You can only modify your own account or admin access required.' });
    }
};

// Caregiver or self authorization - caregivers can access elder accounts, elders can only access their own
const caregiverOrSelf = async (req, res, next) => {
    const targetUserId = req.params.id;
    
    try {
        // Get target user to check their role
        const targetUser = await User.findOne({ userId: targetUserId }).select('role');
        
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Allow access if:
        // 1. User is admin (can access anyone)
        // 2. User is accessing their own account
        // 3. User is caregiver (role 3) and target is elder (role 2)
        if (req.user && (
            req.user.role === ROLE_ADMIN || 
            req.user.userId == targetUserId ||
            (req.user.role === ROLE_GUARDIAN && targetUser.role === ROLE_ELDER)
        )) {
            next();
        } else {
            res.status(403).json({ 
                message: 'Access denied. Caregivers can only access elder accounts, and elders can only access their own account.' 
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Caregiver can view elders, elders can only view themselves
const caregiverViewElders = async (req, res, next) => {
    try {
        // Allow access if:
        // 1. User is admin (can access anyone)
        // 2. User is caregiver (can view elders)
        // 3. User is elder (can only view themselves - handled in controller)
        if (req.user && (
            req.user.role === ROLE_ADMIN || 
            req.user.role === ROLE_GUARDIAN ||
            req.user.role === ROLE_ELDER
        )) {
            next();
        } else {
            res.status(403).json({ 
                message: 'Access denied. Only caregivers and admins can view user lists.' 
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { protect, adminOnly, selfOrAdmin, adminOrSelf, caregiverOrSelf, caregiverViewElders }; 