import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Box,
  Shuffle,
  Calendar,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  Bell,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
    { label: 'Organization', path: '/organization', icon: Building2, roles: ['ADMIN'] },
    { label: 'Assets', path: '/assets', icon: Box, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
    { label: 'Allocations', path: '/allocations', icon: Shuffle, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
    { label: 'Bookings', path: '/bookings', icon: Calendar, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
    { label: 'Audits', path: '/audits', icon: ClipboardCheck, roles: ['ADMIN', 'ASSET_MANAGER'] },
    { label: 'Reports', path: '/reports', icon: TrendingUp, roles: ['ADMIN', 'ASSET_MANAGER'] },
    { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
    { label: 'Activity Log', path: '/activity-log', icon: History, roles: ['ADMIN'] },
  ];

  const filteredItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <div
      className={cn(
        "h-screen flex flex-col justify-between bg-surface-900 text-white transition-all duration-300 relative border-r border-surface-800 shadow-xl",
        isCollapsed ? "w-20" : "w-70"
      )}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-brand-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/35">
                AF
              </div>
              <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-surface-300 bg-clip-text text-transparent">
                AssetFlow
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto h-8 w-8 bg-brand-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
              AF
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-6 -right-3 h-6 w-6 bg-brand-600 rounded-full flex items-center justify-center text-white border border-surface-800 hover:bg-brand-700 hover:scale-110 transition cursor-pointer shadow-lg"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1.5 p-4 mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActive
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                      : "text-surface-400 hover:text-white hover:bg-surface-800"
                  )
                }
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Action */}
      <div className="p-4 border-t border-surface-800 bg-surface-950/45">
        {!isCollapsed && user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-surface-800 rounded-full border border-surface-700 flex items-center justify-center text-surface-300">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">{user.name}</span>
                <span className="text-xs text-surface-500 truncate capitalize">{user.role.replace('_', ' ').toLowerCase()}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-red-950/30 hover:bg-red-900/50 border border-red-900/35 hover:border-red-700 text-red-400 hover:text-white rounded-xl text-sm font-medium transition duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center mx-auto h-10 w-10 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-900/30 hover:border-red-700 text-red-400 hover:text-white transition duration-200 cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
