# Prompt 13 — Notifications & Activity Logs Service

## Context
You are building **AssetFlow**. Dashboard & Reports are complete (Prompt 12). Now build the Notifications and Activity Logs module — the final backend service that ties everything together.

---

## What to Build

### 1. Notification Service — `src/services/notification.service.ts`

#### `getNotifications(userId, params: { page, limit, isRead? })`
- Return paginated notifications for the user
- Filter by `isRead` if provided
- Sort by `createdAt` desc (newest first)

#### `getUnreadCount(userId)`
- Return count of unread notifications

#### `markAsRead(notificationId, userId)`
- Find notification → validate it belongs to the user
- Set `isRead = true`

#### `markAllAsRead(userId)`
- Update all unread notifications for the user to `isRead = true`

#### `createNotification(data: { userId, title, message, type, refId?, refType? })`
- Create a notification record
- This is called internally by other services (allocation, booking, maintenance, audit)
- Notification types:
  ```
  ASSET_ASSIGNED
  ASSET_RETURNED
  MAINTENANCE_RAISED
  MAINTENANCE_APPROVED
  MAINTENANCE_REJECTED
  MAINTENANCE_RESOLVED
  BOOKING_CONFIRMED
  BOOKING_CANCELLED
  BOOKING_REMINDER
  TRANSFER_REQUESTED
  TRANSFER_APPROVED
  TRANSFER_REJECTED
  OVERDUE_RETURN
  AUDIT_ASSIGNED
  AUDIT_DISCREPANCY
  ROLE_PROMOTED
  ```

#### `createBulkNotifications(notifications: CreateNotificationData[])`
- Create multiple notifications at once (e.g., notifying all asset managers)

#### `deleteOldNotifications(daysOld: number = 90)`
- Cleanup utility: delete notifications older than N days

---

### 2. Activity Log Service — `src/services/activityLog.service.ts`

#### `getActivityLogs(params: { page, limit, userId?, entity?, action?, startDate?, endDate? })`
- Paginated list with filters
- Include user details (name, role)
- Sort by `createdAt` desc

#### `getActivityByEntity(entity: string, entityId: string)`
- Get all activity logs for a specific entity (e.g., all logs for asset AF-000001)

#### `getMyActivity(userId, params: { page, limit })`
- Activity logs for a specific user

#### `logActivity(data: { userId, action, entity, entityId, details?, ipAddress? })`
- Create an activity log entry
- This is called by the middleware/utility from Prompt 04
- Actions:
  ```
  CREATE, UPDATE, DELETE, 
  ALLOCATE, RETURN, TRANSFER_REQUEST, TRANSFER_APPROVE, TRANSFER_REJECT,
  BOOK, CANCEL_BOOKING,
  RAISE_MAINTENANCE, APPROVE_MAINTENANCE, REJECT_MAINTENANCE, RESOLVE_MAINTENANCE,
  CREATE_AUDIT, START_AUDIT, VERIFY_AUDIT, CLOSE_AUDIT,
  LOGIN, SIGNUP, PROMOTE_USER, DEACTIVATE
  ```

---

### Controller — `src/controllers/notification.controller.ts`

```typescript
class NotificationController {
  getAll(req, res, next)
  getUnreadCount(req, res, next)
  markAsRead(req, res, next)
  markAllAsRead(req, res, next)
}
```

### Controller — `src/controllers/activityLog.controller.ts`

```typescript
class ActivityLogController {
  getAll(req, res, next)
  getByEntity(req, res, next)
  getMyActivity(req, res, next)
}
```

---

### Routes

**`src/routes/notification.routes.ts`**
```
GET    /api/notifications                  → authenticate → getAll (query: page, limit, isRead)
GET    /api/notifications/unread-count     → authenticate → getUnreadCount
PATCH  /api/notifications/:id/read         → authenticate → markAsRead
PATCH  /api/notifications/read-all         → authenticate → markAllAsRead
```

**`src/routes/activityLog.routes.ts`**
```
GET    /api/activity-logs                  → authenticate, authorize(ADMIN) → getAll
GET    /api/activity-logs/my               → authenticate → getMyActivity
GET    /api/activity-logs/:entity/:entityId → authenticate → getByEntity
```

---

### API Contracts

**GET `/api/notifications?page=1&limit=20`**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Asset Allocated",
      "message": "Asset AF-000001 (Dell Latitude 5540) has been allocated to you",
      "type": "ASSET_ASSIGNED",
      "refId": "uuid-of-asset",
      "refType": "ASSET",
      "isRead": false,
      "createdAt": "2025-07-12T08:30:00.000Z"
    },
    {
      "id": "uuid",
      "title": "Overdue Return Alert",
      "message": "MacBook Pro AF-000002 return was due 15 days ago",
      "type": "OVERDUE_RETURN",
      "refId": "uuid-of-allocation",
      "refType": "ALLOCATION",
      "isRead": false,
      "createdAt": "2025-07-12T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

**GET `/api/notifications/unread-count`**
```json
{
  "success": true,
  "data": { "count": 5 }
}
```

**GET `/api/activity-logs?page=1&limit=20&entity=ASSET`**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": { "name": "Rohit Sharma", "role": "ASSET_MANAGER" },
      "action": "ALLOCATE",
      "entity": "ASSET",
      "entityId": "uuid",
      "details": {
        "assetTag": "AF-000001",
        "allocatedTo": "Sneha Reddy"
      },
      "createdAt": "2025-07-12T08:30:00.000Z"
    }
  ],
  "meta": { ... }
}
```

---

### 3. Notification Helper Utility

Create a centralized notification helper that other services can import:

**`src/utils/notificationHelper.ts`**

```typescript
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export async function notifyUser(userId: string, title: string, message: string, type: string, refId?: string, refType?: string) {
  return notificationService.createNotification({ userId, title, message, type, refId, refType });
}

export async function notifyAssetManagers(title: string, message: string, type: string, refId?: string, refType?: string) {
  // Find all users with role ASSET_MANAGER
  // Create notification for each
}

export async function notifyDepartmentHead(departmentId: string, title: string, message: string, type: string, refId?: string, refType?: string) {
  // Find the department head
  // Create notification
}

export async function notifyAdmins(title: string, message: string, type: string, refId?: string, refType?: string) {
  // Find all ADMIN users
  // Create notification for each
}
```

---

### Register Routes in App

Update `src/app.ts` with the final set of routes:
```typescript
import { notificationRouter } from './routes/notification.routes';
import { activityLogRouter } from './routes/activityLog.routes';

app.use('/api/notifications', notificationRouter);
app.use('/api/activity-logs', activityLogRouter);
```

**Final `src/app.ts` route list:**
```typescript
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/users', userRouter);
app.use('/api/assets', assetRouter);
app.use('/api/allocations', allocationRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/audits', auditRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/activity-logs', activityLogRouter);
```

---

## Verification

```bash
# Get notifications
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <token>"

# Unread count
curl http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer <token>"

# Mark all read
curl -X PATCH http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer <token>"

# Activity logs
curl http://localhost:5000/api/activity-logs \
  -H "Authorization: Bearer <admin-token>"
```

---

## Backend Complete! 🎉

At this point, the entire backend is built:
- ✅ Authentication (signup, login, JWT)
- ✅ Organization Setup (departments, categories, employees, role promotion)
- ✅ Asset Registration & Directory (CRUD, search, QR code, lifecycle)
- ✅ Asset Allocation & Transfer (conflict handling, returns)
- ✅ Resource Booking (overlap validation)
- ✅ Maintenance Management (approval workflow)
- ✅ Asset Audit (cycles, verification, discrepancy reports)
- ✅ Dashboard & Reports (KPIs, analytics)
- ✅ Notifications & Activity Logs

---

## What's Next
Prompt 14 will build the Frontend Shell — layout, sidebar, routing, auth context, theme, and shared UI components.
