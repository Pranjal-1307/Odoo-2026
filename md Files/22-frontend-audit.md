# Prompt 22 — Frontend Asset Audit

## Context
You are building **AssetFlow**. Maintenance is complete (Prompt 21). Now build the Asset Audit page — where admins create audit cycles, auditors verify assets, and the system generates discrepancy reports.

---

## What to Build

### Page: `src/pages/AuditPage.tsx`

**Two main views:**
1. **Audit Cycles List** — all audit cycles with status
2. **Audit Cycle Detail** — view a specific cycle with items and discrepancy report

---

### View 1: Audit Cycles List

```
┌─────────────────────────────────────────────────────────┐
│  Asset Audits                        [+ Create Audit]   │
│  [Status ▼] [Department ▼]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📋 Q3 2025 IT Asset Audit                         │ │
│  │ Department: IT Department                          │ │
│  │ Date: Jul 7 – Jul 21, 2025                        │ │
│  │ Status: ● IN_PROGRESS                              │ │
│  │ Progress: ████████░░ 60% (3/5 verified)           │ │
│  │ Discrepancies: 1 damaged                           │ │
│  │                               [View Details →]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📋 Q2 2025 Facilities Check                       │ │
│  │ Location: Building A                               │ │
│  │ Date: Apr 1 – Apr 15, 2025                        │ │
│  │ Status: ● CLOSED                                   │ │
│  │ Progress: ██████████ 100% (12/12 verified)        │ │
│  │ Discrepancies: 2 missing, 1 damaged               │ │
│  │                               [View Report →]      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Each cycle card shows:
- Title
- Scope (department/location)
- Date range
- Status badge (PLANNED=gray, IN_PROGRESS=blue, COMPLETED=green, CLOSED=emerald)
- Progress bar (X/Y items verified)
- Discrepancy count summary
- Click → navigate to detail view

---

### View 2: Audit Cycle Detail

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Audits                                       │
│  Q3 2025 IT Asset Audit              [Start] [Close]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Total Assets │ │ Verified     │ │Discrepancies │   │
│  │      5       │ │      2       │ │      1       │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  ┌──────────────────────┐ ┌────────────────────────┐   │
│  │ Progress             │ │ Assign Auditors        │   │
│  │ ████████░░ 60%       │ │ [Select auditors... ▼] │   │
│  │                      │ │ [Assign]               │   │
│  │ 2 Verified           │ │                        │   │
│  │ 1 Damaged            │ │ Assigned:              │   │
│  │ 2 Pending            │ │ 👤 Rohit Sharma (5)    │   │
│  └──────────────────────┘ └────────────────────────┘   │
│                                                         │
│  [Items to Verify] [Discrepancy Report]                │
│  ──────────────────────────────────────                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Asset    │ Location   │ Auditor │ Status  │ Action │ │
│  │──────────│────────────│─────────│─────────│────────│ │
│  │ AF-0001  │ IT Floor 2 │ Rohit   │✅ Verif │        │ │
│  │ AF-0002  │ IT Floor 2 │ Rohit   │✅ Verif │        │ │
│  │ AF-0003  │ Storage A  │ Rohit   │⏳ Pend  │[Verify]│ │
│  │ AF-0004  │ IT Floor 2 │ Rohit   │⚠️ Damag│        │ │
│  │ AF-0005  │ Storage A  │ Rohit   │⏳ Pend  │[Verify]│ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### Components

#### 1. Create Audit Cycle Modal

```
┌─────────────────────────────────────┐
│  Create Audit Cycle            ✕    │
│─────────────────────────────────────│
│                                     │
│  Title*                             │
│  [Q3 2025 IT Asset Audit_______]    │
│                                     │
│  Scope                              │
│  Department: [Select... ▼]          │
│  Location:   [__________________]   │
│  (At least one required)            │
│                                     │
│  Date Range*                        │
│  Start: [📅 Jul 7, 2025]           │
│  End:   [📅 Jul 21, 2025]          │
│                                     │
│  [Cancel]     [Create Cycle]        │
└─────────────────────────────────────┘
```

#### 2. Assign Auditors Section

```
┌─────────────────────────────────────┐
│  Assign Auditors                    │
│                                     │
│  Select Auditors:                   │
│  ☑ Rohit Sharma (Asset Manager)     │
│  ☑ Priya Patel (Dept Head)          │
│  ☐ Sneha Reddy (Employee)           │
│                                     │
│  Selected: 2 auditors               │
│  Assets in scope: 5                 │
│  ~2-3 assets per auditor            │
│                                     │
│  [Assign Auditors]                  │
└─────────────────────────────────────┘
```

After assigning: audit items are auto-created and assigned to auditors.

#### 3. Verify Item Modal

When auditor clicks "Verify" on a pending item:
```
┌─────────────────────────────────────┐
│  Verify Asset                  ✕    │
│─────────────────────────────────────│
│                                     │
│  Asset: AF-000003 (HP EliteDesk)    │
│  Expected Location: Storage Room A  │
│  Serial: SN-DT-2025-003            │
│                                     │
│  Verification Result*               │
│  ○ ✅ Verified (found & OK)        │
│  ○ ❌ Missing (not found)          │
│  ○ ⚠️ Damaged (found but damaged) │
│                                     │
│  Remarks                            │
│  [________________________]         │
│                                     │
│  [Cancel]     [Submit Verification] │
└─────────────────────────────────────┘
```

Color changes based on selection:
- Verified → Green border
- Missing → Red border
- Damaged → Orange border

#### 4. Discrepancy Report Tab

```
┌─────────────────────────────────────────────────────────┐
│  Discrepancy Report                                     │
│  Q3 2025 IT Asset Audit                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Summary:                                               │
│  • 5 total assets audited                              │
│  • 2 verified ✅                                       │
│  • 1 damaged ⚠️                                       │
│  • 2 pending ⏳                                        │
│                                                         │
│  Flagged Items:                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ⚠️ AF-000004 — ThinkPad X1 Carbon                │ │
│  │    Location: IT Dept Floor 2                       │ │
│  │    Status: DAMAGED                                 │ │
│  │    Auditor: Rohit Sharma                          │ │
│  │    Remarks: "Screen cracked"                      │ │
│  │    Verified: Jul 12, 2025 10:15 AM                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ⓘ Closing this audit will:                            │
│  • Mark MISSING assets as LOST                         │
│  • Update DAMAGED assets' condition                    │
│  • Lock the audit (no further changes)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5. Close Audit Confirmation

```
┌─────────────────────────────────────┐
│  Close Audit Cycle             ✕    │
│─────────────────────────────────────│
│                                     │
│  ⚠️ This action is irreversible!   │
│                                     │
│  Closing will:                      │
│  • Lock the audit permanently       │
│  • Mark 0 missing assets as LOST    │
│  • Flag 1 damaged asset             │
│                                     │
│  ❌ Cannot close: 2 items pending   │
│  All items must be verified first.  │
│                                     │
│  [Cancel]     [Close Audit]         │
│  (disabled if pending items exist)  │
└─────────────────────────────────────┘
```

---

### My Audit Items (Auditor View)

For auditors, show a focused view of items assigned to them:
- Cards for each pending item with asset details
- One-click verification buttons
- Progress indicator (X/Y completed)

---

### Progress Bar Component

```tsx
function ProgressBar({ completed, total, className }: Props) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className={cn("w-full bg-surface-200 rounded-full h-2.5", className)}>
      <div
        className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
```

---

## Verification

1. Navigate to `/audits` → See audit cycle list with seed data
2. See progress bar showing 60% for the active cycle
3. Click into cycle → See items table with verify buttons
4. Click "Verify" on a pending item → Mark as VERIFIED/MISSING/DAMAGED
5. Progress bar updates
6. View discrepancy report tab → See flagged items
7. Create a new audit cycle → Assign auditors → Items auto-created
8. Try to close cycle with pending items → Blocked with message
9. Verify all items → Close button enabled → Close cycle
10. Closed cycle: items locked, assets updated

---

## What's Next
Prompt 23 will build the Reports & Analytics frontend page.
