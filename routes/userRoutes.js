const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { protect, adminOnly, selfOrAdmin, adminOrSelf } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes (authentication required)
router.get('/profile', protect, userController.getCurrentUser);
router.get('/', protect, adminOnly, userController.getAllUsers);
router.get('/:id', protect, selfOrAdmin, userController.getUserById);
router.put('/:id', protect, adminOrSelf, userController.updateUser);
router.delete('/:id', protect, adminOrSelf, userController.deleteUser);

module.exports = router; 