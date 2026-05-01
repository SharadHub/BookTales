const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booktales');
      return;
    } catch (err) {
      if (attempt === maxRetries) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

module.exports = connectDB;
