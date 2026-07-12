import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-surface-200 animate-fade-in">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-surface-900">Access Denied</h2>
          <p className="mt-2 text-surface-500">You do not have permission to access this page.</p>
          <a href="/dashboard" className="mt-6 inline-block w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition duration-200">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
