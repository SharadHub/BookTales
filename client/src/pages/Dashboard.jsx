import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { dashboardAPI } from '../services/api';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import { Loader2, Star, BookOpen, Sparkles, Heart, Users } from 'lucide-react';
import { selectAuth } from '../store/slices/authSlice';

function Dashboard() {
  const { user } = useSelector(selectAuth);
  const [reviews, setReviews] = useState([]);
  const [contentRecommendations, setContentRecommendations] = useState([]);
  const [collaborativeRecommendations, setCollaborativeRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reviewsRes, recommendationsRes] = await Promise.all([
        dashboardAPI.getData(),
        dashboardAPI.getRecommendations()
      ]);
      
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data.filter(r => r.book) : []);
      
      // Handle the new recommendation format
      const recData = recommendationsRes.data;
      if (recData) {
        setContentRecommendations((recData.basedOnHistory || []).filter(book => book && book._id));
        setCollaborativeRecommendations((recData.basedOnSimilarUsers || []).filter(book => book && book._id));
      } else {
        setContentRecommendations([]);
        setCollaborativeRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setReviews([]);
      setContentRecommendations([]);
      setCollaborativeRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Reading Taste Section */}
      {user?.favoriteGenres?.length > 0 && (
        <section aria-labelledby="taste-heading" className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-pink-300 fill-pink-300" />
            <h2 id="taste-heading" className="text-2xl font-bold">Your Reading Taste</h2>
          </div>
          <p className="text-primary-light/80 mb-6 font-medium">Based on your profile preferences</p>
          <div className="flex flex-wrap gap-3">
            {user.favoriteGenres.map((genre) => (
              <span key={genre} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 shadow-sm">
                {genre}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* My Reviews Section */}
      <section aria-labelledby="reviews-heading">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-6 w-6 text-amber-500" />
          <h2 id="reviews-heading" className="text-2xl font-semibold text-slate-900">My Reviews</h2>
        </div>
        
        {reviews.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-neutral-dark shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p>You haven't reviewed any books yet.</p>
            <p className="text-sm mt-1">Browse books and share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review._id}
                className="card flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBookClick(review.book)}
              >
                <img
                  src={review.book.coverImageUrl || '/placeholder-book.jpg'}
                  alt={review.book.title}
                  className="h-24 w-16 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{review.book.title}</h3>
                  <p className="text-sm text-neutral-dark">{review.book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-sm text-slate-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.reviewText && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{review.reviewText}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* Content-Based Section */}
      {contentRecommendations.length > 0 && (
        <section aria-labelledby="content-rec-heading">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 id="content-rec-heading" className="text-2xl font-semibold text-slate-900">Because you read...</h2>
          </div>
          <p className="text-slate-600 mb-4">Books similar to your favorites</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {contentRecommendations.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onClick={() => handleBookClick(book)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Collaborative Section */}
      {collaborativeRecommendations.length > 0 && (
        <section aria-labelledby="collab-rec-heading">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 id="collab-rec-heading" className="text-2xl font-semibold text-slate-900">People with your taste liked</h2>
          </div>
          <p className="text-neutral-dark mb-4">Highly rated by readers like you</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {collaborativeRecommendations.map((book) => (
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
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
