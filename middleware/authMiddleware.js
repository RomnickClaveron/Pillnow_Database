const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

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
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

// Self or admin authorization - users can access their own data, admins can access any data
const selfOrAdmin = (req, res, next) => {
    const targetUserId = req.params.id;
    
    if (req.user && (req.user.role === 'admin' || req.user.userId == targetUserId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You can only access your own account or admin access required.' });
    }
};

// Admin or self for update/delete - admins can update/delete any user, others can only update/delete themselves
const adminOrSelf = (req, res, next) => {
    const targetUserId = req.params.id;
    
    if (req.user && (req.user.role === 'admin' || req.user.userId == targetUserId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You can only modify your own account or admin access required.' });
    }
};

module.exports = { protect, adminOnly, selfOrAdmin, adminOrSelf }; 