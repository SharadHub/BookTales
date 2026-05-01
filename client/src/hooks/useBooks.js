import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBooks,
  fetchTrendingBooks as fetchTrendingBooksThunk,
  fetchDiscoverBooks as fetchDiscoverBooksThunk,
  fetchBookById,
  fetchRecommendations as fetchRecommendationsThunk,
  searchBooks as searchBooksThunk,
  setSearchQuery,
  setSelectedFilters,
  setPage,
  setLimit,
  clearBookError,
  selectBooks
} from '../store/slices/bookSlice';

// Custom hook for books functionality
export const useBooks = (initialParams = {}) => {
  const dispatch = useDispatch();
  const {
    books,
    loading,
    error,
    pagination,
    searchQuery,
    selectedFilters,
    isOnline
  } = useSelector(selectBooks);

  // Fetch books on mount and when filters / page change
  useEffect(() => {
    const params = { ...initialParams, ...selectedFilters };
    if (searchQuery) {
      dispatch(searchBooksThunk({ query: searchQuery, filters: params }));
    } else {
      dispatch(fetchBooks(params));
    }
  }, [pagination.page, pagination.limit, selectedFilters, searchQuery]);

  const handleSearch = useCallback((query) => {
    dispatch(setSearchQuery(query));
    dispatch(setPage(1));
  }, [dispatch]);

  const handleFilterChange = useCallback((filters) => {
    dispatch(setSelectedFilters(filters));
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const handleLimitChange = useCallback((limit) => {
    dispatch(setLimit(limit));
  }, [dispatch]);

  const refresh = useCallback(() => {
    const params = { ...initialParams, ...selectedFilters };
    if (searchQuery) {
      dispatch(searchBooksThunk({ query: searchQuery, filters: params }));
    } else {
      dispatch(fetchBooks(params));
    }
  }, [dispatch, searchQuery, selectedFilters, initialParams]);

  const clearError = useCallback(() => {
    dispatch(clearBookError());
  }, [dispatch]);

  return {
    books,
    loading,
    error,
    pagination,
    searchQuery,
    selectedFilters,
    isOnline,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
    refresh,
    clearError
  };
};

// Custom hook for trending books
export const useTrendingBooks = (limit = 10) => {
  const dispatch = useDispatch();
  const { trendingBooks, loading, error } = useSelector(selectBooks);

  useEffect(() => {
    dispatch(fetchTrendingBooksThunk(limit));
  }, [dispatch, limit]);

  return { trendingBooks, loading, error };
};

// Custom hook for discover books
export const useDiscoverBooks = (limit = 12) => {
  const dispatch = useDispatch();
  const { discoverBooks, loading, error } = useSelector(selectBooks);

  useEffect(() => {
    dispatch(fetchDiscoverBooksThunk(limit));
  }, [dispatch, limit]);

  return { discoverBooks, loading, error };
};

// Custom hook for a single book + recommendations
export const useSingleBook = (bookId) => {
  const dispatch = useDispatch();
  const { currentBook, recommendations, loading, error } = useSelector(selectBooks);

  useEffect(() => {
    if (bookId) {
      dispatch(fetchBookById(bookId));
      dispatch(fetchRecommendationsThunk({ bookId }));
    }
  }, [dispatch, bookId]);

  return {
    book: currentBook,
    recommendations,
    loading,
    error
  };
};
