import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import OrganizationPage from './pages/OrganizationPage';
import AssetDirectoryPage from './pages/AssetDirectoryPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AssetRegisterPage from './pages/AssetRegisterPage';
import AllocationPage from './pages/AllocationPage';
import BookingPage from './pages/BookingPage';
import MaintenancePage from './pages/MaintenancePage';
import AuditPage from './pages/AuditPage';
import ReportsPage from './pages/ReportsPage';
import NotificationPage from './pages/NotificationPage';
import ActivityLogPage from './pages/ActivityLogPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/organization" element={
                <ProtectedRoute roles={['ADMIN']}><OrganizationPage /></ProtectedRoute>
              } />
              <Route path="/assets" element={<AssetDirectoryPage />} />
              <Route path="/assets/:id" element={<AssetDetailPage />} />
              <Route path="/assets/register" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER']}><AssetRegisterPage /></ProtectedRoute>
              } />
              <Route path="/allocations" element={<AllocationPage />} />
              <Route path="/bookings" element={<BookingPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/audits" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER']}><AuditPage /></ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute roles={['ADMIN', 'ASSET_MANAGER']}><ReportsPage /></ProtectedRoute>
              } />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/activity-log" element={
                <ProtectedRoute roles={['ADMIN']}><ActivityLogPage /></ProtectedRoute>
              } />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
