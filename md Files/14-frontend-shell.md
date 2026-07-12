# Prompt 14 — Frontend Shell (Layout, Routing, Auth, Theme, Shared Components)

## Context
You are building **AssetFlow**. The entire backend is complete (Prompts 04–13). Now build the frontend shell — the foundation that every page sits inside. This includes the app layout, sidebar navigation, routing, authentication context, API service layer, and reusable UI components.

---

## What to Build

### 1. API Service Layer

**`src/services/api.ts`** — Axios instance with interceptors:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**`src/services/auth.service.ts`**
```typescript
export const authService = {
  login: (data: LoginData) => api.post('/auth/login', data),
  signup: (data: SignupData) => api.post('/auth/signup', data),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};
```

Create similar service files for each module:
- `src/services/department.service.ts`
- `src/services/category.service.ts`
- `src/services/user.service.ts`
- `src/services/asset.service.ts`
- `src/services/allocation.service.ts`
- `src/services/booking.service.ts`
- `src/services/maintenance.service.ts`
- `src/services/audit.service.ts`
- `src/services/dashboard.service.ts`
- `src/services/reports.service.ts`
- `src/services/notification.service.ts`

Each service file exports functions mapping to the corresponding backend API endpoints.

---

### 2. TypeScript Types

**`src/types/index.ts`** — shared frontend types matching the Prisma schema:

```typescript
// Enums
export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
export type AssetStatus = 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED' | 'DISPOSED';
export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
// ... all other enums

// Models
export interface User {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  department?: Department;
  phone?: string;
  avatarUrl?: string;
}

export interface Department { ... }
export interface Category { ... }
export interface Asset { ... }
export interface AssetAllocation { ... }
export interface TransferRequest { ... }
export interface Booking { ... }
export interface MaintenanceRequest { ... }
export interface AuditCycle { ... }
export interface AuditItem { ... }
export interface Notification { ... }
export interface ActivityLog { ... }

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Dashboard
export interface DashboardKPIs {
  assetsAvailable: number;
  assetsAllocated: number;
  assetsUnderMaintenance: number;
  maintenanceToday: number;
  activeBookings: number;
  upcomingBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueReturns: number;
  totalAssets: number;
  totalEmployees: number;
  pendingMaintenanceRequests: number;
}
```

---

### 3. Auth Context

**`src/contexts/AuthContext.tsx`**

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}
```

Implementation:
- On mount, check localStorage for token and validate with `/auth/profile`
- `login`: call API, store token + user in localStorage, update state
- `signup`: call API, store token + user, update state
- `logout`: clear localStorage, redirect to `/login`
- `hasRole`: check if current user's role is in the provided list
- Wrap children with `AuthContext.Provider`

**`src/contexts/AuthProvider.tsx`** — Provider component

---

### 4. Protected Route Component

**`src/components/shared/ProtectedRoute.tsx`**

```tsx
interface Props {
  children: React.ReactNode;
  roles?: UserRole[];  // if provided, only these roles can access
}
```

- If not authenticated → redirect to `/login`
- If authenticated but wrong role → show "Access Denied" or redirect to dashboard
- If authenticated and authorized → render children

---

### 5. App Layout

**`src/components/layout/AppLayout.tsx`**

The main layout with:
- **Sidebar** (collapsible, 280px width)
- **Header** (with user info, notification bell, theme toggle)
- **Main content area** (scrollable)

**`src/components/layout/Sidebar.tsx`**

Navigation items with icons (use Lucide React icons):
```
📊 Dashboard         → /dashboard
🏢 Organization      → /organization        (Admin only)
📦 Assets            → /assets
🔄 Allocations       → /allocations
📅 Bookings          → /bookings
🔧 Maintenance       → /maintenance
📋 Audits            → /audits              (Admin, Asset Manager)
📈 Reports           → /reports             (Admin, Asset Manager)
🔔 Notifications     → /notifications
📝 Activity Log      → /activity-log        (Admin only)
```

Features:
- Active route highlighting
- Role-based menu item visibility (hide items user can't access)
- Collapse/expand toggle
- AssetFlow logo at top
- User info + logout at bottom

**`src/components/layout/Header.tsx`**

- Page title (dynamic based on route)
- Search bar (global asset search)
- Notification bell with unread count badge
- User avatar dropdown (Profile, Settings, Logout)

---

### 6. Routing

**`src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

### 7. Reusable UI Components

Build these Shadcn-inspired components in `src/components/ui/`:

**Essential (build now):**
- `Button.tsx` — primary, secondary, outline, ghost, destructive variants + sizes
- `Input.tsx` — text input with label, error state, icon support
- `Card.tsx` — container with header, content, footer sections
- `Badge.tsx` — status badges with color variants
- `Modal.tsx` — dialog/modal with overlay
- `Table.tsx` — data table with header, body, pagination
- `Select.tsx` — dropdown select with search
- `Textarea.tsx` — multiline input
- `Tabs.tsx` — tabbed navigation
- `Spinner.tsx` — loading spinner
- `EmptyState.tsx` — empty state placeholder
- `StatusBadge.tsx` — asset/booking/maintenance status with color coding
- `Toast.tsx` — toast notifications (success, error, warning, info)

**StatusBadge color mapping:**
```typescript
const statusColors: Record<string, string> = {
  // Asset Status
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  ALLOCATED: 'bg-blue-100 text-blue-800',
  RESERVED: 'bg-amber-100 text-amber-800',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800',
  LOST: 'bg-red-100 text-red-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  DISPOSED: 'bg-gray-200 text-gray-600',
  // Transfer/Maintenance Status
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  // Booking Status
  UPCOMING: 'bg-indigo-100 text-indigo-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  // General
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
};
```

---

### 8. Custom Hooks

**`src/hooks/useApi.ts`** — generic data fetching hook:
```typescript
function useApi<T>(fetcher: () => Promise<AxiosResponse<ApiResponse<T>>>, deps: any[]) {
  // Returns: { data, isLoading, error, refetch }
}
```

**`src/hooks/useAuth.ts`** — convenience hook:
```typescript
export function useAuth() {
  return useContext(AuthContext);
}
```

**`src/hooks/useNotifications.ts`** — notification polling:
```typescript
// Polls unread count every 30 seconds
export function useNotificationCount() {
  // Returns: { count, refetch }
}
```

---

### 9. Toast/Notification Context

**`src/contexts/ToastContext.tsx`**

Simple toast notification system:
```typescript
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}
```

Display toasts in the bottom-right corner with auto-dismiss after 5 seconds.

---

### 10. Placeholder Pages

Create minimal placeholder pages for all routes in `src/pages/`:
```
LoginPage.tsx
SignupPage.tsx
ForgotPasswordPage.tsx
DashboardPage.tsx
OrganizationPage.tsx
AssetDirectoryPage.tsx
AssetDetailPage.tsx
AssetRegisterPage.tsx
AllocationPage.tsx
BookingPage.tsx
MaintenancePage.tsx
AuditPage.tsx
ReportsPage.tsx
NotificationPage.tsx
ActivityLogPage.tsx
NotFoundPage.tsx
```

Each placeholder should just render:
```tsx
export default function DashboardPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1><p>Coming soon...</p></div>;
}
```

---

## Design Requirements

### Color Palette
- Primary: Blue (`#2563eb` / brand-600)
- Background: White / Slate-50
- Sidebar: Dark (`#0f172a` / surface-900) with light text
- Accents: Emerald for success, Amber for warning, Red for destructive

### Typography
- Font: Inter (from Google Fonts, already imported in index.css)
- Headings: 600–700 weight
- Body: 400 weight
- Small/labels: 500 weight, slightly muted color

### Animations
- Page transitions: fade-in (0.3s)
- Sidebar hover: subtle background transition
- Cards: subtle shadow on hover
- Modals: scale + fade-in

---

## Verification

```bash
cd assetflow/frontend && npm run dev
```

- App loads at `http://localhost:3000`
- Unauthenticated users are redirected to `/login`
- Login with seed data credentials → redirected to `/dashboard`
- Sidebar shows role-appropriate menu items
- All placeholder pages are accessible via sidebar navigation
- Notification bell shows unread count
- Logout clears session and redirects to login

---

## What's Next
Prompt 15 will build the Login, Signup, and Forgot Password pages.
