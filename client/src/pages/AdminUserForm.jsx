import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Loader2, ArrowLeft } from 'lucide-react';

function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await adminAPI.getUsers();
      const user = res.data.find(u => u._id === id);
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: '',
          role: user.role
        });
      }
    } catch (err) {
      setErrors(['Failed to load user']);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = [];
    if (!formData.username) errs.push('Username is required');
    if (!formData.email || !formData.email.includes('@')) {
      errs.push('Valid email is required');
    }
    if (!isEdit && !formData.password) {
      errs.push('Password is required for new users');
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      const data = { ...formData };
      if (isEdit && !data.password) {
        delete data.password;
      }

      if (isEdit) {
        await adminAPI.updateUser(id, data);
      } else {
        await adminAPI.createUser(data);
      }
      
      navigate('/admin/users');
    } catch (err) {
      const errorData = err.response?.data?.error;
      if (errorData?.details) {
        setErrors(errorData.details.map(d => d.message));
      } else {
        setErrors([errorData?.message || err.message || 'Failed to save user']);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/users')}
        className="mb-6 flex items-center text-sm text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </button>

      <h1 className="text-3xl font-semibold text-slate-900 mb-8">
        {isEdit ? 'Edit User' : 'Add New User'}
      </h1>

      {errors.length > 0 && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Username *</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input-field mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password {isEdit && '(leave blank to keep unchanged)'}
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field mt-1"
            required={!isEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field mt-1"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminUserForm;
