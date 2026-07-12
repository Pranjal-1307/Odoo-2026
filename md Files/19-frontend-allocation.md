# Prompt 19 — Frontend Allocation & Transfer

## Context
You are building **AssetFlow**. Asset pages are complete (Prompt 18). Now build the Allocation, Transfer, and Return pages — where users manage who holds what.

---

## What to Build

### Page: `src/pages/AllocationPage.tsx`

**Tabbed layout with 4 sections:**
1. **Active Allocations** — current allocations
2. **Overdue Returns** — allocations past their return date
3. **Transfer Requests** — pending/resolved transfers
4. **Return History** — completed returns

---

### Tab 1: Active Allocations

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [+ Allocate Asset]          🔍 Search                  │
│  [Department ▼]                                         │
├─────────────────────────────────────────────────────────┤
│  Asset Tag │ Asset Name   │ Held By    │ Since    │ Due │
│  ──────────│──────────────│────────────│──────────│─────│
│  AF-000001 │ Dell Lat.    │ Sneha R.   │ Jan 15   │ Aug │
│  AF-000002 │ MacBook Pro  │ Raj M.     │ Jan 20   │ ⚠️  │
│  AF-000006 │ Herman Miller│ Priya P.   │ Feb 01   │ —   │
│  AF-000013 │ Oscilloscope │ Vikram D.  │ Mar 10   │ Jul │
└─────────────────────────────────────────────────────────┘
```

**Row actions:**
- **Return** button → opens return modal
- **Transfer** button → opens transfer request modal
- Overdue rows highlighted with amber/red background

**Allocate Asset Modal:**
```
┌─────────────────────────────────────┐
│  Allocate Asset                ✕    │
│─────────────────────────────────────│
│                                     │
│  Select Asset*                      │
│  [🔍 Search assets... ▼]           │
│  (Shows AVAILABLE assets only)      │
│                                     │
│  Allocate To*                       │
│  [🔍 Search employees... ▼]        │
│                                     │
│  Expected Return Date               │
│  [📅 ___________]                   │
│                                     │
│  Notes                              │
│  [________________________]         │
│                                     │
│  [Cancel]     [Allocate]            │
└─────────────────────────────────────┘
```

**Conflict Handling UI:**

If the user tries to allocate an already-allocated asset (409 response), show:
```
┌─────────────────────────────────────┐
│  ⚠️ Asset Already Allocated    ✕    │
│─────────────────────────────────────│
│                                     │
│  AF-000001 (Dell Latitude 5540)     │
│  is currently held by:              │
│                                     │
│  👤 Sneha Reddy (EMP-005)          │
│  📧 sneha@assetflow.com            │
│  🏢 IT Department                  │
│  📅 Allocated since: Jan 15, 2025  │
│                                     │
│  Would you like to request a        │
│  transfer instead?                  │
│                                     │
│  [Cancel]  [Request Transfer →]     │
└─────────────────────────────────────┘
```

Clicking "Request Transfer" opens the transfer form pre-filled with the asset and current holder.

---

### Tab 2: Overdue Returns

Same as the Dashboard overdue list but with more details:
- Table with: Asset, Held By, Department, Expected Return, Days Overdue, Actions
- Days overdue in red, bold text
- Sort by most overdue first
- Action: Send Reminder (creates notification)

---

### Tab 3: Transfer Requests

**Two sub-sections:**

**Pending Transfers** (for Asset Manager / Dept Head to approve):
```
┌───────────────────────────────────────────────────────┐
│  Asset     │ From      │ To        │ Reason │ Action │
│  ──────────│───────────│───────────│────────│────────│
│  AF-000001 │ Sneha R.  │ Raj M.    │ "..."  │ ✅ ❌  │
│  AF-000002 │ Raj M.    │ Ananya S. │ "..."  │ ✅ ❌  │
└───────────────────────────────────────────────────────┘
```

- Approve (✅) / Reject (❌) buttons
- Click to expand and see full reason
- Confirmation dialog before approving/rejecting

**Transfer History:**
- Completed/rejected transfers with resolution date and who approved

---

### Tab 4: Return History

**Return Asset Modal:**
```
┌─────────────────────────────────────┐
│  Return Asset                  ✕    │
│─────────────────────────────────────│
│                                     │
│  Asset: AF-000001 (Dell Latitude)   │
│  Held By: Sneha Reddy              │
│  Since: January 15, 2025           │
│                                     │
│  Return Condition*                  │
│  [Select... ▼]                      │
│    • New                            │
│    • Good                           │
│    • Fair                           │
│    • Poor                           │
│    • Damaged                        │
│                                     │
│  Return Notes                       │
│  [________________________]         │
│  [________________________]         │
│                                     │
│  [Cancel]     [Confirm Return]      │
└─────────────────────────────────────┘
```

After return: toast "Asset returned successfully", table refreshes, asset status becomes AVAILABLE.

---

### My Allocations (Employee View)

For Employees, the page shows a simplified view:

**"My Assets" section:**
- Cards showing assets currently allocated to them
- Each card shows: asset photo/icon, tag, name, allocated date, expected return
- Actions: Raise Maintenance, Request Transfer, Return

**"My Transfer Requests" section:**
- Transfers they've initiated with current status

---

### Searchable Select Component — `src/components/shared/SearchableSelect.tsx`

For asset and employee selection in the allocate modal:
```tsx
interface SearchableSelectProps {
  options: { value: string; label: string; sublabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isLoading: boolean;
  onSearch: (query: string) => void;
}
```

Features:
- Type-ahead search
- Dropdown with search results
- Shows sublabel (e.g., department, asset tag)
- Keyboard navigation

---

## Verification

1. Navigate to `/allocations` → See 4 active allocations
2. Click "Allocate Asset" → Modal with searchable asset/employee selects
3. Allocate an available asset → Success, table updates
4. Try to allocate an already-allocated asset → See conflict modal with transfer option
5. Click "Request Transfer" → Transfer created, shows in pending tab
6. Approve a transfer (as Asset Manager) → Allocation moves to new user
7. Return an asset → Condition captured, asset becomes AVAILABLE
8. See overdue tab highlighting AF-000002 with days overdue
9. Employee view shows only their allocations

---

## What's Next
Prompt 20 will build the Resource Booking frontend page with calendar view.
