/**
 * Utility functions for adding diversity to book recommendations
 * Prevents filter bubbles by ensuring variety in categories, genres, and authors
 */

/**
 * Calculate diversity score for a set of books
 * Higher score means more diverse recommendations
 */
const calculateDiversityScore = (books) => {
  if (books.length <= 1) return 1;

  const categories = new Set();
  const genres = new Set();
  const authors = new Set();

  books.forEach(book => {
    if (book.category) categories.add(book.category);
    if (book.genre) genres.add(book.genre);
    if (book.author) authors.add(book.author);
  });

  const categoryDiversity = categories.size / books.length;
  const genreDiversity = genres.size / books.length;
  const authorDiversity = authors.size / books.length;

  return (categoryDiversity * 0.4 + genreDiversity * 0.4 + authorDiversity * 0.2);
};

/**
 * Add diversity to recommendations while maintaining relevance
 * @param {Array} recommendations - Array of recommended books with scores
 * @param {Object} options - Diversity options
 * @returns {Array} Diversified recommendations
 */
const addDiversity = (recommendations, options = {}) => {
  const {
    maxBooks = 6,
    minDiversityScore = 0.3,
    preserveTopResults = 2,
    categoryWeight = 0.4,
    genreWeight = 0.4,
    authorWeight = 0.2
  } = options;

  if (!recommendations || recommendations.length <= maxBooks) {
    return recommendations;
  }

  const topResults = recommendations.slice(0, preserveTopResults);
  const remainingBooks = recommendations.slice(preserveTopResults);

  const usedCategories = new Set(topResults.map(b => b.category).filter(Boolean));
  const usedGenres = new Set(topResults.map(b => b.genre).filter(Boolean));
  const usedAuthors = new Set(topResults.map(b => b.author).filter(Boolean));

  const scoredBooks = remainingBooks.map(book => {
    let diversityScore = 0;

    if (book.category && !usedCategories.has(book.category)) {
      diversityScore += categoryWeight;
    }

    if (book.genre && !usedGenres.has(book.genre)) {
      diversityScore += genreWeight;
    }

    if (book.author && !usedAuthors.has(book.author)) {
      diversityScore += authorWeight;
    }

    const originalScore = book.similarityScore || book.recommendationScore || book.avgRating || 0;
    const finalScore = originalScore + (diversityScore * 0.3);

    return {
      ...book,
      diversityScore,
      finalScore
    };
  });

  scoredBooks.sort((a, b) => b.finalScore - a.finalScore);
  const selectedBooks = scoredBooks.slice(0, maxBooks - preserveTopResults);

  const finalRecommendations = [...topResults, ...selectedBooks];
  
  const actualDiversityScore = calculateDiversityScore(finalRecommendations);
  
  if (actualDiversityScore < minDiversityScore && remainingBooks.length > selectedBooks.length) {
    return addDiversity(recommendations, {
      ...options,
      preserveTopResults: Math.max(1, preserveTopResults - 1),
      minDiversityScore: minDiversityScore * 0.8
    });
  }

  return finalRecommendations.slice(0, maxBooks);
};

/**
 * Ensure genre diversity in recommendations
 * @param {Array} recommendations - Array of books
 * @param {number} maxSameGenre - Maximum books from same genre
 * @returns {Array} Genre-diversified recommendations
 */
const ensureGenreDiversity = (recommendations, maxSameGenre = 2) => {
  const genreCount = {};
  const result = [];

  for (const book of recommendations) {
    const genre = book.genre || 'Unknown';
    
    if (!genreCount[genre]) {
      genreCount[genre] = 0;
    }

    if (genreCount[genre] < maxSameGenre) {
      result.push(book);
      genreCount[genre]++;
    }
  }

  return result;
};

module.exports = {
  calculateDiversityScore,
  addDiversity,
  ensureGenreDiversity
};
