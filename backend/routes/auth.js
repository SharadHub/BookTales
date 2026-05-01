const express = require('express');
const { authController } = require('../controllers');
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

module.exports = router;
