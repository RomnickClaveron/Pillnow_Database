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

// Get all users (role-based access)
exports.getAllUsers = async (req, res) => {
    try {
        const requestingUser = req.user;
        console.log('getAllUsers - Requesting user:', {
            userId: requestingUser.userId,
            role: requestingUser.role,
            name: requestingUser.name
        });
        
        let users;

        if (requestingUser.role === ROLE_ADMIN) {
            // Admin can see all users
            console.log('Admin requesting all users');
            users = await User.find().select('-password -_id');
        } else if (requestingUser.role === ROLE_GUARDIAN) {
            // Caregivers can only see elders
            console.log('Caregiver requesting elders only');
            users = await User.find({ role: ROLE_ELDER }).select('-password -_id');
            console.log('Found elders:', users.length);
        } else if (requestingUser.role === ROLE_ELDER) {
            // Elders can only see themselves
            console.log('Elder requesting own profile');
            users = await User.find({ userId: requestingUser.userId }).select('-password -_id');
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        console.log('Total users found:', users.length);
        console.log('Users:', users.map(u => ({ userId: u.userId, name: u.name, role: u.role })));

        // Provide clearer feedback for empty results
        if (users.length === 0) {
            if (requestingUser.role === ROLE_GUARDIAN) {
                // Let's also check what's actually in the database
                const allUsers = await User.find().select('userId name role');
                console.log('All users in database:', allUsers);
                
                return res.status(404).json({ 
                    message: 'No elders found in the system',
                    userRole: requestingUser.role,
                    note: 'Caregivers can only view elder accounts',
                    debug: {
                        totalUsersInDB: allUsers.length,
                        allUsers: allUsers
                    }
                });
            } else if (requestingUser.role === ROLE_ELDER) {
                return res.status(404).json({ 
                    message: 'User profile not found',
                    userRole: requestingUser.role
                });
            }
        }

        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
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

// Get user by phone number
exports.getUserByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        
        console.log('Searching for user with phone:', phone);
        console.log('Requesting user:', req.user);
        
        // Check if user exists by phone number
        const user = await User.findOne({ phone }).select('-password -_id');
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found with this phone number',
                searchedPhone: phone
            });
        }

        console.log('Found user:', user);

        // Role-based access control
        const requestingUser = req.user;
        
        // Allow access if:
        // 1. User is admin (can access anyone)
        // 2. User is accessing their own account
        // 3. User is caregiver (role 3) and target is elder (role 2)
        const canAccess = requestingUser && (
            requestingUser.role === ROLE_ADMIN || 
            requestingUser.userId === user.userId ||
            (requestingUser.role === ROLE_GUARDIAN && user.role === ROLE_ELDER)
        );

        console.log('Can access:', canAccess);
        console.log('Requesting user role:', requestingUser?.role);
        console.log('Target user role:', user.role);
        console.log('Requesting user ID:', requestingUser?.userId);
        console.log('Target user ID:', user.userId);

        if (canAccess) {
            res.json(user);
        } else {
            res.status(403).json({ 
                message: 'Access denied. Caregivers can only access elder accounts, and users can only access their own account.',
                requestingUserRole: requestingUser?.role,
                targetUserRole: user.role,
                requestingUserId: requestingUser?.userId,
                targetUserId: user.userId
            });
        }
    } catch (error) {
        console.error('Error in getUserByPhone:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user by phone number (simplified for frontend)
exports.getUserByPhoneSimple = async (req, res) => {
    try {
        const { phone } = req.params;
        
        console.log('Simple search for user with phone:', phone);
        console.log('Requesting user:', req.user);
        
        // Check if user exists by phone number
        const user = await User.findOne({ phone }).select('-password -_id');
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found with this phone number',
                searchedPhone: phone
            });
        }

        console.log('Found user:', user);

        // Role-based access control (same as getUserByPhone)
        const requestingUser = req.user;
        
        // Allow access if:
        // 1. User is admin (can access anyone)
        // 2. User is accessing their own account
        // 3. User is caregiver (role 3) and target is elder (role 2)
        const canAccess = requestingUser && (
            requestingUser.role === ROLE_ADMIN || 
            requestingUser.userId === user.userId ||
            (requestingUser.role === ROLE_GUARDIAN && user.role === ROLE_ELDER)
        );

        console.log('Can access:', canAccess);
        console.log('Requesting user role:', requestingUser?.role);
        console.log('Target user role:', user.role);

        if (canAccess) {
            res.json(user);
        } else {
            res.status(403).json({ 
                message: 'Access denied. Caregivers can only access elder accounts, and users can only access their own account.',
                requestingUserRole: requestingUser?.role,
                targetUserRole: user.role,
                requestingUserId: requestingUser?.userId,
                targetUserId: user.userId
            });
        }
    } catch (error) {
        console.error('Error in getUserByPhoneSimple:', error);
        res.status(500).json({ message: error.message });
    }
};

// Debug endpoint to check all users in database (admin only)
exports.debugAllUsers = async (req, res) => {
    try {
        const requestingUser = req.user;
        
        // Only admins can access this debug endpoint
        if (requestingUser.role !== ROLE_ADMIN) {
            return res.status(403).json({ 
                message: 'Access denied. Admin role required for debug endpoint.' 
            });
        }
        
        console.log('Debug: Checking all users in database');
        
        // Get all users with basic info
        const allUsers = await User.find().select('userId name email phone role createdAt');
        
        console.log('Debug: Found users:', allUsers);
        
        res.json({
            message: 'Debug: All users in database',
            totalUsers: allUsers.length,
            users: allUsers,
            roleBreakdown: {
                admins: allUsers.filter(u => u.role === ROLE_ADMIN).length,
                elders: allUsers.filter(u => u.role === ROLE_ELDER).length,
                guardians: allUsers.filter(u => u.role === ROLE_GUARDIAN).length
            }
        });
    } catch (error) {
        console.error('Error in debugAllUsers:', error);
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