import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Loader2, TrendingUp, BookOpen, Users, BarChart3, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await adminAPI.getAnalytics();
      console.log('API Response:', res);
      console.log('Response data:', res.data);
      const analyticsData = res.data?.data || res.data;
      console.log('Analytics data:', analyticsData);
      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 text-red-500">
        {error || 'No data available'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Admin Analytics
        </h1>
        <div className="flex gap-4">
          <Link to="/admin/books" className="btn-secondary">Manage Books</Link>
          <Link to="/admin/users" className="btn-secondary">Manage Users</Link>
        </div>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{data?.stats?.totalUsers || 'Loading...'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Books</p>
            <p className="text-2xl font-bold text-slate-900">{data?.stats?.totalBooks || 'Loading...'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl">
            <Star className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Reviews</p>
            <p className="text-2xl font-bold text-slate-900">{data?.stats?.totalReviews || 'Loading...'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Genres */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Trending Genres
          </h2>
          <div className="space-y-4">
            {data?.trendingGenres?.map((genre, index) => (
              <div key={genre.genre} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-900">{genre.genre}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{genre.count} Reviews</p>
                  <p className="text-xs text-slate-500">{genre.rating} Avg Rating</p>
                </div>
              </div>
            ))}
            {data.trendingGenres.length === 0 && (
              <p className="text-slate-500 text-center">No review data available.</p>
            )}
          </div>
        </div>

        {/* Central Books */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-amber-500" />
            Most Recommended Books (Central)
          </h2>
          <div className="space-y-4">
            {data?.centralBooks?.map((book, index) => (
              <div key={book.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                  {index + 1}
                </span>
                <img 
                  src={book.coverImageUrl || '/placeholder-book.jpg'} 
                  alt={book.title} 
                  className="w-12 h-16 object-cover rounded shadow-sm"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 line-clamp-1">{book.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900">{book.reviewCount} Reviews</p>
                  <p className="text-xs text-amber-600 font-medium">{book.rating} ★</p>
                </div>
              </div>
            ))}
            {data.centralBooks.length === 0 && (
              <p className="text-slate-500 text-center">No review data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
