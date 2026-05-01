import { Outlet } from 'react-router-dom';
import Header from './Header';


function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main id="main-content" className="w-full px-4 py-8" role="main" tabIndex={-1}>
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;
