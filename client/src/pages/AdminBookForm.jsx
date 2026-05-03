import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Loader2, ArrowLeft, Upload, ChevronDown, ChevronUp } from 'lucide-react';

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field appearance-none w-full text-left flex items-center justify-between py-1.5"
        required={required}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange({ target: { name: 'category', value: option.value } });
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors ${
                option.value === value ? 'bg-primary text-white' : 'text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Fantasy',
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
    category: '',
    isbn: '',
    publishedYear: '',
    description: '',
    coverImageUrl: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [coverImageType, setCoverImageType] = useState('file'); // 'file' or 'url'
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
          category: book.genre || book.category || '',
          isbn: book.isbn || '',
          publishedYear: book.publishedYear || '',
          description: book.description || '',
          coverImageUrl: book.coverImageUrl || ''
        });
        setPreviewUrl(book.coverImageUrl);
        // Set cover image type based on whether it's a URL or uploaded file
        if (book.coverImageUrl && book.coverImageUrl.startsWith('http')) {
          setCoverImageType('url');
        }
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
      setFormData({ ...formData, coverImageUrl: '' });
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, coverImageUrl: url });
    setPreviewUrl(url);
    setCoverImage(null);
  };

  const handleCoverTypeChange = (type) => {
    setCoverImageType(type);
    if (type === 'file') {
      setFormData({ ...formData, coverImageUrl: '' });
      setPreviewUrl('');
    } else {
      setCoverImage(null);
    }
  };

  const validate = () => {
    const errs = [];
    if (!formData.title) errs.push('Title is required');
    if (!formData.author) errs.push('Author is required');
    if (!formData.category) errs.push('Category is required');
    if (!formData.isbn) errs.push('ISBN is required');
    if (!formData.publishedYear || isNaN(formData.publishedYear)) {
      errs.push('Published year must be a number');
    }
    if (!isEdit && !coverImage && !formData.coverImageUrl) {
      errs.push('Cover image is required (either upload file or provide URL)');
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

                {/* Cover Image Type Selection */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCoverTypeChange('file')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      coverImageType === 'file'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCoverTypeChange('url')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      coverImageType === 'url'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {/* File Upload Section */}
                {coverImageType === 'file' && (
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
                )}

                {/* URL Input Section */}
                {coverImageType === 'url' && (
                  <div className="w-60">
                    <div className="h-[360px] w-60 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden relative shadow-sm">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-[300px] w-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            setPreviewUrl('');
                          }}
                        />
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                          <div className="text-center">
                            <div className="p-4 rounded-full bg-white shadow-sm border border-slate-100 mb-3">
                              <Upload size={28} className="text-slate-400" />
                            </div>
                            <span className="text-sm">Image preview</span>
                          </div>
                        </div>
                      )}
                      <div className="p-3 border-t border-slate-200">
                        <input
                          type="url"
                          name="coverImageUrl"
                          value={formData.coverImageUrl}
                          onChange={handleUrlChange}
                          placeholder="Enter image URL..."
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-1">
                  {coverImageType === 'file' 
                    ? 'Recommended size: 600x900px. JPG, PNG or WebP.'
                    : 'Provide a direct link to the book cover image.'
                  }
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Book Information */}
          <div className="lg:col-span-8 lg:border-l lg:border-slate-100 lg:pl-12">
            <section className="space-y-6">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Book Information</h2>

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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <CustomDropdown
                  value={formData.category}
                  onChange={handleChange}
                  options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                  placeholder="Select Category"
                  required
                />
              </div>

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
