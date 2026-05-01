const { Review, Book } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../middleware/errorHandler');

// Get reviews for a book
exports.getBookReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  // Verify book exists
  const book = await Book.findById(bookId);
  if (!book) throw new NotFoundError('Book');

  const reviews = await Review.find({ book: bookId })
    .populate('user', 'username')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// Submit or update review
exports.submitReview = asyncHandler(async (req, res) => {
  const { bookId, rating, reviewText } = req.body;

  // Verify book exists
  const book = await Book.findById(bookId);
  if (!book) throw new NotFoundError('Book');

  // Find and update, or create new
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { rating, reviewText },
    { upsert: true, new: true }
  );

  res.json(review);
});

// Delete review
exports.deleteReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const review = await Review.findOneAndDelete({ user: req.user._id, book: bookId });
  if (!review) throw new NotFoundError('Review');

  res.json({ message: 'Review deleted successfully' });
});
