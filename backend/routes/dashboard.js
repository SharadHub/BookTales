const express = require('express');
const { dashboardController, recommendationController } = require('../controllers');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user dashboard data (user's reviews)
router.get('/', auth, dashboardController.getDashboard);

// Get personalized recommendations for user
router.get('/recommendations', auth, recommendationController.getDashboardRecommendations);

module.exports = router;
