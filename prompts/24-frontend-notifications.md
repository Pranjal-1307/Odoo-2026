# Prompt 24 — Frontend Notifications & Activity Log

## Context
You are building **AssetFlow**. Reports are complete (Prompt 23). Now build the Notifications center and Activity Log page — the final frontend pages.

---

## What to Build

### 1. Notification Page — `src/pages/NotificationPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Notifications                   [Mark All as Read]     │
│  [All] [Unread (5)] [Read]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Today                                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔔 ● Overdue Return Alert                    2h  │ │
│  │    MacBook Pro AF-000002 return was due 15 days   │ │
│  │    ago. Please return or extend.                  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📦 ● Transfer Request Pending                 3h  │ │
│  │    Transfer request for Dell Latitude AF-000001   │ │
│  │    from Sneha Reddy to Raj Malhotra               │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔧 ● New Maintenance Request                  5h  │ │
│  │    New maintenance request pending approval for   │ │
│  │    HP EliteDesk 800 (AF-000003)                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Yesterday                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📅   Booking Confirmed                       1d  │ │
│  │    Conference Room B2 booked for tomorrow         │ │
│  │    9:00-10:00 AM                                  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✅   Maintenance Approved                    1d  │ │
│  │    Your maintenance request for ThinkPad          │ │
│  │    AF-000004 has been approved                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Earlier                                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📦   Asset Allocated                         5d  │ │
│  │    Asset AF-000001 (Dell Latitude 5540) has been  │ │
│  │    allocated to you                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Load More...                                          │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Tabs**: All, Unread, Read — with count badges
- **Grouped by time**: Today, Yesterday, Earlier (this week), Older
- **Unread indicator**: Bold text + blue dot (●) for unread
- **Click to read**: Clicking a notification marks it as read
- **Click to navigate**: Click a notification → navigate to the related entity
  - ASSET_ASSIGNED → `/assets/:refId`
  - BOOKING_CONFIRMED → `/bookings`
  - MAINTENANCE_APPROVED → `/maintenance`
  - TRANSFER_REQUESTED → `/allocations`
  - AUDIT_ASSIGNED → `/audits`
- **Mark All as Read**: Button at top to clear all unread
- **Infinite scroll / Load more**: Pagination with "Load More" button
- **Empty state**: "🔔 You're all caught up! No new notifications."

**Notification Icon Map:**
```typescript
const notificationIcons: Record<string, string> = {
  ASSET_ASSIGNED: '📦',
  ASSET_RETURNED: '↩️',
  MAINTENANCE_RAISED: '🔧',
  MAINTENANCE_APPROVED: '✅',
  MAINTENANCE_REJECTED: '❌',
  MAINTENANCE_RESOLVED: '✅',
  BOOKING_CONFIRMED: '📅',
  BOOKING_CANCELLED: '🚫',
  BOOKING_REMINDER: '⏰',
  TRANSFER_REQUESTED: '🔄',
  TRANSFER_APPROVED: '✅',
  TRANSFER_REJECTED: '❌',
  OVERDUE_RETURN: '⚠️',
  AUDIT_ASSIGNED: '📋',
  AUDIT_DISCREPANCY: '🚨',
  ROLE_PROMOTED: '🎉',
};
```

---

### 2. Header Notification Bell — Update `src/components/layout/Header.tsx`

The notification bell in the header should:
- Show unread count as a red badge (pulsing if > 0)
- Click → dropdown showing last 5 unread notifications
- "View All" link → navigates to `/notifications`
- Poll for unread count every 30 seconds (use `useNotificationCount` hook)

```tsx
function NotificationBell() {
  const { count } = useNotificationCount();
  const [isOpen, setIsOpen] = useState(false);
  const { data: recent } = useApi(
    () => notificationService.getAll({ limit: 5, isRead: false }),
    [count] // refetch when count changes
  );

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b font-semibold">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {recent?.data?.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
          <Link to="/notifications" className="block p-3 text-center text-brand-600 border-t">
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Activity Log Page — `src/pages/ActivityLogPage.tsx`

**Admin only**

```
┌─────────────────────────────────────────────────────────┐
│  Activity Log                                           │
│  🔍 Search       [User ▼] [Entity ▼] [Action ▼]       │
│  Date: [Jul 1] to [Jul 12]                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Time            │ User         │ Action      │ Detail  │
│  ─────────────── │──────────────│─────────────│─────────│
│  Jul 12, 10:15   │ Rohit (AM)   │ ALLOCATE    │ AF-0001 │
│  Jul 12, 09:30   │ Admin        │ PROMOTE     │ Priya   │
│  Jul 11, 16:00   │ Sneha (Emp)  │ RAISE_MAINT │ AF-0004 │
│  Jul 11, 14:00   │ Priya (DH)   │ BOOK        │ Room B2 │
│  Jul 11, 10:00   │ Rohit (AM)   │ APPROVE     │ AF-0004 │
│  Jul 10, 09:00   │ Admin        │ CREATE      │ IT Dept │
│  ...                                                    │
│                                                         │
│  < 1 2 3 4 5 >                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Full audit trail**: Every action in the system
- **Filters**: User, Entity type (ASSET, BOOKING, etc.), Action type, Date range
- **Search**: Free text search across details
- **Expandable rows**: Click to see full detail JSON (old/new values)
- **User role badge** next to name
- **Entity links**: Click entity ID to navigate to the entity page
- **Export**: Download activity log as CSV

**Action type colors/icons:**
```typescript
const actionConfig = {
  CREATE: { icon: '➕', color: 'text-green-600' },
  UPDATE: { icon: '✏️', color: 'text-blue-600' },
  DELETE: { icon: '🗑️', color: 'text-red-600' },
  ALLOCATE: { icon: '📦', color: 'text-indigo-600' },
  RETURN: { icon: '↩️', color: 'text-emerald-600' },
  TRANSFER_REQUEST: { icon: '🔄', color: 'text-amber-600' },
  APPROVE: { icon: '✅', color: 'text-green-600' },
  REJECT: { icon: '❌', color: 'text-red-600' },
  BOOK: { icon: '📅', color: 'text-blue-600' },
  RAISE_MAINTENANCE: { icon: '🔧', color: 'text-orange-600' },
  RESOLVE: { icon: '✅', color: 'text-emerald-600' },
  LOGIN: { icon: '🔑', color: 'text-gray-600' },
  PROMOTE: { icon: '⬆️', color: 'text-purple-600' },
};
```

---

### 4. Notification Item Component — `src/components/shared/NotificationItem.tsx`

Reusable component used in both the full page and header dropdown:

```tsx
interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;  // true for header dropdown
  onClick?: () => void;
}

function NotificationItem({ notification, compact, onClick }: NotificationItemProps) {
  const icon = notificationIcons[notification.type] || '🔔';
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  
  return (
    <div 
      className={cn(
        "flex gap-3 p-3 cursor-pointer transition-colors hover:bg-surface-50",
        !notification.isRead && "bg-brand-50/50 border-l-2 border-brand-500"
      )}
      onClick={onClick}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-semibold")}>
          {notification.title}
        </p>
        {!compact && (
          <p className="text-sm text-surface-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-surface-400 mt-1">{timeAgo}</p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
      )}
    </div>
  );
}
```

---

## Date Formatting Helper

**`src/lib/formatters.ts`**

```typescript
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function groupNotificationsByDate(notifications: Notification[]) {
  return {
    today: notifications.filter(n => isToday(new Date(n.createdAt))),
    yesterday: notifications.filter(n => isYesterday(new Date(n.createdAt))),
    thisWeek: notifications.filter(n => isThisWeek(new Date(n.createdAt)) && !isToday(new Date(n.createdAt)) && !isYesterday(new Date(n.createdAt))),
    older: notifications.filter(n => !isThisWeek(new Date(n.createdAt))),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}
```

---

## Verification

1. Navigate to `/notifications` → See notification list grouped by date
2. Unread notifications have blue dot and bold text
3. Click a notification → Navigates to related entity
4. "Mark All as Read" → All notifications become read
5. Header bell shows unread count badge
6. Click bell → Dropdown with recent unread notifications
7. Navigate to `/activity-log` (as Admin) → See full audit trail
8. Filter by user/entity/action → Table filters correctly
9. Expand a row → See full detail JSON
10. Non-admin users cannot access Activity Log page

---

## Frontend Complete! 🎉

All 24 prompts have been created. Your complete AssetFlow frontend includes:
- ✅ Auth Pages (Login, Signup, Forgot Password)
- ✅ Dashboard (KPIs, Charts, Quick Actions)
- ✅ Organization Setup (Departments, Categories, Employee Directory)
- ✅ Asset Directory & Registration (Search, QR, History)
- ✅ Allocation & Transfer (Conflict Handling, Returns)
- ✅ Resource Booking (Calendar, Overlap Validation)
- ✅ Maintenance Management (Kanban Board, Workflow)
- ✅ Asset Audit (Cycles, Verification, Discrepancy Reports)
- ✅ Reports & Analytics (Charts, Heatmaps, Export)
- ✅ Notifications & Activity Log

---

## What's Next
Prompt 25 will handle final polish, integration testing, and demo preparation.
