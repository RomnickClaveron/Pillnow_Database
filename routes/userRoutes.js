const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { protect, adminOnly, selfOrAdmin, adminOrSelf, caregiverOrSelf, caregiverViewElders } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes (authentication required)
router.get('/profile', protect, userController.getCurrentUser);
router.post('/change-password', protect, userController.changePassword);
// NOTE: :id refers to userId (auto-incremented), not _id
router.get('/', protect, caregiverViewElders, userController.getAllUsers);
router.get('/phone/:phone', protect, userController.getUserByPhone);
router.get('/phone-simple/:phone', protect, userController.getUserByPhoneSimple);
router.get('/debug/all-users', protect, userController.debugAllUsers);
router.get('/:id', protect, caregiverOrSelf, userController.getUserById);
router.put('/:id', protect, caregiverOrSelf, userController.updateUser);
router.delete('/:id', protect, adminOrSelf, userController.deleteUser);

module.exports = router; 