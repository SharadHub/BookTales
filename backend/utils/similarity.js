/**
 * Calculates Jaccard Similarity between two arrays or sets
 * Formula: (Intersection Size) / (Union Size)
 * @param {Array|Set} input1 - First collection
 * @param {Array|Set} input2 - Second collection
 * @returns {Number} Similarity score between 0 and 1
 */
const calculateJaccard = (input1, input2) => {
  const arr1 = Array.isArray(input1) ? input1 : Array.from(input1 || []);
  const arr2 = Array.isArray(input2) ? input2 : Array.from(input2 || []);

  if (arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1.map(String));
  const set2 = new Set(arr2.map(String));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
};

/**
 * Calculates similarity between two books based on category, genre, and tags
 * @param {Object} book1 - First book with category, genre, and tags
 * @param {Object} book2 - Second book with category, genre, and tags
 * @returns {Number} Similarity score between 0 and 1
 */
const calculateBookSimilarity = (book1, book2, minThreshold = 0.1) => {
  const features1 = new Set();
  const features2 = new Set();

  if (book1.category) features1.add(book1.category.toLowerCase());
  if (book2.category) features2.add(book2.category.toLowerCase());

  if (book1.genre) features1.add(book1.genre.toLowerCase());
  if (book2.genre) features2.add(book2.genre.toLowerCase());

  if (book1.tags && Array.isArray(book1.tags)) {
    book1.tags.forEach(tag => features1.add(tag.toLowerCase()));
  }
  if (book2.tags && Array.isArray(book2.tags)) {
    book2.tags.forEach(tag => features2.add(tag.toLowerCase()));
  }

  const similarity = calculateJaccard(features1, features2);
  return similarity >= minThreshold ? similarity : 0;
};

/**
 * Calculates similarity between two users based on their reviewed book IDs
 * @param {Array} user1Books - Array of book IDs reviewed by user 1
 * @param {Array} user2Books - Array of book IDs reviewed by user 2
 * @returns {Number} Similarity score between 0 and 1
 */
const calculateUserSimilarity = (user1Books, user2Books, minThreshold = 0.1) => {
  const similarity = calculateJaccard(user1Books, user2Books);
  return similarity >= minThreshold ? similarity : 0;
};

module.exports = {
  calculateJaccard,
  calculateBookSimilarity,
  calculateUserSimilarity
};
