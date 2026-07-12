# Prompt 09 — Resource Booking Service

## Context
You are building **AssetFlow**. Allocation is complete (Prompt 08). Now build the Resource Booking module for shared/bookable assets (rooms, vehicles, projectors) with time-slot management and overlap validation.

---

## What to Build

### Validation Schema — `src/validators/booking.validator.ts`

```typescript
export const createBookingSchema = z.object({
  assetId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  purpose: z.string().min(3, 'Purpose is required'),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: 'End time must be after start time',
}).refine(data => new Date(data.startTime) > new Date(), {
  message: 'Booking must be in the future',
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: 'End time must be after start time',
});
```

---

### Repository — `src/repositories/booking.repository.ts`

```typescript
class BookingRepository {
  findAll(params: PaginationParams & { assetId?, userId?, status?, date? })
  findById(id: string)
  findByAssetAndTimeRange(assetId: string, startTime: Date, endTime: Date, excludeId?: string)
  // ^ This is the overlap detection query — returns any booking that overlaps the given range
  findUpcomingByUser(userId: string)
  findByAssetForCalendar(assetId: string, startDate: Date, endDate: Date)
  create(data)
  update(id: string, data)
  cancel(id: string)
  
  // Auto-status update
  updateExpiredBookings()  // set UPCOMING → ONGOING if startTime <= now, ONGOING → COMPLETED if endTime <= now
  
  getActiveBookingCount()
  getBookableAssets()      // return all assets with bookable=true
}
```

**Critical: Overlap Detection Query**

The overlap check must use this logic:
```sql
-- Two time ranges [A_start, A_end) and [B_start, B_end) overlap if:
-- A_start < B_end AND A_end > B_start

SELECT * FROM bookings
WHERE asset_id = ? 
  AND id != ?               -- exclude self (for reschedule)
  AND status NOT IN ('CANCELLED', 'COMPLETED')
  AND start_time < ?         -- < requested end
  AND end_time > ?           -- > requested start
```

In Prisma:
```typescript
const overlapping = await prisma.booking.findFirst({
  where: {
    assetId,
    id: excludeId ? { not: excludeId } : undefined,
    status: { notIn: ['CANCELLED', 'COMPLETED'] },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  },
});
```

**Example**: Room B2 booked 9:00–10:00.
- Request 9:30–10:30 → OVERLAP (9:30 < 10:00 AND 10:30 > 9:00) → **REJECTED**
- Request 10:00–11:00 → NO OVERLAP (10:00 < 10:00 is FALSE) → **ACCEPTED** ✓

---

### Service — `src/services/booking.service.ts`

#### `createBooking(data, userId)`
1. Validate asset exists
2. Validate asset is `bookable = true` → throw `AppError.badRequest('Asset is not available for booking')`
3. Validate asset status is `AVAILABLE` or `RESERVED`
4. **Check for overlapping bookings** → if overlap found, throw `AppError.conflict()` with overlap details:
   ```json
   {
     "message": "Time slot overlaps with existing booking",
     "data": {
       "conflictingBooking": {
         "id": "uuid",
         "startTime": "...",
         "endTime": "...",
         "bookedBy": { "name": "Priya Patel" }
       }
     }
   }
   ```
5. Create booking with status = `UPCOMING`
6. Create notification for user: "Booking confirmed: {assetName} on {date} {startTime}-{endTime}"
7. Log activity
8. Return booking

#### `cancelBooking(bookingId, userId)`
1. Find booking → throw if not found
2. Validate booking belongs to the user OR user is ADMIN/ASSET_MANAGER
3. Validate booking is `UPCOMING` (cannot cancel completed/ongoing)
4. Update status to `CANCELLED`
5. Create notification
6. Log activity

#### `rescheduleBooking(bookingId, newTimes, userId)`
1. Find booking → throw if not found
2. Validate booking is `UPCOMING`
3. Check for overlaps (excluding self) → throw if overlap
4. Update start/end times
5. Create notification
6. Log activity

#### `getBookingsForAsset(assetId, startDate, endDate)`
1. Return all bookings for the asset within the date range (for calendar view)

#### `getMyBookings(userId)`
1. Return user's bookings sorted by startTime

#### `getAllBookings(params)`
1. Paginated list with filters

#### `getBookableAssets()`
1. Return all assets where `bookable = true` and status is `AVAILABLE`

#### `updateBookingStatuses()`
Called periodically (or on request) to auto-update:
- `UPCOMING` → `ONGOING` when `startTime <= now`
- `ONGOING` → `COMPLETED` when `endTime <= now`

---

### Controller — `src/controllers/booking.controller.ts`

```typescript
class BookingController {
  create(req, res, next)
  cancel(req, res, next)
  reschedule(req, res, next)
  getForAsset(req, res, next)
  getMyBookings(req, res, next)
  getAll(req, res, next)
  getBookableAssets(req, res, next)
}
```

---

### Routes — `src/routes/booking.routes.ts`

```
GET    /api/bookings                    → authenticate → getAll
GET    /api/bookings/my                 → authenticate → getMyBookings
GET    /api/bookings/bookable-assets    → authenticate → getBookableAssets
GET    /api/bookings/asset/:assetId     → authenticate → getForAsset  (query: startDate, endDate)
POST   /api/bookings                    → authenticate, validate(createBookingSchema) → create
PATCH  /api/bookings/:id/cancel         → authenticate → cancel
PATCH  /api/bookings/:id/reschedule     → authenticate, validate(rescheduleBookingSchema) → reschedule
```

---

### API Contracts

**POST `/api/bookings`**
```json
{
  "assetId": "uuid-of-conference-room-B2",
  "startTime": "2025-07-13T09:00:00.000Z",
  "endTime": "2025-07-13T10:00:00.000Z",
  "purpose": "Sprint planning meeting"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": {
    "id": "uuid",
    "asset": { "assetTag": "AF-000009", "name": "Conference Room B2", "location": "Floor 2, Block B" },
    "bookedBy": { "name": "Sneha Reddy", "employeeCode": "EMP-005" },
    "startTime": "2025-07-13T09:00:00.000Z",
    "endTime": "2025-07-13T10:00:00.000Z",
    "purpose": "Sprint planning meeting",
    "status": "UPCOMING"
  }
}
```

**Overlap Conflict (409):**
```json
{
  "success": false,
  "message": "Time slot conflicts with an existing booking for Conference Room B2 (9:00 AM - 10:00 AM by Priya Patel)",
  "data": {
    "conflictingBooking": {
      "id": "uuid",
      "startTime": "2025-07-13T09:00:00.000Z",
      "endTime": "2025-07-13T10:00:00.000Z",
      "bookedBy": { "name": "Priya Patel" }
    }
  }
}
```

**GET `/api/bookings/asset/:assetId?startDate=2025-07-13&endDate=2025-07-19`**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "startTime": "2025-07-13T09:00:00.000Z",
      "endTime": "2025-07-13T10:00:00.000Z",
      "bookedBy": { "name": "Priya Patel" },
      "purpose": "Team standup",
      "status": "UPCOMING"
    },
    {
      "id": "uuid",
      "startTime": "2025-07-13T10:00:00.000Z",
      "endTime": "2025-07-13T11:30:00.000Z",
      "bookedBy": { "name": "Amit Kumar" },
      "purpose": "HR review",
      "status": "UPCOMING"
    }
  ]
}
```

---

### Register Routes in App

Update `src/app.ts`:
```typescript
import { bookingRouter } from './routes/booking.routes';
app.use('/api/bookings', bookingRouter);
```

---

## Business Rules

1. **Only bookable assets**: Assets must have `bookable = true` to be booked.
2. **No overlapping bookings**: Two people cannot book the same resource at overlapping times. Adjacent bookings (one ends at 10:00, another starts at 10:00) are allowed.
3. **Cancel before start**: Only `UPCOMING` bookings can be cancelled or rescheduled.
4. **Auto status updates**: Booking statuses transition automatically based on time.
5. **Reminder notifications**: (optional) Create a reminder notification 15 min before booking start.

---

## Verification

```bash
# Get bookable assets
curl http://localhost:5000/api/bookings/bookable-assets \
  -H "Authorization: Bearer <token>"

# Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<room-uuid>","startTime":"2025-07-13T09:00:00Z","endTime":"2025-07-13T10:00:00Z","purpose":"Meeting"}'

# Try overlapping booking (should get 409)
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<same-room-uuid>","startTime":"2025-07-13T09:30:00Z","endTime":"2025-07-13T10:30:00Z","purpose":"Another meeting"}'

# Adjacent booking (should succeed)
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<same-room-uuid>","startTime":"2025-07-13T10:00:00Z","endTime":"2025-07-13T11:00:00Z","purpose":"Follow-up"}'
```

---

## What's Next
Prompt 10 will build the Maintenance Management Service (repair workflow with approval).
