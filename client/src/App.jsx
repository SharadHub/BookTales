import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Books from './pages/Books';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import AdminBooks from './pages/AdminBooks';
import AdminBookForm from './pages/AdminBookForm';
import AdminUsers from './pages/AdminUsers';
import AdminUserForm from './pages/AdminUserForm';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { checkAuth } from './store/slices/authSlice';
import { setOnlineStatus } from './store/slices/bookSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());

    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Books />} />
          <Route path="books" element={<Books />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={
            <PrivateRoute checkOnboarding={true}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute checkOnboarding={true}>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="onboarding" element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          } />
        </Route>

        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/books" element={
          <AdminRoute>
            <AdminLayout>
              <AdminBooks />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/books/new" element={
          <AdminRoute>
            <AdminLayout>
              <AdminBookForm />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/books/edit/:id" element={
          <AdminRoute>
            <AdminLayout>
              <AdminBookForm />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users/new" element={
          <AdminRoute>
            <AdminLayout>
              <AdminUserForm />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users/edit/:id" element={
          <AdminRoute>
            <AdminLayout>
              <AdminUserForm />
            </AdminLayout>
          </AdminRoute>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
