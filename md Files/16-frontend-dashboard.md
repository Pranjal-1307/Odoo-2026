# Prompt 16 — Frontend Dashboard Page

## Context
You are building **AssetFlow**. Auth pages are complete (Prompt 15). Now build the Dashboard — the home screen every user sees after login. It provides a real-time operational snapshot with KPIs, charts, and quick actions.

---

## What to Build

### Page: `src/pages/DashboardPage.tsx`

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Welcome back, {name}!              Role: Asset Manager │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Assets │ │ Alloc. │ │ Maint. │ │ Active │           │
│  │ Avail. │ │        │ │ Today  │ │ Book.  │           │
│  │  8     │ │  4     │ │  0     │ │  1     │           │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │Pending │ │ Upcom. │ │Overdue │ │ Total  │           │
│  │ Xfers  │ │Returns │ │Returns │ │ Assets │           │
│  │  2     │ │  2     │ │  1 ⚠️  │ │  15    │           │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                         │
│  ┌──────────────────────┐ ┌────────────────────────┐   │
│  │  Asset Status        │ │  Quick Actions         │   │
│  │  Distribution        │ │                        │   │
│  │  [Pie/Donut Chart]   │ │  📦 Register Asset    │   │
│  │                      │ │  📅 Book Resource     │   │
│  │                      │ │  🔧 Raise Maintenance │   │
│  └──────────────────────┘ └────────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐ ┌────────────────────────┐   │
│  │  Overdue Returns     │ │  Recent Activity       │   │
│  │  ┌──────────────┐   │ │                        │   │
│  │  │ MacBook Pro  │   │ │  • Asset allocated     │   │
│  │  │ Raj Malhotra │   │ │  • Booking confirmed   │   │
│  │  │ 15 days late │   │ │  • Maintenance raised  │   │
│  │  └──────────────┘   │ │  • User promoted       │   │
│  └──────────────────────┘ └────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Components to Build

#### 1. KPI Card Component — `src/components/shared/KPICard.tsx`

```tsx
interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;      // Lucide icon
  trend?: 'up' | 'down';      // optional trend indicator
  trendValue?: string;        // e.g., "+12% from last month"
  variant?: 'default' | 'warning' | 'danger';  // for highlighting overdue
  onClick?: () => void;       // navigate on click
}
```

Design:
- White card with subtle shadow
- Icon in a colored circular background (left side)
- Large number with title below
- `warning` variant: amber background, amber icon
- `danger` variant: red background, pulsing badge for attention
- Hover: slight lift with shadow increase
- Animate number counting up on load (optional but impressive)

#### 2. Asset Status Chart — `src/components/shared/AssetStatusChart.tsx`

Use Recharts to create a **donut chart** showing asset distribution by status:
- Available → Emerald
- Allocated → Blue
- Under Maintenance → Orange
- Reserved → Amber
- Lost → Red
- Retired → Gray
- Disposed → Dark Gray

Include a legend and center text showing total assets.

#### 3. Quick Actions Card — `src/components/shared/QuickActions.tsx`

Role-based quick action buttons:
- **Register Asset** → `/assets/register` (Admin, Asset Manager)
- **Book Resource** → `/bookings` (All roles)
- **Raise Maintenance** → `/maintenance` (All roles)
- **View Transfers** → `/allocations` (Admin, Asset Manager, Dept Head)
- **Start Audit** → `/audits` (Admin)

Each button: icon + label, subtle hover animation.

#### 4. Overdue Returns List — `src/components/shared/OverdueReturnsList.tsx`

Fetch from `/api/dashboard/overdue-returns`

For each overdue item:
- Asset tag + name
- Allocated to (name, department)
- Expected return date
- Days overdue (in red, bold)
- "Send Reminder" button (creates a notification)

If no overdue items, show a success state: "✅ No overdue returns"

#### 5. Recent Activity Feed — `src/components/shared/RecentActivityFeed.tsx`

Fetch from `/api/dashboard/recent-activity`

Timeline-style list:
- Icon based on action type
- Description text
- Relative timestamp ("2 hours ago", "Yesterday")
- Click to navigate to related entity

---

### Data Fetching

```typescript
// In DashboardPage.tsx
const { data: kpis, isLoading: kpisLoading } = useApi(
  () => dashboardService.getKPIs(), []
);

const { data: overdue } = useApi(
  () => dashboardService.getOverdueReturns(), []
);

const { data: activity } = useApi(
  () => dashboardService.getRecentActivity(), []
);

const { data: assetStats } = useApi(
  () => assetService.getStats(), []
);
```

---

### Loading States

While KPIs are loading, show:
- Skeleton cards (pulsing gray rectangles matching card dimensions)
- Skeleton chart placeholder
- Skeleton list items

Use a `Skeleton` component:
```tsx
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-surface-200 rounded", className)} />;
}
```

---

### Role-Based Dashboard

| Role | What They See |
|------|--------------|
| ADMIN | All KPIs, all charts, all overdue, all activity |
| ASSET_MANAGER | All KPIs, all charts, all overdue, asset-related activity |
| DEPARTMENT_HEAD | Department-scoped KPIs, department overdue, department activity |
| EMPLOYEE | Personal KPIs (my allocations, my bookings, my requests), personal activity |

For Employee, simplify the KPI row:
- My Assets: count of assets allocated to me
- My Bookings: upcoming bookings count
- My Requests: pending maintenance requests
- My Returns: assets I need to return

---

### Responsive Design

- 4 KPI cards per row on desktop (xl)
- 2 per row on tablet (md)
- 1 per row on mobile (sm)
- Charts and lists stack vertically on mobile
- Sidebar collapses on mobile

---

## Verification

1. Login as Admin → See full dashboard with all 8 KPI cards
2. See donut chart with asset distribution
3. See overdue returns section with AF-000002 (MacBook Pro, 15 days overdue)
4. See quick actions with role-appropriate buttons
5. Login as Employee → See simplified personal dashboard
6. KPI cards are clickable (navigate to relevant pages)
7. Dashboard is responsive on mobile

---

## What's Next
Prompt 17 will build the Organization Setup page (3-tab screen for Departments, Categories, Employee Directory).
