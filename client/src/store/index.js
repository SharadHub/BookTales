import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookReducer from './slices/bookSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
