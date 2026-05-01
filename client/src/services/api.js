import axios from 'axios';
import pwaService from './pwaService.js';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  async (response) => {
    const isAuthOrAdmin = response.config.url.includes('/auth/') || response.config.url.includes('/admin/');
    if (response.config.method?.toLowerCase() === 'get' && !isAuthOrAdmin) {
      await pwaService.cacheResponse(response.config.url, response.data);
    }
    return response;
  },
  async (error) => {
    const networkStatus = pwaService.getNetworkStatus();
    
    if (!networkStatus.isOnline || error.code === 'NETWORK_ERROR') {
      if (error.config?.method?.toLowerCase() === 'get') {
        const cachedData = await pwaService.getCachedResponse(error.config.url);
        if (cachedData) {
          pwaService.showOfflineNotification('Showing cached data while offline');
          return Promise.resolve({ data: cachedData, status: 200, cached: true });
        }
      }
      
      if (['post', 'put', 'delete'].includes(error.config?.method?.toLowerCase())) {
        pwaService.storeOfflineAction({
          type: error.config.method.toUpperCase(),
          endpoint: error.config.url,
          data: error.config.data
        });
        pwaService.showOfflineNotification('Your action will be synced when you\'re back online');
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getTrending: (limit) => api.get('/books/trending', { params: { limit } }),
  getDiscover: () => api.get('/books/discover'),
  getRecommendations: (id) => api.get(`/books/${id}/recommendations`),
};

export const reviewsAPI = {
  getByBook: (bookId) => api.get(`/reviews/book/${bookId}`),
  create: (data) => api.post('/reviews', data),
  delete: (bookId) => api.delete(`/reviews/${bookId}`),
};

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
  getRecommendations: () => api.get('/dashboard/recommendations'),
};

export const adminAPI = {
  getBooks: () => api.get('/admin/books'),
  createBook: (data) => api.post('/admin/books', data),
  updateBook: (id, data) => api.put(`/admin/books/${id}`, data),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
