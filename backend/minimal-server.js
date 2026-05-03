const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server is working', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Minimal server running on port ${PORT}`);
  console.log('✓ Basic Express setup is working');
  
  // Test database connection without actually connecting
  try {
    mongoose.connection.readyState;
    console.log('✓ Mongoose is available');
  } catch (e) {
    console.error('✗ Mongoose issue:', e.message);
  }
  
  setTimeout(() => {
    console.log('✓ Server test completed successfully');
    process.exit(0);
  }, 2000);
});

process.on('error', (err) => {
  console.error('Process error:', err);
});
