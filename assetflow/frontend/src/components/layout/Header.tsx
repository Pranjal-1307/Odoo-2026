import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationCount } from '../../hooks/useNotifications';
import { Bell, Search, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useNotificationCount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/organization')) return 'Organization Management';
    if (path.startsWith('/assets/register')) return 'Register New Asset';
    if (path.startsWith('/assets/')) return 'Asset Details';
    if (path.startsWith('/assets')) return 'Asset Directory';
    if (path.startsWith('/allocations')) return 'Asset Allocations';
    if (path.startsWith('/bookings')) return 'Resource Bookings';
    if (path.startsWith('/maintenance')) return 'Maintenance & Repairs';
    if (path.startsWith('/audits')) return 'Audit Cycles';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/notifications')) return 'Notification Center';
    if (path.startsWith('/activity-log')) return 'System Activity Logs';
    return 'AssetFlow';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="h-18 bg-white border-b border-surface-200 flex items-center justify-between px-8 shadow-sm relative z-30">
      {/* Page Title */}
      <h1 className="text-xl font-bold text-surface-900 leading-none">
        {getTitle()}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-6">
        {/* Search bar placeholder */}
        <div className="relative w-64 hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Global asset search..."
            className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none transition duration-150"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value;
                if (query) navigate(`/assets?search=${encodeURIComponent(query)}`);
              }
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-xl transition cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-xl transition"
        >
          <Bell size={20} />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white animate-pulse">
              {count}
            </span>
          )}
        </Link>

        {/* Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <div className="h-9 w-9 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center border border-brand-100 font-bold text-sm shadow-inner uppercase">
                {user.name.substring(0, 2)}
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl border border-surface-200 shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-surface-100">
                    <p className="text-sm font-bold text-surface-900">{user.name}</p>
                    <p className="text-xs text-surface-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition"
                  >
                    <Bell size={16} />
                    <span>Notification Center</span>
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-surface-100 mt-1 pt-2 cursor-pointer font-medium"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
