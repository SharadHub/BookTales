const express = require('express');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const { reviewValidation, reviewBookIdParamValidation } = require('../middleware/validation');
const router = express.Router();

// Get reviews for a book
router.get('/book/:bookId', reviewBookIdParamValidation, reviewController.getBookReviews);

// Submit or update review
router.post('/', auth, reviewValidation, reviewController.submitReview);

// Delete review
router.delete('/:bookId', auth, reviewBookIdParamValidation, reviewController.deleteReview);

module.exports = router;
