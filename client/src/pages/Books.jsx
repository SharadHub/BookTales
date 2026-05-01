import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import { Loader2 } from 'lucide-react';

function Books() {
  const [searchParams] = useSearchParams();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Read search query from URL parameters
  const searchQuery = searchParams.get('search') || '';

  const {
    books,
    loading,
    error,
    pagination,
    handleSearch,
    handlePageChange,
    handleLimitChange,
    clearError
  } = useBooks({ search: searchQuery });

  // Update search query when URL changes
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      // Clear search query in context when URL has no search parameters
      handleSearch('');
    }
  }, [searchQuery]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading books...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-red-50 border border-red-200 p-8 text-center text-red-600 shadow-sm" role="alert">
          <p className="font-semibold">Error loading books</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={clearError}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto" aria-labelledby="books-heading">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 id="books-heading" className="text-3xl font-semibold text-slate-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'BookTales'}
          </h1>
          <p className="mt-1 text-slate-600">
            {searchQuery ? `Found ${books.length} books` : 'Discover your favourite books here...'}
          </p>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm" role="alert">
          {searchQuery ? `No books found for "${searchQuery}". Try another search.` : 'No books found.'}
        </div>
      ) : (
        <section aria-labelledby="books-collection">
          <h2 id="books-collection" className="sr-only">Book Collection</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Book collection">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onClick={() => handleBookClick(book)}
              />
            ))}
          </div>
        </section>
      )}

      <BookModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}

export default Books;
