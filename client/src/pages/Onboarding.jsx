import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, selectAuth } from '../store/slices/authSlice';
import { Loader2, BookOpen, Sparkles } from 'lucide-react';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 
  'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help',
  'Business', 'Technology', 'Art', 'Poetry', 'Drama', 'Adventure',
  'Horror', 'Young Adult', 'Children', 'Cooking', 'Travel', 'Philosophy'
];

function Onboarding() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      navigate('/books');
    }
  }, [user, navigate]);

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedGenres.length < 3) {
      setError('Please select at least 3 favorite genres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await dispatch(updateProfile({ 
        favoriteGenres: selectedGenres, 
        hasCompletedOnboarding: true 
      })).unwrap();
      navigate('/books');
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" aria-labelledby="onboarding-heading">
      <div className="max-w-2xl w-full">
        <section className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 id="onboarding-heading" className="text-3xl font-bold text-slate-900 mb-2">Welcome to BookTales!</h1>
          <p className="text-lg text-slate-600 mb-2">Let's personalize your reading experience</p>
          <p className="text-sm text-slate-500">Select 3-5 genres you love to get better recommendations</p>
        </section>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-slate-900">Your Favorite Genres</label>
              <span className="text-sm text-slate-500">
                {selectedGenres.length}/5 selected
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  disabled={!selectedGenres.includes(genre) && selectedGenres.length >= 5}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedGenres.includes(genre)
                      ? 'bg-primary text-white shadow-md transform scale-105 border-primary'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {selectedGenres.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-blue-900">Your selections:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-primary-soft text-primary text-sm font-bold rounded-full border border-primary-light/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading || selectedGenres.length < 3}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
