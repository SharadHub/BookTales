const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 20
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  genre: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  coverImageUrl: {
    type: String,
    maxlength: 500
  },
  publishedYear: {
    type: Number,
    min: 1000,
    max: 2100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, {
  timestamps: true
});

bookSchema.virtual('averageRating').get(function() {
  return this._averageRating || 0;
});

bookSchema.virtual('reviewCount').get(function() {
  return this._reviewCount || 0;
});

bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
