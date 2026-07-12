# Prompt 10 — Maintenance Management Service

## Context
You are building **AssetFlow**. Booking is complete (Prompt 09). Now build the Maintenance module — a structured approval workflow for repair requests that auto-updates asset status.

---

## What to Build

### Validation Schema — `src/validators/maintenance.validator.ts`

```typescript
export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  issue: z.string().min(10, 'Describe the issue in at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const approveMaintenanceSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid(),
});

export const resolveMaintenanceSchema = z.object({
  resolutionNotes: z.string().min(5, 'Resolution notes are required'),
});
```

---

### Repository — `src/repositories/maintenance.repository.ts`

```typescript
class MaintenanceRepository {
  findAll(params: PaginationParams & { status?, priority?, assetId? })
  findById(id: string)        // includes asset, raisedBy, approvedBy, technician
  findByAsset(assetId: string)
  findPending()               // all PENDING requests
  create(data)
  update(id: string, data)
  
  getMaintenanceStats(): {
    pending: number;
    inProgress: number;
    resolvedThisMonth: number;
    byPriority: { priority: string; count: number }[];
  }
}
```

---

### Service — `src/services/maintenance.service.ts`

#### Workflow: `PENDING → APPROVED/REJECTED → ASSIGNED → IN_PROGRESS → RESOLVED`

#### `raiseRequest(data, userId)`
1. Validate asset exists
2. Check if asset already has a PENDING/APPROVED/IN_PROGRESS maintenance request → warn if so
3. Create maintenance request with status = `PENDING`, priority defaults to `MEDIUM`
4. Handle optional photo upload (photoUrl)
5. Create notification for all Asset Managers: "New maintenance request for {assetTag}: {issue}"
6. Log activity: "Raised maintenance request for {assetTag}"
7. Return request

#### `approveOrReject(requestId, status, approvedById)`
1. Find request → throw if not found
2. Validate request is `PENDING`
3. If `APPROVED`:
   - Update request status to `APPROVED`
   - **Update asset status to `UNDER_MAINTENANCE`** ← critical business rule
   - Create notification for requester: "Your maintenance request for {assetTag} has been approved"
4. If `REJECTED`:
   - Update request status to `REJECTED`
   - Create notification for requester: "Your maintenance request for {assetTag} was rejected"
5. Set `approvedById`
6. Log activity

#### `assignTechnician(requestId, technicianId, userId)`
1. Find request → validate status is `APPROVED`
2. Update `technicianId` and status to `ASSIGNED`
3. Create notification for technician: "You have been assigned maintenance for {assetTag}"
4. Log activity

#### `startWork(requestId, userId)`
1. Find request → validate status is `ASSIGNED`
2. Validate caller is the assigned technician
3. Update status to `IN_PROGRESS`
4. Log activity

#### `resolveRequest(requestId, resolutionNotes, userId)`
1. Find request → validate status is `IN_PROGRESS` or `ASSIGNED`
2. Update status to `RESOLVED`, set `resolvedAt = now()`, save resolution notes
3. **Update asset status back to `AVAILABLE`** ← critical business rule
4. Create notification for requester: "Maintenance for {assetTag} has been resolved"
5. Create notification for asset manager
6. Log activity

#### `getAllRequests(params)`
Paginated list with filters for status, priority, asset.

#### `getRequestById(id)`
Full detail including asset info, all users involved.

#### `getMyRequests(userId)`
Requests raised by the user.

#### `getMaintenanceStats()`
Stats for dashboard.

---

### Controller — `src/controllers/maintenance.controller.ts`

```typescript
class MaintenanceController {
  raise(req, res, next)             // POST — with optional photo upload
  approveOrReject(req, res, next)   // PATCH /:id/resolve-approval
  assignTechnician(req, res, next)  // PATCH /:id/assign
  startWork(req, res, next)         // PATCH /:id/start
  resolve(req, res, next)           // PATCH /:id/resolve
  getAll(req, res, next)            // GET
  getById(req, res, next)           // GET /:id
  getMyRequests(req, res, next)     // GET /my
  getStats(req, res, next)          // GET /stats
}
```

---

### Routes — `src/routes/maintenance.routes.ts`

```
GET    /api/maintenance                → authenticate → getAll
GET    /api/maintenance/my             → authenticate → getMyRequests
GET    /api/maintenance/stats          → authenticate, authorize(ADMIN, ASSET_MANAGER) → getStats
GET    /api/maintenance/:id            → authenticate → getById
POST   /api/maintenance                → authenticate, uploadPhoto, validate(createMaintenanceSchema) → raise
PATCH  /api/maintenance/:id/approve    → authenticate, authorize(ADMIN, ASSET_MANAGER), validate(approveMaintenanceSchema) → approveOrReject
PATCH  /api/maintenance/:id/assign     → authenticate, authorize(ADMIN, ASSET_MANAGER), validate(assignTechnicianSchema) → assignTechnician
PATCH  /api/maintenance/:id/start      → authenticate → startWork
PATCH  /api/maintenance/:id/resolve    → authenticate, validate(resolveMaintenanceSchema) → resolve
```

---

### API Contracts

**POST `/api/maintenance`** (multipart/form-data for photo)
```json
{
  "assetId": "uuid",
  "issue": "Screen flickering intermittently when running heavy applications",
  "priority": "HIGH"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request raised",
  "data": {
    "id": "uuid",
    "asset": { "assetTag": "AF-000004", "name": "ThinkPad X1 Carbon" },
    "raisedBy": { "name": "Sneha Reddy" },
    "issue": "Screen flickering intermittently...",
    "priority": "HIGH",
    "status": "PENDING",
    "createdAt": "..."
  }
}
```

**PATCH `/api/maintenance/:id/approve`**
```json
{ "status": "APPROVED" }
```
Response shows asset status changed to `UNDER_MAINTENANCE`.

**PATCH `/api/maintenance/:id/resolve`**
```json
{ "resolutionNotes": "Replaced display cable. Screen working normally now." }
```
Response shows asset status changed back to `AVAILABLE`.

---

### Register Routes in App

Update `src/app.ts`:
```typescript
import { maintenanceRouter } from './routes/maintenance.routes';
app.use('/api/maintenance', maintenanceRouter);
```

---

## Business Rules

1. **Approval required**: Maintenance work cannot start until the request is approved by an Asset Manager.
2. **Asset status auto-update**: Approving a request → asset becomes `UNDER_MAINTENANCE`. Resolving → asset returns to `AVAILABLE`.
3. **Workflow order**: PENDING → APPROVED → ASSIGNED → IN_PROGRESS → RESOLVED (or PENDING → REJECTED).
4. **Maintenance history**: All requests are retained per asset as history (never deleted).
5. **Notifications at every step**: Requester, technician, and asset manager are notified at each workflow transition.

---

## Verification

```bash
# Raise a maintenance request
curl -X POST http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<uuid>","issue":"Keyboard not responsive","priority":"MEDIUM"}'

# Approve it
curl -X PATCH http://localhost:5000/api/maintenance/<request-id>/approve \
  -H "Authorization: Bearer <asset-manager-token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'

# Verify asset status changed to UNDER_MAINTENANCE
curl http://localhost:5000/api/assets/<asset-id> \
  -H "Authorization: Bearer <token>"

# Resolve it
curl -X PATCH http://localhost:5000/api/maintenance/<request-id>/resolve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"resolutionNotes":"Keyboard replaced"}'

# Verify asset status back to AVAILABLE
```

---

## What's Next
Prompt 11 will build the Asset Audit Service (audit cycles, verification, discrepancy reports).
