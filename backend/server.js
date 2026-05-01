const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const validateEnv = require('./config/validateEnv');
const { httpLogger } = require('./utils/logger');
const {
  globalErrorHandler,
  notFoundHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
} = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, reviewLimiter, bookCreationLimiter } = require('./middleware/rateLimiter');

dotenv.config();
setupUncaughtExceptionHandler();
validateEnv();
connectDB();

const app = express();

const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/books', 'uploads/users'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(httpLogger);
app.use(generalLimiter);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.status(200).json(health);
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/reviews', reviewLimiter, require('./routes/reviews'));
app.use('/api/admin', bookCreationLimiter, require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use(notFoundHandler);
app.use(globalErrorHandler);
setupUnhandledRejectionHandler();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT);

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

module.exports = app;
