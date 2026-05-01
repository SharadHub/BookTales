import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';

function PrivateRoute({ children, checkOnboarding = false }) {
  const { user, loading } = useSelector(selectAuth);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (checkOnboarding && user.role !== 'admin' && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return children;
}

export default PrivateRoute;
