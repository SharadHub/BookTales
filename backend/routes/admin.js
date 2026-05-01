const express = require('express');
const { adminController } = require('../controllers');
const { auth, admin, upload } = require('../middleware');
const { bookValidation, bookIdParamValidation, userValidation, userIdParamValidation } = require('../middleware/validation');
const router = express.Router();

// === Book Management ===

// Get all books (admin)
router.get('/books', auth, admin, adminController.getAllBooks);

// Create book
router.post('/books', auth, admin, upload.single('coverImage'), bookValidation, adminController.createBook);

// Update book
router.put('/books/:id', auth, admin, upload.single('coverImage'), bookIdParamValidation, bookValidation, adminController.updateBook);

// Delete book
router.delete('/books/:id', auth, admin, bookIdParamValidation, adminController.deleteBook);

// === User Management ===

// Get all users
router.get('/users', auth, admin, adminController.getAllUsers);

// Create user
router.post('/users', auth, admin, userValidation, adminController.createUser);

// Update user
router.put('/users/:id', auth, admin, userIdParamValidation, userValidation, adminController.updateUser);

// Delete user
router.delete('/users/:id', auth, admin, userIdParamValidation, adminController.deleteUser);

// === Analytics ===
router.get('/analytics', auth, admin, adminController.getAnalytics);

module.exports = router;
