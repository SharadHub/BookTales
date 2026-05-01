import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth, selectIsAdmin } from '../store/slices/authSlice';

function AdminRoute({ children }) {
  const { user, loading } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  
  return children;
}

export default AdminRoute;
