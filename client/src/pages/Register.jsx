import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import { Loader2, UserPlus } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await dispatch(registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center" aria-labelledby="register-heading">
      <div className="w-full max-w-md">
        <section className="card">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h1 id="register-heading" className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Join BookTales to discover and review books
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Create a password (min 6 chars)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Register;
