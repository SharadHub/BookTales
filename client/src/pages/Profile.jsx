import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, selectAuth, clearAuthError } from '../store/slices/authSlice';
import { Loader2, User, Mail, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 
  'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help',
  'Business', 'Technology', 'Art', 'Poetry', 'Drama', 'Adventure',
  'Horror', 'Young Adult', 'Children', 'Cooking', 'Travel', 'Philosophy'
];

function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(selectAuth);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [selectedGenres, setSelectedGenres] = useState(user?.favoriteGenres || []);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
      });
      setSelectedGenres(user.favoriteGenres || []);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
    setLocalError('');
  };

  const toggleGenre = (genre) => {
    setSuccess(false);
    setLocalError('');
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      setLocalError('You can select up to 5 genres.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setLocalError('');

    if (selectedGenres.length < 3) {
      setLocalError('Please select at least 3 favorite genres.');
      return;
    }

    try {
      await dispatch(updateProfile({
        ...formData,
        favoriteGenres: selectedGenres
      })).unwrap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-neutral-dark font-medium">Manage your personal information and reading preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {(error || localError) && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <p>{localError || error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 size={16} />
                <p>Profile updated successfully!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Genres Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  Favorite Genres
                </h2>
                <p className="text-sm text-neutral-dark">Choose 3-5 genres you enjoy most</p>
              </div>
              <span className={`text-sm font-medium ${selectedGenres.length < 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                {selectedGenres.length}/5 selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left border ${
                    selectedGenres.includes(genre)
                      ? 'bg-primary text-white shadow-md border-primary'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {selectedGenres.length > 0 && (
              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Selection</p>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-primary-soft text-primary font-bold text-xs rounded-full border border-primary-light/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
