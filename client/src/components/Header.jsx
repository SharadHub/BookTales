import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, BookOpen, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { logout, selectAuth, selectIsAdmin } from '../store/slices/authSlice';

function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const params = new URLSearchParams(location.search);
      params.set('search', search);
      navigate(`/books?${params.toString()}`);
    } else {
      navigate('/books');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm" role="banner">
      <div className="mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <Link to="/" className="flex items-center gap-3 focus-visible:focus" aria-label="BookTales home">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white" aria-hidden="true">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900">BookTales</span>
          </Link>

          <form onSubmit={handleSearch} className="flex flex-1 max-w-xl items-center gap-2" role="search">
            <div className="flex-1">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Title, Author, or Genre"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus-visible:focus"
                aria-label="Search books"
              />
            </div>
            <button type="submit" className="btn-primary focus-visible:focus" aria-label="Submit search">
              <Search size={18} className="mr-2" aria-hidden="true" />
              Search
            </button>
          </form>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-neutral-dark" role="navigation" aria-label="Main navigation">
          <Link to="/books" className="hover:text-primary flex items-center gap-1 focus-visible:focus" aria-label="Browse books">
            <BookOpen size={16} aria-hidden="true" />
            Browse
          </Link>
          
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hover:text-primary flex items-center gap-1 focus-visible:focus" aria-label="Admin dashboard">
                  <Shield size={16} aria-hidden="true" />
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="hover:text-primary flex items-center gap-1 focus-visible:focus" aria-label="User dashboard">
                <LayoutDashboard size={16} aria-hidden="true" />
                Dashboard
              </Link>
              <Link to="/profile" className="hover:text-primary flex items-center gap-1 focus-visible:focus" aria-label="User profile">
                <User size={16} aria-hidden="true" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 flex items-center gap-1 focus-visible:focus"
                aria-label="Logout from account"
              >
                <LogOut size={16} aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary flex items-center gap-1 focus-visible:focus" aria-label="Sign in to account">
                <User size={16} aria-hidden="true" />
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
