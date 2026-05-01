import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Loader2, ArrowLeft, Upload, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Fiction', 'Non-Fiction'];
const GENRES = [
  'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Business', 'Technology',
  'Art', 'Poetry', 'Drama', 'Adventure', 'Horror', 'Young Adult',
  'Children', 'Cooking', 'Travel', 'Philosophy'
];

function AdminBookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    genre: '',
    description: '',
    publishedYear: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await adminAPI.getBooks();
      const book = res.data.find(b => b._id === id);
      if (book) {
        setFormData({
          title: book.title,
          author: book.author,
          isbn: book.isbn || '',
          category: book.category,
          genre: book.genre || '',
          description: book.description || '',
          publishedYear: book.publishedYear || ''
        });
        setPreviewUrl(book.coverImageUrl);
      }
    } catch (err) {
      setErrors(['Failed to load book']);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = [];
    if (!formData.title) errs.push('Title is required');
    if (!formData.author) errs.push('Author is required');
    if (!formData.isbn) errs.push('ISBN is required');
    if (!formData.category) errs.push('Category is required');
    if (!formData.publishedYear || isNaN(formData.publishedYear)) {
      errs.push('Published year must be a number');
    }
    if (!isEdit && !coverImage) errs.push('Cover image is required');
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
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (coverImage) {
        data.append('coverImage', coverImage);
      }

      if (isEdit) {
        await adminAPI.updateBook(id, data);
      } else {
        await adminAPI.createBook(data);
      }

      navigate('/admin/books');
    } catch (err) {
      const errorData = err.response?.data?.error;
      if (errorData?.details) {
        setErrors(errorData.details.map(d => d.message));
      } else {
        setErrors([errorData?.message || err.message || 'Failed to save book']);
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
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/admin/books')}
        className="mb-6 flex items-center text-sm text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Books
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEdit ? 'Edit Book' : 'Add New Book'}
        </h1>
        <p className="text-slate-500 mt-1">Fill in the details to {isEdit ? 'update the' : 'create a new'} book entry.</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Visual Appearance */}
          <div className="lg:col-span-4">
            <section>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Visual Appearance</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cover Image *</label>
                </div>

                <label className="relative group block w-60 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="h-[360px] w-60 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all overflow-hidden relative shadow-sm">
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                          <Upload size={24} className="mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                          <span className="text-sm font-semibold">Change Cover</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-6 rounded-full bg-white shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold group-hover:text-primary">Upload cover</span>
                      </>
                    )}
                  </div>
                </label>
                <p className="text-xs text-slate-500 mt-1">Recommended size: 600x900px. JPG, PNG or WebP.</p>
              </div>
            </section>
          </div>

          {/* Right Column: Book Information */}
          <div className="lg:col-span-8 lg:border-l lg:border-slate-100 lg:pl-12">
            <section className="space-y-6">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Book Information</h2>


              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="input-field appearance-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
                  <div className="relative">
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="input-field appearance-none"
                    >
                      <option value="">Select Genre</option>
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    name="title"
                    placeholder="Enter book title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author *</label>
                  <input
                    name="author"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ISBN *</label>
                  <input
                    name="isbn"
                    placeholder="e.g. 9780..."
                    value={formData.isbn}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Published Year *</label>
                  <input
                    name="publishedYear"
                    type="number"
                    placeholder="e.g. 2024"
                    value={formData.publishedYear}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Write a short summary of the book..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                />
              </div>
            </section>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-slate-100 mt-12">
          <button
            type="button"
            onClick={() => navigate('/admin/books')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 py-3"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEdit ? 'Save Changes' : 'Create Book'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminBookForm;
