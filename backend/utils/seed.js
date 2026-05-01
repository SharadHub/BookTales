const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Book, Review } = require('../models');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booktales');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminUser = new User({
      username: 'admin',
      email: adminEmail,
      password: 'password',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create regular user
    const regularUser = new User({
      username: 'booklover',
      email: 'user@example.com',
      password: 'password',
      role: 'user'
    });
    await regularUser.save();
    console.log('Regular user created');

    // Sample books data
    const booksData = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        category: 'Fiction',
        genre: 'Classic',
        description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
        coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        publishedYear: 1925
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0446310789',
        category: 'Fiction',
        genre: 'Classic',
        description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
        coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
        publishedYear: 1960
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0451524935',
        category: 'Fiction',
        genre: 'Dystopian',
        description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.',
        coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        publishedYear: 1949
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0141439518',
        category: 'Fiction',
        genre: 'Romance',
        description: 'The romantic clash between the opinionated Elizabeth Bennet and her proud beau, Mr. Darcy, is a splendid performance of civilized sparring.',
        coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        publishedYear: 1813
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '978-0316769488',
        category: 'Fiction',
        genre: 'Coming-of-age',
        description: 'The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield.',
        coverImageUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
        publishedYear: 1951
      },
      {
        title: 'Harry Potter and the Sorcerer\'s Stone',
        author: 'J.K. Rowling',
        isbn: '978-0590353427',
        category: 'Fiction',
        genre: 'Fantasy',
        description: 'Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground.',
        coverImageUrl: 'https://images.unsplash.com/photo-1609866138210-84bb6f876f00?w=400',
        publishedYear: 1997
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '978-0547928227',
        category: 'Fiction',
        genre: 'Fantasy',
        description: 'A great modern classic and a prelude to The Lord of the Rings. The Hobbit is the story of Bilbo Baggins.',
        coverImageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400',
        publishedYear: 1937
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '978-0441172719',
        category: 'Fiction',
        genre: 'Science Fiction',
        description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
        coverImageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
        publishedYear: 1965
      }
    ];

    const books = await Book.insertMany(booksData);
    console.log(`${books.length} books created`);

    // Create some reviews
    const reviewsData = [
      { user: regularUser._id, book: books[0]._id, rating: 5, reviewText: 'A masterpiece of American literature!' },
      { user: regularUser._id, book: books[1]._id, rating: 5, reviewText: 'Powerful and moving. A must-read for everyone.' },
      { user: regularUser._id, book: books[2]._id, rating: 4, reviewText: 'Chillingly relevant even today.' },
      { user: regularUser._id, book: books[5]._id, rating: 5, reviewText: 'Magical and enchanting! Started my love for reading.' },
      { user: adminUser._id, book: books[6]._id, rating: 5, reviewText: 'The perfect fantasy adventure.' },
      { user: adminUser._id, book: books[7]._id, rating: 4, reviewText: 'Epic world-building.' }
    ];

    await Review.insertMany(reviewsData);
    console.log(`${reviewsData.length} reviews created`);

    console.log('\nSeed completed successfully!');
    console.log('Login credentials:');
    console.log('  Admin: admin@example.com / password');
    console.log('  User:  user@example.com / password');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
