import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/requests/me?type=received&status=pending')
        .then(res => setPendingCount(res.data.count || 0))
        .catch(() => {});
    }
  }, [user]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Find Partners', path: '/find-partners', icon: '🔍' },
    { name: 'Communities', path: '/communities', icon: '🏘️' },
    { name: 'Messages', path: '/messages', icon: '💬' },
    { name: 'Requests', path: '/requests', icon: '📬', badge: pendingCount },
    { name: 'History', path: '/history', icon: '🏆' },
    { name: 'My Profile', path: '/setup-profile', icon: '👤' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin/dashboard', icon: '🛡️' });
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-sm shadow-sm">
                🏸
              </div>
              <span className="font-bold text-gray-900 tracking-tight text-lg">LocalSports</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 relative
                      ${isActive 
                        ? 'bg-brand-50 text-brand-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <span className="opacity-80">{link.icon}</span>
                    {link.name}
                    {link.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white px-1 shadow-sm">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-gray-500 font-medium mr-2">
              {user?.name?.split(' ')[0]}
            </div>
            <button 
              onClick={logout}
              className="btn-secondary py-1.5 px-3 border-gray-200 shadow-none text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar - Fixed Bottom (App Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative
                  ${isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <div className="relative">
                  <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                    {link.icon}
                  </span>
                  {link.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold border-2 border-white px-0.5">
                      {link.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
