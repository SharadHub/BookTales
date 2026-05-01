const express = require('express');
const bookController = require('../controllers/bookController');
const { bookIdParamValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');
const { cacheMiddleware, bookListKey, trendingKey, bookCache, trendingCache } = require('../middleware/cache');
const router = express.Router();

// Get all books with filters and pagination
router.get('/', cacheMiddleware(bookCache, bookListKey), bookController.getAllBooks);

// Search books with advanced filters
router.get('/search', bookController.searchBooks);

// Get categories and genres (filters)
router.get('/filters', cacheMiddleware(bookCache, () => 'filters:unique'), bookController.getFilters);

// Get trending books
router.get('/trending', cacheMiddleware(trendingCache, trendingKey), bookController.getTrendingBooks);

// Get discover books (requires auth for personalization)
router.get('/discover', auth, bookController.getDiscoverBooks);

// Get book recommendations
router.get('/:id/recommendations', bookIdParamValidation, bookController.getBookRecommendations);

// Get single book (must be last)
router.get('/:id', bookIdParamValidation, bookController.getBookById);

module.exports = router;
