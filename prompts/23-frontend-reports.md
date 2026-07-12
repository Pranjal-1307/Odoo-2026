# Prompt 23 — Frontend Reports & Analytics

## Context
You are building **AssetFlow**. Audit is complete (Prompt 22). Now build the Reports & Analytics page — data-driven charts and tables that give managers actionable insight.

---

## What to Build

### Page: `src/pages/ReportsPage.tsx`

**Admin/Asset Manager only**

**Layout with 5 report sections as tabs or cards:**

```
┌─────────────────────────────────────────────────────────┐
│  Reports & Analytics                    [Export PDF]     │
│  [Utilization] [Maintenance] [Departments] [Bookings]   │
│  [Lifecycle]                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Date Range: [Last 30 Days ▼]  [Jul 1] to [Jul 12]    │
│  Category: [All ▼]   Department: [All ▼]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Report 1: Asset Utilization

**Charts:**
- **Donut chart**: Utilized vs Idle assets (percentage)
- **Bar chart**: Top 10 most-used assets (by allocation count)
- **Bar chart**: Bottom 10 least-used assets

**KPI cards:**
- Total Assets
- Utilized Assets
- Idle Assets
- Utilization Rate (%)

```
┌──────────────────────────────────────────┐
│  Asset Utilization Report                │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Total    │ │ Utilized │ │ Idle     ││
│  │   15     │ │    11    │ │    4     ││
│  │          │ │  73.3%   │ │  26.7%   ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                          │
│  ┌───────────────────┐ ┌───────────────┐│
│  │ Most Used Assets  │ │ Idle Assets   ││
│  │ [Bar Chart]       │ │ [List]        ││
│  │ AF-0001 ████ 5    │ │ AF-0005      ││
│  │ AF-0002 ███  4    │ │ AF-0007      ││
│  │ AF-0009 ███  4    │ │ AF-0014      ││
│  └───────────────────┘ └───────────────┘│
└──────────────────────────────────────────┘
```

---

### Report 2: Maintenance Frequency

**Charts:**
- **Line chart**: Monthly maintenance trend (requests over time)
- **Pie chart**: Requests by priority distribution
- **Bar chart**: Most frequently maintained assets (top 10)
- **Horizontal bar**: Maintenance by category

**KPI cards:**
- Total Requests
- Resolved
- Avg Resolution (days)
- Pending

```
┌──────────────────────────────────────────┐
│  Maintenance Report                      │
│                                          │
│  Monthly Trend                           │
│  ┌────────────────────────────────────┐  │
│  │  10 │         ╱\                   │  │
│  │   8 │    ╱\  ╱  \                  │  │
│  │   6 │   ╱  ╲╱    \                 │  │
│  │   4 │  ╱           \╱\             │  │
│  │   2 │ ╱                \           │  │
│  │   0 │──────────────────────        │  │
│  │     Jan Feb Mar Apr May Jun Jul    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─────────────────┐ ┌────────────────┐  │
│  │ By Priority     │ │ Frequent Assets│  │
│  │ [Pie Chart]     │ │ [Bar Chart]    │  │
│  └─────────────────┘ └────────────────┘  │
└──────────────────────────────────────────┘
```

---

### Report 3: Department Allocation Summary

**Chart:**
- **Stacked bar chart**: Each department showing Allocated vs Available assets
- **Table**: Department breakdown with all metrics

```
┌──────────────────────────────────────────────────────┐
│  Department Allocation Summary                       │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │ IT Dept    █████████░░░ 7 total (3 alloc)     │   │
│  │ HR Dept    ██░░░░░░░░░ 2 total (0 alloc)      │   │
│  │ Operations ██░░░░░░░░░ 2 total (1 alloc)      │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Dept     │ Total │ Alloc │ Avail │ Overdue │ $ │  │
│  │──────────│───────│───────│───────│─────────│───│  │
│  │ IT Dept  │   7   │   3   │   3   │   1     │425│  │
│  │ HR Dept  │   2   │   0   │   2   │   0     │ 85│  │
│  │ Ops      │   2   │   1   │   1   │   0     │ 60│  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### Report 4: Booking Heatmap

**Chart:**
- **Heatmap grid**: Days of week (Y-axis) × Hours (X-axis), colored by booking density
- Uses Recharts or a custom CSS grid with colored cells

```
┌──────────────────────────────────────────┐
│  Resource Booking Heatmap                │
│  Resource: [All Resources ▼]             │
│                                          │
│        7  8  9  10 11 12 13 14 15 16 17  │
│  Mon   ░  ░  █  ██ █  ░  ░  █  ░  ░  ░  │
│  Tue   ░  ░  █  █  ░  ░  ░  ░  ░  ░  ░  │
│  Wed   ░  ░  ░  █  █  ░  ░  █  █  ░  ░  │
│  Thu   ░  ░  █  ██ █  ░  ░  ░  ░  ░  ░  │
│  Fri   ░  ░  ░  █  ░  ░  ░  ░  ░  ░  ░  │
│                                          │
│  Legend: ░ No bookings  █ 1-2  ██ 3+     │
│                                          │
│  Peak: Monday 10:00 AM (8 bookings)      │
└──────────────────────────────────────────┘
```

**Implementation:**
```tsx
function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0;
  const bg = intensity === 0 
    ? 'bg-surface-100' 
    : intensity < 0.3 
      ? 'bg-brand-100' 
      : intensity < 0.7 
        ? 'bg-brand-300' 
        : 'bg-brand-600';
  return (
    <div className={cn("w-10 h-10 rounded flex items-center justify-center text-xs", bg)}>
      {value > 0 && value}
    </div>
  );
}
```

---

### Report 5: Asset Lifecycle

**Charts:**
- **Donut chart**: Assets by current status
- **Bar chart**: Assets by condition
- **Lists**: Assets nearing retirement, assets due for maintenance

```
┌──────────────────────────────────────────┐
│  Asset Lifecycle Report                  │
│                                          │
│  ┌─────────────────┐ ┌────────────────┐  │
│  │ By Status       │ │ By Condition   │  │
│  │ [Donut Chart]   │ │ [Bar Chart]    │  │
│  │                 │ │ New    ████  6  │  │
│  │ Available: 8    │ │ Good   ███   4  │  │
│  │ Allocated: 4    │ │ Fair   ██    3  │  │
│  │ Under M.: 1     │ │ Poor   █     1  │  │
│  │ Other: 2        │ │ Damag  █     1  │  │
│  └─────────────────┘ └────────────────┘  │
│                                          │
│  ⚠️ Assets Needing Attention            │
│  • AF-000004: Under maintenance 5 days   │
│  • AF-000012: Last maintained 8 mo ago   │
│  • AF-000008: Condition is POOR          │
└──────────────────────────────────────────┘
```

---

### Date Range Filter Component

**`src/components/shared/DateRangeFilter.tsx`**

Preset options + custom range:
- Last 7 Days
- Last 30 Days
- Last 90 Days
- This Year
- Custom (date picker for start/end)

---

### Export Functionality

Each report tab has an "Export" button:
- Export as PDF (using jsPDF)
- Include charts as images (use Recharts' toDataURL or html2canvas)
- Include tables and KPI summaries
- Header with "AssetFlow — {Report Name}" and date

Basic implementation:
```typescript
import jsPDF from 'jspdf';

function exportToPDF(title: string, element: HTMLElement) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`AssetFlow — ${title}`, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  // Add table data, chart screenshots, etc.
  doc.save(`assetflow-${title.toLowerCase().replace(/ /g, '-')}.pdf`);
}
```

---

### Recharts Usage

```typescript
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ResponsiveContainer,
} from 'recharts';

// Example donut chart
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={60} outerRadius={100}>
      {statusData.map((entry, index) => (
        <Cell key={index} fill={STATUS_COLORS[entry.status]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

## Verification

1. Navigate to `/reports` → See 5 report tabs
2. Asset Utilization: donut chart + top/bottom bar charts
3. Maintenance: monthly trend line + priority pie chart
4. Departments: stacked bar + summary table
5. Booking Heatmap: colored grid showing peak hours
6. Lifecycle: status donut + condition bar
7. Change date range → Charts update
8. Filter by category/department → Data scopes correctly
9. Export PDF → Downloads with report content

---

## What's Next
Prompt 24 will build the Notifications & Activity Log frontend pages.
