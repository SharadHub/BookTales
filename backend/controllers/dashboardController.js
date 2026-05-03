const { Review } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../middleware/apiResponse');

// Get user dashboard data - returns user's reviews only
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's reviews with book details
  const reviews = await Review.find({ user: userId })
    .populate('book', 'title author genre coverImageUrl')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, { reviews }, 'Dashboard data retrieved successfully');
});
