const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Book } = require('../models');
const csv = require('csv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const importBooksFromCSV = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booktales');
    console.log('Connected to MongoDB');

    const csvPath = path.join(__dirname, '../../data/books_final.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('books_final.csv not found in data directory');
      process.exit(1);
    }

    console.log('Starting import of books from books_final.csv...');

    // Clear existing books (optional - comment out if you want to keep existing data)
    await Book.deleteMany({});
    console.log('Cleared existing books');

    const books = [];
    let processedCount = 0;
    let skippedCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv.parse({ columns: true }))
        .on('data', (row) => {
          try {
            // Map CSV columns to MongoDB schema
            let authorName = row['author name']?.trim() || '';
            
            // Truncate very long author lists to prevent issues
            if (authorName.length > 900) {
              const authors = authorName.split('/');
              authorName = authors.slice(0, 10).join('/') + '... and others';
            }
            
            const bookData = {
              title: row['title']?.trim(),
              author: authorName,
              isbn: row['isbn number']?.trim(),
              category: row['category']?.trim(),
              genre: row['genre']?.trim(),
              description: row['description']?.trim(),
              coverImageUrl: row['cover image']?.trim(),
              publishedYear: parseInt(row['published year']) || null
            };

            // Validate required fields
            if (!bookData.title || !bookData.author || !bookData.category) {
              console.log(`Skipping row ${processedCount + 1}: Missing required fields`);
              skippedCount++;
              return;
            }

            // Clean ISBN (remove hyphens and spaces)
            if (bookData.isbn) {
              bookData.isbn = bookData.isbn.replace(/[-\s]/g, '');
            }

            books.push(bookData);
            processedCount++;

            // Batch insert every 100 books to manage memory
            if (books.length >= 100) {
              const batch = books.splice(0, 100);
              Book.insertMany(batch).catch(err => {
                console.error('Error inserting batch:', err);
              });
            }

            if (processedCount % 1000 === 0) {
              console.log(`Processed ${processedCount} books...`);
            }
          } catch (error) {
            console.error(`Error processing row ${processedCount + 1}:`, error);
            skippedCount++;
          }
        })
        .on('end', async () => {
          try {
            // Insert remaining books
            if (books.length > 0) {
              await Book.insertMany(books);
            }

            const totalBooks = await Book.countDocuments();
            console.log('\n✅ Import completed successfully!');
            console.log(`📊 Results:`);
            console.log(`   Total rows processed: ${processedCount}`);
            console.log(`   Books imported: ${totalBooks}`);
            console.log(`   Rows skipped: ${skippedCount}`);
            console.log(`   Books now in database: ${totalBooks}`);

            // Show sample of imported books
            const sampleBooks = await Book.find().limit(3);
            console.log('\n📖 Sample of imported books:');
            sampleBooks.forEach((book, index) => {
              console.log(`\nBook ${index + 1}:`);
              console.log(`   Title: ${book.title}`);
              console.log(`   Author: ${book.author}`);
              console.log(`   Category: ${book.category}`);
              console.log(`   Genre: ${book.genre || 'Not specified'}`);
              console.log(`   ISBN: ${book.isbn || 'Not specified'}`);
              console.log(`   Year: ${book.publishedYear || 'Not specified'}`);
              console.log(`   Cover: ${book.coverImageUrl ? '✅' : '❌'}`);
              console.log(`   Description: ${book.description ? '✅' : '❌'}`);
            });

            process.exit(0);
          } catch (error) {
            console.error('Error during final insert:', error);
            process.exit(1);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
};

importBooksFromCSV();
