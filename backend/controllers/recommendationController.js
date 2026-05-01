const { Book, Review, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../middleware/errorHandler');
const { calculateBookSimilarity, calculateUserSimilarity } = require('../utils/similarity');
const { addDiversity, ensureGenreDiversity } = require('../utils/diversity');

/**
 * Content-Based Recommendation (Item-to-Item)
 * Finds books similar to the given book based on category/genre
 * GET /api/books/:id/recommendations
 */
const getSimilarBooks = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get current book
  const currentBook = await Book.findById(id);
  if (!currentBook) throw new NotFoundError('Book');

  // Get all other books
  const allBooks = await Book.find({ _id: { $ne: id } });

  // Calculate similarity scores
  const recommendations = allBooks
    .map(book => ({
      book,
      score: calculateBookSimilarity(currentBook, book)
    }))
    .filter(item => item.score > 0) // Only books with at least one matching tag
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Return top 5

  res.json(recommendations.map(item => ({
    ...item.book.toObject(),
    similarityScore: item.score
  })));
});

/**
 * Collaborative Filtering Recommendation (User-to-User)
 * Finds books for the current user based on similar users' preferences
 * GET /api/users/suggestions
 */
const getUserSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get current user's reviewed books using aggregation
  const userBooksAgg = await Review.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, bookIds: { $push: '$book' }, count: { $sum: 1 } } }
  ]);

  const userBookIds = userBooksAgg.length > 0 ? userBooksAgg[0].bookIds : [];

  if (userBookIds.length === 0) {
    // New user - return some popular books (books with most reviews)
    const popularBooks = await Review.aggregate([
      { $group: { _id: '$book', reviewCount: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { reviewCount: -1, avgRating: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' }
    ]);

    return res.json(popularBooks.map(item => ({
      ...item.book,
      reason: 'Popular among readers'
    })));
  }

  // Find similar users using aggregation pipeline
  const similarUsersAgg = await Review.aggregate([
    // Get all users except current user
    { $match: { user: { $ne: userId } } },
    // Group by user and collect their book IDs
    {
      $group: {
        _id: '$user',
        bookIds: { $push: '$book' },
        reviewCount: { $sum: 1 }
      }
    },
    // Only consider users with at least 2 reviews
    { $match: { reviewCount: { $gte: 2 } } },
    // Calculate similarity with current user
    {
      $addFields: {
        similarity: {
          $let: {
            vars: {
              userBooksSet: { $setIntersection: ['$bookIds', userBookIds] },
              unionSet: { $setUnion: ['$bookIds', userBookIds] }
            },
            in: {
              $cond: {
                if: { $eq: [{ $size: '$$unionSet' }, 0] },
                then: 0,
                else: { $divide: [{ $size: '$$userBooksSet' }, { $size: '$$unionSet' }] }
              }
            }
          }
        }
      }
    },
    // Filter users with similarity > 0
    { $match: { similarity: { $gt: 0 } } },
    // Sort by similarity and limit to top 5
    { $sort: { similarity: -1 } },
    { $limit: 5 }
  ]);

  if (similarUsersAgg.length === 0) {
    return res.json([]);
  }

  const similarUserIds = similarUsersAgg.map(u => u._id);

  // Get highly-rated books from similar users that user hasn't read
  const suggestedBooks = await Review.aggregate([
    {
      $match: {
        user: { $in: similarUserIds },
        book: { $nin: userBookIds },
        rating: { $gte: 4 }
      }
    },
    // Group by book to avoid duplicates and get rating info
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        latestReview: { $max: '$createdAt' }
      }
    },
    // Sort by rating and recency
    { $sort: { avgRating: -1, reviewCount: -1, latestReview: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' }
  ]);

  let recommendations = suggestedBooks.map(item => ({
    ...item.book,
    reason: 'Based on readers with similar taste',
    recommendationScore: item.avgRating * item.reviewCount
  }));

  // Apply diversity algorithm to prevent filter bubbles
  recommendations = addDiversity(recommendations, {
    maxBooks: 6,
    minDiversityScore: 0.3,
    preserveTopResults: 2
  });

  // Ensure genre diversity
  recommendations = ensureGenreDiversity(recommendations, 2);

  res.json(recommendations);
});

/**
 * Get trending books based on recent review activity
 * GET /api/books/trending
 */
const getTrendingBooks = asyncHandler(async (req, res) => {
  const trendingBooks = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }
    },
    {
      $group: {
        _id: '$book',
        reviewCount: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    { $sort: { reviewCount: -1, avgRating: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' }
  ]);

  res.json(trendingBooks.map(item => ({
    ...item.book,
    trendingScore: item.reviewCount,
    avgRating: item.avgRating
  })));
});

/**
 * Get personalized discoveries for logged-in user
 * GET /api/books/discover
 */
const getDiscoverBooks = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's favorite genres
  const user = await User.findById(userId);
  const favoriteGenres = user?.favoriteGenres || [];

  if (favoriteGenres.length === 0) {
    // No preferences - return popular books with better fallback
    const popularBooks = await Review.aggregate([
      { $group: { _id: '$book', reviewCount: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { reviewCount: -1, avgRating: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' }
    ]);

    
    return res.json({
      books: popularBooks.map(item => ({ ...item.book, reason: 'Popular among readers' })),
      hasPersonalizedRecommendations: false
    });
  }

  // Find books matching user's favorite genres
  const genreBooks = await Book.find({
    $or: [
      { category: { $in: user.favoriteGenres } },
      { genre: { $in: user.favoriteGenres } },
      { tags: { $in: user.favoriteGenres } }
    ]
  }).limit(12);

  res.json({
    books: genreBooks.map(book => ({
      ...book.toObject(),
      reason: `Based on your interest in ${user.favoriteGenres.join(', ')}`
    })),
    hasPersonalizedRecommendations: true
  });
});

/**
 * Dashboard recommendations for logged-in user
 * Combines both content-based and collaborative approaches
 * GET /api/dashboard/recommendations
 */
const getDashboardRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's reviews and books in a single aggregation
  const userReviewsAgg = await Review.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' }
  ]);

  if (userReviewsAgg.length === 0) {
    // New user - try to use favorite genres for recommendations
    const user = await User.findById(userId);
    if (user && user.favoriteGenres && user.favoriteGenres.length > 0) {
      const genreBooks = await Book.find({
        $or: [
          { category: { $in: user.favoriteGenres } },
          { genre: { $in: user.favoriteGenres } },
          { tags: { $in: user.favoriteGenres } }
        ]
      }).limit(6);

      return res.json({
        basedOnHistory: genreBooks.map(book => ({
          ...book.toObject(),
          reason: `Based on your favorite genres: ${user.favoriteGenres.join(', ')}`
        })),
        basedOnSimilarUsers: [],
        message: 'Personalized recommendations based on your favorite genres'
      });
    }

    return res.json({
      basedOnHistory: [],
      basedOnSimilarUsers: [],
      message: 'Start reviewing books to get personalized recommendations'
    });
  }

  const userBookIds = userReviewsAgg.map(r => r.book._id.toString());
  const highlyRatedBooks = userReviewsAgg.filter(r => r.rating >= 4).slice(0, 3);

  // Content-based recommendations using aggregation
  const contentBasedRecs = [];
  for (const review of highlyRatedBooks) {
    const book = review.book;
    if (!book) continue;

    // Find similar books using aggregation
    const similarBooksAgg = await Book.aggregate([
      {
        $match: {
          _id: { $ne: book._id, $nin: userReviewsAgg.map(r => r.book._id) }
        }
      },
      {
        $addFields: {
          similarityScore: {
            $let: {
              vars: {
                book1Tags: {
                  $filter: {
                    input: [
                      book.category,
                      book.genre,
                      ...(book.tags || [])
                    ],
                    cond: { $ne: ['$$this', null] }
                  }
                },
                book2Tags: {
                  $filter: {
                    input: [
                      '$category',
                      '$genre',
                      ...(Array.isArray('$tags') ? '$tags' : [])
                    ],
                    cond: { $ne: ['$$this', null] }
                  }
                }
              },
              in: {
                $let: {
                  vars: {
                    intersection: { $setIntersection: ['$$book1Tags', '$$book2Tags'] },
                    union: { $setUnion: ['$$book1Tags', '$$book2Tags'] }
                  },
                  in: {
                    $cond: {
                      if: { $eq: [{ $size: '$$union' }, 0] },
                      then: 0,
                      else: { $divide: [{ $size: '$$intersection' }, { $size: '$$union' }] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $match: { similarityScore: { $gt: 0 } } },
      { $sort: { similarityScore: -1 } },
      { $limit: 2 }
    ]);

    similarBooksAgg.forEach(similarBook => {
      contentBasedRecs.push({
        book: similarBook,
        score: similarBook.similarityScore,
        basedOn: book.title
      });
    });
  }

  // Sort by score and remove duplicates
  const uniqueContentRecs = contentBasedRecs
    .sort((a, b) => b.score - a.score)
    .filter((item, index, self) =>
      index === self.findIndex(t => t.book._id.toString() === item.book._id.toString())
    )
    .slice(0, 3);

  // Collaborative recommendations using optimized aggregation
  const collaborativeRecsAgg = await Review.aggregate([
    // Get all users except current user
    { $match: { user: { $ne: userId } } },
    // Group by user and collect their book IDs
    {
      $group: {
        _id: '$user',
        bookIds: { $push: '$book' },
        reviewCount: { $sum: 1 }
      }
    },
    // Only consider users with at least 2 reviews
    { $match: { reviewCount: { $gte: 2 } } },
    // Calculate similarity with current user
    {
      $addFields: {
        similarity: {
          $let: {
            vars: {
              userBooksSet: { $setIntersection: ['$bookIds', userBookIds] },
              unionSet: { $setUnion: ['$bookIds', userBookIds] }
            },
            in: {
              $cond: {
                if: { $eq: [{ $size: '$$unionSet' }, 0] },
                then: 0,
                else: { $divide: [{ $size: '$$userBooksSet' }, { $size: '$$unionSet' }] }
              }
            }
          }
        }
      }
    },
    // Filter users with similarity > 0
    { $match: { similarity: { $gt: 0 } } },
    // Sort by similarity and limit to top 5
    { $sort: { similarity: -1 } },
    { $limit: 5 }
  ]);

  let collaborativeRecs = [];
  if (collaborativeRecsAgg.length > 0) {
    const similarUserIds = collaborativeRecsAgg.map(u => u._id);
    
    const collabBooksAgg = await Review.aggregate([
      {
        $match: {
          user: { $in: similarUserIds },
          book: { $nin: userBookIds },
          rating: { $gte: 4 }
        }
      },
      {
        $group: {
          _id: '$book',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1, reviewCount: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' }
    ]);

    collaborativeRecs = collabBooksAgg.map(item => item.book);
  }

  // Apply diversity to both recommendation types
  const diversifiedHistory = addDiversity(uniqueContentRecs.map(item => ({
    ...item.book,
    similarityScore: item.score,
    reason: `Because you liked "${item.basedOn}"`
  })), {
    maxBooks: 3,
    minDiversityScore: 0.2,
    preserveTopResults: 1
  });

  const diversifiedCollaborative = addDiversity(collaborativeRecs.map(book => ({
    ...book,
    reason: 'Readers like you enjoyed this'
  })), {
    maxBooks: 3,
    minDiversityScore: 0.2,
    preserveTopResults: 1
  });

  res.json({
    basedOnHistory: diversifiedHistory,
    basedOnSimilarUsers: diversifiedCollaborative
  });
});

module.exports = {
  getSimilarBooks,
  getUserSuggestions,
  getDashboardRecommendations,
  getTrendingBooks,
  getDiscoverBooks
};
