import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { booksAPI } from '../../services/api';
import pwaService from '../../services/pwaService';

const initialState = {
  books: [],
  trendingBooks: [],
  discoverBooks: [],
  currentBook: null,
  recommendations: [],
  filters: {
    categories: [],
    genres: [],
    authors: []
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  searchQuery: '',
  selectedFilters: {
    category: '',
    genre: '',
    author: '',
    sort: 'createdAt',
    order: 'desc'
  },
  isOnline: navigator.onLine
};

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().books;
      const mergedParams = { ...state.selectedFilters, ...state.pagination, ...params };
      const response = await booksAPI.getAll(mergedParams);
      await pwaService.cacheResponse('books:list', response.data);
      return {
        books: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      const state = getState().books;
      if (!state.isOnline) {
        const cachedData = await pwaService.getCachedResponse('books:list');
        if (cachedData) {
          return cachedData;
        }
      }
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTrendingBooks = createAsyncThunk(
  'books/fetchTrendingBooks',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getTrending(limit);
      await pwaService.cacheResponse('books:trending', response.data.data);
      return response.data.data.books;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchDiscoverBooks = createAsyncThunk(
  'books/fetchDiscoverBooks',
  async (limit = 12, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getDiscover(limit);
      await pwaService.cacheResponse('books:discover', response.data.data);
      return response.data.data.books;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getById(bookId);
      await pwaService.cacheResponse(`book:${bookId}`, response.data.data);
      return response.data.data.book;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'books/fetchRecommendations',
  async ({ bookId, limit = 6 }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getRecommendations(bookId, limit);
      return response.data.data.books;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchFilters = createAsyncThunk(
  'books/fetchFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getAll(); // Using the existing logic
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getAll({ search: query, ...filters });
      return {
        books: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedFilters: (state, action) => {
      state.selectedFilters = { ...state.selectedFilters, ...action.payload };
      state.pagination.page = 1; // Reset to page 1 on filter change
    },
    updateBook: (state, action) => {
      state.books = state.books.map(book =>
        book._id === action.payload._id ? action.payload : book
      );
      if (state.currentBook?._id === action.payload._id) {
        state.currentBook = action.payload;
      }
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    clearBookError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchTrendingBooks
      .addCase(fetchTrendingBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingBooks = action.payload;
      })
      .addCase(fetchTrendingBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchDiscoverBooks
      .addCase(fetchDiscoverBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscoverBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.discoverBooks = action.payload;
      })
      .addCase(fetchDiscoverBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchRecommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchFilters
      .addCase(fetchFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.filters = action.payload;
      })
      .addCase(fetchFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // searchBooks
      .addCase(searchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSearchQuery, 
  setSelectedFilters, 
  updateBook, 
  setPage, 
  setLimit, 
  setOnlineStatus, 
  clearBookError 
} = bookSlice.actions;

export const selectBooks = (state) => state.books;

export default bookSlice.reducer;
