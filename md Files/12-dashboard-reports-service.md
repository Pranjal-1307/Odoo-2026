# Prompt 12 — Dashboard & Reports Service

## Context
You are building **AssetFlow**. All core business modules are complete (Prompts 05–11). Now build the Dashboard KPIs and Reports/Analytics endpoints that aggregate data from all modules.

---

## What to Build

### Service — `src/services/dashboard.service.ts`

#### `getDashboardKPIs(userId, userRole)`

Returns role-appropriate KPI data:

```typescript
interface DashboardKPIs {
  assetsAvailable: number;
  assetsAllocated: number;
  assetsUnderMaintenance: number;
  maintenanceToday: number;          // requests created or resolved today
  activeBookings: number;            // bookings currently ONGOING
  upcomingBookings: number;          // bookings with status UPCOMING
  pendingTransfers: number;          // transfer requests with status PENDING
  upcomingReturns: number;           // active allocations with expectedReturn in next 7 days
  overdueReturns: number;            // active allocations with expectedReturn < now
  totalAssets: number;
  totalEmployees: number;
  pendingMaintenanceRequests: number;
}
```

**Role-specific filtering:**
- `ADMIN`: sees everything organization-wide
- `ASSET_MANAGER`: sees everything
- `DEPARTMENT_HEAD`: sees data for their department only
- `EMPLOYEE`: sees only their own allocations, bookings, requests

#### `getOverdueReturnsList()`
Return list of overdue allocations with:
- Asset details (tag, name)
- Allocated to (name, email, department)
- Expected return date
- Days overdue (calculated field)
- Sorted by most overdue first

#### `getUpcomingReturnsList()`
Return active allocations where `expectedReturn` is within the next 7 days.

#### `getRecentActivity(userId, limit = 10)`
Return recent activity logs relevant to the user (based on role).

---

### Service — `src/services/reports.service.ts`

#### `getAssetUtilizationReport(params: { startDate, endDate, categoryId?, departmentId? })`
```typescript
interface AssetUtilizationReport {
  totalAssets: number;
  utilized: number;           // assets that were allocated at least once in the period
  idle: number;               // assets never allocated in the period
  utilizationRate: number;    // percentage
  mostUsed: { asset: Asset; allocationCount: number }[];   // top 10
  leastUsed: { asset: Asset; allocationCount: number }[];  // bottom 10
}
```

#### `getMaintenanceReport(params: { startDate, endDate, categoryId? })`
```typescript
interface MaintenanceReport {
  totalRequests: number;
  resolved: number;
  pending: number;
  avgResolutionDays: number;
  byPriority: { priority: string; count: number }[];
  byCategory: { category: string; count: number }[];
  frequentAssets: { asset: Asset; requestCount: number }[];  // assets needing most maintenance
  monthlyTrend: { month: string; count: number }[];
}
```

#### `getDepartmentAllocationReport()`
```typescript
interface DepartmentAllocationReport {
  departments: {
    name: string;
    totalAssets: number;
    allocatedAssets: number;
    availableAssets: number;
    overdueReturns: number;
    totalValue: number;        // sum of acquisitionCost
  }[];
}
```

#### `getBookingHeatmap(params: { assetId?, startDate, endDate })`
```typescript
interface BookingHeatmap {
  // For each hour of each day of the week, how many bookings exist
  heatmap: {
    dayOfWeek: number;     // 0=Sun, 6=Sat
    hour: number;          // 0-23
    bookingCount: number;
  }[];
  peakHours: { dayOfWeek: string; hour: string; count: number }[];
  totalBookings: number;
}
```

#### `getAssetLifecycleReport()`
```typescript
interface AssetLifecycleReport {
  byStatus: { status: string; count: number; percentage: number }[];
  byCondition: { condition: string; count: number }[];
  nearingRetirement: Asset[];           // based on age or condition
  dueForMaintenance: Asset[];           // based on last maintenance date
  recentlyDisposed: Asset[];
}
```

---

### Controller — `src/controllers/dashboard.controller.ts`

```typescript
class DashboardController {
  getKPIs(req, res, next)
  getOverdueReturns(req, res, next)
  getUpcomingReturns(req, res, next)
  getRecentActivity(req, res, next)
}
```

### Controller — `src/controllers/reports.controller.ts`

```typescript
class ReportsController {
  getAssetUtilization(req, res, next)
  getMaintenanceReport(req, res, next)
  getDepartmentAllocation(req, res, next)
  getBookingHeatmap(req, res, next)
  getAssetLifecycle(req, res, next)
}
```

---

### Routes

**`src/routes/dashboard.routes.ts`**
```
GET  /api/dashboard/kpis              → authenticate → getKPIs
GET  /api/dashboard/overdue-returns   → authenticate → getOverdueReturns
GET  /api/dashboard/upcoming-returns  → authenticate → getUpcomingReturns
GET  /api/dashboard/recent-activity   → authenticate → getRecentActivity
```

**`src/routes/reports.routes.ts`**
```
GET  /api/reports/asset-utilization      → authenticate, authorize(ADMIN, ASSET_MANAGER) → getAssetUtilization
GET  /api/reports/maintenance            → authenticate, authorize(ADMIN, ASSET_MANAGER) → getMaintenanceReport
GET  /api/reports/department-allocation  → authenticate, authorize(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD) → getDepartmentAllocation
GET  /api/reports/booking-heatmap        → authenticate, authorize(ADMIN, ASSET_MANAGER) → getBookingHeatmap
GET  /api/reports/asset-lifecycle        → authenticate, authorize(ADMIN, ASSET_MANAGER) → getAssetLifecycle
```

---

### API Contracts

**GET `/api/dashboard/kpis`**
```json
{
  "success": true,
  "data": {
    "assetsAvailable": 8,
    "assetsAllocated": 4,
    "assetsUnderMaintenance": 1,
    "maintenanceToday": 0,
    "activeBookings": 1,
    "upcomingBookings": 3,
    "pendingTransfers": 2,
    "upcomingReturns": 2,
    "overdueReturns": 1,
    "totalAssets": 15,
    "totalEmployees": 8,
    "pendingMaintenanceRequests": 1
  }
}
```

**GET `/api/reports/department-allocation`**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "name": "IT Department",
        "totalAssets": 7,
        "allocatedAssets": 3,
        "availableAssets": 3,
        "overdueReturns": 1,
        "totalValue": 425000
      },
      {
        "name": "HR Department",
        "totalAssets": 2,
        "allocatedAssets": 0,
        "availableAssets": 2,
        "overdueReturns": 0,
        "totalValue": 85000
      }
    ]
  }
}
```

**GET `/api/reports/booking-heatmap?startDate=2025-07-01&endDate=2025-07-31`**
```json
{
  "success": true,
  "data": {
    "heatmap": [
      { "dayOfWeek": 1, "hour": 9, "bookingCount": 5 },
      { "dayOfWeek": 1, "hour": 10, "bookingCount": 8 },
      { "dayOfWeek": 1, "hour": 14, "bookingCount": 3 }
    ],
    "peakHours": [
      { "dayOfWeek": "Monday", "hour": "10:00 AM", "count": 8 }
    ],
    "totalBookings": 25
  }
}
```

---

### Register Routes in App

Update `src/app.ts`:
```typescript
import { dashboardRouter } from './routes/dashboard.routes';
import { reportsRouter } from './routes/reports.routes';

app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
```

---

## Verification

```bash
# Dashboard KPIs
curl http://localhost:5000/api/dashboard/kpis \
  -H "Authorization: Bearer <admin-token>"

# Overdue returns
curl http://localhost:5000/api/dashboard/overdue-returns \
  -H "Authorization: Bearer <admin-token>"

# Department allocation report
curl http://localhost:5000/api/reports/department-allocation \
  -H "Authorization: Bearer <admin-token>"
```

---

## What's Next
Prompt 13 will build the Notifications & Activity Logs Service.
