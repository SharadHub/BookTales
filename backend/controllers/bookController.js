const bookService = require('../services/bookService');
const ApiResponse = require('../middleware/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Get all books with filters and pagination
exports.getAllBooks = asyncHandler(async (req, res) => {
  const result = await bookService.getBooks(req.query);
  ApiResponse.paginated(res, result.books, result.pagination, 'Books retrieved successfully');
});

// Get single book
exports.getBookById = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  ApiResponse.success(res, { book }, 'Book retrieved successfully');
});

// Get trending books
exports.getTrendingBooks = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const books = await bookService.getTrendingBooks(limit);
  ApiResponse.success(res, { books }, 'Trending books retrieved successfully');
});

// Get discover books
exports.getDiscoverBooks = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 12;
  const books = await bookService.getDiscoverBooks(limit);
  ApiResponse.success(res, { books }, 'Discover books retrieved successfully');
});

// Get book recommendations
exports.getBookRecommendations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = req.query.limit || 6;
  const books = await bookService.getBookRecommendations(id, limit);
  ApiResponse.success(res, { books }, 'Book recommendations retrieved successfully');
});

// Search books with advanced filters
exports.searchBooks = asyncHandler(async (req, res) => {
  const { q: searchQuery, ...filters } = req.query;
  const result = await bookService.searchBooks(searchQuery, filters);
  ApiResponse.paginated(res, result.books, result.pagination, 'Search results retrieved successfully');
});

// Get categories and genres (filters)
exports.getFilters = asyncHandler(async (req, res) => {
  const { Book } = require('../models');
  const categories = await Book.distinct('category');
  const genres = await Book.distinct('genre');
  const authors = await Book.distinct('author');
  
  ApiResponse.success(res, { 
    categories: categories.filter(Boolean), 
    genres: genres.filter(Boolean), 
    authors: authors.filter(Boolean) 
  }, 'Filters retrieved successfully');
});
