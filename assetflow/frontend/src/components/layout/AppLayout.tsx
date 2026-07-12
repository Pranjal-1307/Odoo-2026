import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    const titleMap: Record<string, string> = {
      '/dashboard': 'Dashboard | AssetFlow ERP',
      '/organization': 'Organization Directory | AssetFlow ERP',
      '/assets/register': 'Register Asset | AssetFlow ERP',
      '/assets': 'Asset Directory | AssetFlow ERP',
      '/allocations': 'Allocations Tracking | AssetFlow ERP',
      '/bookings': 'Resource Bookings | AssetFlow ERP',
      '/maintenance': 'Maintenance Kanban | AssetFlow ERP',
      '/audits': 'Audits Workspace | AssetFlow ERP',
      '/reports': 'Reports & Analytics | AssetFlow ERP',
      '/notifications': 'Notification Center | AssetFlow ERP',
      '/activity-log': 'System Activity Logs | AssetFlow ERP',
    };

    const path = location.pathname;
    let title = 'AssetFlow ERP';
    for (const key of Object.keys(titleMap)) {
      if (path.startsWith(key)) {
        title = titleMap[key];
        break;
      }
    }
    document.title = title;
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-50">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Header />

        {/* Dynamic Nested Route View */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 bg-slate-50">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
