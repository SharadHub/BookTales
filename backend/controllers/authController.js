const authService = require('../services/authService');
const ApiResponse = require('../middleware/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Register
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, result, 'User registered successfully');
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  ApiResponse.success(res, result, 'Login successful');
});

// Get current user
exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  ApiResponse.success(res, { user }, 'User retrieved successfully');
});

// Update user profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  ApiResponse.updated(res, { user }, 'Profile updated successfully');
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  ApiResponse.success(res, result, 'Password changed successfully');
});

// Request password reset
exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.requestPasswordReset(email);
  ApiResponse.success(res, result, 'Password reset request processed');
});
