import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reviewsAPI, booksAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';
import { X, Star, Loader2, Sparkles } from 'lucide-react';

function BookModal({ book, isOpen, onClose }) {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [aggregate, setAggregate] = useState({ averageRating: 0, reviewCount: 0 });
  const [currentUserReview, setCurrentUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [similarBooks, setSimilarBooks] = useState([]);

  useEffect(() => {
    if (isOpen && book) {
      fetchReviews();
      fetchSimilarBooks();
    }
  }, [isOpen, book]);

  const fetchSimilarBooks = async () => {
    if (!book?._id) return;
    try {
      const res = await booksAPI.getRecommendations(book._id);
      setSimilarBooks((res.data || []).filter(b => b && b._id));
    } catch (err) {
      console.error('Error fetching similar books:', err);
      setSimilarBooks([]);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const fetchReviews = async () => {
    if (!book?._id) return;
    setLoading(true);
    try {
      const res = await reviewsAPI.getByBook(book._id);
      setReviews(res.data.reviews || []);
      setAggregate(res.data.aggregate || { averageRating: 0, reviewCount: 0 });
      setCurrentUserReview(res.data.currentUserReview);

      if (res.data.currentUserReview) {
        setRating(res.data.currentUserReview.rating);
        setReviewText(res.data.currentUserReview.reviewText || '');
      } else {
        setRating(0);
        setReviewText('');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Reset to default values on error
      setReviews([]);
      setAggregate({ averageRating: 0, reviewCount: 0 });
      setCurrentUserReview(null);
      setRating(0);
      setReviewText('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      setMessage('Please select a rating from 1 to 5 stars.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const res = await reviewsAPI.create({
        bookId: book._id,
        rating,
        reviewText
      });

      setAggregate(res.data.aggregate || { averageRating: 0, reviewCount: 0 });
      await fetchReviews();

      // Show success toast and redirect
      toast.success('✓ Review given successfully!', {
        autoClose: 1000
      });
      setTimeout(() => {
        navigate('/books');
        onClose();
      }, 200);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to save review.');
      toast.error(err.response?.data?.error || 'Failed to save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Delete your review?')) return;

    setSubmitting(true);
    try {
      const res = await reviewsAPI.delete(book._id);
      setAggregate(res.data.aggregate || { averageRating: 0, reviewCount: 0 });
      setCurrentUserReview(null);
      setRating(0);
      setReviewText('');
      await fetchReviews();
      setMessage('Review deleted.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < value ? 'text-amber-500' : 'text-slate-400'}>
        ★
      </span>
    ));
  };

  if (!isOpen || !book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-title"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 focus-visible:focus"
          aria-label="Close book details"
        >
          <X size={20} />
        </button>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={book.coverImageUrl || '/placeholder-book.jpg'}
              alt={`${book.title} book cover`}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 id="book-title" className="text-2xl font-semibold text-slate-900">{book.title}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-blue-700">{book.category}</p>
            {book.genre && <p className="mt-1 text-sm text-slate-600">Genre: {book.genre}</p>}
            <p className="mt-4 text-sm text-slate-600">By {book.author}</p>
            <div className="mt-4 space-y-2 text-slate-600" role="list">
              <p role="listitem"><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
              <p role="listitem"><strong>Published:</strong> {book.publishedYear || 'N/A'}</p>
              <p className="text-sm text-slate-700" role="listitem">
                <strong>Average rating:</strong> {aggregate?.reviewCount > 0 ? `${aggregate.averageRating}★` : 'Not rated yet'}
              </p>
            </div>
          </div>
        </div>

        {book.description && (
          <div className="mt-6 text-slate-700">
            <h3 className="text-lg font-semibold text-slate-900">Description</h3>
            <p className="mt-2 leading-7">{book.description}</p>
          </div>
        )}

        <div className="mt-8 space-y-6 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Community reviews</p>
              <p className="text-sm text-slate-600">See average rating and comments below.</p>
            </div>
            <div className="flex items-center gap-3" aria-label={`Average rating: ${aggregate?.averageRating || 0} out of 5 stars, ${aggregate?.reviewCount || 0} reviews`}>
              <div className="flex items-center gap-2 text-amber-500">
                <span className="text-xl font-semibold text-slate-900">{aggregate?.averageRating || 0}★</span>
              </div>
              <span className="text-sm text-slate-600">
                {aggregate?.reviewCount || 0} review{(aggregate?.reviewCount || 0) === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {user ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">Leave your rating and comment</p>
              <div className="mt-4">
                <div className="flex items-center gap-2 text-3xl" role="radiogroup" aria-label="Rating selection">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-colors hover:text-amber-400 focus-visible:focus ${star <= rating ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      aria-pressed={star <= rating}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="review-text" className="text-sm font-medium text-slate-700">Your comment</label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="input-field mt-2 focus-visible:focus"
                  placeholder="Share your thoughts..."
                  aria-describedby="review-description"
                />
                <p id="review-description" className="sr-only">Enter your review comment for this book</p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-600" role="status" aria-live="polite">{message}</span>
                <div className="flex gap-3">
                  {currentUserReview && (
                    <button
                      onClick={handleDeleteReview}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 focus-visible:focus"
                      aria-label="Delete your review"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="btn-primary focus-visible:focus"
                    aria-label={currentUserReview ? 'Update your review' : 'Submit your review'}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {currentUserReview ? 'Update review' : 'Submit review'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-700">
              <p>You must be logged in to leave a rating or comment.</p>
              <Link to="/login" className="mt-3 inline-flex rounded-2xl bg-white px-4 py-2 text-blue-700 shadow-sm hover:bg-slate-100 focus-visible:focus" aria-label="Go to login page">
                Log in now
              </Link>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8" role="status" aria-live="polite">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="sr-only">Loading reviews...</span>
            </div>
          ) : (
            <>
              {reviews.length === 0 ? (
                <div className="rounded-3xl bg-slate-100 p-6 text-slate-600">
                  No reviews yet. Be the first to rate and comment.
                </div>
              ) : (
                <div className="space-y-4" role="list" aria-label="User reviews">
                  {reviews.map((review) => (
                    <div key={review._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" role="listitem">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{review.user.username}</p>
                          <div className="mt-2 text-sm text-slate-600" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                            {renderStars(review.rating)}
                            <span className="ml-2">{review.rating} / 5</span>
                          </div>
                        </div>
                        <time className="text-xs uppercase tracking-[0.15em] text-slate-500" dateTime={review.createdAt}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      {review.reviewText && (
                        <p className="mt-4 text-slate-600 leading-7 whitespace-pre-line">
                          {review.reviewText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {similarBooks.length > 0 && (
            <div className="mt-10 border-t border-slate-200 pt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                People who liked this also liked...
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarBooks.map(similar => (
                  <div
                    key={similar._id}
                    className="group flex flex-col items-center text-center"
                  >
                    <img
                      src={similar.coverImageUrl || '/placeholder-book.jpg'}
                      alt={similar.title}
                      className="w-full aspect-[2/3] object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow mb-2"
                    />
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{similar.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{similar.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookModal;
