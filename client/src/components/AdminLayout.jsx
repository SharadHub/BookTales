import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BookOpen, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Home,
  Library,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { logout, selectAuth } from '../store/slices/authSlice';

function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    dispatch(logout());
    navigate('/');
    setShowLogoutModal(false);
  };

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: BarChart3,
      exact: true
    },
    { 
      path: '/admin/books', 
      label: 'Books', 
      icon: Library,
      exact: true
    },
    { 
      path: '/admin/books/new', 
      label: 'Add Book', 
      icon: BookOpen 
    },
    { 
      path: '/admin/users', 
      label: 'Users', 
      icon: Users 
    },
  ];

  // Check if we're on a nested route like /admin/books/edit/:id
  const isEditRoute = location.pathname.includes('/admin/books/edit/');
  const isUserEditRoute = location.pathname.includes('/admin/users/edit/');

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transition-all transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4 mx-auto">
              <LogOut size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">Confirm Logout</h3>
              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to logout?
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-700 px-6 flex-shrink-0">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-lg font-bold">BookTales</span>
                <span className="block text-xs text-slate-400">Admin Panel</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto custom-scrollbar">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
                {location.pathname === item.path && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-700 p-4 flex-shrink-0">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              
              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center text-sm text-slate-500">
                <Link to="/admin" className="hover:text-primary">Admin</Link>
                {(isEditRoute || isUserEditRoute || location.pathname !== '/admin') && (
                  <>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="text-slate-900">
                      {isEditRoute ? 'Edit Book' : 
                       isUserEditRoute ? 'Edit User' : 
                       location.pathname === '/admin/books/new' ? 'Add Book' :
                       location.pathname === '/admin/users' ? 'Users' :
                       location.pathname === '/admin/users/new' ? 'Add User' :
                       location.pathname === '/admin/books' ? 'Books' :
                       'Dashboard'}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:inline">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
