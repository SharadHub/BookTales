const NodeCache = require('node-cache');

const bookCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
const trendingCache = new NodeCache({ stdTTL: 600, checkperiod: 300 });
const recommendationCache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });

const cacheMiddleware = (cache, keyGenerator) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const cachedData = cache.get(key);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, data);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

const bookListKey = (req) => `books:${JSON.stringify(req.query)}`;
const trendingKey = () => 'trending:books';
const recommendationKey = (req) => `recommendations:${req.user?._id || 'guest'}`;

module.exports = {
  bookCache,
  trendingCache,
  recommendationCache,
  cacheMiddleware,
  bookListKey,
  trendingKey,
  recommendationKey
};
