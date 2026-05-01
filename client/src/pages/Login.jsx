import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { Loader2, BookOpen } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center" aria-labelledby="login-heading">
      <div className="w-full max-w-md">
        <section className="card">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100" aria-hidden="true">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 id="login-heading" className="mt-4 text-2xl font-bold text-slate-900">Sign in to BookTales</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1 focus-visible:focus"
                placeholder="Enter your email"
                autoComplete="email"
                aria-describedby="email-error"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1 focus-visible:focus"
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-describedby="password-error"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full focus-visible:focus"
              aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-blue-500 focus-visible:focus" aria-label="Create a new account">
              Sign up
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
