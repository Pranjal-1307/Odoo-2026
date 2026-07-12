# 04 — UI Specification: AssetFlow ERP (Odoo-2026)

---

## 1. Purpose

This document specifies every screen, form, button, validation, navigation element, and responsive behavior in the AssetFlow ERP frontend. It is designed to be comprehensive enough that a developer or AI can implement every page without design ambiguity.

---

## 2. Design System

### 2.1 Color Palette

| Token                 | Hex Code    | Usage                                     |
| --------------------- | ----------- | ----------------------------------------- |
| `--primary`           | `#4F46E5`   | Primary buttons, active nav items, links   |
| `--primary-hover`     | `#4338CA`   | Primary button hover state                 |
| `--primary-light`     | `#EEF2FF`   | Primary backgrounds, selected rows         |
| `--secondary`         | `#6B7280`   | Secondary buttons, muted text              |
| `--success`           | `#10B981`   | Success badges, confirmed states           |
| `--success-light`     | `#D1FAE5`   | Success background                         |
| `--warning`           | `#F59E0B`   | Warning badges, pending states             |
| `--warning-light`     | `#FEF3C7`   | Warning background                         |
| `--danger`            | `#EF4444`   | Delete buttons, error badges, overdue      |
| `--danger-light`      | `#FEE2E2`   | Error background                           |
| `--info`              | `#3B82F6`   | Info badges, links                         |
| `--info-light`        | `#DBEAFE`   | Info background                            |
| `--bg-primary`        | `#FFFFFF`   | Main background                            |
| `--bg-secondary`      | `#F9FAFB`   | Page background, card backgrounds          |
| `--bg-sidebar`        | `#1F2937`   | Sidebar background                         |
| `--text-primary`      | `#111827`   | Primary text                               |
| `--text-secondary`    | `#6B7280`   | Secondary/muted text                       |
| `--text-white`        | `#FFFFFF`   | Text on dark backgrounds                   |
| `--border`            | `#E5E7EB`   | Borders, dividers                          |
| `--shadow`            | `rgba(0,0,0,0.1)` | Box shadows                          |

### 2.2 Typography

| Token              | Font Family        | Size   | Weight | Usage                    |
| ------------------ | ------------------ | ------ | ------ | ------------------------ |
| `--font-family`    | `'Inter', sans-serif` | —   | —      | All text                 |
| `--heading-1`      | Inter              | 28px   | 700    | Page titles              |
| `--heading-2`      | Inter              | 22px   | 600    | Section titles           |
| `--heading-3`      | Inter              | 18px   | 600    | Card titles              |
| `--body`           | Inter              | 14px   | 400    | Body text, form labels   |
| `--body-small`     | Inter              | 12px   | 400    | Helper text, timestamps  |
| `--button`         | Inter              | 14px   | 500    | Button labels            |

### 2.3 Spacing Scale

| Token     | Value  | Usage                              |
| --------- | ------ | ---------------------------------- |
| `--sp-1`  | 4px    | Inline element spacing             |
| `--sp-2`  | 8px    | Tight spacing (between badges)     |
| `--sp-3`  | 12px   | Input padding                      |
| `--sp-4`  | 16px   | Card padding, section spacing      |
| `--sp-5`  | 20px   | Form field spacing                 |
| `--sp-6`  | 24px   | Section gaps                       |
| `--sp-8`  | 32px   | Page margins                       |
| `--sp-10` | 40px   | Major section separators           |

### 2.4 Border Radius

| Token               | Value  | Usage                     |
| -------------------- | ------ | ------------------------- |
| `--radius-sm`        | 4px    | Badges, small elements     |
| `--radius-md`        | 8px    | Cards, inputs, buttons     |
| `--radius-lg`        | 12px   | Modals, larger containers  |
| `--radius-full`      | 9999px | Avatars, round buttons     |

### 2.5 Shadows

| Token              | Value                                      | Usage              |
| ------------------ | ------------------------------------------ | ------------------ |
| `--shadow-sm`      | `0 1px 2px rgba(0,0,0,0.05)`              | Cards, inputs      |
| `--shadow-md`      | `0 4px 6px rgba(0,0,0,0.1)`               | Dropdowns, popovers|
| `--shadow-lg`      | `0 10px 15px rgba(0,0,0,0.1)`             | Modals             |

---

## 3. Layout — Application Shell

### 3.1 Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR (fixed top, height: 64px, z-index: 1000)                 │
│  ┌────┐ ┌──────────────────────┐      ┌───┐ ┌─────┐ ┌────────┐  │
│  │Logo│ │  Global Search       │      │🔔│ │ 👤  │ │UserMenu│  │
│  └────┘ └──────────────────────┘      └───┘ └─────┘ └────────┘  │
├────────────┬─────────────────────────────────────────────────────┤
│  SIDEBAR   │  MAIN CONTENT (margin-top: 64px)                    │
│  width:    │                                                     │
│  260px     │  ┌─────────────────────────────────────────────┐    │
│  (collapsed│  │  BREADCRUMB                                 │    │
│  = 70px)   │  │  Dashboard > Assets > Add New Asset         │    │
│            │  ├─────────────────────────────────────────────┤    │
│  ┌──────┐  │  │  PAGE HEADER                                │    │
│  │ 🏠   │  │  │  Title            [+ Add New] [Export]       │    │
│  │ Dash │  │  ├─────────────────────────────────────────────┤    │
│  ├──────┤  │  │  FILTER BAR                                 │    │
│  │ 🏢   │  │  │  [Search] [Status▼] [Category▼] [Date▼]     │    │
│  │ Org  │  │  ├─────────────────────────────────────────────┤    │
│  ├──────┤  │  │                                             │    │
│  │ 📦   │  │  │  CONTENT AREA                               │    │
│  │Asset │  │  │  (Table / Form / Cards / Charts)            │    │
│  ├──────┤  │  │                                             │    │
│  │ 🔄   │  │  │                                             │    │
│  │Alloc │  │  ├─────────────────────────────────────────────┤    │
│  ├──────┤  │  │  PAGINATION                                 │    │
│  │ 📅   │  │  │  [< Prev] [1] [2] [3] ... [Next >]          │    │
│  │Book  │  │  │  Showing 1-20 of 150 records                │    │
│  ├──────┤  │  └─────────────────────────────────────────────┘    │
│  │ 🔧   │  │                                                     │
│  │Maint │  │                                                     │
│  ├──────┤  │                                                     │
│  │ 📋   │  │                                                     │
│  │Audit │  │                                                     │
│  ├──────┤  │                                                     │
│  │ 📊   │  │                                                     │
│  │Report│  │                                                     │
│  ├──────┤  │                                                     │
│  │ 🔔   │  │                                                     │
│  │Notif │  │                                                     │
│  ├──────┤  │                                                     │
│  │ ⚙️   │  │                                                     │
│  │Setng │  │                                                     │
│  └──────┘  │                                                     │
├────────────┴─────────────────────────────────────────────────────┤
│  FOOTER (optional, shows version info)                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Screen Specifications

### 4.1 Login Page (`/login`)

**Layout Type**: AuthLayout (centered card, no sidebar/navbar)

**Visual Description**:
- Full-page background with gradient (`#4F46E5` → `#7C3AED`).
- Centered white card (max-width: 420px) with shadow.
- Logo at top of card.
- "Welcome Back" heading.
- Two form fields + checkbox + button.
- "Forgot Password?" and "Sign Up" links.

**Form Fields**:

| Field       | Type     | Placeholder          | Validation                          | Required |
| ----------- | -------- | -------------------- | ----------------------------------- | -------- |
| Email       | email    | "Enter your email"   | Must be valid email format          | Yes      |
| Password    | password | "Enter your password"| Min 8 chars                         | Yes      |

**Checkbox**: "Remember Me" — stores JWT in localStorage vs sessionStorage.

**Buttons**:

| Button         | Type    | Action                                           |
| -------------- | ------- | ------------------------------------------------ |
| "Sign In"      | submit  | POST `/api/v1/auth/login`; redirect to dashboard |
| "Forgot Password?" | link | Navigate to `/forgot-password`                   |
| "Sign Up"      | link    | Navigate to `/register`                          |

**Validation Behavior**:
- Email: Validate on blur; show "Please enter a valid email address" in red below field.
- Password: Validate on blur; show "Password must be at least 8 characters" in red below field.
- On submit with invalid fields: highlight fields with red border, show error messages.
- On API error (401): show toast "Invalid email or password" at top right.

**Responsive Behavior**:
- Desktop (≥1024px): Card centered, max-width 420px.
- Tablet (768px–1023px): Card centered, max-width 380px.
- Mobile (<768px): Card takes full width with 16px horizontal margin. Background image hidden.

---

### 4.2 Register Page (`/register`)

**Layout Type**: AuthLayout

**Form Fields**:

| Field              | Type     | Placeholder               | Validation                                    | Required |
| ------------------ | -------- | ------------------------- | --------------------------------------------- | -------- |
| First Name         | text     | "First Name"              | 2–50 chars, letters only                      | Yes      |
| Last Name          | text     | "Last Name"               | 2–50 chars, letters only                      | Yes      |
| Email              | email    | "Email Address"           | Valid email, unique (check API on blur)        | Yes      |
| Phone              | tel      | "Phone Number"            | 10–15 digits                                  | Yes      |
| Password           | password | "Password"                | Min 8, 1 upper, 1 lower, 1 digit              | Yes      |
| Confirm Password   | password | "Confirm Password"        | Must match Password                           | Yes      |
| Organization       | select   | "Select Organization"     | Must select one                               | Yes      |
| Department         | select   | "Select Department"       | Must select one (filtered by org)             | Yes      |

**Buttons**:

| Button       | Type   | Action                                              |
| ------------ | ------ | --------------------------------------------------- |
| "Register"   | submit | POST `/api/v1/auth/register`; redirect to login     |
| "Sign In"    | link   | Navigate to `/login`                                |

**Password Strength Indicator**: Visual bar showing strength (Weak/Medium/Strong) that updates as user types.

---

### 4.3 Forgot Password Page (`/forgot-password`)

**Layout Type**: AuthLayout

**Form Fields**:

| Field | Type  | Placeholder        | Validation          | Required |
| ----- | ----- | ------------------ | ------------------- | -------- |
| Email | email | "Enter your email" | Valid email format   | Yes      |

**Buttons**:

| Button           | Type   | Action                                               |
| ---------------- | ------ | ---------------------------------------------------- |
| "Send Reset Link"| submit | POST `/api/v1/auth/forgot-password`; show success msg|
| "Back to Login"  | link   | Navigate to `/login`                                 |

---

### 4.4 Dashboard Page (`/dashboard`)

**Layout Type**: MainLayout (Navbar + Sidebar + Content)

**Sections (top to bottom)**:

#### Section 1: Stats Cards Row
Four stat cards in a row (responsive grid: 4 cols → 2 cols → 1 col):

| Card Title         | Value Source                | Icon  | Color   |
| ------------------ | -------------------------- | ----- | ------- |
| "Total Assets"     | GET `/api/v1/dashboard/stats` → totalAssets    | 📦 | primary |
| "Active Allocations"| GET `/api/v1/dashboard/stats` → activeAllocations | 🔄 | success |
| "Pending Maintenance"| GET `/api/v1/dashboard/stats` → pendingMaintenance | 🔧 | warning |
| "Overdue Returns"  | GET `/api/v1/dashboard/stats` → overdueReturns | ⚠️ | danger  |

Each card shows:
- Icon (left), Value (large number), Label (subtitle), % Change from last month (bottom right).

#### Section 2: Charts Row (2 columns)

**Left Chart — Asset Distribution (Doughnut/Pie)**:
- Title: "Asset Distribution by Category"
- Data: GET `/api/v1/dashboard/asset-distribution`
- Shows: Electronics, Furniture, Vehicles, IT Equipment, etc.
- Legend below chart.

**Right Chart — Allocation Trends (Line)**:
- Title: "Monthly Allocations (Last 12 Months)"
- Data: GET `/api/v1/dashboard/allocation-trends`
- X-axis: Months, Y-axis: Count
- Two lines: Allocations and Returns.

#### Section 3: Two-Column Layout

**Left — Recent Activities**:
- Title: "Recent Activities"
- Card with scrollable list (max 10 items).
- Each item: [Icon] [Description] [Timestamp] [User Avatar].
- Data: GET `/api/v1/dashboard/recent-activities`
- "View All" link at bottom → navigates to activity log.

**Right — Upcoming Maintenance**:
- Title: "Upcoming Maintenance"
- Card with list of next 5 scheduled maintenance tasks.
- Each item: [Asset Name] [Type Badge] [Scheduled Date] [Priority Badge].
- Data: GET `/api/v1/dashboard/upcoming-maintenance`
- "View All" link → navigates to `/maintenance`.

#### Section 4: Quick Actions Bar
Horizontal row of action buttons:

| Button              | Icon | Action                                   |
| ------------------- | ---- | ---------------------------------------- |
| "Add New Asset"     | ➕  | Navigate to `/assets/new`                |
| "Allocate Asset"    | 🔄  | Navigate to `/allocations/new`           |
| "Book Asset"        | 📅  | Navigate to `/bookings/new`              |
| "Raise Maintenance" | 🔧  | Navigate to `/maintenance/new`           |
| "Start Audit"       | 📋  | Navigate to `/audit/new`                 |
| "Generate Report"   | 📊  | Navigate to `/reports/generate`          |

---

### 4.5 Asset List Page (`/assets`)

**Page Header**:
- Title: "Assets"
- Breadcrumb: "Dashboard > Assets"
- Action Buttons: [+ Add New Asset (primary)] [Export (secondary)] [Import (secondary)]

**Filter Bar**:

| Filter       | Type    | Options                                              |
| ------------ | ------- | ---------------------------------------------------- |
| Search       | text    | Searches: asset name, asset code, serial number      |
| Category     | select  | All categories from GET `/api/v1/categories`         |
| Status       | select  | AVAILABLE, ALLOCATED, UNDER_MAINTENANCE, DISPOSED, LOST |
| Condition    | select  | NEW, GOOD, FAIR, POOR, DAMAGED                       |
| Location     | select  | All locations from GET `/api/v1/locations`           |
| Date Range   | date    | Filters by `purchase_date` range                     |

**View Toggle**: [Grid View 🔲] [List View 📋] — switches between card grid and table view.

**Table View Columns**:

| Column        | Sortable | Width   | Content                                      |
| ------------- | -------- | ------- | -------------------------------------------- |
| Checkbox      | No       | 40px    | Select for bulk actions                      |
| Asset Code    | Yes      | 120px   | Auto-generated code (e.g., AST-2026-0001)   |
| Image         | No       | 60px    | Thumbnail image (40x40)                      |
| Name          | Yes      | 200px   | Asset name (clickable → detail page)         |
| Category      | Yes      | 150px   | Category name                                |
| Status        | Yes      | 120px   | StatusBadge component with color             |
| Condition     | Yes      | 100px   | Condition badge                              |
| Location      | Yes      | 150px   | Location name                                |
| Allocated To  | Yes      | 150px   | User name or "—" if unallocated              |
| Purchase Date | Yes      | 120px   | Formatted date (DD MMM YYYY)                 |
| Value         | Yes      | 100px   | Currency formatted (₹1,50,000)               |
| Actions       | No       | 120px   | [👁 View] [✏️ Edit] [🗑 Delete]              |

**Bulk Actions** (shown when rows selected):
- [Delete Selected] [Change Status] [Export Selected]

**Pagination**:
- Shows: "Showing 1–20 of 150 assets"
- Controls: [◀ Previous] [1] [2] [3] ... [8] [Next ▶]
- Page size selector: [10] [20] [50] [100]

**Grid/Card View**:
Each card shows: Image (top), Name, Category badge, Status badge, Location, Value, Action icons.
Grid layout: 4 cols → 3 cols → 2 cols → 1 col (responsive).

---

### 4.6 Asset Form Page (`/assets/new`, `/assets/:id/edit`)

**Page Header**:
- Title: "Add New Asset" or "Edit Asset"
- Breadcrumb: "Dashboard > Assets > Add New Asset"
- Buttons: [Cancel (secondary)] [Save as Draft (outlined)] [Save (primary)]

**Form Layout**: Two-column form with sections.

#### Section 1: Basic Information

| Field              | Type      | Placeholder / Default     | Validation                            | Required |
| ------------------ | --------- | ------------------------- | ------------------------------------- | -------- |
| Asset Name         | text      | "Enter asset name"        | 3–100 characters                      | Yes      |
| Category           | select    | "Select category"         | Must select from API list             | Yes      |
| Subcategory        | select    | "Select subcategory"      | Filtered by category                  | No       |
| Serial Number      | text      | "Enter serial number"     | Alphanumeric, unique                  | No       |
| Model              | text      | "Enter model"             | Max 100 chars                         | No       |
| Manufacturer       | text      | "Enter manufacturer"      | Max 100 chars                         | No       |
| Description        | textarea  | "Enter description"       | Max 500 chars                         | No       |

#### Section 2: Location & Status

| Field              | Type      | Default                   | Validation                            | Required |
| ------------------ | --------- | ------------------------- | ------------------------------------- | -------- |
| Location           | select    | "Select location"         | Must select from API list             | Yes      |
| Department         | select    | "Select department"       | Must select from API list             | No       |
| Status             | select    | "AVAILABLE"               | Enum: predefined values               | Yes      |
| Condition          | select    | "NEW"                     | Enum: predefined values               | Yes      |

#### Section 3: Financial Information

| Field              | Type      | Placeholder               | Validation                            | Required |
| ------------------ | --------- | ------------------------- | ------------------------------------- | -------- |
| Purchase Date      | date      | "Select date"             | Cannot be future date                 | Yes      |
| Purchase Cost      | number    | "0.00"                    | Positive decimal, max 15 digits       | Yes      |
| Warranty Expiry    | date      | "Select date"             | Must be after purchase date           | No       |
| Depreciation Rate  | number    | "0.00"                    | 0–100 percentage                      | No       |
| Current Value      | number    | "Auto-calculated"         | Read-only, calculated from depreciation| No      |
| Vendor             | select    | "Select vendor"           | From vendor list                      | No       |
| Invoice Number     | text      | "Enter invoice number"    | Alphanumeric                          | No       |

#### Section 4: Images & Documents

**Image Upload**:
- Drag-and-drop area with "Click to upload or drag and drop" text.
- Accepted formats: PNG, JPG, JPEG (max 5 MB each, max 5 images).
- Preview thumbnails with [X] remove button.
- First image is set as primary (star icon to change primary).

**Document Upload**:
- Drag-and-drop area.
- Accepted formats: PDF, XLSX, DOC, DOCX (max 10 MB each, max 10 documents).
- List view with: [File icon] [File name] [Size] [X Remove].

#### Section 5: Additional Notes

| Field  | Type     | Placeholder               | Validation      | Required |
| ------ | -------- | ------------------------- | --------------- | -------- |
| Notes  | textarea | "Additional notes..."     | Max 1000 chars  | No       |

**Button Behaviors**:
- **Cancel**: Show ConfirmDialog "Discard changes?" → Navigate back to `/assets`.
- **Save as Draft**: POST with `status: DRAFT` → Toast "Asset saved as draft" → Stay on page.
- **Save**: Validate all fields → POST/PUT API → Toast "Asset created/updated successfully" → Navigate to `/assets/:id`.
- All buttons disabled during API call, replaced with spinner.

---

### 4.7 Asset Detail Page (`/assets/:id`)

**Page Header**:
- Title: Asset name (e.g., "Dell Latitude 5540")
- Subtitle: Asset code (e.g., "AST-2026-0001")
- Breadcrumb: "Dashboard > Assets > Dell Latitude 5540"
- Action Buttons: [Edit] [Allocate] [Book] [Raise Maintenance] [Delete (danger)]

**Tab Navigation**:

| Tab             | Content                                                 |
| --------------- | ------------------------------------------------------- |
| Overview        | All asset details in read-only card layout              |
| Allocation History | Table of all allocations (past and current)           |
| Booking History | Table of all bookings                                   |
| Maintenance Log | Table of all maintenance requests                       |
| Documents       | Grid of attached documents with download links          |
| Audit Trail     | Timeline of all changes made to this asset              |

**Overview Tab Layout**:
- Left column (60%): Details in labeled rows (Label: Value format).
- Right column (40%): Image gallery with thumbnail carousel.
- Below: Timeline showing key lifecycle events.

---

### 4.8 Allocation List Page (`/allocations`)

**Page Header**: "Allocations" | [+ New Allocation]

**Filter Bar**: Search, Status (ACTIVE/RETURNED/OVERDUE), Department, Date Range.

**Table Columns**:

| Column         | Sortable | Content                                           |
| -------------- | -------- | ------------------------------------------------- |
| Allocation ID  | Yes      | Auto-generated (e.g., ALC-2026-0001)             |
| Asset          | Yes      | Asset name + code (clickable → asset detail)      |
| Allocated To   | Yes      | User name + department                            |
| Allocated By   | Yes      | Admin/manager who allocated                       |
| Type           | Yes      | PERMANENT / TEMPORARY / PROJECT_BASED (badge)     |
| Start Date     | Yes      | DD MMM YYYY                                       |
| End Date       | Yes      | DD MMM YYYY or "—" (permanent)                    |
| Status         | Yes      | StatusBadge (ACTIVE=green, RETURNED=gray, OVERDUE=red) |
| Actions        | No       | [View] [Return] [Extend]                          |

---

### 4.9 Allocation Form Page (`/allocations/new`)

**Form Fields**:

| Field              | Type      | Validation                                              | Required |
| ------------------ | --------- | ------------------------------------------------------- | -------- |
| Asset              | searchable-select | Must be AVAILABLE status; search by name/code    | Yes      |
| Allocate To (User) | searchable-select | Must be ACTIVE user; search by name/email        | Yes      |
| Allocation Type    | radio     | PERMANENT, TEMPORARY, PROJECT_BASED                     | Yes      |
| Start Date         | date      | Today or future date                                    | Yes      |
| End Date           | date      | After start date (required if TEMPORARY/PROJECT_BASED)  | Conditional |
| Purpose            | textarea  | Max 500 chars                                           | Yes      |
| Notes              | textarea  | Max 1000 chars                                          | No       |
| Condition at Allocation | select | NEW, GOOD, FAIR, POOR                              | Yes      |

**Business Logic**:
- When an asset is selected, display asset details (image, category, location, current status).
- When a user is selected, display user details (department, designation, existing allocations count).
- If asset status is not AVAILABLE, show error "This asset is not available for allocation".
- On save: Asset status changes to ALLOCATED automatically.

---

### 4.10 Booking List Page (`/bookings`)

**Page Header**: "Bookings" | [+ New Booking] [Calendar View]

**Two Views**: Table View and Calendar View (toggle).

**Calendar View**:
- Monthly calendar grid showing bookings as colored bars.
- Color-coded by status: Pending (yellow), Confirmed (green), Cancelled (red).
- Click on a booking bar to view detail modal.
- Click on empty slot to create new booking.

**Table Columns**:

| Column       | Sortable | Content                                              |
| ------------ | -------- | ---------------------------------------------------- |
| Booking ID   | Yes      | Auto-generated                                       |
| Asset        | Yes      | Asset name                                           |
| Booked By    | Yes      | User name                                            |
| Start Time   | Yes      | DD MMM YYYY HH:mm                                   |
| End Time     | Yes      | DD MMM YYYY HH:mm                                   |
| Purpose      | No       | Truncated to 50 chars                                |
| Status       | Yes      | PENDING / CONFIRMED / CANCELLED / COMPLETED (badge)  |
| Actions      | No       | [View] [Confirm] [Cancel]                            |

---

### 4.11 Booking Form Page (`/bookings/new`)

**Form Fields**:

| Field          | Type               | Validation                                     | Required |
| -------------- | ------------------ | ---------------------------------------------- | -------- |
| Asset          | searchable-select  | Must be bookable asset (is_bookable = true)    | Yes      |
| Start Date/Time| datetime-local     | Must be future; must be within business hours  | Yes      |
| End Date/Time  | datetime-local     | After start; max duration: configurable        | Yes      |
| Purpose        | textarea           | 10–500 chars                                   | Yes      |
| Attendees      | number             | Positive integer (for rooms)                   | No       |
| Notes          | textarea           | Max 1000 chars                                 | No       |

**Availability Check**:
- After selecting asset and date range, show time slot availability.
- Display existing bookings in a timeline view with available slots highlighted in green.
- If conflict exists, show error "This time slot is already booked".

---

### 4.12 Maintenance List Page (`/maintenance`)

**Page Header**: "Maintenance" | [+ New Request] [Schedule]

**Filter Bar**: Search, Type (PREVENTIVE/CORRECTIVE/EMERGENCY), Priority, Status, Date Range.

**Table Columns**:

| Column        | Sortable | Content                                            |
| ------------- | -------- | -------------------------------------------------- |
| Request ID    | Yes      | Auto-generated (MNT-2026-0001)                    |
| Asset         | Yes      | Asset name + code                                  |
| Type          | Yes      | PREVENTIVE (blue) / CORRECTIVE (orange) / EMERGENCY (red) badge |
| Priority      | Yes      | LOW / MEDIUM / HIGH / CRITICAL badge               |
| Description   | No       | Truncated to 80 chars                              |
| Requested By  | Yes      | User name                                          |
| Assigned To   | Yes      | Technician name or "Unassigned"                    |
| Status        | Yes      | REQUESTED / APPROVED / IN_PROGRESS / COMPLETED / CANCELLED |
| Due Date      | Yes      | DD MMM YYYY (red if overdue)                       |
| Actions       | No       | [View] [Update Status] [Assign]                    |

---

### 4.13 Maintenance Form Page (`/maintenance/new`)

**Form Fields**:

| Field             | Type              | Validation                               | Required |
| ----------------- | ----------------- | ---------------------------------------- | -------- |
| Asset             | searchable-select | Must exist, not DISPOSED                 | Yes      |
| Maintenance Type  | radio             | PREVENTIVE, CORRECTIVE, EMERGENCY        | Yes      |
| Priority          | select            | LOW, MEDIUM, HIGH, CRITICAL              | Yes      |
| Description       | textarea          | 20–2000 chars                            | Yes      |
| Expected Due Date | date              | Today or future date                     | Yes      |
| Estimated Cost    | number            | Positive decimal                         | No       |
| Vendor            | searchable-select | From vendor list                         | No       |
| Attachments       | file upload       | Images, PDFs (max 5 files)               | No       |

---

### 4.14 Audit List Page (`/audit`)

**Page Header**: "Audit Sessions" | [+ New Audit Session]

**Table Columns**:

| Column       | Sortable | Content                                              |
| ------------ | -------- | ---------------------------------------------------- |
| Audit ID     | Yes      | Auto-generated (AUD-2026-0001)                      |
| Title        | Yes      | Audit session title                                  |
| Scope        | Yes      | Department / Location / All                          |
| Auditor      | Yes      | Assigned auditor name                                |
| Status       | Yes      | PLANNED / IN_PROGRESS / COMPLETED / CANCELLED        |
| Start Date   | Yes      | Planned start date                                   |
| End Date     | Yes      | Planned end date                                     |
| Items Count  | Yes      | Total assets to audit                                |
| Discrepancies| Yes      | Count of found discrepancies                         |
| Actions      | No       | [View] [Execute] [Complete] [Export Report]           |

---

### 4.15 Audit Execution Page (`/audit/:id/execute`)

**Layout**: Split-screen.

**Left Panel (Asset List)**:
- Scrollable list of all assets in audit scope.
- Each asset shows: [Checkbox ✓/✗] [Asset Code] [Asset Name] [Expected Location].
- Color-coded: Verified (green bg), Discrepancy (red bg), Pending (white bg).
- Search filter at top.

**Right Panel (Asset Detail + Action)**:
- Shows selected asset details.
- Form:
  - Actual Location (select)
  - Actual Condition (select)
  - Status: Found / Not Found / Damaged / Location Mismatch (radio)
  - Notes (textarea)
  - Photo Evidence (file upload)
- [Mark as Verified (green)] [Report Discrepancy (red)] [Skip (gray)] buttons.

**Progress Bar**: Top of page showing "45 of 100 assets verified (45%)" with animated progress bar.

---

### 4.16 Reports Page (`/reports`)

**Layout**: Dashboard-style with report type cards.

**Report Type Cards**:

| Card Title            | Description                                      | Icon |
| --------------------- | ------------------------------------------------ | ---- |
| Asset Summary         | Complete inventory of all assets                 | 📦   |
| Allocation Report     | Current and historical allocations               | 🔄   |
| Maintenance Report    | Maintenance history, costs, and trends           | 🔧   |
| Audit Report          | Audit results and discrepancies                  | 📋   |
| Financial Report      | Asset values, depreciation, costs                | 💰   |
| Custom Report         | Build your own report with custom fields         | ⚙️   |

**Report Generator Page** (`/reports/generate`):
- Select Report Type → Configure Filters → Preview → Export.
- Filters: Date range, Department, Location, Category, Status.
- Preview: Table showing report data.
- Export buttons: [Download PDF] [Download Excel] [Download CSV]

---

### 4.17 Notifications Page (`/notifications`)

**Layout**: List view with tabs.

**Tabs**: [All] [Unread] [Allocations] [Maintenance] [Bookings] [System]

**Notification Item**:
```
┌──────────────────────────────────────────────────────────────────┐
│ 🔵 [Icon]  Notification Title                     2 hours ago   │
│           Notification description text goes here...             │
│           [Mark as Read] [View Details]                          │
└──────────────────────────────────────────────────────────────────┘
```

- Unread items have blue dot indicator and light blue background.
- [Mark All as Read] button at top.
- Pagination for older notifications.

---

## 5. Responsive Breakpoints

| Breakpoint     | Range           | Layout Changes                                    |
| -------------- | --------------- | ------------------------------------------------- |
| Desktop Large  | ≥1440px         | Full layout, all columns visible                  |
| Desktop        | 1024px–1439px   | Full layout, some columns hidden                  |
| Tablet         | 768px–1023px    | Sidebar collapses to icons (70px width)           |
| Mobile         | <768px          | Sidebar hidden (hamburger menu), single column    |

### 5.1 Responsive Rules

1. **Sidebar**: On tablet, collapse to icon-only (70px). On mobile, hide sidebar and show hamburger icon in navbar.
2. **Tables**: On tablet, hide less-important columns. On mobile, switch to card/list view.
3. **Forms**: Two-column forms become single-column on tablet/mobile.
4. **Charts**: Side-by-side charts stack vertically on tablet/mobile.
5. **Cards Grid**: 4-column → 2-column (tablet) → 1-column (mobile).
6. **Modals**: On mobile, modals take full screen (max-width: 100vw, max-height: 100vh).
7. **Filter Bar**: On mobile, filters collapse into a "Filters" drawer button.

---

## 6. Animation & Transition Specifications

| Element            | Property     | Duration | Easing                   |
| ------------------ | ------------ | -------- | ------------------------ |
| Sidebar collapse   | width        | 300ms    | `ease-in-out`            |
| Modal open/close   | opacity, transform | 200ms | `ease-out`             |
| Toast notification | transform    | 300ms    | `cubic-bezier(0.4,0,0.2,1)` |
| Page transition    | opacity      | 150ms    | `ease`                   |
| Hover effects      | all          | 150ms    | `ease`                   |
| Dropdown open      | max-height, opacity | 200ms | `ease-out`           |
| Loading spinner    | rotation     | 1000ms   | `linear` (infinite)      |
| Progress bar       | width        | 500ms    | `ease-in-out`            |

---

## 7. Empty States

Every list/table page must show an empty state when no data exists:

**Empty State Component**:
```
┌─────────────────────────────────────────┐
│                                         │
│            [Illustration SVG]           │
│                                         │
│         "No assets found"               │
│                                         │
│   "Create your first asset to get       │
│    started with asset management"       │
│                                         │
│         [+ Add New Asset]               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 8. Loading States

1. **Page Load**: Full-page centered spinner with "Loading..." text.
2. **Table Load**: Skeleton rows (gray animated bars) matching table structure.
3. **Form Submit**: Button shows spinner icon and "Saving..." text, disabled.
4. **Chart Load**: Skeleton placeholder matching chart dimensions.
5. **Image Load**: Gray placeholder with camera icon until loaded.

---

## 9. Implementation Notes

1. **All CSS is vanilla CSS** — no CSS frameworks. Use CSS custom properties (variables) for the design system.
2. **Google Fonts**: Import `Inter` font family via `<link>` tag in `index.html`.
3. **Icons**: Use `react-icons` library (Heroicons or Material Icons set).
4. **CSS Reset**: Use `normalize.css` or custom reset in `index.css`.
5. **Form State**: Each form page manages its own state via `useState` hooks. Use a custom `useForm` hook for validation logic.
6. **Debounced Search**: Global search and table search inputs debounce API calls by 300ms.
7. **Table Sorting**: Click column header to toggle ascending/descending. Show sort arrow icon.
8. **Confirmation Dialogs**: All destructive actions (delete, cancel) show a confirmation modal.
