# BookTales - MERN Stack

A full-stack book recommendation website built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Register, login, and JWT-based authentication
- **Book Browsing**: Search and filter books by category, genre, or author
- **Reviews**: Rate books (1-5 stars) and write reviews
- **Personalized Recommendations**: Based on your favorite genre
- **Admin Dashboard**: Manage books and users (admin only)
- **Trending Books**: See the highest-rated books

## Project Structure

```
mern/
├── backend/           # Express API
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Auth, admin, upload middleware
│   ├── utils/         # Seed script
│   ├── uploads/       # Uploaded book covers
│   └── server.js      # Entry point
├── client/            # React frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   └── services/   # API services
│   └── public/         # Static assets
└── package.json       # Root package with scripts
```

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. **Install all dependencies:**
```bash
cd mern
npm run install-all
```

2. **Set up environment variables:**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Seed the database:**
```bash
npm run seed
```

4. **Run the development servers:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Login Credentials

- **Admin**: admin@example.com / password
- **User**: user@example.com / password

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/trending` - Get trending books
- `GET /api/books/:id` - Get single book

### Reviews
- `GET /api/reviews/book/:bookId` - Get book reviews
- `POST /api/reviews` - Submit review (auth)
- `DELETE /api/reviews/:bookId` - Delete review (auth)

### Dashboard
- `GET /api/dashboard` - Get user dashboard data (auth)

### Admin
- `GET /api/admin/books` - Get all books (admin)
- `POST /api/admin/books` - Create book (admin)
- `PUT /api/admin/books/:id` - Update book (admin)
- `DELETE /api/admin/books/:id` - Delete book (admin)
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/users` - Create user (admin)
- `PUT /api/admin/users/:id` - Update user (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)

## Technologies

### Backend
- Express.js
- MongoDB + Mongoose
- JWT authentication
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React 18
- React Router 6
- Tailwind CSS
- Axios
- Lucide React icons

## Migration from PHP

This MERN stack version replaces the original PHP/MySQL application with:
- MongoDB instead of MySQL
- Express REST API instead of PHP controllers
- React SPA instead of PHP templates
- JWT authentication instead of PHP sessions

## License

MIT
