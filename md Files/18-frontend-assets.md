# Prompt 18 — Frontend Asset Registration & Directory

## Context
You are building **AssetFlow**. Organization Setup is complete (Prompt 17). Now build the Asset Registration form and Asset Directory — the pages for registering new assets, searching/browsing assets, and viewing asset details with full history.

---

## What to Build

### 1. Asset Directory Page — `src/pages/AssetDirectoryPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Asset Directory           [+ Register Asset] (role)    │
├─────────────────────────────────────────────────────────┤
│  🔍 Search by name, tag, serial number                  │
│  [Category ▼] [Status ▼] [Department ▼] [Location ▼]  │
│  [☑ Bookable Only]                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Grid / List Toggle  ▦ ☰         Showing 15 assets     │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 📦           │ │ 💻           │ │ 🖥️            │   │
│  │ AF-000001    │ │ AF-000002    │ │ AF-000003    │   │
│  │ Dell Lat.    │ │ MacBook Pro  │ │ HP EliteDesk │   │
│  │ Electronics  │ │ Electronics  │ │ Electronics  │   │
│  │ ● ALLOCATED  │ │ ● ALLOCATED  │ │ ● AVAILABLE  │   │
│  │ IT Dept F2   │ │ IT Dept F2   │ │ Storage A    │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ ...          │ │ ...          │ │ ...          │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  < 1 2 >                                               │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Search**: real-time search across name, asset tag, serial number
- **Filters**: Category, Status, Department, Location dropdowns (fetch options from API)
- **View toggle**: Grid (cards) / List (table) view
- **Sort**: by name, tag, date, status
- **Pagination**: 12 per page (grid) or 20 per page (list)
- **Asset cards** in grid view:
  - Category icon or photo
  - Asset tag (bold, monospace)
  - Asset name
  - Category name
  - Status badge (colored)
  - Location
  - Click → navigate to asset detail page
- **Table** in list view:
  - Columns: Asset Tag, Name, Category, Status, Condition, Location, Department, Actions
  - Actions: View, Edit (if authorized)

---

### 2. Asset Registration Page — `src/pages/AssetRegisterPage.tsx`

**Admin/Asset Manager only**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Register New Asset                          [Cancel]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────┐ ┌────────────────────────┐ │
│  │  Basic Information     │ │  Photo & Documents     │ │
│  │                        │ │                        │ │
│  │  Asset Name*           │ │  📷 Drop photo here   │ │
│  │  [________________]    │ │  or click to upload    │ │
│  │                        │ │                        │ │
│  │  Category*             │ │  📎 Attach Documents  │ │
│  │  [Select... ▼]         │ │                        │ │
│  │                        │ │                        │ │
│  │  Serial Number         │ └────────────────────────┘ │
│  │  [________________]    │                             │
│  │                        │ ┌────────────────────────┐ │
│  │  Department            │ │  Additional Details    │ │
│  │  [Select... ▼]         │ │                        │ │
│  │                        │ │  Condition             │ │
│  │  Location              │ │  [New ▼]               │ │
│  │  [________________]    │ │                        │ │
│  │                        │ │  Acquisition Date      │ │
│  │  Description           │ │  [📅 ___________]     │ │
│  │  [________________]    │ │                        │ │
│  │  [________________]    │ │  Acquisition Cost (₹)  │ │
│  │                        │ │  [________________]    │ │
│  │  ☑ Bookable Resource  │ │                        │ │
│  │  (rooms, vehicles,     │ │                        │ │
│  │   shared equipment)    │ │                        │ │
│  └────────────────────────┘ └────────────────────────┘ │
│                                                         │
│  ⓘ Asset Tag will be auto-generated (e.g., AF-000016)  │
│  ⓘ QR Code will be generated automatically             │
│                                                         │
│              [Cancel]  [Register Asset]                │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Two-column layout on desktop, single column on mobile
- Category dropdown fetched from `/api/categories`
- Department dropdown fetched from `/api/departments`
- Photo upload with preview (drag & drop)
- Bookable checkbox with explanation tooltip
- Info note about auto-generated asset tag and QR code
- After successful registration:
  - Show success modal with the generated asset tag and QR code
  - Button to "View Asset" or "Register Another"
- Form validation with React Hook Form + Zod

---

### 3. Asset Detail Page — `src/pages/AssetDetailPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Assets          AF-000001                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────┐ ┌──────────────────┐ │
│  │  Dell Latitude 5540          │ │  QR Code         │ │
│  │  ────────────────────────    │ │  ┌─────────┐    │ │
│  │  Tag: AF-000001              │ │  │ ██████  │    │ │
│  │  Serial: SN-LAP-2025-001    │ │  │ ██  ██  │    │ │
│  │  Category: Electronics       │ │  │ ██████  │    │ │
│  │  Department: IT Department   │ │  └─────────┘    │ │
│  │  Location: IT Dept Floor 2   │ │  [Download QR]   │ │
│  │  Status: ● ALLOCATED         │ │                  │ │
│  │  Condition: GOOD             │ └──────────────────┘ │
│  │  Acquired: Jan 15, 2025      │                      │
│  │  Cost: ₹75,000               │ ┌──────────────────┐ │
│  │  Bookable: No                │ │  Current Holder  │ │
│  │  Registered by: Rohit S.     │ │  Sneha Reddy     │ │
│  │                              │ │  EMP-005          │ │
│  │  [Edit] [Allocate] [Maint.] │ │  IT Department    │ │
│  └──────────────────────────────┘ │  Since: Jan 15    │ │
│                                   │  Return: Aug 15   │ │
│                                   └──────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  [Allocation History] [Maintenance] [Bookings]      ││
│  │─────────────────────────────────────────────────────││
│  │                                                     ││
│  │  Timeline / Table of history entries                 ││
│  │                                                     ││
│  │  📌 Jan 15 - Allocated to Sneha Reddy (Active)     ││
│  │  🔧 Dec 10 - Maintenance: Screen repair (Resolved) ││
│  │  📌 Sep 01 - Allocated to Raj Malhotra (Returned)  ││
│  │  ✅ Jul 20 - Registered by Rohit Sharma            ││
│  │                                                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Full asset details in a card
- QR code display with download button
- Current holder info (if allocated)
- Action buttons based on status:
  - AVAILABLE: [Allocate] [Book (if bookable)]
  - ALLOCATED: [Request Transfer] [Raise Maintenance]
  - UNDER_MAINTENANCE: View maintenance details
- **Tabbed history** section:
  - Allocation History: table/timeline of all allocations
  - Maintenance History: all maintenance requests
  - Booking History: all bookings (if bookable)
  - Audit History: audit verification records
- Each history entry shows relevant details, dates, and involved users

---

### Asset Card Component — `src/components/shared/AssetCard.tsx`

Reusable card for the grid view:
```tsx
interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}
```

Design:
- Rounded corners, subtle shadow
- Photo or category icon placeholder
- Asset tag in monospace font
- Status badge
- Hover: lift with shadow increase

---

## Data Fetching

```typescript
// Directory page
const { data, isLoading, refetch } = useApi(
  () => assetService.search({ search, categoryId, status, departmentId, page, limit }),
  [search, categoryId, status, departmentId, page]
);

// Detail page
const { id } = useParams();
const { data: asset } = useApi(() => assetService.getById(id), [id]);
const { data: history } = useApi(() => assetService.getHistory(id), [id]);
```

---

## Verification

1. Navigate to `/assets` → See grid of 15 seed assets with status badges
2. Search "laptop" → Filtered results
3. Filter by status "AVAILABLE" → See only available assets
4. Toggle to list view → See table format
5. Click an asset card → Navigate to detail page
6. Asset detail shows QR code, current holder, history tabs
7. Click "Register Asset" → See registration form
8. Register a new asset → Success modal with AF-000016 tag and QR
9. New asset appears in directory

---

## What's Next
Prompt 19 will build the Allocation & Transfer frontend pages.
