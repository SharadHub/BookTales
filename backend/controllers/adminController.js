const { User, Book, Review } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');
const ApiResponse = require('../middleware/apiResponse');

// === Book Management ===

// Get all books (admin)
exports.getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  ApiResponse.success(res, { books }, 'Books retrieved successfully');
});

// Create book
exports.createBook = asyncHandler(async (req, res) => {
  const bookData = { ...req.body };

  // Handle cover image - either file upload or URL
  if (req.file) {
    bookData.coverImageUrl = `/uploads/books/${req.file.filename}`;
  } else if (bookData.coverImageUrl) {
    // If URL provided, validate it's a valid URL
    try {
      new URL(bookData.coverImageUrl);
      // Keep the URL as-is
    } catch (error) {
      // Invalid URL format
      bookData.coverImageUrl = '';
    }
  }

  // Check for duplicate ISBN
  if (bookData.isbn) {
    const existing = await Book.findOne({ isbn: bookData.isbn });
    if (existing) {
      throw new ConflictError('A book with that ISBN already exists');
    }
  }

  const book = new Book(bookData);
  await book.save();
  ApiResponse.created(res, { book }, 'Book created successfully');
});

// Update book
exports.updateBook = asyncHandler(async (req, res) => {
  const bookData = { ...req.body };

  // Handle cover image - either file upload or URL
  if (req.file) {
    bookData.coverImageUrl = `/uploads/books/${req.file.filename}`;
  } else if (bookData.coverImageUrl) {
    // If URL provided, validate it's a valid URL
    try {
      new URL(bookData.coverImageUrl);
      // Keep the URL as-is
    } catch (error) {
      // Invalid URL format - don't update if invalid
      delete bookData.coverImageUrl;
    }
  }

  // Check for duplicate ISBN (excluding current book)
  if (bookData.isbn) {
    const existing = await Book.findOne({
      isbn: bookData.isbn,
      _id: { $ne: req.params.id }
    });
    if (existing) {
      throw new ConflictError('A book with that ISBN already exists');
    }
  }

  const book = await Book.findByIdAndUpdate(
    req.params.id,
    bookData,
    { new: true }
  );

  if (!book) throw new NotFoundError('Book');
  ApiResponse.updated(res, { book }, 'Book updated successfully');
});

// Delete book
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) throw new NotFoundError('Book');

  // Delete associated reviews
  await Review.deleteMany({ book: req.params.id });

  ApiResponse.deleted(res, 'Book deleted successfully');
});

// === User Management ===

// Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  ApiResponse.success(res, { users }, 'Users retrieved successfully');
});

// Create user
exports.createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check for existing email/username
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ConflictError('Email already exists');
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw new ConflictError('Username already exists');
  }

  const user = new User({ username, email, password, role: role || 'user' });
  await user.save();

  ApiResponse.created(res, { user }, 'User created successfully');
});

// Update user
exports.updateUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const updateData = { username, email, role };

  if (password) {
    updateData.password = password;
  }

  // Check for duplicates excluding current user
  const existingEmail = await User.findOne({
    email: email.toLowerCase(),
    _id: { $ne: req.params.id }
  });
  if (existingEmail) {
    throw new ConflictError('Email already exists');
  }

  const existingUsername = await User.findOne({
    username: username.toLowerCase(),
    _id: { $ne: req.params.id }
  });
  if (existingUsername) {
    throw new ConflictError('Username already exists');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');

  Object.assign(user, updateData);
  await user.save();

  ApiResponse.updated(res, { user }, 'User updated successfully');
});

// Delete user
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new NotFoundError('User');

  // Delete associated reviews
  await Review.deleteMany({ user: req.params.id });

  ApiResponse.deleted(res, 'User deleted successfully');
});

// === Analytics ===

// Get Analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const trendingGenresAgg = await Review.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' },
    {
      $group: {
        _id: '$bookDetails.genre',
        reviewCount: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    { $match: { _id: { $ne: null, $ne: "" } } },
    { $sort: { reviewCount: -1, avgRating: -1 } },
    { $limit: 5 }
  ]);

  const centralBooksAgg = await Review.aggregate([
    {
      $group: {
        _id: '$book',
        reviewCount: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    { $sort: { reviewCount: -1, avgRating: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' }
  ]);

  const totalUsers = await User.countDocuments();
  const totalBooks = await Book.countDocuments();
  const totalReviews = await Review.countDocuments();

  const stats = {
    totalUsers,
    totalBooks,
    totalReviews
  };
  
  const trendingGenres = trendingGenresAgg.map(g => ({
    genre: g._id,
    count: g.reviewCount,
    rating: Number(g.avgRating.toFixed(1))
  }));
  
  const centralBooks = centralBooksAgg.map(b => ({
    id: b.bookDetails._id,
    title: b.bookDetails.title,
    author: b.bookDetails.author,
    coverImageUrl: b.bookDetails.coverImageUrl,
    reviewCount: b.reviewCount,
    rating: Number(b.avgRating.toFixed(1))
  }));

  ApiResponse.success(res, { stats, trendingGenres, centralBooks }, 'Analytics retrieved successfully');
});

