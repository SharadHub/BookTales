const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booktales');
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retries. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying MongoDB connection in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

module.exports = connectDB;
