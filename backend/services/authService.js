const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ConflictError, AuthenticationError } = require('../middleware/errorHandler');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { username, email, password } = userData;

    // Check if email exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Determine role
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

    // Create user
    const user = new User({ 
      username: username.toLowerCase(), 
      email: email.toLowerCase(), 
      password, 
      role 
    });
    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = this.generateToken(user._id);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const allowedUpdates = ['username', 'email', 'favoriteGenres', 'hasCompletedOnboarding'];
    const filteredData = {};
    
    // Check for username uniqueness if being updated
    if (updateData.username) {
      const usernameLower = updateData.username.toLowerCase();
      const existingUser = await User.findOne({ 
        username: usernameLower, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        throw new ConflictError('Username already taken');
      }
      filteredData.username = usernameLower;
    }

    // Check for email uniqueness if being updated
    if (updateData.email) {
      const emailLower = updateData.email.toLowerCase();
      const existingUser = await User.findOne({ 
        email: emailLower, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }
      filteredData.email = emailLower;
    }

    // Handle other allowed updates
    ['favoriteGenres', 'hasCompletedOnboarding'].forEach(key => {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Sanitize user object (remove sensitive data)
   */
  sanitizeUser(user) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      favoriteGenres: user.favoriteGenres,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      createdAt: user.createdAt
    };
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account exists with this email, a reset link will be sent' };
    }

    // In a real implementation, you would send an email with reset token
    // For now, we'll just return a success message
    return { message: 'Password reset link sent to your email' };
  }
}

module.exports = new AuthService();
