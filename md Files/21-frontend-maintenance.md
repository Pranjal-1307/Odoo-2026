# Prompt 21 — Frontend Maintenance Management

## Context
You are building **AssetFlow**. Booking is complete (Prompt 20). Now build the Maintenance Management page — where users raise repair requests and asset managers manage the approval workflow.

---

## What to Build

### Page: `src/pages/MaintenancePage.tsx`

**Layout with Kanban-style workflow board + request list:**

```
┌─────────────────────────────────────────────────────────┐
│  Maintenance Management              [+ New Request]    │
│  [View: Board ▦ | List ☰]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ PENDING  │ │ APPROVED │ │ IN PROG  │ │ RESOLVED │  │
│  │    (2)   │ │    (1)   │ │    (0)   │ │    (1)   │  │
│  │──────────│ │──────────│ │──────────│ │──────────│  │
│  │┌────────┐│ │┌────────┐│ │          │ │┌────────┐│  │
│  ││AF-0003 ││ ││AF-0004 ││ │          │ ││AF-0012 ││  │
│  ││HP Elite││ ││ThinkPad││ │  Empty   │ ││Projctor││  │
│  ││USB-C   ││ ││Screen  ││ │          │ ││Bulb    ││  │
│  ││🟢 LOW  ││ ││🔴 HIGH ││ │          │ ││🟡 MED  ││  │
│  ││Raj M.  ││ ││Sneha R.││ │          │ ││Amit K. ││  │
│  │└────────┘│ │└────────┘│ │          │ │└────────┘│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Components

#### 1. Workflow Board View — `src/components/maintenance/MaintenanceBoard.tsx`

A Kanban board with columns for each workflow stage:

**Columns:**
1. **Pending** (yellow header) — new requests awaiting approval
2. **Approved** (green header) — approved, awaiting technician
3. **Assigned** (blue header) — technician assigned
4. **In Progress** (indigo header) — work in progress
5. **Resolved** (emerald header) — completed

Also show a collapsed "Rejected" section at the bottom.

**Each card shows:**
- Asset tag + name
- Issue description (truncated to 2 lines)
- Priority badge (LOW=green, MEDIUM=yellow, HIGH=orange, CRITICAL=red pulsing)
- Raised by (name)
- Date raised
- Photo thumbnail (if attached)

**Card actions (based on status and user role):**
- PENDING → [Approve] [Reject] (Asset Manager only)
- APPROVED → [Assign Technician] (Asset Manager)
- ASSIGNED → [Start Work] (assigned technician)
- IN_PROGRESS → [Mark Resolved] (technician)

#### 2. List View — `src/components/maintenance/MaintenanceList.tsx`

Table with:
- Columns: Asset, Issue, Priority, Raised By, Status, Date, Actions
- Filters: Status, Priority, Asset
- Sort by priority or date
- Pagination

#### 3. New Request Modal — `src/components/maintenance/NewRequestModal.tsx`

```
┌─────────────────────────────────────┐
│  Raise Maintenance Request     ✕    │
│─────────────────────────────────────│
│                                     │
│  Select Asset*                      │
│  [🔍 Search assets... ▼]           │
│                                     │
│  Issue Description*                 │
│  [Screen flickering when running]   │
│  [heavy applications. Happens      ]│
│  [intermittently.                  ]│
│                                     │
│  Priority                           │
│  ○ Low  ● Medium  ○ High ○ Critical│
│                                     │
│  Attach Photo                       │
│  [📷 Upload Photo]                  │
│  [photo_preview.jpg]                │
│                                     │
│  [Cancel]     [Submit Request]      │
└─────────────────────────────────────┘
```

- Searchable asset selector
- Multi-line issue description (min 10 chars)
- Radio buttons for priority with color indicators
- Photo upload with preview
- After submit: toast + board refreshes

#### 4. Request Detail Modal — `src/components/maintenance/RequestDetailModal.tsx`

Opens when clicking a card:

```
┌─────────────────────────────────────────┐
│  Maintenance Request            ✕       │
│─────────────────────────────────────────│
│                                         │
│  Asset: AF-000004 (ThinkPad X1 Carbon)  │
│  Status: ● APPROVED                     │
│  Priority: 🔴 HIGH                      │
│                                         │
│  Issue:                                 │
│  Screen flickering intermittently when  │
│  running heavy applications. May need   │
│  display replacement.                   │
│                                         │
│  📷 [Attached Photo]                    │
│                                         │
│  ──── Workflow Timeline ────            │
│  📝 Jul 10 - Raised by Sneha Reddy     │
│  ✅ Jul 11 - Approved by Rohit Sharma   │
│  👷 Jul 11 - Assigned to Vikram Desai   │
│  🔧 Jul 12 - Work started              │
│  ✅ Jul 13 - Resolved                   │
│     "Replaced display cable."           │
│                                         │
│  ──── Actions ────                      │
│  [Assign Technician]  (if APPROVED)     │
│  [Start Work]         (if ASSIGNED)     │
│  [Mark Resolved]      (if IN_PROGRESS)  │
│─────────────────────────────────────────│
│  [Close]                                │
└─────────────────────────────────────────┘
```

#### 5. Assign Technician Modal

```
┌─────────────────────────────────────┐
│  Assign Technician             ✕    │
│─────────────────────────────────────│
│                                     │
│  Request: AF-000004 - Screen issue  │
│                                     │
│  Select Technician*                 │
│  [🔍 Search employees... ▼]        │
│                                     │
│  [Cancel]     [Assign]              │
└─────────────────────────────────────┘
```

#### 6. Resolve Modal

```
┌─────────────────────────────────────┐
│  Mark as Resolved              ✕    │
│─────────────────────────────────────│
│                                     │
│  Asset: AF-000004 (ThinkPad)        │
│  Issue: Screen flickering...        │
│                                     │
│  Resolution Notes*                  │
│  [Replaced display cable. Screen ]  │
│  [working normally now. Tested    ] │
│  [for 30 minutes without issues.  ] │
│                                     │
│  ⓘ Asset status will automatically │
│  change from UNDER_MAINTENANCE to  │
│  AVAILABLE.                         │
│                                     │
│  [Cancel]     [Confirm Resolution]  │
└─────────────────────────────────────┘
```

---

### My Requests (Employee View)

For employees, show a simplified page:
- **My Requests** tab: requests they've raised with current status
- **New Request** button
- Each request shows: asset, issue, priority, status, timeline

---

### Priority Styling

```typescript
const priorityConfig = {
  LOW: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Low' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', label: 'Medium' },
  HIGH: { color: 'bg-orange-100 text-orange-800', icon: '🟠', label: 'High' },
  CRITICAL: { color: 'bg-red-100 text-red-800 animate-pulse', icon: '🔴', label: 'Critical' },
};
```

---

## Verification

1. Navigate to `/maintenance` → See Kanban board with 3 seed requests
2. Board shows requests in correct columns (PENDING, APPROVED, RESOLVED)
3. CRITICAL/HIGH priority cards visually stand out
4. Click "New Request" → Submit a request → Appears in PENDING column
5. As Asset Manager: approve a request → Moves to APPROVED column
6. Assign technician → Moves to ASSIGNED
7. Start work → Moves to IN_PROGRESS
8. Resolve → Moves to RESOLVED, asset status changes
9. Toggle to list view → See table with filters
10. Click a card → See full detail modal with timeline
11. Employee sees only their requests

---

## What's Next
Prompt 22 will build the Asset Audit frontend page.
