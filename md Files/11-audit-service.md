# Prompt 11 — Asset Audit Service

## Context
You are building **AssetFlow**. Maintenance is complete (Prompt 10). Now build the Audit module — structured verification cycles where auditors mark assets as Verified/Missing/Damaged, and the system auto-generates discrepancy reports.

---

## What to Build

### Validation Schemas — `src/validators/audit.validator.ts`

```typescript
export const createAuditCycleSchema = z.object({
  title: z.string().min(3),
  departmentId: z.string().uuid().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: 'End date must be after start date',
});

export const assignAuditorsSchema = z.object({
  auditorIds: z.array(z.string().uuid()).min(1, 'At least one auditor is required'),
});

export const verifyAuditItemSchema = z.object({
  verification: z.enum(['VERIFIED', 'MISSING', 'DAMAGED']),
  remarks: z.string().optional(),
});
```

---

### Repository — `src/repositories/audit.repository.ts`

```typescript
class AuditRepository {
  // Audit Cycles
  findAllCycles(params: PaginationParams & { status?, departmentId? })
  findCycleById(id: string)    // with items, auditors, department
  createCycle(data)
  updateCycle(id: string, data)
  
  // Audit Items
  findItemsByCycle(cycleId: string)
  findItemById(id: string)
  createItems(items: CreateAuditItemData[])  // bulk create
  updateItem(id: string, data)
  
  // Stats
  getDiscrepancyReport(cycleId: string): {
    totalAssets: number;
    verified: number;
    missing: number;
    damaged: number;
    pending: number;
    discrepancies: AuditItem[];   // items with MISSING or DAMAGED status
  }
  
  getAuditStats(): {
    activeCycles: number;
    completedCycles: number;
    totalDiscrepancies: number;
  }
}
```

---

### Service — `src/services/audit.service.ts`

#### `createAuditCycle(data, userId)`
1. Validate department exists (if provided)
2. Create audit cycle with status = `PLANNED`
3. Log activity: "Created audit cycle: {title}"
4. Return cycle

#### `startAuditCycle(cycleId, userId)`
1. Find cycle → validate status is `PLANNED`
2. Determine scope: get all assets in the target department/location
3. If no scope filters, throw error (can't audit everything at once)
4. Update cycle status to `IN_PROGRESS`
5. Create notification for assigned auditors
6. Log activity

#### `assignAuditors(cycleId, auditorIds, userId)`
1. Find cycle → validate status is `PLANNED` or `IN_PROGRESS`
2. Get assets in scope (by department/location)
3. For each asset, create an `AuditItem` record assigned to an auditor
   - Distribute assets evenly across auditors if multiple auditors
   - Set verification = `PENDING`
4. Create notification for each auditor: "You've been assigned to audit cycle: {title}"
5. Log activity

#### `verifyItem(itemId, verification, remarks, auditorId)`
1. Find item → validate it exists
2. Validate caller is the assigned auditor
3. Validate cycle is `IN_PROGRESS`
4. Update item: `verification`, `remarks`, `verifiedAt = now()`
5. Log activity: "Auditor verified asset {assetTag} as {verification}"
6. If `MISSING` or `DAMAGED`, create notification for Asset Manager

#### `getDiscrepancyReport(cycleId)`
1. Find cycle → validate exists
2. Query all items for the cycle
3. Calculate stats: total, verified, missing, damaged, pending
4. Return list of discrepancies (MISSING + DAMAGED items) with asset details

#### `closeAuditCycle(cycleId, userId)`
1. Find cycle → validate status is `IN_PROGRESS`
2. Check: all items must be verified (no PENDING items) → if any pending, throw error with count
3. Process discrepancies:
   - Assets marked `MISSING` → **update asset status to `LOST`**
   - Assets marked `DAMAGED` → update asset condition to `DAMAGED`
4. Update cycle status to `CLOSED`, set `closedAt = now()`
5. **Lock the cycle** — no further modifications allowed
6. Create notifications for Asset Managers with summary
7. Log activity: "Closed audit cycle: {title} — {discrepancyCount} discrepancies found"
8. Return final report

#### `getAllCycles(params)`
Paginated list with status/department filters.

#### `getCycleById(id)`
Full detail with items and progress stats.

#### `getMyAuditItems(userId)`
Items assigned to the current user across all active cycles.

---

### Controller — `src/controllers/audit.controller.ts`

```typescript
class AuditController {
  createCycle(req, res, next)
  startCycle(req, res, next)
  assignAuditors(req, res, next)
  verifyItem(req, res, next)
  getDiscrepancyReport(req, res, next)
  closeCycle(req, res, next)
  getAllCycles(req, res, next)
  getCycleById(req, res, next)
  getMyItems(req, res, next)
}
```

---

### Routes — `src/routes/audit.routes.ts`

```
GET    /api/audits                       → authenticate, authorize(ADMIN, ASSET_MANAGER) → getAllCycles
GET    /api/audits/my-items              → authenticate → getMyItems
GET    /api/audits/:id                   → authenticate → getCycleById
GET    /api/audits/:id/discrepancies     → authenticate, authorize(ADMIN, ASSET_MANAGER) → getDiscrepancyReport
POST   /api/audits                       → authenticate, authorize(ADMIN), validate → createCycle
PATCH  /api/audits/:id/start             → authenticate, authorize(ADMIN) → startCycle
POST   /api/audits/:id/assign-auditors   → authenticate, authorize(ADMIN), validate → assignAuditors
PATCH  /api/audits/items/:itemId/verify  → authenticate, validate → verifyItem
PATCH  /api/audits/:id/close             → authenticate, authorize(ADMIN) → closeCycle
```

---

### API Contracts

**POST `/api/audits`**
```json
{
  "title": "Q3 2025 IT Equipment Audit",
  "departmentId": "uuid-of-IT-dept",
  "location": null,
  "startDate": "2025-07-07T00:00:00.000Z",
  "endDate": "2025-07-21T00:00:00.000Z"
}
```

**POST `/api/audits/:id/assign-auditors`**
```json
{
  "auditorIds": ["uuid-of-rohit", "uuid-of-priya"]
}
```

**PATCH `/api/audits/items/:itemId/verify`**
```json
{
  "verification": "MISSING",
  "remarks": "Asset not found at listed location. Desk is empty."
}
```

**GET `/api/audits/:id/discrepancies`**
```json
{
  "success": true,
  "data": {
    "cycle": { "id": "uuid", "title": "Q3 2025 IT Equipment Audit", "status": "IN_PROGRESS" },
    "summary": {
      "totalAssets": 5,
      "verified": 2,
      "missing": 1,
      "damaged": 1,
      "pending": 1,
      "completionPercentage": 80
    },
    "discrepancies": [
      {
        "id": "uuid",
        "asset": { "assetTag": "AF-000003", "name": "HP EliteDesk 800", "location": "Storage Room A" },
        "auditor": { "name": "Rohit Sharma" },
        "verification": "MISSING",
        "remarks": "Asset not found at listed location",
        "verifiedAt": "2025-07-12T10:00:00.000Z"
      },
      {
        "id": "uuid",
        "asset": { "assetTag": "AF-000004", "name": "ThinkPad X1 Carbon" },
        "auditor": { "name": "Rohit Sharma" },
        "verification": "DAMAGED",
        "remarks": "Screen cracked",
        "verifiedAt": "2025-07-12T10:15:00.000Z"
      }
    ]
  }
}
```

**PATCH `/api/audits/:id/close`**
Response includes:
```json
{
  "success": true,
  "message": "Audit cycle closed. 2 discrepancies processed.",
  "data": {
    "cycle": { "status": "CLOSED", "closedAt": "..." },
    "processedUpdates": [
      { "assetTag": "AF-000003", "statusUpdated": "LOST" },
      { "assetTag": "AF-000004", "conditionUpdated": "DAMAGED" }
    ]
  }
}
```

---

### Register Routes in App

Update `src/app.ts`:
```typescript
import { auditRouter } from './routes/audit.routes';
app.use('/api/audits', auditRouter);
```

---

## Business Rules

1. **Scoped audits**: Each cycle targets a department and/or location — not the entire organization at once.
2. **Auditor assignment**: Admin assigns one or more auditors. Assets are distributed among them.
3. **Unique asset per cycle**: `@@unique([auditCycleId, assetId])` prevents double-auditing.
4. **Close requires completion**: Cannot close a cycle with PENDING items.
5. **Closing auto-updates assets**: Missing → `LOST` status, Damaged → `DAMAGED` condition.
6. **Locked after close**: No modifications to a CLOSED audit cycle.
7. **Discrepancy reports**: Auto-generated from MISSING + DAMAGED items.

---

## Verification

```bash
# Create audit cycle
curl -X POST http://localhost:5000/api/audits \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Audit","departmentId":"<uuid>","startDate":"2025-07-12T00:00:00Z","endDate":"2025-07-19T00:00:00Z"}'

# Assign auditors (auto-creates audit items for department assets)
curl -X POST http://localhost:5000/api/audits/<cycle-id>/assign-auditors \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"auditorIds":["<auditor-uuid>"]}'

# Start the cycle
curl -X PATCH http://localhost:5000/api/audits/<cycle-id>/start \
  -H "Authorization: Bearer <admin-token>"

# Verify an item
curl -X PATCH http://localhost:5000/api/audits/items/<item-id>/verify \
  -H "Authorization: Bearer <auditor-token>" \
  -H "Content-Type: application/json" \
  -d '{"verification":"VERIFIED","remarks":"Asset found and in good condition"}'

# Get discrepancy report
curl http://localhost:5000/api/audits/<cycle-id>/discrepancies \
  -H "Authorization: Bearer <admin-token>"
```

---

## What's Next
Prompt 12 will build the Dashboard & Reports Service (KPIs, analytics, export).
