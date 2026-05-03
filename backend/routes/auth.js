const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const router = express.Router();

// Register
router.post('/register', registerValidation, authController.register);

// Login
router.post('/login', loginValidation, authController.login);

// Get current user
router.get('/me', auth, authController.getMe);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Change password
router.put('/password', auth, authController.changePassword);

// Request password reset
router.post('/password/reset', authController.requestPasswordReset);

module.exports = router;
