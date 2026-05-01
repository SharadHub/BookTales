const { Book, Review } = require('../models');
const { NotFoundError } = require('../middleware/errorHandler');

class BookService {
  /**
   * Get all books with filtering and pagination
   */
  async getBooks(query = {}) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      category,
      genre,
      author,
      search
    } = query;

    const filter = {};
    
    if (category) filter.category = new RegExp(category, 'i');
    if (genre) filter.genre = new RegExp(genre, 'i');
    if (author) filter.author = new RegExp(author, 'i');
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const books = await Book.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $project: { reviews: 0 } },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Book.countDocuments(filter);

    return {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get book by ID
   */
  async getBookById(bookId) {
    const book = await Book.aggregate([
      { $match: { _id: Book.Types.ObjectId(bookId) } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $limit: 1 }
    ]);

    if (!book || book.length === 0) {
      throw new NotFoundError('Book not found');
    }

    return book[0];
  }

  /**
   * Create a new book
   */
  async createBook(bookData) {
    const book = new Book(bookData);
    await book.save();
    return book;
  }

  /**
   * Update a book
   */
  async updateBook(bookId, updateData) {
    const book = await Book.findByIdAndUpdate(
      bookId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!book) {
      throw new NotFoundError('Book not found');
    }

    return book;
  }

  /**
   * Delete a book
   */
  async deleteBook(bookId) {
    const book = await Book.findByIdAndDelete(bookId);
    
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    await Review.deleteMany({ book: bookId });
    return { message: 'Book deleted successfully' };
  }

  /**
   * Get trending books
   */
  async getTrendingBooks(limit = 10) {
    const books = await Book.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $match: { reviewCount: { $gte: 1 } } },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: parseInt(limit) },
      { $project: { reviews: 0 } }
    ]);

    return books;
  }

  /**
   * Get discover books
   */
  async getDiscoverBooks(limit = 12) {
    const books = await Book.aggregate([
      { $sample: { size: parseInt(limit) } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $project: { reviews: 0 } }
    ]);

    return books;
  }

  /**
   * Get book recommendations
   */
  async getBookRecommendations(bookId, limit = 6) {
    const book = await Book.findById(bookId);
    if (!book) throw new NotFoundError('Book not found');

    const recommendations = await Book.aggregate([
      {
        $match: {
          _id: { $ne: Book.Types.ObjectId(bookId) },
          $or: [
            { category: book.category },
            { genre: book.genre }
          ]
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: parseInt(limit) },
      { $project: { reviews: 0 } }
    ]);

    return recommendations;
  }

  /**
   * Search books
   */
  async searchBooks(searchQuery, filters = {}) {
    const {
      categories = [],
      genres = [],
      minRating = 0,
      maxRating = 5,
      minReviews = 0,
      yearRange = {},
      page = 1,
      limit = 10
    } = filters;

    const matchFilter = {
      $or: [
        { title: new RegExp(searchQuery, 'i') },
        { author: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') }
      ]
    };

    if (categories.length > 0) matchFilter.category = { $in: categories };
    if (genres.length > 0) matchFilter.genre = { $in: genres };

    if (yearRange.min || yearRange.max) {
      matchFilter.publishedYear = {};
      if (yearRange.min) matchFilter.publishedYear.$gte = yearRange.min;
      if (yearRange.max) matchFilter.publishedYear.$lte = yearRange.max;
    }

    const skip = (page - 1) * limit;

    const books = await Book.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'book',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $match: { 
        averageRating: { $gte: minRating, $lte: maxRating },
        reviewCount: { $gte: minReviews }
      }},
      { $project: { reviews: 0 } },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Book.countDocuments(matchFilter);

    return {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new BookService();
