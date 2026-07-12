# Prompt 20 — Frontend Resource Booking

## Context
You are building **AssetFlow**. Allocation pages are complete (Prompt 19). Now build the Resource Booking page — a calendar-based interface for booking shared resources (rooms, vehicles, projectors) with real-time overlap prevention.

---

## What to Build

### Page: `src/pages/BookingPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Resource Booking                  [+ New Booking]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select Resource: [Conference Room B2 ▼]                │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ◄ July 2025 ►                                      ││
│  │  ──────────────────────────────────────────────────  ││
│  │  Mon 7    Tue 8    Wed 9    Thu 10   Fri 11         ││
│  │  ┌──────┐                                           ││
│  │  │ 9-10 │ ┌──────┐                                 ││
│  │  │Priya │ │10-11 │                                  ││
│  │  │Sprint│ │ Amit │                                  ││
│  │  └──────┘ │ HR   │                                  ││
│  │           └──────┘                                  ││
│  │                    ┌──────┐                          ││
│  │                    │14-15 │                          ││
│  │                    │Sneha │                          ││
│  │                    │Demo  │                          ││
│  │                    └──────┘                          ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  My Bookings                                        ││
│  │  ┌──────────────────────────────────────────────┐   ││
│  │  │ 📅 Conf Room B2 │ Tomorrow 9:00-10:00       │   ││
│  │  │    Sprint Plan   │ UPCOMING    [Cancel]      │   ││
│  │  └──────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

### Components

#### 1. Resource Selector — `src/components/booking/ResourceSelector.tsx`

Dropdown/card selector for bookable assets:
- Fetches bookable assets from `/api/bookings/bookable-assets`
- Shows: asset name, location, asset tag
- Icons by category (🏢 rooms, 🚗 vehicles, 📽️ projectors)
- Selected resource highlighted

#### 2. Week Calendar View — `src/components/booking/WeekCalendar.tsx`

A **weekly calendar** showing bookings as blocks:

**Implementation:**
- 7 columns (Mon–Sun) or 5 columns (Mon–Fri)
- Time slots from 7:00 AM to 9:00 PM on the Y-axis (each hour = one row)
- Booking blocks positioned based on start/end time
- Color-coded by status:
  - UPCOMING: Blue
  - ONGOING: Green (pulsing border)
  - COMPLETED: Gray
  - CANCELLED: Red strikethrough
- Hover on booking → tooltip with details (purpose, booked by)
- Click on empty slot → open booking form pre-filled with that time
- Navigation: Previous/Next week arrows, "Today" button
- Current time indicator (red horizontal line)

**Data fetching:**
```typescript
const startOfWeek = getStartOfWeek(selectedDate);
const endOfWeek = getEndOfWeek(selectedDate);

const { data: bookings } = useApi(
  () => bookingService.getForAsset(selectedAssetId, startOfWeek, endOfWeek),
  [selectedAssetId, selectedDate]
);
```

#### 3. New Booking Modal — `src/components/booking/BookingModal.tsx`

```
┌─────────────────────────────────────┐
│  Book Resource                 ✕    │
│─────────────────────────────────────│
│                                     │
│  Resource*                          │
│  [Conference Room B2 ▼]             │
│                                     │
│  Date*                              │
│  [📅 July 13, 2025]                │
│                                     │
│  Start Time*        End Time*       │
│  [09:00 ▼]          [10:00 ▼]      │
│                                     │
│  Purpose*                           │
│  [Sprint planning meeting______]    │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ ✅ Slot Available            │   │
│  │ or                           │   │
│  │ ❌ Conflicts with booking    │   │
│  │    by Priya (9:00-10:00)     │   │
│  └──────────────────────────────┘   │
│                                     │
│  [Cancel]     [Book Resource]       │
└─────────────────────────────────────┘
```

**Real-time availability check:**
- As user selects date/time, check against existing bookings for the selected resource
- Show green "✅ Slot Available" or red "❌ Conflicts with..." indicator
- This is a client-side check (compare against fetched bookings for the week)
- Server-side validation also catches overlaps on submit

**Time picker:**
- Dropdown with 30-minute intervals (e.g., 7:00, 7:30, 8:00, 8:30, ...)
- End time must be after start time
- Start time must be in the future

#### 4. My Bookings Section — `src/components/booking/MyBookings.tsx`

List of the current user's bookings:
```
┌──────────────────────────────────────────────────────┐
│  📅 Conference Room B2  │ Tomorrow 9:00-10:00 AM    │
│     Sprint Planning     │ ● UPCOMING                │
│                         │ [Reschedule] [Cancel]     │
├──────────────────────────────────────────────────────┤
│  🚗 Toyota Innova       │ Jul 15, 8:00 AM-6:00 PM  │
│     Client Visit        │ ● UPCOMING                │
│                         │ [Reschedule] [Cancel]     │
├──────────────────────────────────────────────────────┤
│  📅 Board Room          │ Yesterday 10:00-12:00     │
│     Strategy Meeting    │ ● COMPLETED               │
│                         │                           │
└──────────────────────────────────────────────────────┘
```

- Grouped: Upcoming, then Completed/Cancelled
- Cancel button only for UPCOMING bookings
- Cancel shows confirmation dialog
- Reschedule opens the booking modal pre-filled

#### 5. Reschedule Modal

Same as booking modal but:
- Resource is locked (can't change)
- Pre-filled with current booking times
- Submit calls `rescheduleBooking` API instead of `create`

---

### Calendar Helper Functions

Use `date-fns` for date operations:

```typescript
import { 
  startOfWeek, endOfWeek, addWeeks, subWeeks, 
  format, isSameDay, isWithinInterval, 
  differenceInMinutes, setHours, setMinutes 
} from 'date-fns';

// Position a booking block on the calendar
function getBookingPosition(booking: Booking, dayStart: Date) {
  const startMinutes = differenceInMinutes(booking.startTime, dayStart);
  const duration = differenceInMinutes(booking.endTime, booking.startTime);
  const topPercent = (startMinutes / (14 * 60)) * 100; // 14 hours visible
  const heightPercent = (duration / (14 * 60)) * 100;
  return { top: topPercent, height: heightPercent };
}
```

---

### All Bookings View (Admin/Asset Manager)

A separate tab or toggle showing all bookings across all resources:
- Table view with columns: Resource, Booked By, Date, Time, Status
- Filters: Resource, Status, Date range
- Useful for administrators to see overall utilization

---

## Verification

1. Navigate to `/bookings` → See resource selector with bookable assets
2. Select "Conference Room B2" → See weekly calendar with existing bookings
3. Click "New Booking" → Modal with availability indicator
4. Select an available slot → Green "✅ Slot Available" shows
5. Select an overlapping slot → Red "❌ Conflicts with..." shows
6. Book an available slot → Calendar updates with new booking
7. Try to book overlapping slot → Error toast with conflict details
8. See "My Bookings" section with upcoming bookings
9. Cancel a booking → Status changes to CANCELLED
10. Navigate weeks with previous/next buttons

---

## What's Next
Prompt 21 will build the Maintenance Management frontend page.
